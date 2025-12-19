import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentView: string;
  onChangeView: (view: any) => void;
  onToggleProfile: () => void;
  onToggleChat: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  darkMode, 
  toggleDarkMode,
  onChangeView,
  onToggleProfile,
  onToggleChat
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Get initials from user name
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''} font-sans selection:bg-blue-500 selection:text-white`}>
      <div className="flex w-full text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Mobile Only */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out
          bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl
        `}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Schmer</span>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              <button 
                onClick={() => { onChangeView('DASHBOARD'); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              >
                <LayoutDashboard size={20} />
                Dashboard
              </button>
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => { onChangeView('DASHBOARD'); setSidebarOpen(false); }}
              >
                <FolderKanban size={20} />
                Projects
              </button>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
               <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-sm font-medium text-slate-500">Theme</span>
                  <button 
                    onClick={toggleDarkMode}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
               </div>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header - Glassmorphism Sticky */}
          <header className="h-20 glass-panel border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 lg:px-8 shadow-sm z-30 absolute top-0 left-0 right-0">
            
            {/* Left: Hamburger (Mobile) + SS Logo */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              
              {/* Profile Toggle Button */}
              <button 
                onClick={onToggleProfile}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform z-20"
                title="Toggle Personal Details"
              >
                <div className="w-full h-full rounded-full bg-slate-900/10 flex items-center justify-center border-2 border-white/20">
                  <span className="text-white font-bold text-lg tracking-wide">{initials}</span>
                </div>
              </button>
            </div>

            {/* Center: PROJECTS Title */}
            <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none">
              <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em] text-slate-900 dark:text-white uppercase pointer-events-auto select-none">
                Projects
              </h1>
            </div>

            {/* Right: Chat Toggle Button */}
            <div className="flex items-center gap-4 z-20">
              <button 
                onClick={onToggleChat}
                className="relative cursor-pointer group hover:scale-110 transition-transform duration-300"
                title="Toggle Chat"
              >
                 <div className="absolute -inset-2 bg-green-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 {/* Back Bubble */}
                 <div className="absolute top-0 right-0 w-8 h-8 bg-green-600 rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform border border-white/10 shadow-sm"></div>
                 {/* Front Bubble */}
                 <div className="relative w-10 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20 border border-white/20">
                    <MessageSquare className="text-white w-4 h-4" fill="currentColor" />
                 </div>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-hidden relative pt-20">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;