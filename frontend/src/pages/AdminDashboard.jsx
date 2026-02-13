import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Siren, CheckCircle, XCircle, Activity, MapPin, 
  ShieldAlert, BrainCircuit, Clock, PlusCircle, Building2, Save, 
  Ambulance, User, Navigation, Video
} from "lucide-react";

// --- IMPORT RESTORED HERE ---
import Silk from '../PagesUI/Silk.jsx'; 
import LogoutButton from '../PagesUI/LogoutButton.jsx';
import BlurText from '../PagesUI/BlurText.jsx';

/* ================= ICONS ================= */
const ambulanceIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2967/2967350.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/4320/4320371.png', 
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const accidentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/564/564619.png', 
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const missionIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1533/1533913.png', 
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

/* ================= UTILS & COMPONENTS ================= */
const getCurrentTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const MapController = ({ view }) => {
  const map = useMap();
  useEffect(() => {
    if (view) {
      map.flyTo(view.center, view.zoom, { duration: 1.5 });
    }
  }, [view, map]);
  return null;
};

const Modal = ({ isOpen, onClose, title, children, color = "#4cc9f0" }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ borderColor: color, boxShadow: `0 0 30px ${color}40` }}>
        <div className="modal-header">
          <h3 style={{ color: color, textShadow: `0 0 10px ${color}` }}>{title}</h3>
          <button onClick={onClose} className="close-btn"><XCircle size={24} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

