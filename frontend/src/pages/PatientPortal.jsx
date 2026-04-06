import React, { useState, useEffect, useRef } from 'react';

const SVGIcon = ({ children, size = 16, style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ display: 'block', flexShrink: 0, width: size, height: size, minWidth: size, minHeight: size, ...style }}>
        {children}
    </svg>
);

const IHeart = ({ size = 16 } = {}) => <SVGIcon size={size}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></SVGIcon>;
const IHash = () => <SVGIcon><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></SVGIcon>;
const ILock = () => <SVGIcon><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></SVGIcon>;
const IEye = () => <SVGIcon><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></SVGIcon>;
const IEyeOff = () => <SVGIcon><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></SVGIcon>;
const IAlert = ({ size = 16 } = {}) => <SVGIcon size={size}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></SVGIcon>;
const ICheck = ({ size = 16 } = {}) => <SVGIcon size={size}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></SVGIcon>;
const IClock = ({ size = 16 } = {}) => <SVGIcon size={size}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></SVGIcon>;
const IChevDown = () => <SVGIcon><polyline points="6 9 12 15 18 9" /></SVGIcon>;
const ILogOut = () => <SVGIcon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></SVGIcon>;
const IDownload = () => <SVGIcon><polyline points="8 17 12 21 16 17" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" /></SVGIcon>;
const IPhone = ({ size = 16 } = {}) => <SVGIcon size={size}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></SVGIcon>;
const IMapPin = () => <SVGIcon><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></SVGIcon>;
const IDollar = () => <SVGIcon><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></SVGIcon>;
const IFlask = ({ size = 16, style = {} }) => <SVGIcon size={size} style={style}><path d="M14.5 2v13.5a4.5 4.5 0 0 1-9 0V2" /><line x1="6" y1="2" x2="14" y2="2" /><path d="M6 12h8" /></SVGIcon>;
const IMicro = ({ size = 16, style = {} }) => <SVGIcon size={size} style={style}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></SVGIcon>;
const IClipboard = () => <SVGIcon><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></SVGIcon>;

const DIAGNOSTICS_RESULTS_STORE = {};
const DISCHARGE_STATE = {};

// Demo only: In production replace with backend authentication API call
const PATIENT_REGISTRY = {
    'MRN-20250317-8841': {
        // SHA-256 of 'Pass@8841'
        passwordHash: '1dd01e885ea45a688bc8d345e793bcd5ddae381b43aebcd22a89b0573459954d',
        patientId: 'INC-8841',
        name: 'S. Venkata Raghavan', age: 42, gender: 'Male', bloodType: 'O Negative',
        phone: '+91 98765 43210', allergies: ['Penicillin', 'Latex'],
        admitDate: 'Mar 17, 2025', ward: 'ICU - Trauma', bed: 'ICU-01',
        doctor: 'Dr. Aris Mehta', specialty: 'Trauma Surgery',
        diagnosis: 'Blunt chest trauma, Rib fractures (R4-R6), Pneumothorax',
        visitHistory: [
            { date: 'Mar 17, 2025', reason: 'MVA – Blunt Chest Trauma', hospital: 'City General Hospital', status: 'admitted' },
            { date: 'Jan 05, 2024', reason: 'Hypertension follow-up', hospital: 'City General Hospital', status: 'discharged' },
            { date: 'Aug 12, 2023', reason: 'Appendicitis – Appendectomy', hospital: 'Apollo Guntur', status: 'discharged' },
        ],
    },
    'MRN-20250317-8805': {
        // SHA-256 of 'Pass@8805'
        passwordHash: 'b50238c17d17d82184f906ae0a4d5906bb2e5b6a70befd2fc8ccc3fe2a4e8b4f',
        patientId: 'INC-8805',
        name: 'Rajesh Kumar', age: 58, gender: 'Male', bloodType: 'B Positive',
        phone: '+91 94400 22233', allergies: ['Sulfa Drugs'],
        admitDate: 'Mar 14, 2025', ward: 'Cardiology Step-down', bed: 'CS-01',
        doctor: 'Dr. Pradeep Nair', specialty: 'Cardiology',
        diagnosis: 'Acute Myocardial Infarction (Mild), Stable',
        visitHistory: [
            { date: 'Mar 14, 2025', reason: 'Mild Heart Attack', hospital: 'City General Hospital', status: 'admitted' },
            { date: 'Nov 20, 2024', reason: 'Chest pain evaluation', hospital: 'City General Hospital', status: 'discharged' },
        ],
    },
    'MRN-20250317-8802': {
        // SHA-256 of 'Pass@8802'
        passwordHash: '388256a9395b82c252ec05fc8377b87469dd253878e7965bff3a7fc2e03b32a2',
        patientId: 'INC-8802',
        name: 'Amitabh Bose', age: 65, gender: 'Male', bloodType: 'A Positive',
        phone: '+91 90000 77788', allergies: ['Aspirin'],
        admitDate: 'Mar 16, 2025', ward: 'Neurology', bed: 'NEU-03',
        doctor: 'Dr. Sunita Rao', specialty: 'Neurology',
        diagnosis: 'Transient Ischaemic Attack (TIA), Under observation',
        visitHistory: [
            { date: 'Mar 16, 2025', reason: 'TIA – Sudden weakness, slurred speech', hospital: 'City General Hospital', status: 'admitted' },
            { date: 'Sep 03, 2024', reason: 'Hypertension management', hospital: 'City General Hospital', status: 'discharged' },
        ],
    },
};



