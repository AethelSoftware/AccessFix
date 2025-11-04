import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, GitPullRequest, ExternalLink, Code, Download, Trash2 } from 'lucide-react';
import { Scan, Issue, supabase } from '../lib/supabase';
import { GeneratePRModal } from './GeneratePRModal';

interface ScanDetailsProps {
  scan: Scan;
  issues?: Issue[];
  onScanUpdated: () => void;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
  onPdfSuccess?: () => void;
  onDeleteScan?: () => void;
}

export function ScanDetails({ 
  scan, 
  issues: initialIssues, 
  onScanUpdated, 
  onDownloadPdf, 
  isGeneratingPdf,
  onPdfSuccess,
  onDeleteScan
}: ScanDetailsProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showPRModal, setShowPRModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [generatingPR, setGeneratingPR] = useState(false);

  // Calculate score if not provided
  const calculateAccessibilityScore = (issues: Issue[]) => {
    if (issues.length === 0) return { rating: 100, grade: 'A' };
    
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;
    
    let score = 100;
    score -= criticalCount * 10;
    score -= warningCount * 5;
    score -= infoCount * 2;
    
    score = Math.max(0, Math.min(100, score));
    
    let grade = 'A';
    if (score < 90) grade = 'B';
    if (score < 80) grade = 'C';
    if (score < 70) grade = 'D';
    if (score < 60) grade = 'F';
    
    return { rating: Math.round(score), grade };
  };

  const scoreData = scan.accessibility_score && scan.grade 
    ? { rating: scan.accessibility_score, grade: scan.grade }
    : calculateAccessibilityScore(issues);

  // Load issues whenever scan changes OR initialIssues are provided
  useEffect(() => {
    console.log('ScanDetails useEffect triggered', { 
      scanId: scan.id, 
      hasInitialIssues: !!initialIssues,
      initialIssuesLength: initialIssues?.length,
      isArray: Array.isArray(initialIssues),
      firstIssue: initialIssues?.[0]
    });
    
    // PRIORITY: Use initialIssues if provided (fresh scan)
    if (Array.isArray(initialIssues)) {
      console.log('✅ Using provided issues:', initialIssues.length, initialIssues);
      setIssues(initialIssues);
      if (initialIssues.length > 0) {
        setSelectedIssue(initialIssues[0]);
        console.log('✅ Set selected issue:', initialIssues[0]);
      } else {
        setSelectedIssue(null);
      }
      setLoading(false);
    } else {
      // Load from database (existing scan)
      console.log('📥 Loading issues from database for scan:', scan.id);
      loadIssues();
    }
  }, [scan.id, initialIssues]);

  const loadIssues = async () => {
    setLoading(true);
    try {
      console.log('Fetching issues from database...');
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('scan_id', scan.id)
        .order('severity', { ascending: false });

      if (error) {
        console.error('Error loading issues:', error);
        throw error;
      }
      
      console.log('Loaded issues from DB:', data?.length || 0);
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

  const handleGeneratePR = async (githubToken: string, githubRepo: string) => {
    try {
      setGeneratingPR(true);
      
      const { data, error } = await supabase.functions.invoke('generate-pr', {
        body: { 
          scanId: scan.id,
          githubToken: githubToken,
          githubRepo: githubRepo
        }
      });

      if (error) throw error;

      if (data.success) {
        alert(`✅ Pull request created successfully!\n\nPR #${data.prNumber}: ${data.prUrl}`);
        onScanUpdated(); // Refresh to show PR URL
      }
    } catch (error) {
      console.error('Error generating PR:', error);
      alert(`Error creating pull request: ${error.message}`);
    } finally {
      setGeneratingPR(false);
      setShowPRModal(false);
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
      default:
        return <Info className="w-5 h-5 text-slate-600" />;
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
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredIssues = issues.filter(issue =>
    filter === 'all' ? true : issue.severity === filter
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-slate-500 mt-4">Loading issues...</p>
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
                {scan.github_repo && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <GitPullRequest className="w-4 h-4" />
                    {scan.github_repo}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Delete Button */}
              {onDeleteScan && (
                <button
                  onClick={onDeleteScan}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Scan
                </button>
              )}

              {/* PDF Download Button */}
              <button
                onClick={onDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
              </button>

              {/* Generate PR Button */}
              {scan.github_repo && issues.length > 0 && (
                <button
                  onClick={() => setShowPRModal(true)}
                  disabled={generatingPR}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                >
                  <GitPullRequest className="w-5 h-5" />
                  {generatingPR ? 'Creating PR...' : 'Generate PR'}
                </button>
              )}
            </div>
          </div>

          {/* Scan Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Total Issues</p>
              <p className="text-2xl font-bold text-slate-900">{scan.total_issues || issues.length}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-900">{scan.critical_count || issues.filter(i => i.severity === 'critical').length}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-amber-600 mb-1">Warnings</p>
              <p className="text-2xl font-bold text-amber-900">{scan.warning_count || issues.filter(i => i.severity === 'warning').length}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Info</p>
              <p className="text-2xl font-bold text-blue-900">{scan.info_count || issues.filter(i => i.severity === 'info').length}</p>
            </div>
          </div>

          {/* Score Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Accessibility Score</p>
                <p className="text-2xl font-bold text-blue-900">
                  {scoreData.rating}/100 <span className="text-lg">({scoreData.grade})</span>
                </p>
              </div>
              {scan.pdf_report_url && (
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = scan.pdf_report_url;
                    link.download = `accessibility-scan-${scan.id}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    onPdfSuccess?.();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download PDF
                </button>
              )}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mt-4 flex-wrap">
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
              Critical ({scan.critical_count || issues.filter(i => i.severity === 'critical').length})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'warning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Warnings ({scan.warning_count || issues.filter(i => i.severity === 'warning').length})
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'info'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Info ({scan.info_count || issues.filter(i => i.severity === 'info').length})
            </button>
          </div>
        </div>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600">
              {issues.length === 0 ? 'No issues found! 🎉' : 'No issues found in this category'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-6 transition-colors ${
                  selectedIssue?.id === issue.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-semibold text-slate-900">{issue.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityBadge(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {issue.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">{issue.description}</p>
                    
                    {/* WCAG Criteria and Line Number */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      {issue.wcag_criteria && (
                        <span>WCAG: {issue.wcag_criteria}</span>
                      )}
                      {issue.line_number && (
                        <span>Line {issue.line_number}</span>
                      )}
                      {issue.selector && (
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                          {issue.selector}
                        </span>
                      )}
                    </div>

                    {/* Recommended Fix */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-900 mb-2">Recommended Fix:</p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {issue.recommended_fix}
                      </p>
                    </div>

                    {/* Code Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {issue.code_snippet && (
                        <div>
                          <p className="text-sm font-medium text-slate-900 mb-2">Current Code:</p>
                          <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto border border-slate-700">
                            <code>{issue.code_snippet}</code>
                          </pre>
                        </div>
                      )}

                      {issue.fixed_code && (
                        <div>
                          <p className="text-sm font-medium text-slate-900 mb-2">Suggested Fix:</p>
                          <pre className="text-xs bg-green-900 text-green-100 p-3 rounded-lg overflow-x-auto border border-green-700">
                            <code>{issue.fixed_code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate PR Modal */}
      {showPRModal && (
        <GeneratePRModal
          scan={scan}
          onClose={() => setShowPRModal(false)}
          onGenerate={handleGeneratePR}
          isLoading={generatingPR}
        />
      )}
    </>
  );
}