import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  PRESET_WATER_LEAK_SVG, 
  PRESET_OPEN_MANHOLE_SVG, 
  PRESET_GARBAGE_OVERFLOW_SVG,
  getEvidenceFallback 
} from '../constants/presets';

const COLLECTION_NAME = 'complaints';
const LOCAL_STORAGE_KEY = 'civic_resolve_complaints_cache';

// Initial seed data if Firestore or local storage is empty
const INITIAL_DEMO_COMPLAINTS = [
  {
    id: 'CR-2026-WTR01',
    ticketId: 'CR-2026-WTR01',
    title: 'Drinking Water Pipeline Burst & Heavy Leakage',
    description: 'Water pipe romba leak aagudhu road fulla water waste aagudhu near bus stop. Kudineer supply affect aagi irukku, vehicular traffic also blocked.',
    location: 'Bus Stop 14M, 2nd Avenue, Anna Nagar, Chennai',
    category: 'Water Supply & Sewerage',
    priority: 'High',
    department: 'Chennai Metro Water Supply & Sewerage Board (CMWSSB)',
    officialSummary: 'Drinking water transmission main rupture reported near bus stop, causing extensive roadway waterlogging, loss of potable water supply, and localized traffic disruption.',
    imageVerificationNote: 'Visual inspection confirms high-pressure water gushing onto the roadway from a fractured subterranean main line, with standing water pooling across lanes.',
    slaHours: 12,
    status: 'In Progress',
    reportCount: 2,
    imageBase64: PRESET_WATER_LEAK_SVG,
    duplicateReports: [
      {
        description: 'Water leaking continuously since morning near bus stand, huge puddle.',
        reportedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        location: 'Bus Stop 14M, Anna Nagar, Chennai',
      }
    ],
    statusHistory: [
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), note: 'Initial report lodged by citizen' },
      { status: 'AI Verified', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), note: 'Gemini 2.5 Flash assigned Water Supply & Sewerage (CMWSSB)' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'Assigned to CMWSSB Zone 8 Maintenance Crew' },
    ],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'CR-2026-MHL02',
    ticketId: 'CR-2026-MHL02',
    title: 'Minor Street Pothole',
    description: 'There is just a small minor pothole on the side of the road, nothing urgent, please check when free.',
    location: 'Gandhi Road, Near Apollo Clinic, T. Nagar, Chennai',
    category: 'Roads & Traffic Infrastructure',
    priority: 'Critical',
    department: 'Greater Chennai Corporation (GCC) - Roads & Bridges Dept',
    officialSummary: 'Uncovered deep stormwater/sewer manhole chamber situated directly on pedestrian/vehicular pathway. Immediate hazard of fatal fall or vehicle accident.',
    imageVerificationNote: 'CRITICAL HAZARD MISMATCH: Citizen reported this as a "minor pothole", but computer vision inspection detected a missing cast-iron chamber cover with an exposed deep drop-off. Priority upgraded to Critical for immediate emergency barricading.',
    slaHours: 6,
    status: 'AI Verified',
    reportCount: 1,
    imageBase64: PRESET_OPEN_MANHOLE_SVG,
    duplicateReports: [],
    statusHistory: [
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'Initial report lodged' },
      { status: 'AI Verified', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), note: 'Gemini 2.5 Flash detected open manhole mismatch; escalated to Critical priority' },
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'CR-2026-GBG03',
    ticketId: 'CR-2026-GBG03',
    title: 'Market Dump Overflow & Stagnant Waste Spill',
    description: 'Huge dump of municipal garbage not cleared for 5 days near market junction. Nasty foul smell, stray animals gathering, health risk for nearby shopkeepers.',
    location: 'Market Road, Junction 4, Mylapore, Chennai',
    category: 'Solid Waste Management',
    priority: 'Critical',
    department: 'Greater Chennai Corporation (GCC) - Solid Waste Management',
    officialSummary: 'Accumulation of unsegregated municipal commercial waste and overflowing public dumpsters uncleared for over 5 days, causing severe pest vector risks and public stench.',
    imageVerificationNote: 'Visual verification confirms severe bin spillover with decomposed organic and plastic waste covering the pedestrian sidewalk and drainage gutter.',
    slaHours: 24,
    status: 'Reported',
    reportCount: 3, // Already hit 3 duplicate reports -> Critical!
    imageBase64: PRESET_GARBAGE_OVERFLOW_SVG,
    duplicateReports: [
      {
        description: 'Kuppai fulla theruvula thonudhu, cannot even walk to the temple.',
        reportedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        location: 'Market Road, Mylapore',
      },
      {
        description: 'Garbage bins overflowing into road, dogs ripping plastic bags.',
        reportedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        location: 'Mylapore Market Junction',
      }
    ],
    statusHistory: [
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), note: 'Complaint lodged by citizen' },
      { status: 'AI Verified', timestamp: new Date(Date.now() - 3600000 * 7).toISOString(), note: 'Verified by Gemini 2.5 Flash (Solid Waste)' },
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), note: 'Clustered 3rd duplicate complaint. Priority upgraded to Critical automatically!' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
];

// Helper to sanitize complaint images with reliable SVG Base64 fallbacks
function sanitizeComplaintImages(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    let img = item.imageBase64;
    // Replace broken, unencoded utf8, or missing images with reliable category SVG data URI
    if (!img || typeof img !== 'string' || img.startsWith('data:image/svg+xml;utf8') || img.length < 50) {
      img = getEvidenceFallback(item.category || item.title);
    }
    return {
      ...item,
      imageBase64: img,
    };
  });
}

// In-memory / local storage fallback state
function getLocalCache() {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return sanitizeComplaintImages(parsed);
    }
  } catch (e) {
    console.warn('Could not read localStorage cache:', e);
  }
  return INITIAL_DEMO_COMPLAINTS;
}

function setLocalCache(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save to localStorage cache:', e);
  }
}

/**
 * Normalizes location string for duplicate checking.
 */
function normalizeLocation(loc) {
  if (!loc) return '';
  return loc
    .toLowerCase()
    .replace(/[,\.\-\/\\#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two location strings refer to the same vicinity / area.
 */
function isLocationMatch(loc1, loc2) {
  const n1 = normalizeLocation(loc1);
  const n2 = normalizeLocation(loc2);

  if (!n1 || !n2) return false;
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  // Check known landmark tokens (e.g. "anna nagar", "t nagar", "mylapore", "vadapalani", "guindy")
  const keyAreas = ['anna nagar', 't nagar', 't. nagar', 'mylapore', 'vadapalani', 'guindy', 'velachery', 'egmore', 'adyar', 'tambaram', 'alwarpet', 'kilpauk'];
  for (const area of keyAreas) {
    if (n1.includes(area) && n2.includes(area)) {
      return true;
    }
  }

  // Token overlap check
  const words1 = n1.split(' ').filter(w => w.length > 3);
  const words2 = n2.split(' ').filter(w => w.length > 3);
  const common = words1.filter(w => words2.includes(w));
  return common.length >= 2;
}

/**
 * Realtime subscription to complaints collection.
 * Uses Firestore onSnapshot with graceful fallback to local cache.
 */
export function subscribeToComplaints(onUpdate) {
  let isFirestoreActive = false;
  let unsubscribeFirestore = () => {};

  try {
    const complaintsRef = collection(db, COLLECTION_NAME);
    const q = query(complaintsRef, orderBy('createdAt', 'desc'));

    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        isFirestoreActive = true;
        if (snapshot.empty) {
          // If Firestore is connected but collection is empty, seed demo data
          const local = getLocalCache();
          onUpdate(local, { isOnline: true, isSynced: true });
          // Asynchronously seed Firestore with initial data
          seedInitialFirestoreData(local);
        } else {
          const list = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() });
          });
          const sanitized = sanitizeComplaintImages(list);
          setLocalCache(sanitized);
          onUpdate(sanitized, { isOnline: true, isSynced: true });
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot listener fallback to local cache:', error.message);
        // Fallback to local cache if offline, permissions error, or network drop
        const local = getLocalCache();
        onUpdate(local, { isOnline: false, error: error.message });
      }
    );
  } catch (err) {
    console.warn('Firestore setup error, using local cache:', err);
    const local = getLocalCache();
    onUpdate(local, { isOnline: false, error: err.message });
  }

  return () => {
    unsubscribeFirestore();
  };
}

