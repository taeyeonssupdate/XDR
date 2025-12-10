import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { UnifiedEvent, EventSource, Severity } from '../types';

interface TimelineTopologyProps {
  events: UnifiedEvent[];
  onEventClick: (event: UnifiedEvent) => void;
  timezone: string;
}

const TimelineTopology: React.FC<TimelineTopologyProps> = ({ events, onEventClick, timezone }) => {
  
  // Transform data for the chart
  const data = events.map(e => ({
    ...e,
    x: new Date(e.timestamp).getTime(),
    y: e.source === EventSource.EDR ? 2 : 1, // Separate EDR (top) and NDR (bottom) visually
    z: e.severity === Severity.CRITICAL ? 200 : e.severity === Severity.HIGH ? 150 : 100, // Bubble size by severity
    color: e.source === EventSource.EDR ? '#8b5cf6' : '#0ea5e9', // Violet for EDR, Sky for NDR
  }));

  const formatXAxis = (tickItem: number) => {
    return new Date(tickItem).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZone: timezone 
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl text-xs z-50">
          <p className="font-bold text-white">{data.eventType}</p>
          <p className="text-slate-300">{data.vendor} ({data.source})</p>
          <p className="text-slate-400">{new Date(data.timestamp).toLocaleString(undefined, { timeZone: timezone })}</p>
          <p className={`mt-1 font-semibold ${
            data.severity === Severity.CRITICAL ? 'text-red-500' : 'text-yellow-500'
          }`}>{data.severity}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96 bg-slate-900/50 rounded-lg border border-slate-800 p-4 relative">
      <h3 className="text-sm font-semibold text-slate-400 absolute top-4 left-4">Attack Timeline Topology ({timezone})</h3>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-12 text-xs text-slate-500 font-bold">
        <span>EDR Layer</span>
        <span>NDR Layer</span>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
          <XAxis 
            type="number" 
            dataKey="x" 
            domain={['auto', 'auto']} 
            tickFormatter={formatXAxis} 
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            domain={[0, 3]} 
            tick={false} 
            axisLine={false}
          />
          <ZAxis type="number" dataKey="z" range={[50, 400]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <ReferenceLine y={1.5} stroke="#334155" strokeDasharray="3 3" />
          <Scatter name="Events" data={data} onClick={(data) => onEventClick(data.payload)}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimelineTopology;