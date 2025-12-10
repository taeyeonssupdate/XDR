import React, { useState } from 'react';
import { User, IntegrationConfig } from '../types';
import { IntegrationCard } from '../components/IntegrationCard';
import { Layers, Database, Code, Save, Lock, Server, ShieldCheck, ToggleLeft, ToggleRight, Network, UserCog } from 'lucide-react';

const MOCK_INTEGRATIONS: IntegrationConfig[] = [
    { id: '1', name: 'CrowdStrike Falcon', type: 'EDR', status: 'active', lastSync: '2 mins ago' },
    { id: '2', name: 'SentinelOne Singularity', type: 'EDR', status: 'active', lastSync: '5 mins ago' },
    { id: '3', name: 'Corelight Sensors', type: 'NDR', status: 'active', lastSync: '1 min ago' },
    { id: '4', name: 'Internal MCP Server', type: 'MCP', status: 'disconnected', lastSync: 'Never' },
];

interface SettingsProps {
    currentUser: User;
    onUpdateUser: (user: User) => void;
}

export default function SettingsPage({ currentUser, onUpdateUser }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'integrations' | 'system' | 'access' | 'serialization' | 'api' | 'profile'>('integrations');
  const [samlEnabled, setSamlEnabled] = useState(false);
  const [redisEnabled, setRedisEnabled] = useState(true);

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateUser({
        ...currentUser,
        timezone: e.target.value
    });
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${activeTab === id ? 'border-cyber-accent text-cyber-accent' : 'border-transparent text-slate-400 hover:text-white'}`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
  );

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-bold text-white mb-6">Platform Settings</h1>
      
      <div className="flex border-b border-cyber-700 mb-8 overflow-x-auto">
        <TabButton id="integrations" label="Integrations" icon={Network} />
        <TabButton id="system" label="System" icon={Server} />
        <TabButton id="access" label="Access Control" icon={ShieldCheck} />
        <TabButton id="profile" label="User Preferences" icon={UserCog} />
        <TabButton id="serialization" label="Unified Schema" icon={Code} />
        <TabButton id="api" label="Developer API" icon={Layers} />
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
                <div className="flex gap-4 flex-col sm:flex-row">
                    <input type="text" placeholder="MCP Server URL (e.g., ws://localhost:3000)" className="flex-1 bg-cyber-900 border border-cyber-700 rounded px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyber-accent" />
                    <input type="text" placeholder="Auth Token" className="w-full sm:w-48 bg-cyber-900 border border-cyber-700 rounded px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyber-accent" />
                    <button className="bg-cyber-700 hover:bg-cyber-600 text-white px-4 py-2 rounded text-sm">Connect</button>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'system' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Redis Configuration */}
            <div className="bg-cyber-800 rounded border border-cyber-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded">
                            <Database className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Redis Cache Layer</h3>
                            <p className="text-xs text-slate-400">Used for high-velocity event buffering and graph caching.</p>
                        </div>
                    </div>
                    <button onClick={() => setRedisEnabled(!redisEnabled)} className="text-cyber-accent">
                        {redisEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                    </button>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!redisEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Connection String</label>
                        <input type="password" value="redis://default:******@cache-cluster:6379" readOnly className="w-full bg-cyber-900 border border-cyber-700 rounded px-3 py-2 text-slate-200 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Cache TTL (Seconds)</label>
                        <input type="number" defaultValue={3600} className="w-full bg-cyber-900 border border-cyber-700 rounded px-3 py-2 text-slate-200 text-sm" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                         <div className="flex items-center gap-2 text-xs text-cyber-success bg-cyber-success/10 p-2 rounded border border-cyber-success/20 w-fit">
                            <span className="w-2 h-2 rounded-full bg-cyber-success"></span>
                            Operational - 124,039 Keys Cached
                         </div>
                    </div>
                </div>
            </div>

            {/* Postgres Configuration */}
             <div className="bg-cyber-800 rounded border border-cyber-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded">
                            <Database className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">PostgreSQL Storage</h3>
                            <p className="text-xs text-slate-400">Long-term persistence for incident history and compliance.</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-cyber-success px-2 py-1 bg-cyber-900 rounded border border-cyber-700">CONNECTED</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Retention Policy</label>
                        <select className="w-full bg-cyber-900 border border-cyber-700 rounded px-3 py-2 text-slate-200 text-sm">
                            <option>90 Days</option>
                            <option>180 Days</option>
                            <option>1 Year</option>
                            <option>Indefinite (Compliance)</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Replica Status</label>
                        <div className="text-sm text-slate-300 py-2">Syncing (Lag: 0ms)</div>
                    </div>
                </div>
            </div>
          </div>
      )}

      {activeTab === 'access' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="bg-cyber-800 rounded border border-cyber-700 p-6">
                 <div className="flex items-center justify-between mb-6">
                     <div>
                        <h3 className="text-lg font-bold text-white">SAML Single Sign-On</h3>
                        <p className="text-sm text-slate-400">Manage identity providers and role mapping.</p>
                     </div>
                     <button onClick={() => setSamlEnabled(!samlEnabled)} className="text-cyber-accent">
                        {samlEnabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                    </button>
                 </div>

                 <div className={`space-y-4 ${!samlEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Identity Provider SSO URL</label>
                        <input type="text" placeholder="https://idp.example.com/saml/sso" className="w-full bg-cyber-900 border border-cyber-700 rounded px-3 py-2 text-slate-200 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">X.509 Certificate</label>
                        <textarea className="w-full h-24 bg-cyber-900 border border-cyber-700 rounded px-3 py-2 text-slate-200 text-xs font-mono" placeholder="-----BEGIN CERTIFICATE-----..." />
                    </div>
                 </div>
             </div>

             <div className="bg-cyber-800 rounded border border-cyber-700 p-6">
                 <h3 className="text-lg font-bold text-white mb-4">RBAC Role Mapping</h3>
                 <table className="w-full text-left text-sm text-slate-400">
                     <thead className="bg-cyber-900 text-xs uppercase font-semibold text-slate-500">
                         <tr>
                             <th className="p-3">SAML Group Attribute</th>
                             <th className="p-3">Platform Role</th>
                             <th className="p-3 text-right">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-cyber-700">
                         <tr>
                             <td className="p-3 font-mono text-slate-300">cn=soc-admins,ou=security</td>
                             <td className="p-3"><span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">ADMIN</span></td>
                             <td className="p-3 text-right"><button className="text-cyber-danger hover:text-red-400">Remove</button></td>
                         </tr>
                         <tr>
                             <td className="p-3 font-mono text-slate-300">cn=soc-analysts,ou=security</td>
                             <td className="p-3"><span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">ANALYST</span></td>
                             <td className="p-3 text-right"><button className="text-cyber-danger hover:text-red-400">Remove</button></td>
                         </tr>
                     </tbody>
                 </table>
                 <button className="mt-4 text-xs bg-cyber-700 hover:bg-cyber-600 text-white px-3 py-2 rounded transition">
                     + Add Role Map
                 </button>
             </div>
          </div>
      )}

      {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="bg-cyber-800 rounded border border-cyber-700 p-6">
                 <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-cyber-900 rounded-full border border-cyber-700">
                        <img src={currentUser.avatar} className="w-12 h-12 rounded-full" alt="Avatar" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{currentUser.name}</h3>
                        <p className="text-sm text-slate-400">{currentUser.role} • {currentUser.id}</p>
                    </div>
                 </div>

                 <div className="space-y-4 max-w-md">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Display Timezone</label>
                        <select 
                            value={currentUser.timezone} 
                            onChange={handleTimezoneChange}
                            className="w-full bg-cyber-900 border border-cyber-700 rounded px-3 py-2 text-slate-200 text-sm focus:border-cyber-accent outline-none"
                        >
                            <option value="UTC">UTC (Universal Time)</option>
                            <option value="America/New_York">America/New_York (EST/EDT)</option>
                            <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                            <option value="Europe/London">Europe/London (GMT/BST)</option>
                            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                            <option value="Asia/Taipei">Asia/Taipei (CST)</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-2">
                            This setting applies to all timestamp visualizations across dashboards, timelines, and logs.
                        </p>
                    </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                            <span className="text-xs text-cyber-accent w-24 shrink-0">id</span>
                            <span className="text-slate-500">←</span>
                            <input type="text" value="event_id" className="bg-cyber-800 border border-cyber-700 rounded px-2 py-1 text-xs text-slate-200 flex-1 min-w-0" readOnly />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-cyber-accent w-24 shrink-0">timestamp</span>
                            <span className="text-slate-500">←</span>
                            <input type="text" value="timestamp_utc" className="bg-cyber-800 border border-cyber-700 rounded px-2 py-1 text-xs text-slate-200 flex-1 min-w-0" readOnly />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-cyber-accent w-24 shrink-0">eventType</span>
                            <span className="text-slate-500">←</span>
                            <input type="text" value="primary_module.name" className="bg-cyber-800 border border-cyber-700 rounded px-2 py-1 text-xs text-slate-200 flex-1 min-w-0" readOnly />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-cyber-accent w-24 shrink-0">severity</span>
                            <span className="text-slate-500">←</span>
                            <input type="text" value="primary_module.severity_code | mapSeverity" className="bg-cyber-800 border border-cyber-700 rounded px-2 py-1 text-xs text-slate-200 flex-1 min-w-0" readOnly />
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
                              <code className="flex-1 bg-cyber-900 p-2 rounded border border-cyber-700 text-slate-300 font-mono text-sm overflow-hidden text-ellipsis">
                                  sk_live_9384...x8392
                              </code>
                              <button className="text-cyber-accent text-sm hover:underline whitespace-nowrap">Regenerate</button>
                          </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Endpoint: Get Events</label>
                        <div className="mt-1 bg-cyber-900 p-4 rounded border border-cyber-700 overflow-x-auto">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <code className="text-purple-400">GET</code> <code className="text-slate-300">https://api.nexus-defend.io/v1/events?incident_id=INC-3942</code>
                            </div>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}