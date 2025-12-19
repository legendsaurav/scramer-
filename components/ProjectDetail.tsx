import React, { useState } from 'react';
import { Project, MeetingRecording, SoftwareSession, ChatMessage, Announcement, DraftMessage } from '../types';
import { SOFTWARE_TOOLS } from '../constants';
import { 
  Video, Calendar, MapPin, Mail, Phone, ChevronRight, X, Layers, Zap, HelpCircle, Download, CheckCircle
} from 'lucide-react';
import MeetingRepository from './MeetingRepository';
import SessionRecorder from './SessionRecorder';
import ChatInterface from './ChatInterface';
import { useExtensionBridge } from '../hooks/useExtensionBridge';

interface ProjectDetailProps {
  project: Project;
  meetings: MeetingRecording[];
  sessions: SoftwareSession[];
  chatMessages: ChatMessage[];
  chatDrafts: DraftMessage[];
  currentDraft: string;
  onSendChatMessage: (content: string) => void | Promise<void>;
  onEditChatMessage: (messageId: string, content: string) => boolean | Promise<boolean>;
  onDraftChange: (value: string) => void | Promise<void>;
  canEditMessage: (message: ChatMessage, userId: string) => boolean;
  editWindowMs: number;
  announcements: Announcement[];
  currentUserId: string;
  showProfileSidebar: boolean;
  showChatSidebar: boolean;
  onCloseProfile: () => void;
  onCloseChat: () => void;
}

