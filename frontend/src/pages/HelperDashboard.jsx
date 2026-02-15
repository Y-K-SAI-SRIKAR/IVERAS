// HelperDashboard.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Map, {
  Marker,
  Popup,
  Source,
  Layer,
  NavigationControl,
} from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import Silk from "../PagesUI/Silk.jsx";
import LogoutButton from "../PagesUI/LogoutButton.jsx";
import BlurText from "../PagesUI/BlurText.jsx";

/* ================= MAPBOX TOKEN ================= */
// FIX: Renamed 'token' to 'MAPBOX_TOKEN' to match usage in <Map> component
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/* ================= DATA ================= */
const ACCIDENT_DATA = {
  id: "AC-2026-X99",
  name: "Ravi Kumar",
  vehicle: "TS09AB1234",
  severity: "Critical",
  lat: 17.385044,
  lng: 78.486671,
  address: "Charminar Rd, Hyderabad, Telangana",
  bloodGroup: "O+",
  medicalHistory: "Diabetic, Hypertension",
  allergies: "Penicillin, Peanuts",
};

const NEAREST_HOSPITAL = {
  name: "Osmania General Hospital",
  lat: 17.375,
  lng: 78.48,
  distance: "1.2 km",
  contact: "+91 40 2460 0146",
};

const HELPER_START_LOC = {
  lat: 17.3616,
  lng: 78.4747,
};