const PORTAL_SERVICES = {
    'INC-8841': [
        { id: 's1', name: 'ICU Bed (per day x3)', category: 'Accommodation', amount: 9000, status: 'unpaid', date: 'Mar 17-19' },
        { id: 's2', name: 'Trauma Surgery - OR', category: 'Surgery', amount: 18500, status: 'unpaid', date: 'Mar 17' },
        { id: 's3', name: 'CT Chest w/o Contrast', category: 'Radiology', amount: 3200, status: 'paid', date: 'Mar 17' },
        { id: 's4', name: 'Arterial Blood Gas', category: 'Lab', amount: 850, status: 'paid', date: 'Mar 17' },
        { id: 's5', name: 'Chest Tube Insertion', category: 'Procedure', amount: 4500, status: 'unpaid', date: 'Mar 17' },
        { id: 's6', name: 'Morphine Sulfate x6 doses', category: 'Pharmacy', amount: 480, status: 'unpaid', date: 'Mar 17-19' },
        { id: 's7', name: 'Attending Physician Fee', category: 'Consultation', amount: 2000, status: 'unpaid', date: 'Mar 17' },
    ],
    'INC-8805': [
        { id: 's1', name: 'Cardiology Step-down (x3)', category: 'Accommodation', amount: 4500, status: 'paid', date: 'Mar 14-17' },
        { id: 's2', name: 'Troponin & Cardiac Markers', category: 'Lab', amount: 1200, status: 'paid', date: 'Mar 14' },
        { id: 's3', name: 'ECG x4 sessions', category: 'Procedure', amount: 1600, status: 'unpaid', date: 'Mar 14-15' },
        { id: 's4', name: 'Cardiologist Consultation', category: 'Consultation', amount: 2500, status: 'unpaid', date: 'Mar 14' },
        { id: 's5', name: 'Aspirin + Statin Therapy', category: 'Pharmacy', amount: 540, status: 'paid', date: 'Mar 14-17' },
    ],
    'INC-8802': [
        { id: 's1', name: 'Neurology Ward Bed (x2)', category: 'Accommodation', amount: 3000, status: 'unpaid', date: 'Mar 16-17' },
        { id: 's2', name: 'MRI Brain w/o Contrast', category: 'Radiology', amount: 5500, status: 'paid', date: 'Mar 16' },
        { id: 's3', name: 'Neurologist Consultation', category: 'Consultation', amount: 2500, status: 'unpaid', date: 'Mar 16' },
        { id: 's4', name: 'Antiplatelet Therapy', category: 'Pharmacy', amount: 320, status: 'unpaid', date: 'Mar 16-17' },
    ],
};

const PORTAL_TIMELINES = {
    'INC-8841': [
        { time: 'Mar 17 - 10:45 AM', icon: 'nurse', label: 'Nursing Update', detail: 'Resting in ICU-01. Chest tube drainage ongoing. Pain managed with medication.' },
        { time: 'Mar 17 - 09:30 AM', icon: 'procedure', label: 'Procedure Completed', detail: 'Chest tube insertion completed by Dr. Aris Mehta.' },
        { time: 'Mar 17 - 09:15 AM', icon: 'scan', label: 'CT Scan Report Ready', detail: 'CT scan confirmed rib fractures with a small pneumothorax.' },
        { time: 'Mar 17 - 08:35 AM', icon: 'doctor', label: 'Doctor Assessment', detail: 'Dr. Aris Mehta completed initial examination. CT scan and blood tests ordered.' },
        { time: 'Mar 17 - 08:25 AM', icon: 'admit', label: 'Admitted to Hospital', detail: 'Received in Trauma Bay 1. Handed over to the care team.' },
        { time: 'Mar 17 - 08:12 AM', icon: 'ambulance', label: 'Paramedic Care En Route', detail: 'Oxygen and IV access established by Unit 42.' },
    ],
    'INC-8805': [
        { time: 'Mar 17 - 11:00 AM', icon: 'nurse', label: 'Nursing Update', detail: 'Vitals stable. Heart rate 72bpm, BP 118/76. Medications given.' },
        { time: 'Mar 15 - 09:00 AM', icon: 'doctor', label: 'Doctor Review', detail: 'Dr. Pradeep Nair reviewed ECG. Condition improving.' },
        { time: 'Mar 14 - 01:45 PM', icon: 'admit', label: 'Admitted to Hospital', detail: 'Admitted to Cardiology Step-down under Dr. Pradeep Nair.' },
    ],
    'INC-8802': [
        { time: 'Mar 17 - 10:00 AM', icon: 'nurse', label: 'Nursing Update', detail: 'No new symptoms. Neurological checks every 4 hours.' },
        { time: 'Mar 16 - 04:00 PM', icon: 'scan', label: 'MRI Scan Completed', detail: 'MRI shows no major stroke. Small vessel changes noted.' },
        { time: 'Mar 16 - 12:30 PM', icon: 'admit', label: 'Admitted to Hospital', detail: 'Admitted to Neurology ward for monitoring.' },
    ],
};