/**
 * Seed initial data to Firestore if empty
 */
async function seedInitialFirestoreData(items) {
  try {
    for (const item of items) {
      await setDoc(doc(db, COLLECTION_NAME, item.id), item);
    }
    console.log('Seeded initial civic complaints to Firestore');
  } catch (err) {
    console.warn('Could not seed initial Firestore items:', err.message);
  }
}

/**
 * Submits a new complaint or clusters it into an existing ticket if duplicate found.
 * 
 * Rules:
 * - Match existing complaint with same category and same location (status !== 'Resolved')
 * - If found: increment reportCount. If reportCount >= 3, upgrade priority to Critical!
 * - Otherwise: create a new ticket.
 */
export async function submitOrClusterComplaint(complaintInput, currentComplaints = []) {
  const {
    title,
    description,
    location,
    imageBase64,
    category,
    priority: aiPriority,
    department,
    officialSummary,
    imageVerificationNote,
    slaHours,
  } = complaintInput;

  // 1. Check for duplicate complaints among active (unresolved) issues
  const duplicateMatch = currentComplaints.find(
    (c) =>
      c.status !== 'Resolved' &&
      c.category?.toLowerCase() === category?.toLowerCase() &&
      isLocationMatch(c.location, location)
  );

  const nowIso = new Date().toISOString();

  if (duplicateMatch) {
    const newReportCount = (duplicateMatch.reportCount || 1) + 1;
    // Rule: Upgrade priority to Critical at 3+ reports
    const newPriority = newReportCount >= 3 ? 'Critical' : (duplicateMatch.priority || aiPriority || 'High');

    const updatedTicket = {
      ...duplicateMatch,
      reportCount: newReportCount,
      priority: newPriority,
      updatedAt: nowIso,
      duplicateReports: [
        ...(duplicateMatch.duplicateReports || []),
        {
          description,
          location,
          reportedAt: nowIso,
        },
      ],
      statusHistory: [
        ...(duplicateMatch.statusHistory || []),
        {
          status: duplicateMatch.status,
          timestamp: nowIso,
          note: `Duplicate report clustered (${newReportCount} citizens reported). Priority: ${newPriority}${newReportCount >= 3 ? ' (Upgraded to Critical!)' : ''}`,
        },
      ],
    };

    // Try saving to Firestore
    try {
      const ticketRef = doc(db, COLLECTION_NAME, duplicateMatch.id);
      await updateDoc(ticketRef, {
        reportCount: updatedTicket.reportCount,
        priority: updatedTicket.priority,
        updatedAt: updatedTicket.updatedAt,
        duplicateReports: updatedTicket.duplicateReports,
        statusHistory: updatedTicket.statusHistory,
      });
    } catch (err) {
      console.warn('Firestore updateDoc failed, updating local cache:', err);
    }

    // Update local cache
    const cached = getLocalCache();
    const updatedCache = cached.map((c) => (c.id === duplicateMatch.id ? updatedTicket : c));
    setLocalCache(updatedCache);

    return {
      isDuplicate: true,
      ticket: updatedTicket,
      message: `Duplicate issue detected at ${duplicateMatch.location}! Clustered into existing Ticket #${duplicateMatch.ticketId}. Report count is now ${newReportCount}.${newReportCount >= 3 ? ' Priority automatically upgraded to CRITICAL!' : ''}`,
    };
  }

  // 2. No duplicate found -> Create new ticket
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const ticketId = `CR-2026-${randomSuffix}`;
  
  const newTicket = {
    id: ticketId,
    ticketId: ticketId,
    title: title || 'Civic Infrastructure Concern',
    description: description || '',
    location: location || 'Chennai, Tamil Nadu',
    category: category || 'General Civic Infrastructure',
    priority: aiPriority || 'Medium',
    department: department || 'Greater Chennai Corporation',
    officialSummary: officialSummary || description,
    imageVerificationNote: imageVerificationNote || 'Visual verification logged.',
    slaHours: slaHours || 24,
    status: 'AI Verified', // 4-step progress: Reported -> AI Verified -> In Progress -> Resolved
    reportCount: 1,
    imageBase64: imageBase64 || null,
    duplicateReports: [],
    statusHistory: [
      {
        status: 'Reported',
        timestamp: nowIso,
        note: 'Issue submitted by citizen.',
      },
      {
        status: 'AI Verified',
        timestamp: nowIso,
        note: `AI Triage: Verified by Gemini 2.5 Flash as ${category}. Assigned to ${department} with ${slaHours}h SLA.`,
      },
    ],
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // Try saving to Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, ticketId);
    await setDoc(docRef, newTicket);
  } catch (err) {
    console.warn('Firestore setDoc failed, saving to local cache:', err);
  }

  // Update local cache
  const cached = getLocalCache();
  const updatedCache = [newTicket, ...cached.filter((c) => c.id !== ticketId)];
  setLocalCache(updatedCache);

  return {
    isDuplicate: false,
    ticket: newTicket,
    message: `Ticket #${newTicket.ticketId} successfully created and verified by Gemini 2.5 Flash AI Triage!`,
  };
}

