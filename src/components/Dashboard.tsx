import { useState, useEffect } from 'react';
import { Shield, Plus, LogOut, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Scan, Issue } from '../lib/supabase';
import { NewScanModal } from './NewScanModal';
import { ScansList } from './ScansList';
import { ScanDetails } from './ScanDetails';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [issuesByScan, setIssuesByScan] = useState<Record<string, Issue[]>>({});
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

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

  const handleScanCreated = (scan: Scan, issues: Issue[]) => {
    console.log('New scan created:', scan.id, 'with issues:', issues.length);
    
    // Add scan to list
    setScans(prev => [scan, ...prev]);
    
    // Store issues immediately
    setIssuesByScan(prev => {
      const updated = { ...prev, [scan.id]: issues };
      console.log('Updated issuesByScan:', updated);
      return updated;
    });
    
    // Select the new scan
    setSelectedScan(scan);
    
    // Close modal
    setShowNewScanModal(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const generatePdfReport = async (scanId: string) => {
    try {
      setGeneratingPdf(scanId);
      
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: { scan_id: scanId }
      });

      if (error) throw error;

      // Update the scan with the new PDF URL
      await loadScans();
      
      // Download the PDF
      if (data.pdf_report_url) {
        window.open(data.pdf_report_url, '_blank');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setGeneratingPdf(null);
    }
  };

  const downloadPdfReport = (scan: Scan) => {
    if (scan.pdf_report_url) {
      // If PDF already exists, download it directly
      window.open(scan.pdf_report_url, '_blank');
    } else {
      // Generate new PDF
      generatePdfReport(scan.id);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-md">
                <img
                  src="/assets/AccessFixLogo.png"
                  alt="AccessFix Logo"
                  className="w-20 h-20 object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-800">AccessFix</h1>
                <p className="text-xs text-neutral-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-800">Accessibility Scans</h2>
            <p className="text-sm mt-1 text-neutral-500">
              Review issues and generate pull requests
            </p>
          </div>
          <button
            onClick={() => setShowNewScanModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New scan
          </button>
        </div>

        {/* Scans */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-emerald-600"></div>
          </div>
        ) : scans.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-neutral-100">
              <Shield className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-base font-semibold mb-1 text-neutral-800">No scans yet</h3>
            <p className="text-sm mb-6 text-neutral-500">
              Get started by creating your first accessibility scan
            </p>
            <button
              onClick={() => setShowNewScanModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
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
                <ScanDetails
                  key={selectedScan.id}
                  scan={selectedScan}
                  issues={issuesByScan[selectedScan.id]}
                  onScanUpdated={loadScans}
                  onDownloadPdf={() => downloadPdfReport(selectedScan)}
                  isGeneratingPdf={generatingPdf === selectedScan.id}
                />
              ) : (
                <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center shadow-sm">
                  <p className="text-sm text-neutral-500">Select a scan to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showNewScanModal && (
        <NewScanModal
          onClose={() => setShowNewScanModal(false)}
          onScanCreated={handleScanCreated}
        />
      )}
    </div>
  );
}
