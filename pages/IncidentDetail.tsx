import React, { useState, useEffect } from 'react';
import { UnifiedEvent, EventSource, Severity, User } from '../types';
import TimelineTopology from '../components/TimelineTopology';
import { analyzeIncident } from '../services/geminiService';
import { fetchExtraHopDetections, simulateExtraHopData } from '../services/extraHopService';
import { Share2, Bot, Terminal, Shield, FileText, ChevronDown, Clock, RefreshCw } from 'lucide-react';

// Static EDR Mock Data (to mix with NDR)
const generateStaticEDREvents = (): UnifiedEvent[] => {
  const baseTime = new Date().getTime() - 1000 * 60 * 60; 
  return [
    {
      id: 'edr-1',
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
      id: 'edr-2',
      timestamp: new Date(baseTime + 1000 * 60 * 5).toISOString(),
      source: EventSource.EDR,
      vendor: 'CrowdStrike',
      eventType: 'PowerShellExec',
      severity: Severity.CRITICAL,
      description: 'Encoded PowerShell script executed',
      processName: 'powershell.exe',
      rawPayload: '-Enc aGVsbG8gd29ybGQ=',
      traceId: 't-1'
    }
  ];
};

interface Props {
  currentUser: User;
}

export default function IncidentDetail({ currentUser }: Props) {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load Data
  const loadData = async () => {
      setIsLoading(true);
      
      // 1. Get Static EDR events
      const edrEvents = generateStaticEDREvents();

      // 2. Get ExtraHop NDR events
      // In a real app, you would pass process.env.EXTRAHOP_API_KEY
      // Since we don't have a backend proxy here, we use the simulator
      const ndrEvents = simulateExtraHopData();
      
      // Combine and sort
      const combined = [...edrEvents, ...ndrEvents].sort((a,b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setEvents(combined);
      setIsLoading(false);
  };

  useEffect(() => {
      loadData();
  }, []);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        timeZone: currentUser.timezone
    });
  };

  const handleAnalyze = async () => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
      // Simulate analysis for demo if key is missing
      setAnalyzing(true);
      setTimeout(() => {
        setAnalysis(`**Analysis (Simulated - No API Key)**\n\n1. **Summary:** Correlated NDR and EDR activity detected. ExtraHop observed DC Synchronization attempts (DCSync) from 10.10.5.55 targeting the Domain Controller. Coinciding with this, CrowdStrike detected encoded PowerShell execution on the same source host.\n2. **Root Cause:** Compromised credentials on host 10.10.5.55 leading to lateral movement attempt.\n3. **Remediation:** \n   - Isolate 10.10.5.55 via EDR.\n   - Reset credentials for finance_admin.\n   - Investigate DC logs for successful replication.`);
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
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 h-full">
      
      {/* Left Column: Visuals & List */}
      <div className="col-span-2 flex flex-col gap-6 lg:h-[calc(100vh-8rem)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
                    INC-3942: Active Breach
                    <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded border border-red-500/30">CRITICAL</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1">Cross-correlating EDR (CrowdStrike) and NDR (ExtraHop Reveal(x))</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={loadData} 
                    className="bg-cyber-800 hover:bg-cyber-700 text-slate-300 p-2 rounded border border-cyber-700"
                    title="Refresh Data"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={handleShare}
                  className="bg-cyber-800 hover:bg-cyber-700 text-slate-300 px-3 py-2 rounded text-sm border border-cyber-700 flex items-center gap-2"
                >
                    <Share2 className="w-4 h-4" /> <span className="hidden md:inline">Share Context</span>
                </button>
            </div>
        </div>

        {/* Desktop View: Scatter Topology */}
        <div className="hidden md:block h-64 md:h-96 shrink-0">
          <TimelineTopology events={events} onEventClick={setSelectedEvent} timezone={currentUser.timezone} />
        </div>

        {/* Mobile View: Vertical Timeline (Axis extending downwards) */}
        <div className="md:hidden relative border-l-2 border-cyber-700 ml-4 space-y-8 my-4">
          {events.map((event, index) => (
            <div 
                key={event.id} 
                className="relative pl-6 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
            >
                {/* Timeline Node */}
                <div className={`
                    absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-cyber-900 
                    ${event.severity === Severity.CRITICAL ? 'bg-red-500' : event.severity === Severity.HIGH ? 'bg-orange-500' : 'bg-cyber-accent'}
                    ${selectedEvent?.id === event.id ? 'ring-2 ring-white' : ''}
                `}></div>
                
                <div className={`p-3 rounded-lg border transition ${selectedEvent?.id === event.id ? 'bg-cyber-800 border-cyber-accent' : 'bg-cyber-800/50 border-cyber-700'}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-slate-400 flex items-center gap-1">
                             <Clock className="w-3 h-3" /> {formatTime(event.timestamp)}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded ${event.source === 'EDR' ? 'bg-purple-500/20 text-purple-400' : 'bg-sky-500/20 text-sky-400'}`}>
                            {event.source}
                        </span>
                    </div>
                    <h4 className="font-bold text-slate-200 text-sm">{event.eventType}</h4>
                    <p className="text-xs text-slate-400 mt-1 truncate">{event.description}</p>
                </div>

                {/* Vertical Connector Line Extension (Visual only) */}
                {index !== events.length - 1 && (
                    <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-cyber-700 md:hidden"></div>
                )}
            </div>
          ))}
        </div>

        {/* Event List Table (Desktop Only or simplified) - Flex grow to fill remaining height on desktop */}
        <div className="hidden md:flex flex-1 bg-cyber-800 rounded-lg border border-cyber-700 overflow-hidden flex-col min-h-[300px]">
          <div className="p-3 border-b border-cyber-700 bg-cyber-900/50 flex justify-between items-center">
            <h3 className="font-semibold text-sm text-slate-300">Unified Event Stream</h3>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-cyber-900 text-xs uppercase font-semibold text-slate-500 sticky top-0">
                <tr>
                  <th className="p-3">Time ({currentUser.timezone})</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 min-w-[200px]">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-700">
                {events.map(event => (
                  <tr 
                    key={event.id} 
                    onClick={() => setSelectedEvent(event)}
                    className={`hover:bg-cyber-700 cursor-pointer transition ${selectedEvent?.id === event.id ? 'bg-cyber-700/50' : ''}`}
                  >
                    <td className="p-3 whitespace-nowrap font-mono text-xs">{formatTime(event.timestamp)}</td>
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
      <div className="col-span-1 bg-cyber-800 lg:border-l border-cyber-700 flex flex-col p-6 rounded-lg lg:rounded-none lg:-my-8 lg:-mr-8 lg:overflow-y-auto">
        
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
                             <div className="col-span-2">
                                <span className="text-slate-500 block text-xs uppercase">Timestamp</span>
                                <span className="text-slate-200 font-mono">{formatTime(selectedEvent.timestamp)}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs uppercase">Event Type</span>
                                <span className="text-slate-200">{selectedEvent.eventType}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs uppercase">Vendor</span>
                                <span className="text-slate-200">{selectedEvent.vendor}</span>
                            </div>
                            
                            {/* Dynamic fields based on source */}
                            {selectedEvent.sourceIp && (
                                <div className="col-span-2">
                                    <span className="text-slate-500 block text-xs uppercase">Source IP / Host</span>
                                    <span className="text-slate-200 font-mono">{selectedEvent.sourceIp}</span>
                                </div>
                            )}
                            {selectedEvent.destIp && (
                                <div className="col-span-2">
                                    <span className="text-slate-500 block text-xs uppercase">Destination IP</span>
                                    <span className="text-slate-200 font-mono">{selectedEvent.destIp}</span>
                                </div>
                            )}

                            <div className="col-span-2">
                                <span className="text-slate-500 block text-xs uppercase">Description</span>
                                <span className="text-slate-300 font-mono text-xs">{selectedEvent.description}</span>
                            </div>
                            
                            {selectedEvent.rawPayload && (
                                <div className="col-span-2">
                                    <span className="text-slate-500 block text-xs uppercase">Payload</span>
                                    <div className="bg-black p-2 rounded mt-1 overflow-x-auto max-h-40">
                                        <pre className="text-green-500 font-mono text-xs">
                                            {selectedEvent.rawPayload}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-600 py-12">
                <FileText className="w-12 h-12 mb-2 opacity-20" />
                <p>Select an event node to view details</p>
            </div>
        )}

      </div>
    </div>
  );
}