type CenterViewMode = 'DASHBOARD' | 'MEETINGS' | 'SESSIONS';

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project, 
  meetings, 
  sessions,
  chatMessages,
  chatDrafts,
  currentDraft,
  onSendChatMessage,
  onEditChatMessage,
  onDraftChange,
  canEditMessage,
  editWindowMs,
  announcements,
  currentUserId,
  showProfileSidebar,
  showChatSidebar,
  onCloseProfile,
  onCloseChat
}) => {
  const [viewMode, setViewMode] = useState<CenterViewMode>('DASHBOARD');
  const [showGuide, setShowGuide] = useState(true);
  const { extensionStatus, startSession } = useExtensionBridge();

  // --- Components for specific sections ---

  const PersonalDetailsColumn = () => (
    <div className="h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col relative shadow-2xl lg:shadow-none">
       {/* Aesthetic Header Pattern */}
       <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <button onClick={onCloseProfile} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors backdrop-blur-sm">
            <X size={18} />
          </button>
       </div>

       {/* Profile Content - Pull up avatar */}
       <div className="px-8 pb-8 flex flex-col items-center text-center -mt-16">
          <div className="w-32 h-32 rounded-full p-1.5 bg-white dark:bg-slate-900 shadow-xl mb-4">
            <img 
              src={`https://picsum.photos/seed/${currentUserId}/200/200`} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover border border-slate-100 dark:border-slate-800" 
            />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Alex Chen</h2>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mt-2 mb-6">
            Lead Engineer
          </span>

          <div className="w-full space-y-4">
            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 text-left shadow-sm">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300">
                <Mail size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 uppercase font-bold">Email</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">alex.chen@syncengine.io</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 text-left shadow-sm">
               <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300">
                <Phone size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 uppercase font-bold">Phone</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">+1 (555) 012-3456</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 text-left shadow-sm">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300">
                <MapPin size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 uppercase font-bold">Location</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">San Francisco, CA</p>
              </div>
            </div>
          </div>
       </div>

       {/* Footer */}
       <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800 text-center">
         <p className="text-xs text-slate-400">Member since Oct 2023</p>
       </div>
    </div>
  );

  const ChatsColumn = () => (
    <div className="h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col relative shadow-2xl lg:shadow-none">
       <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
         <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           Team Chat
         </h2>
         <button onClick={onCloseChat} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
           <X size={18} className="text-slate-500" />
         </button>
       </div>
       <div className="flex-1 overflow-hidden">
         <ChatInterface 
           messages={chatMessages}
           currentUserId={currentUserId}
           onSendMessage={onSendChatMessage}
           onEditMessage={onEditChatMessage}
           onDraftChange={onDraftChange}
           drafts={chatDrafts}
           currentDraft={currentDraft}
           canEditMessage={canEditMessage}
           editWindowMs={editWindowMs}
         />
       </div>
    </div>
  );

  const DashboardCenter = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto">
      
      {/* 0. Getting Started / Setup Guide */}
      {showGuide && (
        <div className="p-6 pb-0 animate-fade-in-down">
          <div className="rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-blue-100 dark:border-slate-700 p-6 relative overflow-hidden shadow-sm">
            <button 
              onClick={() => setShowGuide(false)} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30 hidden md:block">
                <HelpCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Workspace Setup & Guide</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 max-w-2xl">
                  New to SyncEngine? Follow these steps to connect your tools and start tracking your engineering workflow automatically.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1 */}
                  <div className="bg-white/60 dark:bg-slate-950/50 rounded-xl p-4 border border-blue-100 dark:border-slate-700/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                      <Download size={14} /> Step 1: Connect
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-3">Install the SyncEngine Browser Extension to enable auto-tracking.</p>
                    <button className="text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-lg font-bold hover:opacity-90 transition-opacity">
                      Install Extension
                    </button>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white/60 dark:bg-slate-950/50 rounded-xl p-4 border border-blue-100 dark:border-slate-700/50 shadow-sm">
                     <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                      <Zap size={14} /> Step 2: Launch
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                      Click any tool icon in the <strong>Integrated Tools</strong> section below. The extension will automatically detect activity.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white/60 dark:bg-slate-950/50 rounded-xl p-4 border border-blue-100 dark:border-slate-700/50 shadow-sm">
                     <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <Layers size={14} /> Step 3: Sync
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                      Sessions are processed into timelapses (<span className="font-bold">Work Section</span>) and meetings are summarized (<span className="font-bold">Review Meetings</span>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          </div>
        </div>
      )}

      {/* 1. Announcements Section - Glassmorphic Hero */}
      <div className="p-6">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black"></div>
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors duration-1000"></div>
          
          <div className="relative z-10 p-8 md:p-10 text-center">
            <h2 className="text-xs font-bold text-blue-300 uppercase tracking-[0.3em] mb-4">Latest Announcement</h2>
            {announcements.length > 0 && (
              <div className="max-w-3xl mx-auto cursor-pointer">
                <p className="text-xl md:text-3xl font-light italic leading-relaxed text-slate-100">
                  "{announcements[0].content}"
                </p>
                <div className="flex items-center justify-center gap-2 mt-6">
                  <div className="h-px w-12 bg-blue-500/50"></div>
                  <p className="text-sm text-blue-200 font-mono">{new Date(announcements[0].timestamp).toLocaleDateString()}</p>
                  <div className="h-px w-12 bg-blue-500/50"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Meetings Row - Floating Action Cards */}
      <div className="px-6 mb-2">
        <div className="flex flex-col md:flex-row gap-4 h-32">
          {/* Icon Box */}
          <div className="w-32 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm shrink-0">
             <div className="relative w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center border border-slate-100 dark:border-slate-700">
                <Video size={32} className="text-indigo-500" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
             </div>
          </div>
          
          {/* Action Button */}
          <button 
            onClick={() => setViewMode('MEETINGS')}
            className="flex-1 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 dark:from-amber-500 dark:to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-between px-8 transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
            <span className="text-slate-900 font-bold text-2xl tracking-tight relative z-10">Review Meetings</span>
            <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform relative z-10">
               <ChevronRight className="text-slate-900" size={24} />
            </div>
          </button>
        </div>
      </div>

      {/* 3. Unified Tools Section */}
      <div className="px-6 py-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 md:p-8">
           <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Integrated Tools
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Launch these applications to automatically start a tracked session.
                </p>
              </div>
              <div className="text-xs font-mono bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                Extension Status: 
                <span className={`font-bold ml-1 ${extensionStatus.isInstalled ? 'text-emerald-500' : 'text-red-500'}`}>
                  {extensionStatus.isInstalled ? '● Ready' : '○ Not Detected'}
                </span>
              </div>
           </div>
           
           <div className="flex flex-wrap justify-center md:justify-start gap-8">
             {SOFTWARE_TOOLS.map(tool => (
               <div 
                key={tool.id} 
                onClick={() => {
                  if (extensionStatus.isInstalled) {
                    startSession(tool.id, tool.url, project.id);
                  } else {
                    alert("Please install the Schmer Extension to record sessions.");
                  }
                }}
                className={`w-24 flex flex-col items-center gap-3 cursor-pointer group ${!extensionStatus.isInstalled && 'opacity-60'}`}
               >
                 <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/20 group-hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all"></div>
                    <img src={tool.logoUrl} alt={tool.name} className="w-10 h-10 object-contain relative z-10" />
                 </div>
                 <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors text-center">{tool.name}</span>
               </div>
             ))}
             
             {/* Add New Tool Placeholder */}
             <div className="w-24 flex flex-col items-center gap-3 cursor-pointer group opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-transparent rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-slate-400 dark:group-hover:border-slate-500 text-slate-400 transition-colors">
                   <div className="text-2xl">+</div>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-400 text-center">Add Tool</span>
             </div>
          </div>
        </div>
      </div>

      {/* 4. Work Section */}
      <div className="px-6 mb-2">
        <div className="flex flex-col md:flex-row gap-4 h-24">
           <div className="w-32 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shrink-0">
              <h3 className="text-lg font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">WORK</h3>
           </div>
           <button 
             onClick={() => setViewMode('SESSIONS')}
             className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between px-8 transition-all group shadow-sm hover:shadow-md"
           >
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Layers size={24} />
                 </div>
                 <div className="text-left">
                    <span className="block text-slate-900 dark:text-white font-bold text-lg">Session Library</span>
                    <span className="text-xs text-slate-500">View timelines & recordings</span>
                 </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" size={24} />
           </button>
        </div>
      </div>

      {/* 5. Footer Link */}
      <div className="p-6 text-center shrink-0">
        <button className="text-sm font-semibold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto group">
          Open Native Software Bridge
          <Zap size={14} className="group-hover:text-yellow-500 transition-colors" />
        </button>
      </div>

    </div>
  );

  return (
    <div className="h-full flex relative overflow-hidden bg-slate-100 dark:bg-slate-950">
      
      {/* Sliding LEFT DRAWER: Personal Details */}
      <div className={`fixed top-20 bottom-0 left-0 w-80 z-40 transform transition-transform duration-300 ease-out ${showProfileSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <PersonalDetailsColumn />
      </div>

      {/* Overlay */}
      {(showProfileSidebar || showChatSidebar) && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm transition-opacity"
          onClick={() => { onCloseProfile(); onCloseChat(); }}
        />
      )}

      {/* CENTER COLUMN: Dashboard / Meetings / Sessions */}
      <div className="flex-1 h-full overflow-hidden relative">
        
        {/* Navigation Breadcrumb */}
        {viewMode !== 'DASHBOARD' && (
          <div className="absolute top-6 left-6 z-20">
            <button 
              onClick={() => setViewMode('DASHBOARD')}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold uppercase text-xs hover:scale-105 transition-transform"
            >
              <ChevronRight className="rotate-180" size={14} /> Back to Dashboard
            </button>
          </div>
        )}

        {viewMode === 'DASHBOARD' && <DashboardCenter />}
        
        {viewMode === 'MEETINGS' && (
           <div className="h-full bg-slate-50 dark:bg-slate-950 p-8 overflow-y-auto pt-24">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Recorded Meetings</h2>
                <p className="text-slate-500 mb-8">AI-indexed archive of all team syncs.</p>
                <MeetingRepository meetings={meetings} />
              </div>
           </div>
        )}

        {viewMode === 'SESSIONS' && (
           <div className="h-full bg-slate-50 dark:bg-slate-950 p-8 overflow-y-auto pt-24">
               <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Software Sessions</h2>
                <p className="text-slate-500 mb-8">Automated timelapse captures of engineering tools.</p>
                <SessionRecorder sessions={sessions} />
              </div>
           </div>
        )}
      </div>

      {/* Sliding RIGHT DRAWER: Chats */}
      <div className={`fixed top-20 bottom-0 right-0 w-96 z-40 transform transition-transform duration-300 ease-out ${showChatSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
        <ChatsColumn />
      </div>

    </div>
  );
};

export default ProjectDetail;