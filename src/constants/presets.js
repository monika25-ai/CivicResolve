export function svgToBase64(svgString) {
  const clean = svgString.trim();
  if (typeof btoa !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(clean)))}`;
  }
  // Node.js fallback if running in test environment
  return `data:image/svg+xml;base64,${Buffer.from(clean, 'utf-8').toString('base64')}`;
}

const WATER_LEAK_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <rect width="600" height="230" fill="#0f172a"/>
  <!-- Buildings background -->
  <rect x="40" y="80" width="80" height="150" fill="#1e293b"/>
  <rect x="140" y="50" width="110" height="180" fill="#334155"/>
  <rect x="270" y="100" width="70" height="130" fill="#1e293b"/>
  <rect x="440" y="60" width="120" height="170" fill="#334155"/>
  <!-- Windows -->
  <rect x="60" y="100" width="12" height="15" fill="#facc15" fill-opacity="0.6"/>
  <rect x="160" y="80" width="15" height="18" fill="#facc15" fill-opacity="0.6"/>
  <rect x="190" y="120" width="15" height="18" fill="#94a3b8" fill-opacity="0.4"/>
  <rect x="460" y="90" width="14" height="18" fill="#facc15" fill-opacity="0.7"/>
  <!-- Road -->
  <rect y="225" width="600" height="175" fill="url(#roadGrad)"/>
  <line x1="0" y1="320" x2="600" y2="320" stroke="#facc15" stroke-dasharray="30,20" stroke-width="6"/>
  <!-- Sidewalk -->
  <rect y="215" width="600" height="15" fill="#64748b"/>
  <!-- Pipe Burst / Rupture -->
  <rect x="230" y="275" width="80" height="30" rx="6" fill="#0369a1"/>
  <path d="M 255 275 Q 265 145 280 120 Q 295 145 305 275" fill="url(#waterGrad)" stroke="#bae6fd" stroke-width="3"/>
  <circle cx="280" cy="120" r="18" fill="#e0f2fe"/>
  <!-- Water drops -->
  <circle cx="255" cy="160" r="6" fill="#bae6fd"/>
  <circle cx="305" cy="155" r="7" fill="#bae6fd"/>
  <circle cx="235" cy="190" r="8" fill="#e0f2fe"/>
  <circle cx="325" cy="185" r="8" fill="#e0f2fe"/>
  <!-- Massive Water Puddle -->
  <ellipse cx="290" cy="325" rx="210" ry="48" fill="url(#waterGrad)"/>
  <ellipse cx="270" cy="325" rx="150" ry="26" fill="#bae6fd" fill-opacity="0.4"/>
  <!-- Traffic Barrier / Caution Cone -->
  <polygon points="120,340 142,250 158,250 180,340" fill="#ea580c"/>
  <polygon points="132,295 138,272 162,272 168,295" fill="#ffffff"/>
  <polygon points="126,322 131,305 169,305 174,322" fill="#ffffff"/>
  <rect x="110" y="340" width="80" height="9" rx="2" fill="#0f172a"/>
  <!-- Bus Stop Sign -->
  <rect x="410" y="145" width="6" height="130" fill="#94a3b8"/>
  <circle cx="413" cy="140" r="24" fill="#dc2626"/>
  <text x="413" y="145" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle">BUS STOP</text>
  <!-- Label Banner -->
  <rect x="20" y="20" width="310" height="38" rx="8" fill="#0f172a" fill-opacity="0.9"/>
  <circle cx="40" cy="39" r="10" fill="#0284c7"/>
  <text x="40" y="43" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle">💧</text>
  <text x="60" y="44" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#38bdf8">EVIDENCE: Water Pipeline Burst</text>
</svg>`;

