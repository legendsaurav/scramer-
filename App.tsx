
import React, { useState, useEffect } from 'react';
import { AppState, ViewState } from './types';
import { MOCK_PROJECTS, MOCK_MEETINGS, MOCK_SESSIONS, MOCK_CHAT, MOCK_ANNOUNCEMENTS } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import LoginPage from './components/LoginPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const auth = useAuth();
  
  const [state, setState] = useState<AppState>({
    currentUser: auth.currentUser!, // Will be updated by effect
    currentView: 'DASHBOARD',
    selectedProjectId: null,
    activeTab: 'overview',
    darkMode: true
  });

  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [showChatSidebar, setShowChatSidebar] = useState(false);

  const handleLoginSuccess = () => {
    if (!auth.currentUser) return;
    setState(prev => ({
      ...prev,
      currentUser: auth.currentUser!,
      currentView: 'DASHBOARD',
      selectedProjectId: null
    }));
  };

  // Sync auth user with app state
  useEffect(() => {
    if (auth.currentUser) {
      setState(prev => ({ ...prev, currentUser: auth.currentUser! }));
    }
  }, [auth.currentUser]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const handleSelectProject = (projectId: string) => {
    setState(prev => ({
      ...prev,
      currentView: 'PROJECT_DETAIL',
      selectedProjectId: projectId
    }));
  };

  const handleViewChange = (view: ViewState) => {
    setState(prev => ({
      ...prev,
      currentView: view,
      selectedProjectId: view === 'DASHBOARD' ? null : prev.selectedProjectId
    }));
    // Reset sidebars when changing views
    setShowProfileSidebar(false);
    setShowChatSidebar(false);
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
        <p className="text-sm tracking-widest uppercase">Loading workspace...</p>
      </div>
    );
  }

  // If no user is logged in via the hook, show login page
  if (!auth.currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} authHook={auth} />;
  }

  // derived state for current project view
  const currentProject = state.selectedProjectId 
    ? MOCK_PROJECTS.find(p => p.id === state.selectedProjectId)
    : null;

  return (
    <Layout 
      user={state.currentUser} 
      darkMode={state.darkMode} 
      toggleDarkMode={toggleDarkMode}
      currentView={state.currentView}
      onChangeView={handleViewChange}
      onToggleProfile={() => setShowProfileSidebar(prev => !prev)}
      onToggleChat={() => setShowChatSidebar(prev => !prev)}
    >
      <div className="absolute top-4 right-20 z-50">
         <button 
          onClick={auth.logout}
          className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1 rounded-full border border-red-500/20 transition-colors"
         >
           Logout
         </button>
      </div>

      {state.currentView === 'DASHBOARD' && (
        <Dashboard 
          user={state.currentUser} 
          projects={MOCK_PROJECTS}
          onSelectProject={handleSelectProject}
        />
      )}

      {state.currentView === 'PROJECT_DETAIL' && currentProject && (
        <ProjectDetail 
          project={currentProject}
          meetings={MOCK_MEETINGS.filter(m => m.projectId === currentProject.id)}
          sessions={MOCK_SESSIONS.filter(s => s.projectId === currentProject.id)}
          chatMessages={MOCK_CHAT.filter(c => c.projectId === currentProject.id)}
          announcements={MOCK_ANNOUNCEMENTS.filter(a => a.projectId === currentProject.id)}
          currentUserId={state.currentUser.id}
          showProfileSidebar={showProfileSidebar}
          showChatSidebar={showChatSidebar}
          onCloseProfile={() => setShowProfileSidebar(false)}
          onCloseChat={() => setShowChatSidebar(false)}
        />
      )}
    </Layout>
  );
}

export default App;
