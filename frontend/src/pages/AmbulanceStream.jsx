import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { 
  Shield, User, Zap, Terminal, Wifi, Navigation, Disc, Sparkles, X, Activity, WifiOff
} from 'lucide-react';

// --- Configuration ---
// If no real camera URL is found, it plays this GIF so the demo looks cool
const DEMO_GIF = "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif"; 

// Mock Data for the AI Side Panel
const SCENARIOS = [
  { id: 1, label: 'Pedestrian', confidence: 0.98, type: 'critical', reaction: 'CRITICAL: Pedestrian in path. Emergency braking.', color: 'border-red-500', bg: 'bg-red-500/20', speedChange: -20, icon: <User className="w-6 h-6 text-red-400" /> },
  { id: 2, label: 'Stop Sign', confidence: 0.99, type: 'warning', reaction: 'Traffic Control detected. Decelerating.', color: 'border-red-500', bg: 'bg-red-500/20', speedChange: -15, icon: <Disc className="w-6 h-6 text-red-500" /> },
  { id: 3, label: 'Green Light', confidence: 0.95, type: 'success', reaction: 'Intersection clear. Proceeding.', color: 'border-emerald-500', bg: 'bg-emerald-500/20', speedChange: 0, icon: <Zap className="w-6 h-6 text-emerald-400" /> },
  { id: 4, label: 'Vehicle (Lead)', confidence: 0.88, type: 'neutral', reaction: 'Lead vehicle identified. Engaging ACC.', color: 'border-blue-500', bg: 'bg-blue-500/20', speedChange: 0, icon: <Navigation className="w-6 h-6 text-blue-400" /> }
];

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden ${className}`}>{children}</div>
);

export default function AmbulanceStream() {
  const [searchParams] = useSearchParams();
  
  // 1. Get the URL passed from Admin Dashboard
  const originalStreamUrl = searchParams.get('url'); 
  
  // 2. State to manage the video source
  const [streamSource, setStreamSource] = useState(originalStreamUrl || DEMO_GIF);
  const [isSimulation, setIsSimulation] = useState(!originalStreamUrl); 

  // Simulation State (Speed, Steering, etc.)
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[2]);
  const [isLive, setIsLive] = useState(true);
  const [logs, setLogs] = useState([]);
  const [speed, setSpeed] = useState(45);
  const [steering, setSteering] = useState(0);
  const [boxPos, setBoxPos] = useState({ x: 50, y: 50, w: 20, h: 30 });
  const [viewMode, setViewMode] = useState('SYSTEM');

  // If the real camera fails (timeout), switch to Demo GIF automatically
  const handleStreamError = () => {
    if (!isSimulation) {
      console.warn("Real camera offline. Switching to Simulation Mode.");
      setIsSimulation(true);
      setStreamSource(DEMO_GIF); 
    }
  };

  // Telemetry Loop
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      setActiveScenario(randomScenario);
      setBoxPos({ x: Math.random() * 40 + 30, y: Math.random() * 30 + 30, w: Math.random() * 15 + 10, h: Math.random() * 20 + 20 });
      setSpeed(prev => Math.max(0, Math.min(100, prev + randomScenario.speedChange + (Math.random() * 4 - 2))));
      setSteering((Math.random() * 10 - 5).toFixed(1));
      const newLog = { time: new Date().toLocaleTimeString(), message: `${randomScenario.label} Detected. ${randomScenario.reaction.split('.')[0]}`, type: randomScenario.type };
      setLogs(prev => [newLog, ...prev].slice(0, 10));
    }, 4000);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      
      {/* Navbar */}
      <nav className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">IVERAS <span className="text-indigo-400">VISION</span></h1>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px] animate-pulse ${isSimulation ? 'bg-amber-500 shadow-amber-500' : 'bg-emerald-500 shadow-emerald-500'}`}></span>
              {isSimulation ? "SIMULATION MODE ACTIVE" : "LIVE FEED CONNECTED"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex">
             <button onClick={() => setViewMode('SYSTEM')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'SYSTEM' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>SYSTEM</button>
             <button onClick={() => setViewMode('COPILOT')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'COPILOT' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><Sparkles className="w-3 h-3" /> AI</button>
           </div>
           <button onClick={() => window.close()} className="text-xs text-red-400 border border-red-900 bg-red-900/20 px-3 py-2 rounded hover:bg-red-900/40 font-bold">CLOSE FEED</button>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column: Vision System (Span 9) */}
        <div className="lg:col-span-9 h-full flex flex-col">
          <Card className="flex-1 relative group border-slate-700 shadow-2xl bg-black flex flex-col overflow-hidden">
            
            {/* Top HUD Overlay */}
            <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none bg-gradient-to-b from-black/80 to-transparent h-24">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                    <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse ${isSimulation ? 'bg-amber-600' : 'bg-red-600'}`}>
                        {isSimulation ? "DEMO FOOTAGE" : "LIVE REC"}
                    </span>
                    <span className="text-xs font-mono text-cyan-300 drop-shadow-md">
                        {isSimulation ? "VIRTUAL-DRIVER-CAM" : "PI-CAM-V2"}
                    </span>
                 </div>
                 <span className="text-[10px] text-slate-400 font-mono">1280x720 @ 30FPS | YOLOv8n Active</span>
              </div>
              {isSimulation ? <WifiOff className="w-5 h-5 text-amber-500" /> : <Wifi className="w-5 h-5 text-emerald-400" />}
            </div>

            {/* --- VIDEO CONTAINER --- */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                <img 
                    src={streamSource} 
                    alt="Driver View" 
                    className="w-full h-full object-cover opacity-90 scale-105" 
                    onError={handleStreamError}
                />

                {/* Simulated AI Bounding Box (Overlaid on video) */}
                {isLive && (
                    <div 
                    className={`absolute border-2 transition-all duration-300 ease-linear z-10 flex flex-col ${activeScenario.color}`}
                    style={{ left: `${boxPos.x}%`, top: `${boxPos.y}%`, width: `${boxPos.w}%`, height: `${boxPos.h}%`, boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                    >
                        <div className={`absolute -top-7 left-0 px-2 py-1 text-[10px] font-bold text-white uppercase bg-black/80 backdrop-blur border ${activeScenario.color}`}>
                            {activeScenario.label} {(activeScenario.confidence * 100).toFixed(0)}%
                        </div>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white"></div>
                    </div>
                )}
            </div>

            {/* Bottom HUD Telemetry */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex justify-between items-end h-32 pointer-events-none">
              <div className="flex gap-8">
                 <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">SPEED</div>
                    <div className="text-5xl font-black text-white font-mono tracking-tighter">{speed.toFixed(0)} <span className="text-sm font-normal text-slate-500">KM/H</span></div>
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">STEER</div>
                    <div className="text-5xl font-black text-white font-mono tracking-tighter">{steering > 0 ? '+' : ''}{steering}°</div>
                 </div>
              </div>
              <div className="text-right">
                 <div className="px-3 py-1 bg-slate-800/80 backdrop-blur rounded text-[10px] font-mono text-cyan-400 border border-slate-700 inline-block mb-1">
                    LATENCY: {isSimulation ? '0ms' : '14ms'}
                 </div>
                 <div className="text-[10px] text-slate-500 font-mono">
                    OBJ DETECT: {activeScenario.label.toUpperCase()}
                 </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: System/AI (Span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full">
          
          {viewMode === 'SYSTEM' ? (
            <>
              {/* Decision Panel */}
              <Card className="flex-1 p-6 bg-slate-900/90 border-slate-700 flex flex-col justify-center items-center text-center relative">
                <div className={`absolute inset-0 opacity-5 transition-colors duration-500 ${activeScenario.type === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-slate-800 border-4 transition-all duration-300 ${activeScenario.color} shadow-lg`}>
                   {React.cloneElement(activeScenario.icon, { className: "w-8 h-8" })}
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{activeScenario.label}</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-6 font-bold">{activeScenario.type} SCENARIO</p>
                <div className="w-full bg-black/40 p-3 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase text-left mb-1">System Action</p>
                    <p className="text-xs text-slate-200 font-mono text-left leading-relaxed">
                        {">"} {activeScenario.reaction}
                    </p>
                </div>
              </Card>
              
              {/* Logs */}
              <Card className="h-1/2 p-4 bg-black border-slate-800 flex flex-col">
                 <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Terminal className="w-3 h-3" /> LIVE LOGS</h3>
                 <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                   {logs.map((log, i) => (
                     <div key={i} className="flex gap-2 text-[10px] font-mono border-l-2 border-slate-800 pl-2">
                       <span className="text-slate-600">{log.time.split(' ')[0]}</span>
                       <span className={log.type === 'critical' ? 'text-red-400' : 'text-slate-300'}>{log.message}</span>
                     </div>
                   ))}
                 </div>
              </Card>
            </>
          ) : (
            // Co-Pilot Chat View
            <Card className="h-full flex flex-col bg-slate-900 border-indigo-500/30">
               <div className="p-4 border-b border-indigo-900/50 bg-indigo-950/20 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-indigo-100">AI Co-Pilot</h3>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex justify-start">
                       <div className="max-w-[90%] p-3 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700">
                          Hello. I am monitoring the telemetry. All systems nominal.
                       </div>
                  </div>
               </div>
               <div className="p-3 border-t border-slate-800 bg-black/20">
                  <div className="text-center text-[10px] text-slate-600">Chat Disabled in Demo Mode</div>
               </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}