const OPEN_MANHOLE_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <radialGradient id="holeGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="75%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <linearGradient id="tarmacGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <!-- Asphalt Road Surface -->
  <rect width="600" height="400" fill="url(#tarmacGrad)"/>
  <!-- Asphalt cracks & road wear -->
  <path d="M 80 180 L 140 220 L 200 200 L 240 240" stroke="#1e293b" stroke-width="4" fill="none"/>
  <path d="M 370 230 L 430 270 L 510 240" stroke="#1e293b" stroke-width="4" fill="none"/>
  <!-- Road Yellow Center Divider Line -->
  <line x1="30" y1="210" x2="190" y2="210" stroke="#facc15" stroke-dasharray="35,25" stroke-width="8"/>
  <line x1="420" y1="210" x2="580" y2="210" stroke="#facc15" stroke-dasharray="35,25" stroke-width="8"/>
  <!-- Concrete Manhole Outer Collar -->
  <ellipse cx="300" cy="225" rx="115" ry="68" fill="#64748b" stroke="#94a3b8" stroke-width="5"/>
  <ellipse cx="300" cy="225" rx="98" ry="56" fill="#1e293b"/>
  <!-- Deep Abyss Sewer Chamber -->
  <ellipse cx="300" cy="228" rx="86" ry="46" fill="url(#holeGrad)"/>
  <!-- Underground Sewer Line Reflection -->
  <path d="M 235 228 A 75 40 0 0 0 365 228" stroke="#0284c7" stroke-width="4" fill="none" opacity="0.7"/>
  <!-- Displaced Heavy Cast Iron Manhole Cover Lying on Road -->
  <ellipse cx="440" cy="290" rx="72" ry="38" fill="#475569" stroke="#1e293b" stroke-width="4"/>
  <ellipse cx="440" cy="290" rx="60" ry="30" fill="#334155"/>
  <circle cx="440" cy="290" r="16" fill="#1e293b"/>
  <text x="440" y="294" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#94a3b8" text-anchor="middle">DRAINAGE</text>
  <!-- Crude Tree Branch / Warning Stick inserted by residents -->
  <line x1="310" y1="235" x2="335" y2="95" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
  <line x1="330" y1="130" x2="360" y2="105" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
  <!-- Red Warning Cloth Flag -->
  <polygon points="335,100 375,115 335,130" fill="#ef4444"/>
  <!-- Danger Hazard Header Banner -->
  <rect x="20" y="20" width="360" height="42" rx="8" fill="#7f1d1d" fill-opacity="0.95"/>
  <circle cx="42" cy="41" r="12" fill="#ef4444"/>
  <text x="42" y="46" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">⚠️</text>
  <text x="64" y="46" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#fecaca">EVIDENCE: Deep Open Manhole Hazard</text>
</svg>`;

const GARBAGE_OVERFLOW_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <!-- Background Wall -->
  <rect width="600" height="230" fill="url(#wallGrad)"/>
  <!-- Pavement / Ground -->
  <rect y="230" width="600" height="170" fill="url(#groundGrad)"/>
  <!-- Curb -->
  <rect y="222" width="600" height="14" fill="#475569"/>
  <!-- Municipal Dumpster Green Bin 1 -->
  <rect x="90" y="155" width="135" height="115" rx="8" fill="#15803d" stroke="#166534" stroke-width="4"/>
  <rect x="80" y="145" width="155" height="16" rx="4" fill="#166534"/>
  <text x="157" y="215" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#86efac" text-anchor="middle">GCC SANITATION</text>
  <!-- Municipal Dumpster Green Bin 2 -->
  <rect x="245" y="155" width="135" height="115" rx="8" fill="#15803d" stroke="#166534" stroke-width="4"/>
  <rect x="235" y="145" width="155" height="16" rx="4" fill="#166534"/>
  <text x="312" y="215" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#86efac" text-anchor="middle">GCC DUMPSTER</text>
  <!-- Massive Garbage Heap overflowing -->
  <ellipse cx="230" cy="135" rx="75" ry="38" fill="#334155"/>
  <ellipse cx="140" cy="135" rx="65" ry="32" fill="#475569"/>
  <!-- Spilled black trash bags -->
  <ellipse cx="390" cy="275" rx="48" ry="32" fill="#0f172a"/>
  <ellipse cx="335" cy="295" rx="44" ry="26" fill="#1e293b"/>
  <ellipse cx="440" cy="305" rx="58" ry="36" fill="#0f172a"/>
  <ellipse cx="220" cy="300" rx="55" ry="32" fill="#334155"/>
  <ellipse cx="130" cy="315" rx="65" ry="38" fill="#1e293b"/>
  <ellipse cx="280" cy="325" rx="75" ry="42" fill="#0f172a"/>
  <!-- Cardboard Boxes -->
  <rect x="475" y="270" width="65" height="52" rx="4" fill="#d97706" transform="rotate(12 475 270)"/>
  <rect x="55" y="280" width="60" height="48" rx="3" fill="#b45309" transform="rotate(-15 55 280)"/>
  <!-- Plastic Bottles & Debris -->
  <ellipse cx="400" cy="345" rx="15" ry="8" fill="#38bdf8"/>
  <ellipse cx="205" cy="350" rx="18" ry="9" fill="#ef4444"/>
  <ellipse cx="480" cy="340" rx="16" ry="7" fill="#facc15"/>
  <ellipse cx="105" cy="345" rx="14" ry="6" fill="#10b981"/>
  <!-- Stench / Fumes Lines -->
  <path d="M 190 90 Q 180 65 195 45" stroke="#84cc16" stroke-width="2.5" fill="none"/>
  <path d="M 235 85 Q 245 60 230 40" stroke="#84cc16" stroke-width="2.5" fill="none"/>
  <path d="M 275 90 Q 265 65 280 45" stroke="#84cc16" stroke-width="2.5" fill="none"/>
  <!-- Header Banner -->
  <rect x="20" y="20" width="340" height="42" rx="8" fill="#713f12" fill-opacity="0.95"/>
  <circle cx="42" cy="41" r="12" fill="#d97706"/>
  <text x="42" y="46" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">🗑️</text>
  <text x="64" y="46" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#fef08a">EVIDENCE: Overflowing Garbage Spill</text>
</svg>`;

