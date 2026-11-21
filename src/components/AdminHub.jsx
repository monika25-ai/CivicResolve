import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Users, 
  ArrowUpDown, 
  Eye, 
  Sparkles, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  Flame, 
  FileCheck
} from 'lucide-react';
import { getEvidenceFallback } from '../constants/presets';

const DEPARTMENTS = [
  'All Departments',
  'Chennai Metro Water Supply & Sewerage Board (CMWSSB)',
  'Greater Chennai Corporation (GCC) - Solid Waste Management',
  'Greater Chennai Corporation (GCC) - Roads & Bridges Dept',
  'TANGEDCO & GCC Electrical Division',
  'Greater Chennai Corporation (GCC) - Public Health Department',
  'Greater Chennai Corporation (GCC) - General Public Works',
];

const PRIORITIES = ['All Priorities', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['All Statuses', 'Reported', 'AI Verified', 'In Progress', 'Resolved'];

export default function AdminHub({
  complaints = [],
  onUpdateStatus,
  onReassignDepartment,
  onOpenResolutionModal,
  onViewTicketDetails,
}) {
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // KPI Calculations
  const totalComplaints = complaints.length;
  const criticalCount = complaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved').length;
  const highPriorityCount = complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;
  
  // Total community reports clustered
  const totalClusteredReports = complaints.reduce((sum, c) => sum + (c.reportCount || 1), 0);
  const redundantSaved = totalClusteredReports - totalComplaints;

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${c.ticketId} ${c.title} ${c.description} ${c.location} ${c.officialSummary}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Department filter
    if (selectedDept !== 'All Departments') {
      if (c.department !== selectedDept) return false;
    }

    // Priority filter
    if (selectedPriority !== 'All Priorities') {
      if (c.priority !== selectedPriority) return false;
    }

    // Status filter
    if (selectedStatus !== 'All Statuses') {
      if (c.status !== selectedStatus) return false;
    }

    return true;
  });

  // Handle status select change
  const handleStatusChange = (ticket, newStatus) => {
    if (newStatus === 'Resolved') {
      // Trigger AI Resolution Proof modal
      onOpenResolutionModal(ticket);
    } else {
      onUpdateStatus(ticket.id, newStatus);
    }
  };

  const getPriorityBadgeClass = (priority) => {
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'In Progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'AI Verified':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Reported':
      default:
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Admin Hub Title Banner */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
              Authority Operations Command Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Admin Level 1
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time municipal grievance triage, SLA enforcement, duplicate clustering, and resolution proof certification.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Active Operations Dispatch</span>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* KPI 1: Total Complaints */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Logged
            </span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalComplaints}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            Across GCC zones
          </span>
        </div>

        {/* KPI 2: Critical / High Urgency */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-900/90 border border-rose-500/30 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              Critical & High
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
              Urgent
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {criticalCount + highPriorityCount}
          </div>
          <span className="text-[10px] text-rose-300/70 block truncate">
            {criticalCount} Critical • {highPriorityCount} High
          </span>
        </div>

        {/* KPI 3: In Progress */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              In Progress
            </span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-300 font-mono">
            {inProgressCount}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            Active field crews
          </span>
        </div>

        {/* KPI 4: Resolved & Rate */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900/90 border border-emerald-500/30 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Resolved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {resolvedCount}
          </div>
          <span className="text-[10px] text-emerald-400/80 font-bold block truncate">
            {resolutionRate}% Resolution Rate
          </span>
        </div>

        {/* KPI 5: Duplicate Clustered Reports */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 to-slate-900/90 border border-purple-500/30 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
              Clustered Reports
            </span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">
            {totalClusteredReports}
          </div>
          <span className="text-[10px] text-purple-300/70 block truncate">
            {redundantSaved > 0 ? `+${redundantSaved} duplicates grouped` : 'Zero duplicates detected'}
          </span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Query */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, location, summary..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Showing <strong className="text-white">{filteredComplaints.length}</strong> of {totalComplaints} tickets
          </span>

          {(searchQuery || selectedDept !== 'All Departments' || selectedPriority !== 'All Priorities' || selectedStatus !== 'All Statuses') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('All Departments');
                setSelectedPriority('All Priorities');
                setSelectedStatus('All Statuses');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints Table & Action Cards */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          <div className="space-y-3">
            {filteredComplaints.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition-all duration-200 space-y-4"
              >
                {/* Top Card Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  
                  {/* Identification and Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                      {ticket.ticketId}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getPriorityBadgeClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(ticket.status)}`}>
                      {ticket.status}
                    </span>

                    {ticket.reportCount > 1 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {ticket.reportCount} Clustered Reports
                      </span>
                    )}

                    <span className="text-[11px] text-slate-500 ml-1">
                      Target SLA: <strong className="text-slate-300 font-mono">{ticket.slaHours || 24}h</strong>
                    </span>
                  </div>

                  {/* Right Side Quick Controls: Status Dropdown & Reassign Dropdown */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Status Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Reported">Reported</option>
                        <option value="AI Verified">AI Verified</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    {/* Department Reassign Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Reassign:</span>
                      <select
                        value={ticket.department}
                        onChange={(e) => onReassignDepartment(ticket.id, e.target.value)}
                        className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 max-w-[190px] truncate"
                      >
                        {DEPARTMENTS.filter(d => d !== 'All Departments').map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Details modal launcher */}
                    <button
                      onClick={() => onViewTicketDetails(ticket)}
                      title="Inspect Complete AI Triage & Evidence"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Middle Content: Summary, Original Input, Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
                  
                  {/* Column 1: AI Official Summary */}
                  <div className="md:col-span-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {ticket.title}
                      </h3>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        {ticket.location}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                      <strong className="text-indigo-400 block mb-0.5">Gemini Official Summary:</strong>
                      {ticket.officialSummary}
                    </p>

                    <p className="text-[11px] text-slate-400 italic">
                      Citizen original: "{ticket.description}"
                    </p>

                    {/* Resolution Proof Note (if Resolved) */}
                    {ticket.status === 'Resolved' && ticket.resolutionProof && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-start gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-emerald-400">Certified Resolution Proof:</strong>
                          {ticket.resolutionProof}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Evidence Thumbnail & Notes */}
                  <div className="space-y-2">
                    <div 
                      onClick={() => onViewTicketDetails(ticket)}
                      className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer group h-24 flex items-center justify-center"
                    >
                      <img
                        src={ticket.imageBase64 || getEvidenceFallback(ticket.category || ticket.title)}
                        alt="Evidence"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getEvidenceFallback(ticket.category || ticket.title);
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                        Click to Enlarge
                      </div>
                    </div>

                    {ticket.imageVerificationNote && (
                      <div className="p-2 rounded-lg bg-slate-800/40 border border-amber-500/20 text-[11px] text-slate-400 line-clamp-2">
                        <span className="font-bold text-amber-400">Vision Note: </span>
                        {ticket.imageVerificationNote}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
            <Filter className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No Tickets Match Filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your department, priority, or status filters above to view other tickets.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
