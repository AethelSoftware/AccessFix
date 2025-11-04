import { useState, useEffect } from 'react';
import { Shield, Plus, LogOut, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Scan, Issue } from '../lib/supabase';
import { NewScanModal } from './NewScanModal';
import { ScansList } from './ScansList';
import { ScanDetails } from './ScanDetails';

// PDF Success Modal Component
function PdfSuccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Download className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            PDF Downloaded Successfully!
          </h3>
          <p className="text-slate-600 mb-6">
            Your accessibility scan report has been downloaded to your browser.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [showPdfSuccessModal, setShowPdfSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [issuesByScan, setIssuesByScan] = useState<Record<string, Issue[]>>({});
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [deletingScans, setDeletingScans] = useState<string[]>([]);
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());

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
      
      console.log('🔄 Sending request to function with scan_id:', scanId);
      
      // Get the current session to include auth headers
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to generate PDF reports');
      }
  
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: { scan_id: scanId },
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
  
      console.log('📨 Response received:', { data, error });
  
      if (error) {
        console.error('❌ Function error details:', error);
        throw new Error(`PDF generation failed: ${error.message}`);
      }
  
      console.log('✅ Function success:', data);
      
      if (data.success) {
        // Force download the PDF
        if (data.pdf_report_url) {
          const link = document.createElement('a');
          link.href = data.pdf_report_url;
          link.download = `accessibility-scan-${scanId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setShowPdfSuccessModal(true);
        }
        
        // Refresh scans to show updated data
        await loadScans();
      } else {
        throw new Error(data.error || 'Unknown error from PDF service');
      }
  
    } catch (error) {
      console.error('💥 Error in generatePdfReport:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setGeneratingPdf(null);
    }
  };

  const downloadPdfReport = (scan: Scan) => {
    if (scan.pdf_report_url) {
      // If PDF already exists, download it directly
      const link = document.createElement('a');
      link.href = scan.pdf_report_url;
      link.download = `accessibility-scan-${scan.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowPdfSuccessModal(true);
    } else {
      // Generate new PDF
      generatePdfReport(scan.id);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    if (!confirm('Are you sure you want to delete this scan? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingScans(prev => [...prev, scanId]);

      // Delete the scan (this will cascade to issues due to foreign key)
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      // Remove from selected scans if it was selected
      const newSelected = new Set(selectedScans);
      newSelected.delete(scanId);
      setSelectedScans(newSelected);

      // Remove from scans list
      setScans(prev => prev.filter(scan => scan.id !== scanId));
      
      // Clear selection if the deleted scan was selected
      if (selectedScan?.id === scanId) {
        setSelectedScan(null);
      }

      console.log('✅ Scan deleted successfully');
    } catch (error) {
      console.error('Error deleting scan:', error);
      alert('Error deleting scan. Please try again.');
    } finally {
      setDeletingScans(prev => prev.filter(id => id !== scanId));
    }
  };

  const handleDeleteSelectedScans = async () => {
    if (selectedScans.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedScans.size} selected scans? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingScans(Array.from(selectedScans));

      // Delete selected scans
      const { error } = await supabase
        .from('scans')
        .delete()
        .in('id', Array.from(selectedScans));

      if (error) throw error;

      // Update scans list
      setScans(prev => prev.filter(scan => !selectedScans.has(scan.id)));
      
      // Clear selection
      setSelectedScans(new Set());
      
      // Clear selected scan if it was deleted
      if (selectedScan && selectedScans.has(selectedScan.id)) {
        setSelectedScan(null);
      }

      console.log(`✅ ${selectedScans.size} scans deleted successfully`);
    } catch (error) {
      console.error('Error deleting scans:', error);
      alert('Error deleting scans. Please try again.');
    } finally {
      setDeletingScans([]);
    }
  };

  const toggleScanSelection = (scanId: string) => {
    const newSelected = new Set(selectedScans);
    if (newSelected.has(scanId)) {
      newSelected.delete(scanId);
    } else {
      newSelected.add(scanId);
    }
    setSelectedScans(newSelected);
  };

  const selectAllScans = () => {
    if (selectedScans.size === scans.length) {
      setSelectedScans(new Set());
    } else {
      setSelectedScans(new Set(scans.map(scan => scan.id)));
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
          <div className="flex items-center gap-3">
            {/* Bulk Delete Button */}
            {selectedScans.size > 0 && (
              <button
                onClick={handleDeleteSelectedScans}
                disabled={deletingScans.length > 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedScans.size})
              </button>
            )}
            
            {/* New Scan Button */}
            <button
              onClick={() => setShowNewScanModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New scan
            </button>
          </div>
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
                selectedScans={selectedScans}
                onToggleScanSelection={toggleScanSelection}
                onSelectAllScans={selectAllScans}
                onDeleteScan={handleDeleteScan}
                deletingScans={deletingScans}
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
                  onPdfSuccess={() => setShowPdfSuccessModal(true)}
                  onDeleteScan={() => handleDeleteScan(selectedScan.id)}
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

      {/* New Scan Modal */}
      {showNewScanModal && (
        <NewScanModal
          onClose={() => setShowNewScanModal(false)}
          onScanCreated={handleScanCreated}
        />
      )}

      {/* PDF Success Modal */}
      <PdfSuccessModal 
        isOpen={showPdfSuccessModal} 
        onClose={() => setShowPdfSuccessModal(false)} 
      />
    </div>
  );
}