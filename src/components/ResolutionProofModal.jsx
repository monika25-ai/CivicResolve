import React, { useState } from 'react';
import { CheckCircle2, X, ShieldCheck, Sparkles, Wrench } from 'lucide-react';

export default function ResolutionProofModal({
  isOpen,
  onClose,
  ticket,
  onConfirm
}) {
  const [proofNote, setProofNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !ticket) return null;

  // Department-specific resolution templates
  const presets = [
    {
      label: 'Water Main / Pipe Fix',
      text: 'CMWSSB emergency crew dispatched. Fractured main transmission line cut and replaced with new DI collar. Pressure normalized and roadway drained.',
    },
    {
      label: 'Open Manhole Capped',
      text: 'Emergency road safety team installed heavy-duty Grade 40 ductile iron frame and cover. Sealed with asphalt perimeter and barricades removed.',
    },
    {
      label: 'Garbage Cleared & Disinfected',
      text: 'GCC Solid Waste compactor cleared 3.5 tons of commercial waste. Bins washed and entire junction treated with lime/bleaching powder disinfectant.',
    },
    {
      label: 'Road Pothole Repaired',
      text: 'Hot-mix asphalt patch laid and compacted with vibratory roller. Surface level restored and verified safe for vehicular transit.',
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofNote.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(ticket.id, 'Resolved', proofNote.trim());
      onClose();
    } catch (err) {
      console.error('Error confirming resolution:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Official Resolution Verification Proof
            </h3>
            <p className="text-xs text-slate-400">
              Ticket <span className="font-mono font-semibold text-emerald-400">{ticket.ticketId}</span> ({ticket.category})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Field Resolution Proof & Official Action Taken <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              placeholder="Provide objective details of the fix, work order completion, field crew notes, or photographic verification..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Quick preset templates */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Action Templates
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProofNote(preset.text)}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:border-emerald-500/40 hover:bg-slate-800 transition-all"
                >
                  <span className="font-semibold text-emerald-400 block">{preset.label}</span>
                  <span className="line-clamp-1 text-[11px] text-slate-400">{preset.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !proofNote.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Saving Resolution Proof...' : 'Certify & Mark Resolved'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
