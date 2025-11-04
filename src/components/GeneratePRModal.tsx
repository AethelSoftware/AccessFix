import { useState } from 'react';
import { X, GitPullRequest, AlertCircle, Github, ExternalLink, CheckCircle } from 'lucide-react';
import { Scan } from '../lib/supabase';

interface GeneratePRModalProps {
  scan: Scan;
  onClose: () => void;
  onGenerate: (githubToken: string, githubRepo: string) => void;
  isLoading: boolean;
}

export function GeneratePRModal({ scan, onClose, onGenerate, isLoading }: GeneratePRModalProps) {
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState(scan.github_repo || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ prUrl: string; prNumber: number } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!githubToken.trim() || !githubRepo.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    onGenerate(githubToken.trim(), githubRepo.trim());
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Pull Request Created!
            </h3>
            <p className="text-slate-600 mb-4">
              Successfully created PR #{success.prNumber} with accessibility fixes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <a
                href={success.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View PR
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <GitPullRequest className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Generate Pull Request</h3>
              <p className="text-sm text-slate-600">Create a PR with accessibility fixes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              GitHub Repository
            </label>
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="owner/repo-name"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Format: username/repository or organization/repository
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-slate-500 mt-2">
              Required to create pull requests. Generate one in GitHub Settings → Developer settings → Personal access tokens
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Required Permissions</p>
                <p className="text-amber-700">
                  Your token needs: <strong>repo</strong> scope to create branches and pull requests
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">What will happen:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Create a new branch with accessibility fixes</li>
                <li>Generate a detailed PR description</li>
                <li>Create pull request against default branch</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!githubToken.trim() || !githubRepo.trim() || isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors"
            >
              {isLoading ? 'Creating PR...' : 'Generate Pull Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}