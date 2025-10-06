import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, GitPullRequest, ExternalLink, Code } from 'lucide-react';
import { Scan, Issue, supabase } from '../lib/supabase';
import { GeneratePRModal } from './GeneratePRModal';

interface ScanDetailsProps {
  scan: Scan;
  onScanUpdated: () => void;
}

export function ScanDetails({ scan, onScanUpdated }: ScanDetailsProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showPRModal, setShowPRModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  useEffect(() => {
    loadIssues();
  }, [scan.id]);

  const loadIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('scan_id', scan.id)
        .order('severity', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
      if (data && data.length > 0) {
        setSelectedIssue(data[0]);
      }
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const filteredIssues = issues.filter(issue =>
    filter === 'all' ? true : issue.severity === filter
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (scan.status === 'processing') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Scanning in Progress</h3>
        <p className="text-slate-600">This may take a few moments...</p>
      </div>
    );
  }

  if (scan.status === 'failed') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Scan Failed</h3>
        <p className="text-slate-600">There was an error processing this scan.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{scan.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                {scan.target_url && (
                  <a
                    href={scan.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {scan.target_url}
                  </a>
                )}
                {scan.file_name && (
                  <span className="flex items-center gap-1">
                    <Code className="w-4 h-4" />
                    {scan.file_name}
                  </span>
                )}
              </div>
            </div>
            {scan.github_repo && issues.length > 0 && (
              <button
                onClick={() => setShowPRModal(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <GitPullRequest className="w-5 h-5" />
                Generate PR
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Total Issues</p>
              <p className="text-2xl font-bold text-slate-900">{scan.total_issues}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-900">{scan.critical_count}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-amber-600 mb-1">Warnings</p>
              <p className="text-2xl font-bold text-amber-900">{scan.warning_count}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Info</p>
              <p className="text-2xl font-bold text-blue-900">{scan.info_count}</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({issues.length})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Critical ({scan.critical_count})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'warning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Warnings ({scan.warning_count})
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'info'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Info ({scan.info_count})
            </button>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600">No issues found in this category</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredIssues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`w-full p-6 text-left hover:bg-slate-50 transition-colors ${
                  selectedIssue?.id === issue.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900">{issue.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityBadge(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
                    {issue.line_number && (
                      <p className="text-xs text-slate-500">Line {issue.line_number}</p>
                    )}
                    {issue.wcag_criteria && (
                      <p className="text-xs text-slate-500 mt-1">{issue.wcag_criteria}</p>
                    )}

                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-900 mb-2">Recommended Fix:</p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{issue.recommended_fix}</p>
                    </div>

                    {issue.code_snippet && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-900 mb-2">Current Code:</p>
                        <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">
                          <code>{issue.code_snippet}</code>
                        </pre>
                      </div>
                    )}

                    {issue.fixed_code && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-900 mb-2">Suggested Fix:</p>
                        <pre className="text-xs bg-green-900 text-green-100 p-3 rounded-lg overflow-x-auto">
                          <code>{issue.fixed_code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showPRModal && (
        <GeneratePRModal
          scan={scan}
          onClose={() => setShowPRModal(false)}
          onSuccess={onScanUpdated}
        />
      )}
    </>
  );
}
