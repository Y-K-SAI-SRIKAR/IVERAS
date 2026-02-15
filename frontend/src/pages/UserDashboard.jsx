import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Fingerprint, ShieldAlert, Zap, MapPin, Phone, 
  Wrench, Siren, PlusCircle, MessageSquare, 
  X, Activity, AlertTriangle, HeartPulse, Clock, CloudRain, Car, UserCheck, Camera, UploadCloud, Send
} from "lucide-react"; 

import BlurText from "../PagesUI/BlurText.jsx";
import LogoutButton from "../PagesUI/LogoutButton.jsx";

/* ================== UTILS ================== */
const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
};

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
const ChatSlidebar = ({ isOpen, onClose, messages }) => {
    return (
        <div className={`chat-slidebar ${isOpen ? 'open' : ''}`}>
            <div className="slidebar-header">
                <h3><MessageSquare size={18}/> MESSAGES</h3>
                <button onClick={onClose}><X size={20}/></button>
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
};


/* ================== MAIN DASHBOARD ================== */
const UserDashboard = () => {
  const [location, setLocation] = useState(null);
  const [activeModal, setActiveModal] = useState(null); 
  const [fuelStatus, setFuelStatus] = useState("idle");
  const [vehicleStatus, setVehicleStatus] = useState("SAFE");
  const [time, setTime] = useState(getCurrentTime());
  const [reportImage, setReportImage] = useState(null); 
  
  // --- CHAT STATES ---
  const [isChatSlidebarOpen, setIsChatSlidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // Array of {sender, text, time}
  const [newMessage, setNewMessage] = useState("");
  const [showChatInput, setShowChatInput] = useState(false); // To toggle input in Fuel Modal

  const navigate = useNavigate();

  // Mock User Data
  const user = {
    name: "RAVI KUMAR",
    id: "IVE-90876",
    vehicle: "TS07 GH 4589",
    model: "HYUNDAI CRETA",
    blood: "B+",
    contact: "+91 98765 43210",
    conditions: "Type-2 Diabetes, Asthma",
    allergies: "Penicillin, Peanuts",
    emergencyContact: "Priya Kumar (Wife) - 9988776655",
  };

  const nearbyMechanics = [
    { id: 1, name: "Suresh Auto Works", type: "Car Repair", dist: "0.8 km", phone: "9988776655" },
    { id: 2, name: "Fast Tyre Fix", type: "Puncture Shop", dist: "1.2 km", phone: "9988001122" },
  ];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
    });

    const timer = setInterval(() => setTime(getCurrentTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => navigate("/");

  // --- Logic Functions ---
  const startFuelSearch = () => {
    setFuelStatus("searching");
    setTimeout(() => setFuelStatus("found"), 2500); 
  };

  const triggerPanic = (type) => {
    let alertMsg = "";
    if (type === "THEFT") alertMsg = `🚨 THEFT ALERT! Vehicle ${user.vehicle} location sent to POLICE CONTROL ROOM.`;
    if (type === "SAFETY") alertMsg = `🆘 SOS! Personal Danger signal sent to Emergency Contacts & Police.`;
    if (type === "WOMEN") alertMsg = `🛡️ WOMEN SAFETY ALERT! Priority signal sent to SHE Team & Nearby Patrol.`;
    
    alert(alertMsg);
    setActiveModal(null);
  };

  const handleAddMechanic = (e) => {
    e.preventDefault();
    alert("Details submitted! Pending Admin Verification.");
    setActiveModal(null);
  };
  
  const handleReportAccident = (e) => {
    e.preventDefault();
    if (!reportImage) {
        alert("Please attach an image of the accident.");
        return;
    }
    alert("Report Sent! AI is analyzing the image for verification. Admin has been notified.");
    setActiveModal(null);
    setReportImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportImage(URL.createObjectURL(file));
    }
  };

  const toggleCrashSimulation = () => {
    setVehicleStatus(prev => prev === "SAFE" ? "ACCIDENT" : "SAFE");
  };

  // --- CHAT LOGIC ---
  const handleSendMessage = () => {
      if(!newMessage.trim()) return;
      
      const msg = { sender: 'You', text: newMessage, time: getCurrentTime() };
      setChatMessages(prev => [...prev, msg]);
      setNewMessage("");
      setShowChatInput(false); // Hide input after sending or keep open if preferred
      alert("Message Broadcasted to Nearby Users!");

      // Simulate a reply for demo purposes
      setTimeout(() => {
          setChatMessages(prev => [...prev, { sender: 'John Doe', text: 'I am 2 mins away with petrol. Stay put.', time: getCurrentTime() }]);
      }, 3000);
  };

  return (
    <div className="dashboard-container">
      
      {/* BACKGROUND */}
      <div className={`bg-static ${vehicleStatus === "ACCIDENT" ? "bg-accident" : ""}`} />

      {/* LOGOUT */}
      <div className="logout-pos">
        <LogoutButton onClick={handleLogout} />
      </div>

      {/* CONTENT */}
      <div className="content-wrap">
        
        {/* HEADER */}
        <div className="header-wrap">
          <div className="header-top">
            <div className="system-time">
              <Clock size={14} style={{marginRight:5}}/> {getCurrentDate()} • {time}
            </div>
            {/* CHAT NOTIFICATION ICON */}
            <div className="chat-notify-icon" onClick={() => setIsChatSlidebarOpen(true)}>
                <MessageSquare size={18} />
                {chatMessages.length > 0 && <span className="badge">{chatMessages.length}</span>}
            </div>
          </div>
          <BlurText text="IVERAS COMMAND CENTER" delay={100} animateBy="letters" direction="top" className="main-title"/>
        </div>

        {/* ================== RESPONSIVE BENTO GRID ================== */}
        <div className="bento-grid">
          
          {/* 1. STATUS BAR */}
          <div className={`bento-card full-width status-bar ${vehicleStatus === "ACCIDENT" ? "status-critical" : "status-safe"} animate-slide-up`}>
              <div className="status-content">
                {vehicleStatus === "SAFE" ? (
                  <>
                    <div className="ecg-line"></div>
                    <Activity size={20} className="pulse-icon" />
                    <span className="status-text">SYSTEM STATUS: <strong style={{color:'#00ff9d'}}>NORMAL</strong></span>
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

          {/* 2. EXPANDED IDENTITY BLADE */}
          <div className="bento-card full-width id-blade-container animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="id-section driver-profile">
              <div className="id-photo-wrapper">
                <div className="id-photo">
                  <span className="initials">{user.name.charAt(0)}</span>
                </div>
                <div className="live-badge"></div>
              </div>
              <div className="id-details-grid">
                <div className="detail-group">
                  <span className="label">OPERATOR</span>
                  <h3>{user.name}</h3>
                </div>
                <div className="detail-group">
                  <span className="label">USER ID</span>
                  <p className="mono">{user.id}</p>
                </div>
                <div className="detail-group">
                  <span className="label">VEHICLE NO</span>
                  <p className="mono highlight">{user.vehicle}</p>
                </div>
                <div className="detail-group">
                  <span className="label">MODEL</span>
                  <p>{user.model}</p>
                </div>
              </div>
              <div className="id-icon hidden-mobile"><Fingerprint size={80} strokeWidth={0.5} /></div>
            </div>

            <div className="id-section medical-profile">
               <div className="med-badge"><HeartPulse size={14} /> MEDICAL ID</div>
               <div className="med-grid">
                  <div className="med-item highlight-red">
                    <span className="label">BLOOD GRP</span>
                    <p className="blood-text">{user.blood}</p>
                  </div>
                  <div className="med-item">
                    <span className="label">CONDITIONS</span>
                    <p className="val-text">{user.conditions}</p>
                  </div>
                  <div className="med-item">
                    <span className="label">ALLERGIES</span>
                    <p className="val-text">{user.allergies}</p>
                  </div>
                  <div className="med-item">
                    <span className="label">EMERGENCY CONTACT</span>
                    <p className="contact-text">{user.emergencyContact}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* 3. MAP MODULE */}
          <div className={`bento-card map-card animate-slide-up ${vehicleStatus === "ACCIDENT" ? "map-alert" : ""}`} style={{animationDelay: '0.2s'}}>
            <div className="card-header">
              <div className="flex-center">
                 <MapPin size={16} color="#4cc9f0"/> 
                 <span style={{marginLeft:8, fontWeight:600}}>LIVE TRACKING</span>
              </div>
              <div className="flex-center" style={{gap: 10}}>
                <div className="weather-widget">
                   <CloudRain size={12} /> 28°C
                </div>
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
                </div>
              )}
            </div>
          </div>

          {/* 4. ACTION MODULES */}
          <div className="action-stack animate-slide-up" style={{animationDelay: '0.3s'}}>
            
            {/* REPORT ACCIDENT BUTTON */}
            <div className="bento-card action-card report-accident hover-effect full-span-mobile" onClick={() => setActiveModal('report')}>
              <div className="icon-box"><Camera size={24} /></div>
              <div className="text-box">
                <h3>REPORT ACCIDENT</h3>
                <p>Found a crash? Report here.</p>
              </div>
              <div className="card-glow" style={{background: '#ff4500'}}></div>
            </div>

            <div className="bento-card action-card fuel hover-effect" onClick={() => { setActiveModal('fuel'); setFuelStatus('idle'); setShowChatInput(false); }}>
              <div className="icon-box"><Zap size={24} /></div>
              <div className="text-box">
                <h3>FUEL ASSIST</h3>
                <p>Community Help</p>
              </div>
              <div className="card-glow" style={{background: '#ffd60a'}}></div>
            </div>

            <div className="bento-card action-card mech hover-effect" onClick={() => setActiveModal('mechanic')}>
              <div className="icon-box"><Wrench size={24} /></div>
              <div className="text-box">
                <h3>ROAD SUPPORT</h3>
                <p>Find Mechanics</p>
              </div>
              <div className="card-glow" style={{background: '#4cc9f0'}}></div>
            </div>

            <div className="bento-card action-card panic hover-effect" onClick={() => setActiveModal('panic')}>
              <div className="icon-box pulse-red"><ShieldAlert size={24} /></div>
              <div className="text-box">
                <h3>PANIC MODE</h3>
                <p>Theft, Safety, Women</p>
              </div>
              <div className="card-glow" style={{background: '#ff006e'}}></div>
            </div>

            <div className="bento-card action-card medical hover-effect" onClick={() => setActiveModal('medical')}>
               <div className="icon-box"><Siren size={24} /></div>
               <div className="text-box">
                 <h3>MEDICAL / RESCUE</h3>
                 <p>Ambulance</p>
               </div>
               <div className="card-glow" style={{background: '#ffffff'}}></div>
            </div>
          </div>

          {/* 5. ADD MECHANIC */}
          <div className="bento-card full-width contribute-bar hover-effect animate-slide-up" style={{animationDelay: '0.4s'}} onClick={() => setActiveModal('addMech')}>
            <div className="contribute-content">
              <PlusCircle size={20} color="#06d6a0" />
              <span>KNOW A GOOD MECHANIC? ADD TO DATABASE</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* SIDEBAR */}
      <ChatSlidebar isOpen={isChatSlidebarOpen} onClose={() => setIsChatSlidebarOpen(false)} messages={chatMessages} />

      {/* DEV BUTTON */}
      <button onClick={toggleCrashSimulation} className="dev-crash-btn">
        [DEV] CRASH
      </button>

      {/* ================== MODALS ================== */ }

      {/* REPORT ACCIDENT MODAL */}
      <GlassModal isOpen={activeModal === 'report'} onClose={() => {setActiveModal(null); setReportImage(null)}} title="REPORT ROAD ACCIDENT" color="#ff4500">
        <div className="modal-center">
            <p style={{marginBottom: 15, fontSize: 13, opacity: 0.8}}>
                You are reporting an accident at your current location. 
                <br/><strong>AI will verify the image for authenticity.</strong>
            </p>
            <div className="geo-tag-display">
                <MapPin size={16} color="#ff4500" />
                <span>
                    GEO-TAG: {location ? `${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}` : "Fetching GPS..."}
                </span>
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
            <button className="btn-primary" style={{background: '#ff4500', color: 'white'}} onClick={handleReportAccident}>
                <UploadCloud size={18} style={{marginRight: 8}}/> SUBMIT REPORT
            </button>
        </div>
      </GlassModal>
      
      {/* FUEL MODAL (UPDATED) */}
      <GlassModal isOpen={activeModal === 'fuel'} onClose={() => setActiveModal(null)} title="FUEL ASSISTANCE" color="#ffd60a">
        {fuelStatus === 'idle' && (
          <div className="modal-center">
            <p>Requesting 2 Litres of Petrol/Diesel from nearby community drivers.</p>
            <button className="btn-primary fuel-btn" onClick={startFuelSearch}>BROADCAST REQUEST</button>
          </div>
        )}
        {fuelStatus === 'searching' && (
          <div className="modal-center">
              <div className="loader"></div>
              <p>Scanning 2km radius for active drivers...</p>
          </div>
        )}
        {fuelStatus === 'found' && (
          <div className="driver-found">
            {!showChatInput ? (
                <>
                    <div className="driver-card">
                        <div className="avatar">JD</div>
                        <div><h4>John Doe</h4><p>2 mins away • Can spare 1L</p></div>
                    </div>
                    <div className="modal-actions">
                        {/* OPEN CHAT INPUT IN MODAL */}
                        <button className="btn-secondary" onClick={() => setShowChatInput(true)}><MessageSquare size={16}/> Leave Message</button>
                        <button className="btn-primary" onClick={() => alert("Contact Shared")}>View Contact</button>
                    </div>
                </>
            ) : (
                /* CHAT INPUT VIEW */
                <div className="chat-input-view">
                    <p style={{marginBottom: 10, fontSize: 13, color: '#ccc'}}>Broadcast a message to nearby helpers:</p>
                    <textarea 
                        className="chat-textarea" 
                        placeholder="Ex: I'm in a red Creta near the junction..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    ></textarea>
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
          {nearbyMechanics.map(m => (
            <div key={m.id} className="mech-item">
              <div className="mech-info"><h4>{m.name}</h4><span className="mech-tag">{m.type}</span></div>
              <div className="mech-meta">
                <span className="dist">{m.dist}</span>
                <a href={`tel:${m.phone}`} className="call-btn"><Phone size={14}/> {m.phone}</a>
              </div>
            </div>
          ))}
        </div>
      </GlassModal>

      {/* PANIC MODAL - UPDATED */}
      <GlassModal isOpen={activeModal === 'panic'} onClose={() => setActiveModal(null)} title="EMERGENCY TYPE" color="#ff006e">
        <div className="panic-grid">
          <button className="panic-option theft" onClick={() => triggerPanic('THEFT')}>
            <Car size={28} /><span>VEHICLE THEFT</span><small>Track Location</small>
          </button>
          <button className="panic-option safety" onClick={() => triggerPanic('SAFETY')}>
            <ShieldAlert size={28} /><span>PERSONAL DANGER</span><small>SOS Rescue</small>
          </button>
          <button className="panic-option women full-span" onClick={() => triggerPanic('WOMEN')}>
            <UserCheck size={28} /><span>WOMEN SAFETY</span><small>Priority Alert to Police</small>
          </button>
        </div>
      </GlassModal>

      {/* MEDICAL MODAL */}
      <GlassModal isOpen={activeModal === 'medical'} onClose={() => setActiveModal(null)} title="MEDICAL / RESCUE" color="#fff">
        <div className="modal-center">
           <p style={{marginBottom: 20, opacity: 0.7}}>Use this only for Medical Emergencies. Ambulance will be dispatched to current coordinates.</p>
           <button className="panic-option medical-opt" style={{width: '100%'}} onClick={() => alert("Ambulance Dispatched")}>
             <Siren size={32} /><span>HEALTH EMERGENCY</span><small>Heart Attack / Trauma / Accident</small>
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

      <style>
        {`
        /* ================== GLOBAL & FONTS ================== */
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;600;800&display=swap');

        /* ================== SCROLL FIX ================== */
        .dashboard-container {
          /* Force fixed size to ensure scroll works everywhere */
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow-y: auto; /* Internal scrolling */
          overflow-x: hidden;
          font-family: 'Inter', sans-serif;
          color: white;
        }

        .bg-static {
          position: fixed; inset: 0; z-index: -1;
          background: radial-gradient(circle at center, #2a2a2a 0%, #111111 100%);
          transition: background 0.5s ease;
        }
        .bg-accident {
          background: radial-gradient(circle at center, #660000 0%, #220000 100%);
        }

        .logout-pos {
          position: fixed; top: 20px; right: 20px; z-index: 100;
        }

        .content-wrap {
          position: relative;
          z-index: 2;
          padding: 40px 20px 80px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-wrap { margin-bottom: 30px; text-align: center; }
        .header-top { display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 10px; opacity: 0.8; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
        .main-title { font-family: 'Inter', sans-serif; font-weight: 900; letter-spacing: -1px; }

        /* CHAT SLIDEBAR */
        .chat-notify-icon { cursor: pointer; position: relative; background: rgba(255,255,255,0.1); padding: 5px; border-radius: 8px; transition: 0.2s; }
        .chat-notify-icon:hover { background: rgba(255,255,255,0.2); }
        .badge { position: absolute; top: -5px; right: -5px; background: #ff0050; color: white; font-size: 9px; width: 14px; height: 14px; border-radius: 50%; display: flex; alignItems: center; justify-content: center; font-weight: bold; }
        
        .chat-slidebar { position: fixed; top: 0; right: 0; bottom: 0; width: 300px; background: #121212; border-left: 1px solid #333; z-index: 2000; transform: translateX(100%); transition: transform 0.3s ease; display: flex; flex-direction: column; }
        .chat-slidebar.open { transform: translateX(0); }
        .slidebar-header { padding: 20px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .slidebar-header h3 { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 16px; }
        .slidebar-header button { background: none; border: none; color: #777; cursor: pointer; }
        .slidebar-body { padding: 20px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .no-msg { text-align: center; color: #555; margin-top: 50px; font-size: 13px; }
        
        .msg-bubble { padding: 10px 14px; border-radius: 12px; max-width: 85%; font-size: 13px; line-height: 1.4; position: relative; }
        .msg-bubble.sent { align-self: flex-end; background: #2a2a2a; border: 1px solid #444; color: #ddd; border-bottom-right-radius: 2px; }
        .msg-bubble.received { align-self: flex-start; background: rgba(255, 214, 10, 0.1); border: 1px solid rgba(255, 214, 10, 0.2); color: #ffd60a; border-bottom-left-radius: 2px; }
        .msg-sender { font-size: 9px; opacity: 0.7; display: block; margin-bottom: 2px; font-weight: bold; }
        .msg-time { font-size: 9px; opacity: 0.4; display: block; text-align: right; margin-top: 4px; }

        /* ================== RESPONSIVE GRID ================== */
        .bento-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr; /* Desktop default */
          grid-gap: 24px;
        }

        .bento-card {
          background: rgba(15, 15, 20, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          padding: 24px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          transition: all 0.3s ease;
        }

        .full-width { grid-column: 1 / -1; }
        .map-card { min-height: 320px; display: flex; flex-direction: column; }
        .action-stack { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        /* ================== STATUS BAR ================== */
        .status-bar { padding: 15px; display: flex; align-items: center; justify-content: center; }
        .status-safe { background: linear-gradient(90deg, rgba(0, 255, 157, 0.05), rgba(0, 255, 157, 0.15), rgba(0, 255, 157, 0.05)); border-color: rgba(0, 255, 157, 0.3); color: #e0fff4; }
        .status-critical { background: rgba(255, 0, 0, 0.2); border-color: red; color: #ffcccc; animation: criticalFlash 1s infinite; }
        
        .status-content { display: flex; align-items: center; gap: 12px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; font-size: 14px; position: relative; width: 100%; justify-content: center; }
        .ecg-line { position: absolute; left: 0; bottom: -15px; height: 2px; width: 100%; background: linear-gradient(90deg, transparent 0%, #00ff9d 50%, transparent 100%); opacity: 0.3; }

        /* ================== ID BLADE ================== */
        .id-blade-container { padding: 0; display: flex; flex-direction: column; background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); }
        .id-section { padding: 25px 30px; position: relative; }
        
        .driver-profile { display: flex; align-items: center; gap: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .id-photo { width: 80px; height: 80px; border-radius: 50%; background: #2a2a2a; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.1); box-shadow: 0 0 20px rgba(0,0,0,0.5); }
        .initials { font-size: 28px; font-weight: 800; color: #fff; }
        .live-badge { position: absolute; bottom: 5px; right: 5px; width: 14px; height: 14px; background: #00ff9d; border-radius: 50%; border: 3px solid #1a1a1a; box-shadow: 0 0 10px #00ff9d; }

        .id-details-grid { flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .detail-group .label { font-size: 11px; color: #888; display: block; margin-bottom: 4px; font-weight: 600; letter-spacing: 1px; }
        .detail-group h3 { margin: 0; font-size: 18px; font-weight: 700; color: white; }
        .detail-group p { margin: 0; font-size: 15px; color: #ddd; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .highlight { color: #4cc9f0; text-shadow: 0 0 15px rgba(76, 201, 240, 0.4); }
        .id-icon { opacity: 0.1; color: white; }

        .medical-profile { background: linear-gradient(90deg, rgba(255, 0, 80, 0.1) 0%, transparent 100%); }
        .med-badge { display: inline-flex; align-items: center; gap: 6px; background: #ff0050; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; margin-bottom: 18px; box-shadow: 0 5px 15px rgba(255, 0, 80, 0.4); }
        .med-grid { display: grid; grid-template-columns: 1fr 2fr 2fr 2fr; gap: 20px; }
        .med-item .label { font-size: 10px; color: #ff8fa3; display: block; margin-bottom: 4px; font-weight: 700; letter-spacing: 0.5px; }
        .blood-text { font-size: 22px; font-weight: 800; color: #ff4d4d; margin: 0; }
        .val-text { color: #fff; margin: 0; font-size: 14px; }
        .contact-text { color: #4cc9f0; font-weight: 600; margin: 0; font-size: 14px; }

        /* ================== MAP CARD ================== */
        .card-header { display: flex; justify-content: space-between; margin-bottom: 15px; color: #eee; font-size: 14px; }
        .weather-widget { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #ccc; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 12px; }
        .map-frame { flex: 1; border-radius: 16px; overflow: hidden; background: #000; position: relative; box-shadow: inset 0 0 20px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.1); }
        .map-frame iframe { width: 100%; height: 100%; border: none; filter: invert(90%) hue-rotate(180deg) contrast(1.2); }
        .radar-scan { position: absolute; top: 50%; left: 50%; width: 300px; height: 300px; transform: translate(-50%, -50%); border-radius: 50%; border: 1px solid rgba(76, 201, 240, 0.3); background: conic-gradient(from 0deg, transparent 0%, rgba(76, 201, 240, 0.1) 100%); animation: scan 4s infinite linear; pointer-events: none; }
        @keyframes scan { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        .accident-overlay { position: absolute; inset: 0; background: rgba(50, 0, 0, 0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: bold; letter-spacing: 2px; backdrop-filter: blur(4px); z-index: 10; }
        .radar-ping { width: 60px; height: 60px; border-radius: 50%; background: #ff0000; animation: ping 1.5s infinite ease-out; margin-bottom: 15px; box-shadow: 0 0 30px #ff0000; }
        @keyframes ping { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }

        /* ================== ACTION CARDS ================== */
        .action-card { display: flex; align-items: center; gap: 18px; cursor: pointer; position: relative; padding: 25px; }
        .icon-box { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .report-accident { grid-column: 1 / -1; border-color: rgba(255, 69, 0, 0.5); background: rgba(255, 69, 0, 0.1); }
        .report-accident .icon-box { background: #ff4500; color: white; box-shadow: 0 0 15px #ff4500; }
        .fuel .icon-box { color: #ffd60a; background: rgba(255, 214, 10, 0.15); border: 1px solid rgba(255, 214, 10, 0.3); }
        .mech .icon-box { color: #4cc9f0; background: rgba(76, 201, 240, 0.15); border: 1px solid rgba(76, 201, 240, 0.3); }
        .panic .icon-box { color: #ff006e; background: rgba(255, 0, 110, 0.15); border: 1px solid rgba(255, 0, 110, 0.3); }
        .medical .icon-box { color: #ffffff; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); }
        .text-box h3 { margin: 0; font-size: 16px; font-weight: 700; color: white; margin-bottom: 4px; }
        .text-box p { margin: 0; font-size: 12px; color: #aaa; }
        .card-glow { position: absolute; right: 0; top: 0; width: 60px; height: 60px; border-radius: 50%; filter: blur(40px); opacity: 0.15; pointer-events: none; }
        .pulse-red { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 0, 110, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(255, 0, 110, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 0, 110, 0); } }

        /* ================== CONTRIBUTE BAR ================== */
        .contribute-bar { display: flex; justify-content: center; align-items: center; cursor: pointer; background: rgba(6, 214, 160, 0.08); border: 1px dashed rgba(6, 214, 160, 0.4); padding: 15px; }
        .contribute-content { display: flex; align-items: center; gap: 10px; color: #06d6a0; font-weight: 700; font-size: 13px; letter-spacing: 1px; }

        /* ================== ANIMATIONS & MODAL ================== */
        .animate-slide-up { animation: slideUpFade 0.6s ease-out forwards; opacity: 0; transform: translateY(20px); }
        @keyframes slideUpFade { to { opacity: 1; transform: translateY(0); } }
        @keyframes criticalFlash { 0%, 100% { opacity: 1; border-color: red; box-shadow: 0 0 20px rgba(255,0,0,0.2); } 50% { opacity: 0.7; border-color: darkred; box-shadow: none; } }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
        .modal-content { background: #121212; width: 90%; max-width: 480px; border-radius: 20px; border: 1px solid #333; overflow: hidden; animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes modalPop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .modal-header { display: flex; justify-content: space-between; padding: 20px 25px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .modal-header h3 { margin: 0; font-size: 18px; letter-spacing: 1px; font-family: 'Inter', sans-serif; }
        .close-btn { background: none; border: none; color: #777; cursor: pointer; transition: 0.2s; }
        .close-btn:hover { color: white; transform: rotate(90deg); }
        .modal-body { padding: 30px; }
        .modal-center { text-align: center; }

        .btn-primary { background: white; color: black; border: none; padding: 14px 20px; width: 100%; border-radius: 12px; font-weight: 700; margin-top: 20px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-primary:hover { transform: scale(1.02); }
        .btn-secondary { background: rgba(255,255,255,0.1); color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
        .btn-secondary:hover { background: rgba(255,255,255,0.2); }
        .fuel-btn { background: #ffd60a; color: black; }
        
        .driver-card { background: #1a1a1a; padding: 20px; border-radius: 16px; display: flex; gap: 20px; align-items: center; text-align: left; border: 1px solid #333; }
        .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
        
        .chat-input-view { text-align: left; }
        .chat-textarea { width: 100%; background: #222; border: 1px solid #333; border-radius: 12px; padding: 15px; color: white; height: 80px; resize: none; outline: none; font-family: 'Inter', sans-serif; font-size: 13px; }
        .chat-textarea:focus { border-color: #ffd60a; }

        .mech-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; margin-bottom: 10px; }
        .mech-info h4 { margin: 0 0 5px 0; color: white; }
        .mech-tag { font-size: 10px; background: #222; padding: 4px 8px; border-radius: 6px; color: #888; text-transform: uppercase; }
        .call-btn { color: #4cc9f0; text-decoration: none; font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 6px; background: rgba(76, 201, 240, 0.1); padding: 8px 12px; border-radius: 8px; }
        
        .panic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .panic-option { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 30px 15px; border-radius: 16px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 15px; transition: 0.3s; }
        .panic-option:hover { transform: translateY(-3px); }
        .theft { border-color: #ff006e; color: #ff006e; }
        .theft:hover { background: rgba(255, 0, 110, 0.1); box-shadow: 0 0 20px rgba(255,0,110,0.2); }
        .safety { border-color: #ffd60a; color: #ffd60a; }
        .safety:hover { background: rgba(255, 214, 10, 0.1); box-shadow: 0 0 20px rgba(255,214,10,0.2); }
        .women { border-color: #d633ff; color: #d633ff; }
        .women:hover { background: rgba(214, 51, 255, 0.1); box-shadow: 0 0 20px rgba(214,51,255,0.2); }
        .medical-opt { border-color: #fff; color: #fff; }
        .medical-opt:hover { background: rgba(255,255,255,0.1); }
        
        /* Report Modal Styles */
        .geo-tag-display { display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; background: rgba(255, 69, 0, 0.1); padding: 10px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(255, 69, 0, 0.2); color: #ff4500; }
        .image-upload-box { width: 100%; height: 200px; border: 2px dashed rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; transition: 0.3s; background: rgba(0,0,0,0.3); margin-bottom: 20px; }
        .image-upload-box:hover { border-color: #ff4500; background: rgba(255, 69, 0, 0.05); }
        .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 10px; color: #888; font-size: 13px; }
        .preview-img { width: 100%; height: 100%; object-fit: cover; }
        
        .add-mech-form { display: flex; flex-direction: column; gap: 15px; }
        .add-mech-form input, .add-mech-form select { background: #1a1a1a; border: 1px solid #333; color: white; padding: 15px; border-radius: 10px; outline: none; transition: 0.2s; font-family: 'Inter', sans-serif; }
        .add-mech-form input:focus { border-color: #06d6a0; background: #000; }
        .loc-input { display: flex; align-items: center; background: #1a1a1a; border-radius: 10px; padding-right: 15px; border: 1px solid #333; }
        .loc-input input { border: none; flex: 1; }

        .dev-crash-btn { position: fixed; bottom: 20px; right: 20px; opacity: 0.4; z-index: 200; font-size: 11px; padding: 8px 12px; background: #330000; border: 1px solid red; color: red; cursor: pointer; border-radius: 6px; font-weight: bold; }
        .dev-crash-btn:hover { opacity: 1; }

        @media (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
          .action-stack {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .content-wrap {
            padding: 20px 15px 100px 15px;
          }
          .main-title {
            font-size: 24px;
          }
          .hidden-mobile {
            display: none;
          }
          .driver-profile {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }
          .id-details-grid {
            grid-template-columns: 1fr 1fr;
            width: 100%;
          }
          .med-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .action-stack {
            grid-template-columns: 1fr 1fr; 
            gap: 15px;
          }
          .action-card {
            flex-direction: column;
            text-align: center;
            padding: 15px;
            gap: 10px;
          }
          .status-bar {
             flex-direction: column;
             text-align: center;
          }
          .panic-grid {
             grid-template-columns: 1fr;
          }
          .full-span {
             grid-column: 1 / -1;
          }
          .full-span-mobile {
             grid-column: 1 / -1;
          }
        }
        
        .full-span {
           grid-column: 1 / -1;
        }
        `}
      </style>
    </div>
  );
};

export default UserDashboard;