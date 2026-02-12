// HelperDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import Silk from '../PagesUI/Silk.jsx';
import LogoutButton from '../PagesUI/LogoutButton.jsx';
import BlurText from '../PagesUI/BlurText.jsx';

/* ================= ICONS ================= */

const accidentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -45],
  className: 'pulsing-icon'
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/4320/4320371.png',
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -40],
});

// New Icon for the Helper (You)
const helperIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png', // Car/Ambulance Icon
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -40],
});

/* ================= DATA ================= */

const ACCIDENT_DATA = {
  id: 'AC-2026-X99',
  name: 'Ravi Kumar',
  vehicle: 'TS09AB1234',
  severity: 'Critical',
  lat: 17.385044,
  lng: 78.486671,
  address: 'Charminar Rd, Hyderabad, Telangana 500002',
  bloodGroup: 'O+',
  medicalHistory: 'Diabetic, Hypertension',
  allergies: 'Penicillin, Peanuts'
};

const NEAREST_HOSPITAL = {
  name: 'Osmania General Hospital',
  lat: 17.375,
  lng: 78.48,
  distance: '1.2 km',
  contact: '+91 40 2460 0146',
};

// Simulated Helper Location (Nearby)
const HELPER_START_LOC = {
  lat: 17.3616, 
  lng: 78.4747
};

// Component to handle map view updates
const MapUpdater = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

