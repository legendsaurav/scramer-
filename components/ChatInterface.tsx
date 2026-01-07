
import { useState, useEffect, useRef, useCallback } from 'react';
import React from 'react';
import { ChatMessage } from '../types';
import { supabase, isSupabaseConfigured, CONFIG_ERROR_MESSAGE } from '../lib/supabase';
import { FallbackCloud } from '../lib/cloudFallback';
import { Send, Smile, Paperclip, CheckCheck, MoreVertical, Search, Phone, Video } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ChatProps {
  projectId: string;
  currentUserId: string;
}

const ChatInterface: React.FC<ChatProps> = ({ projectId, currentUserId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('idle');
  const fetchingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper to map DB row to ChatMessage type
  const mapMessage = (row: any): ChatMessage => ({
    id: row.id,
    projectId: row.project_id || row.projectId,
    userId: row.user_id || row.userId,
    userName: row.user_name || row.userName,
    content: row.content,
    timestamp: row.timestamp,
    type: row.type as 'text' | 'system'
  });

  const fetchMessages = useCallback(async () => {
    if (!isSupabaseConfigured || fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        setCloudError(error.message);
        const local = FallbackCloud.getMessages(projectId).map((r) => ({
          id: r.id,
          projectId: r.project_id,
          userId: r.user_id,
          content: r.content,
          type: (r.type as any) || 'text',
          timestamp: r.timestamp
        }));
        setMessages(local);
        setIsLoading(false);
        return;
      }
      setCloudError(null);
      setMessages((data || []).map(mapMessage));
      setIsLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  }, [projectId, isSupabaseConfigured]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let cleanup: (() => void) | undefined;
    const init = async () => {
      await fetchMessages();
      const channel = supabase
        .channel(`project-chat-${projectId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` },
          (payload) => {
            setMessages((prev) => {
              if (payload.eventType === 'DELETE' && payload.old) {
                return prev.filter((m) => m.id !== (payload.old as any).id);
              }
              if (!payload.new) return prev;
              const next = [...prev];
              const incoming = mapMessage(payload.new);
              const idx = next.findIndex((m) => m.id === incoming.id);
              if (idx === -1) next.push(incoming); else next[idx] = incoming;
              return next.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });
          }
        )
        .subscribe((status) => {
          setRealtimeStatus(status);
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            fetchMessages();
          }
        });

      cleanup = () => supabase.removeChannel(channel);
    };

    init();
    return () => { if (cleanup) cleanup(); };
  }, [projectId, isSupabaseConfigured, fetchMessages]);

  // Polling fallback when realtime is not subscribed (blocked or flaky networks)
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const interval = setInterval(() => {
      if (realtimeStatus !== 'SUBSCRIBED') fetchMessages();
    }, 8000);
    return () => clearInterval(interval);
  }, [realtimeStatus, isSupabaseConfigured, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    if (!isSupabaseConfigured) {
      const record = {
        id: crypto.randomUUID(),
        project_id: projectId,
        user_id: currentUserId,
        user_name: currentUser?.name || null,
        content: input.trim(),
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      FallbackCloud.addMessage(projectId, record);
      setMessages(prev => [...prev, {
        id: record.id,
        projectId,
        userId: currentUserId,
        userName: record.user_name || undefined,
        content: record.content,
        timestamp: record.timestamp,
        type: 'text'
      }]);
      setInput('');
      return;
    }
    setIsSending(true);
    const { error } = await supabase.from('messages').insert({
      project_id: projectId,
      user_id: currentUserId,
      user_name: currentUser?.name || null,
      content: input,
      timestamp: new Date().toISOString(),
      type: 'text'
    });

    if (error) {
      const record = {
        id: crypto.randomUUID(),
        project_id: projectId,
        user_id: currentUserId,
        user_name: currentUser?.name || null,
        content: input.trim(),
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      FallbackCloud.addMessage(projectId, record);
      setMessages(prev => [...prev, {
        id: record.id,
        projectId,
        userId: currentUserId,
        userName: record.user_name || undefined,
        content: record.content,
        timestamp: record.timestamp,
        type: 'text'
      }]);
    }
    setInput('');
    setIsSending(false);
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden border-l border-slate-200 dark:border-slate-800">
      {!isSupabaseConfigured && (
        <div className="p-4 bg-amber-50 text-amber-700 border-b border-amber-200 text-xs">
          {CONFIG_ERROR_MESSAGE}
        </div>
      )}
      <div className="px-4 py-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(projectId)}&backgroundType=gradient&radius=50`} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800" alt="Group" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950"></div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">Workspace Sync</h3>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Realtime Node</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Video size={18} /></button>
          <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Phone size={18} /></button>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Search size={18} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1 relative blueprint-bg custom-scrollbar">
        {cloudError && (
          <div className="absolute top-2 left-2 right-2 z-20 p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs">
            Cloud chat disabled: {cloudError}
          </div>
        )}
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm z-20">
             <div className="flex flex-col items-center gap-3">
               <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Connecting to Cloud...</span>
             </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.userId === currentUserId;
            const prevMsg = messages[index - 1];
            const isFirstInGroup = !prevMsg || prevMsg.userId !== msg.userId;
            const isNewDay = !prevMsg || new Date(prevMsg.timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {isNewDay && (
                  <div className="flex justify-center my-6 sticky top-2 z-10">
                    <span className="px-4 py-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm">
                      {formatDateLabel(msg.timestamp)}
                    </span>
                  </div>
                )}
                <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-4' : 'mt-0.5'}`}>
                  <div className={`
                    max-w-[85%] min-w-[80px] px-3 pt-2 pb-1 rounded-2xl relative shadow-sm transition-all
                    ${isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'}
                  `}>
                    {!isMe && isFirstInGroup && (
                      <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 block mb-1 uppercase tracking-tighter">
                        {msg.userName ? msg.userName : `NODE_${msg.userId?.slice(0, 4)}`}
                      </span>
                    )}
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words pr-2">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1 -mr-1">
                      <span className={`text-[9px] font-bold ${isMe ? 'text-blue-100/70' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                      {isMe && <CheckCheck size={12} className="text-blue-200" />}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      <div className="px-4 py-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400">
             <button type="button" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Smile size={20} /></button>
             <button type="button" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Paperclip size={20} /></button>
          </div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Transmit intelligence..." 
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <button type="submit" disabled={!input.trim() || isSending} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${input.trim() ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed'}`}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
