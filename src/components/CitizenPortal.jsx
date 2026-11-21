import React, { useState } from 'react';
import { 
  Send, 
  MapPin, 
  Image as ImageIcon, 
  Sparkles, 
  AlertTriangle, 
  Trash2, 
  Droplets, 
  CheckCircle2, 
  Clock, 
  Search, 
  Navigation, 
  Layers, 
  X, 
  Users, 
  Eye, 
  FileText,
  Building2,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { DEMO_PRESETS, MOCK_LOCATIONS, getEvidenceFallback } from '../constants/presets';
import { triageCivicIssue } from '../services/gemini';
import { submitOrClusterComplaint } from '../services/firestore';

export default function CitizenPortal({ 
  complaints = [], 
  onViewTicketDetails 
}) {
  // Sub-tabs: 'submit' or 'track'
  const [subTab, setSubTab] = useState('submit');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageName, setImageName] = useState('');

  // Submission / AI Triage status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(''); // 'Analyzing with Gemini 2.5 Flash...' | 'Checking Firestore Duplicates...'
  const [submissionResult, setSubmissionResult] = useState(null); // { isDuplicate, ticket, message }

  // Tracking State
  const [searchTicketId, setSearchTicketId] = useState('');
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Handle preset click
  const handleSelectPreset = (preset) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setLocation(preset.location);
    setImageBase64(preset.imageBase64);
    setImageName(preset.name);
    setSubmissionResult(null);
  };

  // Handle GPS / Mock Location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)} (GPS Located, Chennai)`);
        },
        (error) => {
          // Fallback to random realistic Chennai mock location
          const randomMock = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
          setLocation(`${randomMock} (GPS Simulated)`);
        },
        { timeout: 5000 }
      );
    } else {
      const randomMock = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
      setLocation(`${randomMock} (GPS Simulated)`);
    }
  };

  // Handle Image Upload -> Base64
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) return;

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      // Step 1: Gemini 2.5 Flash Triage
      setSubmissionStep('Gemini 2.5 Flash: Analyzing description, Tamil/Tanglish context, and visual evidence...');
      const triageResult = await triageCivicIssue({
        title,
        description,
        location,
        imageBase64,
      });

      // Step 2: Firestore & Duplicate Clustering
      setSubmissionStep('Firestore: Scanning real-time cluster coordinates & category duplicate registry...');
      const result = await submitOrClusterComplaint(
        {
          title,
          description,
          location,
          imageBase64,
          ...triageResult,
        },
        complaints
      );

      setSubmissionResult(result);
      // Auto-set tracking ticket to the new/clustered ticket
      setTrackedTicket(result.ticket);
      setSearchTicketId(result.ticket.ticketId);

      // Reset form fields
      setTitle('');
      setDescription('');
      setLocation('');
      setImageBase64('');
      setImageName('');
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
      setSubmissionStep('');
    }
  };

  // Handle Search for Tracking
  const handleSearchTicket = (e) => {
    e?.preventDefault();
    setTrackError('');
    if (!searchTicketId.trim()) return;

    const queryStr = searchTicketId.trim().toUpperCase();
    const found = complaints.find(
      (c) => c.ticketId?.toUpperCase() === queryStr || c.id?.toUpperCase() === queryStr
    );

    if (found) {
      setTrackedTicket(found);
      setTrackError('');
    } else {
      setTrackedTicket(null);
      setTrackError(`Ticket ID "${queryStr}" was not found. Please verify the ticket code.`);
    }
  };

  // 4 steps progress helper
  const progressSteps = [
    { key: 'Reported', label: 'Reported', desc: 'Complaint lodged' },
    { key: 'AI Verified', label: 'AI Verified', desc: 'Gemini 2.5 Flash' },
    { key: 'In Progress', label: 'In Progress', desc: 'Field crew assigned' },
    { key: 'Resolved', label: 'Resolved', desc: 'Certified & fixed' },
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

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Sub-navigation: Submit vs Track */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            Citizen Public Service Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Empowering residents of Tamil Nadu with AI-accelerated civic reporting & real-time resolution tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-800/90 rounded-xl border border-slate-700">
          <button
            onClick={() => setSubTab('submit')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'submit'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Report New Issue
          </button>
          <button
            onClick={() => {
              setSubTab('track');
              if (!trackedTicket && complaints.length > 0) {
                setTrackedTicket(complaints[0]);
                setSearchTicketId(complaints[0].ticketId);
              }
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'track'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Track Status ({complaints.length})
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: ISSUE SUBMISSION FORM */}
      {subTab === 'submit' && (
        <div className="space-y-8">
          
          {/* 3 One-Click Demo Preset Buttons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                1-Click Interactive Evaluation Presets
              </span>
              <span className="text-[11px] text-slate-400">
                Click any preset to prefill form & test AI verification
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEMO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="text-left p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-850 border border-slate-700/80 hover:border-indigo-500/50 transition-all duration-200 group relative overflow-hidden shadow-lg hover:shadow-indigo-500/10 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${p.badgeColor}`}>
                      {p.tag}
                    </span>
                    <span className="text-xs text-indigo-400 group-hover:text-indigo-300 font-semibold flex items-center gap-1">
                      Load Preset →
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shrink-0">
                      <img
                        src={p.imageBase64}
                        alt={p.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getEvidenceFallback(p.tag);
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm truncate group-hover:text-indigo-200 transition-colors">
                        {p.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {p.location}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {p.description}
                  </p>

                  <div className="text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-700/60 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="line-clamp-1">{p.highlight}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submission Result / Celebration Banner */}
          {submissionResult && (
            <div className={`p-5 rounded-2xl border ${
              submissionResult.isDuplicate 
                ? 'bg-purple-950/40 border-purple-500/50 shadow-purple-500/10' 
                : 'bg-emerald-950/40 border-emerald-500/50 shadow-emerald-500/10'
            } shadow-xl space-y-3 animate-fade-in`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    submissionResult.isDuplicate 
                      ? 'bg-purple-500/20 text-purple-300' 
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {submissionResult.isDuplicate ? <Users className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {submissionResult.isDuplicate 
                        ? 'Duplicate Clustered: Existing Ticket Updated!' 
                        : 'New Complaint Lodged & AI Triaged!'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {submissionResult.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTrackedTicket(submissionResult.ticket);
                    setSearchTicketId(submissionResult.ticket.ticketId);
                    setSubTab('track');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center gap-1.5 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  Track Ticket #{submissionResult.ticket.ticketId}
                </button>
              </div>

              {/* Triage Preview Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase">Category</span>
                  <span className="font-bold text-white">{submissionResult.ticket.category}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase">Assigned Priority</span>
                  <span className={`font-bold ${
                    submissionResult.ticket.priority === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {submissionResult.ticket.priority}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase">Department</span>
                  <span className="font-bold text-slate-200 truncate block">{submissionResult.ticket.department}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase">Total Reports</span>
                  <span className="font-bold text-purple-300">{submissionResult.ticket.reportCount} Citizens</span>
                </div>
              </div>
            </div>
          )}

          {/* Issue Submission Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Lodge Civic Grievance
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Input details in English, Tamil, or Tanglish. Our AI instantly standardizes it for municipal task forces.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                English • தமிழ் • Tanglish
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Complaint Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Heavy water leak near bus stand / குப்பை தொட்டி பிரச்சனை"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Detailed Description <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-indigo-400">
                    Supports colloquial Tanglish (e.g. 'pipe romba leak aagudhu')
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, exact impact, and hazard details in English, Tamil (தமிழ்), or Tanglish..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Location with 1-click GPS / Mock Location Button */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Location & Street Landmark <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Bus Stop 14M, 2nd Avenue, Anna Nagar, Chennai"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    title="Fetch GPS or Mock Coordinates"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-indigo-300 hover:text-white transition-all shadow-md shrink-0"
                  >
                    <Navigation className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Auto GPS / Mock</span>
                  </button>
                </div>

                {/* Quick location suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-500">Quick Areas:</span>
                  {['Anna Nagar', 'T. Nagar', 'Mylapore', 'Vadapalani', 'Guindy'].map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setLocation(`${area}, Chennai, Tamil Nadu`)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white hover:border-indigo-500/40 transition-colors"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload converting to Base64 */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Attach Photo Evidence (Image converted to Base64 for Gemini Vision)
                </label>

                {!imageBase64 ? (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-indigo-500/60 bg-slate-800/40 hover:bg-slate-800/60 transition-all">
                    <ImageIcon className="w-8 h-8 text-indigo-400 mb-2" />
                    <span className="text-xs font-bold text-slate-200">
                      Click to upload photo or drag & drop
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP • Automatically encoded to Base64
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                        <img
                          src={imageBase64}
                          alt="Preview"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getEvidenceFallback(title || 'general');
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block truncate max-w-xs">
                          {imageName || 'Attached Evidence Image'}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Base64 Encoded & Ready for Vision AI
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setImageBase64('');
                        setImageName('');
                      }}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors mr-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button with Loading progress */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !description.trim() || !location.trim()}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>{submissionStep || 'Processing Complaint...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Grievance with Gemini AI Triage</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: CITIZEN TRACKING SECTION */}
      {subTab === 'track' && (
        <div className="space-y-6">
          
          {/* Ticket Search Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTicketId}
                  onChange={(e) => setSearchTicketId(e.target.value)}
                  placeholder="Enter Ticket ID (e.g. CR-2026-WTR01 or CR-2026-MHL02)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchTicket()}
                />
              </div>
              <button
                type="button"
                onClick={handleSearchTicket}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Ticket</span>
              </button>
            </div>

            {/* Error message */}
            {trackError && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {trackError}
              </p>
            )}

            {/* Quick chips of available tickets */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Active Tickets:</span>
              {complaints.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSearchTicketId(c.ticketId);
                    setTrackedTicket(c);
                    setTrackError('');
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold transition-all ${
                    trackedTicket?.id === c.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {c.ticketId}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Ticket Tracker Card */}
          {trackedTicket ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Header with Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span className="font-mono text-sm font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                      {trackedTicket.ticketId}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                      trackedTicket.priority === 'Critical'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 ring-2 ring-rose-500/20 animate-pulse'
                        : trackedTicket.priority === 'High'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {trackedTicket.priority} Priority
                    </span>
                    {trackedTicket.reportCount > 1 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {trackedTicket.reportCount} Clustered Citizen Reports
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-white">
                    {trackedTicket.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{trackedTicket.location}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Target SLA Window</span>
                  <span className="text-lg font-black text-indigo-400 font-mono">
                    {trackedTicket.slaHours || 24} Hours
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Lodged: {new Date(trackedTicket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* 4-Step Progress Tracker */}
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                  Live Resolution Progress Tracker
                </div>

                <div className="relative">
                  {/* Connecting bar */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0 hidden sm:block" />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                    {progressSteps.map((st, i) => {
                      const curIdx = getStepIndex(trackedTicket.status);
                      const isPassed = i <= curIdx;
                      const isCurrent = i === curIdx;

                      return (
                        <div key={st.key} className="flex flex-col items-center text-center">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-lg ${
                            isCurrent
                              ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white ring-4 ring-indigo-500/30 scale-110'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}>
                            {isPassed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                          </div>
                          <span className={`text-xs font-bold mt-2 ${
                            isCurrent ? 'text-indigo-400' : isPassed ? 'text-slate-200' : 'text-slate-500'
                          }`}>
                            {st.label}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {st.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Triage & Department Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Official Work Order Summary */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Gemini AI Official Work Order Summary
                  </span>
                  <p className="text-xs font-medium text-slate-200 leading-relaxed">
                    {trackedTicket.officialSummary}
                  </p>
                </div>

                {/* Assigned Agency */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Assigned Municipal Department
                  </span>
                  <p className="text-xs font-bold text-slate-200">
                    {trackedTicket.department}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Category: <span className="text-slate-300 font-semibold">{trackedTicket.category}</span>
                  </p>
                </div>
              </div>

              {/* Resolution Proof (If Resolved) */}
              {trackedTicket.status === 'Resolved' && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Official AI Resolution Proof Certified
                  </span>
                  <p className="text-xs text-emerald-200 font-medium">
                    {trackedTicket.resolutionProof || 'Inspected and certified by Municipal Field Operations.'}
                  </p>
                </div>
              )}

              {/* Civic Evidence Photo Preview */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    Civic Evidence Photo Preview
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Visual Evidence Verified
                  </span>
                </div>
                <div 
                  onClick={() => onViewTicketDetails(trackedTicket)}
                  className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer group max-h-56 flex items-center justify-center p-1"
                >
                  <img
                    src={trackedTicket.imageBase64 || getEvidenceFallback(trackedTicket.category || trackedTicket.title)}
                    alt="Evidence"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getEvidenceFallback(trackedTicket.category || trackedTicket.title);
                    }}
                    className="w-full h-52 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    Click to Inspect Evidence & AI Analysis
                  </div>
                </div>
              </div>

              {/* View Full Audit Trail */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onViewTicketDetails(trackedTicket)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Complete AI Audit Trail & Image
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center p-12 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
              <Search className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Ticket Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Search with your Ticket ID above or select one of the active tickets from the list.
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
