// AdminDashboard.jsx  — Updated for IVERAS
// New features:
//   • "Pending Accidents" section showing pending Emergency Assistant registrations
//   • Each card shows username, confidence scores from AmbulanceEvalModel
//   • Approve / Reject buttons → POST /api/ambulance-decision
//   • Click on EA card → shows nearest 3 ambulances on map

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Marker, Popup, Source, Layer, NavigationControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Siren, CheckCircle, XCircle, Activity, MapPin,
  ShieldAlert, BrainCircuit, Clock, PlusCircle, Building2, Save,
  Ambulance, User, Navigation, Video, ShieldCheck, AlertOctagon,
  ChevronRight, Percent, Eye
} from "lucide-react";

import Silk from "../PagesUI/Silk.jsx";
import LogoutButton from "../PagesUI/LogoutButton.jsx";
import BlurText from "../PagesUI/BlurText.jsx";

/* ── MAPBOX TOKEN ── */
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const getCurrentTime = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

/* ════════════════════════════════════════════════════════════════════
   CONFIDENCE BAR — reusable mini bar
══════════════════════════════════════════════════════════════════ */
const ConfidenceBar = ({ label, value, color }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
      <span style={{ fontSize: 10, color: "#888", fontWeight: 700, letterSpacing: "0.5px" }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 800, color }}>{value}%</span>
    </div>
    <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════════
   PENDING ACCIDENT VERIFICATION CARD
   — renders records returned by /api/pending-verifications
     which are accident documents from the DB
