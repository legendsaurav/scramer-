import React, { useState } from 'react';
import { Announcement } from '../types';
import { Megaphone, MessageCircle } from 'lucide-react';

interface Props {
  announcements: Announcement[];
  currentUserId: string;
}

const Announcements: React.FC<Props> = ({ announcements: initialData, currentUserId }) => {
  const [announcements, setAnnouncements] = useState(initialData);

  const toggleReaction = (announcementId: string, emoji: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id !== announcementId) return a;
      
      const existingReaction = a.reactions.find(r => r.emoji === emoji);
      let newReactions = [...a.reactions];
      
      if (existingReaction) {
        if (existingReaction.userReacted) {
          // Remove reaction
          newReactions = newReactions.map(r => 
            r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r
          ).filter(r => r.count > 0);
        } else {
          // Add to existing
          newReactions = newReactions.map(r => 
            r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r
          );
        }
      } else {
        // Create new
        newReactions.push({ emoji, count: 1, userReacted: true });
      }

      return { ...a, reactions: newReactions };
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Compose Box (Admin only mock) */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Megaphone className="text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Make an Announcement</h3>
            <p className="text-slate-400 text-sm mb-4">Post updates about milestones, file uploads, or schedule changes. Everyone in the project will be notified.</p>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Create New Post
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {announcements.map(announcement => (
          <div key={announcement.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <img src={`https://picsum.photos/seed/${announcement.authorId}/100/100`} alt="Author" className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Alex Chen <span className="text-slate-400 font-normal">• Admin</span></p>
                <p className="text-xs text-slate-500">{new Date(announcement.timestamp).toLocaleDateString()} at {new Date(announcement.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>

            <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed mb-6">
              {announcement.content}
            </p>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex gap-2">
                {['👍', '🔥', '✅', '❤️'].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => toggleReaction(announcement.id, emoji)}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              {/* Active Reactions */}
              <div className="flex gap-2">
                {announcement.reactions.map(r => (
                  <button
                    key={r.emoji}
                    onClick={() => toggleReaction(announcement.id, r.emoji)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all
                      ${r.userReacted 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}
                    `}
                  >
                    <span>{r.emoji}</span>
                    <span>{r.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;