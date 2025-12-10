import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Activity, Share2, Settings, Lock, Database, User as UserIcon, LogOut, Menu } from 'lucide-react';
import { User, UserRole } from './types';
import Dashboard from './pages/Dashboard';
import IncidentDetail from './pages/IncidentDetail';
import SettingsPage from './pages/Settings';

// Mock Auth Context
const CURRENT_USER: User = {
  id: 'u-123',
  name: 'Alex Cyber',
  role: UserRole.ADMIN, // Change to TEST RBAC
  avatar: 'https://picsum.photos/200'
};

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Shield },
    { path: '/incidents/inc-001', label: 'Current Incident', icon: Activity },
    { path: '/settings', label: 'Integrations', icon: Settings },
  ];

  return (
    <nav className="w-64 bg-cyber-900 border-r border-cyber-700 flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center gap-3 border-b border-cyber-700">
        <div className="w-8 h-8 bg-cyber-accent rounded flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-wider text-slate-100">NEXUS<span className="text-cyber-accent">XDR</span></span>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.path} 
              to={item.path}
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

      <div className="p-4 border-t border-cyber-700">
        <div className="flex items-center gap-3">
          <img src={CURRENT_USER.avatar} alt="User" className="w-8 h-8 rounded-full border border-cyber-700" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-200 truncate">{CURRENT_USER.name}</p>
            <p className="text-xs text-slate-500 truncate">{CURRENT_USER.role}</p>
          </div>
          <button className="text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

const TopBar = () => {
  return (
    <div className="h-16 bg-cyber-900 border-b border-cyber-700 flex items-center justify-between px-8 ml-64 sticky top-0 z-20">
      <div className="flex items-center gap-4 text-xs text-slate-400">
         <div className="flex items-center gap-2">
            <Database className="w-3 h-3 text-cyber-success" />
            <span>Postgres: Connected</span>
         </div>
         <div className="h-4 w-px bg-cyber-700"></div>
         <div className="flex items-center gap-2">
            <Database className="w-3 h-3 text-red-500" />
            <span>Redis: Syncing...</span>
         </div>
      </div>
      
      <div className="flex items-center gap-4">
         <button className="bg-cyber-800 hover:bg-cyber-700 text-slate-300 px-3 py-1.5 rounded text-xs border border-cyber-700 flex items-center gap-2 transition">
            <Share2 className="w-3 h-3" />
            Share Event View
         </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-cyber-900 text-slate-200 font-sans">
        <Navigation />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="ml-64 p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/incidents/:id" element={<IncidentDetail currentUser={CURRENT_USER} />} />
              <Route path="/settings" element={<SettingsPage currentUser={CURRENT_USER} />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}