══════════════════════════════════════════════════════════════════ */
const EAVerificationCard = ({ record, onApprove, onReject, onViewOnMap }) => {
  const [expanded, setExpanded] = useState(false);

  const sev = (record.severity || record.aiSeverity || "").toUpperCase();
  const status = (record.status || "REPORTED").toUpperCase();

  const sevColor =
    sev === "CRITICAL" || sev === "SEVERE" ? "#ff4d4d" :
      sev === "MODERATE" ? "#ffaa00" :
        sev === "MILD" ? "#ffd60a" : "#888";
  const sevBg =
    sev === "CRITICAL" || sev === "SEVERE" ? "rgba(255,77,77,0.08)" :
      sev === "MODERATE" ? "rgba(255,170,0,0.08)" :
        sev === "MILD" ? "rgba(255,214,10,0.08)" : "rgba(136,136,136,0.08)";

  const statusColor =
    status === "REPORTED" ? "#ff4d4d" :
      status === "ASSIGNED" ? "#ffaa00" :
        status === "EN_ROUTE" ? "#4cc9f0" : "#00ff9d";

  const aiConf = record.aiConfidence || 0;
  const source = record.source || "UNKNOWN";
  const trigger = record.trigger || "—";
  const ts = record.timestamp ? new Date(record.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div style={{
      background: "rgba(20,20,28,0.9)",
      border: `1px solid ${sevColor}40`,
      borderRadius: 14,
      marginBottom: 12,
      overflow: "hidden",
      transition: "box-shadow 0.2s",
    }}>
      {/* HEADER ROW */}
      <div
        style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Avatar */}
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: sevBg, border: `1px solid ${sevColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>
          🚨
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {record.name || "Unknown Driver"}
          </div>
          <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>
            {source} • {ts}
          </div>
        </div>

        {/* Severity badge */}
        <div style={{ background: sevBg, border: `1px solid ${sevColor}60`, borderRadius: 8, padding: "3px 9px", textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: sevColor }}>{sev || "—"}</div>
          <div style={{ fontSize: 8, color: sevColor, opacity: 0.7, letterSpacing: 1 }}>SEVERITY</div>
        </div>

        {/* Compact action icons — only when active */}
        {(status === "REPORTED" || status === "ASSIGNED" || status === "EN_ROUTE") && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button
              title="Dispatch"
              style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(0,255,157,0.12)", border: "1px solid rgba(0,255,157,0.35)", color: "#00ff9d", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              onClick={() => onApprove(record.accidentId)}
            ><CheckCircle size={13} /></button>
            <button
              title="Cancel"
              style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(255,77,77,0.12)", border: "1px solid rgba(255,77,77,0.35)", color: "#ff4d4d", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              onClick={() => onReject(record.accidentId)}
            ><XCircle size={13} /></button>
            <button
              title="Fly to location"
              style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(76,201,240,0.12)", border: "1px solid rgba(76,201,240,0.35)", color: "#4cc9f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              onClick={() => onViewOnMap(record)}
            ><MapPin size={13} /></button>
          </div>
        )}
        <ChevronRight size={14} style={{ color: "#555", transform: expanded ? "rotate(90deg)" : "rotate(0)", transition: "0.2s", flexShrink: 0 }} />
      </div>

      {/* STATUS + TRIGGER PILL */}
      <div style={{ padding: "0 14px 10px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}50`, padding: "2px 8px", borderRadius: 6 }}>
          ● {status}
        </span>
        <span style={{ fontSize: 10, color: "#666" }}>{trigger}</span>
        {record.helperName && (
          <span style={{ fontSize: 10, color: "#4cc9f0" }}>→ {record.helperName}</span>
        )}
      </div>

      {/* EXPANDED DETAILS */}
      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ paddingTop: 12 }}>
            <ConfidenceBar label="AI CONFIDENCE" value={aiConf} color={sevColor} />
            {record.aiLabel && (
              <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>
                AI Label: <span style={{ color: "#ccc" }}>{record.aiLabel}</span>
              </div>
            )}
            {record.latitude && record.longitude && (
              <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>
                GPS: <span style={{ color: "#4cc9f0" }}>{Number(record.latitude).toFixed(5)}, {Number(record.longitude).toFixed(5)}</span>
              </div>
            )}
            {record.nearestHospital?.name && (
              <div style={{ fontSize: 10, color: "#888" }}>
                🏥 <span style={{ color: "#00ff9d" }}>{record.nearestHospital.name}</span>
                {record.nearestHospital.distance && <span style={{ color: "#666" }}> • {record.nearestHospital.distance}</span>}
              </div>
            )}
          </div>

          {/* Crash image preview */}
          {record.imagePath && (
            <div style={{ margin: "12px 0" }}>
              <img
                src={record.imagePath || "https://fakeimg.pl/600x400?text=No+Image"}
                alt="Crash"
                style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 10, border: "1px solid #333" }}
                onError={e => { e.target.style.display = "none"; }}
              />
            </div>
          )}
        </div>
      )}

      {/* ACTION BUTTONS — compact icon row, only when active */}
      {(status === "COMPLETED" || status === "CANCELLED") && (
        <div style={{ padding: "0 14px 10px", fontSize: 10, fontWeight: 700, color: status === "COMPLETED" ? "#00ff9d" : "#ff4d4d" }}>
          {status === "COMPLETED" ? "✅ COMPLETED" : "❌ CANCELLED"}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════════════════ */
const Modal = ({ isOpen, onClose, title, children, color = "#4cc9f0" }) => {
  if (!isOpen) return null;
  return (
    <div style={modalOverlay}>
      <div style={{ ...modalContent, borderColor: color, boxShadow: `0 0 30px ${color}40` }}>
        <div style={modalHeader}>
          <h3 style={{ margin: 0, color, textShadow: `0 0 10px ${color}` }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><XCircle size={24} /></button>
        </div>
        <div style={modalBody}>{children}</div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
══════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [time, setTime] = useState(getCurrentTime());
  const [activeModal, setActiveModal] = useState(null);

  /* MAP STATE */
  const [viewState, setViewState] = useState({ latitude: 17.385, longitude: 78.48, zoom: 12 });
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);

  /* DATA STATE */
  const [hospitals, setHospitals] = useState([
    { id: 1, name: "City General", lat: 17.401, lng: 78.49 },
    { id: 2, name: "Apollo Jubilee", lat: 17.388, lng: 78.455 },
  ]);

  const [ambulances, setAmbulances] = useState([
    { id: 1, name: "Alpha-01", driver: "Ramesh", regNo: "TS09AB1234", verified: true, status: "On Duty", type: "ALS", position: { lat: 17.380, lng: 78.475 }, active: true, camUrl: "http://192.168.1.15:5000/video_feed" },
    { id: 2, name: "Beta-04", driver: "Suresh", regNo: "TS10XY4567", verified: true, status: "Idle", type: "BLS", position: { lat: 17.39, lng: 78.46 }, active: false, camUrl: null },
    { id: 3, name: "Gamma-09", driver: "Kiran", regNo: "TS08PQ8899", verified: true, status: "On Duty", type: "ALS", position: { lat: 17.365, lng: 78.485 }, active: true, camUrl: "http://192.168.1.20:5000/video_feed" },
    { id: 4, name: "Delta-12", driver: "Unknown", regNo: "AP39EX9999", verified: false, status: "Pending", type: "BLS", position: { lat: 17.40, lng: 78.50 }, active: false, camUrl: null },
  ]);

  const [reports, setReports] = useState([
    { id: 101, reporter: "Ravi Kumar", time: "10:42 AM", location: { lat: 17.385, lng: 78.486 }, img: "https://images.unsplash.com/photo-1599700403969-f77b37d6305f?auto=format&fit=crop&w=300&q=80", aiAnalysis: { confidence: 98, severity: "CRITICAL", type: "Vehicle Collision" } },
    { id: 102, reporter: "System AI", time: "10:45 AM", location: { lat: 17.375, lng: 78.495 }, img: "https://thumbs.dreamstime.com/b/car-accident-road-insurance-concept-137286987.jpg", aiAnalysis: { confidence: 85, severity: "MODERATE", type: "Minor Crash" } },
  ]);

  const [missions, setMissions] = useState([
    { id: 501, title: "Mission #501", target: { lat: 17.385, lng: 78.486 }, unit: "Alpha-01", status: "EN ROUTE", eta: "4 mins", unitLoc: { lat: 17.380, lng: 78.475 } },
  ]);

  /* ── NEW: Pending Accidents ── */
  const [verifications, setVerifications] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [nearestAmbOnMap, setNearestAmbOnMap] = useState([]);   // markers for nearest-3
  const API_URL = "";

  useEffect(() => {
    const timer = setInterval(() => setTime(getCurrentTime()), 1000);
    fetchVerifications();
    const pollVerif = setInterval(fetchVerifications, 10000);
    return () => { clearInterval(timer); clearInterval(pollVerif); };
  }, []);

  /* ── FETCH PENDING VERIFICATIONS ── */
  const fetchVerifications = async () => {
    setVerificationLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/pending-verifications`);
      if (res.ok) setVerifications(await res.json());
    } catch (err) { console.error("Verif poll failed:", err); }
    setVerificationLoading(false);
  };

  /* ── DISPATCH / CANCEL accident from Pending Accidents panel ── */
  const handleDecision = async (accidentId, decision) => {
    // decision: "APPROVE" → set status ASSIGNED, "REJECT" → CANCELLED
    const newStatus = decision === "APPROVE" ? "ASSIGNED" : "CANCELLED";
    try {
      const res = await fetch(`${API_URL}/api/accident-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accidentId, status: newStatus }),
      });
      if (res.ok) {
        setVerifications(prev =>
          newStatus === "CANCELLED"
            ? prev.filter(v => v.accidentId !== accidentId)
            : prev.map(v => v.accidentId === accidentId ? { ...v, status: newStatus } : v)
        );
      } else {
        alert("Action failed. Please try again.");
      }
    } catch (err) { console.error(err); alert("Backend not reachable"); }
  };

  /* ── FLY TO ACCIDENT LOCATION ON MAP ── */
  const handleViewOnMap = (record) => {
    const lat = record.latitude || 17.385;
    const lng = record.longitude || 78.48;
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1400 });
    }
    // Mark the accident location
    setNearestAmbOnMap([{ id: record.accidentId, lat, lng, name: record.name || "Accident", distance_km: "" }]);
  };

  /* ── ROUTING ── */
  const fetchRoute = async (startLoc, endLoc) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLoc.lng},${startLoc.lat};${endLoc.lng},${endLoc.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.code === "Ok" && data.routes?.length > 0) {
        const geometry = data.routes[0].geometry;
        setRouteGeoJSON({ type: "Feature", geometry });
        const coords = geometry.coordinates;
        const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
        mapRef.current?.fitBounds(bounds, { padding: 80, duration: 1000 });
      }
    } catch (error) { console.error("Routing failed", error); }
  };

  /* ── HANDLERS ── */
  const verifyAmbulance = (id) => {
    setAmbulances(prev => prev.map(amb => amb.id === id ? { ...amb, verified: true, status: "Idle" } : amb));
  };

  const handleDispatch = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    const assignedUnit = ambulances.find(a => a.status === "Idle" && a.verified) || ambulances[0];
    setReports(prev => prev.filter(r => r.id !== reportId));
    const newMission = {
      id: Date.now(), title: `Mission #${Date.now().toString().slice(-4)}`,
      target: report.location, unit: assignedUnit.name,
      status: "DISPATCHED", eta: "Calculated...", unitLoc: assignedUnit.position,
    };
    setMissions([...missions, newMission]);
    setAmbulances(prev => prev.map(a => a.name === assignedUnit.name ? { ...a, status: "On Duty", active: true } : a));
    fetchRoute(assignedUnit.position, report.location);
  };

  const handleFocusMission = (mission) => fetchRoute(mission.unitLoc, mission.target);

  const handleViewCamera = (url) => {
    if (url) window.open(`/live-stream?url=${encodeURIComponent(url)}`, "_blank");
    else alert("Camera feed unavailable.");
  };

  const handleAddHospital = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const lat = parseFloat(formData.get("lat"));
    const lng = parseFloat(formData.get("lng"));
    const name = formData.get("name");
    if (!lat || !lng || !name) return alert("Please fill all fields.");
    setHospitals([...hospitals, { id: Date.now(), name, lat, lng }]);
    setActiveModal(null);
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 14, duration: 2000 });
  };

  const routeLayer = {
    id: "route", type: "line",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#00ff9d", "line-width": 4, "line-opacity": 0.8 },
  };

  const pendingCount = verifications.filter(v => !["COMPLETED", "CANCELLED", "completed", "cancelled"].includes(v.status)).length;

  return (
    <div style={container}>
      <div style={bgWrap}><Silk speed={5} scale={1} color="#1a1a1a" noiseIntensity={0.5} /></div>

      <div style={logoutPos}><LogoutButton onClick={() => navigate("/")} /></div>

      {/* HEADER */}
      <div style={header}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <Activity size={32} color="#4cc9f0" className="pulse-slow" />
          <div>
            <BlurText text="IVERAS ADMIN COMMAND" delay={100} animateBy="letters" direction="top" className="header-title" />
            <p style={headerSub}>CENTRAL MONITORING SYSTEM • {time}</p>
          </div>
        </div>
      </div>

      <div style={bentoGrid}>

        {/* COL 1: FLEET + EA VERIFICATIONS */}
        <div style={sidePanel}>

          {/* FLEET STATUS */}
          <div style={cardSection}>
            <div style={sectionHeader}>
              <h3><Ambulance size={18} style={{ marginRight: 8 }} /> Fleet Status</h3>
              <span style={{ fontSize: 10, color: "#00ff9d" }}>● {ambulances.length} Units</span>
            </div>
            <div style={scrollList}>
              {ambulances.map(amb => (
                <div key={amb.id} style={fleetCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ fontWeight: "bold", color: "white" }}>{amb.name}</div>
                    <span style={statusPill(amb.status)}>{amb.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 10 }}>
                    {amb.regNo} • {amb.driver} • {amb.type}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {amb.verified ? (
                      <button style={btnCam} onClick={() => handleViewCamera(amb.camUrl)}>
                        <Video size={12} /> View Cam
                      </button>
                    ) : (
                      <button style={btnVerify} onClick={() => verifyAmbulance(amb.id)}>
                        <CheckCircle size={12} /> Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADD HOSPITAL */}
          <div style={dbSection}>
            <button style={btnAddHospital} onClick={() => setActiveModal("addHospital")}>
              <PlusCircle size={20} /><span>ADD HOSPITAL TO DB</span>
            </button>
          </div>
        </div>

        {/* COL 2: MAP */}
        <div style={mapPanel}>
          <div style={mapHeaderOverlay}>
            <span>LIVE SATELLITE TRACKING</span>
            <span style={{ color: "#ff4d4d", animation: "blink 1s infinite" }}>● MONITORING SENSORS</span>
          </div>

          <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/navigation-night-v1"
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
          >
            <NavigationControl position="bottom-right" />

            {reports.map(r => (
              <Marker key={`rep-${r.id}`} latitude={r.location.lat} longitude={r.location.lng} anchor="bottom"
                onClick={e => { e.originalEvent.stopPropagation(); setPopupInfo({ ...r, type: "incident" }); }}>
                <img src="https://cdn-icons-png.flaticon.com/512/564/564619.png" width="40" alt="Crash"
                  style={{ filter: "drop-shadow(0 0 8px red)", cursor: "pointer" }} />
              </Marker>
            ))}

            {ambulances.map(amb => (
              <Marker key={`amb-${amb.id}`} latitude={amb.position.lat} longitude={amb.position.lng} anchor="bottom"
                onClick={e => { e.originalEvent.stopPropagation(); setPopupInfo({ ...amb, type: "ambulance" }); }}>
                <img src="https://cdn-icons-png.flaticon.com/512/2967/2967350.png" width="35" alt="Ambulance" style={{ cursor: "pointer" }} />
              </Marker>
            ))}

            {hospitals.map(h => (
              <Marker key={`hosp-${h.id}`} latitude={h.lat} longitude={h.lng} anchor="bottom"
                onClick={e => { e.originalEvent.stopPropagation(); setPopupInfo({ ...h, type: "hospital" }); }}>
                <img src="https://cdn-icons-png.flaticon.com/512/4320/4320371.png" width="35" alt="Hospital" style={{ cursor: "pointer" }} />
              </Marker>
            ))}

            {missions.map(m => (
              <Marker key={`mis-${m.id}`} latitude={m.target.lat} longitude={m.target.lng} anchor="bottom">
                <img src="https://cdn-icons-png.flaticon.com/512/1533/1533913.png" width="40" alt="Target" className="pulse-slow" />
              </Marker>
            ))}

            {/* ── NEAREST AMBULANCE MARKERS (from EA card click) ── */}
            {nearestAmbOnMap.map((amb, i) => (
              <Marker key={`near-${amb.id}-${i}`} latitude={amb.lat} longitude={amb.lng} anchor="bottom"
                onClick={e => { e.originalEvent.stopPropagation(); setPopupInfo({ ...amb, type: "ambulance", lat: amb.lat, lng: amb.lng }); }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "#ff9500", border: "3px solid white",
                  boxShadow: "0 0 12px rgba(255,149,0,0.8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, cursor: "pointer",
                }}>🚑</div>
              </Marker>
            ))}

            {routeGeoJSON && (
              <Source type="geojson" data={routeGeoJSON}>
                <Layer {...routeLayer} />
              </Source>
            )}

            {popupInfo && (
              <Popup
                anchor="top"
                longitude={popupInfo.lng || popupInfo.location?.lng || popupInfo.position?.lng}
                latitude={popupInfo.lat || popupInfo.location?.lat || popupInfo.position?.lat}
                onClose={() => setPopupInfo(null)}
                closeButton={false}
              >
                <div style={{ color: "black", padding: "5px" }}>
                  <strong>{popupInfo.name || popupInfo.reporter}</strong>
                  <div style={{ fontSize: "0.8em" }}>
                    {popupInfo.type === "incident" ? popupInfo.aiAnalysis?.severity : popupInfo.status || "Medical Facility"}
                  </div>
                  {popupInfo.distance_km != null && (
                    <div style={{ fontSize: "0.8em", color: "#ff6600" }}>{popupInfo.distance_km} km away</div>
                  )}
                </div>
              </Popup>
            )}
          </Map>
        </div>

        {/* COL 3: ALERTS + MISSIONS + EA VERIFICATIONS */}
        <div style={sidePanel}>

          {/* ── EA VERIFICATIONS — NEW SECTION ── */}
          <div style={{ ...cardSection, borderColor: "rgba(168,85,247,0.4)", flex: "none" }}>
            <div style={{ ...sectionHeader, background: "rgba(168,85,247,0.08)", color: "#a855f7", borderBottom: "1px solid rgba(168,85,247,0.2)" }}>
              <h3 style={{ display: "flex", alignItems: "center" }}>
                <ShieldCheck size={18} style={{ marginRight: 8 }} /> Pending Accidents
              </h3>
              {pendingCount > 0 && (
                <span style={{ background: "#a855f7", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 10 }}>
                  {pendingCount} pending
                </span>
              )}
            </div>
            <div style={{ ...scrollList, maxHeight: 340, overflowY: "auto" }}>
              {verificationLoading && verifications.length === 0 && (
                <div style={emptyState}>Loading verifications...</div>
              )}
              {!verificationLoading && verifications.length === 0 && (
                <div style={emptyState}>No pending verifications</div>
              )}
              {verifications.map(record => (
                <EAVerificationCard
                  key={record.verification_id}
                  record={record}
                  onApprove={id => handleDecision(id, "APPROVE")}
                  onReject={id => handleDecision(id, "REJECT")}
                  onViewOnMap={handleViewOnMap}
                />
              ))}
            </div>
          </div>

          {/* ALERTS */}
          <div style={{ ...cardSection, borderColor: "#ff4d4d" }}>
            <div style={sectionHeaderRed}>
              <h3><ShieldAlert size={18} style={{ marginRight: 8 }} /> Incoming Alerts</h3>
              <span style={badgeRed}>{reports.length}</span>
            </div>
            <div style={scrollList}>
              {reports.length === 0
                ? <div style={emptyState}>No Active Alerts</div>
                : reports.map(report => (
                  <div key={report.id} style={incidentCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={tagSos}>CRITICAL</span>
                      <span style={{ fontSize: 11, color: "#888" }}>{report.time}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      <img src={report.img} alt="Crash" style={thumbImg} />
                      <div style={{ flex: 1 }}>
                        <div style={aiTag}><BrainCircuit size={12} /> AI: {report.aiAnalysis.severity}</div>
                        <p style={{ fontSize: 11, color: "#aaa", marginTop: 5 }}>Loc: {report.location.lat}, {report.location.lng}</p>
                      </div>
                    </div>
                    <button style={btnDispatch} onClick={() => handleDispatch(report.id)}>DISPATCH UNIT</button>
                  </div>
                ))
              }
            </div>
          </div>

          {/* MISSIONS */}
          <div style={cardSection}>
            <div style={sectionHeader}>
              <h3><Navigation size={18} style={{ marginRight: 8 }} /> Active Missions</h3>
            </div>
            <div style={scrollList}>
              {missions.map(m => (
                <div key={m.id} style={missionCard} onClick={() => handleFocusMission(m)}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold", color: "#007bff" }}>{m.title}</span>
                    <span style={{ fontSize: 11, fontWeight: "bold", color: "#28a745" }}>LIVE</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 5 }}>
                    Unit: <strong>{m.unit}</strong> • ETA: {m.eta}
                  </div>
                  <div style={clickHint}>Click to Track Route</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ADD HOSPITAL MODAL */}
      <Modal isOpen={activeModal === "addHospital"} onClose={() => setActiveModal(null)} title="Add Hospital to Database" color="#4cc9f0">
        <form onSubmit={handleAddHospital} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div>
            <label style={label}>Hospital Name</label>
            <div style={inputWithIcon}><Building2 size={16} color="#666" /><input name="name" placeholder="e.g. Yashoda Hospital" required style={input} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
            <div>
              <label style={label}>Latitude</label>
              <div style={inputWithIcon}><MapPin size={16} color="#666" /><input name="lat" type="number" step="any" placeholder="17.xxxx" required style={input} /></div>
            </div>
            <div>
              <label style={label}>Longitude</label>
              <div style={inputWithIcon}><MapPin size={16} color="#666" /><input name="lng" type="number" step="any" placeholder="78.xxxx" required style={input} /></div>
            </div>
          </div>
          <button type="submit" style={btnPrimary}><Save size={18} style={{ marginRight: 8 }} /> SAVE & UPDATE MAP</button>
        </form>
      </Modal>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .header-title { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: white; }
        .pulse-slow { animation: pulseSlow 3s infinite; }
        @keyframes pulseSlow { 0% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.1); } 100% { opacity:1; transform:scale(1); } }
        .blink { animation: blink 1.5s infinite; }
        @keyframes blink { 0% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════ */
const container = { height: "100vh", width: "100vw", color: "white", fontFamily: "'Inter', sans-serif", overflow: "hidden", background: "#000" };
const bgWrap = { position: "fixed", inset: 0, zIndex: 0 };
const logoutPos = { position: "fixed", top: 25, right: 30, zIndex: 50 };
const header = { height: "90px", display: "flex", alignItems: "center", padding: "0 40px", position: "relative", zIndex: 2 };
const headerSub = { margin: 0, fontSize: "12px", opacity: 0.6, fontFamily: "monospace", letterSpacing: "1px", marginTop: 5 };
const bentoGrid = { display: "grid", gridTemplateColumns: "300px 1fr 300px", gap: "20px", padding: "20px 40px 40px 40px", height: "calc(100vh - 90px)", position: "relative", zIndex: 2 };
const sidePanel = { display: "flex", flexDirection: "column", gap: "20px", height: "100%", overflowY: "auto", paddingRight: "5px" };
const mapPanel = { background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", overflow: "hidden", position: "relative", backdropFilter: "blur(10px)" };
const cardSection = { background: "rgba(20,20,25,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", flex: 1, backdropFilter: "blur(20px)" };
const dbSection = { height: "auto" };
const sectionHeader = { padding: "15px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "14px", fontWeight: 700, color: "#ccc" };
const sectionHeaderRed = { ...sectionHeader, background: "rgba(255,0,0,0.1)", color: "#ff4d4d", borderBottom: "1px solid rgba(255,0,0,0.2)" };
const scrollList = { padding: "15px", overflowY: "auto", flex: 1 };
const badgeRed = { background: "#ff4d4d", color: "white", fontSize: "10px", padding: "2px 8px", borderRadius: "10px" };
const emptyState = { textAlign: "center", color: "#666", fontSize: "12px", padding: "20px", fontStyle: "italic" };
const fleetCard = { background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "15px", marginBottom: "10px", border: "1px solid rgba(255,255,255,0.05)" };
const statusPill = (s) => ({ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", background: s === "On Duty" ? "rgba(76,201,240,0.2)" : "rgba(255,255,255,0.1)", color: s === "On Duty" ? "#4cc9f0" : "#888", fontWeight: "bold" });
const btnCam = { flex: 1, background: "rgba(76,201,240,0.1)", color: "#4cc9f0", border: "1px solid rgba(76,201,240,0.3)", padding: "8px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" };
const btnVerify = { flex: 1, background: "rgba(0,255,157,0.1)", color: "#00ff9d", border: "1px solid rgba(0,255,157,0.3)", padding: "8px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" };
const incidentCard = { background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.3)", borderRadius: "10px", padding: "12px", marginBottom: "10px" };
const tagSos = { fontSize: "10px", background: "#ff4d4d", color: "white", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" };
const thumbImg = { width: "50px", height: "50px", borderRadius: "6px", objectFit: "cover", border: "1px solid #555" };
const aiTag = { fontSize: "10px", color: "#ff4d4d", background: "rgba(0,0,0,0.3)", padding: "2px 5px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" };
const btnDispatch = { width: "100%", background: "#ff4d4d", border: "none", color: "white", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" };
const missionCard = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px", borderRadius: "10px", cursor: "pointer", marginBottom: "10px", transition: "0.2s" };
const clickHint = { fontSize: "9px", textAlign: "center", marginTop: "5px", opacity: 0.4, fontStyle: "italic" };
const btnAddHospital = { width: "100%", padding: "20px", background: "rgba(76,201,240,0.1)", border: "1px dashed rgba(76,201,240,0.3)", borderRadius: "16px", color: "#4cc9f0", fontSize: "14px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "0.2s" };
const mapHeaderOverlay = { position: "absolute", top: 20, left: 20, zIndex: 500, background: "rgba(0,0,0,0.8)", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", display: "flex", gap: "15px", border: "1px solid rgba(255,255,255,0.1)" };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" };
const modalContent = { background: "#111", width: "400px", borderRadius: "20px", border: "1px solid #333", overflow: "hidden" };
const modalHeader = { padding: "20px", display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.05)" };
const modalBody = { padding: "20px" };
const label = { display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "5px", color: "#888" };
const input = { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #333", fontSize: "14px", background: "#222", outline: "none", color: "white" };
const inputWithIcon = { display: "flex", alignItems: "center", gap: "10px", background: "#222", border: "1px solid #333", padding: "0 10px", borderRadius: "6px" };
const btnPrimary = { background: "#4cc9f0", color: "black", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "10px" };