/**
 * Updates complaint status (e.g. In Progress, Resolved) and optional resolution proof.
 */
export async function updateComplaintStatus(ticketId, newStatus, resolutionProof = null) {
  const nowIso = new Date().toISOString();
  let noteText = `Status updated to ${newStatus}`;
  if (newStatus === 'Resolved' && resolutionProof) {
    noteText = `Resolved with AI Verification Proof: "${resolutionProof}"`;
  }

  const cached = getLocalCache();
  const target = cached.find((c) => c.id === ticketId || c.ticketId === ticketId);

  if (!target) return null;

  const updatedTarget = {
    ...target,
    status: newStatus,
    updatedAt: nowIso,
    resolutionProof: newStatus === 'Resolved' ? (resolutionProof || target.resolutionProof || 'Inspected and certified by Municipal Field Operations.') : target.resolutionProof,
    statusHistory: [
      ...(target.statusHistory || []),
      {
        status: newStatus,
        timestamp: nowIso,
        note: noteText,
      },
    ],
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, target.id);
    await updateDoc(docRef, {
      status: updatedTarget.status,
      updatedAt: updatedTarget.updatedAt,
      resolutionProof: updatedTarget.resolutionProof,
      statusHistory: updatedTarget.statusHistory,
    });
  } catch (err) {
    console.warn('Firestore updateDoc status failed, updating local cache:', err);
  }

  const updatedCache = cached.map((c) => (c.id === target.id ? updatedTarget : c));
  setLocalCache(updatedCache);
  return updatedTarget;
}

/**
 * Reassigns complaint to another department.
 */
export async function reassignDepartment(ticketId, newDepartment) {
  const nowIso = new Date().toISOString();
  const cached = getLocalCache();
  const target = cached.find((c) => c.id === ticketId || c.ticketId === ticketId);

  if (!target) return null;

  const updatedTarget = {
    ...target,
    department: newDepartment,
    updatedAt: nowIso,
    statusHistory: [
      ...(target.statusHistory || []),
      {
        status: target.status,
        timestamp: nowIso,
        note: `Reassigned from "${target.department}" to "${newDepartment}" by Authority Administrator.`,
      },
    ],
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, target.id);
    await updateDoc(docRef, {
      department: updatedTarget.department,
      updatedAt: updatedTarget.updatedAt,
      statusHistory: updatedTarget.statusHistory,
    });
  } catch (err) {
    console.warn('Firestore updateDoc department failed, updating local cache:', err);
  }

  const updatedCache = cached.map((c) => (c.id === target.id ? updatedTarget : c));
  setLocalCache(updatedCache);
  return updatedTarget;
}
