import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CitizenPortal from './components/CitizenPortal';
import AdminHub from './components/AdminHub';
import ResolutionProofModal from './components/ResolutionProofModal';
import TicketDetailModal from './components/TicketDetailModal';
import { 
  subscribeToComplaints, 
  updateComplaintStatus, 
  reassignDepartment 
} from './services/firestore';
import { Sparkles, Building2, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  // Navigation view: 'citizen' or 'admin'
  const [activeView, setActiveView] = useState('citizen');

  // Real-time complaints state
  const [complaints, setComplaints] = useState([]);
  const [isOnline, setIsOnline] = useState(true);

  // Modals state
  const [resolutionModalTicket, setResolutionModalTicket] = useState(null);
  const [detailModalTicket, setDetailModalTicket] = useState(null);

  // Notification toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Show toast helper
  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Subscribe to Firestore complaints collection in real-time
  useEffect(() => {
    const unsubscribe = subscribeToComplaints((data, meta) => {
      if (Array.isArray(data)) {
        setComplaints(data);
      }
      if (meta && typeof meta.isOnline === 'boolean') {
        setIsOnline(meta.isOnline);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update Status handler
  const handleUpdateStatus = async (ticketId, newStatus, proofNote = null) => {
    try {
      const updated = await updateComplaintStatus(ticketId, newStatus, proofNote);
      if (updated) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === ticketId || c.ticketId === ticketId ? updated : c))
        );
        showToast(
          `Ticket #${updated.ticketId} marked as "${newStatus}"${proofNote ? ' with verified resolution proof!' : '.'}`,
          'success'
        );
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      showToast('Could not update status. Please try again.', 'error');
    }
  };

  // Reassign Department handler
  const handleReassignDepartment = async (ticketId, newDepartment) => {
    try {
      const updated = await reassignDepartment(ticketId, newDepartment);
      if (updated) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === ticketId || c.ticketId === ticketId ? updated : c))
        );
        showToast(
          `Ticket #${updated.ticketId} reassigned to ${newDepartment}`,
          'info'
        );
      }
    } catch (err) {
      console.error('Failed to reassign department:', err);
      showToast('Could not reassign department. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 backdrop-blur-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-300 border-rose-500/40 shadow-rose-500/20'
              : 'bg-indigo-950/90 text-indigo-300 border-indigo-500/40 shadow-indigo-500/20'
          }`}>
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* Clean Dual-View Navigation Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        complaints={complaints}
        isOnline={isOnline}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'citizen' ? (
          <CitizenPortal
            complaints={complaints}
            onViewTicketDetails={(t) => setDetailModalTicket(t)}
          />
        ) : (
          <AdminHub
            complaints={complaints}
            onUpdateStatus={handleUpdateStatus}
            onReassignDepartment={handleReassignDepartment}
            onOpenResolutionModal={(t) => setResolutionModalTicket(t)}
            onViewTicketDetails={(t) => setDetailModalTicket(t)}
          />
        )}
      </main>

      {/* Modal 1: AI Resolution Proof Note Modal */}
      <ResolutionProofModal
        isOpen={Boolean(resolutionModalTicket)}
        onClose={() => setResolutionModalTicket(null)}
        ticket={resolutionModalTicket}
        onConfirm={handleUpdateStatus}
      />

      {/* Modal 2: Complete Ticket Detail & AI Audit Modal */}
      <TicketDetailModal
        isOpen={Boolean(detailModalTicket)}
        onClose={() => setDetailModalTicket(null)}
        ticket={detailModalTicket}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 text-xs text-slate-500 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">CivicResolve Platform</span>
            <span>•</span>
            <span>Greater Chennai Corporation & Municipal Administration</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Powered by <strong className="text-indigo-400">Gemini 2.5 Flash</strong></span>
            <span>•</span>
            <span>Firestore Realtime Sync</span>
            <span>•</span>
            <span>Tamil & Tanglish NLP Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
