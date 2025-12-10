import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Activity, Share2, Settings, Lock, Database, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { User, UserRole } from './types';
import Dashboard from './pages/Dashboard';
import IncidentDetail from './pages/IncidentDetail';
import SettingsPage from './pages/Settings';

// Initial Mock User
const INITIAL_USER: User = {
  id: 'u-123',
  name: 'Alex Cyber',
  role: UserRole.ADMIN,
  avatar: 'https://picsum.photos/200',
  timezone: 'UTC' // Default System Time
};

const Navigation = ({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: User }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Shield },
    { path: '/incidents/inc-001', label: 'Current Incident', icon: Activity },
    { path: '/settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar / Drawer */}
      <nav className={`
        fixed top-0 left-0 h-screen w-64 bg-cyber-900 border-r border-cyber-700 
        z-30 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-screen
      `}>
        <div className="p-6 flex items-center justify-between border-b border-cyber-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyber-accent rounded flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wider text-slate-100">NEXUS<span className="text-cyber-accent">XDR</span></span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => onClose()} // Close drawer on navigation (mobile)
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-cyber-accent/20 text-cyber-accent' 
                    : 'text-slate-400 hover:bg-cyber-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-cyber-700 mt-auto">
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-cyber-700" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                 <span className="truncate">{user.role}</span>
                 <span className="font-mono text-[10px] bg-cyber-800 px-1 rounded">{user.timezone}</span>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

const TopBar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <div className="h-16 bg-cyber-900 border-b border-cyber-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 w-full">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
           <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-cyber-success" />
              <span>Postgres: Connected</span>
           </div>
           <div className="h-4 w-px bg-cyber-700"></div>
           <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-cyber-warning" />
              <span>Redis: Caching (TTL: 1h)</span>
           </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
         <button className="bg-cyber-800 hover:bg-cyber-700 text-slate-300 px-3 py-1.5 rounded text-xs border border-cyber-700 flex items-center gap-2 transition">
            <Share2 className="w-3 h-3" />
            <span className="hidden sm:inline">Share View</span>
         </button>
      </div>
    </div>
  );
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);

  return (
    <HashRouter>
      <div className="min-h-screen bg-cyber-900 text-slate-200 font-sans flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <Navigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={currentUser} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard currentUser={currentUser} />} />
              <Route path="/incidents/:id" element={<IncidentDetail currentUser={currentUser} />} />
              <Route path="/settings" element={<SettingsPage currentUser={currentUser} onUpdateUser={setCurrentUser} />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}