/* ================= UTILS ================= */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  if (mins > 60) {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hrs}h ${m}m`;
  }
  return `${mins} min`;
};

const formatDist = (meters) => {
  return (meters / 1000).toFixed(1) + " km";
};

// Helper to remove OSRM formatting codes if any
const cleanInstruction = (text) => text.replace(/undefined/g, ''); 

export default function HelperDashboard() {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  // --- STATES ---
  const [status, setStatus] = useState("Pending");
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null); // Stores ETA, Distance, Steps
  const [popupType, setPopupType] = useState(null);

  const [viewState, setViewState] = useState({
    latitude: ACCIDENT_DATA.lat,
    longitude: ACCIDENT_DATA.lng,
    zoom: 13,
  });

  const handleLogout = () => navigate("/");

  /* ================= ROUTING LOGIC ================= */
  const fetchRoute = async (start, end) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`
      );
      const data = await res.json();

      if (data.code === "Ok" && data.routes.length > 0) {
        const route = data.routes[0];
        
        // 1. Set Geometry for Map
        setRouteGeoJSON({
          type: "Feature",
          geometry: route.geometry,
        });

        // 2. Set Details (ETA, Distance, Steps)
        setRouteDetails({
          duration: route.duration, // in seconds
          distance: route.distance, // in meters
          steps: route.legs[0].steps, // Array of instructions
        });

        // 3. Fit Bounds
        const coords = route.geometry.coordinates;
        const bounds = coords.reduce(
          (b, coord) => b.extend(coord),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );

        mapRef.current?.fitBounds(bounds, {
          padding: 80,
          duration: 1200,
        });
      } else {
        throw new Error("Invalid route");
      }
    } catch (err) {
      console.error("Routing Error:", err);
      // Fallback straight line
      setRouteGeoJSON({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [start.lng, start.lat],
            [end.lng, end.lat],
          ],
        },
      });
      setRouteDetails(null);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);

    // 1. Helper -> Accident
    if (newStatus === "Accepted") {
      fetchRoute(HELPER_START_LOC, ACCIDENT_DATA);
    }
    
    // 2. Arrived at Scene (Clear Route)
    if (newStatus === "Arrived") {
      setRouteGeoJSON(null);
      setRouteDetails(null);
    }

    // 3. Picked Up (Prepare for next leg)
    if (newStatus === "Picked Up") {
       // Visual update only, waiting for navigation trigger
    }

    // 4. Accident -> Hospital
    if (newStatus === "Hospital Route") {
      fetchRoute(ACCIDENT_DATA, NEAREST_HOSPITAL);
    }

    // 5. Arrived at Hospital (Clear Route)
    if (newStatus === "Arrived Hospital") {
      setRouteGeoJSON(null);
      setRouteDetails(null);
    }
  };

  /* ================= MAP LAYERS ================= */
  const routeLayer = {
    id: "route",
    type: "line",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": (status === "On Route" || status === "Hospital Route") ? "#00ff9d" : "#00aaff",
      "line-width": 6,
    },
  };

  return (
    <div style={styles.container}>
      {/* --- CSS ANIMATIONS --- */}
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
          .anim-panel { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
          .anim-delay-1 { animation-delay: 0.2s; }
          .anim-delay-2 { animation-delay: 0.4s; }
          
          .interactive-row { transition: all 0.3s ease; padding: 8px; border-radius: 8px; }
          .interactive-row:hover { background: rgba(255, 255, 255, 0.05); transform: translateX(5px); }
          
          .action-btn { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); transform: scale(1); }
          .action-btn:hover { transform: scale(1.05); letter-spacing: 1px; }
          .action-btn:active { transform: scale(0.95); }

          .pulsing-marker {
             filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.6));
             animation: pulse-marker 1.5s infinite alternate;
          }
          @keyframes pulse-marker {
            from { transform: scale(1); }
            to { transform: scale(1.1); }
          }

          /* Custom Scrollbar for Steps */
          .steps-list::-webkit-scrollbar { width: 6px; }
          .steps-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
          .steps-list::-webkit-scrollbar-track { background: transparent; }
        `}
      </style>

      {/* --- BACKGROUND --- */}
      <div style={styles.bgWrap}>
        <Silk speed={5} scale={1} color="#2b0000" noiseIntensity={1.5} />
      </div>

      {/* --- LOGOUT --- */}
      <div style={styles.logoutPos}>
        <LogoutButton onClick={handleLogout} />
      </div>

      {/* --- HEADER --- */}
      <div style={styles.header}>
        <div style={styles.headerText}>
          <BlurText
            text="EMERGENCY RESPONSE DASHBOARD"
            delay={150}
            animateBy="letters"
            direction="top"
          />
        </div>
        <div style={styles.statusWrapper}>
          <p style={styles.subHeader}>CURRENT STATUS</p>
          <div style={{ ...styles.statusBadge(status), ...(status === 'Pending' ? { animation: 'pulseRed 2s infinite' } : {}) }}>
            {status}
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div style={styles.contentWrap}>
        <div style={styles.grid}>
          
          {/* --- LEFT PANEL: DETAILS --- */}
          <div className="anim-panel anim-delay-1" style={styles.panelLeft}>
            <div style={styles.panelHeader}>
              <h3 style={styles.sectionTitle}>🚨 Accident Details</h3>
              <span style={styles.liveIndicator}>● LIVE</span>
            </div>

            <div className="interactive-row" style={styles.detailRow}>
              <span style={styles.label}>Victim Name</span>
              <span style={styles.value}>{ACCIDENT_DATA.name}</span>
            </div>

            <div className="interactive-row" style={styles.detailRow}>
              <span style={styles.label}>Vehicle No</span>
              <span style={styles.value}>{ACCIDENT_DATA.vehicle}</span>
            </div>

            <div className="interactive-row" style={styles.detailRow}>
              <span style={styles.label}>Severity</span>
              <span style={styles.criticalValue}>{ACCIDENT_DATA.severity}</span>
            </div>

            <div className="interactive-row" style={styles.detailRow}>
              <span style={styles.label}>Location</span>
              <span style={styles.value}>{ACCIDENT_DATA.address}</span>
            </div>

            {/* MEDICAL SECTION */}
            <div style={styles.medicalSection}>
              <h4 style={styles.medicalTitle}>⚕️ Medical Profile</h4>
              
              <div style={styles.detailRow}>
                <span style={styles.label}>Blood Group</span>
                <span style={styles.bloodValue}>{ACCIDENT_DATA.bloodGroup}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>History</span>
                <span style={styles.value}>{ACCIDENT_DATA.medicalHistory}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>Allergies</span>
                <span style={styles.alertValue}>{ACCIDENT_DATA.allergies}</span>
              </div>
            </div>

            <hr style={styles.divider} />

            {/* --- NAVIGATION STATS --- */}
            {routeDetails && (
              <div style={styles.navStatsContainer}>
                <h3 style={styles.sectionTitle}>🧭 Navigation</h3>
                <div style={styles.navGrid}>
                  <div style={styles.navItem}>
                    <span style={styles.navLabel}>ETA</span>
                    <span style={styles.navValue}>{formatTime(routeDetails.duration)}</span>
                  </div>
                  <div style={styles.navItem}>
                    <span style={styles.navLabel}>Distance</span>
                    <span style={styles.navValue}>{formatDist(routeDetails.distance)}</span>
                  </div>
                </div>
                
                {/* Scrollable Steps */}
                <div className="steps-list" style={styles.stepsList}>
                  {routeDetails.steps.map((step, idx) => (
                    <div key={idx} style={styles.stepItem}>
                      <span style={{color: '#00ff9d', marginRight: '8px'}}>➥</span>
                      {cleanInstruction(step.maneuver.type)} {step.name || "road"} 
                      <span style={{opacity: 0.5, fontSize: '0.8em', marginLeft: 'auto'}}>
                        ({Math.round(step.distance)}m)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If no route details, show Hospital */}
            {!routeDetails && (
              <>
                <h3 style={styles.sectionTitle}>🏥 Suggested Hospital</h3>
                <div className="interactive-row" style={styles.hospitalCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#ff6b6b', fontSize: '1.1rem' }}>
                      {NEAREST_HOSPITAL.name}
                    </h4>
                    <span style={styles.distanceBadge}>{NEAREST_HOSPITAL.distance}</span>
                  </div>
                  <p style={{ margin: '5px 0 0 0', color: '#ccc', fontSize: '0.9rem' }}>
                    📞 {NEAREST_HOSPITAL.contact}
                  </p>
                </div>
              </>
            )}

            <div style={styles.actionButtons}>
              {/* STEP 1: PENDING -> ACCEPT */}
              {status === 'Pending' && (
                <button
                  className="action-btn"
                  style={styles.btnAccept}
                  onClick={() => handleStatusChange('Accepted')}
                >
                  ACCEPT REQUEST
                </button>
              )}

              {/* STEP 2: ACCEPTED -> START ROUTE (To Accident) */}
              {status === 'Accepted' && (
                <button
                  className="action-btn"
                  style={styles.btnRoute}
                  onClick={() => handleStatusChange('On Route')}
                >
                  START ROUTE
                </button>
              )}

              {/* STEP 3: ON ROUTE -> ARRIVED (At Accident) */}
              {status === 'On Route' && (
                <button
                  className="action-btn"
                  style={styles.btnArrive}
                  onClick={() => handleStatusChange('Arrived')}
                >
                  ARRIVED AT SCENE
                </button>
              )}

              {/* STEP 4: ARRIVED -> PICKED UP VICTIM */}
              {status === 'Arrived' && (
                <button
                  className="action-btn"
                  style={styles.btnPickedUp}
                  onClick={() => handleStatusChange('Picked Up')}
                >
                  VICTIM PICKED UP
                </button>
              )}

              {/* STEP 5: PICKED UP -> NAVIGATE TO HOSPITAL */}
              {status === 'Picked Up' && (
                <button
                  className="action-btn"
                  style={styles.btnRoute}
                  onClick={() => handleStatusChange('Hospital Route')}
                >
                  NAVIGATE TO HOSPITAL
                </button>
              )}

              {/* STEP 6: HOSPITAL ROUTE -> ARRIVED HOSPITAL */}
              {status === 'Hospital Route' && (
                <button
                  className="action-btn"
                  style={styles.btnArrive}
                  onClick={() => handleStatusChange('Arrived Hospital')}
                >
                  ARRIVED AT HOSPITAL
                </button>
              )}

              {/* STEP 7: ARRIVED HOSPITAL -> COMPLETE MISSION */}
              {status === 'Arrived Hospital' && (
                  <button
                  className="action-btn"
                  style={styles.btnComplete}
                  onClick={() => handleStatusChange('Mission Complete')}
                >
                  COMPLETE MISSION
                </button>
              )}

              {/* FINAL STATE */}
              {status === 'Mission Complete' && (
                <div style={styles.completedMsg}>
                  ✅ MISSION COMPLETED
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT PANEL: MAPBOX MAP --- */}
          <div className="anim-panel anim-delay-2" style={styles.panelRight}>
            <Map
              ref={mapRef}
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              mapStyle="mapbox://styles/mapbox/navigation-night-v1"
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: "100%", height: "100%", borderRadius: "16px" }}
            >
              <NavigationControl position="top-right" />

              {/* Accident Marker */}
              <Marker
                latitude={ACCIDENT_DATA.lat}
                longitude={ACCIDENT_DATA.lng}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setPopupType("accident");
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/564/564619.png"
                  width="45"
                  alt="Accident"
                  className="pulsing-marker"
                  style={{cursor: 'pointer'}}
                />
              </Marker>

              {/* Hospital Marker */}
              <Marker
                latitude={NEAREST_HOSPITAL.lat}
                longitude={NEAREST_HOSPITAL.lng}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setPopupType("hospital");
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4320/4320371.png"
                  width="40"
                  alt="Hospital"
                  style={{cursor: 'pointer'}}
                />
              </Marker>

              {/* Helper Marker */}
              {status !== "Pending" && status !== "Arrived" && status !== "Arrived Hospital" && status !== "Mission Complete" && (
                <Marker
                  latitude={HELPER_START_LOC.lat}
                  longitude={HELPER_START_LOC.lng}
                  anchor="bottom"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
                    width="45"
                    alt="Helper"
                  />
                </Marker>
              )}

              {/* Route Layer */}
              {routeGeoJSON && (
                <Source type="geojson" data={routeGeoJSON}>
                  <Layer {...routeLayer} />
                </Source>
              )}

              {/* Popups */}
              {popupType === "accident" && (
                <Popup
                  latitude={ACCIDENT_DATA.lat}
                  longitude={ACCIDENT_DATA.lng}
                  closeButton={false}
                  onClose={() => setPopupType(null)}
                  maxWidth="200px"
                >
                  <div style={{color: 'black', textAlign: 'center'}}>
                    <strong style={{ color: "red", display:'block', marginBottom: 4 }}>CRITICAL ACCIDENT</strong>
                    <span style={{fontSize: '0.8rem'}}>Vehicle: {ACCIDENT_DATA.vehicle}</span>
                  </div>
                </Popup>
              )}

              {popupType === "hospital" && (
                <Popup
                  latitude={NEAREST_HOSPITAL.lat}
                  longitude={NEAREST_HOSPITAL.lng}
                  closeButton={false}
                  onClose={() => setPopupType(null)}
                >
                  <div style={{color: 'black', fontWeight: 'bold'}}>
                    {NEAREST_HOSPITAL.name}
                  </div>
                </Popup>
              )}
            </Map>

            {/* Map Overlay Info */}
            <div style={styles.mapOverlay}>
              <span style={{color: (status === 'On Route' || status === 'Hospital Route') ? '#00ff9d' : '#fff'}}>
                ● {(status === 'On Route' || status === 'Hospital Route') ? 'NAVIGATION ACTIVE' : 'GPS READY'}
              </span>
              <span style={{marginLeft: '15px'}}>
                {routeDetails 
                  ? `ETA: ${formatTime(routeDetails.duration)} (${formatDist(routeDetails.distance)})` 
                  : 'WAITING FOR TASK'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    minHeight: '100vh',
    color: '#fff',
    fontFamily: '"Poppins", sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  bgWrap: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
  },
  logoutPos: {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 50,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '25px',
    position: 'relative',
    zIndex: 2,
    width: '100%',
  },
  headerText: {
    fontSize: '2.8rem',
    fontWeight: 900,
    letterSpacing: '3px',
    color: '#fff',
    textShadow: '0 0 20px rgba(255, 77, 77, 0.6)',
    textAlign: 'center',
    marginBottom: '10px',
  },
  statusWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: 'rgba(0,0,0,0.4)',
    padding: '8px 20px',
    borderRadius: '50px',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(5px)',
  },
  subHeader: {
    fontSize: '0.9rem',
    color: '#aaa',
    letterSpacing: '1px',
    margin: 0,
  },
  statusBadge: (status) => {
    let color = '#00ff9d';
    let bg = 'rgba(0, 255, 157, 0.2)';
    
    if (status === 'Pending') { color = '#ff4d4d'; bg = 'rgba(255, 77, 77, 0.2)'; }
    else if (status === 'Accepted') { color = '#ffaa00'; bg = 'rgba(255, 170, 0, 0.2)'; }
    else if (status === 'On Route') { color = '#00ccff'; bg = 'rgba(0, 204, 255, 0.2)'; }
    else if (status === 'Picked Up') { color = '#d946ef'; bg = 'rgba(217, 70, 239, 0.2)'; }
    else if (status === 'Hospital Route') { color = '#f472b6'; bg = 'rgba(244, 114, 182, 0.2)'; }
    else if (status === 'Arrived Hospital') { color = '#a3e635'; bg = 'rgba(163, 230, 53, 0.2)'; }

    return {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      padding: '5px 15px',
      borderRadius: '20px',
      textTransform: 'uppercase',
      transition: 'all 0.3s ease',
      backgroundColor: bg,
      color: color,
      border: `1px solid ${color}`
    };
  },
  contentWrap: {
    position: 'relative',
    zIndex: 2,
    padding: '30px 50px',
    height: 'calc(100vh - 140px)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.6fr',
    gap: '30px',
    height: '100%',
  },
  panelLeft: {
    background: 'linear-gradient(145deg, rgba(20, 10, 10, 0.9), rgba(40, 10, 10, 0.95))',
    borderRadius: 24,
    padding: 28,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto', 
  },
  panelRight: {
    background: 'linear-gradient(145deg, rgba(20, 10, 10, 0.9), rgba(40, 10, 10, 0.95))',
    borderRadius: 24,
    padding: 12,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    position: 'relative',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '15px',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    color: '#ff8585',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  liveIndicator: {
    fontSize: '0.8rem',
    color: '#ff4d4d',
    fontWeight: 'bold',
    animation: 'pulseRed 2s infinite',
    padding: '4px 8px',
    background: 'rgba(255, 0, 0, 0.1)',
    borderRadius: '4px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  label: {
    color: '#888',
    fontSize: '0.95rem',
  },
  value: {
    fontWeight: '600',
    color: '#e0e0e0',
    textAlign: 'right',
  },
  criticalValue: {
    fontWeight: 'bold',
    color: '#ff4d4d',
    textTransform: 'uppercase',
    textShadow: '0 0 10px rgba(255, 77, 77, 0.4)',
    padding: '2px 8px',
    background: 'rgba(255, 0, 0, 0.1)',
    borderRadius: '4px',
  },
  medicalSection: {
    marginTop: '25px',
    padding: '20px',
    background: 'linear-gradient(145deg, rgba(255, 50, 50, 0.05), rgba(0,0,0,0.2))',
    borderRadius: '16px',
    border: '1px dashed rgba(255, 80, 80, 0.3)',
  },
  medicalTitle: {
    margin: '0 0 15px 0',
    color: '#ffcccc',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.9,
  },
  bloodValue: {
    fontWeight: '900',
    color: '#ff4d4d',
    fontSize: '1.3rem',
    background: '#fff',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  alertValue: {
    fontWeight: '600',
    color: '#ffaa00',
    textAlign: 'right',
  },
  divider: {
    border: '0',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    margin: '25px 0',
  },
  hospitalCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '25px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  distanceBadge: {
    fontSize: '0.8rem',
    background: 'rgba(0, 255, 157, 0.1)',
    color: '#00ff9d',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  navStatsContainer: {
    marginBottom: '20px',
    animation: 'slideUp 0.5s ease',
  },
  navGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '15px',
    marginTop: '15px',
  },
  navItem: {
    background: 'rgba(0, 255, 157, 0.05)',
    border: '1px solid rgba(0, 255, 157, 0.2)',
    padding: '12px',
    borderRadius: '12px',
    textAlign: 'center',
  },
  navLabel: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#00aaff',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  navValue: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  stepsList: {
    maxHeight: '150px',
    overflowY: 'auto',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '12px',
    padding: '10px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '0.9rem',
    color: '#ddd',
  },
  actionButtons: {
    marginTop: 'auto',
    textAlign: 'center',
    paddingTop: '10px',
  },
  btnAccept: {
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
  },
  btnRoute: {
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
  },
  btnArrive: {
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
  },
  btnPickedUp: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: '800',
    cursor: 'pointer',
    textTransform: 'uppercase',
    background: 'linear-gradient(90deg, #d946ef, #a21caf)',
    color: '#fff',
    boxShadow: '0 10px 30px rgba(217, 70, 239, 0.3)',
  },
  btnComplete: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: '800',
    cursor: 'pointer',
    textTransform: 'uppercase',
    background: 'linear-gradient(90deg, #fff, #ccc)',
    color: '#000',
    boxShadow: '0 10px 30px rgba(255, 255, 255, 0.3)',
  },
  completedMsg: {
    padding: '15px',
    borderRadius: '12px',
    background: 'rgba(0, 255, 157, 0.15)',
    color: '#00ff9d',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: '1.2rem',
    border: '1px solid rgba(0, 255, 157, 0.3)',
    letterSpacing: '1px',
  },
  mapOverlay: {
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
  },
};