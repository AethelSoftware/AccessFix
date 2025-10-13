import { useEffect, useState } from 'react';
import { X, Upload, Link as LinkIcon, GitBranch, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Scan, supabase } from '../lib/supabase';

interface NewScanModalProps {
  onClose: () => void;
  onScanCreated: (scan: Scan) => void;
}

export function NewScanModal({ onClose, onScanCreated }: NewScanModalProps) {
  const { user } = useAuth();
  const [scanType, setScanType] = useState<'url' | 'file' | 'github'>('url');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Fetch user's GitHub repos if signed in with GitHub ---
  useEffect(() => {
    const fetchRepos = async () => {
      if (!user) return;
      const { data: { session } } = await supabase.auth.getSession();
      const providerToken = session?.provider_token; // available for OAuth logins
      if (!providerToken) return;

      try {
        const res = await fetch('https://api.github.com/user/repos?per_page=100', {
          headers: { Authorization: `Bearer ${providerToken}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setGithubRepos(data);
      } catch (err) {
        console.error('GitHub repo fetch failed:', err);
      }
    };
    fetchRepos();
  }, [user]);

  // --- Submit new scan ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let htmlContent = '';

      if (scanType === 'file' && file) {
        htmlContent = await file.text();
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-accessibility`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scanType,
          targetUrl: scanType === 'url' ? url : undefined,
          htmlContent: scanType === 'file' ? htmlContent : undefined,
          name,
          githubRepo: scanType === 'github' ? selectedRepo : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create scan');
      }

      const { scan } = await response.json();
      onScanCreated(scan);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">New Accessibility Scan</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="scan-name" className="block text-sm font-medium text-slate-700 mb-1">
              Scan Name
            </label>
            <input
              id="scan-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="My Website Homepage"
            />
          </div>

          {/* Scan Type Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Scan Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'url', icon: LinkIcon, label: 'URL' },
                { type: 'file', icon: Upload, label: 'File' },
                { type: 'github', icon: GitBranch, label: 'GitHub' },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setScanType(type as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    scanType === type
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 mx-auto mb-2 ${
                      scanType === type ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      scanType === type ? 'text-blue-900' : 'text-slate-700'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* URL / File / GitHub Inputs */}
          {scanType === 'url' && (
            <div>
              <label htmlFor="scan-url" className="block text-sm font-medium text-slate-700 mb-1">
                Website URL
              </label>
              <input
                id="scan-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          )}

          {scanType === 'file' && (
            <div>
              <label htmlFor="scan-file" className="block text-sm font-medium text-slate-700 mb-1">
                HTML File
              </label>
              <input
                id="scan-file"
                type="file"
                accept=".html,.htm"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {scanType === 'github' && (
            <div>
              <label htmlFor="github-repo" className="block text-sm font-medium text-slate-700 mb-1">
                GitHub Repository
              </label>
              {githubRepos.length > 0 ? (
                <select
                  id="github-repo"
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a repository...</option>
                  {githubRepos.map((repo) => (
                    <option key={repo.id} value={repo.full_name}>
                      {repo.full_name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  {user ? 'No repositories found or GitHub token unavailable.' : 'Sign in with GitHub to see repos.'}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Scanning...' : 'Start Scan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
