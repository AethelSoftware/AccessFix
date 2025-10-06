import { useState, useEffect } from 'react';
import { Shield, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Scan } from '../lib/supabase';
import { NewScanModal } from './NewScanModal';
import { ScansList } from './ScansList';
import { ScanDetails } from './ScanDetails';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AccessFix</h1>
                <p className="text-sm text-slate-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Scans</h2>
            <p className="text-slate-600 mt-1">Review accessibility issues and generate PRs</p>
          </div>
          <button
            onClick={() => setShowNewScanModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Scan
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : scans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No scans yet</h3>
            <p className="text-slate-600 mb-6">
              Create your first accessibility scan to get started
            </p>
            <button
              onClick={() => setShowNewScanModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Scan
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
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <p className="text-slate-600">Select a scan to view details</p>
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