const GENERAL_CIVIC_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#bgGrad)"/>
  <!-- Shield Icon -->
  <circle cx="300" cy="180" r="85" fill="#312e81" stroke="#6366f1" stroke-width="4"/>
  <path d="M 300 130 Q 340 140 340 180 C 340 220 300 240 300 240 C 300 240 260 220 260 180 Q 260 140 300 130 Z" fill="#4f46e5"/>
  <path d="M 285 180 L 295 190 L 320 165" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <!-- Text -->
  <text x="300" y="300" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">Civic Grievance Inspection Evidence</text>
  <text x="300" y="330" font-family="Arial, sans-serif" font-size="13" font-weight="500" fill="#a5b4fc" text-anchor="middle">Greater Chennai Corporation • Municipal Administration</text>
</svg>`;

export const PRESET_WATER_LEAK_SVG = svgToBase64(WATER_LEAK_SVG_RAW);
export const PRESET_OPEN_MANHOLE_SVG = svgToBase64(OPEN_MANHOLE_SVG_RAW);
export const PRESET_GARBAGE_OVERFLOW_SVG = svgToBase64(GARBAGE_OVERFLOW_SVG_RAW);
export const DEFAULT_FALLBACK_SVG = svgToBase64(GENERAL_CIVIC_SVG_RAW);

/**
 * Returns a reliable inline SVG data URI based on category or issue keyword.
 * Guaranteed never to fail or break in any browser.
 */
export function getEvidenceFallback(categoryOrText = '') {
  const str = String(categoryOrText).toLowerCase();
  if (str.includes('water') || str.includes('leak') || str.includes('pipe') || str.includes('kudineer') || str.includes('sewerage')) {
    return PRESET_WATER_LEAK_SVG;
  }
  if (str.includes('manhole') || str.includes('pothole') || str.includes('road') || str.includes('bridge') || str.includes('traffic') || str.includes('infrastructure')) {
    return PRESET_OPEN_MANHOLE_SVG;
  }
  if (str.includes('garbage') || str.includes('waste') || str.includes('sanitation') || str.includes('solid') || str.includes('kuppai')) {
    return PRESET_GARBAGE_OVERFLOW_SVG;
  }
  return DEFAULT_FALLBACK_SVG;
}

export const DEMO_PRESETS = [
  {
    id: 'tanglish-water-leak',
    name: 'Tanglish Water Leak',
    tag: 'Tamil / Tanglish Input',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    icon: 'Droplets',
    title: 'Drinking Water Pipeline Burst & Heavy Leakage',
    description: 'Water pipe romba leak aagudhu road fulla water waste aagudhu near bus stop. Kudineer supply affect aagi irukku, vehicular traffic also blocked. Please fix urgently!',
    location: 'Bus Stop 14M, 2nd Avenue, Anna Nagar, Chennai',
    imageBase64: PRESET_WATER_LEAK_SVG,
    highlight: 'Tests Tamil/Tanglish comprehension, water department routing, and SLA estimation.'
  },
  {
    id: 'mismatched-manhole',
    name: 'Open Manhole (Mismatched Description)',
    tag: 'Image Hazard Verification',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    icon: 'AlertTriangle',
    title: 'Minor Street Pothole',
    description: 'There is just a small minor pothole on the side of the road, nothing urgent, please check when free.',
    location: 'Gandhi Road, Near Apollo Clinic, T. Nagar, Chennai',
    imageBase64: PRESET_OPEN_MANHOLE_SVG,
    highlight: 'Tests Gemini vision detecting citizen understating severe open manhole hazard -> elevates priority to Critical!'
  },
  {
    id: 'garbage-overflow',
    name: 'Garbage Overflow',
    tag: 'Sanitation & Health',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: 'Trash2',
    title: 'Market Dump Overflow & Stagnant Waste Spill',
    description: 'Huge dump of municipal garbage not cleared for 5 days near market junction. Nasty foul smell, stray animals gathering, health risk for nearby shopkeepers and school kids.',
    location: 'Market Road, Junction 4, Mylapore, Chennai',
    imageBase64: PRESET_GARBAGE_OVERFLOW_SVG,
    highlight: 'Tests solid waste routing, public health urgency, and duplicate clustering.'
  }
];

export const MOCK_LOCATIONS = [
  'Bus Stop 14M, 2nd Avenue, Anna Nagar, Chennai',
  'Gandhi Road, Near Apollo Clinic, T. Nagar, Chennai',
  'Market Road, Junction 4, Mylapore, Chennai',
  '100 Feet Road, Vadapalani Metro, Chennai',
  'GST Road, Guindy Industrial Estate, Chennai',
  'Velachery Main Road, Near Phoenix Marketcity, Chennai'
];
