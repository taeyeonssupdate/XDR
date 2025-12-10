import React from 'react';
import { IntegrationConfig } from '../types';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

interface Props {
  config: IntegrationConfig;
}

export const IntegrationCard: React.FC<Props> = ({ config }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-cyber-success" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-cyber-danger" />;
      case 'disconnected': return <XCircle className="w-5 h-5 text-slate-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-cyber-800 border border-cyber-700 rounded p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded bg-cyber-900 ${config.type === 'EDR' ? 'text-purple-400' : config.type === 'NDR' ? 'text-sky-400' : 'text-green-400'}`}>
           <span className="font-bold text-xs">{config.type}</span>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-slate-200">{config.name}</h4>
          <p className="text-xs text-slate-500">Last synced: {config.lastSync}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-xs px-2 py-1 rounded-full bg-cyber-900 border ${
            config.status === 'active' ? 'border-cyber-success text-cyber-success' : 'border-cyber-danger text-cyber-danger'
        }`}>
            {config.status}
        </span>
        <button className="text-slate-400 hover:text-white transition">
            <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};