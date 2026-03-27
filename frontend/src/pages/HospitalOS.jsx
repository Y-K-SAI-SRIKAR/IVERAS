import React, { useState, useEffect, useReducer, useCallback } from 'react';
import {
    Activity, Users, Bed, Stethoscope, Receipt, ShieldAlert, AlertTriangle,
    CheckCircle, ChevronRight, BrainCircuit, Clock, UserPlus, Ambulance,
    Thermometer, HeartPulse, Syringe, TestTube, FileText, DollarSign,
    TrendingUp, AlertOctagon, BarChart3, MapPin, Wind, Droplets, ArrowLeft,
    ClipboardList, Microscope, X, Image as ImageIcon, PenTool, Send, Hash,
    Radio, Wifi, Navigation, ChevronDown, Zap, ShieldCheck
} from 'lucide-react';

/* ─── DESIGN SYSTEM ───────────────────────────────────────────────────────── */
const DS = {
    bg: "#070C14",
    surface: "#0D1520",
    surfaceHigh: "#111D2E",
    surfaceHover: "#162034",
    border: "#1C2D42",
    borderLight: "#243650",
    text: "#E8F0F8",
    textMid: "#7A9BB8",
    textDim: "#3D5A75",
    accent: "#0EA5E9",
    green: "#10B981",
    red: "#EF4444",
    amber: "#F59E0B",
    purple: "#8B5CF6",
    contentBg: "#F7F9FC",
    contentSurface: "#FFFFFF",
    contentCard: "#EEF2F8",
    contentBorder: "#DDE5EF",
    contentText: "#0F172A",
    contentTextMid: "#475569",
    contentTextDim: "#94A3B8",
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1C2D42; border-radius: 2px; }
  .content-scroll::-webkit-scrollbar-thumb { background: #DDE5EF; }
  @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes slide-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fade-in { from{opacity:0} to{opacity:1} }
  @keyframes ping { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
  @keyframes stream-tick { 0%{opacity:1} 50%{opacity:0.4} 100%{opacity:1} }
  @keyframes critical-border { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0)} 50%{box-shadow:0 0 0 4px rgba(239,68,68,0.25)} }
  @keyframes discharge-border { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0)} 50%{box-shadow:0 0 0 4px rgba(245,158,11,0.25)} }
  .dark-card-scroll::-webkit-scrollbar-thumb { background: #243650; }
`;

/* ─── GLOBAL EVENT SYSTEM (Toasts) ────────────────────────────────────────── */
let toastListeners = [];
const notify = (msg, type = 'info') => {
    toastListeners.forEach(l => l(msg, type));
};

/* ─── GLOBAL STORES (Mutable for Cross-Module Sync & Simulation) ──────────── */
function generateMRN() {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    return `MRN-${datePart}-${String(Math.floor(1000 + Math.random() * 9000))}`;
}
const MRN_STORE = {};
function getOrCreateMRN(patientId) {
    if (!MRN_STORE[patientId]) MRN_STORE[patientId] = generateMRN();
    return MRN_STORE[patientId];
}
['INC-8841', 'INC-8843', 'INC-8830', 'INC-8812', 'INC-8825', 'INC-8831', 'INC-8822', 'INC-8815', 'INC-8818', 'INC-8829', 'INC-8805', 'INC-8809', 'INC-8814', 'INC-8820', 'INC-8802', 'INC-8811', 'INC-8790', 'INC-8791', 'INC-8842', 'INC-8849', 'INC-8899', 'INC-8900', 'INC-8901'].forEach(id => getOrCreateMRN(id));

const DIAGNOSTICS_RESULTS_STORE = {};
const PATIENT_SERVICES = {
    'INC-8841': [{ id: 's1', name: 'ICU Bed (per day × 3)', category: 'Accommodation', amount: 9000, status: 'unpaid' }, { id: 's2', name: 'Trauma Surgery – OR', category: 'Surgery', amount: 18500, status: 'unpaid' }, { id: 's3', name: 'CT Chest w/o Contrast', category: 'Radiology', amount: 3200, status: 'paid' }, { id: 's4', name: 'Arterial Blood Gas (ABG)', category: 'Lab', amount: 850, status: 'paid' }, { id: 's5', name: 'Chest Tube Insertion', category: 'Procedure', amount: 4500, status: 'unpaid' }, { id: 's6', name: 'Morphine Sulfate × 6 doses', category: 'Pharmacy', amount: 480, status: 'unpaid' }, { id: 's7', name: 'Attending Physician Fee', category: 'Consultation', amount: 2000, status: 'unpaid' }],
    'INC-8830': [{ id: 's1', name: 'ICU Bed (per day × 1)', category: 'Accommodation', amount: 3000, status: 'paid' }, { id: 's2', name: 'Wound Closure – Lacerations', category: 'Procedure', amount: 1800, status: 'unpaid' }, { id: 's3', name: 'CBC & Blood Panel', category: 'Lab', amount: 650, status: 'paid' }, { id: 's4', name: 'Dressing & Supplies', category: 'Pharmacy', amount: 320, status: 'unpaid' }],
    'INC-8812': [{ id: 's1', name: 'ICU Bed (per day × 2)', category: 'Accommodation', amount: 6000, status: 'paid' }, { id: 's2', name: 'Appendectomy – OR Fee', category: 'Surgery', amount: 12000, status: 'paid' }, { id: 's3', name: 'Post-Op Monitoring', category: 'Nursing', amount: 2500, status: 'unpaid' }, { id: 's4', name: 'Anaesthesia Fee', category: 'Procedure', amount: 5000, status: 'paid' }, { id: 's5', name: 'Cefazolin Antibiotic Course', category: 'Pharmacy', amount: 780, status: 'unpaid' }],
    'INC-8831': [{ id: 's1', name: 'General Ward Bed (× 2 days)', category: 'Accommodation', amount: 2000, status: 'paid' }, { id: 's2', name: 'DKA Management Protocol', category: 'Procedure', amount: 3500, status: 'unpaid' }, { id: 's3', name: 'Blood Glucose Monitoring × 8', category: 'Lab', amount: 400, status: 'unpaid' }, { id: 's4', name: 'Insulin Infusion', category: 'Pharmacy', amount: 960, status: 'unpaid' }],
    'INC-8805': [{ id: 's1', name: 'Cardiology Step-down (× 3)', category: 'Accommodation', amount: 4500, status: 'paid' }, { id: 's2', name: 'Troponin & Cardiac Markers', category: 'Lab', amount: 1200, status: 'paid' }, { id: 's3', name: 'ECG × 4 sessions', category: 'Procedure', amount: 1600, status: 'unpaid' }, { id: 's4', name: 'Cardiologist Consultation', category: 'Consultation', amount: 2500, status: 'unpaid' }, { id: 's5', name: 'Aspirin + Statin Therapy', category: 'Pharmacy', amount: 540, status: 'paid' }],
    'INC-8802': [{ id: 's1', name: 'Neurology Ward Bed (× 2)', category: 'Accommodation', amount: 3000, status: 'unpaid' }, { id: 's2', name: 'MRI Brain w/o Contrast', category: 'Radiology', amount: 5500, status: 'paid' }, { id: 's3', name: 'Neurologist Consultation', category: 'Consultation', amount: 2500, status: 'unpaid' }, { id: 's4', name: 'Antiplatelet Therapy', category: 'Pharmacy', amount: 320, status: 'unpaid' }],
};
function getPatientServices(id) { return PATIENT_SERVICES[id] || [{ id: 's1', name: 'General Ward Bed (× 1 day)', category: 'Accommodation', amount: 1500, status: 'unpaid' }, { id: 's2', name: 'Physician Consultation', category: 'Consultation', amount: 1200, status: 'unpaid' }, { id: 's3', name: 'Basic Lab Panel', category: 'Lab', amount: 600, status: 'paid' }, { id: 's4', name: 'Medications', category: 'Pharmacy', amount: 450, status: 'unpaid' }]; }

const ALL_ADMITTED_PATIENTS = [{ id: 'INC-8841', name: 'S. Venkata Raghavan', ward: 'ICU - Trauma', doctor: 'Dr. Aris Mehta', admitDate: 'Mar 17' }, { id: 'INC-8830', name: 'Priya Nair', ward: 'ICU - Trauma', doctor: 'Dr. Aris Mehta', admitDate: 'Mar 17' }, { id: 'INC-8812', name: 'Vikram Singh', ward: 'ICU - Trauma', doctor: 'Dr. Aris Mehta', admitDate: 'Mar 16' }, { id: 'INC-8825', name: 'Aisha Khan', ward: 'ICU - Trauma', doctor: 'Dr. Kavya Reddy', admitDate: 'Mar 16' }, { id: 'INC-8831', name: 'Ramesh Gupta', ward: 'General Ward A', doctor: 'Dr. Kavya Reddy', admitDate: 'Mar 15' }, { id: 'INC-8822', name: 'Sunil Patel', ward: 'General Ward A', doctor: 'Dr. Kavya Reddy', admitDate: 'Mar 15' }, { id: 'INC-8815', name: 'Meera Joshi', ward: 'General Ward A', doctor: 'Dr. Kavya Reddy', admitDate: 'Mar 16' }, { id: 'INC-8805', name: 'Rajesh Kumar', ward: 'Cardiology Step-down', doctor: 'Dr. Pradeep Nair', admitDate: 'Mar 14' }, { id: 'INC-8809', name: 'Sneha Verma', ward: 'Cardiology Step-down', doctor: 'Dr. Pradeep Nair', admitDate: 'Mar 15' }, { id: 'INC-8802', name: 'Amitabh Bose', ward: 'Neurology', doctor: 'Dr. Sunita Rao', admitDate: 'Mar 16' }, { id: 'INC-8811', name: 'Kavita Menon', ward: 'Neurology', doctor: 'Dr. Sunita Rao', admitDate: 'Mar 17' }];
const PROVIDERS = [{ id: 1, name: 'Dr. Aris Mehta', specialty: 'Trauma Surgery', shift: '07:00-19:00', load: 3, capacity: 8, tags: ['TRAUMA', 'CRITICAL CARE'] }, { id: 2, name: 'Dr. Kavya Reddy', specialty: 'General Medicine', shift: '07:00-19:00', load: 5, capacity: 10, tags: ['DIABETES', 'HYPERTENSION'] }, { id: 3, name: 'Dr. Pradeep Nair', specialty: 'Cardiology', shift: '08:00-20:00', load: 4, capacity: 8, tags: ['STEMI', 'ARRHYTHMIA'] }, { id: 4, name: 'Dr. Sunita Rao', specialty: 'Neurology', shift: '09:00-21:00', load: 2, capacity: 6, tags: ['TBI', 'STROKE'] }, { id: 5, name: 'Dr. Ravi Kumar', specialty: 'Orthopedics', shift: '07:00-15:00', load: 8, capacity: 8, tags: ['FRACTURES'], status: 'unavailable' }];
const INITIAL_UNASSIGNED = [{ id: 'INC-8843', patient: 'Anita Desai', type: 'Fall Injury', priority: 'URGENT', sews: 4, description: 'Elderly female tripped and fell down 3 stairs. Complaining of severe right hip pain and inability to bear weight.', recommendedProviderId: 2 }];
const INITIAL_ASSIGNED = [{ id: 'INC-8830', patient: 'Priya Nair', doctorId: 1, doctorName: 'Dr. Aris Mehta', description: 'Minor lacerations from workplace accident.' }, { id: 'INC-8812', patient: 'Vikram Singh', doctorId: 1, doctorName: 'Dr. Aris Mehta', description: 'Post-operative monitoring after appendectomy.' }, { id: 'INC-8825', patient: 'Aisha Khan', doctorId: 1, doctorName: 'Dr. Aris Mehta', description: 'Blunt force trauma observation.' }, { id: 'INC-8831', patient: 'Ramesh Gupta', doctorId: 2, doctorName: 'Dr. Kavya Reddy', description: 'Diabetic ketoacidosis observation.' }, { id: 'INC-8822', patient: 'Sunil Patel', doctorId: 2, doctorName: 'Dr. Kavya Reddy', description: 'Management of severe hypertension.' }, { id: 'INC-8815', patient: 'Meera Joshi', doctorId: 2, doctorName: 'Dr. Kavya Reddy', description: 'Unexplained fever and fatigue. Pending blood work.' }, { id: 'INC-8818', patient: 'Omar Farooq', doctorId: 2, doctorName: 'Dr. Kavya Reddy', description: 'Asthma exacerbation, stabilizing on nebulizers.' }, { id: 'INC-8829', patient: 'Chloe Chen', doctorId: 2, doctorName: 'Dr. Kavya Reddy', description: 'Suspected food poisoning, requiring IV fluids.' }, { id: 'INC-8805', patient: 'Rajesh Kumar', doctorId: 3, doctorName: 'Dr. Pradeep Nair', description: 'Recovering from mild myocardial infarction.' }, { id: 'INC-8809', patient: 'Sneha Verma', doctorId: 3, doctorName: 'Dr. Pradeep Nair', description: 'Arrhythmia monitoring and medication adjustment.' }, { id: 'INC-8814', patient: 'David Smith', doctorId: 3, doctorName: 'Dr. Pradeep Nair', description: 'Chest pain evaluation, pending stress test.' }, { id: 'INC-8820', patient: 'Lakshmi Narayan', doctorId: 3, doctorName: 'Dr. Pradeep Nair', description: 'Heart failure management, diuresis protocol.' }, { id: 'INC-8802', patient: 'Amitabh Bose', doctorId: 4, doctorName: 'Dr. Sunita Rao', description: 'Observation following transient ischemic attack (TIA).' }, { id: 'INC-8811', patient: 'Kavita Menon', doctorId: 4, doctorName: 'Dr. Sunita Rao', description: 'Severe migraine protocol management.' }, { id: 'INC-8790', patient: 'Arjun Das', doctorId: 5, doctorName: 'Dr. Ravi Kumar', description: 'Compound fracture of the right tibia.' }, { id: 'INC-8791', patient: 'Neha Sharma', doctorId: 5, doctorName: 'Dr. Ravi Kumar', description: "Colles fracture, post-reduction." }];
const TRIAGE_INCOMING = [
    { id: 'INC-8841', patient: 'S. Venkata Raghavan', type: 'Trauma / MVA', eta: '2 mins', priority: 'CRITICAL', sews: 8, unit: 'Unit 42', bloodType: 'O Negative', allergies: ['Penicillin', 'Latex'], vitals: { hr: 132, bp: '85/50', spo2: 88, rr: 28, temp: 35.9, avpu: 'Pain' }, baseline: { hr: 74, bp: '125/80', spo2: 98, rr: 14, temp: 36.8, avpu: 'Alert' }, report: 'Patient suffered blunt force trauma to the chest and abdomen. Potential rib fractures. Diminished breath sounds on the right side. Tachycardic and hypotensive.', treatments: ['O2 via Non-Rebreather @ 15LPM', 'IV access established (18G Left AC)', '500ml Normal Saline bolus administered'] },
    { id: 'INC-8842', patient: 'Unknown Male', type: 'Cardiac Arrest', eta: '5 mins', priority: 'CRITICAL', sews: 9, unit: 'Unit 17', bloodType: 'Unknown', allergies: ['Unknown'], vitals: { hr: 0, bp: '--/--', spo2: '--', rr: 0, temp: 35.0, avpu: 'Unresponsive' }, baseline: { hr: '--', bp: '--/--', spo2: '--', rr: '--', temp: '--', avpu: '--' }, report: 'Found unresponsive by bystanders. CPR was in progress upon arrival. No palpable pulse. AED advised shock, 1 shock delivered on scene.', treatments: ['CPR ongoing continuously', 'Epinephrine 1mg IV pushed x2', 'Intubated (Size 7.5 ET tube) successfully'] },
    { id: 'INC-8849', patient: 'David Chen', type: 'Gunshot Wound', eta: '6 mins', priority: 'CRITICAL', sews: 8, unit: 'Unit 09', bloodType: 'A Positive', allergies: ['None'], vitals: { hr: 128, bp: '90/60', spo2: 94, rr: 26, temp: 36.1, avpu: 'Pain' }, baseline: { hr: 72, bp: '120/80', spo2: 99, rr: 16, temp: 37.0, avpu: 'Alert' }, report: 'GSW to right thigh, active bleeding controlled with tourniquet. Patient pale and diaphoretic.', treatments: ['Tourniquet applied high and tight', 'IV Normal Saline wide open'] },
    { id: 'INC-8848', patient: 'Lata Kumari', type: 'Severe Asthma', eta: '8 mins', priority: 'URGENT', sews: 6, unit: 'Unit 05', bloodType: 'B Positive', allergies: ['Dust'], vitals: { hr: 110, bp: '120/80', spo2: 92, rr: 24, temp: 37.0, avpu: 'Alert' }, baseline: { hr: 80, bp: '115/75', spo2: 99, rr: 16, temp: 36.6, avpu: 'Alert' }, report: 'Experiencing acute shortness of breath. SpO2 low. Administered Albuterol nebulizer.', treatments: ['Albuterol nebulizer continuous', 'O2 via mask'] }
];
const WARDS_DATA = [{ name: 'ICU - Trauma', total: 20, occupied: 18, cleaning: 1, available: 1 }, { name: 'General Ward A', total: 50, occupied: 42, cleaning: 3, available: 5 }, { name: 'Cardiology Step-down', total: 15, occupied: 10, cleaning: 0, available: 5 }, { name: 'Pediatrics', total: 30, occupied: 12, cleaning: 2, available: 16 }];
const WARD_BEDS_DATA = { 'ICU - Trauma': [{ id: 'ICU-01', status: 'occupied', patientId: 'INC-8841', patientName: 'S. Venkata Raghavan', doctor: 'Dr. Aris Mehta', critical: true }, { id: 'ICU-02', status: 'occupied', patientId: 'INC-8812', patientName: 'Vikram Singh', doctor: 'Dr. Aris Mehta', critical: true }, { id: 'ICU-03', status: 'vacant' }, { id: 'ICU-04', status: 'cleaning' }, { id: 'ICU-05', status: 'occupied', patientId: 'INC-8825', patientName: 'Aisha Khan', doctor: 'Dr. Kavya Reddy' }, { id: 'ICU-06', status: 'vacant' }, { id: 'ICU-07', status: 'occupied', patientId: 'INC-8830', patientName: 'Priya Nair', doctor: 'Dr. Aris Mehta' }, { id: 'ICU-08', status: 'cleaning' }, { id: 'ICU-09', status: 'occupied', patientId: 'INC-8899', patientName: 'Rahul Dev', doctor: 'Dr. Aris Mehta' }, { id: 'ICU-10', status: 'occupied', patientId: 'INC-8900', patientName: 'Simran Kaur', doctor: 'Dr. Kavya Reddy' }, { id: 'ICU-11', status: 'ready' }, { id: 'ICU-12', status: 'occupied', patientId: 'INC-8901', patientName: 'Dev Anand', doctor: 'Dr. Aris Mehta' }], 'General Ward A': [{ id: 'GW-01', status: 'occupied', patientId: 'INC-8831', patientName: 'Ramesh Gupta', doctor: 'Dr. Kavya Reddy' }, { id: 'GW-02', status: 'vacant' }, { id: 'GW-03', status: 'vacant' }, { id: 'GW-04', status: 'cleaning' }, { id: 'GW-05', status: 'occupied', patientId: 'INC-8822', patientName: 'Sunil Patel', doctor: 'Dr. Kavya Reddy' }, { id: 'GW-06', status: 'occupied', patientId: 'INC-8815', patientName: 'Meera Joshi', doctor: 'Dr. Kavya Reddy' }, { id: 'GW-07', status: 'vacant' }, { id: 'GW-08', status: 'cleaning' }], 'Cardiology Step-down': [{ id: 'CS-01', status: 'occupied', patientId: 'INC-8805', patientName: 'Rajesh Kumar', doctor: 'Dr. Pradeep Nair' }, { id: 'CS-02', status: 'occupied', patientId: 'INC-8809', patientName: 'Sneha Verma', doctor: 'Dr. Pradeep Nair' }, { id: 'CS-03', status: 'vacant' }, { id: 'CS-04', status: 'vacant' }, { id: 'CS-05', status: 'occupied', patientId: 'INC-8820', patientName: 'Lakshmi Narayan', doctor: 'Dr. Pradeep Nair' }], 'Pediatrics': [{ id: 'PED-01', status: 'vacant' }, { id: 'PED-02', status: 'cleaning' }, { id: 'PED-03', status: 'vacant' }, { id: 'PED-04', status: 'vacant' }] };
const INITIAL_TIMELINES = { 'INC-8841': [{ time: '10:45 AM', type: 'nurse', role: 'Nurse Staff', action: 'Post-Op Monitoring', details: 'Patient settled in ICU-01. Chest tube drainage 150ml. Resting, pain managed with Morphine 4mg IV.' }, { time: '09:30 AM', type: 'treatment', role: 'Dr. Aris Mehta', action: 'Treatment Plan & Procedure', details: 'Chest tube insertion performed. Patient scheduled for minor OR procedure for stabilization, then transfer to ICU-01.' }, { time: '09:15 AM', type: 'scan', role: 'Radiology', action: 'CT Scan Completed', details: 'Chest CT confirms fractures of right ribs 4, 5, 6 with small pneumothorax. Report sent to Dr. Mehta.' }, { time: '08:40 AM', type: 'lab', role: 'Laboratory', action: 'Test Ordered', details: 'Arterial Blood Gas (ABG), Complete Blood Count (CBC) stat requested.' }, { time: '08:35 AM', type: 'doctor', role: 'Dr. Aris Mehta', action: 'Initial Assessment', details: 'Suspected rib fractures and pneumothorax. Ordering STAT CT Chest and ABG labs.' }, { time: '08:25 AM', type: 'admission', role: 'Charge Nurse', action: 'ER Arrival', details: 'Patient received in Trauma Bay 1. Vitals continuously monitored. Handed over to Dr. Aris Mehta.' }, { time: '08:12 AM', type: 'pre-hospital', role: 'Paramedic (Unit 42)', action: 'En-route Triage', details: 'Blunt force trauma to chest from MVA. BP 85/50, HR 132. O2 administered at 15LPM via NRB. IV access established (18G Left AC).' }], default: [{ time: '11:00 AM', type: 'nurse', role: 'Nurse Staff', action: 'Medication', details: 'Routine medications administered as per chart.' }, { time: '09:30 AM', type: 'doctor', role: 'Attending Physician', action: 'Initial Rounds', details: 'Vitals stable. Continuing current care plan.' }, { time: '09:00 AM', type: 'admission', role: 'Triage Nurse', action: 'Patient Admitted', details: 'Patient admitted to ward for observation.' }] };
const INITIAL_NURSE_LOGS = { 'INC-8841': [{ time: '10:45 AM', text: 'Patient settled in ICU-01. Chest tube drainage 150ml. Resting, pain managed with Morphine 4mg IV.' }, { time: '11:30 AM', text: 'Patient is resting in bed with HOB elevated to 30 degrees. Chest tube to right pleural space remains intact, draining serosanguinous fluid (approx 45mL this shift). No air leak noted. Patient reports pain at incision site is 4/10, tolerable. Continuous pulse oximetry >96% on 2L NC. Will continue to monitor respiratory status closely.' }] };
const LAB_RESULTS_INIT = [{ id: 'LAB-102', patient: 'Rahul Sharma', patientId: 'INC-8899', test: 'Complete Blood Count', status: 'PENDING', time: '10 mins ago' }, { id: 'LAB-103', patient: 'Priya Nair', patientId: 'INC-8830', test: 'Troponin Levels', status: 'PENDING', time: 'Pending' }, { id: 'LAB-104', patient: 'S. Venkata Raghavan', patientId: 'INC-8841', test: 'Arterial Blood Gas', status: 'STAT REQUEST', time: 'En Route' }];
const RADIOLOGY_RESULTS_INIT = [{ id: 'RAD-201', patient: 'Vikram Singh', patientId: 'INC-8812', test: 'X-Ray Chest', status: 'PENDING', time: '15 mins ago' }, { id: 'RAD-202', patient: 'Amitabh Bose', patientId: 'INC-8802', test: 'MRI Brain', status: 'IN-PROGRESS', time: 'In scanner' }, { id: 'RAD-203', patient: 'Sneha Verma', patientId: 'INC-8809', test: 'Echo Cardiogram', status: 'PENDING', time: 'Scheduled' }];

/* ─── HOSPITAL STATE REDUCER ─────────────────────────────────────────────── */
const INITIAL_DISCHARGE = {};
ALL_ADMITTED_PATIENTS.forEach(p => { INITIAL_DISCHARGE[p.id] = { doctorRequested: false, billerApproved: false }; });

const INITIAL_HS = {
    unassigned: [...INITIAL_UNASSIGNED],
    assigned: [...INITIAL_ASSIGNED],
    beds: JSON.parse(JSON.stringify(WARD_BEDS_DATA)),
    admitted: [...ALL_ADMITTED_PATIENTS],
    services: { ...PATIENT_SERVICES },
    discharge: INITIAL_DISCHARGE,
};

function hospitalReducer(state, action) {
    switch (action.type) {
        case 'ASSIGN_DOCTOR': {
            const { patient, provider } = action;
            return {
                ...state,
                unassigned: state.unassigned.filter(p => p.id !== patient.id),
                assigned: [{ id: patient.id, patient: patient.patient, doctorId: provider.id, doctorName: provider.name, description: patient.description, priority: patient.priority }, ...state.assigned],
            };
        }
        case 'ADMIT_PATIENT': {
            const { bedId, wardName, patient } = action;
            const doctorName = PROVIDERS.find(p => p.id === patient.recommendedProviderId)?.name || 'Dr. Aris Mehta';
            const newBeds = { ...state.beds };
            newBeds[wardName] = state.beds[wardName].map(b =>
                b.id === bedId ? { ...b, status: 'occupied', patientId: patient.id, patientName: patient.patient, doctor: doctorName, critical: patient.priority === 'CRITICAL' } : b
            );
            getOrCreateMRN(patient.id);
            return {
                ...state,
                unassigned: state.unassigned.filter(p => p.id !== patient.id),
                beds: newBeds,
                admitted: [{ id: patient.id, name: patient.patient, ward: wardName, doctor: doctorName, admitDate: 'Just Now' }, ...state.admitted],
                services: { ...state.services, [patient.id]: [{ id: 's1', name: 'Ward Bed (Admission)', category: 'Accommodation', amount: 1500, status: 'unpaid' }] },
                discharge: { ...state.discharge, [patient.id]: { doctorRequested: false, billerApproved: false } },
            };
        }
        case 'UPDATE_BED_STATUS': {
            const { wardName, bedId, status } = action;
            return {
                ...state,
                beds: {
                    ...state.beds,
                    [wardName]: state.beds[wardName].map(b => b.id === bedId ? { ...b, status } : b),
                },
            };
        }
        case 'REQUEST_DISCHARGE': {
            const { wardName, bedId, patientId } = action;
            return {
                ...state,
                beds: {
                    ...state.beds,
                    [wardName]: state.beds[wardName].map(b => b.id === bedId ? { ...b, status: 'discharge_ready' } : b),
                },
                discharge: { ...state.discharge, [patientId]: { ...state.discharge[patientId], doctorRequested: true } },
            };
        }
        case 'APPROVE_DISCHARGE': {
            const { patientId } = action;
            return {
                ...state,
                discharge: { ...state.discharge, [patientId]: { ...state.discharge[patientId], billerApproved: true } },
            };
        }
        case 'COMPLETE_DISCHARGE': {
            const { wardName, bedId, patientId } = action;
            return {
                ...state,
                beds: {
                    ...state.beds,
                    [wardName]: state.beds[wardName].map(b => b.id === bedId ? { id: b.id, status: 'cleaning' } : b),
                },
                admitted: state.admitted.filter(p => p.id !== patientId),
            };
        }
        case 'UPDATE_SERVICE_PAYMENT': {
            const { patientId, serviceId } = action;
            return {
                ...state,
                services: {
                    ...state.services,
                    [patientId]: (state.services[patientId] || []).map(s => s.id === serviceId ? { ...s, status: 'paid' } : s),
                },
            };
        }
        case 'ADD_UNASSIGNED': {
            const already = state.unassigned.find(u => u.id === action.patient.id);
            if (already) return state;
            return { ...state, unassigned: [action.patient, ...state.unassigned] };
        }
        default:
            return state;
    }
}

/* ─── SHARED PRIMITIVES ───────────────────────────────────────────────────── */
const StatusDot = ({ color, pulse, overrideAnimation }) => (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 8, height: 8, flexShrink: 0 }}>
        {pulse && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4, animation: overrideAnimation || 'pulse-dot 1.6s infinite' }} />}
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, position: 'relative', zIndex: 1 }} />
    </span>
);

const SBadge = ({ label, color, bg, pulse }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: bg || color + '18', color, border: `1px solid ${color}30`, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {pulse && <StatusDot color={color} pulse />}
        {label}
    </span>
);

const NavItem = ({ icon, label, sub, isActive, onClick, badge }) => (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: isActive ? `${DS.accent}18` : 'transparent', border: 'none', borderLeft: `3px solid ${isActive ? DS.accent : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', position: 'relative' }}>
        <span style={{ color: isActive ? DS.accent : DS.textDim, display: 'flex', flexShrink: 0 }}>{icon}</span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? DS.text : DS.textMid, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.06em' }}>{label}</span>
            <span style={{ fontSize: 10, color: DS.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>{sub}</span>
        </span>
        {badge && <span style={{ width: 16, height: 16, borderRadius: '50%', background: DS.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: "'IBM Plex Mono',monospace" }}>{badge}</span>}
    </button>
);

const CCard = ({ children, style }) => (
    <div style={{ background: DS.contentSurface, border: `1px solid ${DS.contentBorder}`, borderRadius: 10, overflow: 'hidden', ...style }}>{children}</div>
);

const CHeader = ({ title, sub, right }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: DS.contentText, fontFamily: "'IBM Plex Sans',sans-serif", margin: 0 }}>{title}</h2>
            {sub && <p style={{ fontSize: 11, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', margin: '3px 0 0' }}>{sub}</p>}
        </div>
        {right}
    </div>
);

const MRNBadge = ({ patientId }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", color: DS.contentTextMid }}>
        <Hash style={{ width: 10, height: 10 }} />{getOrCreateMRN(patientId)}
    </span>
);

const PriorityBadge = ({ priority }) => (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono',monospace", background: priority === 'CRITICAL' ? `${DS.red}18` : `${DS.amber}18`, color: priority === 'CRITICAL' ? DS.red : DS.amber, border: `1px solid ${priority === 'CRITICAL' ? DS.red : DS.amber}30` }}>{priority}</span>
);

const CBtn = ({ label, variant = 'primary', onClick, disabled, icon, small }) => {
    const [h, setH] = useState(false);
    const colors = { primary: { bg: DS.accent, color: '#fff' }, success: { bg: DS.green, color: '#fff' }, danger: { bg: DS.red, color: '#fff' }, ghost: { bg: 'transparent', color: DS.contentTextMid } };
    const c = colors[variant] || colors.primary;
    return (
        <button onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: small ? '5px 12px' : '8px 16px', background: disabled ? DS.contentCard : h ? c.bg + 'ee' : c.bg, color: disabled ? DS.contentTextDim : c.color, border: `1px solid ${disabled ? DS.contentBorder : c.bg}`, borderRadius: 7, fontSize: small ? 10 : 12, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.06em', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: disabled ? 0.6 : 1 }}>
            {icon}{label}
        </button>
    );
};

/* ─── LIVE STREAM INDICATOR ───────────────────────────────────────────────── */
const LiveStreamBadge = ({ unit, latency }) => {
    const [tick, setTick] = useState(0);
    useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1400); return () => clearInterval(iv); }, []);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${DS.red}12`, border: `1px solid ${DS.red}30`, borderRadius: 7, padding: '5px 10px' }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: DS.red, opacity: tick % 2 === 0 ? 0.9 : 0.3, transition: 'opacity 0.4s' }} />
                <span style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `1.5px solid ${DS.red}`, opacity: tick % 2 === 0 ? 0.5 : 0, transition: 'opacity 0.4s', animation: 'ping 1.4s infinite' }} />
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: DS.red, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.08em' }}>LIVE FROM {unit}</span>
            <span style={{ fontSize: 9, color: '#EF444480', fontFamily: "'IBM Plex Mono',monospace" }}>· LATENCY {latency}</span>
        </div>
    );
};

/* ─── ROOT ────────────────────────────────────────────────────────────────── */
export default function HospitalOS() {
    const [activeView, setActiveView] = useState('floor');
    const [pendingAlloc, setPendingAlloc] = useState(null);
    const [sentInstructions, setSentInstructions] = useState({});
    const [toasts, setToasts] = useState([]);
    const [hospitalState, dispatch] = useReducer(hospitalReducer, INITIAL_HS);

    // Global Toast Hook
    useEffect(() => {
        const listener = (msg, type) => {
            const id = Date.now() + Math.random();
            setToasts(prev => [...prev, { id, msg, type }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 3000);
        };
        toastListeners.push(listener);
        return () => {
            toastListeners = toastListeners.filter(l => l !== listener);
        };
    }, []);

    const addInstruction = (incidentId, instruction) => {
        setSentInstructions(prev => ({
            ...prev,
            [incidentId]: [...(prev[incidentId] || []), { text: instruction, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
        }));
    };

    const nav = [
        { key: 'triage', icon: <ShieldAlert size={16} />, label: 'Triage', sub: 'Emergency Intake' },
        { key: 'allocation', icon: <BrainCircuit size={16} />, label: 'Allocation', sub: 'AI Assignment', badge: pendingAlloc ? 1 : 0 },
        { key: 'floor', icon: <Bed size={16} />, label: 'Floor Mgmt', sub: 'Bed Lifecycle' },
        { key: 'diagnostics', icon: <Microscope size={16} />, label: 'Diagnostics', sub: 'Labs & Path' },
        { key: 'billing', icon: <Receipt size={16} />, label: 'Billing', sub: 'Financial Ledger' },
        { key: 'command', icon: <Activity size={16} />, label: 'Command', sub: 'Mission Control' },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', fontFamily: "'IBM Plex Sans',sans-serif" }}>
            <style>{globalStyles}</style>

            {/* ── SIDEBAR ── */}
            <aside style={{ width: 220, flexShrink: 0, background: DS.surface, borderRight: `1px solid ${DS.border}`, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${DS.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: `${DS.accent}18`, border: `1px solid ${DS.accent}40`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={16} color={DS.accent} />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.14em', color: DS.text, fontFamily: "'Syne',sans-serif" }}>NexVitals</div>
                            <div style={{ fontSize: 9, color: DS.textDim, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em' }}>Hospital OS v2.4</div>
                        </div>
                    </div>
                </div>
                <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
                    {nav.map(n => (
                        <NavItem key={n.key} icon={n.icon} label={n.label} sub={n.sub} isActive={activeView === n.key} onClick={() => setActiveView(n.key)} badge={n.badge || null} />
                    ))}
                </nav>
                <div style={{ padding: '12px 16px', borderTop: `1px solid ${DS.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusDot color={DS.green} pulse />
                    <span style={{ fontSize: 10, color: DS.green, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.08em' }}>All systems live</span>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main style={{ flex: 1, background: DS.contentBg, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: 48, background: DS.surface, borderBottom: `1px solid ${DS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: DS.text, fontFamily: "'Syne',sans-serif", letterSpacing: '0.14em' }}>NexVitals</span>
                        <span style={{ fontSize: 10, color: DS.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>—</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: DS.textMid, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>{nav.find(n => n.key === activeView)?.label}</span>
                        <span style={{ fontSize: 10, color: DS.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>— {nav.find(n => n.key === activeView)?.sub}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <SBadge label="System Normal" color={DS.green} pulse />
                        <span style={{ fontSize: 10, color: DS.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>City General Hospital</span>
                    </div>
                </div>

                <div className="content-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {activeView === 'triage' && <TriageView onSendToAllocation={(inc) => { setPendingAlloc(inc); setActiveView('allocation'); }} sentInstructions={sentInstructions} onSendInstruction={addInstruction} />}
                    {activeView === 'allocation' && <AllocationDashboard hospitalState={hospitalState} dispatch={dispatch} pendingTransfer={pendingAlloc} onClearTransfer={() => setPendingAlloc(null)} />}
                    {activeView === 'floor' && <FloorMgmtView hospitalState={hospitalState} dispatch={dispatch} />}
                    {activeView === 'diagnostics' && <DiagnosticsView />}
                    {activeView === 'billing' && <BillingView hospitalState={hospitalState} dispatch={dispatch} />}
                    {activeView === 'command' && <CommandView hospitalState={hospitalState} />}
                </div>

                {/* GLOBAL TOAST CONTAINER */}
                <div style={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 9999 }}>
                    {toasts.map(t => (
                        <div key={t.id} style={{
                            background: DS.surfaceHigh, border: `1px solid ${t.type === 'error' ? DS.red : t.type === 'success' ? DS.green : t.type === 'warning' ? DS.amber : DS.accent}`,
                            borderLeft: `4px solid ${t.type === 'error' ? DS.red : t.type === 'success' ? DS.green : t.type === 'warning' ? DS.amber : DS.accent}`,
                            padding: '12px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'slide-up 0.3s ease, fade-in 0.3s ease', color: DS.text
                        }}>
                            {t.type === 'error' ? <AlertOctagon size={16} color={DS.red} /> :
                                t.type === 'success' ? <CheckCircle size={16} color={DS.green} /> :
                                    t.type === 'warning' ? <AlertTriangle size={16} color={DS.amber} /> :
                                        <Activity size={16} color={DS.accent} />}
                            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace" }}>{t.msg}</span>
                        </div>
                    ))}
                </div>
            </main >
        </div>
    );
}

/* ─── TRIAGE ── */
function TriageView({ onSendToAllocation, sentInstructions, onSendInstruction }) {
    const [sel, setSel] = useState(null);

    const QUICK_INSTRUCTIONS = [
        { label: 'Start IV Fluids', icon: '💉', cmd: 'Start IV Fluids — NS @ 125ml/hr' },
        { label: 'Control Bleeding', icon: '🩹', cmd: 'Apply direct pressure — control active bleeding immediately' },
        { label: 'Increase O₂', icon: '💨', cmd: 'Increase O₂ delivery — switch to Non-Rebreather @ 15LPM' },
        { label: 'Administer Epi', icon: '⚡', cmd: 'Administer Epinephrine 1mg IV push — cardiac protocol' },
        { label: 'Immobilise Spine', icon: '🦺', cmd: 'Full spinal immobilisation — C-collar + backboard' },
        { label: 'Glucose Check', icon: '🩸', cmd: 'Immediate blood glucose check — document and report' },
    ];

    const handleSendInstruction = (inc, cmd) => {
        onSendInstruction(inc.id, cmd);
        notify(`Instruction transmitted to ${inc.unit}`, "success");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
            <CHeader title="Emergency Triage" sub="Module 1 · Incoming Feeds"
                right={
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <SBadge label="3 Active" color={DS.red} pulse />
                        <SBadge label="LIVE FROM AMBULANCE" color={DS.red} pulse />
                    </div>
                }
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, minHeight: 0 }}>
                <CCard style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${DS.contentBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Ambulance size={14} color={DS.red} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: DS.contentText, fontFamily: "'IBM Plex Mono',monospace" }}>Inbound Ambulances</span>
                    </div>
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}>
                        {TRIAGE_INCOMING.map(inc => {
                            const isSel = sel?.id === inc.id;
                            const instrCount = (sentInstructions[inc.id] || []).length;
                            return (
                                <button key={inc.id} onClick={() => setSel(inc)}
                                    style={{ width: '100%', textAlign: 'left', padding: 14, background: isSel ? `${DS.accent}08` : DS.contentBg, border: `1px solid ${isSel ? DS.accent : DS.contentBorder}`, borderLeft: `3px solid ${inc.priority === 'CRITICAL' ? DS.red : DS.amber}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', animation: inc.priority === 'CRITICAL' ? 'critical-border 2.5s infinite' : undefined }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <PriorityBadge priority={inc.priority} />
                                            <span style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", alignSelf: 'center' }}>{inc.id}</span>
                                            <MRNBadge patientId={inc.id} />
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: DS.red, fontFamily: "'IBM Plex Mono',monospace" }}>ETA {inc.eta}</div>
                                            <div style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace" }}>{inc.unit}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: DS.contentText, marginBottom: 2 }}>{inc.patient}</div>
                                    <div style={{ fontSize: 12, color: DS.contentTextMid, marginBottom: 8 }}>{inc.type}</div>
                                    {instrCount > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${DS.green}10`, border: `1px solid ${DS.green}25`, borderRadius: 5, padding: '3px 7px', marginBottom: 6 }}>
                                            <Radio size={10} color={DS.green} />
                                            <span style={{ fontSize: 9, fontWeight: 600, color: DS.green, fontFamily: "'IBM Plex Mono',monospace" }}>{instrCount} INSTRUCTION{instrCount > 1 ? 'S' : ''} SENT</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 8, borderTop: `1px solid ${DS.contentBorder}` }}>
                                        <span style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", display: 'flex', alignItems: 'center', gap: 4 }}><HeartPulse size={12} /> SEWS Score</span>
                                        <span style={{ fontSize: 18, fontWeight: 800, color: inc.sews >= 7 ? DS.red : DS.amber, fontFamily: "'IBM Plex Mono',monospace", animation: inc.sews >= 7 ? 'pulse-dot 1.5s infinite' : undefined }}>{inc.sews}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CCard>

                {sel ? (
                    <CCard style={{ display: 'flex', flexDirection: 'column', animation: 'slide-up 0.2s ease' }}>
                        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${DS.contentBorder}`, background: DS.contentCard }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <PriorityBadge priority={sel.priority} />
                                    <span style={{ fontSize: 11, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace" }}>{sel.id}</span>
                                    <MRNBadge patientId={sel.id} />
                                </div>
                                <LiveStreamBadge unit={sel.unit} latency="1.2s" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: DS.contentText, margin: 0 }}>{sel.patient}</h3>
                                    <p style={{ fontSize: 13, color: DS.contentTextMid, margin: '2px 0 0' }}>{sel.type}</p>
                                </div>
                                <div style={{ background: `${DS.red}10`, border: `1px solid ${DS.red}30`, borderRadius: 7, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Ambulance size={14} color={DS.red} style={{ animation: 'pulse-dot 1.5s infinite' }} />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: DS.red, fontFamily: "'IBM Plex Mono',monospace" }}>{sel.unit} · ETA {sel.eta}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ background: sel.sews >= 7 ? `${DS.red}10` : `${DS.amber}10`, border: `1px solid ${sel.sews >= 7 ? DS.red : DS.amber}30`, borderRadius: 8, padding: '12px 16px', textAlign: 'center', width: 120, flexShrink: 0 }}>
                                    <p style={{ fontSize: 10, fontWeight: 600, color: sel.sews >= 7 ? DS.red : DS.amber, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', marginBottom: 4 }}>SEWS</p>
                                    <p style={{ fontSize: 40, fontWeight: 900, color: sel.sews >= 7 ? DS.red : DS.amber, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1 }}>{sel.sews}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1 }}>
                                    <div style={{ background: DS.contentCard, borderRadius: 8, padding: 10 }}>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 3 }}>Blood Type</p>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: DS.red }}>{sel.bloodType}</p>
                                    </div>
                                    <div style={{ background: DS.contentCard, borderRadius: 8, padding: 10 }}>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 3 }}>Allergies</p>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: DS.contentText }}>{sel.allergies.join(', ')}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Live Telemetry vs Baseline</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                                    {[['Heart Rate', sel.vitals.hr, sel.baseline.hr, 'BPM'], ['Blood Pressure', sel.vitals.bp, sel.baseline.bp, 'mmHg'], ['SpO2', sel.vitals.spo2, sel.baseline.spo2, '%'], ['Resp Rate', sel.vitals.rr, sel.baseline.rr, 'RPM'], ['Temp', sel.vitals.temp, sel.baseline.temp, '°C'], ['AVPU', sel.vitals.avpu, sel.baseline.avpu, '']].map(([l, live, base, u]) => (
                                        <div key={l} style={{ background: DS.contentCard, borderRadius: 8, padding: 10 }}>
                                            <p style={{ fontSize: 9, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', marginBottom: 4 }}>{l}</p>
                                            <p style={{ fontSize: 20, fontWeight: 800, color: DS.contentText, fontFamily: "'IBM Plex Mono',monospace" }}>{live}<span style={{ fontSize: 10, color: DS.contentTextDim, marginLeft: 2 }}>{u}</span></p>
                                            <p style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", marginTop: 4, paddingTop: 4, borderTop: `1px solid ${DS.contentBorder}` }}>Base: {base}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: `${DS.accent}08`, border: `1px solid ${DS.accent}20`, borderRadius: 8, padding: 12 }}>
                                <p style={{ fontSize: 10, fontWeight: 600, color: DS.accent, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Paramedic Report</p>
                                <p style={{ fontSize: 12, color: DS.contentText, lineHeight: 1.6 }}>{sel.report}</p>
                            </div>
                            <div style={{ background: `${DS.green}08`, border: `1px solid ${DS.green}20`, borderRadius: 8, padding: 12 }}>
                                <p style={{ fontSize: 10, fontWeight: 600, color: DS.green, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Treatments En Route</p>
                                {sel.treatments.map((t, i) => <p key={i} style={{ fontSize: 12, color: DS.contentText, lineHeight: 1.7 }}>· {t}</p>)}
                            </div>

                            <div style={{ background: `${DS.purple}08`, border: `1px solid ${DS.purple}25`, borderRadius: 8, padding: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                    <Radio size={13} color={DS.purple} style={{ animation: 'pulse-dot 1.8s infinite' }} />
                                    <p style={{ fontSize: 10, fontWeight: 700, color: DS.purple, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>📤 Send Field Instruction → {sel.unit}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                                    {QUICK_INSTRUCTIONS.map((qi) => (
                                        <button key={qi.label} onClick={() => handleSendInstruction(sel, qi.cmd)}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 6px', background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, borderRadius: 7, cursor: 'pointer', transition: 'all 0.15s', fontSize: 10, fontWeight: 600, color: DS.contentTextMid, fontFamily: "'IBM Plex Mono',monospace" }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = DS.purple; e.currentTarget.style.color = DS.purple; e.currentTarget.style.background = `${DS.purple}10`; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = DS.contentBorder; e.currentTarget.style.color = DS.contentTextMid; e.currentTarget.style.background = DS.contentCard; }}>
                                            <span style={{ fontSize: 16 }}>{qi.icon}</span>
                                            <span style={{ textAlign: 'center', lineHeight: 1.3 }}>{qi.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '12px 16px', borderTop: `1px solid ${DS.contentBorder}`, background: DS.contentCard, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <CBtn label="Close" variant="ghost" onClick={() => setSel(null)} small />
                            <CBtn label="Route to Trauma Bay 1" variant="primary" small />
                            <CBtn label="Assign Doctor →" variant="success" small icon={<BrainCircuit size={11} />}
                                onClick={() => { onSendToAllocation(sel); }} />
                        </div>
                    </CCard>
                ) : (
                    <CCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
                        <div style={{ width: 64, height: 64, background: DS.contentCard, border: `2px dashed ${DS.contentBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <ShieldAlert size={28} color={DS.contentTextDim} />
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: DS.contentText, marginBottom: 6 }}>Awaiting ER Check-in</h3>
                        <p style={{ fontSize: 13, color: DS.contentTextMid, maxWidth: 260 }}>Select an inbound feed to view telemetry and prepare trauma bays.</p>
                    </CCard>
                )}
            </div>
        </div>
    );
}

/* ─── ALLOCATION ───────────── */
function AllocationDashboard({ hospitalState, dispatch, pendingTransfer, onClearTransfer }) {
    const [providers, setProviders] = useState(PROVIDERS);
    const [selU, setSelU] = useState(hospitalState.unassigned[0] || null);
    const [selP, setSelP] = useState(null);
    const [transferBanner, setTransferBanner] = useState(null);

    useEffect(() => {
        if (pendingTransfer) {
            const newPatient = {
                id: pendingTransfer.id, patient: pendingTransfer.patient, type: pendingTransfer.type,
                priority: pendingTransfer.priority, sews: pendingTransfer.sews, description: pendingTransfer.report || pendingTransfer.description,
                recommendedProviderId: pendingTransfer.recommendedProviderId || 1
            };
            dispatch({ type: 'ADD_UNASSIGNED', patient: newPatient });
            setSelU(pendingTransfer);
            setSelP(null);
            setTransferBanner(pendingTransfer.patient);
            onClearTransfer();
            setTimeout(() => setTransferBanner(null), 3000);
        }
    }, [pendingTransfer]); // eslint-disable-line

    const recProv = selU ? providers.find(p => p.id === selU.recommendedProviderId) : null;
    const provPats = selP ? hospitalState.assigned.filter(p => p.doctorId === selP.id) : [];

    const confirmAlloc = () => {
        if (!selU) return;
        const prov = providers.find(p => p.id === selU.recommendedProviderId);
        getOrCreateMRN(selU.id);
        setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, load: p.load + 1 } : p));
        dispatch({ type: 'ASSIGN_DOCTOR', patient: selU, provider: prov });
        notify(`Assigned ${selU.patient} to ${prov.name}`, "success");
        setSelU(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
            <CHeader title="Resource Allocation" sub="Module 2 · AI Workload Balancing"
                right={
                    <div style={{ display: 'flex', gap: 8 }}>
                        <SBadge label="Mode: Hybrid-AI" color={DS.accent} />
                        <SBadge label={`${hospitalState.unassigned.length} Pending`} color={hospitalState.unassigned.length > 0 ? DS.red : DS.green} pulse={hospitalState.unassigned.length > 0} />
                    </div>
                }
            />

            {transferBanner && (
                <div style={{ background: `${DS.green}10`, border: `1px solid ${DS.green}30`, borderRadius: 9, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, animation: 'slide-up 0.2s ease' }}>
                    <Zap size={14} color={DS.green} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: DS.green, fontFamily: "'IBM Plex Mono',monospace" }}>Patient transferred from Triage: {transferBanner} — awaiting doctor assignment</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 260px', gap: 16, flex: 1, minHeight: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
                    <CCard style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${DS.contentBorder}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <UserPlus size={13} color={DS.contentTextDim} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>Unassigned</span>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {hospitalState.unassigned.map(inc => (
                                <button key={inc.id} onClick={() => { setSelU(inc); setSelP(null); }}
                                    style={{ width: '100%', textAlign: 'left', padding: 10, background: selU?.id === inc.id ? `${DS.accent}08` : DS.contentBg, border: `1px solid ${selU?.id === inc.id ? DS.accent : DS.contentBorder}`, borderLeft: `3px solid ${inc.priority === 'CRITICAL' ? DS.red : DS.amber}`, borderRadius: 7, cursor: 'pointer', transition: 'all 0.15s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace" }}>{inc.id}</span>
                                        <PriorityBadge priority={inc.priority} />
                                    </div>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: DS.contentText, marginBottom: 4 }}>{inc.patient}</p>
                                    <MRNBadge patientId={inc.id} />
                                    <p style={{ fontSize: 11, color: DS.contentTextMid, marginTop: 4 }}>{inc.type}</p>
                                </button>
                            ))}
                            {hospitalState.unassigned.length === 0 && <p style={{ fontSize: 12, color: DS.contentTextDim, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>No pending intakes</p>}
                        </div>
                    </CCard>
                    <CCard style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${DS.contentBorder}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle size={13} color={DS.green} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>Assigned ({hospitalState.assigned.length})</span>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {hospitalState.assigned.slice(0, 4).map(a => (
                                <div key={a.id} style={{ padding: '8px 10px', background: DS.contentCard, borderRadius: 7, border: `1px solid ${DS.contentBorder}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: DS.contentText }}>{a.patient}</p>
                                        <span style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace" }}>{a.id}</span>
                                    </div>
                                    <MRNBadge patientId={a.id} />
                                    <p style={{ fontSize: 11, color: DS.green, marginTop: 4, fontFamily: "'IBM Plex Mono',monospace" }}>→ {a.doctorName}</p>
                                </div>
                            ))}
                        </div>
                    </CCard>
                </div>

                <CCard style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${DS.contentBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Stethoscope size={14} color={DS.accent} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: DS.contentText, fontFamily: "'IBM Plex Mono',monospace" }}>Provider Matrix — On-Shift Staff</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {providers.map(prov => {
                            const pct = Math.round((prov.load / prov.capacity) * 100);
                            const barColor = pct > 80 || prov.status === 'unavailable' ? DS.red : pct > 50 ? DS.amber : DS.green;
                            const isSel = selP?.id === prov.id;
                            return (
                                <button key={prov.id} onClick={() => { setSelP(prov); setSelU(null); }}
                                    style={{ width: '100%', textAlign: 'left', padding: 14, background: isSel ? `${DS.accent}06` : DS.contentBg, border: `1px solid ${isSel ? DS.accent : DS.contentBorder}`, borderRadius: 9, cursor: 'pointer', transition: 'all 0.15s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: DS.contentTextMid, flexShrink: 0 }}>{prov.name.charAt(4)}</div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: DS.contentText }}>{prov.name}</p>
                                                <p style={{ fontSize: 11, color: DS.contentTextMid, display: 'flex', alignItems: 'center', gap: 4 }}>{prov.specialty} <span style={{ color: DS.contentBorder }}>·</span> <Clock size={11} /> {prov.shift}</p>
                                            </div>
                                        </div>
                                        <SBadge label={prov.status === 'unavailable' ? 'Unavailable' : 'On Shift'} color={prov.status === 'unavailable' ? DS.contentTextDim : DS.green} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", color: DS.contentTextMid, marginBottom: 4 }}>
                                            <span>{prov.load} / {prov.capacity} patients</span><span>{pct}%</span>
                                        </div>
                                        <div style={{ height: 4, background: DS.contentCard, borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2, transition: 'width 0.5s' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                                        {prov.tags.map(t => <span key={t} style={{ fontSize: 9, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", color: DS.contentTextMid, background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, padding: '2px 6px', borderRadius: 4 }}>{t}</span>)}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CCard>

                <div>
                    {selU && recProv ? (
                        <CCard style={{ display: 'flex', flexDirection: 'column', padding: 16, height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                                <BrainCircuit size={14} color={DS.accent} />
                                <span style={{ fontSize: 10, fontWeight: 600, color: DS.accent, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Assignment Hub</span>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <p style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 3 }}>Recommended Match</p>
                                <p style={{ fontSize: 16, fontWeight: 700, color: DS.contentText }}>{recProv.name}</p>
                                <p style={{ fontSize: 12, color: DS.accent }}>{recProv.specialty}</p>
                            </div>
                            <div style={{ background: `${DS.accent}08`, border: `1px solid ${DS.accent}20`, borderRadius: 8, padding: 10, marginBottom: 12 }}>
                                <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 6 }}>AI Reasoning</p>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <li style={{ fontSize: 11, color: DS.contentText }}>· Available capacity ({recProv.load}/{recProv.capacity})</li>
                                    <li style={{ fontSize: 11, color: DS.contentText }}>· Expertise match for {selU.type}</li>
                                    {selU.sews >= 7 && <li style={{ fontSize: 11, color: DS.red }}>· High SEWS ({selU.sews}) — priority coverage</li>}
                                </ul>
                            </div>
                            <div style={{ borderTop: `1px solid ${DS.contentBorder}`, paddingTop: 12, marginBottom: 12 }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: DS.contentText }}>{selU.patient}</p>
                                <p style={{ fontSize: 11, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", margin: '2px 0 6px' }}>{selU.id}</p>
                                <MRNBadge patientId={selU.id} />
                                <p style={{ fontSize: 12, color: DS.contentTextMid, marginTop: 8, lineHeight: 1.5 }}>{selU.description}</p>
                            </div>
                            <div style={{ background: `${DS.amber}10`, border: `1px solid ${DS.amber}30`, borderRadius: 7, padding: '8px 10px', display: 'flex', gap: 8, marginBottom: 12 }}>
                                <AlertTriangle size={14} color={DS.amber} style={{ flexShrink: 0, marginTop: 1 }} />
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: DS.amber, fontFamily: "'IBM Plex Mono',monospace" }}>Human-in-the-loop</p>
                                    <p style={{ fontSize: 10, color: DS.contentTextMid }}>Charge Nurse must approve.</p>
                                </div>
                            </div>
                            <CBtn label="Confirm Allocation" variant="primary" onClick={confirmAlloc} />
                        </CCard>
                    ) : selP ? (
                        <CCard style={{ padding: 16 }}>
                            <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Provider Workload</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                <div style={{ width: 44, height: 44, background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: DS.contentTextMid }}>{selP.name.charAt(4)}</div>
                                <div>
                                    <p style={{ fontSize: 15, fontWeight: 700, color: DS.contentText }}>{selP.name}</p>
                                    <p style={{ fontSize: 12, color: DS.contentTextMid }}>{selP.specialty}</p>
                                </div>
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", color: DS.contentTextDim, marginBottom: 4 }}>
                                    <span>Load</span><span>{selP.load}/{selP.capacity}</span>
                                </div>
                                <div style={{ height: 4, background: DS.contentCard, borderRadius: 2 }}>
                                    <div style={{ height: '100%', width: `${(selP.load / selP.capacity) * 100}%`, background: DS.accent, borderRadius: 2 }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {provPats.map(p => (
                                    <div key={p.id} style={{ padding: '8px 10px', background: DS.contentCard, borderRadius: 7, border: `1px solid ${DS.contentBorder}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: DS.contentText }}>{p.patient}</p>
                                            <span style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace" }}>{p.id}</span>
                                        </div>
                                        <MRNBadge patientId={p.id} />
                                        <p style={{ fontSize: 11, color: DS.contentTextMid, marginTop: 4, lineHeight: 1.4 }}>{p.description}</p>
                                    </div>
                                ))}
                            </div>
                        </CCard>
                    ) : (
                        <CCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40, height: '100%' }}>
                            <BrainCircuit size={36} color={DS.contentBorder} style={{ marginBottom: 12 }} />
                            <p style={{ fontSize: 14, fontWeight: 700, color: DS.contentText, marginBottom: 6 }}>Select an Item</p>
                            <p style={{ fontSize: 12, color: DS.contentTextMid }}>Pick an unassigned patient for AI recommendations, or a provider to view their load.</p>
                        </CCard>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── FLOOR MANAGEMENT (State-Driven Lifecycle) ─────────────────────────── */
function FloorMgmtView({ hospitalState, dispatch }) {
    const [selWard, setSelWard] = useState(null);
    const [selBed, setSelBed] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [patientTimelines, setPatientTimelines] = useState(INITIAL_TIMELINES);
    const [nurseLogs, setNurseLogs] = useState(INITIAL_NURSE_LOGS);
    const [doctorInput, setDoctorInput] = useState('');
    const [nurseInput, setNurseInput] = useState('');

    const addDoctorNote = () => {
        if (!doctorInput.trim() || !selBed) return;
        const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const ev = { time: t, type: 'doctor', role: `Attending: ${selBed.doctor}`, action: 'Clinical Note / Plan', details: doctorInput };
        setPatientTimelines(prev => { const ex = prev[selBed.patientId] || prev['default'] || []; return { ...prev, [selBed.patientId]: [ev, ...ex] }; });
        setDoctorInput('');
        notify("Clinical note added", "success");
    };

    const addNurseLog = () => {
        if (!nurseInput.trim() || !selBed) return;
        const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setNurseLogs(prev => { const ex = prev[selBed.patientId] || []; return { ...prev, [selBed.patientId]: [{ time: t, text: nurseInput }, ...ex] }; });
        setNurseInput('');
        notify("Nursing log updated", "success");
    };

    const tlIconColor = { nurse: '#ccfbf1', procedure: '#ffe4e6', scan: '#ede9fe', lab: '#f3e8ff', doctor: '#dbeafe', admission: '#dcfce7', 'pre-hospital': '#fef3c7', treatment: '#ffe4e6' };
    const tlEmoji = { nurse: '📋', procedure: '💉', scan: '🔬', lab: '🧪', doctor: '👨‍⚕️', admission: '🏥', 'pre-hospital': '🚑', treatment: '💊' };

    const getBedColor = (bed) => {
        if (bed.status === 'vacant') return DS.contentTextDim;
        if (bed.status === 'occupied') return DS.accent;
        if (bed.status === 'discharge_ready') return DS.amber;
        if (bed.status === 'cleaning') return DS.purple;
        if (bed.status === 'ready') return DS.green;
        return DS.contentBorder;
    };

    // 🔥 STATE TRANSITION ENGINE (Direct Click Interaction)
    const handleBedClick = (bed, wardName) => {
        if (bed.status === "vacant") {
            admitPatient(bed, wardName);
        } else if (bed.status === "occupied") {
            requestDischarge(bed, wardName);
        } else if (bed.status === "discharge_ready") {
            attemptDischarge(bed, wardName);
        } else if (bed.status === "cleaning") {
            dispatch({ type: 'UPDATE_BED_STATUS', wardName, bedId: bed.id, status: 'ready' });
            notify(`Bed ${bed.id} is now marked as clean and inspected.`, "success");
        } else if (bed.status === "ready") {
            dispatch({ type: 'UPDATE_BED_STATUS', wardName, bedId: bed.id, status: 'vacant' });
            notify(`Bed ${bed.id} is now vacant and ready for new admission.`, "info");
        }
    };

    // PIPELINE DEPENDENCY: Pull first from Unassigned
    const admitPatient = (bed, wardName) => {
        const patient = hospitalState.unassigned[0];
        if (!patient) {
            notify("No unassigned patients waiting in the pipeline.", "warning");
            return;
        }
        dispatch({ type: 'ADMIT_PATIENT', bedId: bed.id, wardName, patient });
        notify(`Patient ${patient.patient} admitted to ${bed.id}`, "success");
    };

    const requestDischarge = (bed, wardName) => {
        const isSure = window.confirm(`Request discharge for ${bed.patientName}?`);
        if (!isSure) return;
        dispatch({ type: 'REQUEST_DISCHARGE', wardName, bedId: bed.id, patientId: bed.patientId });
        notify(`Discharge initiated for ${bed.patientName}. Awaiting Billing.`, "warning");
    };

    // 🔥 BILLING DEPENDENCY ENFORCEMENT
    const attemptDischarge = (bed, wardName) => {
        const services = hospitalState.services[bed.patientId] || [];
        const unpaid = services.some(s => s.status === "unpaid");
        if (unpaid) {
            notify("Cannot discharge: pending bills", "error");
            return;
        }
        if (!hospitalState.discharge[bed.patientId]?.billerApproved) {
            notify("Billing approval required", "warning");
            return;
        }
        const isSure = window.confirm(`Clear ${bed.patientName} for discharge? Bed will be marked for cleaning.`);
        if (!isSure) return;
        dispatch({ type: 'COMPLETE_DISCHARGE', wardName, bedId: bed.id, patientId: bed.patientId });
        notify(`Patient ${bed.patientName} successfully discharged.`, "success");
    };

    if (selBed && selWard) {
        const timeline = patientTimelines[selBed.patientId] || patientTimelines['default'] || [];
        const logs = nurseLogs[selBed.patientId] || [];
        const diagResult = DIAGNOSTICS_RESULTS_STORE[selBed.patientId];
        const dischargeState = hospitalState.discharge[selBed.patientId] || {};
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slide-up 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => setSelBed(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: DS.contentTextMid, fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", padding: '6px 10px', borderRadius: 6 }}
                        onMouseEnter={e => e.currentTarget.style.background = DS.contentCard} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <ArrowLeft size={14} /> Back to Beds
                    </button>
                    <div style={{ width: 1, height: 16, background: DS.contentBorder }} />
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: DS.contentText, margin: 0 }}>Timeline — {selBed.patientName}</h2>
                        <p style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", margin: '2px 0 0' }}>{selWard.name} · {selBed.id} · {selBed.patientId}</p>
                    </div>
                    {selBed.critical && <SBadge label="CRITICAL PATIENT" color={DS.red} pulse />}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <CCard style={{ padding: 16 }}>
                            <div style={{ width: 48, height: 48, background: selBed.critical ? `${DS.red}18` : `${DS.accent}18`, border: `1px solid ${selBed.critical ? DS.red : DS.accent}30`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: selBed.critical ? DS.red : DS.accent, marginBottom: 10 }}>{selBed.patientName.charAt(0)}</div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: DS.contentText, marginBottom: 2 }}>{selBed.patientName}</h3>
                            <p style={{ fontSize: 11, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 8 }}>{selBed.patientId}</p>
                            <MRNBadge patientId={selBed.patientId} />
                            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: `1px solid ${DS.contentBorder}` }}>
                                {[['Attending', selBed.doctor], ['Location', `${selBed.id} (${selWard.name})`], ['Status', selBed.critical ? '⚠ Critical' : 'Admitted']].map(([l, v]) => (
                                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase' }}>{l}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: l === 'Status' && selBed.critical ? DS.red : DS.contentText }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </CCard>
                        <CCard style={{ padding: 16 }}>
                            <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Current Vitals</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {[['Heart Rate', '82', 'bpm'], ['BP', '118/75', ''], ['SpO2', '98', '%'], ['Temp', '36.9', '°C']].map(([l, v, u]) => (
                                    <div key={l} style={{ background: DS.contentCard, borderRadius: 7, padding: '8px 10px' }}>
                                        <p style={{ fontSize: 9, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', marginBottom: 2 }}>{l}</p>
                                        <p style={{ fontSize: 18, fontWeight: 800, color: DS.contentText, fontFamily: "'IBM Plex Mono',monospace" }}>{v}<span style={{ fontSize: 10, color: DS.contentTextDim }}> {u}</span></p>
                                    </div>
                                ))}
                            </div>
                        </CCard>
                        <CCard style={{ padding: 16 }}>
                            <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Clinical Records</p>
                            {[['Scans & Imaging', 'scans', DS.accent, Microscope], ['Nurse Case Sheet', 'nursing', DS.green, ClipboardList]].map(([label, key, color, Icon]) => (
                                <button key={key} onClick={() => setActiveModal(key)}
                                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: DS.contentBg, border: `1px solid ${DS.contentBorder}`, borderRadius: 7, cursor: 'pointer', marginBottom: 6 }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = color} onMouseLeave={e => e.currentTarget.style.borderColor = DS.contentBorder}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Icon size={14} color={color} />
                                        <span style={{ fontSize: 12, fontWeight: 600, color: DS.contentText }}>{label}</span>
                                    </div>
                                    <ChevronRight size={13} color={DS.contentTextDim} />
                                </button>
                            ))}
                            {diagResult && (
                                <div style={{ background: `${DS.green}10`, border: `1px solid ${DS.green}30`, borderRadius: 7, padding: '8px 10px', marginTop: 6 }}>
                                    <p style={{ fontSize: 10, fontWeight: 600, color: DS.green, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 2 }}>Result Available</p>
                                    <p style={{ fontSize: 11, color: DS.contentText }}>{diagResult.testName}</p>
                                    <p style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace" }}>{diagResult.fileName}</p>
                                </div>
                            )}
                        </CCard>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <CCard style={{ padding: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <div style={{ width: 30, height: 30, background: `${DS.accent}18`, border: `1px solid ${DS.accent}30`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Stethoscope size={14} color={DS.accent} /></div>
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: DS.accent, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase' }}>Doctor Note</p>
                                        <p style={{ fontSize: 9, color: DS.contentTextDim }}>Appends to timeline</p>
                                    </div>
                                </div>
                                <textarea value={doctorInput} onChange={e => setDoctorInput(e.target.value)} placeholder="Clinical observations, diagnosis updates..." style={{ width: '100%', minHeight: 80, background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, borderRadius: 7, padding: '8px 10px', fontSize: 12, color: DS.contentText, resize: 'none', outline: 'none', fontFamily: "'IBM Plex Sans',sans-serif", boxSizing: 'border-box', marginBottom: 8 }} onFocus={e => e.target.style.borderColor = DS.accent} onBlur={e => e.target.style.borderColor = DS.contentBorder} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}><CBtn label="Sign & Submit" variant="primary" onClick={addDoctorNote} disabled={!doctorInput.trim()} small icon={<Send size={10} />} /></div>
                            </CCard>
                            <CCard style={{ padding: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <div style={{ width: 30, height: 30, background: `${DS.green}18`, border: `1px solid ${DS.green}30`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClipboardList size={14} color={DS.green} /></div>
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: DS.green, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase' }}>Nurse Log</p>
                                        <p style={{ fontSize: 9, color: DS.contentTextDim }}>Appends to case sheet</p>
                                    </div>
                                </div>
                                <textarea value={nurseInput} onChange={e => setNurseInput(e.target.value)} placeholder="Shift updates, fluid I/O, medication given..." style={{ width: '100%', minHeight: 80, background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, borderRadius: 7, padding: '8px 10px', fontSize: 12, color: DS.contentText, resize: 'none', outline: 'none', fontFamily: "'IBM Plex Sans',sans-serif", boxSizing: 'border-box', marginBottom: 8 }} onFocus={e => e.target.style.borderColor = DS.green} onBlur={e => e.target.style.borderColor = DS.contentBorder} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}><CBtn label="Log Entry" variant="success" onClick={addNurseLog} disabled={!nurseInput.trim()} small icon={<Send size={10} />} /></div>
                            </CCard>
                        </div>
                        <CCard style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${DS.contentBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ClipboardList size={14} color={DS.contentTextDim} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: DS.contentText, fontFamily: "'IBM Plex Mono',monospace" }}>Medical Timeline</span>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                                <div style={{ borderLeft: `2px solid ${DS.contentBorder}`, marginLeft: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {timeline.map((ev, i) => (
                                        <div key={i} style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: -29, top: 6, width: 14, height: 14, borderRadius: '50%', background: tlIconColor[ev.type] || DS.contentCard, border: `2px solid ${DS.contentSurface}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>{tlEmoji[ev.type] || '•'}</div>
                                            <div style={{ background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, borderRadius: 8, padding: '10px 12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                    <div>
                                                        <p style={{ fontSize: 12, fontWeight: 700, color: DS.contentText }}>{ev.action}</p>
                                                        <p style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', marginTop: 1 }}>{ev.role}</p>
                                                    </div>
                                                    <span style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", background: DS.contentSurface, padding: '2px 6px', borderRadius: 4, border: `1px solid ${DS.contentBorder}`, whiteSpace: 'nowrap' }}>{ev.time}</span>
                                                </div>
                                                <p style={{ fontSize: 12, color: DS.contentTextMid, lineHeight: 1.5 }}>{ev.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CCard>
                    </div>
                </div>
                {activeModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,12,20,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)', animation: 'fade-in 0.15s ease' }}>
                        <div style={{ background: DS.contentSurface, border: `1px solid ${DS.contentBorder}`, borderRadius: 14, width: '100%', maxWidth: 800, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', animation: 'slide-up 0.2s ease' }}>
                            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${DS.contentBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: DS.contentCard }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: DS.contentText, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {activeModal === 'scans' ? <><Microscope size={15} color={DS.accent} /> Radiology & Scans</> : <><ClipboardList size={15} color={DS.green} /> Nurse Case Sheet</>}
                                </h3>
                                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.contentTextDim, display: 'flex', padding: 4 }}><X size={16} /></button>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                                {activeModal === 'scans' ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div>
                                            <div style={{ background: DS.contentText, borderRadius: 10, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                                <p style={{ color: DS.contentTextDim, fontSize: 12 }}>CT_CHEST_SERIES_01.DCM</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {['Axial', 'Sagittal', 'Coronal'].map((v, i) => (
                                                    <div key={v} style={{ width: 60, height: 60, background: i === 0 ? `${DS.accent}18` : DS.contentCard, border: `2px solid ${i === 0 ? DS.accent : DS.contentBorder}`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: i === 0 ? DS.accent : DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</div>
                                                ))}
                                            </div>
                                        </div>
                                        <CCard style={{ padding: 16 }}>
                                            <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${DS.contentBorder}` }}>Radiologist Report</p>
                                            {[['Exam', 'CT Chest w/o Contrast'], ['Clinical Indication', 'Post-MVA. Evaluate for rib fractures and pneumothorax.']].map(([l, v]) => (
                                                <div key={l} style={{ marginBottom: 10 }}>
                                                    <p style={{ fontSize: 10, fontWeight: 700, color: DS.contentText, marginBottom: 3 }}>{l}</p>
                                                    <p style={{ fontSize: 12, color: DS.contentTextMid }}>{v}</p>
                                                </div>
                                            ))}
                                            <div style={{ marginBottom: 10 }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, color: DS.contentText, marginBottom: 3 }}>Findings</p>
                                                <p style={{ fontSize: 12, color: DS.contentTextMid, lineHeight: 1.5 }}>Lungs: Small right apical pneumothorax ~1.5cm. Mild bilateral atelectasis. Bones: Acute non-displaced fractures of right 4th, 5th, 6th lateral ribs.</p>
                                            </div>
                                            <div style={{ background: `${DS.accent}08`, border: `1px solid ${DS.accent}20`, borderRadius: 7, padding: '10px 12px' }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, color: DS.accent, marginBottom: 3 }}>Impression</p>
                                                <p style={{ fontSize: 12, color: DS.contentText, lineHeight: 1.5 }}>1. Right-sided rib fractures (4-6). 2. Small right pneumothorax requiring clinical correlation.</p>
                                            </div>
                                        </CCard>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ background: `${DS.green}08`, border: `1px solid ${DS.green}20`, borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: DS.green }}>Shift: 07:00 - 19:00 (RN Sarah Jenkins)</p>
                                            <SBadge label="Active Shift" color={DS.green} />
                                        </div>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', marginBottom: 8 }}>Fluid I/O (Last 12h)</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                            <div style={{ background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, borderRadius: 7, padding: '10px 12px', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: 12, color: DS.contentTextMid }}>IV Intake (NS)</span>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: DS.accent, fontFamily: "'IBM Plex Mono',monospace" }}>1200 mL</span>
                                            </div>
                                            <div style={{ background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, borderRadius: 7, padding: '10px 12px', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: 12, color: DS.contentTextMid }}>Urine Output</span>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: DS.amber, fontFamily: "'IBM Plex Mono',monospace" }}>850 mL</span>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', marginBottom: 8 }}>Medication Log</p>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
                                            <thead><tr style={{ background: DS.contentCard }}>
                                                {['Time', 'Medication', 'Dose / Route', 'Status'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', borderBottom: `1px solid ${DS.contentBorder}` }}>{h}</th>)}
                                            </tr></thead>
                                            <tbody>
                                                {[['10:00 AM', 'Morphine Sulfate', '4mg IV Push', 'given'], ['08:45 AM', 'Cefazolin', '1g IVPB', 'given']].map(([t, m, d, s]) => (
                                                    <tr key={m} style={{ borderBottom: `1px solid ${DS.contentBorder}` }}>
                                                        <td style={{ padding: '10px 12px', color: DS.contentTextMid, fontFamily: "'IBM Plex Mono',monospace" }}>{t}</td>
                                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: DS.contentText }}>{m}</td>
                                                        <td style={{ padding: '10px 12px', color: DS.contentTextMid }}>{d}</td>
                                                        <td style={{ padding: '10px 12px' }}><SBadge label={s} color={DS.green} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', marginBottom: 8 }}>Nursing Notes</p>
                                        {logs.length > 0 ? logs.map((l, i) => (
                                            <div key={i} style={{ background: `${DS.green}08`, border: `1px solid ${DS.green}20`, borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                                                <p style={{ fontSize: 10, color: DS.green, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 4 }}>{l.time}</p>
                                                <p style={{ fontSize: 12, color: DS.contentText, lineHeight: 1.5 }}>{l.text}</p>
                                            </div>
                                        )) : <p style={{ fontSize: 12, color: DS.contentTextDim, fontStyle: 'italic' }}>No nursing notes yet.</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (selWard) {
        const beds = BEDS_STORE[selWard.name] || [];

        return (
            <div style={{ animation: 'slide-up 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <button onClick={() => setSelWard(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: DS.contentTextMid, fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", padding: '6px 10px', borderRadius: 6 }}
                        onMouseEnter={e => e.currentTarget.style.background = DS.contentCard} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <ArrowLeft size={14} /> All Wards
                    </button>
                    <div style={{ width: 1, height: 16, background: DS.contentBorder }} />
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: DS.contentText, margin: 0 }}>{selWard.name}</h2>
                    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                        {[['Occupied', beds.filter(b => b.status === 'occupied').length, DS.accent], ['Vacant', beds.filter(b => b.status === 'vacant').length, DS.green], ['Cleaning', beds.filter(b => b.status === 'cleaning').length, DS.amber]].map(([l, n, c]) => (
                            <SBadge key={l} label={`${l} (${n})`} color={c} />
                        ))}
                        {beds.filter(b => b.critical).length > 0 && <SBadge label={`${beds.filter(b => b.critical).length} Critical`} color={DS.red} pulse />}
                    </div>
                </div>

                {/* INSTRUCTION BANNER FOR INTERACTIVITY */}
                <div style={{ background: `${DS.accent}10`, border: `1px solid ${DS.accent}30`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={16} color={DS.accent} />
                    <span style={{ fontSize: 12, color: DS.contentTextMid }}>
                        <strong>Simulation Active:</strong> Click on any bed to directly trigger its lifecycle transition (Vacant → Admit → Request Discharge → Attempt Discharge → Clean → Ready → Vacant).
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
                    {beds.map(bed => {
                        const isO = bed.status === 'occupied';
                        const isC = bed.status === 'cleaning';
                        const isV = bed.status === 'vacant';
                        const isDR = bed.status === 'discharge_ready';
                        const isR = bed.status === 'ready';
                        const isCritical = isO && bed.critical;

                        const c = isCritical ? DS.red : getBedColor(bed);
                        const isPulsing = isDR || isCritical;
                        const anim = isCritical ? 'critical-border 2s infinite' : isDR ? 'discharge-border 2s infinite' : undefined;

                        return (
                            <button key={bed.id} onClick={() => handleBedClick(bed, selWard.name)}
                                style={{ textAlign: 'left', padding: 12, background: DS.contentSurface, border: `${isPulsing ? '2px' : '1px'} solid ${isPulsing ? c + '60' : DS.contentBorder}`, borderTop: `3px solid ${c}`, borderRadius: 9, cursor: 'pointer', transition: 'all 0.15s', animation: anim }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = isPulsing ? c : c + '80'; e.currentTarget.style.background = DS.contentBg; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = isPulsing ? c + '60' : DS.contentBorder; e.currentTarget.style.background = DS.contentSurface; }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Bed size={12} color={c} />
                                        <span style={{ fontSize: 11, fontWeight: 700, color: DS.contentText, fontFamily: "'IBM Plex Mono',monospace" }}>{bed.id}</span>
                                    </div>
                                    <StatusDot color={c} pulse={isPulsing} />
                                </div>
                                <SBadge label={isCritical ? 'CRITICAL' : bed.status.replace('_', ' ')} color={c} />
                                {(isO || isDR) && (
                                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${DS.contentBorder}` }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: DS.contentText, marginBottom: 2 }}>{bed.patientName}</p>
                                        <p style={{ fontSize: 10, color: DS.contentTextDim, marginBottom: 6 }}>{bed.doctor}</p>
                                        <MRNBadge patientId={bed.patientId} />
                                        <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                                            <span onClick={(e) => { e.stopPropagation(); setSelBed(bed); }} style={{ fontSize: 10, color: isCritical ? DS.red : DS.accent, fontFamily: "'IBM Plex Mono',monospace", display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 6px', background: DS.contentCard, borderRadius: 4, border: `1px solid ${DS.contentBorder}` }}>
                                                <Activity size={10} /> Details
                                            </span>
                                            <span style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 6px', background: DS.contentCard, borderRadius: 4, border: `1px solid ${DS.contentBorder}` }}>
                                                <ChevronRight size={10} /> Next Stage
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {isV && <p style={{ fontSize: 11, color: DS.contentTextDim, marginTop: 6 }}>Click to Admit Pipeline Patient</p>}
                                {isDR && <p style={{ fontSize: 11, color: DS.amber, marginTop: 6, fontWeight: 600 }}>Click to Attempt Discharge</p>}
                                {isC && <p style={{ fontSize: 11, color: DS.purple, marginTop: 6 }}>Click to Mark Ready</p>}
                                {isR && <p style={{ fontSize: 11, color: DS.green, marginTop: 6 }}>Click to Mark Vacant</p>}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div>
            <CHeader title="Bed & Ward Management" sub="Module 3 · Floor Status — select a ward" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {WARDS_DATA.map((wardConfig, i) => {
                    const beds = hospitalState.beds[wardConfig.name] || [];
                    const occBeds = beds.filter(b => b.status === 'occupied' || b.status === 'discharge_ready').length;
                    const cleanBeds = beds.filter(b => b.status === 'cleaning').length;
                    const vacBeds = beds.filter(b => b.status === 'vacant' || b.status === 'ready').length;
                    const occ = (occBeds / beds.length) * 100 || 0;
                    return (
                        <button key={i} onClick={() => setSelWard(wardConfig)} style={{ textAlign: 'left', padding: 18, background: DS.contentSurface, border: `1px solid ${DS.contentBorder}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = DS.accent; e.currentTarget.style.boxShadow = `0 4px 20px ${DS.accent}18`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = DS.contentBorder; e.currentTarget.style.boxShadow = 'none'; }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <h3 style={{ fontSize: 13, fontWeight: 700, color: DS.contentText, margin: 0 }}>{wardConfig.name}</h3>
                                <ChevronRight size={14} color={DS.contentTextDim} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                {[['Occupied', occBeds, DS.contentText], ['Cleaning', cleanBeds, DS.purple], ['Available', vacBeds, DS.green]].map(([l, n, c]) => (
                                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 12, color: DS.contentTextMid }}>{l}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: "'IBM Plex Mono',monospace" }}>{n}</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", color: DS.contentTextDim, marginBottom: 4 }}>
                                    <span>Capacity</span><span>{Math.round(occ)}%</span>
                                </div>
                                <div style={{ height: 4, background: DS.contentCard, borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${occ}%`, background: occ > 85 ? DS.red : occ > 65 ? DS.amber : DS.accent, borderRadius: 2 }} />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── DIAGNOSTICS ─────────────────────────────────────────────────────────── */
function DiagnosticsView() {
    const [tab, setTab] = useState('lab');
    const [labRows, setLabRows] = useState(LAB_RESULTS_INIT);
    const [radioRows, setRadioRows] = useState(RADIOLOGY_RESULTS_INIT);
    const [modal, setModal] = useState(null);
    const rows = tab === 'lab' ? labRows : radioRows;
    const setRows = tab === 'lab' ? setLabRows : setRadioRows;

    const openModal = (row) => {
        if (row.status === 'COMPLETED') return;
        const alreadyTesting = row.status === 'TESTING' || row.status === 'IN-PROGRESS';
        setModal({ row, rowType: tab, step: alreadyTesting ? 'upload' : 'mrn', mrnInput: '', mrnError: '', uploadFile: null, uploadError: '' });
    };
    const handleMrnSubmit = () => {
        if (!modal) return;
        const exp = getOrCreateMRN(modal.row.patientId);
        if (modal.mrnInput.trim().toUpperCase() !== exp.toUpperCase()) { setModal(m => ({ ...m, mrnError: "MRN does not match patient record." })); return; }
        const ns = modal.rowType === 'lab' ? 'TESTING' : 'IN-PROGRESS';
        (modal.rowType === 'lab' ? setLabRows : setRadioRows)(prev => prev.map(r => r.id === modal.row.id ? { ...r, status: ns } : r));
        setModal(m => ({ ...m, step: 'upload', mrnError: '', row: { ...m.row, status: ns } }));
        notify("Patient MRN successfully verified", "success");
    };
    const handleUploadSubmit = () => {
        if (!modal?.uploadFile) { setModal(m => ({ ...m, uploadError: 'Please select a file.' })); return; }
        DIAGNOSTICS_RESULTS_STORE[modal.row.patientId] = { testName: modal.row.test, fileName: modal.uploadFile.name, uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), orderId: modal.row.id };
        (modal.rowType === 'lab' ? setLabRows : setRadioRows)(prev => prev.map(r => r.id === modal.row.id ? { ...r, status: 'COMPLETED', time: 'Just now' } : r));
        setTimeout(() => (modal.rowType === 'lab' ? setLabRows : setRadioRows)(prev => prev.filter(r => r.id !== modal.row.id)), 1800);
        setModal(null);
        notify("Results safely uploaded to patient record", "success");
    };

    const statusColor = s => s === 'COMPLETED' ? DS.green : s === 'STAT REQUEST' ? DS.red : s === 'TESTING' || s === 'IN-PROGRESS' ? DS.amber : DS.accent;

    return (
        <div style={{ position: 'relative' }}>
            <CHeader title="Diagnostics Hub" sub="Module 4 · Labs & Radiology"
                right={<div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${DS.accent}08`, border: `1px solid ${DS.accent}20`, borderRadius: 7, padding: '5px 10px', fontSize: 11, color: DS.accent, fontFamily: "'IBM Plex Mono',monospace" }}><Hash size={12} /> Verify using MRN from Floor Mgmt</div>}
            />
            <CCard>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${DS.contentBorder}`, display: 'flex', gap: 8 }}>
                    {[['lab', 'Laboratory', TestTube], ['radiology', 'Radiology', Activity]].map(([key, label, Icon]) => (
                        <button key={key} onClick={() => setTab(key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: 11, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", border: `1px solid ${tab === key ? DS.accent : DS.contentBorder}`, borderRadius: 7, background: tab === key ? `${DS.accent}10` : 'transparent', color: tab === key ? DS.accent : DS.contentTextMid, cursor: 'pointer', transition: 'all 0.15s' }}>
                            <Icon size={13} />{label}
                        </button>
                    ))}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: DS.contentCard }}>
                        {['Order ID', 'Patient', 'Test Type', 'Status', 'Time', 'Action'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', borderBottom: `1px solid ${DS.contentBorder}` }}>{h}</th>
                        ))}
                    </tr></thead>
                    <tbody>
                        {rows.map(row => (
                            <tr key={row.id} style={{ borderBottom: `1px solid ${DS.contentBorder}` }}>
                                <td style={{ padding: '12px 14px', fontSize: 11, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace" }}>{row.id}</td>
                                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: DS.contentText }}>{row.patient}</td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: DS.contentTextMid }}>{row.test}</td>
                                <td style={{ padding: '12px 14px' }}><SBadge label={row.status} color={statusColor(row.status)} /></td>
                                <td style={{ padding: '12px 14px', fontSize: 11, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace" }}>{row.time}</td>
                                <td style={{ padding: '12px 14px' }}>
                                    {row.status !== 'COMPLETED' ? (
                                        <CBtn label={row.status === 'TESTING' || row.status === 'IN-PROGRESS' ? 'Upload Results' : 'Verify & Process'} variant={row.status === 'TESTING' || row.status === 'IN-PROGRESS' ? 'success' : 'primary'} onClick={() => openModal(row)} small />
                                    ) : <span style={{ fontSize: 11, color: DS.contentTextDim }}>—</span>}
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: DS.contentTextDim, fontSize: 13, fontStyle: 'italic' }}>All orders processed.</td></tr>}
                    </tbody>
                </table>
            </CCard>
            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,12,20,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)', animation: 'fade-in 0.15s ease' }}>
                    <div style={{ background: DS.contentSurface, border: `1px solid ${DS.contentBorder}`, borderRadius: 14, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.4)', animation: 'slide-up 0.2s ease' }}>
                        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${DS.contentBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: DS.contentCard }}>
                            <div>
                                <h3 style={{ fontSize: 13, fontWeight: 700, color: DS.contentText, margin: 0 }}>{modal.step === 'mrn' ? 'Patient MRN Verification' : 'Upload Diagnostic Results'}</h3>
                                <p style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>{modal.row.id} · {modal.row.test}</p>
                            </div>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.contentTextDim }}><X size={16} /></button>
                        </div>
                        <div style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, borderRadius: 9, padding: '10px 12px', marginBottom: 16, gap: 10 }}>
                                <div style={{ width: 36, height: 36, background: `${DS.accent}18`, border: `1px solid ${DS.accent}30`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: DS.accent, flexShrink: 0 }}>{modal.row.patient.charAt(0)}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: DS.contentText, margin: 0 }}>{modal.row.patient}</p>
                                    <p style={{ fontSize: 11, color: DS.contentTextDim }}>{modal.row.test}</p>
                                </div>
                                <SBadge label={modal.row.status} color={statusColor(modal.row.status)} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                                {['MRN', 'Upload'].map((s, i) => (
                                    <React.Fragment key={s}>
                                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: modal.step === 'mrn' && i === 0 ? DS.accent : modal.step === 'upload' ? DS.green : DS.contentCard, border: `1px solid ${DS.contentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: modal.step === 'mrn' && i === 0 ? '#fff' : modal.step === 'upload' ? '#fff' : DS.contentTextDim }}>
                                            {modal.step === 'upload' && i === 0 ? '✓' : i + 1}
                                        </div>
                                        {i === 0 && <div style={{ flex: 1, height: 1, background: modal.step === 'upload' ? DS.green : DS.contentBorder }} />}
                                    </React.Fragment>
                                ))}
                            </div>
                            {modal.step === 'mrn' ? (
                                <>
                                    <label style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Enter Patient MRN</label>
                                    <input value={modal.mrnInput} onChange={e => setModal(m => ({ ...m, mrnInput: e.target.value, mrnError: '' }))} onKeyDown={e => e.key === 'Enter' && handleMrnSubmit()} placeholder="e.g. MRN-20250317-4821"
                                        style={{ width: '100%', background: DS.contentCard, border: `1px solid ${modal.mrnError ? DS.red : DS.contentBorder}`, borderRadius: 8, padding: '10px 12px', fontSize: 13, color: DS.contentText, fontFamily: "'IBM Plex Mono',monospace", outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = DS.accent} onBlur={e => e.target.style.borderColor = modal.mrnError ? DS.red : DS.contentBorder} />
                                    {modal.mrnError && <div style={{ display: 'flex', gap: 6, background: `${DS.red}10`, border: `1px solid ${DS.red}30`, borderRadius: 7, padding: '7px 10px', marginBottom: 10 }}><AlertTriangle size={13} color={DS.red} /><span style={{ fontSize: 12, color: DS.red }}>{modal.mrnError}</span></div>}
                                    <div style={{ background: `${DS.amber}10`, border: `1px solid ${DS.amber}30`, borderRadius: 7, padding: '8px 10px', marginBottom: 14, display: 'flex', gap: 6 }}>
                                        <AlertTriangle size={13} color={DS.amber} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <p style={{ fontSize: 11, color: DS.contentTextMid }}>MRN verification prevents sample mix-ups.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <CBtn label="Cancel" variant="ghost" onClick={() => setModal(null)} />
                                        <CBtn label="Verify MRN →" variant="primary" onClick={handleMrnSubmit} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${DS.green}10`, border: `1px solid ${DS.green}30`, borderRadius: 7, padding: '7px 10px', marginBottom: 12 }}>
                                        <CheckCircle size={13} color={DS.green} /><p style={{ fontSize: 11, fontWeight: 600, color: DS.green }}>MRN verified — status updated</p>
                                    </div>
                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${modal.uploadFile ? DS.green : DS.contentBorder}`, borderRadius: 9, padding: '24px 16px', cursor: 'pointer', marginBottom: 8, background: DS.contentCard }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = DS.accent} onMouseLeave={e => e.currentTarget.style.borderColor = modal.uploadFile ? DS.green : DS.contentBorder}>
                                        <FileText size={28} color={DS.contentTextDim} style={{ marginBottom: 8 }} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: modal.uploadFile ? DS.green : DS.contentTextMid }}>{modal.uploadFile ? `✓ ${modal.uploadFile.name}` : 'Click to browse file'}</span>
                                        <span style={{ fontSize: 11, color: DS.contentTextDim, marginTop: 3 }}>PDF, DICOM, PNG, JPG</span>
                                        <input type="file" accept=".pdf,.dcm,.png,.jpg,.jpeg" onChange={e => setModal(m => ({ ...m, uploadFile: e.target.files[0] || null, uploadError: '' }))} style={{ display: 'none' }} />
                                    </label>
                                    {modal.uploadError && <p style={{ fontSize: 11, color: DS.red, marginBottom: 8 }}>{modal.uploadError}</p>}
                                    <p style={{ fontSize: 10, color: DS.contentTextDim, marginBottom: 14 }}>Results will be marked Completed and linked to the patient dashboard.</p>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <CBtn label="Cancel" variant="ghost" onClick={() => setModal(null)} />
                                        <CBtn label="Upload & Complete" variant="success" onClick={handleUploadSubmit} disabled={!modal.uploadFile} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── BILLING ─────────────────────────────────────────────────────────────── */
function BillingView({ hospitalState, dispatch }) {
    const { admitted, services, discharge } = hospitalState;
    const [selPat, setSelPat] = useState(null);
    const [payModal, setPayModal] = useState(null);
    const [payMethod, setPayMethod] = useState(null);
    const [payConfirmed, setPayConfirmed] = useState(false);
    const [billingLock, setBillingLock] = useState(false);  // race-condition guard

    // keep selPat in sync with latest hospitalState (e.g. after payment)
    useEffect(() => {
        if (selPat) {
            const fresh = admitted.find(p => p.id === selPat.id);
            if (fresh) setSelPat(fresh);
        }
    }, [admitted]); // eslint-disable-line

    const openPay = (pid, sid) => { setPayModal({ patientId: pid, serviceId: sid }); setPayMethod(null); setPayConfirmed(false); };
    const confirmPay = () => {
        if (!payMethod || !payModal || payConfirmed) return;
        setPayConfirmed(true);
        setTimeout(() => {
            dispatch({ type: 'UPDATE_SERVICE_PAYMENT', patientId: payModal.patientId, serviceId: payModal.serviceId });
            notify("Payment completely processed and saved to ledger", "success");
            setPayModal(null); setPayConfirmed(false); setPayMethod(null);
        }, 1000);
    };

    // 🔥 BILLING CLEARANCE (race-condition safe)
    const approveDischarge = (pid) => {
        if (billingLock) return;
        setBillingLock(true);
        dispatch({ type: 'APPROVE_DISCHARGE', patientId: pid });
        notify("Billing approved. Patient cleared for discharge on floor.", "success");
        setTimeout(() => setBillingLock(false), 800);
    };

    const totalUnpaid = admitted.reduce((a, p) => a + (services[p.id] || []).filter(s => s.status === 'unpaid').reduce((x, s) => x + s.amount, 0), 0);
    const totalPaid = admitted.reduce((a, p) => a + (services[p.id] || []).filter(s => s.status === 'paid').reduce((x, s) => x + s.amount, 0), 0);
    const pendingDischarges = admitted.filter(p => discharge[p.id]?.doctorRequested && !discharge[p.id]?.billerApproved).length;
    const selSvcs = selPat ? (services[selPat.id] || []) : [];
    const allPaid = selSvcs.length > 0 && selSvcs.every(s => s.status === 'paid');
    const selDs = selPat ? discharge[selPat.id] : null;
    const catColor = { Accommodation: DS.accent, Surgery: DS.red, Radiology: DS.purple, Lab: DS.purple, Procedure: DS.red, Pharmacy: DS.green, Consultation: DS.amber, Nursing: DS.green };

    return (
        <div style={{ position: 'relative' }}>
            <CHeader title="Financial Ledger" sub="Module 5 · Billing & Insurance"
                right={pendingDischarges > 0 ? <SBadge label={`${pendingDischarges} discharge pending`} color={DS.amber} pulse /> : null}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
                {[['Total Collected', `₹${totalPaid.toLocaleString('en-IN')}`, DS.green, DollarSign], ['Outstanding Dues', `₹${totalUnpaid.toLocaleString('en-IN')}`, DS.red, AlertOctagon], ['Active Patients', admitted.length, DS.accent, Users]].map(([l, v, c, Icon]) => (
                    <CCard key={l} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, background: `${c}18`, border: `1px solid ${c}30`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={18} color={c} /></div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', marginBottom: 3 }}>{l}</p>
                            <p style={{ fontSize: 20, fontWeight: 800, color: DS.contentText, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</p>
                        </div>
                    </CCard>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
                <CCard style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${DS.contentBorder}` }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase' }}>Admitted Patients</span>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {admitted.map(p => {
                            const svcs = services[p.id] || [];
                            const due = svcs.filter(s => s.status === 'unpaid').reduce((a, s) => a + s.amount, 0);
                            const cleared = svcs.length > 0 && svcs.every(s => s.status === 'paid');
                            const ds = discharge[p.id];
                            const isSel = selPat?.id === p.id;
                            return (
                                <button key={p.id} onClick={() => setSelPat(p)} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: isSel ? `${DS.accent}08` : 'transparent', border: 'none', borderBottom: `1px solid ${DS.contentBorder}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: isSel ? DS.accent : DS.contentCard, border: `1px solid ${isSel ? DS.accent : DS.contentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: isSel ? '#fff' : DS.contentTextMid, flexShrink: 0 }}>{p.name.charAt(0)}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: DS.contentText, margin: 0 }}>{p.name}</p>
                                        <p style={{ fontSize: 10, color: DS.contentTextDim, margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.ward}</p>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        {cleared ? <SBadge label="Cleared" color={DS.green} /> : <span style={{ fontSize: 12, fontWeight: 800, color: DS.red, fontFamily: "'IBM Plex Mono',monospace" }}>₹{due.toLocaleString('en-IN')}</span>}
                                        {ds?.doctorRequested && !ds?.billerApproved && <div style={{ marginTop: 3 }}><SBadge label="Disch. Req." color={DS.amber} pulse /></div>}
                                        {ds?.billerApproved && <div style={{ marginTop: 3 }}><SBadge label="Ready" color={DS.accent} /></div>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CCard>
                {selPat ? (
                    <CCard style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${DS.contentBorder}`, background: DS.contentCard }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: DS.contentText, margin: 0 }}>{selPat.name}</h3>
                                        <MRNBadge patientId={selPat.id} />
                                    </div>
                                    <p style={{ fontSize: 11, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace" }}>{selPat.ward} · {selPat.doctor} · Admitted {selPat.admitDate}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 2 }}>Total Bill</p>
                                    <p style={{ fontSize: 22, fontWeight: 800, color: DS.contentText, fontFamily: "'IBM Plex Mono',monospace" }}>₹{selSvcs.reduce((a, s) => a + s.amount, 0).toLocaleString('en-IN')}</p>
                                    <p style={{ fontSize: 11, color: DS.red, fontFamily: "'IBM Plex Mono',monospace" }}>₹{selSvcs.filter(s => s.status === 'unpaid').reduce((a, s) => a + s.amount, 0).toLocaleString('en-IN')} due</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
                            <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', marginBottom: 10 }}>Services Utilised</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {selSvcs.map(svc => (
                                    <div key={svc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: svc.status === 'paid' ? `${DS.green}06` : DS.contentSurface, border: `1px solid ${svc.status === 'paid' ? DS.green + '20' : DS.contentBorder}`, borderRadius: 9 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: svc.status === 'paid' ? `${DS.green}20` : `${DS.red}10`, border: `1.5px solid ${svc.status === 'paid' ? DS.green : DS.contentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {svc.status === 'paid' && <span style={{ fontSize: 9, color: DS.green }}>✓</span>}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: svc.status === 'paid' ? DS.contentTextDim : DS.contentText, textDecoration: svc.status === 'paid' ? 'line-through' : 'none', margin: 0 }}>{svc.name}</p>
                                                <SBadge label={svc.category} color={catColor[svc.category] || DS.contentTextDim} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 12 }}>
                                            <p style={{ fontSize: 13, fontWeight: 800, color: svc.status === 'paid' ? DS.contentTextDim : DS.contentText, fontFamily: "'IBM Plex Mono',monospace" }}>₹{svc.amount.toLocaleString('en-IN')}</p>
                                            {svc.status === 'paid' ? <SBadge label="Paid" color={DS.green} /> : <CBtn label="Pay Now" variant="primary" onClick={() => openPay(selPat.id, svc.id)} small />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: '12px 18px', borderTop: `1px solid ${DS.contentBorder}`, background: DS.contentCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                            <div>
                                {selDs?.doctorRequested ? <p style={{ fontSize: 12, fontWeight: 700, color: DS.amber, display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={13} /> Discharge requested by attending doctor</p> : <p style={{ fontSize: 12, color: DS.contentTextMid }}>No discharge request from doctor yet</p>}
                                {selDs?.billerApproved && <p style={{ fontSize: 11, color: DS.accent, fontFamily: "'IBM Plex Mono',monospace", marginTop: 3 }}>✓ Billing cleared — Patient ready for discharge</p>}
                                {!allPaid && selDs?.doctorRequested && !selDs?.billerApproved && <p style={{ fontSize: 11, color: DS.red, marginTop: 3 }}>Clear all dues before approving discharge</p>}
                            </div>
                            {selDs?.doctorRequested && !selDs?.billerApproved && <CBtn label="Approve Discharge" variant={allPaid ? 'primary' : 'ghost'} disabled={!allPaid} onClick={() => approveDischarge(selPat.id)} icon={<CheckCircle size={13} />} />}
                            {selDs?.billerApproved && <SBadge label="Ready for Discharge" color={DS.accent} />}
                        </div>
                    </CCard>
                ) : (
                    <CCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
                        <div style={{ width: 56, height: 56, background: DS.contentCard, border: `2px dashed ${DS.contentBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                            <Receipt size={24} color={DS.contentTextDim} />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: DS.contentText, marginBottom: 6 }}>Select a Patient</p>
                        <p style={{ fontSize: 12, color: DS.contentTextMid }}>Click any patient to view their itemised bill and payment status.</p>
                    </CCard>
                )}
            </div>
            {payModal && (() => {
                const svc = (services[payModal.patientId] || []).find(s => s.id === payModal.serviceId);
                const pat = admitted.find(p => p.id === payModal.patientId);
                if (!svc || !pat) return null;
                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,12,20,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)', animation: 'fade-in 0.15s ease' }}>
                        <div style={{ background: DS.contentSurface, border: `1px solid ${DS.contentBorder}`, borderRadius: 14, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.4)', animation: 'slide-up 0.2s ease' }}>
                            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${DS.contentBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: DS.contentCard }}>
                                <div>
                                    <h3 style={{ fontSize: 13, fontWeight: 700, color: DS.contentText, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign size={14} color={DS.accent} />Process Payment</h3>
                                    <p style={{ fontSize: 10, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>{pat.name} · {svc.name}</p>
                                </div>
                                <button onClick={() => setPayModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.contentTextDim }}><X size={16} /></button>
                            </div>
                            <div style={{ padding: 20 }}>
                                <div style={{ background: `${DS.accent}08`, border: `1px solid ${DS.accent}20`, borderRadius: 9, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: DS.accent, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 3 }}>Amount Due</p>
                                        <p style={{ fontSize: 28, fontWeight: 900, color: DS.contentText, fontFamily: "'IBM Plex Mono',monospace" }}>₹{svc.amount.toLocaleString('en-IN')}</p>
                                    </div>
                                    <SBadge label={svc.category} color={catColor[svc.category] || DS.contentTextDim} />
                                </div>
                                <p style={{ fontSize: 10, fontWeight: 600, color: DS.contentTextDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', marginBottom: 8 }}>Payment Method</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                                    {[['upi', 'UPI', '⚡'], ['cash', 'Cash', '💵'], ['card', 'Card', '💳']].map(([k, l, e]) => (
                                        <button key={k} onClick={() => setPayMethod(k)} style={{ padding: '12px 8px', background: payMethod === k ? `${DS.accent}12` : DS.contentCard, border: `2px solid ${payMethod === k ? DS.accent : DS.contentBorder}`, borderRadius: 9, cursor: 'pointer', textAlign: 'center' }}>
                                            <p style={{ fontSize: 20, marginBottom: 4 }}>{e}</p>
                                            <p style={{ fontSize: 11, fontWeight: 700, color: payMethod === k ? DS.accent : DS.contentTextMid, fontFamily: "'IBM Plex Mono',monospace" }}>{l}</p>
                                        </button>
                                    ))}
                                </div>
                                {payMethod && !payConfirmed && (
                                    <div style={{ background: DS.contentCard, border: `1px solid ${DS.contentBorder}`, borderRadius: 7, padding: '8px 12px', marginBottom: 12, textAlign: 'center' }}>
                                        <p style={{ fontSize: 12, color: DS.contentTextMid }}>
                                            {payMethod === 'upi' && 'UPI ID: hospital@axisbank — confirm once received'}
                                            {payMethod === 'card' && 'Swipe / tap on POS terminal — confirm after Approved'}
                                            {payMethod === 'cash' && `Collect ₹${svc.amount.toLocaleString('en-IN')} cash — issue manual receipt`}
                                        </p>
                                    </div>
                                )}
                                {payConfirmed && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${DS.green}10`, border: `1px solid ${DS.green}30`, borderRadius: 7, padding: '8px 12px', marginBottom: 12 }}>
                                        <CheckCircle size={14} color={DS.green} /><p style={{ fontSize: 12, fontWeight: 700, color: DS.green }}>Payment confirmed! Updating record...</p>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <CBtn label="Cancel" variant="ghost" onClick={() => setPayModal(null)} />
                                    <CBtn label="Confirm Payment" variant="success" onClick={confirmPay} disabled={!payMethod || payConfirmed} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

/* ─── COMMAND CENTER (Mission Control) ────────────────────────────────────── */
const CmdCard = ({ title, icon: Icon, children, flex, badge, style }) => (
    <div style={{ background: DS.surfaceHigh, border: `1px solid ${DS.borderLight}`, borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: flex || 'none', ...style }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${DS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: DS.surface }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icon && <Icon size={14} color={DS.accent} />}
                <span style={{ fontSize: 12, fontWeight: 700, color: DS.text, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
            </div>
            {badge}
        </div>
        <div className="dark-card-scroll" style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {children}
        </div>
    </div>
);

const PipelineStage = ({ icon: Icon, label, count, color }) => (
    <div style={{ flex: 1, background: DS.surfaceHigh, border: `1px solid ${DS.borderLight}`, borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color={color} />
        </div>
        <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: DS.text, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1 }}>{count}</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: DS.textDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', marginTop: 4 }}>{label}</p>
        </div>
    </div>
);

function CommandView({ hospitalState }) {
    // 🔥 LIVE PIPELINE STATS (Derived from useReducer state)
    const { unassigned, assigned, admitted, discharge, beds } = hospitalState;
    const stats = {
        incoming: TRIAGE_INCOMING.length,
        unassigned: unassigned.length,
        assigned: assigned.length,
        admitted: admitted.length,
        dischargePending: Object.values(discharge).filter(d => d.doctorRequested && !d.billerApproved).length
    };

    const icuBeds = beds['ICU - Trauma'] || [];
    const icuOcc = Math.round((icuBeds.filter(b => b.status === 'occupied').length / Math.max(icuBeds.length, 1)) * 100);
    const wardBeds = [...(beds['General Ward A'] || []), ...(beds['Cardiology Step-down'] || []), ...(beds['Pediatrics'] || [])];
    const wardOcc = Math.round((wardBeds.filter(b => b.status === 'occupied').length / Math.max(wardBeds.length, 1)) * 100);

    const alerts = [];
    if (icuOcc > 85) alerts.push({ text: `ICU critical capacity (${icuOcc}%) - RED ALERT`, level: 'red' });
    else if (icuOcc > 70) alerts.push({ text: `ICU nearing capacity (${icuOcc}%)`, level: 'amber' });

    const critCount = TRIAGE_INCOMING.filter(i => i.priority === 'CRITICAL').length;
    if (critCount > 2) alerts.push({ text: `Multiple critical patients inbound (${critCount})`, level: 'red' });

    if (wardOcc > 85) alerts.push({ text: `Wards critical capacity (${wardOcc}%) - RED ALERT`, level: 'red' });
    else if (wardOcc > 70) alerts.push({ text: `Wards nearing target capacity (${wardOcc}%)`, level: 'amber' });

    if (alerts.length === 0) alerts.push({ text: `All systems nominal. Capacity manageable.`, level: 'green' });

    const STAGES = ['🚑 Incoming', '🧠 Allocation', '🛏 Floor', '💰 Billing', '🧾 Discharge'];

    const JOURNEY_PATIENTS = [
        ...TRIAGE_INCOMING.map(t => ({
            id: t.id, name: t.patient, stage: 0, priority: t.priority, stages: STAGES
        })),
        ...hospitalState.unassigned.map(u => ({
            id: u.id, name: u.patient, stage: 1, priority: u.priority, stages: STAGES
        })),
        ...hospitalState.admitted.map(a => {
            const isDischReq = hospitalState.discharge[a.id]?.doctorRequested;
            const isDischAppr = hospitalState.discharge[a.id]?.billerApproved;
            let stage = 2; // Floor
            if (isDischAppr) stage = 4; // Discharge Ready
            else if (isDischReq) stage = 3; // Billing Pending

            return {
                id: a.id, name: a.name, stage, priority: 'STABLE', stages: STAGES
            };
        })
    ].slice(0, 6);

    const activeAmbulances = [
        ...TRIAGE_INCOMING.map(inc => ({
            unit: inc.unit,
            status: 'En Route',
            eta: inc.eta,
            c: inc.priority === 'CRITICAL' ? DS.red : DS.amber,
            patient: inc.patient
        })),
        { unit: 'Unit 08', status: 'Arrived', eta: '--', c: DS.green, patient: 'Cleared to ER' }
    ];

    return (
        <div style={{ margin: '-24px', padding: '24px', minHeight: 'calc(100% + 48px)', background: DS.bg, color: DS.text, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: DS.text, fontFamily: "'IBM Plex Sans',sans-serif", margin: 0 }}>Command Mission Control</h2>
                    <p style={{ fontSize: 11, color: DS.textDim, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', margin: '3px 0 0' }}>Macro-level Real-time Overview</p>
                </div>
                <SBadge label="Live Telemetry" color={DS.accent} pulse />
            </div>

            {/* LIVE PIPELINE TRACKER */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <PipelineStage icon={Ambulance} label="Incoming" count={stats.incoming} color={DS.red} />
                <ChevronRight size={16} color={DS.borderLight} style={{ alignSelf: 'center' }} />
                <PipelineStage icon={BrainCircuit} label="Pending Alloc" count={stats.unassigned} color={DS.amber} />
                <ChevronRight size={16} color={DS.borderLight} style={{ alignSelf: 'center' }} />
                <PipelineStage icon={Users} label="Assigned" count={stats.assigned} color={DS.green} />
                <ChevronRight size={16} color={DS.borderLight} style={{ alignSelf: 'center' }} />
                <PipelineStage icon={Bed} label="Admitted" count={stats.admitted} color={DS.accent} />
                <ChevronRight size={16} color={DS.borderLight} style={{ alignSelf: 'center' }} />
                <PipelineStage icon={Receipt} label="Disch. Pending" count={stats.dischargePending} color={DS.purple} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 16, marginBottom: 16 }}>
                <CmdCard title="Active Emergencies" icon={ShieldAlert} badge={<SBadge label={`${TRIAGE_INCOMING.length} Active`} color={DS.red} pulse />}>
                    {TRIAGE_INCOMING.map(inc => (
                        <div key={inc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 8, marginBottom: 8, borderLeft: `3px solid ${inc.priority === 'CRITICAL' ? DS.red : DS.amber}` }}>
                            <div>
                                <p style={{ color: DS.text, fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{inc.patient}</p>
                                <p style={{ color: DS.textDim, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }}>{inc.id} · {inc.unit}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ color: inc.priority === 'CRITICAL' ? DS.red : DS.amber, fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{inc.priority}</p>
                                <p style={{ color: DS.textMid, fontSize: 12, fontWeight: 600 }}>ETA {inc.eta}</p>
                            </div>
                        </div>
                    ))}
                </CmdCard>

                <CmdCard title="Hospital Capacity" icon={BarChart3}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[['Intensive Care Unit', icuOcc], ['General & Step-down Wards', wardOcc], ['Emergency Bays', 65]].map(([l, v], i) => {
                            const c = v >= 85 ? DS.red : v >= 70 ? DS.amber : DS.green;
                            return (
                                <div key={l}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 6 }}>
                                        <span style={{ color: DS.textMid }}>{l}</span>
                                        <span style={{ color: c, fontWeight: 700 }}>{v}%</span>
                                    </div>
                                    <div style={{ height: 6, background: DS.surface, borderRadius: 3, border: `1px solid ${DS.borderLight}` }}>
                                        <div style={{ height: '100%', width: `${v}%`, background: c, borderRadius: 2 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CmdCard>

                <CmdCard title="System Alerts" icon={AlertOctagon}>
                    {alerts.map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${DS[a.level === 'green' ? 'surface' : a.level]}10`, border: `1px solid ${DS[a.level === 'green' ? 'borderLight' : a.level]}30`, padding: '12px 14px', borderRadius: 8, marginBottom: 8 }}>
                            {a.level === 'green' ? <CheckCircle size={16} color={DS.green} /> : <AlertTriangle size={16} color={DS[a.level]} style={{ animation: a.level === 'red' ? 'pulse-dot 1s infinite' : undefined }} />}
                            <p style={{ color: DS.text, fontSize: 12, fontWeight: 600 }}>{a.text}</p>
                        </div>
                    ))}
                </CmdCard>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, flex: 1, minHeight: 0 }}>
                <CmdCard title="Ambulance Network" icon={Ambulance}>
                    {activeAmbulances.map((u, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 8, marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <StatusDot color={u.c} pulse={u.status === 'En Route'} />
                                <div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: DS.text, fontFamily: "'IBM Plex Mono',monospace", display: 'block' }}>{u.unit}</span>
                                    <span style={{ fontSize: 9, color: DS.textDim }}>{u.patient}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 10, color: u.c, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase' }}>{u.status === 'En Route' ? 'LIVE' : u.status}</p>
                                {u.eta !== '--' && <p style={{ fontSize: 10, color: DS.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>ETA {u.eta}</p>}
                            </div>
                        </div>
                    ))}
                </CmdCard>

                <CmdCard title="Patient Journey Tracker" icon={Navigation} style={{ content: { padding: 0 } }}>
                    <div style={{ overflowX: 'auto', flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                            <thead>
                                <tr style={{ background: DS.surface }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: DS.textDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', borderBottom: `1px solid ${DS.border}` }}>Patient</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: DS.textDim, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', borderBottom: `1px solid ${DS.border}` }}>Live Tracking Pipeline</th>
                                </tr>
                            </thead>
                            <tbody>
                                {JOURNEY_PATIENTS.map(jp => {
                                    const pc = jp.priority === 'CRITICAL' ? DS.red : jp.priority === 'URGENT' ? DS.amber : DS.green;
                                    return (
                                        <tr key={jp.id} style={{ borderBottom: `1px solid ${DS.borderLight}` }}>
                                            <td style={{ padding: '14px 16px', verticalAlign: 'middle', width: 220 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                    <PriorityBadge priority={jp.priority} />
                                                    <span style={{ fontSize: 10, color: DS.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>{jp.id}</span>
                                                </div>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: DS.text }}>{jp.name}</p>
                                            </td>
                                            <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
                                                    {jp.stages.map((stage, si) => {
                                                        const isDone = si < jp.stage;
                                                        const isCurrent = si === jp.stage;
                                                        return (
                                                            <React.Fragment key={si}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, flex: 1, position: 'relative' }}>
                                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: isCurrent ? pc : isDone ? DS.green : DS.surface, border: `2px solid ${isCurrent ? pc : isDone ? DS.green : DS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: isCurrent || isDone ? '#fff' : DS.textDim, zIndex: 2, animation: isCurrent ? 'pulse-dot 1.8s infinite' : undefined }}>
                                                                        {isDone ? '✓' : (si + 1)}
                                                                    </div>
                                                                    <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", color: isCurrent ? pc : isDone ? DS.green : DS.textDim, marginTop: 6, fontWeight: isCurrent ? 700 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>{stage.slice(2)}</span>
                                                                </div>
                                                                {si < jp.stages.length - 1 && (
                                                                    <div style={{ height: 2, flex: 1, background: isDone ? DS.green : DS.borderLight, margin: '0 -10px', marginBottom: 15, zIndex: 1 }} />
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CmdCard>
            </div>
        </div>
    );
}