/* ================= MAIN DASHBOARD ================= */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(getCurrentTime());
  const [activeModal, setActiveModal] = useState(null); 
  const [mapView, setMapView] = useState({ center: [17.385, 78.48], zoom: 13 });

  /* --- DATA STATE --- */
  const [hospitals, setHospitals] = useState([
    { id: 1, name: "City General", lat: 17.401, lng: 78.49 },
    { id: 2, name: "Apollo Jubilee", lat: 17.388, lng: 78.455 },
  ]);

  const [ambulances, setAmbulances] = useState([
    { id: 1, name: 'Alpha-01', driver: 'Ramesh', regNo: 'TS09AB1234', verified: true, status: 'On Duty', type: 'ALS', base: {lat:17.375,lng:78.47}, position: {lat:17.380,lng:78.475}, route: [], active: true, camUrl: 'http://192.168.1.15:5000/video_feed' },
    { id: 2, name: 'Beta-04', driver: 'Suresh', regNo: 'TS10XY4567', verified: true, status: 'Idle', type: 'BLS', base: {lat:17.39,lng:78.46}, position: {lat:17.39,lng:78.46}, route: [], active: false, camUrl: null },
    { id: 3, name: 'Gamma-09', driver: 'Kiran', regNo: 'TS08PQ8899', verified: true, status: 'On Duty', type: 'ALS', base: {lat:17.37,lng:78.49}, position: {lat:17.365,lng:78.485}, route: [], active: true, camUrl: 'http://192.168.1.20:5000/video_feed' },
    { id: 4, name: 'Delta-12', driver: 'Unknown', regNo: 'AP39EX9999', verified: false, status: 'Pending', type: 'BLS', base: {lat:17.40,lng:78.50}, position: {lat:17.40,lng:78.50}, route: [], active: false, camUrl: null },
  ]);

  const [reports, setReports] = useState([
    {
        id: 101, reporter: "Ravi Kumar", time: "10:42 AM", location: { lat: 17.385, lng: 78.48 },
        img: "https://images.unsplash.com/photo-1599700403969-f77b37d6305f?auto=format&fit=crop&w=300&q=80",
        aiAnalysis: { confidence: 98, severity: "CRITICAL", type: "Vehicle Collision" }
    }
  ]);

  const [missions, setMissions] = useState([
    { id: 501, title: "Mission #501", target: { lat: 17.385, lng: 78.48 }, unit: "Alpha-01", status: "EN ROUTE", eta: "4 mins" }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(getCurrentTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* --- HANDLERS --- */
  const verifyAmbulance = (id) => {
    setAmbulances(prev => prev.map(amb => amb.id === id ? { ...amb, verified: true, status: 'Idle' } : amb));
    alert("Ambulance Verified & Added to Fleet");
  };

  const handleDispatch = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    setReports(prev => prev.filter(r => r.id !== reportId));
    const newMission = {
        id: Date.now(),
        title: `Mission #${Date.now().toString().slice(-4)}`,
        target: report.location,
        unit: "Beta-04",
        status: "DISPATCHED",
        eta: "8 mins"
    };
    setMissions([...missions, newMission]);
    setAmbulances(prev => prev.map(a => a.name === "Beta-04" ? { ...a, status: 'On Duty', active: true } : a));
    alert("Unit Beta-04 Dispatched!");
  };

  const handleFocusMission = (mission) => {
    setMapView({ center: [mission.target.lat, mission.target.lng], zoom: 15 });
  };

  const handleViewCamera = (url) => {
    if (url) {
      window.open(`/live-stream?url=${encodeURIComponent(url)}`, '_blank');
    } else {
      alert("Camera feed unavailable or offline.");
    }
  };

  const handleAddHospital = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const lat = parseFloat(formData.get('lat'));
    const lng = parseFloat(formData.get('lng'));
    const name = formData.get('name');

    if(!lat || !lng || !name) return alert("Please fill all fields.");

    const newHospital = { id: Date.now(), name, lat, lng };
    setHospitals([...hospitals, newHospital]); // Add to state
    setActiveModal(null); // Close modal
    
    // Fly map to new location
    setMapView({ center: [lat, lng], zoom: 15 });
    alert(`${name} added to database successfully!`);
  };

  return (
    <div style={container}>
      
      {/* BACKGROUND (Dark Mode) */}
      <div style={bgWrap}>
        <Silk speed={5} scale={1} color="#1a1a1a" noiseIntensity={0.5} />
      </div>

      <div style={logoutPos}><LogoutButton onClick={() => navigate('/')} /></div>

      {/* HEADER */}
      <div style={header}>
        <div style={{display:'flex', alignItems:'center', gap:15}}>
            <Activity size={32} color="#4cc9f0" className="pulse-slow" />
            <div>
                <BlurText text="IVERAS ADMIN COMMAND" delay={100} animateBy="letters" direction="top" className="header-title"/>
                <p style={headerSub}>CENTRAL MONITORING SYSTEM • {time}</p>
            </div>
        </div>
      </div>

      <div style={bentoGrid}>
        
        {/* COL 1: FLEET & DATABASE */}
        <div style={sidePanel}>
            {/* FLEET STATUS */}
            <div style={cardSection}>
                <div style={sectionHeader}>
                    <h3><Ambulance size={18}/> Fleet Status</h3>
                    <span style={{fontSize:10, color:'#00ff9d'}}>● {ambulances.length} Units</span>
                </div>
                <div style={scrollList}>
                    {ambulances.map(amb => (
                        <div key={amb.id} style={fleetCard}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                                <div style={{fontWeight:'bold', color: 'white'}}>{amb.name}</div>
                                <span style={statusPill(amb.status)}>{amb.status}</span>
                            </div>
                            <div style={{fontSize:11, color:'#888', marginBottom:10}}>
                                {amb.regNo} • {amb.driver} • {amb.type}
                            </div>
                            
                            <div style={{display:'flex', gap: 10}}>
                                {amb.verified && (
                                    <button style={btnCam} onClick={() => handleViewCamera(amb.camUrl)}>
                                        <Video size={12} /> View Cam
                                    </button>
                                )}
                                {!amb.verified && (
                                    <button style={btnVerify} onClick={() => verifyAmbulance(amb.id)}>
                                        <CheckCircle size={12} /> Approve
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ADD HOSPITAL BUTTON (Triggers Modal) */}
            <div style={dbSection}>
                <button style={btnAddHospital} onClick={() => setActiveModal('addHospital')}>
                    <PlusCircle size={20} />
                    <span>ADD HOSPITAL TO DB</span>
                </button>
            </div>
        </div>

        {/* COL 2: LIVE MAP */}
        <div style={mapPanel}>
            <div style={mapHeaderOverlay}>
                <span>LIVE SATELLITE TRACKING</span>
                <span style={{color:'#ff4d4d', animation:'blink 1s infinite'}}>● MONITORING SENSORS</span>
            </div>
            
            <MapContainer center={mapView.center} zoom={mapView.zoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <MapController view={mapView} />
                {/* Dark Tiles for Dark Theme */}
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                
                {reports.map(r => (
                    <Marker key={r.id} position={[r.location.lat, r.location.lng]} icon={accidentIcon}>
                        <Popup>🚨 REPORTED INCIDENT</Popup>
                    </Marker>
                ))}
                
                {missions.map(m => (
                    <Marker key={m.id} position={[m.target.lat, m.target.lng]} icon={missionIcon}>
                        <Popup>🎯 TARGET: {m.title}</Popup>
                    </Marker>
                ))}

                {ambulances.map(amb => (
                    <Marker key={'m'+amb.id} position={[amb.position.lat, amb.position.lng]} icon={ambulanceIcon}>
                        <Popup>🚑 {amb.name} ({amb.status})</Popup>
                    </Marker>
                ))}
                
                {hospitals.map((h) => (
                    <Marker key={'h'+h.id} position={[h.lat, h.lng]} icon={hospitalIcon}>
                        <Popup>🏥 {h.name}</Popup>
                    </Marker>
                ))}
                
                {missions.map(m => (
                     <Polyline key={'line'+m.id} positions={[[17.375, 78.47], [m.target.lat, m.target.lng]]} color="#007bff" dashArray="5, 10" />
                ))}
            </MapContainer>
        </div>

        {/* COL 3: ALERTS & MISSIONS */}
        <div style={sidePanel}>
            
            {/* REPORTS */}
            <div style={{...cardSection, borderColor: '#ff4d4d'}}>
                <div style={sectionHeaderRed}>
                    <h3><ShieldAlert size={18}/> Incoming Alerts</h3>
                    <span style={badgeRed}>{reports.length}</span>
                </div>
                <div style={scrollList}>
                    {reports.length === 0 ? <div style={emptyState}>No Active Alerts</div> : 
                        reports.map(report => (
                            <div key={report.id} style={incidentCard}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                                    <span style={tagSos}>CRITICAL</span>
                                    <span style={{fontSize:11, color:'#888'}}>{report.time}</span>
                                </div>
                                <div style={{display:'flex', gap:10, marginBottom:10}}>
                                    <img src={report.img} alt="Crash" style={thumbImg} />
                                    <div style={{flex:1}}>
                                        <div style={aiTag}><BrainCircuit size={12}/> AI: {report.aiAnalysis.severity}</div>
                                        <p style={{fontSize:11, color:'#aaa', marginTop:5}}>Loc: {report.location.lat}, {report.location.lng}</p>
                                    </div>
                                </div>
                                <button style={btnDispatch} onClick={() => handleDispatch(report.id)}>
                                    DISPATCH UNIT
                                </button>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* MISSIONS */}
            <div style={cardSection}>
                <div style={sectionHeader}>
                    <h3><Navigation size={18}/> Active Missions</h3>
                </div>
                <div style={scrollList}>
                    {missions.map(m => (
                        <div key={m.id} style={missionCard} onClick={() => handleFocusMission(m)}>
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                                <span style={{fontWeight:'bold', color:'#007bff'}}>{m.title}</span>
                                <span style={{fontSize:11, fontWeight:'bold', color:'#28a745'}}>LIVE</span>
                            </div>
                            <div style={{fontSize:12, color:'#888', marginTop:5}}>
                                Unit: <strong>{m.unit}</strong> • ETA: {m.eta}
                            </div>
                            <div style={clickHint}>Click to Track</div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>

      {/* --- ADD HOSPITAL MODAL --- */}
      <Modal isOpen={activeModal === 'addHospital'} onClose={() => setActiveModal(null)} title="Add Hospital to Database" color="#4cc9f0">
         <form onSubmit={handleAddHospital} style={{display:'flex', flexDirection:'column', gap:15}}>
            <div>
                <label style={label}>Hospital Name</label>
                <div style={inputWithIcon}>
                    <Building2 size={16} color="#666"/>
                    <input name="name" placeholder="e.g. Yashoda Hospital" required style={input} />
                </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15}}>
                <div>
                    <label style={label}>Latitude</label>
                    <div style={inputWithIcon}>
                        <MapPin size={16} color="#666"/>
                        <input name="lat" type="number" step="any" placeholder="17.xxxx" required style={input} />
                    </div>
                </div>
                <div>
                    <label style={label}>Longitude</label>
                    <div style={inputWithIcon}>
                        <MapPin size={16} color="#666"/>
                        <input name="lng" type="number" step="any" placeholder="78.xxxx" required style={input} />
                    </div>
                </div>
            </div>
            <button type="submit" style={btnPrimary}>
                <Save size={18} style={{marginRight:8}} /> SAVE & UPDATE MAP
            </button>
         </form>
      </Modal>

      <style>
        {`
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; }
        
        /* SCROLLBAR */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        
        .header-title { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: white; }
        .pulse-slow { animation: pulseSlow 3s infinite; }
        @keyframes pulseSlow { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
        .blink { animation: blink 1.5s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } }
        `}
      </style>
    </div>
  );
};

/* ================= STYLES ================= */
const container = { height: '100vh', width: '100vw', color: 'white', fontFamily: "'Inter', sans-serif", overflow: 'hidden', background: '#000' };
const bgWrap = { position: 'fixed', inset: 0, zIndex: 0 };
const logoutPos = { position: 'fixed', top: 25, right: 30, zIndex: 50 };

const header = { height: '90px', display: 'flex', alignItems: 'center', padding: '0 40px', position: 'relative', zIndex: 2 };
const headerSub = { margin: 0, fontSize: '12px', opacity: 0.6, fontFamily: 'monospace', letterSpacing: '1px', marginTop: 5 };

const bentoGrid = { display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: '20px', padding: '20px 40px 40px 40px', height: 'calc(100vh - 90px)', position: 'relative', zIndex: 2 };

/* PANELS */
const sidePanel = { display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto', paddingRight: '5px' };
const mapPanel = { background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden', position: 'relative', backdropFilter: 'blur(10px)' };
const cardSection = { background: 'rgba(20, 20, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, backdropFilter: 'blur(20px)' };
const dbSection = { height: 'auto' };

const sectionHeader = { padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: '#ccc' };
const sectionHeaderRed = { ...sectionHeader, background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', borderBottom: '1px solid rgba(255,0,0,0.2)' };
const scrollList = { padding: '15px', overflowY: 'auto', flex: 1 };
const badgeRed = { background: '#ff4d4d', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px' };
const emptyState = { textAlign: 'center', color: '#666', fontSize: '12px', padding: '20px', fontStyle: 'italic' };

/* CARDS */
const fleetCard = { background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '15px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.05)' };
const statusPill = (s) => ({ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', background: s === 'On Duty' ? 'rgba(76, 201, 240, 0.2)' : 'rgba(255,255,255,0.1)', color: s === 'On Duty' ? '#4cc9f0' : '#888', fontWeight: 'bold' });
const btnCam = { flex: 1, background: 'rgba(76, 201, 240, 0.1)', color: '#4cc9f0', border: '1px solid rgba(76, 201, 240, 0.3)', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };
const btnVerify = { flex: 1, background: 'rgba(0, 255, 157, 0.1)', color: '#00ff9d', border: '1px solid rgba(0, 255, 157, 0.3)', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };

const incidentCard = { background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.3)', borderRadius: '10px', padding: '12px', marginBottom: '10px' };
const tagSos = { fontSize: '10px', background: '#ff4d4d', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' };
const thumbImg = { width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #555' };
const aiTag = { fontSize: '10px', color: '#ff4d4d', background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' };
const btnDispatch = { width: '100%', background: '#ff4d4d', border: 'none', color: 'white', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' };

const missionCard = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '10px', transition: '0.2s' };
const clickHint = { fontSize: '9px', textAlign: 'center', marginTop: '5px', opacity: 0.4, fontStyle: 'italic' };

const btnAddLarge = { width: '100%', padding: '15px', background: 'rgba(76, 201, 240, 0.1)', border: '1px dashed rgba(76, 201, 240, 0.3)', borderRadius: '12px', color: '#4cc9f0', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s' };
const btnAddHospital = { width: '100%', padding: '20px', background: 'rgba(76, 201, 240, 0.1)', border: '1px dashed rgba(76, 201, 240, 0.3)', borderRadius: '16px', color: '#4cc9f0', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s' };

const mapHeaderOverlay = { position: 'absolute', top: 20, left: 20, zIndex: 500, background: 'rgba(0,0,0,0.8)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', gap: '15px', border: '1px solid rgba(255,255,255,0.1)' };

/* MODAL */
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalContent = { background: '#111', width: '400px', borderRadius: '20px', border: '1px solid #333', overflow: 'hidden' };
const modalHeader = { padding: '20px', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)' };
const modalBody = { padding: '20px' };
const label = { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '5px', color: '#888' };
const input = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', fontSize: '14px', background: '#222', outline: 'none', color: 'white' };
const inputWithIcon = { display: 'flex', alignItems: 'center', gap: '10px', background: '#222', border: '1px solid #333', padding: '0 10px', borderRadius: '6px' };
const btnPrimary = { background: '#4cc9f0', color: 'black', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' };

export default AdminDashboard;