import React from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  MapPin, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Users, 
  Eye, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  History 
} from 'lucide-react';
import { getEvidenceFallback } from '../constants/presets';

export default function TicketDetailModal({ isOpen, onClose, ticket }) {
  if (!isOpen || !ticket) return null;

  // 4 steps definition
  const steps = [
    { key: 'Reported', label: 'Reported', desc: 'Lodged by citizen' },
    { key: 'AI Verified', label: 'AI Verified', desc: 'Gemini 2.5 Flash Triage' },
    { key: 'In Progress', label: 'In Progress', desc: 'Dispatched to field crew' },
    { key: 'Resolved', label: 'Resolved', desc: 'Verified & certified' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Reported': return 0;
      case 'AI Verified': return 1;
      case 'In Progress': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(ticket.status);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40 ring-2 ring-rose-500/20 animate-pulse';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Low':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header Ribbon */}
        <div className="p-6 bg-slate-850 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-base font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                {ticket.ticketId}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getPriorityStyle(ticket.priority)}`}>
                {ticket.priority} Priority
              </span>
              {ticket.reportCount > 1 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {ticket.reportCount} Clustered Reports
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              {ticket.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{ticket.location}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Progress Tracker */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Ticket Lifecycle Progress (4 Stages)
          </div>
          <div className="grid grid-cols-4 gap-2 relative">
            {steps.map((st, i) => {
              const isPassed = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={st.key} className="flex flex-col items-center text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30 scale-105'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-bold mt-1.5 ${isCurrent ? 'text-indigo-400' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                    {st.label}
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:block">
                    {st.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">

          {/* Gemini AI Triage Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-800/50 to-slate-800/80 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Gemini 2.5 Flash Triage Assessment
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SLA: {ticket.slaHours || 24} Hours
              </span>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Official Municipal Work Order Summary
              </div>
              <p className="text-sm font-medium text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                {ticket.officialSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/40">
                <span className="text-slate-400 block mb-0.5">Assigned Department</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  {ticket.department}
                </span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/40">
                <span className="text-slate-400 block mb-0.5">Civic Category</span>
                <span className="font-semibold text-slate-200">
                  {ticket.category}
                </span>
              </div>
            </div>

            {/* AI Image Verification Note */}
            {ticket.imageVerificationNote && (
              <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/30 text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                  <Eye className="w-3.5 h-3.5" />
                  Image Verification Note
                </span>
                <p className="text-slate-300 leading-normal">
                  {ticket.imageVerificationNote}
                </p>
              </div>
            )}
          </div>

          {/* Citizen's Original Input */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Citizen's Original Lodged Description
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-300 italic">
              "{ticket.description}"
            </div>
          </div>

          {/* Resolution Proof Note (if Resolved) */}
          {ticket.status === 'Resolved' && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Official AI Resolution Proof & Certification
              </div>
              <p className="text-sm text-emerald-200 font-medium">
                {ticket.resolutionProof || 'Certified resolved and inspected by Municipal Engineering Authority.'}
              </p>
            </div>
          )}

          {/* Photographic Evidence */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Photographic / Visual Evidence</span>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified Evidence
              </span>
            </h4>
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-80 flex items-center justify-center p-2">
              <img
                src={ticket.imageBase64 || getEvidenceFallback(ticket.category || ticket.title)}
                alt="Issue visual proof"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getEvidenceFallback(ticket.category || ticket.title);
                }}
                className="w-full h-auto max-h-76 object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Duplicate Cluster List */}
          {ticket.duplicateReports && ticket.duplicateReports.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Duplicate Reports Clustered ({ticket.duplicateReports.length})
              </h4>
              <div className="space-y-2">
                {ticket.duplicateReports.map((dup, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-800/50 border border-purple-500/20 text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-semibold text-purple-300">Citizen Report #{idx + 2}</span>
                      <span>{new Date(dup.reportedAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 italic">"{dup.description}"</p>
                    {dup.location && (
                      <span className="text-[11px] text-slate-500 block mt-1">Location: {dup.location}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Timeline History */}
          {ticket.statusHistory && ticket.statusHistory.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Audit Trail & History
              </h4>
              <div className="space-y-2 border-l-2 border-slate-700 ml-2 pl-3">
                {ticket.statusHistory.map((hist, idx) => (
                  <div key={idx} className="text-xs space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-300">{hist.status}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{hist.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
