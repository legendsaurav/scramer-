import React from 'react';
import { MeetingRecording } from '../types';
import { Calendar, Clock, Link as LinkIcon, MoreVertical, Play } from 'lucide-react';

const MeetingRepository: React.FC<{ meetings: MeetingRecording[] }> = ({ meetings }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {meetings.map((meeting) => (
        <div key={meeting.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
          {/* Thumbnail / Video Placeholder */}
          <div className="relative h-48 bg-slate-200 dark:bg-slate-800">
            <img 
              src={meeting.thumbnailUrl} 
              alt={meeting.title}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <a 
                href="https://meet.google.com/iwb-tirx-vct"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-blue-600 shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
              >
                <Play fill="currentColor" size={20} className="ml-1" />
              </a>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
              {meeting.duration}
            </div>
            <div className="absolute top-2 left-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              MEET
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">{meeting.title}</h3>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(meeting.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>

            {meeting.summary && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800/50">
                <span className="font-semibold block text-xs text-slate-400 mb-1 uppercase tracking-wider">AI Summary</span>
                {meeting.summary}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex -space-x-2">
                {meeting.participants.map(p => (
                  <img key={p.id} src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full border border-white dark:border-slate-900" title={p.name} />
                ))}
              </div>
              <a 
                href="https://meet.google.com/iwb-tirx-vct" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center gap-1"
              >
                Open in Meet <LinkIcon size={14} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetingRepository;