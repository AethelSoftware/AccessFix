import { Clock, CheckCircle, AlertCircle, XCircle, CheckSquare, Square, Trash2 } from 'lucide-react';
import { Scan } from '../lib/supabase';

interface ScansListProps {
  scans: Scan[];
  selectedScan: Scan | null;
  onSelectScan: (scan: Scan) => void;
  selectedScans: Set<string>;
  onToggleScanSelection: (scanId: string) => void;
  onSelectAllScans: () => void;
  onDeleteScan: (scanId: string) => void;
  deletingScans: string[];
}

export function ScansList({
  scans,
  selectedScan,
  onSelectScan,
  selectedScans,
  onToggleScanSelection,
  onSelectAllScans,
  onDeleteScan,
  deletingScans,
}: ScansListProps) {
  const allSelected = scans.length > 0 && selectedScans.size === scans.length;

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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header with select all */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onSelectAllScans}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5 text-slate-400" />
            )}
            <span>
              {allSelected ? 'Deselect All' : 'Select All'} 
              {selectedScans.size > 0 && ` (${selectedScans.size})`}
            </span>
          </button>
        </div>
      </div>

      {/* Scans list */}
      <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
        {scans.map((scan) => (
          <div
            key={scan.id}
            className={`p-4 cursor-pointer transition-colors group ${
              selectedScan?.id === scan.id
                ? 'bg-blue-50 border-r-2 border-r-blue-600'
                : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleScanSelection(scan.id);
                }}
                className="mt-0.5 flex-shrink-0"
              >
                {selectedScans.has(scan.id) ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                )}
              </button>

              {/* Scan info */}
              <div 
                className="flex-1 min-w-0"
                onClick={() => onSelectScan(scan)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 truncate">
                      {scan.name}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1 truncate">
                      {scan.target_url || scan.file_name}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className={`px-2 py-1 rounded-full ${
                        scan.status === 'completed' ? 'bg-green-100 text-green-800' :
                        scan.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {scan.status}
                      </span>
                      <span>Issues: {scan.total_issues || 0}</span>
                      {scan.github_repo && (
                        <span className="text-blue-600">GitHub</span>
                      )}
                    </div>
                  </div>

                  {/* Status icon and delete button */}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(scan.status)}
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteScan(scan.id);
                      }}
                      disabled={deletingScans.includes(scan.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 disabled:opacity-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Issue counts for completed scans */}
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

                {/* Loading state for deletion */}
                {deletingScans.includes(scan.id) && (
                  <div className="mt-2 text-xs text-slate-500">
                    Deleting...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}