const PORTAL_CASESHEETS = {
    'INC-8841': {
        nurse: 'RN Sarah Jenkins', shift: '07:00-19:00',
        fluidIntake: '1200 mL (IV Normal Saline)', fluidOutput: '850 mL (Urine)',
        medications: [
            { time: '10:00 AM', name: 'Morphine Sulfate', dose: '4mg IV', status: 'given' },
            { time: '08:45 AM', name: 'Cefazolin', dose: '1g IVPB', status: 'given' },
        ],
        notes: [{ time: '11:30 AM', text: 'Resting comfortably. Chest tube draining well (~45mL). Pain 4/10. SpO2 >96%.' }],
    },
    'INC-8805': {
        nurse: 'RN Priya Thomas', shift: '07:00-19:00',
        fluidIntake: '800 mL (Oral + IV)', fluidOutput: '650 mL (Urine)',
        medications: [
            { time: '09:00 AM', name: 'Aspirin', dose: '75mg Oral', status: 'given' },
            { time: '09:00 AM', name: 'Atorvastatin', dose: '40mg Oral', status: 'given' },
        ],
        notes: [{ time: '11:00 AM', text: 'Heart rate 72bpm. BP 118/76. No chest pain reported.' }],
    },
    'INC-8802': {
        nurse: 'RN Deepa Nair', shift: '07:00-19:00',
        fluidIntake: '600 mL (Oral)', fluidOutput: '500 mL (Urine)',
        medications: [{ time: '09:00 AM', name: 'Clopidogrel', dose: '75mg Oral', status: 'given' }],
        notes: [{ time: '10:00 AM', text: 'Neurological observations normal. Speech clear. Patient oriented.' }],
    },
};

const PORTAL_DIAGNOSTICS = {
    'INC-8841': [
        { id: 'D1', type: 'Radiology', name: 'CT Chest w/o Contrast', date: 'Mar 17, 2025', status: 'completed', result: 'Fractures of right ribs 4,5,6. Small right pneumothorax (~1.5cm).', impression: 'Right rib fractures with small pneumothorax. Clinical correlation advised.' },
        { id: 'D2', type: 'Lab', name: 'Arterial Blood Gas', date: 'Mar 17, 2025', status: 'completed', result: 'pH 7.32, PaCO2 48mmHg, PaO2 72mmHg, SpO2 88%', impression: 'Mild respiratory acidosis consistent with pneumothorax.' },
        { id: 'D3', type: 'Lab', name: 'Complete Blood Count', date: 'Mar 17, 2025', status: 'pending', result: null, impression: null },
    ],
    'INC-8805': [
        { id: 'D1', type: 'Lab', name: 'Troponin Levels', date: 'Mar 14, 2025', status: 'completed', result: 'Troponin I: 2.4 ng/mL (elevated).', impression: 'Consistent with mild myocardial infarction.' },
        { id: 'D2', type: 'Radiology', name: 'Echo Cardiogram', date: 'Mar 15, 2025', status: 'pending', result: null, impression: null },
    ],
    'INC-8802': [
        { id: 'D1', type: 'Radiology', name: 'MRI Brain w/o Contrast', date: 'Mar 16, 2025', status: 'completed', result: 'No acute infarct. Small vessel ischaemic changes in periventricular white matter.', impression: 'TIA diagnosis supported. Antiplatelet therapy recommended.' },
    ],
};

const PORTAL_SOS = {
    'INC-8841': [{ id: 'S1', date: 'Mar 17, 2025 - 08:00 AM', type: 'Medical Emergency', trigger: 'Vehicle Sensor + Manual SOS', location: 'NH-16, Near Tenali Junction, AP', unit: 'Ambulance Unit 42', paramedic: 'P. Raju Naik', vitals: { hr: 132, bp: '85/50', spo2: 88 }, outcome: 'Transported to City General Hospital - ICU Admitted' }],
    'INC-8805': [{ id: 'S1', date: 'Mar 14, 2025 - 01:20 PM', type: 'Medical Emergency', trigger: 'Manual SOS - Chest Pain', location: 'Office, Vijayawada', unit: 'Ambulance Unit 11', paramedic: 'D. Suresh Rao', vitals: { hr: 104, bp: '145/92', spo2: 94 }, outcome: 'Transported to City General Hospital - Cardiology Admitted' }],
    'INC-8802': [{ id: 'S1', date: 'Mar 16, 2025 - 12:10 PM', type: 'Medical Emergency', trigger: 'Family called - Slurred Speech', location: 'Home, Hyderabad', unit: 'Ambulance Unit 05', paramedic: 'K. Anitha', vitals: { hr: 88, bp: '172/98', spo2: 96 }, outcome: 'Transported to City General Hospital - Neurology Admitted' }],
};

