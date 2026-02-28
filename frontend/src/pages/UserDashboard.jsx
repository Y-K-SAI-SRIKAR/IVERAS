import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Fingerprint, ShieldAlert, Zap, MapPin, Phone,
  Wrench, Siren, PlusCircle, MessageSquare,
  X, Activity, AlertTriangle, HeartPulse, Clock, CloudRain,
  Car, UserCheck, Camera, UploadCloud, Send, Hospital
} from "lucide-react";

import BlurText from "../PagesUI/BlurText.jsx";
import LogoutButton from "../PagesUI/LogoutButton.jsx";

/* ================== UTILS ================== */
const getCurrentTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const getCurrentDate = () => new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

/* ================== REUSABLE MODAL ================== */
const GlassModal = ({ isOpen, onClose, title, children, color = "white" }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ borderColor: color, boxShadow: `0 0 30px ${color}40` }}>
        <div className="modal-header">
          <h3 style={{ color: color, textShadow: `0 0 10px ${color}` }}>{title}</h3>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

/* ================== CHAT SLIDEBAR ================== */
const ChatSlidebar = ({ isOpen, onClose, messages }) => (
  <div className={`chat-slidebar ${isOpen ? 'open' : ''}`}>
    <div className="slidebar-header">
      <h3><MessageSquare size={18} /> MESSAGES</h3>
      <button onClick={onClose}><X size={20} /></button>
    </div>
    <div className="slidebar-body">
      {messages.length === 0 ? (
        <p className="no-msg">No new messages.</p>
      ) : (
        messages.map((msg, idx) => (
          <div key={idx} className={`msg-bubble ${msg.sender === 'You' ? 'sent' : 'received'}`}>
            <span className="msg-sender">{msg.sender}</span>
            <p>{msg.text}</p>
            <span className="msg-time">{msg.time}</span>
          </div>
        ))
      )}
    </div>
  </div>
);

/* ================== HELPER INFO BANNER ================== */
const HelperBanner = ({ helperName, helperStatus }) => {
  if (!helperName) return null;
  const statusColor = {
    "ASSIGNED": "#ffaa00",
    "EN_ROUTE": "#00ccff",
    "ARRIVED": "#00ff9d",
    "HOSPITAL_ROUTE": "#f472b6",
    "COMPLETED": "#00ff9d",
  }[helperStatus] || "#ffaa00";
  return (
    <div className="helper-banner" style={{ borderColor: statusColor }}>
      <div className="helper-banner-icon" style={{ background: `${statusColor}22`, border: `1px solid ${statusColor}` }}>🚑</div>
      <div className="helper-banner-text">
        <span className="helper-label">HELPER ASSIGNED</span>
        <strong style={{ color: statusColor }}>{helperName}</strong>
      </div>
      <div className="helper-status-badge" style={{ background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}` }}>
        {helperStatus || "EN ROUTE"}
      </div>
    </div>
  );
};

/* ================== AI SEVERITY CARD (shown after reporting accident) ================== */
const AISeverityCard = ({ aiData }) => {
  // Only render when we have a real, valid AI result
  const validSeverities = ["severe", "moderate", "mild", "none"];
  const sevKey = aiData?.severity?.toLowerCase();
  if (!aiData || !sevKey || !validSeverities.includes(sevKey)) return null;
  // If confidence AND realness are both 0 it means the model never ran — don't show stale card
  const hasRealData = (aiData.confidence > 0) || (aiData.realness?.score > 0);
  if (!hasRealData) return null;

  const SEV_MAP = {
    severe: { color: "#ff2222", glow: "rgba(255,0,0,0.4)", icon: "🔴", label: "SEVERE" },
    moderate: { color: "#ffaa00", glow: "rgba(255,170,0,0.35)", icon: "🟠", label: "MODERATE" },
    mild: { color: "#00ff9d", glow: "rgba(0,255,157,0.35)", icon: "🟢", label: "MILD" },
    none: { color: "#888888", glow: "rgba(128,128,128,0.2)", icon: "⚪", label: "NO ACCIDENT DETECTED" },
  };
  const cfg = SEV_MAP[sevKey];

  return (
    <div className="ai-severity-card" style={{ borderColor: cfg.color, boxShadow: `0 0 18px ${cfg.glow}` }}>
      <div className="ai-card-header">
        <span>🤖 AI MODEL ANALYSIS</span>
        <span className="ai-model-name">AccSevDetectModel</span>
      </div>
      <div className="ai-severity-pill" style={{ borderColor: cfg.color, background: `${cfg.color}18` }}>
        <span className="ai-icon">{cfg.icon}</span>
        <span className="ai-label-text" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
      {aiData.confidence != null && (
        <div className="ai-bar-row">
          <span className="ai-bar-label">Confidence</span>
          <div className="ai-bar-track">
            <div className="ai-bar-fill" style={{ width: `${aiData.confidence}%`, background: cfg.color }} />
          </div>
          <span className="ai-bar-val" style={{ color: cfg.color }}>{aiData.confidence}%</span>
        </div>
      )}
      {aiData.realness?.score != null && (
        <div className="ai-bar-row">
          <span className="ai-bar-label">Realness</span>
          <div className="ai-bar-track">
            <div className="ai-bar-fill" style={{ width: `${aiData.realness.score}%`, background: "#00ccff" }} />
          </div>
          <span className="ai-bar-val" style={{ color: "#00ccff" }}>{aiData.realness.score}%</span>
        </div>
      )}
      {aiData.label && (
        <p className="ai-result-text" style={{ color: cfg.color }}>
          {aiData.rejected ? "⚠ Low-quality image — manual review needed" : `✓ ${aiData.label}`}
        </p>
      )}
    </div>
  );
};

/* ================== NEAREST HOSPITAL CARD ================== */
const NearestHospitalCard = ({ hospital, loading, onClose }) => {
  if (loading) {
    return (
      <div className="hospital-card">
        <div className="hospital-card-header">
          <span>🏥 NEAREST HOSPITAL</span>
        </div>
        <div style={{ textAlign: "center", padding: "20px 0", color: "#aaa", fontSize: 13 }}>
          <div className="loader" style={{ margin: "0 auto 10px" }}></div>
          Locating nearest hospital...
        </div>
      </div>
    );
  }
  if (!hospital || !hospital.name) return null;

  const mapsUrl = hospital.lat && hospital.lng
    ? `https://maps.google.com/?q=${hospital.lat},${hospital.lng}`
    : null;

  return (
    <div className="hospital-card">
      <div className="hospital-card-header">
        <span>🏥 NEAREST HOSPITAL</span>
        {onClose && (
          <button onClick={onClose} className="close-btn" style={{ marginLeft: "auto" }}>
            <X size={16} />
          </button>
        )}
      </div>
      <h4 className="hospital-name">{hospital.name}</h4>
      {hospital.address && (
        <p className="hospital-address">📍 {hospital.address}</p>
      )}
      <div className="hospital-meta-row">
        <span className="hospital-dist-badge">{hospital.distance || "N/A"}</span>
        {hospital.contact && hospital.contact !== "Not Available" && (
          <a href={`tel:${hospital.contact}`} className="hospital-call-btn">
            <Phone size={13} /> {hospital.contact}
          </a>
        )}
      </div>
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="hospital-nav-btn">
          🗺 Open in Maps
        </a>
      )}
    </div>
  );
};

