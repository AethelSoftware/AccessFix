import { useState } from 'react';
import { X, GitPullRequest, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Scan } from '../lib/supabase';

interface GeneratePRModalProps {
  scan: Scan;
  onClose: () => void;
  onSuccess: () => void;
}

export function GeneratePRModal({ scan, onClose, onSuccess }: GeneratePRModalProps) {
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState(scan.github_repo || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ prUrl: string; prNumber: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pr`;
      const { data: { session } } = await (await import('../lib/supabase')).supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scanId: scan.id,
          githubToken,
          githubRepo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate PR');
      }

      const { prUrl, prNumber } = await response.json();
      setSuccess({ prUrl, prNumber });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Pull Request Created!</h2>
            <p className="text-slate-600 mb-6">
              Your accessibility fixes have been submitted as PR #{success.prNumber}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <a
                href={success.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                View PR
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Generate Pull Request</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <GitPullRequest className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">About GitHub Token</p>
                <p>
                  You'll need a GitHub Personal Access Token with <code className="bg-blue-100 px-1 rounded">repo</code> permissions.{' '}
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=AccessFix"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    Create one here
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="github-repo" className="block text-sm font-medium text-slate-700 mb-1">
              GitHub Repository
            </label>
            <input
              id="github-repo"
              type="text"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="username/repository"
            />
            <p className="text-xs text-slate-500 mt-1">
              Format: owner/repo (e.g., facebook/react)
            </p>
          </div>

          <div>
            <label htmlFor="github-token" className="block text-sm font-medium text-slate-700 mb-1">
              GitHub Personal Access Token
            </label>
            <input
              id="github-token"
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your token is only used for this request and is never stored
            </p>
          </div>

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
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating PR...' : 'Generate Pull Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