const catColors = {
    Accommodation: '#dbeafe:#1d4ed8', Surgery: '#fee2e2:#b91c1c',
    Radiology: '#ede9fe:#6d28d9', Lab: '#f3e8ff:#7c3aed',
    Procedure: '#ffe4e6:#be123c', Pharmacy: '#ccfbf1:#0f766e',
    Consultation: '#fef3c7:#92400e', Nursing: '#dcfce7:#15803d',
};
const catBadge = (cat) => {
    const [bg, color] = (catColors[cat] || '#f1f5f9:#475569').split(':');
    return { background: bg, color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', display: 'inline-block' };
};

const timelineDot = { nurse: '#ccfbf1', procedure: '#ffe4e6', scan: '#ede9fe', lab: '#f3e8ff', doctor: '#dbeafe', admit: '#dcfce7', ambulance: '#fef3c7' };
const timelineEmoji = { nurse: '📋', procedure: '💉', scan: '🔬', lab: '🧪', doctor: '👨‍⚕️', admit: '🏥', ambulance: '🚑' };

const css = {
    page: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,sans-serif', color: '#0f172a' },
    card: { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 18, marginBottom: 14 },
    label: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', display: 'block', marginBottom: 6 },
    muted: { fontSize: 13, color: '#64748b', margin: 0 },
    small: { fontSize: 11, color: '#94a3b8', margin: 0 },
    row: { display: 'flex', alignItems: 'center' },
    btwn: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    g2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    g3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
    g4: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 },
    badge: (bg, color) => ({ background: bg, color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', display: 'inline-block' }),
};

class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { err: null }; }
    static getDerivedStateFromError(e) { return { err: e }; }
    render() {
        if (this.state.err) return (
            <div style={{ padding: 32, background: '#fef2f2', borderRadius: 12, margin: 32, fontFamily: 'system-ui,sans-serif' }}>
                <p style={{ fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Portal Error - please report this</p>
                <pre style={{ fontSize: 12, color: '#7f1d1d', whiteSpace: 'pre-wrap' }}>{this.state.err.message}</pre>
            </div>
        );
        return this.props.children;
    }
}

export default function PatientPortal() {
  const patientProfile = (() => { try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; } })();
  const patientName = patientProfile.name || 'Patient';
  const patientMRN  = patientProfile.mrn || patientProfile.userId || '';
  const patientBlood = patientProfile.blood || '';

    const [session, setSession] = useState(null);
    const [tab, setTab] = useState('overview');
    return (
        <ErrorBoundary>
            {!session
                ? <LoginScreen onLogin={setSession} />
                : <Dashboard session={session} tab={tab} setTab={setTab} onLogout={() => { setSession(null); setTab('overview'); }} />
            }
        </ErrorBoundary>
    );
}

function LoginScreen({ onLogin }) {
    const [mrn, setMrn] = useState('');
    const [pw, setPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!mrn.trim() || !pw.trim()) { setErr('Enter both MRN and password.'); return; }
        setLoading(true); setErr('');
        try {
            const rec = PATIENT_REGISTRY[mrn.trim()];
            if (!rec) { setErr('Invalid MRN or password.'); setLoading(false); return; }

            // Hash the entered password with SHA-256 via Web Crypto API and compare
            const encoded = new TextEncoder().encode(pw);
            const hashBuf = await window.crypto.subtle.digest('SHA-256', encoded);
            const hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

            // Simulate network latency
            await new Promise(r => setTimeout(r, 600));

            if (hashHex !== rec.passwordHash) { setErr('Invalid MRN or password.'); setLoading(false); return; }

            setLoading(false);
            const { passwordHash: _, ...sessionData } = rec;
            onLogin({ mrn: mrn.trim(), ...sessionData });
        } catch {
            setErr('Login error. Please try again.'); setLoading(false);
        }
    };

    const inputStyle = (extra = {}) => ({
        width: '100%', boxSizing: 'border-box', paddingTop: 11, paddingBottom: 11,
        paddingLeft: 40, paddingRight: 12, border: '1.5px solid #e2e8f0',
        borderRadius: 10, fontSize: 14, color: '#0f172a', outline: 'none',
        background: '#fff', fontFamily: 'inherit', ...extra,
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'linear-gradient(135deg,#eff6ff,#fff,#f5f3ff)', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ width: 60, height: 60, background: '#2563eb', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
                    <IHeart size={28} />
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>NexVitals Patient Portal</h1>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Your health records, anytime</p>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', width: '100%', maxWidth: 400, padding: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Welcome back</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>Sign in with your MRN and password</p>

                <div style={{ marginBottom: 12 }}>
                    <label style={css.label}>Medical Record Number</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center', lineHeight: 0, fontSize: 0 }}><IHash /></span>
                        <input style={inputStyle({ fontFamily: 'monospace' })} value={mrn}
                            onChange={e => { setMrn(e.target.value); setErr(''); }}
                            onKeyDown={e => e.key === 'Enter' && submit()}
                            placeholder="MRN-20250317-8841" />
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={css.label}>Password</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center', lineHeight: 0, fontSize: 0 }}><ILock /></span>
                        <input style={inputStyle({ paddingRight: 40 })} type={showPw ? 'text' : 'password'} value={pw}
                            onChange={e => { setPw(e.target.value); setErr(''); }}
                            onKeyDown={e => e.key === 'Enter' && submit()}
                            placeholder="Enter your password" />
                        <span role="button" onClick={() => setShowPw(s => !s)}
                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', lineHeight: 0, fontSize: 0 }}>
                            {showPw ? <IEyeOff /> : <IEye />}
                        </span>
                    </div>
                </div>

                {err && (
                    <div style={{ display: 'flex', alignItems: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', marginBottom: 12 }}>
                        <span style={{ marginRight: 8, color: '#ef4444' }}><IAlert /></span>
                        <span style={{ fontSize: 13, color: '#b91c1c' }}>{err}</span>
                    </div>
                )}

                <button onClick={submit} disabled={loading}
                    style={{ width: '100%', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 700, padding: '12px 0', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14 }}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 14 }}>
                    MRN and password are issued at hospital registration.
                </p>
            </div>

            <div style={{ marginTop: 14, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 14, width: '100%', maxWidth: 400 }}>
                <p style={{ ...css.label, color: '#1d4ed8', marginBottom: 8 }}>Demo — click to auto-fill</p>
                {[
                    ['MRN-20250317-8841', 'Pass@8841', 'S. Venkata Raghavan'],
                    ['MRN-20250317-8805', 'Pass@8805', 'Rajesh Kumar'],
                    ['MRN-20250317-8802', 'Pass@8802', 'Amitabh Bose'],
                ].map(([m, p, n]) => (
                    <div key={m} role="button" onClick={() => { setMrn(m); setPw(p); setErr(''); }}
                        style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px', marginBottom: 6, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1e40af' }}>{n}</span>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#60a5fa', letterSpacing: 2 }}>••••••••</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const TABS = ['overview', 'records', 'diagnostics', 'billing', 'sos', 'discharge'];
const TAB_LABELS = { overview: 'Overview', records: 'My Records', diagnostics: 'Reports', billing: 'Billing', sos: 'SOS History', discharge: 'Discharge' };

function Dashboard({ session, tab, setTab, onLogout }) {
    const discharge = DISCHARGE_STATE[session.patientId] || {};
    const [sessionToast, setSessionToast] = useState(false);
    const timerRef = useRef(null);
    const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

    useEffect(() => {
        const resetTimer = () => {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                setSessionToast(true);
                setTimeout(() => {
                    setSessionToast(false);
                    onLogout();
                }, 2500);
            }, TIMEOUT_MS);
        };
        resetTimer();
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        return () => {
            clearTimeout(timerRef.current);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
        };
    }, []); // eslint-disable-line

    return (
        <div style={css.page}>
            {/* Session Expired Toast */}
            {sessionToast && (
                <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, minWidth: 280 }}>
                    <span style={{ fontSize: 16 }}>🔒</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Session expired for your security</span>
                </div>
            )}
            <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 30 }}>
                <div style={{ maxWidth: 880, margin: '0 auto', padding: '10px 16px', ...css.btwn }}>
                    <div style={css.row}>
                        <div style={{ width: 34, height: 34, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                            <IHeart size={18} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>NexVitals Patient Portal</div>
                            <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{session.mrn}</div>
                        </div>
                    </div>
                    <div style={css.row}>
                        {discharge.billerApproved && <span style={{ ...css.badge('#dbeafe', '#1d4ed8'), marginRight: 10 }}>Ready for Discharge</span>}
                        <div style={{ width: 32, height: 32, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#475569', marginRight: 8 }}>
                            {session.name.charAt(0)}
                        </div>
                        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569' }}>
                            <ILogOut /> Logout
                        </button>
                    </div>
                </div>
                <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 16px', display: 'flex', overflowX: 'auto', gap: 0 }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent', color: tab === t ? '#2563eb' : '#64748b' }}>
                            {TAB_LABELS[t]}
                            {t === 'sos' && (PORTAL_SOS[session.patientId] || []).length > 0 &&
                                <span style={{ marginLeft: 5, background: '#fee2e2', color: '#dc2626', borderRadius: 10, padding: '1px 5px', fontSize: 10 }}>
                                    {(PORTAL_SOS[session.patientId] || []).length}
                                </span>}
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ maxWidth: 880, margin: '0 auto', padding: 16 }}>
                {tab === 'overview' && <OverviewTab session={session} setTab={setTab} />}
                {tab === 'records' && <RecordsTab session={session} />}
                {tab === 'diagnostics' && <DiagnosticsTab session={session} />}
                {tab === 'billing' && <BillingTab session={session} />}
                {tab === 'sos' && <SOSTab session={session} />}
                {tab === 'discharge' && <DischargeTab session={session} />}
            </div>
        </div>
    );
}

