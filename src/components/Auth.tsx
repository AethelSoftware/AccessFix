// src/pages/Auth.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Mail, ArrowLeft, Github } from 'lucide-react'; // ✅ Add GitHub icon

const MARKETING_IMAGE_URL = '/assets/pizza.jpeg';

interface EmailConfirmationProps {
  email: string;
  resetView: () => void;
}

function EmailConfirmation({ email, resetView }: EmailConfirmationProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-[#ccccc3] z-10 relative">
      <div className="max-w-md w-full relative text-center">
        <div className="bg-[#9ba3a5] rounded-2xl shadow-xl p-8 border border-slate-400">
          <Mail className="w-16 h-16 text-[#a0bac1] mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Check Your Email!</h2>
          <p className="text-white mb-6">
            We've sent a <span className="font-bold">verification link</span> to{' '}
            <span className="font-semibold text-slate-900 break-all">{email}</span>. Please click the link to confirm your account.
          </p>
          <button
            onClick={resetView}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { signIn, signUp, signInWithGitHub } = useAuth(); // ✅ Include GitHub

  const resetAuthView = () => {
    setShowConfirmation(false);
    setIsSignUp(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setShowConfirmation(true);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle GitHub login
  const handleGitHubLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGitHub();
    } catch (err: any) {
      setError(err.message || 'GitHub login failed.');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="h-screen flex">
        <EmailConfirmation email={email} resetView={resetAuthView} />
        <div className="hidden lg:block lg:w-1/2 relative">
          <img src={MARKETING_IMAGE_URL} alt="Abstract representation of code accessibility" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900 bg-opacity-60 flex items-end p-12">
            <div>
              <blockquote className="text-white text-3xl font-extrabold leading-snug mb-6">
                "Build a web that works for everyone. <span className="text-blue-300">Automated accessibility</span>, zero friction."
              </blockquote>
              <p className="text-slate-300 text-lg font-medium">
                AccessFix seamlessly integrates into your CI/CD pipeline, catching compliance issues before they ever hit production.
              </p>
              <div className="mt-6">
                <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                  AccessFix | Automated Compliance
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-[#ccccc3] z-10 relative">
        <div className="max-w-md w-full relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl mb-4 shadow-md">
              <img src="/assets/AccessFixLogo.png" alt="AccessFix Logo" className="w-24 h-24 object-contain rounded-lg" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to AccessFix</h1>
            <p className="text-slate-600">Securely access your automated accessibility dashboard.</p>
          </div>

          <div className="bg-[#9ba3a5] rounded-2xl shadow-xl p-8 border border-slate-400">
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  !isSignUp ? 'bg-[#a0bac1] hover:bg-[#83999e] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isSignUp ? 'bg-[#a0bac1] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                  placeholder="minimum 6 characters"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#a0bac1] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#7f949a] focus:ring-4 focus:ring-[#a0bac1] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#a0bac1]/30"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In to Dashboard'}
              </button>

              {/* ✅ GitHub OAuth Button */}
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-slate-300"></div>
                <span className="mx-2 text-sm text-slate-500">or</span>
                <div className="flex-grow border-t border-slate-300"></div>
              </div>

              <button
                type="button"
                onClick={handleGitHubLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-slate-800 focus:ring-4 focus:ring-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={MARKETING_IMAGE_URL} alt="Marketing visual" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900 bg-opacity-60 flex items-end p-12">
          <div>
            <blockquote className="text-white text-3xl font-extrabold leading-snug mb-6">
              "Build a web that works for everyone. <span className="text-blue-300">Automated accessibility</span>, zero friction."
            </blockquote>
            <p className="text-slate-300 text-lg font-medium">
              AccessFix seamlessly integrates into your CI/CD pipeline, catching compliance issues before they ever hit production.
            </p>
            <div className="mt-6">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                AccessFix | Automated Compliance
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
