import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { 
  Shield, User, Zap, Terminal, Wifi, Navigation, Disc, Sparkles, X, 
  Activity, WifiOff, Pause, Play, ChevronRight
} from 'lucide-react';

/* ================= CONFIGURATION ================= */
const DEMO_GIF = "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif"; 
const API_KEY = ""; // Use your Gemini API Key here
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

const SCENARIOS = [
  { id: 1, label: 'Pedestrian', confidence: 0.98, type: 'critical', reaction: 'CRITICAL: Pedestrian in path. Emergency braking.', color: '#ff4d4d', bg: 'rgba(255, 77, 77, 0.2)', speedChange: -20, icon: <User size={24} color="#ff4d4d" /> },
  { id: 2, label: 'Stop Sign', confidence: 0.99, type: 'warning', reaction: 'Traffic Control detected. Decelerating.', color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.2)', speedChange: -15, icon: <Disc size={24} color="#ffaa00" /> },
  { id: 3, label: 'Green Light', confidence: 0.95, type: 'success', reaction: 'Intersection clear. Proceeding.', color: '#00ff9d', bg: 'rgba(0, 255, 157, 0.2)', speedChange: 0, icon: <Zap size={24} color="#00ff9d" /> },
  { id: 4, label: 'Vehicle (Lead)', confidence: 0.88, type: 'neutral', reaction: 'Lead vehicle identified. Engaging ACC.', color: '#00ccff', bg: 'rgba(0, 204, 255, 0.2)', speedChange: 0, icon: <Navigation size={24} color="#00ccff" /> }
];

