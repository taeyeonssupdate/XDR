import React, { useEffect, useState } from 'react';
import { AlertTriangle, Server, ShieldAlert, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User, UnifiedEvent } from '../types';
import { simulateExtraHopData } from '../services/extraHopService';

interface DashboardProps {
  currentUser: User;
}

const StatCard = ({ title, value, label, icon: Icon, color }: any) => (
  <div className="bg-cyber-800 p-6 rounded-lg border border-cyber-700">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
        <p className={`text-xs ${color}`}>{label}</p>
      </div>
      <div className="p-3 bg-cyber-900 rounded-lg">
        <Icon className={`w-6 h-6 ${color.replace('text-', 'text-opacity-80 text-')}`} />
      </div>
    </div>
  </div>
);

const IncidentRow = ({ id, name, severity, time, status, vendor }: any) => (
  <div className="grid grid-cols-2 md:grid-cols-12 gap-4 py-4 border-b border-cyber-700 hover:bg-cyber-700/30 transition items-center px-4 -mx-4">
    <div className="col-span-2 md:col-span-2 font-mono text-sm text-cyber-accent">{id}</div>
    <div className="col-span-2 md:col-span-4 font-medium text-slate-200 truncate">
        {name}
        <span className="ml-2 text-[10px] text-slate-500 bg-cyber-900 px-1 rounded border border-cyber-700">{vendor}</span>
    </div>
    <div className="col-span-1 md:col-span-2">
      <span className={`px-2 py-1 rounded text-xs font-bold ${
        severity === 'Critical' ? 'bg-red-500/10 text-red-500' : 
        severity === 'High' ? 'bg-orange-500/10 text-orange-500' :
        'bg-yellow-500/10 text-yellow-500'
      }`}>
        {severity}
      </span>
    </div>
    <div className="col-span-1 md:col-span-2 text-sm text-slate-400">{time}</div>
    <div className="col-span-2 md:col-span-2 flex justify-end">
      <Link to={`/incidents/${id}`} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white">
        View <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  </div>
);

export default function Dashboard({ currentUser }: DashboardProps) {
  const [recentIncidents, setRecentIncidents] = useState<UnifiedEvent[]>([]);

  useEffect(() => {
    // In a real scenario, this would call fetchExtraHopDetections(process.env.EXTRAHOP_API_KEY)
    // combined with EDR fetch calls.
    const ndrEvents = simulateExtraHopData();
    
    // Add some static EDR events for contrast
    const edrEvents: UnifiedEvent[] = [
        {
            id: "edr-991",
            timestamp: new Date().toISOString(),
            source: 'EDR' as any,
            vendor: 'CrowdStrike',
            eventType: "Suspicious PowerShell Execution",
            severity: 'Critical' as any,
            description: "Encoded command line detected",
            sourceIp: "10.10.5.55"
        }
    ];

    setRecentIncidents([...ndrEvents, ...edrEvents].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-white">Security Overview</h1>
        <div className="text-xs text-slate-500 font-mono hidden sm:block">
           Timezone: {currentUser.timezone} | System Status: NOMINAL
        </div>
      </div>

      {/* Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Detections" 
          value={recentIncidents.length.toString()} 
          label="Unified Stream" 
          icon={ShieldAlert} 
          color="text-red-500" 
        />
        <StatCard 
          title="EDR Signals" 
          value="45.2k" 
          label="Endpoints Monitored" 
          icon={Server} 
          color="text-purple-500" 
        />
        <StatCard 
          title="NDR Analysis" 
          value="1.2m" 
          label="Flows Analyzed" 
          icon={Activity} 
          color="text-sky-500" 
        />
        <StatCard 
          title="Threat Score" 
          value="High" 
          label="Critical Assets Targeted" 
          icon={AlertTriangle} 
          color="text-orange-500" 
        />
      </div>

      <div className="bg-cyber-800 rounded-lg border border-cyber-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Recent Priority Incidents</h2>
        {/* Table Header - Hidden on small screens */}
        <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 px-4 mb-2">
          <div className="col-span-2">ID</div>
          <div className="col-span-4">SUBJECT</div>
          <div className="col-span-2">SEVERITY</div>
          <div className="col-span-2">DETECTED</div>
          <div className="col-span-2 text-right">ACTION</div>
        </div>
        <div className="flex flex-col">
          {recentIncidents.map(inc => (
              <IncidentRow 
                key={inc.id}
                id={inc.id} 
                name={inc.eventType} 
                severity={inc.severity} 
                vendor={inc.vendor}
                time={new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', timeZone: currentUser.timezone })} 
              />
          ))}
        </div>
      </div>
    </div>
  );
}