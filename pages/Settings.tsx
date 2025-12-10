import React, { useState } from 'react';
import { User, IntegrationConfig } from '../types';
import { IntegrationCard } from '../components/IntegrationCard';
import { Layers, Database, Code, Save } from 'lucide-react';

const MOCK_INTEGRATIONS: IntegrationConfig[] = [
    { id: '1', name: 'CrowdStrike Falcon', type: 'EDR', status: 'active', lastSync: '2 mins ago' },
    { id: '2', name: 'SentinelOne Singularity', type: 'EDR', status: 'active', lastSync: '5 mins ago' },
    { id: '3', name: 'Corelight Sensors', type: 'NDR', status: 'active', lastSync: '1 min ago' },
    { id: '4', name: 'Internal MCP Server', type: 'MCP', status: 'disconnected', lastSync: 'Never' },
];

export default function SettingsPage({ currentUser }: { currentUser: User }) {
  const [activeTab, setActiveTab] = useState<'integrations' | 'serialization' | 'api'>('integrations');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Platform Settings</h1>
      
      <div className="flex border-b border-cyber-700 mb-8">
        <button 
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'integrations' ? 'border-cyber-accent text-cyber-accent' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
            Integrations & MCP
        </button>
        <button 
            onClick={() => setActiveTab('serialization')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'serialization' ? 'border-cyber-accent text-cyber-accent' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
            Unified Schema Mapping
        </button>
        <button 
             onClick={() => setActiveTab('api')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'api' ? 'border-cyber-accent text-cyber-accent' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
            Developer API
        </button>
      </div>

      {activeTab === 'integrations' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-200">Active Connectors</h2>
                <button className="bg-cyber-accent hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition">
                    + Add New Integration
                </button>
            </div>
            <div className="grid gap-4">
                {MOCK_INTEGRATIONS.map(config => (
                    <IntegrationCard key={config.id} config={config} />
                ))}
            </div>
            
            <div className="bg-cyber-800 p-6 rounded border border-cyber-700 mt-8">
                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4" /> MCP Server Configuration
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    Connect an external Model Context Protocol server to allow the AI agent to fetch real-time logs directly from tools.
                </p>
                <div className="flex gap-4">
                    <input type="text" placeholder="MCP Server URL (e.g., ws://localhost:3000)" className="flex-1 bg-cyber-900 border border-cyber-700 rounded px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyber-accent" />
                    <input type="text" placeholder="Auth Token" className="w-48 bg-cyber-900 border border-cyber-700 rounded px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyber-accent" />
                    <button className="bg-cyber-700 hover:bg-cyber-600 text-white px-4 py-2 rounded text-sm">Connect</button>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'serialization' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-cyber-800 p-6 rounded border border-cyber-700">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 rounded">
                        <Code className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Vendor Serialization Interface</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Map external vendor fields to the internal <code className="bg-black px-1 rounded text-cyber-accent">UnifiedEvent</code> schema. 
                            This allows disparate EDR/NDR products to be visualized on the unified timeline.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase">Source Schema (CrowdStrike JSON)</h4>
                    <div className="bg-cyber-900 p-4 rounded border border-cyber-700 font-mono text-xs text-slate-300 h-64 overflow-auto">
                        {`{
  "event_id": "evt_12345",
  "timestamp_utc": 1678900000,
  "computer_name": "DESKTOP-A1",
  "primary_module": {
     "name": "ProcessRollup2",
     "severity_code": 4
  },
  "user_principal": "corp\\alice"
}`}
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase">Internal Mapping Configuration</h4>
                    <div className="bg-cyber-900 p-4 rounded border border-cyber-700 h-64 overflow-auto space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-cyber-accent w-24">id</span>
                            <span className="text-slate-500">←</span>
                            <input type="text" value="event_id" className="bg-cyber-800 border border-cyber-700 rounded px-2 py-1 text-xs text-slate-200 flex-1" readOnly />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-cyber-accent w-24">timestamp</span>
                            <span className="text-slate-500">←</span>
                            <input type="text" value="timestamp_utc" className="bg-cyber-800 border border-cyber-700 rounded px-2 py-1 text-xs text-slate-200 flex-1" readOnly />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-cyber-accent w-24">eventType</span>
                            <span className="text-slate-500">←</span>
                            <input type="text" value="primary_module.name" className="bg-cyber-800 border border-cyber-700 rounded px-2 py-1 text-xs text-slate-200 flex-1" readOnly />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-cyber-accent w-24">severity</span>
                            <span className="text-slate-500">←</span>
                            <input type="text" value="primary_module.severity_code | mapSeverity" className="bg-cyber-800 border border-cyber-700 rounded px-2 py-1 text-xs text-slate-200 flex-1" readOnly />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end">
                <button className="flex items-center gap-2 bg-cyber-success hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-bold">
                    <Save className="w-4 h-4" /> Save Mapping
                </button>
            </div>
        </div>
      )}

      {activeTab === 'api' && (
          <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-cyber-800 p-6 rounded border border-cyber-700">
                  <h3 className="text-lg font-bold text-white mb-4">API Access</h3>
                  <p className="text-sm text-slate-400 mb-4">
                      Use the API to fetch normalized events or push new events from custom collectors.
                  </p>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase">Your API Key</label>
                          <div className="flex gap-2 mt-1">
                              <code className="flex-1 bg-cyber-900 p-2 rounded border border-cyber-700 text-slate-300 font-mono text-sm">
                                  sk_live_9384...x8392
                              </code>
                              <button className="text-cyber-accent text-sm hover:underline">Regenerate</button>
                          </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Endpoint: Get Events</label>
                        <div className="mt-1 bg-cyber-900 p-4 rounded border border-cyber-700">
                            <code className="text-purple-400">GET</code> <code className="text-slate-300">https://api.nexus-defend.io/v1/events?incident_id=INC-3942</code>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}