/* ================= COMPONENT ================= */
export default function AmbulanceStream() {
  const [searchParams] = useSearchParams();
  const originalStreamUrl = searchParams.get('url'); 

  const [streamSource, setStreamSource] = useState(originalStreamUrl || DEMO_GIF);
  const [isSimulation, setIsSimulation] = useState(!originalStreamUrl); 
  const [isLive, setIsLive] = useState(true);
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[2]);
  const [logs, setLogs] = useState([]);
  const [speed, setSpeed] = useState(45);
  const [steering, setSteering] = useState(0);
  const [boxPos, setBoxPos] = useState({ x: 50, y: 40, w: 15, h: 25 });
  const [viewMode, setViewMode] = useState('SYSTEM');
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([{ role: 'model', text: "IVERAS Vision Online. Systems Nominal." }]);
  const chatEndRef = useRef(null);

  const handleStreamError = () => { if (!isSimulation) { setIsSimulation(true); setStreamSource(DEMO_GIF); } };

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const rand = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      setActiveScenario(rand);
      setBoxPos({ x: Math.random() * 40 + 20, y: Math.random() * 20 + 30, w: 15, h: 25 });
      setSpeed(prev => Math.max(0, Math.min(100, prev + rand.speedChange + (Math.random() * 4 - 2))));
      setSteering((Math.random() * 10 - 5).toFixed(1));
      setLogs(prev => [{ time: new Date().toLocaleTimeString(), message: `${rand.label} Detected.`, type: rand.type }, ...prev].slice(0, 8));
    }, 4000);
    return () => clearInterval(interval);
  }, [isLive]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatHistory([...chatHistory, { role: 'user', text: chatInput }, { role: 'model', text: "Analyzing telemetry... Speed stable at " + speed.toFixed(0) + " km/h." }]);
    setChatInput("");
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={styles.logoBox}><Navigation size={24} color="white" /></div>
          <div>
            <h1 style={styles.title}>IVERAS <span style={{ color: '#818cf8' }}>VISION</span></h1>
            <p style={styles.statusText}>
              <span style={{ ...styles.dot, backgroundColor: isSimulation ? '#f59e0b' : '#10b981' }}></span>
              {isSimulation ? "SIMULATION MODE" : "LIVE FEED"}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setViewMode(viewMode === 'SYSTEM' ? 'COPILOT' : 'SYSTEM')} style={styles.btnToggle}>
            {viewMode === 'SYSTEM' ? 'SWITCH TO AI' : 'SWITCH TO SYSTEM'}
          </button>
          <button onClick={() => setIsLive(!isLive)} style={isLive ? styles.btnPause : styles.btnPlay}>
            {isLive ? 'PAUSE' : 'RESUME'}
          </button>
        </div>
      </nav>

      <main style={styles.main}>
        {/* VIDEO PANEL */}
        <div style={styles.videoPanel}>
          <div style={styles.hudTop}>
             <span style={styles.recBadge}>{isSimulation ? 'DEMO' : 'LIVE'}</span>
             <span style={styles.camLabel}>FRONT_CAM_01</span>
          </div>
          <img src={streamSource} alt="Stream" style={styles.videoImg} onError={handleStreamError} />
          
          {/* AI BOUNDING BOX */}
          {isLive && (
            <div style={{ ...styles.boundingBox, left: `${boxPos.x}%`, top: `${boxPos.y}%`, width: `${boxPos.w}%`, height: `${boxPos.h}%`, borderColor: activeScenario.color }}>
              <div style={{ ...styles.boxLabel, backgroundColor: activeScenario.color }}>{activeScenario.label}</div>
            </div>
          )}

          <div style={styles.hudBottom}>
            <div style={{ display: 'flex', gap: 40 }}>
              <div><div style={styles.unitLabel}>SPEED</div><div style={styles.unitVal}>{speed.toFixed(0)} <small>KM/H</small></div></div>
              <div><div style={styles.unitLabel}>STEER</div><div style={styles.unitVal}>{steering}°</div></div>
            </div>
          </div>
        </div>

        {/* SIDE PANEL */}
        <div style={styles.sidePanel}>
          {viewMode === 'SYSTEM' ? (
            <>
              <div style={styles.card}>
                <div style={{ ...styles.iconCircle, borderColor: activeScenario.color }}>{activeScenario.icon}</div>
                <h3 style={{ fontSize: 24, margin: '10px 0' }}>{activeScenario.label}</h3>
                <div style={styles.actionBox}>{activeScenario.reaction}</div>
              </div>
              <div style={{ ...styles.card, flex: 1, overflowY: 'auto' }}>
                <h4 style={styles.unitLabel}>SYSTEM LOGS</h4>
                {logs.map((l, i) => (
                  <div key={i} style={styles.logItem}>
                    <span style={{ color: '#666' }}>{l.time}</span> {l.message}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={styles.card}>
              <h3 style={{ color: '#818cf8' }}>AI Co-Pilot</h3>
              <div style={styles.chatBox}>
                {chatHistory.map((m, i) => (
                  <div key={i} style={{ ...styles.chatMsg, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#4f46e5' : '#1e293b' }}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} style={styles.input} placeholder="Ask AI..." />
                <button onClick={handleSendMessage} style={styles.btnSend}><ChevronRight size={18} /></button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: { height: '100vh', background: '#000', color: '#fff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' },
  nav: { padding: '15px 30px', background: '#0a0a0c', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoBox: { width: 40, height: 40, background: '#4f46e5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, margin: 0, fontWeight: 'bold' },
  statusText: { fontSize: 11, color: '#888', margin: 0, display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: '50%' },
  main: { flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '1fr 350px', gap: 20 },
  videoPanel: { background: '#050505', borderRadius: 15, position: 'relative', overflow: 'hidden', border: '1px solid #222' },
  videoImg: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 },
  hudTop: { position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', gap: 10 },
  recBadge: { background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold' },
  camLabel: { color: '#22d3ee', fontSize: 12, fontFamily: 'monospace' },
  hudBottom: { position: 'absolute', bottom: 20, left: 20, zIndex: 10 },
  unitLabel: { fontSize: 10, color: '#888', fontWeight: 'bold' },
  unitVal: { fontSize: 36, fontWeight: 'bold' },
  boundingBox: { position: 'absolute', border: '2px solid', zIndex: 5, pointerEvents: 'none' },
  boxLabel: { position: 'absolute', top: -25, left: 0, padding: '2px 8px', fontSize: 10, color: 'white', fontWeight: 'bold' },
  sidePanel: { display: 'flex', flexDirection: 'column', gap: 20 },
  card: { background: '#0f172a', borderRadius: 15, padding: 20, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column' },
  iconCircle: { width: 60, height: 60, borderRadius: '50%', border: '3px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
  actionBox: { background: '#000', padding: 10, borderRadius: 8, fontSize: 12, color: '#ccc', fontFamily: 'monospace' },
  logItem: { fontSize: 10, borderBottom: '1px solid #1e293b', padding: '5px 0' },
  btnToggle: { background: '#1e293b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: 6, fontSize: 11, cursor: 'pointer' },
  btnPause: { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 15px', borderRadius: 6, fontSize: 11, cursor: 'pointer' },
  btnPlay: { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', padding: '8px 15px', borderRadius: 6, fontSize: 11, cursor: 'pointer' },
  chatBox: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10, margin: '15px 0', overflowY: 'auto' },
  chatMsg: { padding: '8px 12px', borderRadius: 10, fontSize: 12, maxWidth: '85%' },
  input: { flex: 1, background: '#000', border: '1px solid #333', color: 'white', padding: 8, borderRadius: 6, fontSize: 12 },
  btnSend: { background: '#4f46e5', border: 'none', color: 'white', padding: 8, borderRadius: 6, cursor: 'pointer' }
};