import { useState, useEffect } from 'react';
import { Shield, Plus, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Scan } from '../lib/supabase';
import { NewScanModal } from './NewScanModal';
import { ScansList } from './ScansList';
import { ScanDetails } from './ScanDetails';

const getInitialDarkMode = () => {
  if (typeof window !== 'undefined') {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
  }
  return false;
};

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadScans = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const handleScanCreated = (scan: Scan) => {
    setScans([scan, ...scans]);
    setSelectedScan(scan);
    setShowNewScanModal(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
      <header className={`${darkMode ? 'bg-neutral-900' : 'bg-white'} border-b ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl mb-4 shadow-md">
              <img 
                src="src/assets/AccessFixLogo.png" 
                alt="AccessFix Logo" 
                className="w-24 h-24 object-contain rounded-lg" 
              />
            </div>
              <div>
                <h1 className={`text-xl font-semibold ${darkMode ? 'text-neutral-100' : 'text-neutral-900'}`}>
                  AccessFix
                </h1>
                <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors ${
                  darkMode 
                    ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800' 
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleSignOut}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  darkMode 
                    ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800' 
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-neutral-100' : 'text-neutral-900'}`}>
              Accessibility Scans
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>
              Review issues and generate pull requests
            </p>
          </div>
          <button
            onClick={() => setShowNewScanModal(true)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              darkMode
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            New scan
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className={`animate-spin rounded-full h-8 w-8 border-2 border-transparent ${
              darkMode ? 'border-t-emerald-400' : 'border-t-emerald-600'
            }`}></div>
          </div>
        ) : scans.length === 0 ? (
          <div className={`rounded-lg border p-12 text-center ${
            darkMode 
              ? 'bg-neutral-900 border-neutral-800' 
              : 'bg-white border-neutral-200'
          }`}>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              darkMode ? 'bg-neutral-800' : 'bg-neutral-100'
            }`}>
              <Shield className={`w-8 h-8 ${darkMode ? 'text-neutral-600' : 'text-neutral-400'}`} />
            </div>
            <h3 className={`text-base font-semibold mb-1 ${
              darkMode ? 'text-neutral-200' : 'text-neutral-900'
            }`}>
              No scans yet
            </h3>
            <p className={`text-sm mb-6 ${darkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>
              Get started by creating your first accessibility scan
            </p>
            <button
              onClick={() => setShowNewScanModal(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                darkMode
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              Create first scan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ScansList
                scans={scans}
                selectedScan={selectedScan}
                onSelectScan={setSelectedScan}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedScan ? (
                <ScanDetails scan={selectedScan} onScanUpdated={loadScans} />
              ) : (
                <div className={`rounded-lg border p-12 text-center ${
                  darkMode 
                    ? 'bg-neutral-900 border-neutral-800' 
                    : 'bg-white border-neutral-200'
                }`}>
                  <p className={`text-sm ${darkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>
                    Select a scan to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showNewScanModal && (
        <NewScanModal
          onClose={() => setShowNewScanModal(false)}
          onScanCreated={handleScanCreated}
        />
      )}
    </div>
  );
}