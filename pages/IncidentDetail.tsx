import React, { useState, useEffect } from 'react';
import { UnifiedEvent, EventSource, Severity, User } from '../types';
import TimelineTopology from '../components/TimelineTopology';
import { analyzeIncident } from '../services/geminiService';
import { Share2, Bot, Terminal, Shield, FileText } from 'lucide-react';

// Mock Data Generation
const generateMockEvents = (): UnifiedEvent[] => {
  const baseTime = new Date().getTime() - 1000 * 60 * 60; // 1 hour ago
  return [
    {
      id: 'e1',
      timestamp: new Date(baseTime).toISOString(),
      source: EventSource.NDR,
      vendor: 'Corelight',
      eventType: 'Phishing Link Click',
      severity: Severity.MEDIUM,
      description: 'User visited suspicious domain update-sys.net',
      destIp: '192.168.1.50',
      sourceIp: '10.0.0.5'
    },
    {
      id: 'e2',
      timestamp: new Date(baseTime + 1000 * 60 * 2).toISOString(),
      source: EventSource.EDR,
      vendor: 'CrowdStrike',
      eventType: 'ProcessCreation',
      severity: Severity.HIGH,
      description: 'chrome.exe spawned unknown process download.exe',
      processName: 'download.exe',
      user: 'finance_admin',
      traceId: 't-1'
    },
    {
      id: 'e3',
      timestamp: new Date(baseTime + 1000 * 60 * 2.5).toISOString(),
      source: EventSource.EDR,
      vendor: 'CrowdStrike',
      eventType: 'FileWrite',
      severity: Severity.HIGH,
      description: 'download.exe wrote file payload.ps1',
      filePath: 'C:\\Temp\\payload.ps1',
      traceId: 't-1'
    },
    {
      id: 'e4',
      timestamp: new Date(baseTime + 1000 * 60 * 5).toISOString(),
      source: EventSource.EDR,
      vendor: 'CrowdStrike',
      eventType: 'PowerShellExec',
      severity: Severity.CRITICAL,
      description: 'Encoded PowerShell script executed',
      processName: 'powershell.exe',
      rawPayload: '-Enc aGVsbG8gd29ybGQ=',
      traceId: 't-1'
    },
    {
      id: 'e5',
      timestamp: new Date(baseTime + 1000 * 60 * 6).toISOString(),
      source: EventSource.NDR,
      vendor: 'Darktrace',
      eventType: 'C2Beacon',
      severity: Severity.CRITICAL,
      description: 'Outbound connection to known C2 server',
      destIp: '45.33.22.11',
      sourceIp: '10.0.0.5'
    }
  ];
};

interface Props {
  currentUser: User;
}

export default function IncidentDetail({ currentUser }: Props) {
  const [events] = useState<UnifiedEvent[]>(generateMockEvents());
  const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const handleAnalyze = async () => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
      // Simulate analysis for demo if key is missing
      setAnalyzing(true);
      setTimeout(() => {
        setAnalysis(`**Analysis (Simulated - No API Key)**\n\n1. **Summary:** Phishing vector leading to C2 communication. User clicked link -> Payload dropped -> PowerShell execution -> C2 Beacon.\n2. **Root Cause:** User Training / Lack of URL filtering.\n3. **Remediation:** Isolate host 10.0.0.5, block IP 45.33.22.11.`);
        setAnalyzing(false);
      }, 1500);
      return;
    }

    setAnalyzing(true);
    const result = await analyzeIncident(events);
    setAnalysis(result);
    setAnalyzing(false);
  };

  const handleShare = () => {
    alert("Public read-only link copied to clipboard: https://nexus-defend.io/share/inc-3942?token=xyz");
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      
      {/* Left Column: Visuals & List */}
      <div className="col-span-2 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    INC-3942: C2 Beaconing via PowerShell
                    <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded border border-red-500/30">CRITICAL</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1">Cross-correlating EDR (CrowdStrike) and NDR (Corelight)</p>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={handleShare}
                  className="bg-cyber-800 hover:bg-cyber-700 text-slate-300 px-3 py-2 rounded text-sm border border-cyber-700 flex items-center gap-2"
                >
                    <Share2 className="w-4 h-4" /> Share Context
                </button>
            </div>
        </div>

        {/* The Topology Graph */}
        <TimelineTopology events={events} onEventClick={setSelectedEvent} />

        {/* Event List */}
        <div className="flex-1 bg-cyber-800 rounded-lg border border-cyber-700 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-cyber-700 bg-cyber-900/50 flex justify-between items-center">
            <h3 className="font-semibold text-sm text-slate-300">Unified Event Stream</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-cyber-900 text-xs uppercase font-semibold text-slate-500 sticky top-0">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-700">
                {events.map(event => (
                  <tr 
                    key={event.id} 
                    onClick={() => setSelectedEvent(event)}
                    className={`hover:bg-cyber-700 cursor-pointer transition ${selectedEvent?.id === event.id ? 'bg-cyber-700/50' : ''}`}
                  >
                    <td className="p-3 whitespace-nowrap font-mono text-xs">{new Date(event.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${event.source === 'EDR' ? 'bg-purple-500/20 text-purple-400' : 'bg-sky-500/20 text-sky-400'}`}>
                            {event.source}
                        </span>
                    </td>
                    <td className="p-3 text-slate-200">{event.eventType}</td>
                    <td className="p-3 truncate max-w-xs">{event.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: AI & Details */}
      <div className="col-span-1 bg-cyber-800 border-l border-cyber-700 flex flex-col -my-8 -mr-8 p-6 overflow-y-auto">
        
        {/* Gemini Analysis Section */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-cyber-accent" /> AI Analysis
                </h2>
                <button 
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="bg-cyber-accent hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition"
                >
                    {analyzing ? 'Reasoning...' : 'Analyze Chain'}
                </button>
            </div>
            
            {apiKeyMissing && !analysis && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs rounded mb-4">
                Note: API Key missing. Using simulated response for demo.
              </div>
            )}

            <div className="bg-cyber-900 rounded-lg p-4 border border-cyber-700 min-h-[200px] text-sm leading-relaxed text-slate-300">
                {analysis ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">{analysis}</pre>
                    </div>
                ) : (
                    <div className="text-center text-slate-600 mt-10 italic">
                        Select events or click Analyze to generate insights using Gemini 2.5 Flash.
                    </div>
                )}
            </div>
        </div>

        {/* Selected Event Detail */}
        {selectedEvent ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-400" /> Event Details
                </h3>
                <div className="space-y-4">
                    <div className="p-4 bg-cyber-900 rounded border border-cyber-700">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500 block text-xs uppercase">Event Type</span>
                                <span className="text-slate-200">{selectedEvent.eventType}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs uppercase">Vendor</span>
                                <span className="text-slate-200">{selectedEvent.vendor}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-slate-500 block text-xs uppercase">Raw Description</span>
                                <span className="text-slate-300 font-mono text-xs">{selectedEvent.description}</span>
                            </div>
                            {selectedEvent.rawPayload && (
                                <div className="col-span-2">
                                    <span className="text-slate-500 block text-xs uppercase">Payload</span>
                                    <code className="block bg-black p-2 rounded text-green-500 font-mono text-xs overflow-x-auto mt-1">
                                        {selectedEvent.rawPayload}
                                    </code>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <FileText className="w-12 h-12 mb-2 opacity-20" />
                <p>Select an event node to view details</p>
            </div>
        )}

      </div>
    </div>
  );
}