const HelperDashboard = () => {
  const navigate = useNavigate();
  const [activeAccident, setActiveAccident] = useState(ACCIDENT_DATA);
  const [status, setStatus] = useState('Pending'); 
  const [helperLoc, setHelperLoc] = useState(HELPER_START_LOC);
  const [routePath, setRoutePath] = useState([]); // Stores the navigation coordinates
  const [mapBounds, setMapBounds] = useState(null);

  const handleLogout = () => {
    navigate('/');
  };

  // ✅ UPDATED: Robust Routing with Fallback
  // Tries real roads first; if API fails, draws a straight line so UI never breaks.
  const fetchRoute = async (start, end) => {
    const fallbackPath = [
      [start.lat, start.lng],
      [end.lat, end.lng]
    ];

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        // OSRM returns [lng, lat], Leaflet needs [lat, lng]
        const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoutePath(coordinates);
        
        // Calculate bounds to zoom the map to fit the route
        const latLngs = coordinates.map(coord => L.latLng(coord[0], coord[1]));
        const bounds = L.latLngBounds(latLngs);
        setMapBounds(bounds);
      } else {
        throw new Error("API returned no valid route");
      }
    } catch (error) {
      console.warn("Routing API failed or timed out (using fallback line):", error);
      
      // Fallback: Draw straight line
      setRoutePath(fallbackPath);
      
      const bounds = L.latLngBounds([
        [start.lat, start.lng],
        [end.lat, end.lng]
      ]);
      setMapBounds(bounds);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    
    if (newStatus === 'Accepted') {
      // Trigger navigation calculation
      fetchRoute(helperLoc, activeAccident);
    } else if (newStatus === 'Arrived') {
      // Clear route on arrival
      setRoutePath([]);
      setMapBounds(null);
    }
  };

  return (
    <div style={container}>
      {/* CSS ANIMATIONS */}
      <style>
        {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulseRed {
            0% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(255, 77, 77, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
          }
           @keyframes dash {
            to { stroke-dashoffset: -100; }
          }
          
          .anim-panel { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
          .anim-delay-1 { animation-delay: 0.2s; }
          .anim-delay-2 { animation-delay: 0.4s; }
          
          .interactive-row { transition: all 0.3s ease; padding: 8px; border-radius: 8px; }
          .interactive-row:hover { background: rgba(255, 255, 255, 0.05); transform: translateX(5px); }
          
          .action-btn { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); transform: scale(1); }
          .action-btn:hover { transform: scale(1.05); letter-spacing: 1px; }
          .action-btn:active { transform: scale(0.95); }
          
          .leaflet-marker-icon.pulsing-icon {
            filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.6));
            animation: pulse-marker 1.5s infinite alternate;
          }
          @keyframes pulse-marker {
            from { transform: scale(1); }
            to { transform: scale(1.1); }
          }
        `}
      </style>

      {/* BACKGROUND */}
      <div style={bgWrap}>
        <Silk speed={5} scale={1} color="#2b0000" noiseIntensity={1.5} />
      </div>

      {/* LOGOUT */}
      <div style={logoutPos}>
        <LogoutButton onClick={handleLogout} />
      </div>

      {/* HEADER */}
      <div style={header}>
        <div style={headerText}>
          <BlurText
            text="EMERGENCY RESPONSE DASHBOARD"
            delay={150}
            animateBy="letters"
            direction="top"
          />
        </div>
        <div style={statusWrapper}>
          <p style={subHeader}>CURRENT STATUS</p>
          <div style={{ ...statusBadge(status), ...(status === 'Pending' ? { animation: 'pulseRed 2s infinite' } : {}) }}>
            {status}
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div style={contentWrap}>
        <div style={grid}>
          {/* LEFT PANEL: DETAILS */}
          <div className="anim-panel anim-delay-1" style={panelLeft}>
            <div style={panelHeader}>
              <h3 style={sectionTitle}>🚨 Accident Details</h3>
              <span style={liveIndicator}>● LIVE</span>
            </div>

            <div className="interactive-row" style={detailRow}>
              <span style={label}>Victim Name</span>
              <span style={value}>{activeAccident.name}</span>
            </div>

            <div className="interactive-row" style={detailRow}>
              <span style={label}>Vehicle No</span>
              <span style={value}>{activeAccident.vehicle}</span>
            </div>

            <div className="interactive-row" style={detailRow}>
              <span style={label}>Severity</span>
              <span style={criticalValue}>{activeAccident.severity}</span>
            </div>

            <div className="interactive-row" style={detailRow}>
              <span style={label}>Location</span>
              <span style={value}>{activeAccident.address}</span>
            </div>

            {/* MEDICAL SECTION */}
            <div style={medicalSection}>
              <h4 style={medicalTitle}>⚕️ Medical Profile</h4>
              
              <div style={detailRow}>
                <span style={label}>Blood Group</span>
                <span style={bloodValue}>{activeAccident.bloodGroup}</span>
              </div>

              <div style={detailRow}>
                <span style={label}>History</span>
                <span style={value}>{activeAccident.medicalHistory}</span>
              </div>

              <div style={detailRow}>
                <span style={label}>Allergies</span>
                <span style={alertValue}>{activeAccident.allergies}</span>
              </div>
            </div>

            <hr style={divider} />

            <h3 style={sectionTitle}>🏥 Suggested Hospital</h3>
            <div className="interactive-row" style={hospitalCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#ff6b6b', fontSize: '1.1rem' }}>
                  {NEAREST_HOSPITAL.name}
                </h4>
                <span style={distanceBadge}>{NEAREST_HOSPITAL.distance}</span>
              </div>
              <p style={{ margin: '5px 0 0 0', color: '#ccc', fontSize: '0.9rem' }}>
                📞 {NEAREST_HOSPITAL.contact}
              </p>
            </div>

            <div style={actionButtons}>
              {status === 'Pending' && (
                <button
                  className="action-btn"
                  style={btnAccept}
                  onClick={() => handleStatusChange('Accepted')}
                >
                  ACCEPT REQUEST
                </button>
              )}
              {status === 'Accepted' && (
                <button
                  className="action-btn"
                  style={btnRoute}
                  onClick={() => handleStatusChange('On Route')}
                >
                  START ROUTE
                </button>
              )}
              {status === 'On Route' && (
                <button
                  className="action-btn"
                  style={btnArrive}
                  onClick={() => handleStatusChange('Arrived')}
                >
                  ARRIVED AT SCENE
                </button>
              )}
              {status === 'Arrived' && (
                <div style={completedMsg}>
                  ✅ MISSION COMPLETED
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: MAP */}
          <div className="anim-panel anim-delay-2" style={panelRight}>
            <MapContainer
              center={[activeAccident.lat, activeAccident.lng]}
              zoom={14}
              style={mapStyle}
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapUpdater bounds={mapBounds} />

              {/* Accident Marker */}
              <Marker position={[activeAccident.lat, activeAccident.lng]} icon={accidentIcon}>
                <Popup className="custom-popup">
                  <strong style={{color: 'red'}}>CRITICAL ACCIDENT</strong>
                </Popup>
              </Marker>

              {/* Hospital Marker */}
              <Marker position={[NEAREST_HOSPITAL.lat, NEAREST_HOSPITAL.lng]} icon={hospitalIcon}>
                <Popup><strong>{NEAREST_HOSPITAL.name}</strong></Popup>
              </Marker>

              {/* Helper (Your) Marker - Shows only when active */}
              {status !== 'Pending' && status !== 'Arrived' && (
                 <Marker position={[helperLoc.lat, helperLoc.lng]} icon={helperIcon}>
                   <Popup><strong>YOU (Emergency Unit)</strong></Popup>
                 </Marker>
              )}

              {/* ✅ UPDATED NAVIGATION ROUTE VISUALS */}
              {routePath.length > 0 && (
                <>
                  {/* Black outline for contrast */}
                  <Polyline 
                    positions={routePath} 
                    pathOptions={{ color: 'black', weight: 8, opacity: 0.6 }} 
                  />
                  {/* Colored Route Line */}
                  <Polyline 
                    positions={routePath} 
                    pathOptions={{ 
                      color: status === 'On Route' ? '#00ff9d' : '#00aaff', 
                      weight: 5, 
                      opacity: 1,
                      dashArray: status === 'Accepted' ? '10, 15' : null, 
                      lineCap: 'round'
                    }} 
                  />
                </>
              )}

            </MapContainer>
            
            {/* Map Overlay Info */}
            <div style={mapOverlay}>
              <span style={{color: status === 'On Route' ? '#00ff9d' : '#fff'}}>
                ● {status === 'On Route' ? 'NAVIGATION ACTIVE' : 'GPS READY'}
              </span>
              <span style={{marginLeft: '15px'}}>
                {routePath.length > 0 ? 'ROUTE CALCULATED' : 'WAITING FOR TASK'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= STYLES ================= */

const container = {
  minHeight: '100vh',
  color: '#fff',
  fontFamily: '"Poppins", sans-serif',
  position: 'relative',
  overflow: 'hidden',
};

const bgWrap = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
};

const logoutPos = {
  position: 'fixed',
  top: 20,
  right: 20,
  zIndex: 50,
};

const header = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: '25px',
  position: 'relative',
  zIndex: 2,
  width: '100%',
};

const headerText = {
  fontSize: '2.8rem',
  fontWeight: 900,
  letterSpacing: '3px',
  color: '#fff',
  textShadow: '0 0 20px rgba(255, 77, 77, 0.6)',
  textAlign: 'center',
  marginBottom: '10px',
};

const statusWrapper = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  background: 'rgba(0,0,0,0.4)',
  padding: '8px 20px',
  borderRadius: '50px',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(5px)',
};

const subHeader = {
  fontSize: '0.9rem',
  color: '#aaa',
  letterSpacing: '1px',
  margin: 0,
};

const statusBadge = (status) => ({
  fontSize: '0.9rem',
  fontWeight: 'bold',
  padding: '5px 15px',
  borderRadius: '20px',
  textTransform: 'uppercase',
  transition: 'all 0.3s ease',
  backgroundColor: 
    status === 'Pending' ? 'rgba(255, 77, 77, 0.2)' :
    status === 'Accepted' ? 'rgba(255, 170, 0, 0.2)' :
    status === 'On Route' ? 'rgba(0, 204, 255, 0.2)' :
    'rgba(0, 255, 157, 0.2)',
  color:
    status === 'Pending' ? '#ff4d4d' :
    status === 'Accepted' ? '#ffaa00' :
    status === 'On Route' ? '#00ccff' :
    '#00ff9d',
  border: `1px solid ${
    status === 'Pending' ? '#ff4d4d' :
    status === 'Accepted' ? '#ffaa00' :
    status === 'On Route' ? '#00ccff' :
    '#00ff9d'
  }`
});

const contentWrap = {
  position: 'relative',
  zIndex: 2,
  padding: '30px 50px',
  height: 'calc(100vh - 140px)',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.6fr',
  gap: '30px',
  height: '100%',
};

const panel = {
  background: 'linear-gradient(145deg, rgba(20, 10, 10, 0.9), rgba(40, 10, 10, 0.95))',
  borderRadius: 24,
  padding: 28,
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  flexDirection: 'column',
};

const panelLeft = {
  ...panel,
  overflowY: 'auto', 
};

const panelRight = {
  ...panel,
  padding: 12,
  position: 'relative',
};

const panelHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  paddingBottom: '15px',
};

const sectionTitle = {
  fontSize: '1.4rem',
  color: '#ff8585',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const liveIndicator = {
  fontSize: '0.8rem',
  color: '#ff4d4d',
  fontWeight: 'bold',
  animation: 'pulseRed 2s infinite',
  padding: '4px 8px',
  background: 'rgba(255, 0, 0, 0.1)',
  borderRadius: '4px',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px',
  fontSize: '1rem',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
};

const label = {
  color: '#888',
  fontSize: '0.95rem',
};

const value = {
  fontWeight: '600',
  color: '#e0e0e0',
  textAlign: 'right',
};

const criticalValue = {
  fontWeight: 'bold',
  color: '#ff4d4d',
  textTransform: 'uppercase',
  textShadow: '0 0 10px rgba(255, 77, 77, 0.4)',
  padding: '2px 8px',
  background: 'rgba(255, 0, 0, 0.1)',
  borderRadius: '4px',
};

const medicalSection = {
  marginTop: '25px',
  padding: '20px',
  background: 'linear-gradient(145deg, rgba(255, 50, 50, 0.05), rgba(0,0,0,0.2))',
  borderRadius: '16px',
  border: '1px dashed rgba(255, 80, 80, 0.3)',
};

const medicalTitle = {
  margin: '0 0 15px 0',
  color: '#ffcccc',
  fontSize: '1.1rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  opacity: 0.9,
};

const bloodValue = {
  fontWeight: '900',
  color: '#ff4d4d',
  fontSize: '1.3rem',
  background: '#fff',
  padding: '2px 8px',
  borderRadius: '6px',
};

const alertValue = {
  fontWeight: '600',
  color: '#ffaa00',
  textAlign: 'right',
};

const divider = {
  border: '0',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  margin: '25px 0',
};

const hospitalCard = {
  background: 'rgba(255, 255, 255, 0.03)',
  padding: '16px',
  borderRadius: '12px',
  marginBottom: '25px',
  border: '1px solid rgba(255,255,255,0.05)',
};

const distanceBadge = {
  fontSize: '0.8rem',
  background: 'rgba(0, 255, 157, 0.1)',
  color: '#00ff9d',
  padding: '2px 6px',
  borderRadius: '4px',
};

const actionButtons = {
  marginTop: 'auto',
  textAlign: 'center',
  paddingTop: '10px',
};

const btnAccept = {
  width: '100%',
  padding: '16px',
  borderRadius: '12px',
  border: 'none',
  fontSize: '1.1rem',
  fontWeight: '800',
  cursor: 'pointer',
  textTransform: 'uppercase',
  background: 'linear-gradient(90deg, #ff4d4d, #cc0000)',
  color: '#fff',
  boxShadow: '0 10px 30px rgba(255, 77, 77, 0.3)',
};

const btnRoute = {
  width: '100%',
  padding: '16px',
  borderRadius: '12px',
  border: 'none',
  fontSize: '1.1rem',
  fontWeight: '800',
  cursor: 'pointer',
  textTransform: 'uppercase',
  background: 'linear-gradient(90deg, #ffaa00, #ff8800)',
  color: '#1a0500',
  boxShadow: '0 10px 30px rgba(255, 170, 0, 0.3)',
};

const btnArrive = {
  width: '100%',
  padding: '16px',
  borderRadius: '12px',
  border: 'none',
  fontSize: '1.1rem',
  fontWeight: '800',
  cursor: 'pointer',
  textTransform: 'uppercase',
  background: 'linear-gradient(90deg, #00ff9d, #00cc7a)',
  color: '#00331f',
  boxShadow: '0 10px 30px rgba(0, 255, 157, 0.3)',
};

const completedMsg = {
  padding: '15px',
  borderRadius: '12px',
  background: 'rgba(0, 255, 157, 0.15)',
  color: '#00ff9d',
  fontWeight: 'bold',
  textAlign: 'center',
  fontSize: '1.2rem',
  border: '1px solid rgba(0, 255, 157, 0.3)',
  letterSpacing: '1px',
};

const mapStyle = {
  height: '100%',
  width: '100%',
  borderRadius: '16px',
  zIndex: 1,
};

const mapOverlay = {
  position: 'absolute',
  bottom: '25px',
  left: '25px',
  right: '25px',
  background: 'rgba(0,0,0,0.7)',
  backdropFilter: 'blur(4px)',
  padding: '10px 20px',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.8rem',
  fontFamily: 'monospace',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'space-between',
  border: '1px solid rgba(255,255,255,0.1)',
};

export default HelperDashboard;