/* ================== MAIN DASHBOARD ================== */
const UserDashboard = () => {
  const [location, setLocation] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [fuelStatus, setFuelStatus] = useState("idle");
  const [vehicleStatus, setVehicleStatus] = useState("SAFE");
  const [time, setTime] = useState(getCurrentTime());
  const [reportImage, setReportImage] = useState(null);
  const [nearbyMechanics, setNearbyMechanics] = useState([]);
  const [loadingMech, setLoadingMech] = useState(false);
  const [isChatSlidebarOpen, setIsChatSlidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChatInput, setShowChatInput] = useState(false);
  const [fuelAmount, setFuelAmount] = useState("");
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [activeFuelRequests, setActiveFuelRequests] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // ── ACCIDENT STATE FROM DB ──
  const [myAccident, setMyAccident] = useState(null);
  const [assignedHelper, setAssignedHelper] = useState(null);

  // ── CRASH SIMULATION STATE ──
  const [crashActive, setCrashActive] = useState(false);
  const [crashAccidentId, setCrashAccidentId] = useState(null);

  // ── AI SEVERITY STATE ──
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // ── NEAREST HOSPITAL STATE ──
  const [nearestHospital, setNearestHospital] = useState(null);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [showHospitalCard, setShowHospitalCard] = useState(false);

  const navigate = useNavigate();
  const API_URL = "";

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  /* ── ON MOUNT ── */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setLocation({ lat, lon });

      if (user?.id) {
        fetch(`${API_URL}/api/user-location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, latitude: lat, longitude: lon })
        }).catch(() => { });
      }
    });

    const timer = setInterval(() => setTime(getCurrentTime()), 1000);

    // ── POLL LATEST ACCIDENT FROM DB ──
    const pollAccident = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_URL}/api/latest-accident?userId=${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.accidentId) return;

        if (data.status && data.status !== "COMPLETED" && data.status !== "CANCELLED") {
          setMyAccident(data);
          setVehicleStatus("ACCIDENT");

          // Show AI analysis from DB polling
          if (data.aiSeverity) {
            setAiAnalysis({
              severity: data.aiSeverity,
              confidence: data.aiConfidence,
              label: data.aiLabel,
              realness: data.aiRealness,
              rejected: data.aiRejected,
            });
          }

          // Show nearest hospital from DB polling
          if (data.nearestHospital && data.nearestHospital.name) {
            setNearestHospital(data.nearestHospital);
          }

          if (data.latitude != null && data.longitude != null) {
            const lat = parseFloat(data.latitude);
            const lng = parseFloat(data.longitude);
            if (lat !== 0 || lng !== 0) {
              setLocation({ lat, lon: lng });
            }
          }
          if (data.helperName) {
            setAssignedHelper({ name: data.helperName, status: data.status });
          }
          if (data.accidentId) {
            setCrashAccidentId(data.accidentId);
            setCrashActive(true);
          }
        } else if (data.status === "COMPLETED" || data.status === "CANCELLED") {
          setVehicleStatus("SAFE");
          setMyAccident(null);
          setAssignedHelper(null);
          setCrashActive(false);
          setCrashAccidentId(null);
          setAiAnalysis(null);
        }
      } catch (err) {
        console.error("Accident poll failed:", err);
      }
    };

    pollAccident();
    const accidentPoll = setInterval(pollAccident, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(accidentPoll);
    };
  }, [user?.id]);

  const handleLogout = () => navigate("/");

  /* ── FETCH NEAREST HOSPITAL (onClick) ── */
  const fetchNearestHospital = async () => {
    if (!location) { alert("Location not available"); return; }
    setHospitalLoading(true);
    setShowHospitalCard(true);
    try {
      const res = await fetch(
        `${API_URL}/api/nearest-hospital?lat=${location.lat}&lng=${location.lon}`
      );
      if (res.ok) {
        const data = await res.json();
        setNearestHospital(data);
      } else {
        alert("Could not find nearby hospitals.");
        setShowHospitalCard(false);
      }
    } catch (err) {
      console.error(err);
      alert("Hospital service unavailable.");
      setShowHospitalCard(false);
    }
    setHospitalLoading(false);
  };

  /* ── FUEL ASSIST ── */
  const startFuelSearch = async () => {
    if (!location) { alert("Location not available"); return; }
    if (!fuelAmount.trim()) { alert("Please enter fuel amount needed"); return; }
    setFuelStatus("searching");
    setLoadingDrivers(true);
    try {
      await fetch(`${API_URL}/api/user-location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, latitude: location.lat, longitude: location.lon })
      });

      const response = await fetch(`${API_URL}/api/fuel-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id, latitude: location.lat,
          longitude: location.lon, fuelAmount: fuelAmount.trim()
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Failed to broadcast");
        setFuelStatus("idle"); setLoadingDrivers(false); return;
      }

      const [driversRes, requestsRes] = await Promise.all([
        fetch(`${API_URL}/api/nearby-drivers?latitude=${location.lat}&longitude=${location.lon}&excludeUserId=${user.id}`),
        fetch(`${API_URL}/api/fuel-requests/active?latitude=${location.lat}&longitude=${location.lon}`)
      ]);
      const driversData = driversRes.ok ? await driversRes.json() : [];
      const requestsData = requestsRes.ok ? await requestsRes.json() : [];
      setNearbyDrivers(driversData);
      setActiveFuelRequests(requestsData.filter(r => r.userId !== user.id));
      setFuelStatus("found");
    } catch (err) {
      console.error(err);
      alert("Backend not running");
      setFuelStatus("idle");
    }
    setLoadingDrivers(false);
  };

  /* ── NEARBY MECHANICS ── */
  const fetchNearbyMechanics = async () => {
    if (!location) { alert("Location not available"); return; }
    setLoadingMech(true);
    try {
      const res = await fetch(`${API_URL}/api/nearby-mechanics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: location.lat, longitude: location.lon })
      });
      const data = await res.json();
      if (res.ok) setNearbyMechanics(data);
      else alert("No mechanics found");
    } catch (err) { console.error(err); alert("Backend not running"); }
    setLoadingMech(false);
  };

  /* ── PANIC ── */
  const PANIC_TYPE_MAP = {
    THEFT: { type: "Vehicle Theft", label: "Vehicle Theft Alert", emoji: "🚗" },
    SOS: { type: "SOS Alert", label: "SOS Alert", emoji: "🆘" },
    WOMEN: { type: "Women Safety", label: "Women Safety Alert", emoji: "🛡️" },
  };

  const triggerPanic = async (key) => {
    if (!location) { alert("Location not available"); return; }
    const { type, label, emoji } = PANIC_TYPE_MAP[key];
    try {
      const res = await fetch(`${API_URL}/api/panic-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, type, latitude: location.lat, longitude: location.lon })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`${emoji} ${label} Sent Successfully!\nAuthorities have been notified.`);
        setActiveModal(null);
      } else {
        alert(data.error || "Failed to send alert");
      }
    } catch (err) { console.error(err); alert("Backend not running"); }
  };

  /* ── MEDICAL ALERT ── */
  const triggerMedical = async () => {
    if (!location) { alert("Location not available"); return; }
    try {
      const res = await fetch(`${API_URL}/api/medical-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, latitude: location.lat, longitude: location.lon })
      });
      const data = await res.json();
      if (res.ok) {
        alert("🚑 Ambulance Dispatched!\nYour medical profile has been shared with responders.");
        setActiveModal(null);
      } else {
        alert(data.error || "Failed");
      }
    } catch (err) { console.error(err); alert("Backend not running"); }
  };

  /* ── ADD MECHANIC ── */
  const handleAddMechanic = async (e) => {
    e.preventDefault();
    if (!location) { alert("Location not available"); return; }
    const form = e.target;
    const mechanicData = {
      name: form[0].value, type: form[1].value,
      latitude: location.lat, longitude: location.lon, phone: form[3].value
    };
    try {
      const res = await fetch(`${API_URL}/api/add-mechanic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mechanicData)
      });
      const data = await res.json();
      if (res.ok) { alert("✅ Mechanic Added!"); form.reset(); setActiveModal(null); }
      else alert(data.error);
    } catch (err) { console.error(err); alert("Backend not running"); }
  };

  /* ── REPORT ACCIDENT (manual) ── */
  const handleReportAccident = async (e) => {
    e.preventDefault();
    if (!reportImage) { alert("Please attach an image."); return; }
    if (!location) { alert("Location not available."); return; }

    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput || !fileInput.files[0]) { alert("Please select an image file"); return; }

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("latitude", location.lat);
    formData.append("longitude", location.lon);
    formData.append("image", fileInput.files[0]);

    try {
      const response = await fetch(`${API_URL}/api/report-accident`, { method: "POST", body: formData });
      const data = await response.json();
      if (response.ok) {
        setVehicleStatus("ACCIDENT");
        if (data.helperName) setAssignedHelper({ name: data.helperName, status: "ASSIGNED" });

        // Show AI severity result — only when model actually ran (valid severity + real scores)
        const validAISevs = ["severe", "moderate", "mild", "none"];
        const ai = data.aiAnalysis;
        if (ai && validAISevs.includes(ai.severity?.toLowerCase()) &&
          (ai.confidence > 0 || (ai.realness && ai.realness.score > 0))) {
          setAiAnalysis(ai);
        }

        // Show nearest hospital if returned
        if (data.nearestHospital && data.nearestHospital.name) {
          setNearestHospital(data.nearestHospital);
          setShowHospitalCard(true);
        }

        setActiveModal(null);
        setReportImage(null);
        alert(`✅ Accident Report Submitted!\n🚑 Helper Assigned: ${data.helperName || "Searching..."}\n🤖 AI Severity: ${data.aiAnalysis?.severity?.toUpperCase() || data.severity || "Analysing..."}`);
      } else {
        alert(data.error || "Failed to submit report");
      }
    } catch (err) { console.error("Error:", err); alert("❌ Backend not running"); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setReportImage(URL.createObjectURL(file));
  };

  /* ── DEV: Toggle crash simulation ── */
  const toggleCrashSimulation = async () => {
    if (!location || !user?.id) { alert("Location or user not found"); return; }

    if (crashActive && crashAccidentId) {
      try {
        const res = await fetch(`${API_URL}/api/accident-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accidentId: crashAccidentId, status: "CANCELLED", helperId: user.id })
        });
        const data = await res.json();
        if (res.ok) {
          setVehicleStatus("SAFE"); setMyAccident(null); setAssignedHelper(null);
          setCrashActive(false); setCrashAccidentId(null);
          setAiAnalysis(null); setNearestHospital(null); setShowHospitalCard(false);
          alert("✅ Crash cancelled. Status reset to NORMAL.");
        } else { alert(data.error || "Failed to cancel crash"); }
      } catch (err) { console.error(err); alert("Backend not running"); }
      return;
    }

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("latitude", location.lat);
    formData.append("longitude", location.lon);

    try {
      const res = await fetch(`${API_URL}/api/report-accident`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setVehicleStatus("ACCIDENT");
        setCrashActive(true);
        try {
          const latest = await fetch(`${API_URL}/api/latest-accident?userId=${user.id}`);
          const latestData = await latest.json();
          if (latestData?.accidentId) setCrashAccidentId(latestData.accidentId);
        } catch (_) { }
        if (data.helperName) setAssignedHelper({ name: data.helperName, status: "ASSIGNED" });
        // Only set AI data if the model actually ran (valid severity + non-zero scores)
        {
          const validSevList = ["severe", "moderate", "mild", "none"];
          const aiRes = data.aiAnalysis;
          if (aiRes && validSevList.includes(aiRes.severity?.toLowerCase()) &&
            (aiRes.confidence > 0 || (aiRes.realness && aiRes.realness.score > 0))) {
            setAiAnalysis(aiRes);
          }
        }
        if (data.nearestHospital?.name) {
          setNearestHospital(data.nearestHospital);
          setShowHospitalCard(true);
        }
        alert(`🚨 Crash Triggered!\nHelper: ${data.helperName || "Searching..."}\n\nPress [DEV] CANCEL CRASH to reset.`);
      } else { alert(data.error || "Crash failed"); }
    } catch (err) { console.error(err); alert("Backend not running"); }
  };

  /* ── CHAT ── */
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'You', text: newMessage, time: getCurrentTime() }]);
    setNewMessage("");
    setShowChatInput(false);
    alert("Message Broadcasted to Nearby Users!");
  };

  /* ────────────────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────────────────── */
  return (
    <div className="dashboard-container">
      <div className={`bg-static ${vehicleStatus === "ACCIDENT" ? "bg-accident" : ""}`} />

      <div className="logout-pos">
        <LogoutButton onClick={handleLogout} />
      </div>

      <div className="content-wrap">

        {/* HEADER */}
        <div className="header-wrap">
          <div className="header-top">
            <div className="system-time">
              <Clock size={14} style={{ marginRight: 5 }} /> {getCurrentDate()} • {time}
            </div>
            <div className="chat-notify-icon" onClick={() => setIsChatSlidebarOpen(true)}>
              <MessageSquare size={18} />
              {chatMessages.length > 0 && <span className="badge">{chatMessages.length}</span>}
            </div>
          </div>
          <BlurText text="IVERAS COMMAND CENTER" delay={100} animateBy="letters" direction="top" className="main-title" />
        </div>

        <div className="bento-grid">

          {/* 1. STATUS BAR */}
          <div className={`bento-card full-width status-bar ${vehicleStatus === "ACCIDENT" ? "status-critical" : "status-safe"} animate-slide-up`}>
            <div className="status-content">
              {vehicleStatus === "SAFE" ? (
                <>
                  <div className="ecg-line"></div>
                  <Activity size={20} className="pulse-icon" />
                  <span className="status-text">SYSTEM STATUS: <strong style={{ color: '#00ff9d' }}>NORMAL</strong></span>
                  <span className="sub-status hidden-mobile"> • SENSORS ACTIVE • GPS LOCKED</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={24} className="blink-icon" />
                  <span className="status-text">CRITICAL ALERT: <strong>ACCIDENT DETECTED</strong></span>
                </>
              )}
            </div>
          </div>

          {/* HELPER BANNER */}
          {vehicleStatus === "ACCIDENT" && (
            <div className="full-width animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <HelperBanner helperName={assignedHelper?.name} helperStatus={assignedHelper?.status} />
            </div>
          )}

          {/* ── AI SEVERITY CARD (shown when accident is active + AI data available) ── */}
          {vehicleStatus === "ACCIDENT" && aiAnalysis && (
            <div className="full-width animate-slide-up" style={{ animationDelay: '0.07s' }}>
              <AISeverityCard aiData={aiAnalysis} />
            </div>
          )}

          {/* ── NEAREST HOSPITAL CARD (shown on demand or after accident reported) ── */}
          {showHospitalCard && (
            <div className="full-width animate-slide-up" style={{ animationDelay: '0.08s' }}>
              <NearestHospitalCard
                hospital={nearestHospital}
                loading={hospitalLoading}
                onClose={() => setShowHospitalCard(false)}
              />
            </div>
          )}

          {/* 2. IDENTITY BLADE */}
          <div className="bento-card full-width id-blade-container animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="id-section driver-profile">
              <div className="id-photo-wrapper">
                <div className="id-photo">
                  <span className="initials">{user?.name?.charAt(0) || "U"}</span>
                </div>
                <div className="live-badge"></div>
              </div>
              <div className="id-details-grid">
                <div className="detail-group">
                  <span className="label">OPERATOR</span>
                  <h3>{user?.name || "Unknown"}</h3>
                </div>
                <div className="detail-group">
                  <span className="label">USER ID</span>
                  <p className="mono">{user?.id || "N/A"}</p>
                </div>
                <div className="detail-group">
                  <span className="label">VEHICLE NO</span>
                  <p className="mono highlight">{user?.vehicleNumber || "N/A"}</p>
                </div>
                <div className="detail-group">
                  <span className="label">MODEL</span>
                  <p>{user?.vehicleModel || "Not Provided"}</p>
                </div>
              </div>
              <div className="id-icon hidden-mobile"><Fingerprint size={80} strokeWidth={0.5} /></div>
            </div>

            <div className="id-section medical-profile">
              <div className="med-badge"><HeartPulse size={14} /> MEDICAL ID</div>
              <div className="med-grid">
                <div className="med-item highlight-red">
                  <span className="label">BLOOD GRP</span>
                  <p className="blood-text">{user?.bloodGroup || "O+"}</p>
                </div>
                <div className="med-item">
                  <span className="label">CONDITIONS</span>
                  <p className="val-text">{user?.conditions || "None"}</p>
                </div>
                <div className="med-item">
                  <span className="label">ALLERGIES</span>
                  <p className="val-text">{user?.allergies || "None"}</p>
                </div>
                <div className="med-item">
                  <span className="label">EMERGENCY CONTACT</span>
                  <p className="contact-text">{user?.emergencyPhone || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MAP */}
          <div className={`bento-card map-card animate-slide-up ${vehicleStatus === "ACCIDENT" ? "map-alert" : ""}`} style={{ animationDelay: '0.2s' }}>
            <div className="card-header">
              <div className="flex-center">
                <MapPin size={16} color="#4cc9f0" />
                <span style={{ marginLeft: 8, fontWeight: 600 }}>LIVE TRACKING</span>
              </div>
              <div className="flex-center" style={{ gap: 10 }}>
                <div className="weather-widget"><CloudRain size={12} /> 28°C</div>
                {/* ── NEAREST HOSPITAL BUTTON ── */}
                <button
                  className="hospital-trigger-btn"
                  onClick={fetchNearestHospital}
                  title="Find nearest hospital"
                >
                  🏥 Nearest Hospital
                </button>
              </div>
            </div>
            <div className="map-frame">
              {location ? (
                <>
                  <iframe
                    title="map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lon - 0.005}%2C${location.lat - 0.005}%2C${location.lon + 0.005}%2C${location.lat + 0.005}&layer=mapnik&marker=${location.lat}%2C${location.lon}`}
                  />
                  <div className="radar-scan"></div>
                </>
              ) : <div className="loading-map">Acquiring Satellite Link...</div>}
              {vehicleStatus === "ACCIDENT" && (
                <div className="accident-overlay">
                  <div className="radar-ping"></div>
                  <p>LOCATION BROADCASTING</p>
                  {assignedHelper?.name && (
                    <p style={{ fontSize: '0.8rem', marginTop: 8, opacity: 0.8 }}>
                      🚑 {assignedHelper.name} is on the way
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. ACTION CARDS */}
          <div className="action-stack animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="bento-card action-card report-accident hover-effect full-span-mobile" onClick={() => setActiveModal('report')}>
              <div className="icon-box"><Camera size={24} /></div>
              <div className="text-box"><h3>REPORT ACCIDENT</h3><p>Found a crash? Report here.</p></div>
              <div className="card-glow" style={{ background: '#ff4500' }}></div>
            </div>
            <div className="bento-card action-card fuel hover-effect" onClick={() => { setActiveModal('fuel'); setFuelStatus('idle'); setShowChatInput(false); }}>
              <div className="icon-box"><Zap size={24} /></div>
              <div className="text-box"><h3>FUEL ASSIST</h3><p>Community Help</p></div>
              <div className="card-glow" style={{ background: '#ffd60a' }}></div>
            </div>
            <div className="bento-card action-card mech hover-effect" onClick={() => { setActiveModal('mechanic'); fetchNearbyMechanics(); }}>
              <div className="icon-box"><Wrench size={24} /></div>
              <div className="text-box"><h3>ROAD SUPPORT</h3><p>Find Mechanics</p></div>
              <div className="card-glow" style={{ background: '#4cc9f0' }}></div>
            </div>
            <div className="bento-card action-card panic hover-effect" onClick={() => setActiveModal('panic')}>
              <div className="icon-box pulse-red"><ShieldAlert size={24} /></div>
              <div className="text-box"><h3>PANIC MODE</h3><p>Theft · SOS · Women Safety</p></div>
              <div className="card-glow" style={{ background: '#ff006e' }}></div>
            </div>
            <div className="bento-card action-card medical hover-effect" onClick={() => setActiveModal('medical')}>
              <div className="icon-box"><Siren size={24} /></div>
              <div className="text-box"><h3>MEDICAL / RESCUE</h3><p>Ambulance</p></div>
              <div className="card-glow" style={{ background: '#ffffff' }}></div>
            </div>
            {/* ── NEAREST HOSPITAL ACTION CARD ── */}
            <div className="bento-card action-card hospital hover-effect" onClick={fetchNearestHospital}>
              <div className="icon-box"><Hospital size={24} /></div>
              <div className="text-box"><h3>NEAREST HOSPITAL</h3><p>Find emergency care</p></div>
              <div className="card-glow" style={{ background: '#06d6a0' }}></div>
            </div>
          </div>

          {/* 5. ADD MECHANIC */}
          <div className="bento-card full-width contribute-bar hover-effect animate-slide-up" style={{ animationDelay: '0.4s' }} onClick={() => setActiveModal('addMech')}>
            <div className="contribute-content">
              <PlusCircle size={20} color="#06d6a0" />
              <span>KNOW A GOOD MECHANIC? ADD TO DATABASE</span>
            </div>
          </div>

        </div>
      </div>

      <ChatSlidebar isOpen={isChatSlidebarOpen} onClose={() => setIsChatSlidebarOpen(false)} messages={chatMessages} />

      {/* ── DEV CRASH TOGGLE BUTTON ── */}
      <button onClick={toggleCrashSimulation} className={`dev-crash-btn ${crashActive ? 'dev-crash-active' : ''}`}>
        {crashActive ? "⛔ CANCEL CRASH" : "🚨 [DEV] CRASH"}
      </button>

      {/* ==================== MODALS ==================== */}

      {/* REPORT ACCIDENT */}
      <GlassModal isOpen={activeModal === 'report'} onClose={() => { setActiveModal(null); setReportImage(null); }} title="REPORT ROAD ACCIDENT" color="#ff4500">
        <div className="modal-center">
          <p style={{ marginBottom: 15, fontSize: 13, opacity: 0.8 }}>
            You are reporting an accident at your current location.
            <br /><strong>A helper will be auto-assigned from the database.</strong>
          </p>
          <div className="geo-tag-display">
            <MapPin size={16} color="#ff4500" />
            <span>GEO-TAG: {location ? `${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}` : "Fetching GPS..."}</span>
          </div>
          <label className="image-upload-box">
            {reportImage ? (
              <img src={reportImage} alt="Accident Report" className="preview-img" />
            ) : (
              <div className="upload-placeholder">
                <Camera size={40} opacity={0.5} />
                <span>Tap to Capture / Upload Image</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </label>
          <button className="btn-primary" style={{ background: '#ff4500', color: 'white' }} onClick={handleReportAccident}>
            <UploadCloud size={18} style={{ marginRight: 8 }} /> SUBMIT REPORT
          </button>
        </div>
      </GlassModal>

      {/* FUEL MODAL */}
      <GlassModal
        isOpen={activeModal === 'fuel'}
        onClose={() => { setActiveModal(null); setFuelStatus("idle"); setFuelAmount(""); setNearbyDrivers([]); setActiveFuelRequests([]); }}
        title="FUEL ASSISTANCE"
        color="#ffd60a"
      >
        {fuelStatus === 'idle' && (
          <div className="modal-center">
            <p style={{ marginBottom: 15, opacity: 0.7 }}>Broadcast a fuel request to nearby community drivers.</p>
            <input
              type="text"
              className="fuel-amount-input"
              placeholder="e.g. 2 Litres Petrol / 1L Diesel"
              value={fuelAmount}
              onChange={e => setFuelAmount(e.target.value)}
            />
            <button className="btn-primary fuel-btn" onClick={startFuelSearch} disabled={!fuelAmount.trim()}>
              BROADCAST REQUEST
            </button>
          </div>
        )}
        {fuelStatus === 'searching' && (
          <div className="modal-center">
            <div className="loader"></div>
            <p>Broadcasting to nearby drivers...</p>
          </div>
        )}
        {fuelStatus === 'found' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,214,10,0.1)', border: '1px solid rgba(255,214,10,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ffd60a' }}>
              ✅ Your request for <strong>{fuelAmount}</strong> has been broadcasted
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#888', marginBottom: 8 }}>NEARBY DRIVERS ({nearbyDrivers.length})</p>
              {loadingDrivers ? (
                <p style={{ color: '#555', fontSize: 13 }}>Scanning nearby drivers...</p>
              ) : nearbyDrivers.length === 0 ? (
                <p style={{ color: '#555', fontSize: 13 }}>No drivers found within 10km.</p>
              ) : (
                nearbyDrivers.map((d, i) => (
                  <div key={i} className="driver-card" style={{ marginBottom: 10 }}>
                    <div className="avatar">{d.name?.charAt(0) || "?"}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: 14 }}>{d.name}</h4>
                      <p style={{ margin: '2px 0 0 0', color: '#888', fontSize: 12 }}>{d.vehicle || 'N/A'} • {d.distance} km away</p>
                    </div>
                    <a href={`tel:${d.contact}`} className="call-btn" style={{ textDecoration: 'none' }}>
                      <Phone size={13} /> Call
                    </a>
                  </div>
                ))
              )}
            </div>
            {activeFuelRequests.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#888', marginBottom: 8 }}>
                  OTHERS NEEDING FUEL NEARBY ({activeFuelRequests.length})
                </p>
                {activeFuelRequests.map((r, i) => (
                  <div key={i} className="driver-card" style={{ marginBottom: 10, borderColor: 'rgba(255,100,0,0.3)' }}>
                    <div className="avatar" style={{ background: 'rgba(255,69,0,0.3)' }}>{r.name?.charAt(0) || "?"}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: 14 }}>{r.name}</h4>
                      <p style={{ margin: '2px 0 0 0', color: '#888', fontSize: 12 }}>{r.fuelAmount} • {r.distance} km away</p>
                    </div>
                    <a href={`tel:${r.contact}`} className="call-btn" style={{ textDecoration: 'none' }}>
                      <Phone size={13} /> Help
                    </a>
                  </div>
                ))}
              </div>
            )}
            {!showChatInput ? (
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setShowChatInput(true)}>
                <MessageSquare size={16} /> Broadcast a Message
              </button>
            ) : (
              <div className="chat-input-view">
                <p style={{ marginBottom: 10, fontSize: 13, color: '#ccc' }}>Broadcast to nearby drivers:</p>
                <textarea className="chat-textarea" placeholder="e.g. I'm in a red Creta near the petrol bunk..." value={newMessage} onChange={e => setNewMessage(e.target.value)}></textarea>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setShowChatInput(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleSendMessage}><Send size={16} /> Send</button>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassModal>

      {/* MECHANIC MODAL */}
      <GlassModal isOpen={activeModal === 'mechanic'} onClose={() => setActiveModal(null)} title="NEARBY MECHANICS" color="#4cc9f0">
        <div className="mech-list">
          {loadingMech ? (
            <p style={{ textAlign: 'center', color: '#aaa' }}>Searching mechanics...</p>
          ) : nearbyMechanics.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#aaa' }}>No mechanics found nearby.</p>
          ) : (
            nearbyMechanics.map((m, i) => (
              <div key={i} className="mech-item">
                <div className="mech-info"><h4>{m.name}</h4><span className="mech-tag">{m.type}</span></div>
                <div className="mech-meta">
                  <span className="dist">{m.distance} km</span>
                  <a href={`tel:${m.phone}`} className="call-btn"><Phone size={14} /> {m.phone}</a>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassModal>

      {/* PANIC MODAL */}
      <GlassModal isOpen={activeModal === 'panic'} onClose={() => setActiveModal(null)} title="EMERGENCY TYPE" color="#ff006e">
        <div className="panic-grid">
          <button className="panic-option theft" onClick={() => triggerPanic('THEFT')}>
            <Car size={28} />
            <span>VEHICLE THEFT</span>
            <small>Track &amp; notify police</small>
          </button>
          <button className="panic-option safety" onClick={() => triggerPanic('SOS')}>
            <ShieldAlert size={28} />
            <span>SOS ALERT</span>
            <small>Personal danger · rescue</small>
          </button>
          <button className="panic-option women full-span" onClick={() => triggerPanic('WOMEN')}>
            <UserCheck size={28} />
            <span>WOMEN SAFETY</span>
            <small>Priority alert to police &amp; emergency contacts</small>
          </button>
        </div>
      </GlassModal>

      {/* MEDICAL MODAL */}
      <GlassModal isOpen={activeModal === 'medical'} onClose={() => setActiveModal(null)} title="MEDICAL / RESCUE" color="#fff">
        <div className="modal-center">
          <p style={{ marginBottom: 12, opacity: 0.7 }}>
            Ambulance will be dispatched to your current location.
          </p>
          <div className="medical-profile-preview">
            <p className="preview-label">YOUR MEDICAL PROFILE (auto-attached by server)</p>
            <div className="preview-grid">
              <div className="preview-item">
                <span className="pi-label">Blood Group</span>
                <span className="pi-val blood">{user?.bloodGroup || "Unknown"}</span>
              </div>
              <div className="preview-item">
                <span className="pi-label">Conditions</span>
                <span className="pi-val">{user?.conditions || "None"}</span>
              </div>
              <div className="preview-item">
                <span className="pi-label">Allergies</span>
                <span className="pi-val">{user?.allergies || "None"}</span>
              </div>
              <div className="preview-item">
                <span className="pi-label">Emergency Ph</span>
                <span className="pi-val blue">{user?.emergencyPhone || "N/A"}</span>
              </div>
            </div>
          </div>
          <button className="panic-option medical-opt" style={{ width: '100%', marginTop: 20 }} onClick={triggerMedical}>
            <Siren size={32} />
            <span>DISPATCH AMBULANCE</span>
            <small>Heart Attack · Trauma · Accident</small>
          </button>
        </div>
      </GlassModal>

      {/* ADD MECHANIC MODAL */}
      <GlassModal isOpen={activeModal === 'addMech'} onClose={() => setActiveModal(null)} title="ADD MECHANIC" color="#06d6a0">
        <form className="add-mech-form" onSubmit={handleAddMechanic}>
          <input type="text" placeholder="Mechanic / Shop Name" required />
          <select required>
            <option value="">Select Type</option>
            <option value="Car Repair">Car Repair</option>
            <option value="Bike Repair">Bike Repair</option>
            <option value="Puncture Shop">Puncture Shop</option>
          </select>
          <div className="loc-input">
            <input type="text" value={location ? `${location.lat}, ${location.lon}` : "Fetching location..."} readOnly />
            <MapPin size={16} />
          </div>
          <input type="tel" placeholder="Phone Number" required />
          <button type="submit" className="btn-primary">SUBMIT FOR VERIFICATION</button>
        </form>
      </GlassModal>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;600;800&display=swap');

        .dashboard-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow-y: auto; overflow-x: hidden; font-family: 'Inter', sans-serif; color: white; }
        .bg-static { position: fixed; inset: 0; z-index: -1; background: radial-gradient(circle at center, #2a2a2a 0%, #111111 100%); transition: background 0.5s ease; }
        .bg-accident { background: radial-gradient(circle at center, #660000 0%, #220000 100%); }
        .logout-pos { position: fixed; top: 20px; right: 20px; z-index: 100; }
        .content-wrap { position: relative; z-index: 2; padding: 40px 20px 80px 20px; max-width: 1200px; margin: 0 auto; }

        /* HELPER BANNER */
        .helper-banner { display: flex; align-items: center; gap: 16px; background: rgba(0,0,0,0.6); border: 1px solid; border-radius: 16px; padding: 14px 20px; backdrop-filter: blur(10px); animation: slideUpFade 0.5s ease-out forwards; }
        .helper-banner-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .helper-banner-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .helper-label { font-size: 10px; color: #888; font-weight: 700; letter-spacing: 1px; }
        .helper-banner-text strong { font-size: 16px; font-weight: 800; }
        .helper-status-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px; letter-spacing: 1px; white-space: nowrap; }

        /* AI SEVERITY CARD */
        .ai-severity-card { background: rgba(15,15,20,0.85); border: 1px solid; border-radius: 16px; padding: 16px 20px; backdrop-filter: blur(10px); animation: slideUpFade 0.5s ease-out forwards; }
        .ai-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .ai-card-header span:first-child { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #aaa; }
        .ai-model-name { font-size: 10px; color: #555; font-weight: 600; }
        .ai-severity-pill { display: inline-flex; align-items: center; gap: 10px; border: 2px solid; border-radius: 12px; padding: 8px 18px; margin-bottom: 12px; }
        .ai-icon { font-size: 1.4rem; }
        .ai-label-text { font-size: 1.3rem; font-weight: 900; letter-spacing: 2px; }
        .ai-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .ai-bar-label { font-size: 11px; color: #888; width: 72px; flex-shrink: 0; }
        .ai-bar-track { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; }
        .ai-bar-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
        .ai-bar-val { font-size: 12px; font-weight: 700; width: 40px; text-align: right; }
        .ai-result-text { margin: 10px 0 0; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; }

        /* NEAREST HOSPITAL CARD */
        .hospital-card { background: rgba(6,214,160,0.06); border: 1px solid rgba(6,214,160,0.3); border-radius: 16px; padding: 16px 20px; animation: slideUpFade 0.5s ease-out forwards; }
        .hospital-card-header { display: flex; align-items: center; font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #06d6a0; margin-bottom: 10px; }
        .hospital-name { margin: 0 0 6px; font-size: 16px; font-weight: 800; color: #fff; }
        .hospital-address { margin: 0 0 10px; font-size: 12px; color: #aaa; }
        .hospital-meta-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
        .hospital-dist-badge { font-size: 12px; background: rgba(6,214,160,0.15); color: #06d6a0; padding: 3px 10px; border-radius: 6px; font-weight: 700; }
        .hospital-call-btn { display: flex; align-items: center; gap: 6px; color: #4cc9f0; font-size: 13px; font-weight: 700; background: rgba(76,201,240,0.1); padding: 5px 12px; border-radius: 8px; text-decoration: none; }
        .hospital-nav-btn { display: block; width: 100%; padding: 10px; background: rgba(6,214,160,0.15); border: 1px solid rgba(6,214,160,0.3); color: #06d6a0; font-size: 13px; font-weight: 700; border-radius: 10px; text-align: center; text-decoration: none; transition: 0.2s; cursor: pointer; }
        .hospital-nav-btn:hover { background: rgba(6,214,160,0.25); }
        .hospital-trigger-btn { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; background: rgba(6,214,160,0.12); border: 1px solid rgba(6,214,160,0.35); color: #06d6a0; padding: 4px 10px; border-radius: 8px; cursor: pointer; transition: 0.2s; letter-spacing: 0.5px; }
        .hospital-trigger-btn:hover { background: rgba(6,214,160,0.22); }
        .hospital .icon-box { color: #06d6a0; background: rgba(6,214,160,0.15); border: 1px solid rgba(6,214,160,0.3); }

        .header-wrap { margin-bottom: 30px; text-align: center; }
        .header-top { display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 10px; opacity: 0.8; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
        .main-title { font-family: 'Inter', sans-serif; font-weight: 900; letter-spacing: -1px; }

        .chat-notify-icon { cursor: pointer; position: relative; background: rgba(255,255,255,0.1); padding: 5px; border-radius: 8px; transition: 0.2s; }
        .chat-notify-icon:hover { background: rgba(255,255,255,0.2); }
        .badge { position: absolute; top: -5px; right: -5px; background: #ff0050; color: white; font-size: 9px; width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }

        .chat-slidebar { position: fixed; top: 0; right: 0; bottom: 0; width: 300px; background: #121212; border-left: 1px solid #333; z-index: 2000; transform: translateX(100%); transition: transform 0.3s ease; display: flex; flex-direction: column; }
        .chat-slidebar.open { transform: translateX(0); }
        .slidebar-header { padding: 20px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .slidebar-header h3 { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 16px; }
        .slidebar-header button { background: none; border: none; color: #777; cursor: pointer; }
        .slidebar-body { padding: 20px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .no-msg { text-align: center; color: #555; margin-top: 50px; font-size: 13px; }
        .msg-bubble { padding: 10px 14px; border-radius: 12px; max-width: 85%; font-size: 13px; line-height: 1.4; }
        .msg-bubble.sent { align-self: flex-end; background: #2a2a2a; border: 1px solid #444; color: #ddd; border-bottom-right-radius: 2px; }
        .msg-bubble.received { align-self: flex-start; background: rgba(255,214,10,0.1); border: 1px solid rgba(255,214,10,0.2); color: #ffd60a; border-bottom-left-radius: 2px; }
        .msg-sender { font-size: 9px; opacity: 0.7; display: block; margin-bottom: 2px; font-weight: bold; }
        .msg-time { font-size: 9px; opacity: 0.4; display: block; text-align: right; margin-top: 4px; }

        .bento-grid { display: grid; grid-template-columns: 1.6fr 1fr; grid-gap: 24px; }
        .bento-card { background: rgba(15,15,20,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; backdrop-filter: blur(20px); padding: 24px; overflow: hidden; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transition: all 0.3s ease; }
        .full-width { grid-column: 1 / -1; }
        .map-card { min-height: 320px; display: flex; flex-direction: column; }
        .action-stack { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .status-bar { padding: 15px; display: flex; align-items: center; justify-content: center; }
        .status-safe { background: linear-gradient(90deg, rgba(0,255,157,0.05), rgba(0,255,157,0.15), rgba(0,255,157,0.05)); border-color: rgba(0,255,157,0.3); color: #e0fff4; }
        .status-critical { background: rgba(255,0,0,0.2); border-color: red; color: #ffcccc; animation: criticalFlash 1s infinite; }
        .status-content { display: flex; align-items: center; gap: 12px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; font-size: 14px; position: relative; width: 100%; justify-content: center; }
        .ecg-line { position: absolute; left: 0; bottom: -15px; height: 2px; width: 100%; background: linear-gradient(90deg, transparent 0%, #00ff9d 50%, transparent 100%); opacity: 0.3; }

        .id-blade-container { padding: 0; display: flex; flex-direction: column; background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); }
        .id-section { padding: 25px 30px; position: relative; }
        .driver-profile { display: flex; align-items: center; gap: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .id-photo-wrapper { position: relative; }
        .id-photo { width: 80px; height: 80px; border-radius: 50%; background: #2a2a2a; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.1); box-shadow: 0 0 20px rgba(0,0,0,0.5); }
        .initials { font-size: 28px; font-weight: 800; color: #fff; }
        .live-badge { position: absolute; bottom: 5px; right: 5px; width: 14px; height: 14px; background: #00ff9d; border-radius: 50%; border: 3px solid #1a1a1a; box-shadow: 0 0 10px #00ff9d; }
        .id-details-grid { flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .detail-group .label { font-size: 11px; color: #888; display: block; margin-bottom: 4px; font-weight: 600; letter-spacing: 1px; }
        .detail-group h3 { margin: 0; font-size: 18px; font-weight: 700; color: white; }
        .detail-group p { margin: 0; font-size: 15px; color: #ddd; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .highlight { color: #4cc9f0; text-shadow: 0 0 15px rgba(76,201,240,0.4); }
        .id-icon { opacity: 0.1; color: white; }
        .medical-profile { background: linear-gradient(90deg, rgba(255,0,80,0.1) 0%, transparent 100%); }
        .med-badge { display: inline-flex; align-items: center; gap: 6px; background: #ff0050; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; margin-bottom: 18px; box-shadow: 0 5px 15px rgba(255,0,80,0.4); }
        .med-grid { display: grid; grid-template-columns: 1fr 2fr 2fr 2fr; gap: 20px; }
        .med-item .label { font-size: 10px; color: #ff8fa3; display: block; margin-bottom: 4px; font-weight: 700; letter-spacing: 0.5px; }
        .blood-text { font-size: 22px; font-weight: 800; color: #ff4d4d; margin: 0; }
        .val-text { color: #fff; margin: 0; font-size: 14px; }
        .contact-text { color: #4cc9f0; font-weight: 600; margin: 0; font-size: 14px; }

        .card-header { display: flex; justify-content: space-between; margin-bottom: 15px; color: #eee; font-size: 14px; align-items: center; }
        .weather-widget { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #ccc; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 12px; }
        .map-frame { flex: 1; border-radius: 16px; overflow: hidden; background: #000; position: relative; box-shadow: inset 0 0 20px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.1); }
        .map-frame iframe { width: 100%; height: 100%; border: none; filter: invert(90%) hue-rotate(180deg) contrast(1.2); }
        .radar-scan { position: absolute; top: 50%; left: 50%; width: 300px; height: 300px; transform: translate(-50%,-50%); border-radius: 50%; border: 1px solid rgba(76,201,240,0.3); background: conic-gradient(from 0deg, transparent 0%, rgba(76,201,240,0.1) 100%); animation: scan 4s infinite linear; pointer-events: none; }
        @keyframes scan { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
        .loading-map { display: flex; align-items: center; justify-content: center; height: 200px; color: #555; font-size: 13px; }
        .accident-overlay { position: absolute; inset: 0; background: rgba(50,0,0,0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: bold; letter-spacing: 2px; backdrop-filter: blur(4px); z-index: 10; }
        .radar-ping { width: 60px; height: 60px; border-radius: 50%; background: #ff0000; animation: ping 1.5s infinite ease-out; margin-bottom: 15px; box-shadow: 0 0 30px #ff0000; }
        @keyframes ping { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }

        .action-card { display: flex; align-items: center; gap: 18px; cursor: pointer; position: relative; padding: 25px; }
        .icon-box { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .report-accident { grid-column: 1 / -1; border-color: rgba(255,69,0,0.5); background: rgba(255,69,0,0.1); }
        .report-accident .icon-box { background: #ff4500; color: white; box-shadow: 0 0 15px #ff4500; }
        .fuel .icon-box { color: #ffd60a; background: rgba(255,214,10,0.15); border: 1px solid rgba(255,214,10,0.3); }
        .mech .icon-box { color: #4cc9f0; background: rgba(76,201,240,0.15); border: 1px solid rgba(76,201,240,0.3); }
        .panic .icon-box { color: #ff006e; background: rgba(255,0,110,0.15); border: 1px solid rgba(255,0,110,0.3); }
        .medical .icon-box { color: #ffffff; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); }
        .text-box h3 { margin: 0; font-size: 16px; font-weight: 700; color: white; margin-bottom: 4px; }
        .text-box p { margin: 0; font-size: 12px; color: #aaa; }
        .card-glow { position: absolute; right: 0; top: 0; width: 60px; height: 60px; border-radius: 50%; filter: blur(40px); opacity: 0.15; pointer-events: none; }
        .pulse-red { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,0,110,0.4); } 70% { box-shadow: 0 0 0 15px rgba(255,0,110,0); } 100% { box-shadow: 0 0 0 0 rgba(255,0,110,0); } }
        .hover-effect:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(0,0,0,0.7); }

        .contribute-bar { display: flex; justify-content: center; align-items: center; cursor: pointer; background: rgba(6,214,160,0.08); border: 1px dashed rgba(6,214,160,0.4); padding: 15px; }
        .contribute-content { display: flex; align-items: center; gap: 10px; color: #06d6a0; font-weight: 700; font-size: 13px; letter-spacing: 1px; }

        .animate-slide-up { animation: slideUpFade 0.6s ease-out forwards; opacity: 0; transform: translateY(20px); }
        @keyframes slideUpFade { to { opacity: 1; transform: translateY(0); } }
        @keyframes criticalFlash { 0%,100% { opacity: 1; border-color: red; box-shadow: 0 0 20px rgba(255,0,0,0.2); } 50% { opacity: 0.7; border-color: darkred; box-shadow: none; } }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
        .modal-content { background: #121212; width: 90%; max-width: 480px; border-radius: 20px; border: 1px solid #333; overflow: hidden; animation: modalPop 0.3s cubic-bezier(0.175,0.885,0.32,1.275); max-height: 90vh; overflow-y: auto; }
        @keyframes modalPop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .modal-header { display: flex; justify-content: space-between; padding: 20px 25px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .modal-header h3 { margin: 0; font-size: 18px; letter-spacing: 1px; }
        .close-btn { background: none; border: none; color: #777; cursor: pointer; transition: 0.2s; }
        .close-btn:hover { color: white; transform: rotate(90deg); }
        .modal-body { padding: 30px; }
        .modal-center { text-align: center; }
        .btn-primary { background: white; color: black; border: none; padding: 14px 20px; width: 100%; border-radius: 12px; font-weight: 700; margin-top: 20px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary:hover:not(:disabled) { transform: scale(1.02); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-secondary { background: rgba(255,255,255,0.1); color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
        .btn-secondary:hover { background: rgba(255,255,255,0.2); }
        .fuel-btn { background: #ffd60a; color: black; }
        .fuel-amount-input { width: 100%; background: #111; border: 1px solid #333; color: #fff; padding: 12px 14px; border-radius: 10px; font-size: 14px; margin-bottom: 14px; outline: none; box-sizing: border-box; }
        .fuel-amount-input:focus { border-color: #ffd60a; }
        .driver-card { background: #1a1a1a; padding: 20px; border-radius: 16px; display: flex; gap: 20px; align-items: center; text-align: left; border: 1px solid #333; }
        .avatar { width: 44px; height: 44px; border-radius: 50%; background: #333; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; }
        .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
        .chat-input-view { text-align: left; }
        .chat-textarea { width: 100%; background: #222; border: 1px solid #333; border-radius: 12px; padding: 15px; color: white; height: 80px; resize: none; outline: none; font-family: 'Inter', sans-serif; font-size: 13px; box-sizing: border-box; }
        .loader { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #ffd60a; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .mech-list { display: flex; flex-direction: column; gap: 10px; }
        .mech-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; }
        .mech-info h4 { margin: 0 0 5px 0; color: white; }
        .mech-tag { font-size: 10px; background: #222; padding: 4px 8px; border-radius: 6px; color: #888; text-transform: uppercase; }
        .mech-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .dist { font-size: 12px; color: #aaa; }
        .call-btn { color: #4cc9f0; text-decoration: none; font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 6px; background: rgba(76,201,240,0.1); padding: 8px 12px; border-radius: 8px; }
        .panic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .panic-option { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 30px 15px; border-radius: 16px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 10px; transition: 0.3s; }
        .panic-option span { font-weight: 700; font-size: 14px; }
        .panic-option small { font-size: 10px; opacity: 0.5; text-align: center; }
        .panic-option:hover { transform: translateY(-3px); }
        .theft { border-color: #ff006e; color: #ff006e; }
        .theft:hover { background: rgba(255,0,110,0.1); }
        .safety { border-color: #ffd60a; color: #ffd60a; }
        .safety:hover { background: rgba(255,214,10,0.1); }
        .women { border-color: #d633ff; color: #d633ff; }
        .women:hover { background: rgba(214,51,255,0.1); }
        .medical-opt { border-color: #fff; color: #fff; }
        .medical-opt:hover { background: rgba(255,255,255,0.1); }
        .medical-profile-preview { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 18px; text-align: left; margin-bottom: 4px; }
        .preview-label { font-size: 10px; color: #555; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 14px; }
        .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .preview-item { display: flex; flex-direction: column; gap: 3px; }
        .pi-label { font-size: 10px; color: #666; font-weight: 600; letter-spacing: 0.5px; }
        .pi-val { font-size: 14px; font-weight: 600; color: #ddd; }
        .pi-val.blood { color: #ff4d4d; font-size: 18px; font-weight: 800; }
        .pi-val.blue { color: #4cc9f0; }
        .geo-tag-display { display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; background: rgba(255,69,0,0.1); padding: 10px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(255,69,0,0.2); color: #ff4500; }
        .image-upload-box { width: 100%; height: 200px; border: 2px dashed rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; transition: 0.3s; background: rgba(0,0,0,0.3); margin-bottom: 20px; display: block; }
        .image-upload-box:hover { border-color: #ff4500; background: rgba(255,69,0,0.05); }
        .upload-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 10px; color: #888; font-size: 13px; }
        .preview-img { width: 100%; height: 100%; object-fit: cover; }
        .add-mech-form { display: flex; flex-direction: column; gap: 15px; }
        .add-mech-form input, .add-mech-form select { background: #1a1a1a; border: 1px solid #333; color: white; padding: 15px; border-radius: 10px; outline: none; transition: 0.2s; font-family: 'Inter', sans-serif; }
        .add-mech-form input:focus { border-color: #06d6a0; background: #000; }
        .loc-input { display: flex; align-items: center; background: #1a1a1a; border-radius: 10px; padding-right: 15px; border: 1px solid #333; }
        .loc-input input { border: none; flex: 1; }
        .dev-crash-btn { position: fixed; bottom: 20px; right: 20px; opacity: 0.5; z-index: 200; font-size: 11px; padding: 8px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.2s; background: #330000; border: 1px solid red; color: red; }
        .dev-crash-btn:hover { opacity: 1; }
        .dev-crash-active { background: #003300 !important; border-color: #00ff9d !important; color: #00ff9d !important; opacity: 0.8 !important; }
        .flex-center { display: flex; align-items: center; }
        .system-time { display: flex; align-items: center; }

        @media (max-width: 1024px) { .bento-grid { grid-template-columns: 1fr; } .action-stack { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) {
          .content-wrap { padding: 20px 15px 100px 15px; }
          .main-title { font-size: 24px; }
          .hidden-mobile { display: none; }
          .driver-profile { flex-direction: column; text-align: center; gap: 15px; }
          .id-details-grid { grid-template-columns: 1fr 1fr; width: 100%; }
          .med-grid { grid-template-columns: 1fr; gap: 15px; }
          .action-stack { grid-template-columns: 1fr 1fr; gap: 15px; }
          .action-card { flex-direction: column; text-align: center; padding: 15px; gap: 10px; }
          .status-bar { flex-direction: column; text-align: center; }
          .panic-grid { grid-template-columns: 1fr; }
          .helper-banner { flex-wrap: wrap; }
          .preview-grid { grid-template-columns: 1fr; }
          .card-header { flex-wrap: wrap; gap: 8px; }
        }
        .full-span { grid-column: 1 / -1; }
        .full-span-mobile { grid-column: 1 / -1; }
      `}</style>
    </div>
  );
};

export default UserDashboard;