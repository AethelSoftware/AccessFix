import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Scan } from '../lib/supabase';

interface ScansListProps {
  scans: Scan[];
  selectedScan: Scan | null;
  onSelectScan: (scan: Scan) => void;
}

export function ScansList({ scans, selectedScan, onSelectScan }: ScansListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSeverityColor = (count: number, type: 'critical' | 'warning' | 'info') => {
    if (count === 0) return 'text-slate-400';
    switch (type) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-amber-600';
      case 'info':
        return 'text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Recent Scans</h3>
      </div>
      <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
        {scans.map((scan) => (
          <button
            key={scan.id}
            onClick={() => onSelectScan(scan)}
            className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
              selectedScan?.id === scan.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 truncate">{scan.name}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(scan.created_at).toLocaleDateString()} at{' '}
                  {new Date(scan.created_at).toLocaleTimeString()}
                </p>
              </div>
              {getStatusIcon(scan.status)}
            </div>

            {scan.status === 'completed' && (
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-semibold ${getSeverityColor(scan.critical_count, 'critical')}`}>
                    {scan.critical_count}
                  </span>
                  <span className="text-xs text-slate-500">critical</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-semibold ${getSeverityColor(scan.warning_count, 'warning')}`}>
                    {scan.warning_count}
                  </span>
                  <span className="text-xs text-slate-500">warnings</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-semibold ${getSeverityColor(scan.info_count, 'info')}`}>
                    {scan.info_count}
                  </span>
                  <span className="text-xs text-slate-500">info</span>
                </div>
              </div>
            )}

            {scan.status === 'processing' && (
              <div className="mt-2">
                <span className="text-sm text-blue-600">Scanning in progress...</span>
              </div>
            )}

            {scan.status === 'failed' && (
              <div className="mt-2">
                <span className="text-sm text-red-600">Scan failed</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
