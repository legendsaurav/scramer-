import React, { useEffect, useRef, useState } from 'react';
import { CheckCheck, Edit3, Paperclip, Send, Smile, Undo2 } from 'lucide-react';
import { ChatMessage, DraftMessage } from '../types';

interface ChatProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage?: (content: string) => void | Promise<void>;
  onEditMessage?: (messageId: string, content: string) => boolean | Promise<boolean>;
  onDraftChange?: (value: string) => void | Promise<void>;
  drafts?: DraftMessage[];
  currentDraft?: string;
  canEditMessage?: (message: ChatMessage, userId: string) => boolean;
  editWindowMs?: number;
}

const ChatInterface: React.FC<ChatProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  onEditMessage,
  onDraftChange,
  drafts = [],
  currentDraft = '',
  canEditMessage,
  editWindowMs = 0
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [composerValue, setComposerValue] = useState(currentDraft);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const isEditing = Boolean(editingMessageId);
  const editWindowMinutes = Math.max(1, Math.round(editWindowMs / 60000));

  useEffect(() => {
    if (!isEditing) {
      setComposerValue(currentDraft);
    }
  }, [currentDraft, isEditing]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleChange = (value: string) => {
    setStatus(null);
    setComposerValue(value);
    if (!isEditing) {
      onDraftChange?.(value);
    }
  };

  const resetComposer = () => {
    setComposerValue('');
    onDraftChange?.('');
    setEditingMessageId(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = composerValue.trim();
    if (!trimmed) return;

    if (isEditing && editingMessageId) {
      const ok = onEditMessage ? await onEditMessage(editingMessageId, trimmed) : false;
      if (!ok) {
        setStatus('This message can no longer be edited.');
        return;
      }
      setStatus('Message updated');
      resetComposer();
      return;
    }

    await onSendMessage?.(trimmed);
    resetComposer();
  };

  const beginEditing = (message: ChatMessage) => {
    setStatus(null);
    setEditingMessageId(message.id);
    setComposerValue(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setComposerValue(currentDraft);
    setStatus(null);
  };

  const renderDraftsSection = () => (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-4 py-3">
      <div className="flex items-center justify-between text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 font-bold">
        Draft Messages
        <span className="text-slate-400">{drafts.length}</span>
      </div>
      {drafts.length === 0 ? (
        <p className="text-[11px] text-slate-400 mt-2">No one is drafting right now.</p>
      ) : (
        <div className="mt-3 space-y-2 max-h-28 overflow-y-auto pr-1">
          {drafts.map(draft => (
            <div key={`${draft.projectId}-${draft.userId}`} className={`rounded-xl px-3 py-2 text-xs border flex justify-between gap-2 ${draft.userId === currentUserId ? 'border-blue-300 bg-blue-50/60 dark:border-blue-500/40 dark:bg-blue-500/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'}`}>
              <div>
                <p className="font-semibold text-slate-600 dark:text-slate-200">
                  {draft.userName}
                  {draft.userId === currentUserId && ' (You)'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 line-clamp-1">{draft.content}</p>
              </div>
              <span className="text-[10px] text-slate-400 whitespace-nowrap mt-1">
                {new Date(draft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {renderDraftsSection()}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => {
          const isMe = msg.userId === currentUserId;
          const previous = messages[index - 1];
          const showAvatar = index === 0 || previous?.userId !== msg.userId;
          const name = msg.userName || msg.userId;
          const avatarSeed = msg.avatar || `https://picsum.photos/seed/${msg.userId}/100/100`;
          const editable = canEditMessage ? canEditMessage(msg, currentUserId) : false;

          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} group`}>
              {showAvatar ? (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm self-end mb-1">
                  <img src={avatarSeed} alt={name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 flex-shrink-0" />
              )}

              <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showAvatar && (
                  <div className={`text-[10px] mb-1 font-semibold uppercase tracking-widest ${isMe ? 'text-blue-300' : 'text-slate-500'}`}>
                    {name}
                    {isMe && ' • You'}
                  </div>
                )}

                <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed relative ${isMe ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700'}`}>
                  {msg.content}
                  {msg.editedAt && (
                    <span className={`text-[10px] ml-2 ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                      (edited)
                    </span>
                  )}
                  {editable && (
                    <button
                      onClick={() => beginEditing(msg)}
                      className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} text-[10px] text-blue-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}
                      title="Edit message"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                  )}
                </div>

                <div className={`text-[10px] text-slate-400 mt-1 flex items-center gap-2 ${isMe ? 'justify-end' : ''}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && <CheckCheck size={12} className="text-blue-500" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {status && (
          <div className="text-[11px] text-blue-500 font-semibold tracking-wide uppercase">{status}</div>
        )}
        {isEditing && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 uppercase tracking-widest">
            Editing message • {editWindowMinutes} min window
            <button onClick={cancelEditing} className="flex items-center gap-1 text-blue-500 font-semibold">
              <Undo2 size={12} /> Cancel
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 transition-shadow">
          <button type="button" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Paperclip size={18} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={composerValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={isEditing ? 'Edit your message...' : 'Type a message...'}
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
            <button type="button" className="absolute right-0 inset-y-0 pr-3 text-slate-400 hover:text-slate-500">
              <Smile size={18} />
            </button>
          </div>
          <button
            type="submit"
            className={`p-2.5 rounded-full transition-all shadow-sm flex items-center justify-center gap-1
              ${composerValue.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}
            disabled={!composerValue.trim()}
          >
            {isEditing ? <Edit3 size={15} /> : <Send size={16} className={composerValue.trim() ? 'ml-0.5' : ''} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;