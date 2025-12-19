import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Project, User } from '../types';
import { Clock, Users, Video, Activity, ArrowRight, PlayCircle, Zap } from 'lucide-react';

interface DashboardProps {
  user: User;
  projects: Project[];
  onSelectProject: (id: string) => void;
}

const data = [
  { name: 'Mon', hours: 4.5 },
  { name: 'Tue', hours: 6.2 },
  { name: 'Wed', hours: 3.8 },
  { name: 'Thu', hours: 8.5 },
  { name: 'Fri', hours: 5.1 },
];

const Dashboard: React.FC<DashboardProps> = ({ user, projects, onSelectProject }) => {
  return (
    <div className="h-full overflow-y-auto p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10 pb-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">{user.name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Your engineering workspace is ready.</p>
          </div>
          <div className="text-sm text-slate-400 font-mono bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Projects', value: '3', icon: Activity, color: 'text-blue-400', from: 'from-blue-500/20', to: 'to-blue-600/5' },
            { label: 'Hours Recorded', value: '28.5', icon: Clock, color: 'text-emerald-400', from: 'from-emerald-500/20', to: 'to-emerald-600/5' },
            { label: 'Team Members', value: '12', icon: Users, color: 'text-purple-400', from: 'from-purple-500/20', to: 'to-purple-600/5' },
            { label: 'Meetings Synced', value: '8', icon: Video, color: 'text-orange-400', from: 'from-orange-500/20', to: 'to-orange-600/5' },
          ].map((stat, i) => (
            <div key={i} className="group relative bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.from} ${stat.to} rounded-bl-[100px] -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                    <stat.icon size={22} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">+2.5%</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="text-amber-400" size={20} /> Active Projects
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-500 font-semibold hover:underline decoration-2 underline-offset-4">View All</button>
            </div>
            <div className="grid gap-5">
              {projects.map(project => (
                <div 
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="group relative bg-white dark:bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{project.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          project.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{project.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex -space-x-2">
                         {project.members.map((m, i) => (
                           <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-medium relative z-10">
                              {i < 2 ? <img src={`https://picsum.photos/seed/${m}/100/100`} className="w-full h-full rounded-full" /> : `+${project.members.length - 2}`}
                           </div>
                         ))}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Chart & Feature Card */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Productivity</h2>
            
            {/* Chart Card */}
            <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-72">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Software Sessions (Hours)</h3>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={data}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)', radius: 4 }}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 6, 6]} barSize={32}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.hours > 6 ? 'url(#colorGradient)' : '#e2e8f0'} className="dark:fill-slate-700" />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Feature Card */}
            <div className="group relative overflow-hidden rounded-2xl p-6 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700"></div>
              <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                <Video size={160} />
              </div>
              
              <div className="relative z-10 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider">Processing</span>
                </div>
                <h3 className="font-bold text-xl mb-1">MATLAB Simulation</h3>
                <p className="text-indigo-100 text-sm mb-5 opacity-90">Session logs from yesterday are ready for timelapse review.</p>
                <button className="flex items-center gap-2 bg-white text-indigo-900 hover:bg-indigo-50 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg">
                  <PlayCircle size={18} />
                  Watch Timelapse (5x)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;