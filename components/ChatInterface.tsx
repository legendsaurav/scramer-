import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Send, Smile, Paperclip, CheckCheck } from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  currentUserId: string;
}

const ChatInterface: React.FC<ChatProps> = ({ messages: initialMessages, currentUserId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      projectId: 'current',
      userId: currentUserId,
      content: input,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => {
          const isMe = msg.userId === currentUserId;
          const showAvatar = index === 0 || messages[index - 1].userId !== msg.userId;

          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} group`}>
              {/* Avatar placeholder */}
              {showAvatar ? (
                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm self-end mb-1">
                   <img src={`https://picsum.photos/seed/${msg.userId}/100/100`} alt="User" className="w-full h-full object-cover" />
                </div>
              ) : <div className="w-8 flex-shrink-0" />}

              <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && showAvatar && (
                   <span className="text-[10px] text-slate-500 ml-1 mb-1 font-semibold">{msg.userId}</span>
                )}
                <div className={`
                  px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed
                  ${isMe 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700'}
                `}>
                  {msg.content}
                </div>
                <div className={`text-[10px] text-slate-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'justify-end' : ''}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && <CheckCheck size={12} className="text-blue-500" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 transition-shadow">
          <button type="button" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Paperclip size={18} />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..." 
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
          <button 
            type="submit" 
            className={`
              p-2.5 rounded-full transition-all shadow-sm
              ${input.trim() 
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}
            `}
            disabled={!input.trim()}
          >
            <Send size={16} className={input.trim() ? 'ml-0.5' : ''} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;