function OverviewTab({ session, setTab }) {
    const svcs = PORTAL_SERVICES[session.patientId] || [];
    const due = svcs.filter(s => s.status === 'unpaid').reduce((a, s) => a + s.amount, 0);
    const discharge = DISCHARGE_STATE[session.patientId] || {};
    const timeline = (PORTAL_TIMELINES[session.patientId] || []).slice(0, 3);
    return (
        <div>
            <div style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: 14, padding: 22, marginBottom: 14, color: '#fff' }}>
                <p style={{ fontSize: 12, color: '#93c5fd', marginBottom: 2 }}>Welcome back,</p>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>{session.name}</h2>
                <p style={{ fontSize: 13, color: '#bfdbfe', margin: 0 }}>{session.ward} · Bed {session.bed} · {session.doctor}</p>
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[`Admitted ${session.admitDate}`, session.mrn].map(t => (
                        <span key={t} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{t}</span>
                    ))}
                </div>
            </div>

            <div style={{ ...css.g4, marginBottom: 14 }}>
                {[
                    { label: 'Reports Ready', value: (PORTAL_DIAGNOSTICS[session.patientId] || []).filter(d => d.status === 'completed').length, tab: 'diagnostics', bg: '#f5f3ff' },
                    { label: 'Amount Due', value: `Rs.${due.toLocaleString('en-IN')}`, tab: 'billing', bg: '#fef2f2' },
                    { label: 'SOS Events', value: (PORTAL_SOS[session.patientId] || []).length, tab: 'sos', bg: '#fffbeb' },
                    { label: 'Discharge', value: discharge.billerApproved ? 'Approved' : discharge.doctorRequested ? 'Pending' : 'Not Yet', tab: 'discharge', bg: discharge.billerApproved ? '#eff6ff' : '#f8fafc' },
                ].map(item => (
                    <div key={item.label} role="button" onClick={() => setTab(item.tab)}
                        style={{ ...css.card, background: item.bg, cursor: 'pointer', marginBottom: 0, textAlign: 'center', padding: 14 }}>
                        <p style={css.label}>{item.label}</p>
                        <p style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>{item.value}</p>
                    </div>
                ))}
            </div>

            <div style={css.card}>
                <p style={css.label}>Current Diagnosis</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>{session.diagnosis}</p>
                <div style={css.g2}>
                    {[
                        { l: 'Attending Doctor', v: session.doctor, s: session.specialty },
                        { l: 'Location', v: session.ward, s: `Bed ${session.bed}` },
                        { l: 'Blood Type', v: session.bloodType, s: '' },
                        { l: 'Allergies', v: session.allergies.join(', '), s: '' },
                    ].map(item => (
                        <div key={item.l} style={{ background: '#f8fafc', borderRadius: 10, padding: 10 }}>
                            <p style={css.label}>{item.l}</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{item.v}</p>
                            {item.s && <p style={css.small}>{item.s}</p>}
                        </div>
                    ))}
                </div>
            </div>

            <div style={css.card}>
                <div style={{ ...css.btwn, marginBottom: 12 }}>
                    <p style={{ ...css.label, marginBottom: 0 }}>Recent Activity</p>
                    <span role="button" onClick={() => setTab('records')} style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>View all</span>
                </div>
                {timeline.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: timelineDot[ev.icon] || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0, fontSize: 13 }}>
                            {timelineEmoji[ev.icon] || '•'}
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 1px' }}>{ev.label}</p>
                            <p style={css.small}>{ev.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RecordsTab({ session }) {
    const [open, setOpen] = useState('timeline');
    const timeline = PORTAL_TIMELINES[session.patientId] || [];
    const casesheet = PORTAL_CASESHEETS[session.patientId];

    return (
        <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Medical Records</h2>
            <p style={{ ...css.muted, marginBottom: 14 }}>Your complete treatment history this admission</p>

            <Accordion title="Visit History" sub={`${session.visitHistory.length} visits on file`} open={open === 'visits'} onToggle={() => setOpen(open === 'visits' ? null : 'visits')}>
                {session.visitHistory.map((v, i) => (
                    <div key={i} style={{ ...css.btwn, background: '#f8fafc', borderRadius: 9, padding: 10, marginBottom: 7 }}>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{v.reason}</p>
                            <p style={css.small}>{v.hospital} · {v.date}</p>
                        </div>
                        <span style={v.status === 'admitted' ? css.badge('#dbeafe', '#1d4ed8') : css.badge('#dcfce7', '#15803d')}>{v.status}</span>
                    </div>
                ))}
            </Accordion>

            <Accordion title="Medical Timeline" sub="Events during this admission" open={open === 'timeline'} onToggle={() => setOpen(open === 'timeline' ? null : 'timeline')}>
                <div style={{ borderLeft: '2px solid #e2e8f0', marginLeft: 10, paddingLeft: 18 }}>
                    {timeline.map((ev, i) => (
                        <div key={i} style={{ position: 'relative', marginBottom: 13 }}>
                            <div style={{ position: 'absolute', left: -24, top: 6, width: 12, height: 12, borderRadius: '50%', background: timelineDot[ev.icon] || '#f1f5f9', border: '2px solid #fff' }} />
                            <div style={{ background: '#f8fafc', borderRadius: 9, padding: 10 }}>
                                <div style={{ ...css.btwn, marginBottom: 3 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{ev.label}</p>
                                    <span style={css.small}>{ev.time}</span>
                                </div>
                                <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{ev.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Accordion>

            {casesheet && (
                <Accordion title="Nurse Case Sheet" sub={`${casesheet.nurse} · ${casesheet.shift}`} open={open === 'casesheet'} onToggle={() => setOpen(open === 'casesheet' ? null : 'casesheet')}>
                    <div style={{ ...css.g2, marginBottom: 12 }}>
                        <div style={{ background: '#eff6ff', borderRadius: 9, padding: 10 }}>
                            <p style={css.label}>Fluid Intake</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>{casesheet.fluidIntake}</p>
                        </div>
                        <div style={{ background: '#fffbeb', borderRadius: 9, padding: 10 }}>
                            <p style={css.label}>Fluid Output</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', margin: 0 }}>{casesheet.fluidOutput}</p>
                        </div>
                    </div>
                    <p style={css.label}>Medications Given</p>
                    {casesheet.medications.map((m, i) => (
                        <div key={i} style={{ ...css.btwn, background: '#f8fafc', borderRadius: 8, padding: '8px 10px', marginBottom: 5 }}>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{m.name}</p>
                                <p style={css.small}>{m.dose} · {m.time}</p>
                            </div>
                            <span style={css.badge('#dcfce7', '#15803d')}>{m.status}</span>
                        </div>
                    ))}
                    <p style={{ ...css.label, marginTop: 12 }}>Nursing Notes</p>
                    {casesheet.notes.map((n, i) => (
                        <div key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 10 }}>
                            <p style={css.small}>{n.time}</p>
                            <p style={{ fontSize: 13, color: '#166534', margin: '3px 0 0' }}>{n.text}</p>
                        </div>
                    ))}
                </Accordion>
            )}
        </div>
    );
}

function DiagnosticsTab({ session }) {
    const [exp, setExp] = useState(null);
    const reports = PORTAL_DIAGNOSTICS[session.patientId] || [];
    const live = DIAGNOSTICS_RESULTS_STORE[session.patientId];
    return (
        <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Diagnostic Reports</h2>
            <p style={{ ...css.muted, marginBottom: 14 }}>Lab results, radiology and procedures</p>
            {live && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ marginRight: 8, display: 'flex', lineHeight: 0, fontSize: 0 }}><ICheck size={18} /></span>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#166534', margin: 0 }}>New result uploaded by hospital</p>
                        <p style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>{live.testName} · {live.fileName} · {live.uploadedAt}</p>
                    </div>
                </div>
            )}
            {reports.map(rep => (
                <div key={rep.id} style={{ ...css.card, cursor: 'pointer' }} onClick={() => setExp(exp === rep.id ? null : rep.id)}>
                    <div style={css.btwn}>
                        <div style={css.row}>
                            <div style={{ width: 38, height: 38, background: rep.type === 'Radiology' ? '#dbeafe' : rep.type === 'Lab' ? '#f3e8ff' : '#fce7f3', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, color: rep.type === 'Radiology' ? '#1d4ed8' : rep.type === 'Lab' ? '#7e22ce' : '#be185d' }}>
                                {rep.type === 'Radiology' ? <IMicro size={18} /> : <IFlask size={18} />}
                            </div>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{rep.name}</p>
                                <p style={css.small}>{rep.date} · {rep.type}</p>
                            </div>
                        </div>
                        <div style={css.row}>
                            <span style={rep.status === 'completed' ? css.badge('#dcfce7', '#15803d') : css.badge('#fef3c7', '#92400e')}>{rep.status}</span>
                            <span style={{ marginLeft: 8, color: '#94a3b8' }}><IChevDown /></span>
                        </div>
                    </div>
                    {exp === rep.id && rep.status === 'completed' && (
                        <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                            <div style={{ background: '#f8fafc', borderRadius: 9, padding: 10, marginBottom: 8 }}>
                                <p style={css.label}>Findings</p>
                                <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{rep.result}</p>
                            </div>
                            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9, padding: 10, marginBottom: 8 }}>
                                <p style={css.label}>Impression</p>
                                <p style={{ fontSize: 13, color: '#1e40af', fontWeight: 600, margin: 0 }}>{rep.impression}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 600, color: '#64748b', gap: 6 }}>
                                <IDownload /> Download Report <span style={css.badge('#fef3c7', '#92400e')}>Requires backend</span>
                            </div>
                        </div>
                    )}
                    {exp === rep.id && rep.status === 'pending' && (
                        <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, padding: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <IClock />
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', margin: 0 }}>Result not yet available</p>
                                    <p style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>Your doctor will be notified when ready.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function BillingTab({ session }) {
    const svcs = PORTAL_SERVICES[session.patientId] || [];
    const total = svcs.reduce((a, s) => a + s.amount, 0);
    const paid = svcs.filter(s => s.status === 'paid').reduce((a, s) => a + s.amount, 0);
    const due = total - paid;
    const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
    return (
        <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Billing & Payments</h2>
            <p style={{ ...css.muted, marginBottom: 14 }}>Itemised charges for this admission</p>
            <div style={{ ...css.g3, marginBottom: 14 }}>
                {[{ l: 'Total Bill', v: `Rs.${total.toLocaleString('en-IN')}`, bg: '#fff' }, { l: 'Paid', v: `Rs.${paid.toLocaleString('en-IN')}`, bg: '#f0fdf4' }, { l: 'Due', v: `Rs.${due.toLocaleString('en-IN')}`, bg: '#fef2f2' }].map(item => (
                    <div key={item.l} style={{ ...css.card, marginBottom: 0, textAlign: 'center', background: item.bg, padding: 14 }}>
                        <p style={css.label}>{item.l}</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>{item.v}</p>
                    </div>
                ))}
            </div>
            <div style={{ ...css.card, marginBottom: 14 }}>
                <div style={{ ...css.btwn, marginBottom: 6 }}>
                    <span style={css.label}>Payment Progress</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>{pct}% cleared</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 999, height: 9, overflow: 'hidden' }}>
                    <div style={{ background: '#22c55e', height: '100%', width: `${pct}%`, borderRadius: 999 }} />
                </div>
            </div>
            <div style={css.card}>
                <p style={css.label}>Itemised Services</p>
                {svcs.map(svc => (
                    <div key={svc.id} style={{ ...css.btwn, padding: '10px 0', borderBottom: '1px solid #f1f5f9', opacity: svc.status === 'paid' ? 0.55 : 1 }}>
                        <div style={css.row}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: svc.status === 'paid' ? '#dcfce7' : '#fee2e2', border: svc.status === 'paid' ? '2px solid #86efac' : '2px solid #fca5a5', marginRight: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {svc.status === 'paid' && <span style={{ fontSize: 9, color: '#15803d' }}>✓</span>}
                            </div>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 3px', textDecoration: svc.status === 'paid' ? 'line-through' : 'none' }}>{svc.name}</p>
                                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                    <span style={catBadge(svc.category)}>{svc.category}</span>
                                    <span style={css.small}>{svc.date}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ ...css.row, gap: 7, flexShrink: 0, marginLeft: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: svc.status === 'paid' ? '#94a3b8' : '#0f172a' }}>Rs.{svc.amount.toLocaleString('en-IN')}</span>
                            <span style={svc.status === 'paid' ? css.badge('#dcfce7', '#15803d') : css.badge('#fee2e2', '#b91c1c')}>{svc.status}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 12, fontSize: 13, color: '#1d4ed8', fontWeight: 500 }}>
                Payments are processed at the hospital billing counter. Contact billing staff to clear outstanding dues.
            </div>
        </div>
    );
}

function SOSTab({ session }) {
    const [exp, setExp] = useState(null);
    const events = PORTAL_SOS[session.patientId] || [];
    return (
        <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>SOS & Emergency History</h2>
            <p style={{ ...css.muted, marginBottom: 14 }}>All emergency events linked to your account</p>
            {events.length === 0 && <div style={{ ...css.card, textAlign: 'center', padding: 36 }}><p style={{ fontSize: 32 }}>🛡️</p><p style={css.muted}>No SOS events on record</p></div>}
            {events.map(ev => (
                <div key={ev.id} style={css.card}>
                    <div style={{ ...css.btwn, cursor: 'pointer' }} onClick={() => setExp(exp === ev.id ? null : ev.id)}>
                        <div style={css.row}>
                            <div style={{ width: 38, height: 38, background: '#fee2e2', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, fontSize: 18 }}>🚑</div>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{ev.type}</p>
                                <p style={css.small}>{ev.date}</p>
                            </div>
                        </div>
                        <div style={css.row}>
                            <span style={css.badge('#fee2e2', '#b91c1c')}>{ev.unit}</span>
                            <span style={{ marginLeft: 8, color: '#94a3b8' }}><IChevDown /></span>
                        </div>
                    </div>
                    {exp === ev.id && (
                        <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                            <div style={{ ...css.g2, marginBottom: 10 }}>
                                <div style={{ background: '#f8fafc', borderRadius: 9, padding: 10 }}>
                                    <p style={css.label}>Trigger</p>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{ev.trigger}</p>
                                </div>
                                <div style={{ background: '#f8fafc', borderRadius: 9, padding: 10 }}>
                                    <p style={css.label}>Paramedic</p>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{ev.paramedic}</p>
                                </div>
                            </div>
                            <div style={{ background: '#f8fafc', borderRadius: 9, padding: 10, marginBottom: 10 }}>
                                <p style={css.label}>Location</p>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{ev.location}</p>
                            </div>
                            <p style={{ ...css.label, marginBottom: 8 }}>Vitals at Scene</p>
                            <div style={css.g3}>
                                {[['Heart Rate', ev.vitals.hr, 'bpm', '#fee2e2'], ['Blood Pressure', ev.vitals.bp, 'mmHg', '#eff6ff'], ['SpO2', ev.vitals.spo2, '%', '#f5f3ff']].map(([l, v, u, bg]) => (
                                    <div key={l} style={{ background: bg, borderRadius: 9, padding: 10, textAlign: 'center' }}>
                                        <p style={css.label}>{l}</p>
                                        <p style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>{v}</p>
                                        <p style={css.small}>{u}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 9, padding: 10, marginTop: 10 }}>
                                <p style={css.label}>Outcome</p>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#166534', margin: 0 }}>{ev.outcome}</p>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function DischargeTab({ session }) {
    const discharge = DISCHARGE_STATE[session.patientId] || {};
    const svcs = PORTAL_SERVICES[session.patientId] || [];
    const allPaid = svcs.length > 0 && svcs.every(s => s.status === 'paid');
    const steps = [
        { label: 'Doctor approves discharge', done: !!discharge.doctorRequested },
        { label: 'All billing dues cleared', done: allPaid },
        { label: 'Biller confirms clearance', done: !!discharge.billerApproved },
        { label: 'Ready to leave hospital', done: !!discharge.billerApproved },
    ];
    return (
        <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Discharge Status</h2>
            <p style={{ ...css.muted, marginBottom: 14 }}>Track your discharge progress in real time</p>
            <div style={{ background: discharge.billerApproved ? '#2563eb' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 28, textAlign: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 36, margin: '0 0 8px' }}>{discharge.billerApproved ? '✅' : '⏳'}</p>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: discharge.billerApproved ? '#fff' : '#0f172a', margin: '0 0 6px' }}>
                    {discharge.billerApproved ? 'You are cleared for discharge' : 'Discharge in progress'}
                </h3>
                <p style={{ fontSize: 13, color: discharge.billerApproved ? '#bfdbfe' : '#64748b', margin: 0 }}>
                    {discharge.billerApproved ? 'Proceed to the discharge counter with your ID.' : 'Complete the steps below to be cleared.'}
                </p>
            </div>
            <div style={css.card}>
                <p style={css.label}>Discharge Checklist</p>
                {steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 10, background: step.done ? '#22c55e' : '#f1f5f9', border: step.done ? 'none' : '2px solid #cbd5e1' }}>
                            {step.done ? <span style={{ color: '#fff', fontSize: 13 }}>✓</span> : <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{i + 1}</span>}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: step.done ? '#15803d' : '#94a3b8', margin: 0, textDecoration: step.done ? 'line-through' : 'none' }}>{step.label}</p>
                    </div>
                ))}
            </div>
            {!allPaid && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ marginRight: 8, color: '#ef4444' }}><IAlert /></span>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', margin: 0 }}>Outstanding dues must be cleared</p>
                        <p style={{ fontSize: 12, color: '#dc2626', marginTop: 3 }}>Rs.{svcs.filter(s => s.status === 'unpaid').reduce((a, s) => a + s.amount, 0).toLocaleString('en-IN')} remaining. Please visit the billing counter.</p>
                    </div>
                </div>
            )}
            <div style={css.card}>
                <p style={css.label}>Need Help?</p>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 7 }}>
                    <IPhone /><span style={{ fontSize: 13, color: '#475569', marginLeft: 8 }}>Billing Counter: <strong>+91 863 222 3344</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IMapPin /><span style={{ fontSize: 13, color: '#475569', marginLeft: 8 }}>Ground Floor, Block A, City General Hospital</span>
                </div>
            </div>
        </div>
    );
}

function Accordion({ title, sub, open, onToggle, children }) {
    return (
        <div style={{ ...css.card, padding: 0, overflow: 'hidden' }}>
            <div style={{ ...css.btwn, padding: '13px 14px', cursor: 'pointer' }} onClick={onToggle}>
                <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</p>
                    <p style={css.small}>{sub}</p>
                </div>
                <IChevDown />
            </div>
            {open && <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 14px' }}>{children}</div>}
        </div>
    );
}