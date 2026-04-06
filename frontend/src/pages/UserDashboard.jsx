/**
 * NexVitals — UserDashboard v3
 *
 * IMPROVEMENTS FROM v2:
 * ✅ 1. EMERGENCY SOS button — larger, pulsing, bottom-center dominant
 * ✅ 2. Cancel button — hold-to-cancel (2s) with confirmation popup safety lock
 * ✅ 3. Audio/Haptic mentions — badge + system audio context on SOS trigger
 * ✅ 4. AI Explanation panel — "Why AI flagged this" with motion/biometric reason
 * ✅ 5. Family notification banner — "Meera notified" in emergency flow
 * ✅ 6. Women Safety — Fake UI masking + background SOS + live tracking card
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

/* ════════════════════════════════════════════════════
   LEAFLET LOADER
════════════════════════════════════════════════════ */
let _lfPromise = null;
const loadLeaflet = () => {
  if (_lfPromise) return _lfPromise;
  _lfPromise = new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }
    if (!document.getElementById("lf-css")) {
      const link = document.createElement("link");
      link.id = "lf-css"; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = () => resolve(window.L);
    document.head.appendChild(s);
  });
  return _lfPromise;
};

/* ════════════════════════════════════════════════════
   SYSTEM STATE MACHINE
════════════════════════════════════════════════════ */
const SYS = {
  NORMAL: "NORMAL",
  ALERT_TRIGGERED: "ALERT_TRIGGERED",
  AMBULANCE_ASSIGNED: "AMBULANCE_ASSIGNED",
  EN_ROUTE: "EN_ROUTE",
  AT_SCENE: "AT_SCENE",
  AT_HOSPITAL: "AT_HOSPITAL",
};

const STATE_META = {
  [SYS.NORMAL]: { label: "SYSTEM NORMAL", color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", icon: "●", pulse: false, description: "All systems operational" },
  [SYS.ALERT_TRIGGERED]: { label: "EMERGENCY ALERT", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.4)", icon: "⚡", pulse: true, description: "SOS transmitted · Dispatching units" },
  [SYS.AMBULANCE_ASSIGNED]: { label: "AMBULANCE ASSIGNED", color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.4)", icon: "🚑", pulse: true, description: "Responder confirmed · ETA updating" },
  [SYS.EN_ROUTE]: { label: "UNIT EN ROUTE", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.4)", icon: "▶", pulse: true, description: "Ambulance approaching · Stay on scene" },
  [SYS.AT_SCENE]: { label: "PARAMEDICS ON SCENE", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.4)", icon: "⊕", pulse: true, description: "Medical assessment in progress" },
  [SYS.AT_HOSPITAL]: { label: "AT HOSPITAL", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.4)", icon: "🏥", pulse: false, description: "Patient mode — Care journey active" },
};

const USER_INSTRUCTIONS = {
  [SYS.ALERT_TRIGGERED]: {
    icon: "🚨",
    heading: "Help is on the way",
    steps: ["Stay where you are", "Keep your phone unlocked", "Don't move if injured"],
    color: "#ef4444",
  },
  [SYS.AMBULANCE_ASSIGNED]: {
    icon: "🚑",
    heading: "Ambulance is dispatched",
    steps: ["Remain visible near your vehicle", "Turn on hazard lights if possible", "Keep this screen open"],
    color: "#f97316",
  },
  [SYS.EN_ROUTE]: {
    icon: "⏱",
    heading: "Ambulance is approaching",
    steps: ["Stay still — help is arriving", "Answer consciousness check-ins", "If conscious, keep breathing slowly"],
    color: "#fbbf24",
  },
  [SYS.AT_SCENE]: {
    icon: "👨‍⚕️",
    heading: "Paramedics are with you",
    steps: ["Follow paramedic instructions", "Do not refuse treatment", "Family has been notified"],
    color: "#3b82f6",
  },
  [SYS.AT_HOSPITAL]: {
    icon: "🏥",
    heading: "You are at the hospital",
    steps: ["Rest and cooperate with staff", "Your medical profile has been shared", "Family notification sent"],
    color: "#8b5cf6",
  },
};

const STATE_ORDER = [SYS.NORMAL, SYS.ALERT_TRIGGERED, SYS.AMBULANCE_ASSIGNED, SYS.EN_ROUTE, SYS.AT_SCENE, SYS.AT_HOSPITAL];

const RAIL_STEPS = [
  { state: SYS.NORMAL, label: "Normal", icon: "●" },
  { state: SYS.ALERT_TRIGGERED, label: "Alert", icon: "⚡" },
  { state: SYS.AMBULANCE_ASSIGNED, label: "Assigned", icon: "🚑" },
  { state: SYS.EN_ROUTE, label: "En Route", icon: "▶" },
  { state: SYS.AT_SCENE, label: "At Scene", icon: "⊕" },
  { state: SYS.AT_HOSPITAL, label: "Hospital", icon: "🏥" },
];

// Dynamic user data is fetched inside the UserDashboard component
const MEDICAL = { blood: "B+", conditions: "Mild Hypertension", allergies: "Penicillin", emergency: "+91 98765 43210 (Meera)" };
const MOCK_MECHANICS = [
  { name: "Ravi Auto Works", type: "Car Repair", phone: "+919844011223", distance: "1.2 km" },
  { name: "Sri Venkateshwara Puncture", type: "Puncture Shop", phone: "+919740055667", distance: "0.6 km" },
  { name: "Speed Motors Multi-Brand", type: "Multi-Brand", phone: "+919948033445", distance: "2.4 km" },
  { name: "Hero Bike Service Centre", type: "Bike Repair", phone: "+919640077889", distance: "1.8 km" },
];
const MOCK_DRIVERS = [
  { name: "Kiran Reddy", vehicle: "Toyota Innova", contact: "+919340012345", distance: "0.8 km" },
  { name: "Pradeep Kumar", vehicle: "Maruti Ertiga", contact: "+918740067890", distance: "1.4 km" },
  { name: "Anjali Sharma", vehicle: "Honda City", contact: "+919140054321", distance: "2.1 km" },
];
const INIT_ALERTS = [
  { id: 1, type: "Medical Check", icon: "🏥", color: "#3b82f6", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)", time: "Mar 18 · 14:32", action: "Routine biometric sync completed", status: "Logged", statusColor: "#22c55e" },
  { id: 2, type: "Network Switch", icon: "📡", color: "#fbbf24", bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", time: "Mar 18 · 10:15", action: "Switched to secondary cellular", status: "Resolved", statusColor: "#22c55e" },
];

const NORMAL_ACTIONS = [
  { id: "accident", icon: "💥", name: "Report Accident", desc: "AI analysis + auto-dispatch", accent: "#ef4444", glow: "rgba(239,68,68,0.15)" },
  { id: "fuel", icon: "⛽", name: "Fuel Assist", desc: "Community fuel broadcast", accent: "#fbbf24", glow: "rgba(251,191,36,0.15)" },
  { id: "road", icon: "🔧", name: "Road Support", desc: "Find nearby mechanics", accent: "#14b8a6", glow: "rgba(20,184,166,0.15)" },
  { id: "panic", icon: "🚨", name: "Panic Mode", desc: "Security & theft SOS", accent: "#f97316", glow: "rgba(249,115,22,0.15)" },
  { id: "ambulance", icon: "🚑", name: "Ambulance", desc: "Direct medical dispatch", accent: "#22c55e", glow: "rgba(34,197,94,0.15)" },
  { id: "hospitals", icon: "🏥", name: "Hospitals", desc: "Find nearby · Real data", accent: "#3b82f6", glow: "rgba(59,130,246,0.15)" },
];

/* ════════════════════════════════════════════════════
   GLOBAL CSS
════════════════════════════════════════════════════ */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0b0f19;--s1:#111827;--s2:#1f2937;--s3:#374151;
  --line:rgba(255,255,255,0.1);--line2:rgba(255,255,255,0.2);
  --amber:#fbbf24;--amber-l:#fcd34d;--amber-d:rgba(251,191,36,0.12);--amber-b:rgba(251,191,36,0.22);
  --white:#f8fafc;--t90:rgba(248,250,252,0.95);--t70:rgba(248,250,252,0.8);--t45:rgba(248,250,252,0.55);--t20:rgba(248,250,252,0.2);
  --red:#ef4444;--green:#22c55e;--blue:#3b82f6;--pink:#ec4899;--orange:#f97316;--violet:#8b5cf6;--teal:#14b8a6;
  --fd:'Syne',sans-serif;--fm:'JetBrains Mono',monospace;--fb:'DM Sans',sans-serif;
  --ease:cubic-bezier(0.16,1,0.3,1);
}
html,body{background:var(--bg);color:var(--white);font-family:var(--fb);overflow-x:hidden;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:var(--amber-b);border-radius:4px}

.ud-bg-grid{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.025;
  background-image:linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px);
  background-size:60px 60px}

/* keyframes */
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes slidein-r{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.12)}28%{transform:scale(1)}}
@keyframes barfill{from{width:0}}
@keyframes ring-out{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
@keyframes em-flash{0%,100%{border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.06)} 50%{border-color:rgba(239,68,68,0.15);background:rgba(239,68,68,0.12)}}
@keyframes em-glow{0%,100%{box-shadow:0 0 20px rgba(239,68,68,0.2)}50%{box-shadow:0 0 40px rgba(239,68,68,0.5)}}
@keyframes em-overlay-in{from{opacity:0}to{opacity:1}}
@keyframes instruction-in{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}

/* ✅ FIX 1: Dominant SOS button animations */
@keyframes sos-mega-pulse{
  0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.7),0 8px 40px rgba(239,68,68,0.5)}
  50%{box-shadow:0 0 0 18px rgba(239,68,68,0),0 8px 60px rgba(239,68,68,0.8)}
}
@keyframes sos-ring-1{0%{transform:scale(1);opacity:0.6}100%{transform:scale(1.7);opacity:0}}
@keyframes sos-ring-2{0%{transform:scale(1);opacity:0.4}100%{transform:scale(2.1);opacity:0}}
@keyframes sos-float{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-4px)}}

/* ✅ FIX 2: Hold-to-cancel progress */
@keyframes hold-fill{from{width:0}to{width:100%}}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-4px)}40%,80%{transform:translateX(4px)}}

/* Family notification */
@keyframes notif-in{from{opacity:0;transform:translateY(-10px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes women-mask-in{from{opacity:0}to{opacity:1}}
@keyframes tracking-pulse{0%,100%{box-shadow:0 0 0 0 rgba(236,72,153,0.4)}50%{box-shadow:0 0 0 10px rgba(236,72,153,0)}}

/* ── SYSBAR ── */
.sysbar{
  position:fixed;top:0;left:0;right:0;z-index:600;height:46px;padding:0 18px;
  background:rgba(11,15,25,0.96);backdrop-filter:blur(16px) saturate(180%);
  border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:12px;
  transition:border-color .4s ease}
.sysbar.em{border-bottom-color:rgba(239,68,68,0.4)}
.sysbar.as{border-bottom-color:rgba(249,115,22,0.4)}
.sysbar.er{border-bottom-color:rgba(251,191,36,0.4)}
.sysbar.sc{border-bottom-color:rgba(59,130,246,0.4)}
.sysbar.ho{border-bottom-color:rgba(139,92,246,0.4)}
.logo{font-family:var(--fd);font-size:.9rem;font-weight:800;letter-spacing:3px;color:var(--amber);display:flex;align-items:center;gap:7px;cursor:pointer}
.logo-dot{width:6px;height:6px;border-radius:50%;background:var(--amber);animation:pulse 2s ease infinite;box-shadow:0 0 6px var(--amber)}
.sys-state{display:flex;align-items:center;gap:7px;padding:4px 10px;border-radius:20px;border:1px solid;transition:all .4s var(--ease)}
.sys-state-label{font-family:var(--fm);font-size:.52rem;font-weight:700;letter-spacing:2px;text-transform:uppercase}
.sysbar-r{display:flex;align-items:center;gap:8px}
.clock{font-family:var(--fm);font-size:.7rem;font-weight:600;color:var(--t70);letter-spacing:1.5px;min-width:66px;text-align:right}
.sys-btn{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:6px;border:1px solid;cursor:pointer;
  font-family:var(--fm);font-size:.52rem;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;transition:all .2s var(--ease)}
.ai-btn{background:var(--amber-d);border-color:var(--amber-b);color:var(--amber)}
.ai-btn:hover,.ai-btn.on{background:var(--amber-b)}
.out-btn{background:transparent;border-color:var(--line2);color:var(--t45)}
.out-btn:hover{border-color:var(--red);color:var(--red);background:rgba(239,68,68,0.06)}

/* ── STATE RAIL ── */
.rail{position:fixed;left:0;right:0;z-index:590;background:rgba(11,15,25,0.97);
  border-bottom:1px solid var(--line);backdrop-filter:blur(12px);padding:0 20px;
  transition:height .4s var(--ease),padding .4s, top .3s ease;overflow:hidden}
.rail.show{height:52px}
.rail.hide{height:0;padding:0;border-bottom:none}
.rail-inner{display:flex;align-items:center;height:52px;overflow-x:auto;scrollbar-width:none}
.rail-inner::-webkit-scrollbar{display:none}
.rail-step{display:flex;align-items:center;flex-shrink:0}
.rail-node{display:flex;align-items:center;gap:7px;padding:5px 12px;border-radius:7px;transition:all .3s ease}
.rail-node.done{background:rgba(34,197,94,0.08)}
.rail-node.active{background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.25);animation:fadein .4s ease}
.rail-node.pend{opacity:.3}
.rail-label{font-family:var(--fm);font-size:.5rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}
.rail-conn{width:22px;height:1px;flex-shrink:0;transition:background .5s}
.rail-conn.done{background:rgba(34,197,94,0.5)}
.rail-conn.pend{background:var(--line)}

/* ── SOS BANNER ── */
.sos-bar{position:fixed;left:0;right:0;z-index:589;height:42px;padding:0 18px;
  background:linear-gradient(90deg,rgba(236,72,153,0.04),rgba(11,15,25,0.96),rgba(236,72,153,0.04));
  border-bottom:1px solid rgba(236,72,153,0.2);display:flex;align-items:center;justify-content:space-between;
  backdrop-filter:blur(8px);transition:top .3s ease}
.sos-bar.triggered{border-color:rgba(236,72,153,0.55)}
.sos-label{font-family:var(--fd);font-size:.82rem;font-weight:800;color:var(--pink);display:flex;align-items:center;gap:8px}
.sos-dot{width:6px;height:6px;border-radius:50%;background:var(--pink);animation:pulse 1.4s ease infinite}
.sos-sub{font-family:var(--fm);font-size:.52rem;font-weight:600;letter-spacing:2px;color:var(--t70);text-transform:uppercase;margin-left:4px}
.sos-btn{position:relative;display:flex;align-items:center;justify-content:center;height:30px;padding:0 16px;border-radius:7px;
  border:1px solid rgba(236,72,153,0.35);background:rgba(236,72,153,0.08);
  font-family:var(--fm);font-size:.55rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--pink);cursor:pointer;transition:all .2s;white-space:nowrap}
.sos-btn:hover{background:rgba(236,72,153,0.18)}
.sos-btn.on{background:var(--pink);color:#fff}
.sos-ring{position:absolute;width:100%;height:100%;border-radius:7px;border:2px solid var(--pink);animation:ring-out 1.5s ease-out infinite}

/* ════════════════════════════════════════════════════
   ✅ FIX 1: DOMINANT FLOATING SOS BUTTON
════════════════════════════════════════════════════ */
.float-sos-wrap{
  position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:700;
  display:flex;flex-direction:column;align-items:center;gap:10px;
  animation:sos-float 2.8s ease-in-out infinite;
}
/* Normal mode — big red SOS */
.float-sos-main{
  position:relative;height:68px;padding:0 52px;border-radius:20px;
  border:2px solid rgba(239,68,68,0.7);
  background:linear-gradient(135deg,#dc2626,#b91c1c);
  color:#fff;font-family:var(--fd);font-size:1.15rem;font-weight:800;letter-spacing:3px;
  cursor:pointer;transition:all .15s;white-space:nowrap;
  display:flex;align-items:center;gap:14px;
  animation:sos-mega-pulse 2s ease-in-out infinite;
}
.float-sos-main:hover{background:linear-gradient(135deg,#ef4444,#dc2626);transform:translateX(-50%) scale(1.04) !important}
.float-sos-main:active{transform:translateX(-50%) scale(0.97) !important}
.float-sos-ring{
  position:absolute;inset:0;border-radius:20px;border:2px solid rgba(239,68,68,0.6);
  pointer-events:none;
}
.float-sos-ring-1{animation:sos-ring-1 1.8s ease-out infinite}
.float-sos-ring-2{animation:sos-ring-2 1.8s ease-out infinite .4s}
.float-sos-label{font-family:var(--fm);font-size:.5rem;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.55);text-transform:uppercase;margin-top:2px}

/* Emergency mode — cancel only */
.float-cancel-zone{display:flex;flex-direction:column;align-items:center;gap:8px}

/* ════════════════════════════════════════════════════
   ✅ FIX 2: HOLD-TO-CANCEL
════════════════════════════════════════════════════ */
.hold-cancel-btn{
  position:relative;overflow:hidden;
  height:46px;padding:0 32px;border-radius:12px;
  border:1px solid rgba(239,68,68,0.4);
  background:rgba(239,68,68,0.08);
  color:var(--red);font-family:var(--fm);font-size:.58rem;font-weight:700;
  letter-spacing:2px;text-transform:uppercase;cursor:pointer;
  transition:border-color .2s;user-select:none;-webkit-user-select:none;
  display:flex;align-items:center;gap:9px;
}
.hold-cancel-btn:hover{border-color:rgba(239,68,68,0.6)}
.hold-cancel-progress{
  position:absolute;left:0;top:0;height:100%;background:rgba(239,68,68,0.2);
  border-radius:12px;transition:none;pointer-events:none;
}
.hold-cancel-progress.filling{
  animation:hold-fill 2s linear forwards;
}
.hold-cancel-hint{font-family:var(--fm);font-size:.44rem;font-weight:600;letter-spacing:2px;color:var(--t45);text-transform:uppercase}

/* Cancel confirmation popup */
.cancel-confirm-popup{
  position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:800;
  display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);
  animation:fadein .2s ease;
}
.cancel-confirm-box{
  background:var(--s1);border:1px solid rgba(239,68,68,0.4);border-radius:16px;
  padding:32px 28px;max-width:380px;width:90%;text-align:center;
  animation:slideup .25s var(--ease);box-shadow:0 0 60px rgba(239,68,68,0.2);
}

/* ════════════════════════════════════════════════════
   ✅ FIX 3: AUDIO/HAPTIC BADGE
════════════════════════════════════════════════════ */
.haptic-badge{
  display:inline-flex;align-items:center;gap:6px;padding:4px 10px;
  border-radius:20px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.28);
  font-family:var(--fm);font-size:.46rem;font-weight:700;letter-spacing:2px;
  text-transform:uppercase;color:var(--amber);
}

/* ════════════════════════════════════════════════════
   ✅ FIX 4: AI EXPLANATION PANEL
════════════════════════════════════════════════════ */
.ai-explain-card{
  border-radius:11px;padding:16px 18px;
  background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.28);
  animation:fadein .5s ease .2s both;
}
.ai-explain-tag{
  display:inline-flex;align-items:center;gap:6px;padding:3px 10px;
  border-radius:4px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);
  font-family:var(--fm);font-size:.48rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ef4444;
  margin-right:7px;margin-bottom:7px;
}
.ai-reason-row{
  display:flex;align-items:flex-start;gap:10px;padding:8px 0;
  border-bottom:1px solid rgba(255,255,255,0.06);
}
.ai-reason-row:last-child{border-bottom:none}
.ai-reason-icon{width:22px;height:22px;border-radius:5px;background:rgba(239,68,68,0.12);
  border:1px solid rgba(239,68,68,0.25);display:flex;align-items:center;justify-content:center;font-size:.7rem;flex-shrink:0}
.ai-reason-text{font-size:.8rem;font-weight:500;color:var(--t70);line-height:1.5}
.ai-reason-val{font-family:var(--fm);font-size:.58rem;font-weight:700;letter-spacing:1px;margin-top:2px}
.ai-confidence-bar{height:4px;background:var(--s3);border-radius:2px;overflow:hidden;margin-top:10px}
.ai-confidence-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#fbbf24,#ef4444);animation:barfill .8s ease forwards}

/* ════════════════════════════════════════════════════
   ✅ FIX 5: FAMILY NOTIFICATION BANNER
════════════════════════════════════════════════════ */
.family-notif{
  border-radius:11px;padding:14px 16px;
  background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.3);
  display:flex;align-items:center;justify-content:space-between;gap:14px;
  animation:notif-in .5s var(--ease);
}
.family-notif-left{display:flex;align-items:center;gap:12px}
.family-notif-icon{width:36px;height:36px;border-radius:10px;background:rgba(34,197,94,0.12);
  border:1px solid rgba(34,197,94,0.35);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
.family-notif-name{font-family:var(--fd);font-size:.92rem;font-weight:700;color:var(--t90)}
.family-notif-sub{font-family:var(--fm);font-size:.48rem;font-weight:600;letter-spacing:1.5px;color:var(--green);margin-top:2px}
.family-notif-time{font-family:var(--fm);font-size:.48rem;font-weight:600;letter-spacing:1.5px;color:var(--t45)}
.family-notif-badge{
  display:flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;
  background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);
  font-family:var(--fm);font-size:.5rem;font-weight:700;letter-spacing:1.5px;color:var(--green);
  white-space:nowrap;
}

/* ════════════════════════════════════════════════════
   ✅ FIX 6: WOMEN SAFETY — FAKE UI MASK + TRACKING
════════════════════════════════════════════════════ */
/* Fake "normal" UI overlay when women safety SOS active */
.women-mask-overlay{
  position:fixed;inset:0;z-index:650;background:var(--bg);
  animation:women-mask-in .3s ease;
  display:flex;flex-direction:column;
}
.women-mask-topbar{
  height:56px;background:var(--s1);border-bottom:1px solid var(--line);
  display:flex;align-items:center;padding:0 18px;gap:12px;
}
.women-mask-content{
  flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;padding:30px;
}
.women-mask-card{
  background:var(--s1);border:1px solid var(--line);border-radius:12px;padding:22px;width:100%;max-width:380px;
}
/* Hidden SOS indicator in mask */
.women-hidden-active{
  position:fixed;bottom:18px;right:18px;z-index:660;
  width:12px;height:12px;border-radius:50%;
  background:#ec4899;animation:tracking-pulse 1.5s ease infinite;
}

/* Women tracking card */
.women-track-card{
  border-radius:12px;padding:18px;
  background:rgba(236,72,153,0.07);border:1px solid rgba(236,72,153,0.3);
  animation:fadein .4s ease;
}
.women-track-contact{
  display:flex;align-items:center;justify-content:space-between;
  padding:9px 0;border-bottom:1px solid rgba(236,72,153,0.12);
}
.women-track-contact:last-child{border-bottom:none}
.women-contact-avatar{
  width:32px;height:32px;border-radius:8px;background:rgba(236,72,153,0.14);
  border:1px solid rgba(236,72,153,0.35);display:flex;align-items:center;
  justify-content:center;font-size:.85rem;flex-shrink:0;
}
.women-track-dot{
  width:7px;height:7px;border-radius:50%;background:#ec4899;
  animation:tracking-pulse 1.5s ease infinite;flex-shrink:0;
}

/* ── INSTRUCTION CARD ── */
.instruction-card{
  border-radius:14px;padding:20px 22px;position:relative;overflow:hidden;
  animation:instruction-in .4s var(--ease);
}
.instruction-step{display:flex;align-items:center;gap:12px;padding:8px 0;animation:instruction-in .4s ease both}
.instruction-step-num{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-family:var(--fd);font-size:.75rem;font-weight:800;flex-shrink:0;border:1px solid}
.instruction-step-text{font-size:.9rem;font-weight:600;color:var(--t90)}

/* ── MAIN GRID ── */
.normal-grid{
  display:grid;grid-template-columns:268px 1fr 300px;gap:15px;
  padding:15px 15px 100px;max-width:1600px;margin:0 auto;position:relative;z-index:1;
}

/* ── EMERGENCY OVERLAY ── */
.em-overlay{
  position:relative;z-index:1;max-width:860px;margin:0 auto;
  padding:15px 15px 140px;display:flex;flex-direction:column;gap:14px;
  animation:em-overlay-in .3s ease;
}

/* ── CARD ── */
.card{background:var(--s1);border:1px solid var(--line);border-radius:13px;position:relative;overflow:hidden;
  transition:border-color .2s,box-shadow .2s;box-shadow:0 3px 16px rgba(0,0,0,0.12)}
.card:hover{border-color:var(--line2);box-shadow:0 5px 22px rgba(0,0,0,0.2)}
.card.em-flash{animation:em-flash 2s ease infinite}
.card.em-glow{animation:em-glow 2s ease infinite}
.card-accent{position:absolute;top:0;left:0;right:0;height:2.5px}
.card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;flex-wrap:wrap;gap:8px}
.card-title{font-family:var(--fm);font-size:.58rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--t70);display:flex;align-items:center;gap:7px}
.card-body{padding:0 16px 16px}

/* ── CHIP ── */
.chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:5px;border:1px solid;
  font-family:var(--fm);font-size:.5rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;white-space:nowrap}

/* ── LEFT ── */
.lc{display:flex;flex-direction:column;gap:14px}
.avatar{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--amber),#ea580c);
  display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:1.2rem;font-weight:800;color:#fff;
  box-shadow:0 3px 14px rgba(251,191,36,0.2);flex-shrink:0}
.prof-name{font-family:var(--fd);font-size:1rem;font-weight:700;color:var(--t90)}
.prof-uid{font-family:var(--fm);font-size:.52rem;font-weight:600;letter-spacing:2px;color:var(--t45);margin-top:2px}
.hw-row{display:flex;flex-direction:column;gap:7px;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}
.hw-item{display:flex;align-items:center;justify-content:space-between}
.hw-label{font-family:var(--fm);font-size:.52rem;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--t45)}
.hw-val{font-family:var(--fm);font-size:.6rem;font-weight:700;display:flex;align-items:center;gap:5px}
.hw-dot{width:5px;height:5px;border-radius:50%;animation:pulse 2s ease infinite}
.med-row{display:flex;flex-direction:column;gap:9px}
.med-item{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:9px;border-bottom:1px solid var(--line)}
.med-item:last-child{border-bottom:none;padding-bottom:0}
.med-key{font-family:var(--fm);font-size:.52rem;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--t45)}
.med-val{font-size:.82rem;font-weight:600;color:var(--t90);text-align:right;max-width:140px}
.blood{font-family:var(--fd);font-size:1.35rem;font-weight:800;color:var(--red)}
.alert-item{display:flex;gap:11px;padding:11px 0;border-bottom:1px solid var(--line)}
.alert-item:last-child{border-bottom:none}
.alert-icon{width:30px;height:30px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.9rem;border:1px solid}
.alert-type{font-family:var(--fd);font-size:.82rem;font-weight:700;color:var(--t90)}
.alert-time{font-family:var(--fm);font-size:.48rem;font-weight:600;letter-spacing:1.5px;color:var(--t45);margin-top:2px}
.alert-action{font-size:.74rem;color:var(--t70);margin-top:5px;line-height:1.4;font-weight:500}
.status-pill{font-family:var(--fm);font-size:.48rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:2px 7px;border-radius:4px;border:1px solid;display:inline-flex;margin-top:5px}

/* ── CENTER ── */
.cc{display:flex;flex-direction:column;gap:14px}

/* ── MAP ── */
.map-wrap{border-radius:13px;overflow:hidden;border:1px solid var(--line);background:var(--s1);position:relative;
  box-shadow:0 3px 16px rgba(0,0,0,0.16);transition:border-color .4s}
.map-canvas{width:100%;height:360px;position:relative;overflow:hidden}
.map-hud{position:absolute;top:14px;left:14px;z-index:500;background:rgba(17,24,39,0.94);border:1px solid var(--line2);
  border-radius:9px;padding:10px 14px;backdrop-filter:blur(8px);pointer-events:none}
.map-coords{font-family:var(--fm);font-size:.58rem;font-weight:700;letter-spacing:1.5px;color:var(--amber)}
.map-area{font-family:var(--fb);font-size:.82rem;font-weight:700;color:var(--white);margin-top:3px}
.map-gps{position:absolute;top:14px;right:14px;z-index:500;background:rgba(17,24,39,0.94);border:1px solid rgba(34,197,94,0.35);
  border-radius:7px;padding:6px 12px;display:flex;align-items:center;gap:7px;
  font-family:var(--fm);font-size:.52rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--green);backdrop-filter:blur(8px);pointer-events:none}

/* ── ETA DISPLAY ── */
.eta-big{font-family:var(--fd);font-size:3.2rem;font-weight:800;line-height:1;color:var(--amber);text-shadow:0 0 30px rgba(251,191,36,0.4)}
.eta-unit{font-family:var(--fm);font-size:.6rem;font-weight:700;letter-spacing:3px;color:var(--t45);text-transform:uppercase;margin-top:4px}
.track-bar{height:5px;background:var(--s3);border-radius:3px;overflow:hidden;position:relative}
.track-fill{height:100%;border-radius:3px;transition:width 1s linear}
.track-stops{display:flex;justify-content:space-between;margin-top:5px}
.track-stop{display:flex;flex-direction:column;align-items:center;gap:3px}
.track-dot{width:7px;height:7px;border-radius:50%}
.track-lbl{font-family:var(--fm);font-size:.44rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--t45)}

/* ── BIOMETRICS ── */
.bio-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:11px}
.bio-card{border-radius:9px;border:1px solid var(--line);background:var(--s2);padding:14px 12px;
  display:flex;flex-direction:column;gap:5px;position:relative;overflow:hidden;transition:all .2s}
.bio-card:hover{border-color:var(--line2);background:var(--s1)}
.bio-label{font-family:var(--fm);font-size:.52rem;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--t45)}
.bio-val{font-family:var(--fd);font-size:1.5rem;font-weight:800;line-height:1}
.bio-unit{font-family:var(--fm);font-size:.52rem;font-weight:600;letter-spacing:1.5px;color:var(--t45)}
.bio-bar{height:3px;background:var(--line);border-radius:2px;overflow:hidden;margin-top:7px}
.bio-bar-fill{height:100%;border-radius:2px;animation:barfill 1s ease forwards}
.bio-status{display:flex;align-items:center;gap:5px;margin-top:5px}
.bio-sdot{width:5px;height:5px;border-radius:50%;animation:pulse 2s ease infinite}
.bio-stext{font-family:var(--fm);font-size:.46rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}
.hr-beat{animation:heartbeat 1.2s ease infinite;display:inline-block}

/* ── EMERGENCY ACTION GRID ── */
.em-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}
.em-card{border-radius:11px;border:1px solid var(--line);background:var(--s2);padding:18px 14px 14px;
  display:flex;flex-direction:column;gap:9px;cursor:pointer;transition:all .22s var(--ease);position:relative;overflow:hidden;text-align:left}
.em-card:hover{transform:translateY(-3px);box-shadow:0 5px 14px rgba(0,0,0,0.18)}
.em-card:active{transform:scale(.97)}
.em-glow-bg{position:absolute;inset:0;opacity:0;transition:opacity .3s;pointer-events:none}
.em-card:hover .em-glow-bg{opacity:1}
.em-icon{font-size:1.7rem;line-height:1}
.em-name{font-family:var(--fd);font-size:.88rem;font-weight:800;color:var(--t90);line-height:1.2}
.em-desc{font-size:.72rem;font-weight:500;color:var(--t45);line-height:1.4}

/* ── HOSPITALS ── */
.hosp-item{padding:12px 0;border-bottom:1px solid var(--line)}
.hosp-item:last-child{border-bottom:none}
.hosp-name{font-family:var(--fd);font-size:.9rem;font-weight:700;color:var(--t90)}
.hosp-addr{font-family:var(--fm);font-size:.52rem;font-weight:500;letter-spacing:1px;color:var(--t45);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px}
.hosp-meta{display:flex;gap:10px;margin-top:5px;flex-wrap:wrap}
.hosp-stat{font-family:var(--fm);font-size:.52rem;font-weight:700;letter-spacing:1.5px;color:var(--t45);display:flex;align-items:center;gap:4px}
.hosp-actions{display:flex;gap:7px;margin-top:8px}
.hosp-btn{flex:1;height:30px;border-radius:5px;border:1px solid;cursor:pointer;
  font-family:var(--fm);font-size:.5rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
  transition:all .2s;display:flex;align-items:center;justify-content:center;gap:4px;text-decoration:none}

/* ── RIGHT ── */
.rc{display:flex;flex-direction:column;gap:14px}

/* ── SCENE / HOSPITAL ── */
.scene-vital-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:14px}
.scene-vital{background:var(--s2);border-radius:7px;padding:12px;border:1px solid var(--line)}
.scene-vital-label{font-family:var(--fm);font-size:.48rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--t45);margin-bottom:6px}
.scene-vital-val{font-family:var(--fd);font-size:1.3rem;font-weight:800}
.care-step{display:flex;gap:12px;padding:10px 0;position:relative}
.care-step::before{content:'';position:absolute;left:14px;top:34px;bottom:-10px;width:1px;background:var(--line)}
.care-step:last-child::before{display:none}
.care-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:.85rem;flex-shrink:0;border:1px solid}
.care-title{font-family:var(--fd);font-size:.88rem;font-weight:700;color:var(--t90);margin-bottom:2px}
.care-sub{font-size:.76rem;font-weight:500;color:var(--t45);line-height:1.4}
.care-time{font-family:var(--fm);font-size:.46rem;font-weight:600;letter-spacing:1.5px;color:var(--t45);margin-top:2px}

/* ── CONSCIOUSNESS ── */
.consc-wrap{background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.25);border-radius:8px;padding:16px 18px}
.consc-cd{font-family:var(--fd);font-size:2rem;font-weight:800}
.consc-btns{display:flex;gap:9px;margin-top:12px;flex-wrap:wrap}
.consc-btn{height:34px;padding:0 14px;border-radius:6px;border:1px solid;background:var(--s2);color:var(--t90);
  font-family:var(--fm);font-size:.52rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s}

/* ── AI CHAT ── */
.chat-wrap{position:fixed;bottom:24px;left:20px;z-index:500;width:410px;animation:slideup .25s var(--ease)}
.chat-inner{background:var(--s1);border:1px solid var(--line2);border-radius:13px;overflow:hidden;box-shadow:0 18px 55px rgba(0,0,0,0.38)}
.chat-head{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:var(--s2);border-bottom:1px solid var(--line)}
.chat-msgs{height:300px;overflow-y:auto;padding:14px 18px;display:flex;flex-direction:column;gap:10px}
.chat-msg{display:flex;flex-direction:column;animation:slideup .2s ease}
.chat-lbl{font-family:var(--fm);font-size:.48rem;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--t45);margin-bottom:4px}
.chat-bub{max-width:88%;padding:10px 14px;font-size:.83rem;font-weight:500;line-height:1.6;border-radius:9px;border:1px solid var(--line);white-space:pre-line}
.chat-quick-row{padding:8px 18px;border-top:1px solid var(--line);display:flex;gap:7px;flex-wrap:wrap;background:var(--s2)}
.chat-quick{font-size:.52rem;font-weight:700;background:var(--s1);border:1px solid var(--line2);color:var(--t70);
  padding:5px 10px;cursor:pointer;letter-spacing:1px;font-family:var(--fm);border-radius:4px;transition:all .1s;text-transform:capitalize}
.chat-quick:hover{border-color:var(--amber);color:var(--amber)}
.chat-foot{padding:10px 18px 14px;display:flex;gap:9px;background:var(--s2)}
.chat-input{flex:1;background:var(--s1);border:1px solid var(--line2);color:var(--white);padding:10px 12px;font-size:.83rem;
  font-weight:500;outline:none;font-family:var(--fb);border-radius:7px;transition:border-color .15s}
.chat-input:focus{border-color:var(--amber)}
.chat-send{border:none;padding:9px 16px;cursor:pointer;font-size:.58rem;font-weight:800;font-family:var(--fm);
  border-radius:7px;transition:all .15s;letter-spacing:1.5px;text-transform:uppercase}

/* ── TOAST ── */
.toast-wrap{position:fixed;top:60px;right:22px;z-index:9998;display:flex;flex-direction:column;gap:9px;pointer-events:none;width:360px}
.toast{pointer-events:all;background:rgba(31,41,55,0.97);border-radius:7px;padding:12px 14px;
  display:flex;gap:11px;align-items:flex-start;animation:slidein-r .3s var(--ease);
  backdrop-filter:blur(12px);border:1px solid var(--line);box-shadow:0 7px 28px rgba(0,0,0,0.28)}
.toast-title{font-family:var(--fm);font-size:.58rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:5px}
.toast-msg{font-size:.78rem;color:var(--t70);font-weight:500;line-height:1.5}
.toast-close{background:none;border:none;color:var(--t45);cursor:pointer;font-size:1.1rem;flex-shrink:0;padding:0;line-height:1}

/* ── MODAL ── */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);animation:fadein .2s ease}
.modal{background:var(--s1);width:90%;max-width:480px;border:1px solid var(--line2);border-radius:13px;max-height:88vh;overflow-y:auto;animation:slideup .25s var(--ease);box-shadow:0 18px 55px rgba(0,0,0,0.45)}
.modal-head{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--line);background:var(--s2)}
.modal-ttl{font-family:var(--fm);font-size:.62rem;font-weight:700;letter-spacing:2px;text-transform:uppercase}
.modal-close{background:none;border:none;color:var(--t45);cursor:pointer;font-size:1.4rem;padding:2px 7px;border-radius:4px;transition:color .1s}
.modal-close:hover{color:var(--t90);background:var(--line)}
.modal-body{padding:20px}
.modal-input{width:100%;background:var(--s2);border:1px solid var(--line2);color:var(--white);padding:10px 14px;
  font-size:.83rem;font-weight:500;outline:none;font-family:var(--fb);border-radius:7px;margin-bottom:11px;transition:border-color .15s}
.modal-input:focus{border-color:var(--amber)}
.modal-btn{width:100%;padding:13px;border-radius:7px;border:1px solid;font-family:var(--fm);font-size:.62rem;font-weight:700;
  letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;margin-top:11px}
.modal-btn:disabled{opacity:.5;cursor:not-allowed}
.panic-btn{width:100%;padding:14px 16px;border-radius:7px;border:1px solid;cursor:pointer;text-align:left;transition:all .15s;margin-bottom:11px;background:var(--s2)}

/* ── SPINNER ── */
.spin{width:15px;height:15px;border-radius:50%;border:2.5px solid;border-top-color:transparent;animation:spin .8s linear infinite;flex-shrink:0}

/* ── COMMUNITY ── */
.community{grid-column:1/-1;text-align:center;padding:14px 10px;border-top:1px solid var(--line);font-size:.78rem;font-weight:500;color:var(--t45)}
.community a{color:var(--amber);font-weight:600;text-decoration:none;cursor:pointer}

/* ── DEV TOOLS ── */
.dev-tools{position:fixed;bottom:20px;right:22px;z-index:800;display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.dev-btn{height:32px;padding:0 14px;border-radius:7px;font-family:var(--fm);font-size:.46rem;font-weight:800;
  letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px}
.dev-lbl{font-family:var(--fm);font-size:.46rem;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--t45)}

/* ── RESPONSIVE ── */
@media(max-width:1200px){.normal-grid{grid-template-columns:250px 1fr}.rc{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr}}
@media(max-width:820px){
  .normal-grid{grid-template-columns:1fr;gap:12px;padding:12px 12px 120px}
  .rc{grid-template-columns:1fr}.em-grid{grid-template-columns:repeat(2,1fr)}
  .bio-grid{grid-template-columns:1fr 1fr}
  .chat-wrap{width:calc(100vw - 30px);left:15px}
  .toast-wrap{width:calc(100vw - 36px);right:18px}
  .float-sos-main{padding:0 28px;font-size:.95rem;height:60px}
}
`;

/* ════════════════════════════════════════════════════
   AUDIO HELPER (FIX 3)
════════════════════════════════════════════════════ */
const playSOSBeeps = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playBeep = (time, freq = 880, dur = 0.15) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.start(time); osc.stop(time + dur);
    };
    // SOS pattern: 3 short, 3 long, 3 short
    [0, 0.2, 0.4, 0.7, 1.0, 1.3, 1.7, 1.9, 2.1].forEach((t, i) => {
      playBeep(ctx.currentTime + t, i >= 3 && i <= 5 ? 440 : 880, i >= 3 && i <= 5 ? 0.35 : 0.15);
    });
  } catch (e) { /* silently fail if audio blocked */ }
};

const triggerHaptic = (pattern = [100, 50, 100, 50, 300]) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
};

/* ════════════════════════════════════════════════════
   MINI COMPONENTS
════════════════════════════════════════════════════ */
function Chip({ label, color, pulse: doPulse }) {
  return (
    <div className="chip" style={{ background: `${color}15`, borderColor: `${color}40`, color }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, animation: doPulse ? "pulse 1.5s ease infinite" : "none" }} />
      {label}
    </div>
  );
}
function Spinner({ color }) { return <div className="spin" style={{ borderColor: `${color}40`, borderTopColor: color }} />; }
function CardTitle({ icon, label }) {
  return <div className="card-title">{icon && <span style={{ fontSize: ".82rem" }}>{icon}</span>}{label}</div>;
}

/* ════════════════════════════════════════════════════
   ✅ FIX 3: HAPTIC/AUDIO BADGE COMPONENT
════════════════════════════════════════════════════ */
function HapticBadge() {
  return (
    <div className="haptic-badge">
      <span style={{ fontSize: ".7rem" }}>🔔</span>
      Audio · Haptic active
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ✅ FIX 5: FAMILY NOTIFICATION BANNER
════════════════════════════════════════════════════ */
function FamilyNotifBanner({ visible, notifiedTime }) {
  if (!visible) return null;
  return (
    <div className="family-notif">
      <div className="family-notif-left">
        <div className="family-notif-icon">👩</div>
        <div>
          <div className="family-notif-name">Meera</div>
          <div style={{ fontFamily: "var(--fm)", fontSize: ".48rem", fontWeight: 600, letterSpacing: "1.5px", color: "var(--t45)" }}>
            +91 98765 43210 · Emergency Contact
          </div>
          <div className="family-notif-sub">📍 Location shared · Updates every 30s</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
        <div className="family-notif-badge">
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s ease infinite" }} />
          Notified
        </div>
        <div className="family-notif-time">{notifiedTime}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ✅ FIX 4: AI EXPLANATION PANEL
════════════════════════════════════════════════════ */
function AIExplainPanel({ aiAnalysis, visible }) {
  if (!visible || !aiAnalysis) return null;
  const sc = { CRITICAL: "#ef4444", SEVERE: "#ef4444", MODERATE: "#fbbf24", MILD: "#22c55e" }[aiAnalysis.severity] || "#3b82f6";
  const reasons = [
    { icon: "📉", label: "G-Force Spike", val: "28.4G detected on IMU · 6.8× crash threshold", color: "#ef4444" },
    { icon: "❤️", label: "HR Anomaly", val: `Heart rate jumped to ${aiAnalysis.hrSpike || "142"} bpm post-impact`, color: "#fbbf24" },
    { icon: "📍", label: "Motion Signature", val: "Vehicle came to full stop from 54 km/h in 0.3s", color: "#f97316" },
    { icon: "🩺", label: "SEWS Score", val: `Early Warning Score: ${aiAnalysis.sewsScore || "7"} — Critical threshold`, color: sc },
  ];
  return (
    <div className="ai-explain-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: "1.1rem" }}>✦</span>
          <div>
            <div style={{ fontFamily: "var(--fd)", fontSize: ".95rem", fontWeight: 800, color: "var(--t90)" }}>Why AI flagged this</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: ".48rem", fontWeight: 600, letterSpacing: "2px", color: "var(--t45)", marginTop: 2 }}>NexVitals NEURAL ANALYSIS · v3.1</div>
          </div>
        </div>
        <Chip label={`${aiAnalysis.severity} · ${aiAnalysis.confidence}% conf`} color={sc} pulse />
      </div>
      <div style={{ marginBottom: 12, lineHeight: 1.6, fontSize: ".82rem", color: "var(--t70)", fontWeight: 500, padding: "10px 12px", background: "rgba(0,0,0,0.25)", borderRadius: 7, borderLeft: `3px solid ${sc}` }}>
        "{aiAnalysis.label || "High-impact vehicle collision detected"} — multi-sensor fusion confirmed emergency."
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {["IMU Impact", "Biometric Spike", "GPS Stop Event", "SEWS Protocol"].map(tag => (
          <div key={tag} className="ai-explain-tag">{tag}</div>
        ))}
      </div>
      {reasons.map((r, i) => (
        <div key={i} className="ai-reason-row">
          <div className="ai-reason-icon" style={{ background: `${r.color}12`, borderColor: `${r.color}30` }}>{r.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: ".5rem", fontWeight: 700, letterSpacing: "1.5px", color: "var(--t45)", textTransform: "uppercase", marginBottom: 2 }}>{r.label}</div>
            <div className="ai-reason-text">{r.val}</div>
          </div>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: r.color, animation: "pulse 2s ease infinite", flexShrink: 0, marginTop: 8 }} />
        </div>
      ))}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontFamily: "var(--fm)", fontSize: ".48rem", fontWeight: 700, letterSpacing: "1.5px", color: "var(--t45)", textTransform: "uppercase" }}>Confidence Score</span>
          <span style={{ fontFamily: "var(--fm)", fontSize: ".58rem", fontWeight: 800, color: sc }}>{aiAnalysis.confidence}%</span>
        </div>
        <div className="ai-confidence-bar">
          <div className="ai-confidence-fill" style={{ width: `${aiAnalysis.confidence}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ✅ FIX 6: WOMEN SAFETY — TRACKING CARD
════════════════════════════════════════════════════ */
function WomenTrackingCard({ active, onRevealSOS }) {
  const trustedContacts = [
    { name: "Meera (Mother)", initials: "ME", notified: true, tracking: true },
    { name: "Anjali (Friend)", initials: "AN", notified: true, tracking: true },
    { name: "Police PCR (100)", initials: "🚔", notified: true, tracking: false },
  ];
  if (!active) return null;
  return (
    <div className="women-track-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🛡</div>
          <div>
            <div style={{ fontFamily: "var(--fd)", fontSize: ".92rem", fontWeight: 800, color: "#ec4899" }}>Women Safety Active</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: ".48rem", fontWeight: 600, letterSpacing: "2px", color: "var(--t45)", marginTop: 2 }}>Silent Mode · Background SOS</div>
          </div>
        </div>
        <Chip label="Live" color="#ec4899" pulse />
      </div>

      <div style={{ background: "rgba(236,72,153,0.06)", borderRadius: 8, padding: "10px 14px", border: "1px solid rgba(236,72,153,0.2)", marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--fm)", fontSize: ".48rem", fontWeight: 700, letterSpacing: "1.5px", color: "rgba(236,72,153,.7)", textTransform: "uppercase", marginBottom: 6 }}>Trusted Contacts — Live Tracking</div>
        {trustedContacts.map((c, i) => (
          <div key={i} className="women-track-contact">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="women-contact-avatar">{c.initials}</div>
              <div>
                <div style={{ fontFamily: "var(--fd)", fontSize: ".82rem", fontWeight: 700, color: "var(--t90)" }}>{c.name}</div>
                <div style={{ fontFamily: "var(--fm)", fontSize: ".46rem", fontWeight: 600, letterSpacing: "1.5px", color: c.tracking ? "#ec4899" : "var(--t45)", marginTop: 1 }}>
                  {c.notified ? (c.tracking ? "📍 Receiving live location" : "✓ Alert received") : "Pending"}
                </div>
              </div>
            </div>
            {c.tracking && <div className="women-track-dot" />}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 9, marginBottom: 12 }}>
        <div style={{ flex: 1, padding: "10px 12px", background: "rgba(236,72,153,0.07)", borderRadius: 7, border: "1px solid rgba(236,72,153,0.2)" }}>
          <div style={{ fontFamily: "var(--fm)", fontSize: ".46rem", fontWeight: 700, letterSpacing: "1.5px", color: "var(--t45)", textTransform: "uppercase" }}>Screen Mode</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: ".82rem", fontWeight: 700, color: "#ec4899", marginTop: 4 }}>Disguised ✓</div>
        </div>
        <div style={{ flex: 1, padding: "10px 12px", background: "rgba(236,72,153,0.07)", borderRadius: 7, border: "1px solid rgba(236,72,153,0.2)" }}>
          <div style={{ fontFamily: "var(--fm)", fontSize: ".46rem", fontWeight: 700, letterSpacing: "1.5px", color: "var(--t45)", textTransform: "uppercase" }}>GPS Shared</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: ".82rem", fontWeight: 700, color: "#22c55e", marginTop: 4 }}>Every 30s ✓</div>
        </div>
      </div>

      <button onClick={onRevealSOS}
        style={{ width: "100%", padding: 11, borderRadius: 8, border: "1px solid rgba(236,72,153,0.35)", background: "rgba(236,72,153,0.1)", color: "#ec4899", fontFamily: "var(--fm)", fontSize: ".55rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "all .2s" }}>
        🔓 Reveal SOS to Paramedics
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ✅ FIX 6: FAKE UI MASK (Women Safety disguise screen)
════════════════════════════════════════════════════ */
function WomenFakeMask({ active, onReveal }) {
  // ✅ FIX 3: Keyboard Escape Hatch (3 presses within 2 seconds)
  useEffect(() => {
    if (!active) return;
    let escapes = [];
    const handleKey = (e) => {
      if (e.key === "Escape") {
        const now = Date.now();
        escapes = escapes.filter(t => now - t < 2000);
        escapes.push(now);
        if (escapes.length >= 3) {
          onReveal();
          escapes = [];
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [active, onReveal]);

  if (!active) return null;
  return (
    <div className="women-mask-overlay">
      <div className="women-mask-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--amber)", animation: "pulse 2s ease infinite" }} />
          <span style={{ fontFamily: "var(--fd)", fontSize: ".88rem", fontWeight: 800, letterSpacing: "2px", color: "var(--amber)" }}>NexVitals</span>
        </div>
        <span style={{ fontFamily: "var(--fm)", fontSize: ".7rem", color: "var(--t45)" }}>Route Calculator</span>
      </div>
      <div className="women-mask-content">
        <div className="women-mask-card">
          <div style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, letterSpacing: "2px", color: "var(--t45)", textTransform: "uppercase", marginBottom: 10 }}>Navigation · Active Route</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Hyderabad Central · 12.4 km", "KPHB Colony · 7.1 km", "Kukatpally Metro · 3.2 km"].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--s2)", borderRadius: 7, border: "1px solid var(--line)" }}>
                <span style={{ fontFamily: "var(--fb)", fontSize: ".85rem", fontWeight: 600, color: "var(--t70)" }}>{r.split("·")[0]}</span>
                <span style={{ fontFamily: "var(--fm)", fontSize: ".55rem", fontWeight: 700, color: "var(--amber)" }}>{r.split("·")[1]}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "9px 12px", background: "rgba(34,197,94,0.08)", borderRadius: 6, border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s ease infinite" }} />
            <span style={{ fontFamily: "var(--fm)", fontSize: ".5rem", fontWeight: 700, color: "#22c55e", letterSpacing: "1.5px" }}>GPS Active · Signal Strong</span>
          </div>
        </div>
        <div style={{ fontFamily: "var(--fm)", fontSize: ".5rem", fontWeight: 600, letterSpacing: "2px", color: "var(--t45)", textTransform: "uppercase" }}>Tap anywhere 3× to reveal SOS mode</div>
      </div>
      {/* Hidden SOS indicator */}
      <div className="women-hidden-active" title="SOS Active" onClick={onReveal} style={{ cursor: "pointer" }} />
      {/* Triple-tap zone covering full screen */}
      <TripleTapZone onTripleTap={onReveal} />

      {/* ✅ FIX 3: Invisible emergency reveal button at bottom right */}
      <button
        onClick={onReveal}
        style={{ position: "fixed", bottom: 0, right: 0, width: 60, height: 60, opacity: 0, zIndex: 9999, border: "none", cursor: "pointer" }}
        aria-label="Reveal Emergency Interface"
      />
    </div>
  );
}

function TripleTapZone({ onTripleTap }) {
  const taps = useRef([]);
  const handleTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter(t => now - t < 1000), now];
    if (taps.current.length >= 3) { taps.current = []; onTripleTap(); }
  };
  return <div style={{ position: "absolute", inset: 0, zIndex: 670, cursor: "default" }} onClick={handleTap} />;
}

/* ════════════════════════════════════════════════════
   STATE RAIL
════════════════════════════════════════════════════ */
function StateRail({ currentState, isOffline }) {
  const ci = STATE_ORDER.indexOf(currentState);
  const show = currentState !== SYS.NORMAL;
  return (
    // ✅ FIX 4: Shift down if offline indicator is visible
    <div className={`rail ${show ? "show" : "hide"}`} style={{ top: 46 + (isOffline ? 32 : 0) }}>
      <div className="rail-inner">
        {RAIL_STEPS.map((step, i) => {
          const si = STATE_ORDER.indexOf(step.state);
          const done = si < ci, active = si === ci, pend = si > ci;
          const meta = STATE_META[step.state];
          return (
            <div key={step.state} className="rail-step">
              <div className={`rail-node ${done ? "done" : active ? "active" : "pend"}`}>
                <span style={{ fontSize: ".8rem", opacity: pend ? .4 : 1 }}>{step.icon}</span>
                <span className="rail-label" style={{ color: active ? meta.color : done ? "#22c55e" : "var(--t45)" }}>{step.label}</span>
                {active && <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color, animation: "pulse 1.5s ease infinite", flexShrink: 0 }} />}
              </div>
              {i < RAIL_STEPS.length - 1 && <div className={`rail-conn ${done || active ? "done" : "pend"}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   INSTRUCTION CARD
════════════════════════════════════════════════════ */
function InstructionCard({ sysState }) {
  const inst = USER_INSTRUCTIONS[sysState];
  if (!inst) return null;
  return (
    <div className="instruction-card" style={{ background: `${inst.color}10`, border: `1px solid ${inst.color}35` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: "1.5rem" }}>{inst.icon}</span>
        <div>
          <div style={{ fontFamily: "var(--fd)", fontSize: "1.1rem", fontWeight: 800, color: inst.color }}>{inst.heading}</div>
          <div style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, letterSpacing: "2px", color: "var(--t45)", marginTop: 2, textTransform: "uppercase" }}>What you should do</div>
        </div>
        {/* ✅ FIX 3: Haptic badge in instruction */}
        <div style={{ marginLeft: "auto" }}><HapticBadge /></div>
      </div>
      {inst.steps.map((step, i) => (
        <div key={i} className="instruction-step" style={{ animationDelay: `${i * 0.07}s`, borderBottom: i < inst.steps.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
          <div className="instruction-step-num" style={{ background: `${inst.color}20`, borderColor: `${inst.color}45`, color: inst.color }}>{i + 1}</div>
          <div className="instruction-step-text">{step}</div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ETA CARD
════════════════════════════════════════════════════ */
function ETACard({ assignedHelper, sysState }) {
  const [etaMins, setEtaMins] = useState(assignedHelper?.etaMins || 6);
  const [progress, setProgress] = useState(0);
  const total = useRef(assignedHelper?.etaMins || 6);
  useEffect(() => {
    if (sysState !== SYS.EN_ROUTE && sysState !== SYS.AMBULANCE_ASSIGNED) return;
    const t = setInterval(() => {
      setEtaMins(p => Math.max(0, p - 1 / 60));
      setProgress(p => Math.min(100, p + 100 / (total.current * 60)));
    }, 1000);
    return () => clearInterval(t);
  }, [sysState]);
  const color = etaMins <= 1 ? "#ef4444" : etaMins <= 2.5 ? "#fbbf24" : "#22c55e";
  const trackStops = [
    { label: "Dispatch", done: true, color: "#ef4444" },
    { label: "Assigned", done: sysState !== SYS.ALERT_TRIGGERED, color: "#f97316" },
    { label: "En Route", done: sysState === SYS.EN_ROUTE, color: "#fbbf24" },
    { label: "Arrival", done: false, color: "#22c55e" },
  ];
  return (
    <div className="card" style={{ borderColor: `${color}40` }}>
      <div className="card-accent" style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      <div style={{ padding: "20px 20px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="eta-big" style={{ color }}>{Math.ceil(etaMins)}</div>
            <div className="eta-unit">MINUTES AWAY</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, letterSpacing: "2px", color: "var(--t45)", textTransform: "uppercase", marginBottom: 8 }}>Assigned Responder</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>🚑</div>
              <div>
                <div style={{ fontFamily: "var(--fd)", fontSize: ".92rem", fontWeight: 700, color: "var(--t90)" }}>{assignedHelper?.name || "Unit 42"}</div>
                <div style={{ fontFamily: "var(--fm)", fontSize: ".5rem", fontWeight: 600, letterSpacing: "1.5px", color: `${color}CC`, marginTop: 2 }}>{assignedHelper?.unitId || "NexVitals-AMB-042"}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="track-bar">
          <div className="track-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg,#ef4444,${color})` }} />
        </div>
        <div className="track-stops">
          {trackStops.map((s, i) => (
            <div key={i} className="track-stop">
              <div className="track-dot" style={{ background: s.done ? s.color : "var(--s3)", border: `1.5px solid ${s.done ? s.color : "var(--line)"}`, animation: s.done && i === trackStops.filter(x => x.done).length - 1 ? "pulse 1.5s ease infinite" : "none" }} />
              <span className="track-lbl" style={{ color: s.done ? s.color : "var(--t45)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   CONSCIOUSNESS CHECK
════════════════════════════════════════════════════ */
function ConsciousnessCheck({ helperName }) {
  const [countdown, setCountdown] = useState(null);
  const [status, setStatus] = useState(null);
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    const f = setTimeout(() => setShow(true), 10000);
    const r = setInterval(() => { setShow(true); setCountdown(30); }, 40000);
    return () => { clearTimeout(f); clearInterval(r); };
  }, []);
  useEffect(() => {
    if (!show) return;
    setCountdown(30);
    timerRef.current = setInterval(() => setCountdown(c => {
      if (c <= 1) { clearInterval(timerRef.current); handleResp("UNRESPONSIVE"); return null; }
      return c - 1;
    }), 1000);
    return () => clearInterval(timerRef.current);
  }, [show]); // eslint-disable-line
  const handleResp = (r) => { setStatus(r); setShow(false); };
  return (
    <div className="card">
      <div className="card-accent" style={{ background: "linear-gradient(90deg,transparent,rgba(251,191,36,0.5),transparent)" }} />
      <div className="card-head">
        <CardTitle icon="🧠" label="Consciousness Monitor" />
        <Chip label="Active" color="#fbbf24" pulse />
      </div>
      <div className="card-body">
        {show ? (
          <div className="consc-wrap">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontFamily: "var(--fb)", fontSize: ".88rem", fontWeight: 700, color: "var(--t90)" }}>Are you conscious?</span>
              <span className="consc-cd" style={{ color: countdown <= 10 ? "#ef4444" : "#fbbf24" }}>{countdown}s</span>
            </div>
            <div className="consc-btns">
              {[["I'm OK", "#22c55e", "OK"], ["In Pain", "#fbbf24", "IN PAIN"], ["Need Help", "#ef4444", "UNRESPONSIVE"]].map(([lbl, c, r]) => (
                <button key={lbl} className="consc-btn" style={{ borderColor: `${c}50`, color: c }}
                  onMouseEnter={e => e.currentTarget.style.background = `${c}15`}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--s2)"}
                  onClick={() => handleResp(r)}>{lbl}</button>
              ))}
            </div>
            <div style={{ marginTop: 12, fontFamily: "var(--fm)", fontSize: ".48rem", fontWeight: 600, letterSpacing: "1.5px", color: "var(--t45)" }}>No response → auto-escalates to emergency</div>
          </div>
        ) : status ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0" }}>
            <Chip label={status} color={status === "UNRESPONSIVE" ? "#ef4444" : status === "IN PAIN" ? "#fbbf24" : "#22c55e"} pulse={status === "UNRESPONSIVE"} />
            <span style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 600, letterSpacing: "1.5px", color: "var(--t45)" }}>Logged · Next check in ~40s</span>
          </div>
        ) : (
          <div style={{ padding: "6px 0", fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 600, letterSpacing: "1.5px", color: "var(--t45)" }}>Monitoring active — check-in every 40 seconds</div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   AT SCENE CARD
════════════════════════════════════════════════════ */
function AtSceneCard({ aiAnalysis, assignedHelper, onTransferToHospital }) {
  const sc = { CRITICAL: "#ef4444", SEVERE: "#ef4444", MODERATE: "#fbbf24", MILD: "#22c55e" }[aiAnalysis?.severity] || "#3b82f6";
  return (
    <div className="card" style={{ borderColor: "rgba(59,130,246,0.4)", boxShadow: "0 0 28px rgba(59,130,246,0.12)" }}>
      <div className="card-accent" style={{ background: "linear-gradient(90deg,transparent,rgba(59,130,246,0.8),transparent)" }} />
      <div style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.15),rgba(59,130,246,0.04))", padding: "18px", borderBottom: "1px solid rgba(59,130,246,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <CardTitle icon="⊕" label="Paramedics On Scene" />
          <Chip label="Assessment Active" color="#3b82f6" pulse />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.38)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>👨‍⚕️</div>
          <div>
            <div style={{ fontFamily: "var(--fd)", fontSize: ".92rem", fontWeight: 700, color: "var(--t90)" }}>{assignedHelper?.name || "Unit 42"}</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: ".5rem", fontWeight: 600, letterSpacing: "1.5px", color: "rgba(59,130,246,.9)", marginTop: 2 }}>Paramedic · On scene</div>
          </div>
        </div>
        {aiAnalysis && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, padding: "9px 12px", background: "rgba(0,0,0,0.3)", borderRadius: 7, flexWrap: "wrap" }}>
            <Chip label={aiAnalysis.severity} color={sc} />
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontFamily: "var(--fm)", fontSize: ".5rem", fontWeight: 600, color: "var(--t45)" }}>Confidence</span>
              <div style={{ width: 70, height: 3, background: "var(--s3)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${aiAnalysis.confidence}%`, background: sc, borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: "var(--fm)", fontSize: ".62rem", fontWeight: 800, color: sc }}>{aiAnalysis.confidence}%</span>
            </div>
          </div>
        )}
      </div>
      <div className="scene-vital-grid">
        {[["Status", "Stabilising", "#3b82f6"], ["Trauma Level", aiAnalysis?.severity || "CRITICAL", sc], ["Oxygen", "Administered", "#22c55e"], ["IV Line", "Established", "#fbbf24"]].map(([lbl, val, c]) => (
          <div key={lbl} className="scene-vital">
            <div className="scene-vital-label">{lbl}</div>
            <div className="scene-vital-val" style={{ color: c, fontSize: "clamp(.82rem,2vw,1.1rem)" }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 14px 14px" }}>
        <button style={{ width: "100%", padding: 12, borderRadius: 7, border: "1px solid rgba(59,130,246,0.4)", background: "rgba(59,130,246,0.12)", color: "#3b82f6", fontFamily: "var(--fm)", fontSize: ".58rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "all .2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.22)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.12)"}
          onClick={onTransferToHospital}>Transfer to Hospital →</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   HOSPITAL MODE CARD
════════════════════════════════════════════════════ */
function HospitalModeCard({ aiAnalysis, assignedHospital }) {
  const mrn = `MRN-${Date.now().toString().slice(-8)}`;
  const now = new Date().toLocaleTimeString("en-IN", { hour12: false });
  const steps = [
    { icon: "🚑", label: "Emergency Intake", sub: "Auto-triaged · AI severity pre-loaded", time: now, done: true, color: "#ec4899" },
    { icon: "🛏", label: "Bed Assigned", sub: "ICU-Trauma · Bed 04 · Dr. Priya Mehta", time: now, done: true, color: "#3b82f6" },
    { icon: "🩺", label: "Assessment", sub: "Medical team assessment in progress", time: "Ongoing", done: true, color: "#fbbf24" },
    { icon: "🧪", label: "Diagnostics", sub: "CT Scan & labs ordered · ~25 mins", time: "Pending", done: false, color: "#22c55e" },
    { icon: "🏠", label: "Discharge", sub: "Subject to diagnostic results", time: "TBD", done: false, color: "#8b5cf6" },
  ];
  return (
    <div className="card" style={{ border: "1px solid rgba(139,92,246,0.4)", boxShadow: "0 0 36px rgba(139,92,246,0.12)", background: "linear-gradient(135deg,rgba(139,92,246,0.08),rgba(11,15,25,0.95))" }}>
      <div className="card-accent" style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.8),transparent)" }} />
      <div style={{ padding: "22px", borderBottom: "1px solid rgba(139,92,246,0.18)", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, letterSpacing: "3px", color: "rgba(139,92,246,.9)", textTransform: "uppercase", marginBottom: 7 }}>{mrn}</div>
        <div style={{ fontFamily: "var(--fd)", fontSize: "1.55rem", fontWeight: 800, color: "var(--t90)" }}>Patient Mode Active</div>
        <div style={{ fontSize: ".88rem", color: "var(--t45)", marginTop: 3 }}>{assignedHospital?.name || "Care Hospital, Hyderabad"}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
          <Chip label="Admitted" color="#22c55e" />
          <Chip label={`Severity: ${aiAnalysis?.severity || "CRITICAL"}`} color="#ef4444" pulse />
          <Chip label="Team Ready" color="#3b82f6" />
        </div>
      </div>
      <div style={{ padding: "16px 18px" }}>
        {steps.map((s, i) => (
          <div key={i} className="care-step">
            <div className="care-icon" style={{ background: `${s.color}15`, borderColor: `${s.color}${s.done ? "55" : "22"}`, opacity: s.done ? 1 : 0.5 }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="care-title" style={{ color: s.done ? "var(--t90)" : "var(--t45)" }}>{s.label}</div>
              <div className="care-sub">{s.sub}</div>
              <div className="care-time" style={{ color: s.done ? s.color : "var(--t45)" }}>{s.time}</div>
            </div>
            {s.done && <div style={{ width: 16, height: 16, borderRadius: "50%", background: `${s.color}18`, border: `1px solid ${s.color}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: ".56rem", color: s.color }}>✓</div>}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 9, padding: "0 18px 18px" }}>
        {[["📋 Records", "rgba(139,92,246,0.1)", "rgba(139,92,246,0.28)", "#8b5cf6"],
        ["💊 Meds", "rgba(59,130,246,0.1)", "rgba(59,130,246,0.28)", "#3b82f6"],
        ["📞 Family", "rgba(34,197,94,0.1)", "rgba(34,197,94,0.28)", "#22c55e"]].map(([lbl, bg, bd, c]) => (
          <button key={lbl} style={{ flex: 1, height: 38, borderRadius: 7, border: `1px solid ${bd}`, background: bg, color: c, fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", transition: "all .2s" }}>{lbl}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   LIVE MAP
════════════════════════════════════════════════════ */
function LiveMap({ lat, lng, hospitals, sysState, assignedHelper }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const userMkRef = useRef(null);
  const ambMkRef = useRef(null);
  const routeRef = useRef(null);
  const ambAnimRef = useRef(null);

  useEffect(() => {
    let destroyed = false;
    loadLeaflet().then((L) => {
      if (destroyed || !divRef.current || mapRef.current) return;
      const ro = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        if (width === 0 || height === 0) return;
        ro.disconnect();
        if (destroyed || mapRef.current) return;
        const map = L.map(divRef.current, { center: [lat, lng], zoom: 14, zoomControl: false, attributionControl: true });
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19, attribution: "© CARTO" }).addTo(map);
        L.control.zoom({ position: "bottomright" }).addTo(map);
        const userIcon = L.divIcon({ className: "", html: `<div style="width:15px;height:15px;border-radius:50%;background:#fbbf24;border:3px solid #111827;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`, iconSize: [15, 15], iconAnchor: [7, 7] });
        userMkRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup("<b style='font-family:monospace;color:#fbbf24'>Your Location</b>");
        hospitals.forEach(h => {
          const hIcon = L.divIcon({ className: "", html: `<div style="width:26px;height:26px;border-radius:50%;background:#1f2937;border:2px solid #ec4899;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 7px rgba(236,72,153,.35)">🏥</div>`, iconSize: [26, 26], iconAnchor: [13, 13] });
          L.marker([h.lat, h.lng], { icon: hIcon }).addTo(map).bindPopup(`<div style="font-family:monospace;min-width:150px;background:#1f2937;color:#f8fafc;padding:5px;border-radius:5px"><b style="color:#ec4899">${h.name}</b><br><span style="color:#94a3b8;font-size:11px">${h.distance} · ETA ${h.eta}</span></div>`);
        });
        mapRef.current = map;
      });
      ro.observe(divRef.current);
    });
    return () => { destroyed = true; if (ambAnimRef.current) clearInterval(ambAnimRef.current); if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!mapRef.current || !userMkRef.current) return;
    userMkRef.current.setLatLng([lat, lng]);
  }, [lat, lng]);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current) return;
    if (sysState === SYS.EN_ROUTE || sysState === SYS.AMBULANCE_ASSIGNED) {
      const startLat = lat + 0.025, startLng = lng + 0.018;
      if (!ambMkRef.current) {
        const ambIcon = L.divIcon({ className: "", html: `<div style="width:30px;height:30px;border-radius:50%;background:#f97316;border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 12px rgba(249,115,22,.6)">🚑</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
        ambMkRef.current = L.marker([startLat, startLng], { icon: ambIcon }).addTo(mapRef.current).bindPopup(`<b style='font-family:monospace;color:#f97316'>${assignedHelper?.name || "Unit 42"}</b>`);
      }
      if (routeRef.current) { routeRef.current.remove(); routeRef.current = null; }
      routeRef.current = L.polyline([[startLat, startLng], [lat, lng]], { color: "#f97316", weight: 3, dashArray: "8 6", opacity: 0.7 }).addTo(mapRef.current);
      let t = 0;
      if (ambAnimRef.current) clearInterval(ambAnimRef.current);
      ambAnimRef.current = setInterval(() => {
        t = Math.min(1, t + 0.002);
        const curLat = startLat + (lat - startLat) * t;
        const curLng = startLng + (lng - startLng) * t;
        ambMkRef.current?.setLatLng([curLat, curLng]);
        if (t >= 1) { clearInterval(ambAnimRef.current); ambAnimRef.current = null; }
      }, 500);
    } else {
      if (ambAnimRef.current) { clearInterval(ambAnimRef.current); ambAnimRef.current = null; }
      if (ambMkRef.current) { ambMkRef.current.remove(); ambMkRef.current = null; }
      if (routeRef.current) { routeRef.current.remove(); routeRef.current = null; }
    }
  }, [sysState]); // eslint-disable-line

  const borderColor = {
    [SYS.NORMAL]: "var(--line)", [SYS.ALERT_TRIGGERED]: "rgba(239,68,68,0.45)",
    [SYS.AMBULANCE_ASSIGNED]: "rgba(249,115,22,0.45)", [SYS.EN_ROUTE]: "rgba(251,191,36,0.45)",
    [SYS.AT_SCENE]: "rgba(59,130,246,0.45)", [SYS.AT_HOSPITAL]: "rgba(139,92,246,0.45)",
  }[sysState];

  return (
    <div className="map-wrap" style={{ borderColor }}>
      <div className="card-accent" style={{ background: `linear-gradient(90deg,transparent,${borderColor},transparent)` }} />
      <div className="map-canvas">
        <div ref={divRef} style={{ width: "100%", height: 360, minHeight: 240 }} />
        <div className="map-hud">
          <div className="map-coords">{lat.toFixed(4)}° N, {lng.toFixed(4)}° E</div>
          <div className="map-area">Vaddeswaram, AP</div>
        </div>
        <div className="map-gps">
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.8s ease infinite" }} />
          GPS LOCKED
        </div>
        {sysState !== SYS.NORMAL && (
          <div style={{ position: "absolute", top: 60, left: 14, zIndex: 500, display: "flex", flexDirection: "column", gap: 7 }}>
            <Chip label="Broadcasting Location" color="#ef4444" pulse />
            {assignedHelper && sysState === SYS.EN_ROUTE && (
              <div style={{ background: "rgba(17,24,39,0.94)", border: "1px solid rgba(249,115,22,0.45)", borderRadius: 5, padding: "5px 10px" }}>
                <span style={{ fontFamily: "var(--fm)", fontSize: ".52rem", color: "#f97316", fontWeight: 700 }}>{assignedHelper.name} · ETA {assignedHelper.eta}</span>
              </div>
            )}
          </div>
        )}
        {hospitals.length > 0 && (
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${hospitals[0].lat},${hospitals[0].lng}&travelmode=driving`} target="_blank" rel="noreferrer"
            style={{ position: "absolute", bottom: 18, right: 18, zIndex: 499, display: "flex", alignItems: "center", gap: 7, height: 38, padding: "0 18px", borderRadius: 7, background: "var(--blue)", border: "none", color: "#fff", fontFamily: "var(--fm)", fontSize: ".58rem", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", textDecoration: "none" }}>↗ Navigate</a>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   HEALTH MONITOR
════════════════════════════════════════════════════ */
function HealthMonitor({ sysState }) {
  const isAcc = sysState !== SYS.NORMAL;

  // ✅ FIX 2: Vitals State Fix
  const [v, setV] = useState({ hr: 80, spo2: 96, bp: "120/80", temp: 36.4, rr: 16 });
  const prevVRef = useRef({ hr: 80, spo2: 96, bp: "120/80", temp: 36.4, rr: 16 });

  const updateVitals = useCallback(() => {
    setV((p) => {
      const prev = prevVRef.current;

      // Calculate target values
      const nextHr = isAcc ? Math.min(145, p.hr + Math.floor(Math.random() * 4)) : Math.max(68, Math.min(88, p.hr + Math.floor(Math.random() * 3) - 1));
      const nextSpo2 = isAcc ? Math.max(88, p.spo2 - (Math.random() > .7 ? 1 : 0)) : Math.min(99, Math.max(95, p.spo2 + (Math.random() > .5 ? 1 : -1)));
      const nextTemp = parseFloat((isAcc ? Math.min(38.4, p.temp + .04) : 36.2 + Math.random() * .5).toFixed(1));
      const nextRr = isAcc ? Math.min(30, p.rr + Math.floor(Math.random() * 3)) : Math.max(12, Math.min(20, p.rr + Math.floor(Math.random() * 3) - 1));

      // Apply physiological limit guards (HR max 15, SpO2 max 3, RR max 2 per tick)
      const finalHr = Math.max(prev.hr - 15, Math.min(prev.hr + 15, nextHr));
      const finalSpo2 = Math.max(prev.spo2 - 3, Math.min(prev.spo2 + 3, nextSpo2));
      const finalRr = Math.max(prev.rr - 2, Math.min(prev.rr + 2, nextRr));

      const newV = { hr: finalHr, spo2: finalSpo2, bp: isAcc ? "148/96" : "120/80", temp: nextTemp, rr: finalRr };
      prevVRef.current = newV;
      return newV;
    });
  }, [isAcc]);

  useEffect(() => {
    const t = setInterval(updateVitals, 2500);
    return () => clearInterval(t);
  }, [updateVitals]);

  const hc = v.hr > 110 ? "#ef4444" : v.hr > 92 ? "#fbbf24" : "#22c55e";
  const sc = v.spo2 < 92 ? "#ef4444" : v.spo2 < 95 ? "#fbbf24" : "#3b82f6";
  const tc = v.temp > 37.8 ? "#ef4444" : v.temp > 37.2 ? "#fbbf24" : "#22c55e";

  const cards = [
    { label: "Heart Rate", val: v.hr, unit: "bpm", color: hc, pct: Math.min(100, ((v.hr - 50) / 130) * 100), status: v.hr > 110 ? "Elevated" : "Normal", beat: true },
    { label: "SpO₂", val: v.spo2, unit: "%", color: sc, pct: Math.min(100, ((v.spo2 - 80) / 20) * 100), status: v.spo2 < 92 ? "Critical" : "Normal" },
    { label: "Blood Pressure", val: v.bp, unit: "mmHg", color: isAcc ? "#fbbf24" : "#3b82f6", pct: isAcc ? 72 : 55, status: isAcc ? "Elevated" : "Normal" },
    { label: "Temperature", val: v.temp, unit: "°C", color: tc, pct: Math.min(100, ((v.temp - 35) / 5) * 100), status: v.temp > 37.8 ? "Fever" : "Normal" },
  ];
  return (
    <div className={`card${isAcc ? " em-flash" : ""}`}>
      <div className="card-accent" style={{ background: `linear-gradient(90deg,transparent,${isAcc ? "rgba(239,68,68,.7)" : "rgba(239,68,68,.35)"},transparent)` }} />
      <div className="card-head">
        <CardTitle icon="🫀" label="Live Biometrics" />
        <Chip label={isAcc ? "Critical" : "Normal"} color={isAcc ? "#ef4444" : "#22c55e"} pulse={isAcc} />
      </div>
      <div className="card-body">
        <div className="bio-grid">
          {cards.map(b => (
            <div key={b.label} className="bio-card" style={{ borderColor: `${b.color}22` }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 70, height: 70, background: `radial-gradient(circle at top right,${b.color}12,transparent 65%)`, pointerEvents: "none" }} />
              <div className="bio-label">{b.label}</div>
              <div className="bio-val" style={{ color: b.color }}>{b.beat ? <span className="hr-beat">{b.val}</span> : b.val}</div>
              <div className="bio-unit">{b.unit}</div>
              <div className="bio-bar"><div className="bio-bar-fill" style={{ width: `${b.pct}%`, background: b.color }} /></div>
              <div className="bio-status">
                <div className="bio-sdot" style={{ background: b.color }} />
                <span className="bio-stext" style={{ color: b.color }}>{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   AI CHAT
════════════════════════════════════════════════════ */
function IVERASChat({ isOpen, onClose, userVehicle, location, sysState }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "NexVitals AI active. State your emergency and I'll guide you through it step by step." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const send = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    const userMsg = { role: "user", content };
    setMessages(p => [...p, userMsg]); setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You are NexVitals AI, a professional emergency response assistant. Be calm, precise, authoritative.
Emergency numbers: Police 100, Ambulance 108, Fire 101.
Vehicle: ${userVehicle}. GPS: ${location?.lat?.toFixed(4)},${location?.lng?.toFixed(4)}. State: ${sysState}.
Keep responses concise and actionable. (1) Assess, (2) Immediate steps, (3) What help is coming.`,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages(p => [...p, { role: "assistant", content: data.content?.[0]?.text || "Connection issue. Call 108 immediately." }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Connection lost.\n• Ambulance: 108\n• Police: 100\n• Fire: 101" }]);
    }
    setLoading(false);
  };
  if (!isOpen) return null;
  return (
    <div className="chat-wrap">
      <div className="chat-inner">
        <div className="chat-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--amber)", animation: "pulse 1.8s ease infinite" }} />
            <div>
              <div style={{ fontFamily: "var(--fd)", fontSize: ".88rem", fontWeight: 800, color: "var(--amber)" }}>NexVitals AI</div>
              <div style={{ fontFamily: "var(--fm)", fontSize: ".48rem", fontWeight: 600, letterSpacing: "1.5px", color: "var(--t45)", marginTop: 2 }}>Emergency Assistant · {sysState}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="chat-msgs">
          {messages.map((m, i) => (
            <div key={i} className="chat-msg" style={{ alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div className="chat-lbl">{m.role === "user" ? "YOU" : "NexVitals AI"}</div>
              <div className="chat-bub" style={{ background: m.role === "user" ? "var(--s2)" : "rgba(251,191,36,0.08)", borderColor: m.role === "user" ? "var(--line2)" : "rgba(251,191,36,0.25)", borderRadius: m.role === "user" ? "9px 9px 2px 9px" : "9px 9px 9px 2px" }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, color: "var(--t45)" }}>Analyzing</span>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--amber)", animation: `blink 1.2s infinite ${i * .2}s` }} />)}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="chat-quick-row">
          {["Nearest hospital", "First aid steps", "I'm stranded", "Call ambulance"].map(q => (
            <button key={q} className="chat-quick" onClick={() => send(q)}>{q}</button>
          ))}
        </div>
        <div className="chat-foot">
          <input className="chat-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Describe your situation..." />
          <button className="chat-send" disabled={loading || !input.trim()} style={{ background: (loading || !input.trim()) ? "var(--s3)" : "var(--amber)", color: (loading || !input.trim()) ? "var(--t45)" : "#000" }} onClick={() => send()}>SEND</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TOASTS
════════════════════════════════════════════════════ */
function ToastContainer({ toasts, dismiss }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className="toast" style={{ borderLeft: `4px solid ${t.color || "#22c55e"}` }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.color || "#22c55e", animation: "pulse 1.5s ease infinite", flexShrink: 0, marginTop: 4 }} />
          <div style={{ flex: 1 }}>
            <div className="toast-title" style={{ color: t.color || "#22c55e" }}>{t.title}</div>
            <div className="toast-msg">{t.message}</div>
          </div>
          <button className="toast-close" onClick={() => dismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MODAL
════════════════════════════════════════════════════ */
function Modal({ isOpen, onClose, title, accentColor = "#fbbf24", children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head"><div className="modal-ttl" style={{ color: accentColor }}>{title}</div><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ✅ FIX 2: HOLD-TO-CANCEL BUTTON
════════════════════════════════════════════════════ */
function HoldToCancelButton({ onConfirmCancel }) {
  const [holding, setHolding] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const holdTimerRef = useRef(null);
  const progressRef = useRef(null);

  const startHold = () => {
    setHolding(true);
    triggerHaptic([50]);
    holdTimerRef.current = setTimeout(() => {
      setHolding(false);
      setShowConfirm(true);
    }, 2000);
  };

  const endHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    setHolding(false);
  };

  return (
    <>
      <div className="float-cancel-zone">
        <button
          className="hold-cancel-btn"
          onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
          onTouchStart={startHold} onTouchEnd={endHold}
        >
          <div
            className={`hold-cancel-progress ${holding ? "filling" : ""}`}
            ref={progressRef}
            key={holding ? "filling" : "idle"}
          />
          <span style={{ position: "relative", zIndex: 1 }}>
            {holding ? "⏳ Hold to confirm cancel…" : "✕ Hold to Cancel Emergency"}
          </span>
        </button>
        <div className="hold-cancel-hint">Hold for 2 seconds to cancel</div>
      </div>

      {/* Confirmation popup */}
      {showConfirm && (
        <div className="cancel-confirm-popup">
          <div className="cancel-confirm-box">
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
            <div style={{ fontFamily: "var(--fd)", fontSize: "1.1rem", fontWeight: 800, color: "var(--t90)", marginBottom: 8 }}>Cancel Emergency?</div>
            <div style={{ fontSize: ".85rem", color: "var(--t70)", lineHeight: 1.6, marginBottom: 24 }}>
              This will notify all dispatched units and cancel the emergency. Only cancel if the situation is fully resolved.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: 14, borderRadius: 9, border: "1px solid var(--line2)", background: "var(--s2)", color: "var(--t70)", fontFamily: "var(--fm)", fontSize: ".6rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                Keep Active
              </button>
              <button
                onClick={() => { setShowConfirm(false); onConfirmCancel(); triggerHaptic([100, 50, 100]); }}
                style={{ flex: 1, padding: 14, borderRadius: 9, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.12)", color: "#ef4444", fontFamily: "var(--fm)", fontSize: ".6rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════════════ */
export default function UserDashboard() {
  const navigate = useNavigate();

  // ── Dynamic user profile from DynamoDB ──────────────────────────────────
  const [userProfile, setUserProfile] = useState(() => {
    // Seed from localStorage immediately so UI isn't blank on first render
    try {
      const cached = JSON.parse(localStorage.getItem("user")) || {};
      return cached;
    } catch { return {}; }
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const cached = (() => {
      try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
    })();
    const userId = cached.userId;
    if (!userId) return;

    setProfileLoading(true);
    fetch(`/api/user/${userId}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        // Merge fresh data into localStorage so it stays up-to-date
        const merged = { ...cached, ...data };
        localStorage.setItem("user", JSON.stringify(merged));
        setUserProfile(merged);
      })
      .catch(err => {
        console.warn("Could not refresh profile from server:", err.message);
        setProfileError(err.message);
        // Fall back to cached data — already set in initial state
      })
      .finally(() => setProfileLoading(false));
  }, []);

  // Derived USER object — updates whenever userProfile changes
  const USER = useMemo(() => {
    const userName = userProfile.name || "User";
    const userInitials = userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U";
    const vehicleLabel = userProfile.vehicle || "—";
    const vehicleType = userProfile.vehicleType || "2-Wheeler";

    return {
      name: userName,
      initials: userInitials,
      uid: userProfile.userId || "NexVitals-USR-00000",
      vehicle: vehicleLabel,
      model: vehicleType,
      email: userProfile.email || "",
      phone: userProfile.phone || "",
      blood: userProfile.blood || "",
      conditions: userProfile.conditions || "",
      allergies: userProfile.allergies || "",
      emergency1: userProfile.emergency1 || "",
      emergency2: userProfile.emergency2 || "",
      hw: [
        { label: "System", val: "Active", color: "#22c55e" },
        { label: "GPS", val: "Locked", color: "#22c55e" },
        { label: "Sensors", val: "Online", color: "#22c55e" },
        { label: "Network", val: "4G", color: "#fbbf24" },
      ],
    };
  }, [userProfile]);

  const [sysState, setSysState] = useState(SYS.NORMAL);
  const [location, setLocation] = useState({ lat: 16.4307, lng: 80.6480 });
  const [clock, setClock] = useState("");
  const [sosTrigger, setSosTrigger] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(null);
  const sosTimerRef = useRef(null);

  // ✅ FIX 6: Women safety mask state
  const [womenMaskActive, setWomenMaskActive] = useState(false);

  // ✅ FIX 1: Main SOS Arm State
  const [mainSosArmed, setMainSosArmed] = useState(false);
  const [mainSosCountdown, setMainSosCountdown] = useState(3);
  const mainSosTimerRef = useRef(null);

  // ✅ FIX 4: Offline Indicator State
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [chatOpen, setChatOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [assignedHelper, setAssignedHelper] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [reportImage, setReportImage] = useState(null);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const [alertLog, setAlertLog] = useState(INIT_ALERTS);
  const [assignedHospital, setAssignedHospital] = useState(null);

  // ✅ FIX 5: Family notification state
  const [familyNotified, setFamilyNotified] = useState(false);
  const [familyNotifTime, setFamilyNotifTime] = useState("");

  const [fetchedHospitals, setFetchedHospitals] = useState([]);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [nearbyMechanics, setNearbyMechanics] = useState([]);
  const [loadingMech, setLoadingMech] = useState(false);
  const [fuelStatus, setFuelStatus] = useState("idle");
  const [fuelAmount, setFuelAmount] = useState("");
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [sosType, setSosType] = useState(null);

  const isEmergency = sysState !== SYS.NORMAL;

  /* ✅ FIX 4: Listen to connection state */
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  /* Clock */
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  /* GPS */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }), () => { });
  }, []);

  /* Auto-advance AMBULANCE_ASSIGNED → EN_ROUTE */
  useEffect(() => {
    if (sysState === SYS.AMBULANCE_ASSIGNED) {
      const t = setTimeout(() => {
        setSysState(SYS.EN_ROUTE);
        addToast({ title: "Unit En Route", message: `${assignedHelper?.name || "Unit 42"} is now approaching your location.`, color: "#fbbf24" });
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [sysState]); // eslint-disable-line

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts(p => [...p, { ...toast, id }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 6000);
  }, []);
  const dismissToast = id => setToasts(p => p.filter(t => t.id !== id));

  const logAlert = (type, icon, action, severity = "info") => {
    const colorMap = { critical: "#ef4444", warning: "#fbbf24", info: "#3b82f6" };
    const color = colorMap[severity] || "#3b82f6";
    setAlertLog(p => [{
      id: Date.now(), type, icon,
      color, bg: `${color}15`, border: `${color}35`,
      time: new Date().toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }),
      action, status: "Active", statusColor: color,
    }, ...p]);
  };

  /* ✅ FIX 5: Notify family when emergency starts */
  const notifyFamily = () => {
    if (!familyNotified) {
      const time = new Date().toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit" });
      setFamilyNotified(true);
      setFamilyNotifTime(time);
      addToast({ title: "👩 Family Notified", message: "Meera (+91 98765 43210) · Location shared", color: "#22c55e" });
    }
  };

  /* Silent SOS */
  const handleSOS = () => {
    if (sosTrigger) { setSosTrigger(false); addToast({ title: "SOS Deactivated", message: "Silent alert cancelled.", color: "#22c55e" }); return; }
    if (sosCountdown !== null) { clearInterval(sosTimerRef.current); setSosCountdown(null); return; }
    setSosCountdown(5);
    sosTimerRef.current = setInterval(() => setSosCountdown(c => {
      if (c <= 1) {
        clearInterval(sosTimerRef.current);
        setSosTrigger(true);
        setSosCountdown(null);
        // ✅ FIX 6: Activate women mask
        setWomenMaskActive(true);
        playSOSBeeps();
        triggerHaptic([100, 50, 100, 50, 100]);
        addToast({ title: "⚑ Women Safety SOS Activated", message: "Silent alert sent. Screen disguised.", color: "#ec4899" });
        return null;
      }
      return c - 1;
    }), 1000);
  };

  /* Accident flow */
  const analyzeAccidentImage = async (imageData) => {
    setImageAnalyzing(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `Respond ONLY with JSON: {"severity":"CRITICAL|SEVERE|MODERATE|MILD","confidence":0-100,"label":"brief description","injuries_likely":true|false,"hrSpike":"140-150","sewsScore":"6-9"}`,
          messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageData } }, { type: "text", text: "Analyze this accident scene. Include estimated biometric spike and SEWS score in JSON." }] }],
        }),
      });
      const data = await res.json();
      return JSON.parse((data.content?.[0]?.text || "{}").replace(/```json|```/g, "").trim());
    } catch {
      return { severity: "CRITICAL", confidence: 94, label: "High-impact vehicle collision", injuries_likely: true, hrSpike: "142", sewsScore: "7" };
    } finally { setImageAnalyzing(false); }
  };

  const handleReportAccident = async () => {
    let analysis = { severity: "CRITICAL", confidence: 94, label: "High-impact collision detected", injuries_likely: true, hrSpike: "142", sewsScore: "7" };
    if (reportImage) { const base64 = reportImage.split(",")[1]; analysis = await analyzeAccidentImage(base64); }
    setAiAnalysis(analysis);
    setSysState(SYS.ALERT_TRIGGERED);
    // ✅ FIX 3: Audio + haptic on SOS trigger
    playSOSBeeps();
    triggerHaptic([200, 100, 200, 100, 500]);
    // ✅ FIX 5: Notify family immediately
    notifyFamily();
    logAlert("Accident Reported", "💥", "Emergency SOS transmitted. Dispatching nearest unit.", "critical");
    addToast({ title: "⚡ Emergency Alert Sent", message: "SOS transmitted · Locating nearest ambulance…", color: "#ef4444" });
    setActiveModal(null); setReportImage(null);
    setTimeout(() => {
      const helper = { name: "Raju Naik — Unit 42", unitId: "NexVitals-AMB-042", eta: "4 mins", etaMins: 4 };
      setAssignedHelper(helper);
      setSysState(SYS.AMBULANCE_ASSIGNED);
      if (fetchedHospitals.length > 0) setAssignedHospital(fetchedHospitals[0]);
      logAlert("Ambulance Assigned", "🚑", "Unit 42 (Raju Naik) dispatched. ETA 4 mins.", "warning");
      addToast({ title: "🚑 Ambulance Assigned", message: "Unit 42 · ETA 4 mins", color: "#f97316" });
    }, 2000);
  };

  /* ✅ FIX 1: Main SOS 2-Step Trigger */
  const handleMainSosClick = () => {
    if (mainSosArmed) {
      clearInterval(mainSosTimerRef.current);
      setMainSosArmed(false);
      setMainSosCountdown(3);
    } else {
      setMainSosArmed(true);
      setMainSosCountdown(3);
      triggerHaptic([50]);
    }
  };

  useEffect(() => {
    if (mainSosArmed) {
      mainSosTimerRef.current = setInterval(() => {
        setMainSosCountdown(prev => {
          if (prev <= 1) {
            clearInterval(mainSosTimerRef.current);
            return 0; // Trigger completion
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(mainSosTimerRef.current);
    }
  }, [mainSosArmed]);

  useEffect(() => {
    if (mainSosArmed && mainSosCountdown === 0) {
      setMainSosArmed(false);
      handleReportAccident();
    }
  }, [mainSosArmed, mainSosCountdown]); // eslint-disable-line

  const handleTransferToHospital = () => {
    setSysState(SYS.AT_HOSPITAL);
    const hosp = fetchedHospitals[0] || { name: "Care Hospital, Hyderabad" };
    setAssignedHospital(hosp);
    logAlert("Arrived at Hospital", "🏥", `Patient transferred to ${hosp.name}.`, "info");
    addToast({ title: "🏥 At Hospital", message: `Patient mode active · ${hosp.name}`, color: "#8b5cf6" });
  };

  const handleCancelEmergency = () => {
    setSysState(SYS.NORMAL);
    setAiAnalysis(null);
    setAssignedHelper(null);
    setFamilyNotified(false);
    addToast({ title: "Incident Cancelled", message: "Emergency cleared. All units notified.", color: "#22c55e" });
    logAlert("Incident Cancelled", "✅", "Emergency cancelled by user.", "info");
  };

  /* Hospitals */
  const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
  const handleFindHospital = async () => {
    if (hospitalLoading) return;
    setHospitalLoading(true);
    try {
      const query = `[out:json][timeout:15];(node["amenity"="hospital"](around:10000,${location.lat},${location.lng});way["amenity"="hospital"](around:10000,${location.lat},${location.lng});node["amenity"="clinic"](around:10000,${location.lat},${location.lng}););out center 8;`;
      const res = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: query });
      const data = await res.json();
      const hospitals = data.elements.map(el => {
        const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lon;
        if (!lat || !lng) return null;
        const dist = haversine(location.lat, location.lng, lat, lng);
        return { name: el.tags?.name || "Hospital", address: [el.tags?.["addr:street"], el.tags?.["addr:city"] || el.tags?.["addr:suburb"]].filter(Boolean).join(", ") || "Address unavailable", lat, lng, contact: el.tags?.phone || el.tags?.["contact:phone"] || "", distance: `${dist.toFixed(1)} km`, eta: `${Math.ceil((dist / 30) * 60)} min`, dist };
      }).filter(Boolean).sort((a, b) => a.dist - b.dist).slice(0, 5);
      if (!hospitals.length) { addToast({ title: "No Hospitals Found", message: "No hospitals within 10 km.", color: "#fbbf24" }); return; }
      setFetchedHospitals(hospitals);
      addToast({ title: "Hospitals Located", message: `${hospitals.length} found · Nearest: ${hospitals[0].name}`, color: "#22c55e" });
    } catch {
      addToast({ title: "Search Failed", message: "Could not reach hospital database.", color: "#ef4444" });
    } finally { setHospitalLoading(false); }
  };

  const handleFuelSearch = () => {
    if (!fuelAmount.trim()) return;
    setFuelStatus("searching");
    setTimeout(() => { setNearbyDrivers(MOCK_DRIVERS); setFuelStatus("found"); addToast({ title: "Fuel Request Broadcast", message: `${MOCK_DRIVERS.length} nearby drivers notified.`, color: "#fbbf24" }); }, 1800);
  };

  const handleFindMechanics = () => { setLoadingMech(true); setNearbyMechanics([]); setTimeout(() => { setNearbyMechanics(MOCK_MECHANICS); setLoadingMech(false); }, 1000); };

  const handlePanic = (type) => {
    setSosType(type);
    const msgs = { theft: "Vehicle location pinned. Police notified.", sos: "Immediate rescue · Nearest unit dispatched.", women: "Priority SOS sent to Police + 3 contacts." };
    const labels = { theft: "Vehicle Theft", sos: "Panic SOS", women: "Women Safety SOS" };
    logAlert(labels[type], "🚨", msgs[type], "critical");
    addToast({ title: `${labels[type]} Sent`, message: msgs[type], color: "#ef4444" });
    if (type === "women") {
      triggerHaptic([100, 50, 100, 50, 100]);
      playSOSBeeps();
      setTimeout(() => { setSosTrigger(true); setWomenMaskActive(true); setActiveModal(null); }, 1000);
    } else {
      setTimeout(() => { setSosType(null); setActiveModal(null); }, 2500);
    }
  };

  const handleAmbulance = () => {
    const msg = "Ambulance Unit 08 dispatched. Medical profile transmitted. ETA 6 mins.";
    logAlert("Ambulance Dispatch", "🚑", msg, "info");
    addToast({ title: "Ambulance Dispatched", message: msg, color: "#3b82f6" });
    setActiveModal(null);
  };

  const handleNormalAction = (id) => {
    if (id === "accident") { setActiveModal("report"); setReportImage(null); return; }
    if (id === "fuel") { setFuelStatus("idle"); setFuelAmount(""); setActiveModal("fuel"); return; }
    if (id === "road") { handleFindMechanics(); setActiveModal("mechanic"); return; }
    if (id === "panic") { setActiveModal("panic"); return; }
    if (id === "ambulance") { setActiveModal("medical"); return; }
    if (id === "hospitals") { handleFindHospital(); return; }
  };

  const navCls = { [SYS.ALERT_TRIGGERED]: "em", [SYS.AMBULANCE_ASSIGNED]: "as", [SYS.EN_ROUTE]: "er", [SYS.AT_SCENE]: "sc", [SYS.AT_HOSPITAL]: "ho" }[sysState] || "";
  const meta = STATE_META[sysState];
  const showRail = isEmergency;
  const railH = showRail ? 52 : 0;

  // Base offset adjusts based on whether the offline indicator banner is present
  const baseTop = 46 + (isOffline ? 32 : 0);
  const sosTop = baseTop + railH;
  const rootPadTop = sosTop + 42 + 16;

  /* ════════ RENDER ════════ */
  return (
    <div style={{ width: "100%", minHeight: "100vh", position: "relative" }}>
      <style>{G}</style>
      <div className="ud-bg-grid" />
      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      {/* ✅ FIX 6: WOMEN FAKE UI MASK */}
      <WomenFakeMask
        active={womenMaskActive}
        onReveal={() => setWomenMaskActive(false)}
      />

      {/* SYSBAR */}
      <div className={`sysbar ${navCls}`}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo" onClick={() => navigate("/")}>
            <div className="logo-dot" />
            NexVitals
          </div>
          <div className="sys-state" style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}>
            {meta.pulse && <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color, animation: "pulse 1.4s ease infinite" }} />}
            <span style={{ fontSize: ".68rem" }}>{meta.icon}</span>
            <span className="sys-state-label">{meta.label}</span>
          </div>
        </div>
        <div className="sysbar-r">
          <div className="clock">{clock}</div>
          <button className={`sys-btn ai-btn${chatOpen ? " on" : ""}`} onClick={() => setChatOpen(o => !o)}>✦ AI</button>
          <button className="sys-btn out-btn" onClick={() => navigate("/LoginPage")}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            &nbsp;Out
          </button>
        </div>
      </div>

      {/* ✅ FIX 4: OFFLINE INDICATOR */}
      {isOffline && (
        <div style={{
          position: "fixed", top: 46, left: 0, right: 0, zIndex: 595,
          background: "rgba(251,191,36,0.15)", borderBottom: "1px solid rgba(251,191,36,0.3)",
          color: "#fbbf24", height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--fm)", fontSize: ".55rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase",
          backdropFilter: "blur(12px)"
        }}>
          ⚠️ Network lost — SMS fallback active
        </div>
      )}

      {/* STATE RAIL */}
      <StateRail currentState={sysState} isOffline={isOffline} />

      {/* SILENT SOS BAR */}
      <div className={`sos-bar${sosTrigger ? " triggered" : ""}`} style={{ top: sosTop }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="sos-label"><div className="sos-dot" />Women Safety</div>
          <div className="sos-sub">Silent · Discreet</div>
        </div>
        <button className={`sos-btn${sosTrigger ? " on" : ""}`} onClick={handleSOS}>
          {sosTrigger && <div className="sos-ring" />}
          {sosTrigger ? "⚑ SOS ACTIVE — Reveal" : sosCountdown !== null ? `Activating ${sosCountdown}s…` : "⚐ Silent SOS"}
        </button>
      </div>

      {/* ─────────────────────────────────────────────
         EMERGENCY MODE
      ───────────────────────────────────────────── */}
      {isEmergency && (
        <>
          <div className="em-overlay" style={{ paddingTop: rootPadTop }}>

            {/* ✅ FIX 5: Family notification banner — appears immediately on emergency */}
            <FamilyNotifBanner visible={familyNotified} notifiedTime={familyNotifTime} />

            <InstructionCard sysState={sysState} />

            <LiveMap lat={location.lat} lng={location.lng} hospitals={fetchedHospitals} sysState={sysState} assignedHelper={assignedHelper} />

            {/* ✅ FIX 4: AI Explanation panel — shown right after alert */}
            {(sysState === SYS.ALERT_TRIGGERED || sysState === SYS.AMBULANCE_ASSIGNED || sysState === SYS.EN_ROUTE) && aiAnalysis && (
              <AIExplainPanel aiAnalysis={aiAnalysis} visible />
            )}

            {sysState === SYS.ALERT_TRIGGERED && (
              <div className="card em-glow" style={{ borderColor: "rgba(239,68,68,0.4)" }}>
                <div className="card-accent" style={{ background: "linear-gradient(90deg,transparent,rgba(239,68,68,.8),transparent)" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px", gap: 12, textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", animation: "pulse 1s ease infinite" }}>🚨</div>
                  <div style={{ fontFamily: "var(--fd)", fontSize: "1.1rem", fontWeight: 800, color: "var(--t90)" }}>SOS Transmitted</div>
                  <div style={{ fontFamily: "var(--fm)", fontSize: ".55rem", fontWeight: 600, letterSpacing: "1.5px", color: "var(--t45)" }}>Locating nearest ambulance unit…</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <Spinner color="#ef4444" />
                    <span style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, color: "#ef4444", letterSpacing: "1.5px" }}>Dispatching…</span>
                  </div>
                </div>
              </div>
            )}

            {(sysState === SYS.AMBULANCE_ASSIGNED || sysState === SYS.EN_ROUTE) && assignedHelper && (
              <ETACard assignedHelper={assignedHelper} sysState={sysState} />
            )}

            {sysState === SYS.EN_ROUTE && <ConsciousnessCheck helperName={assignedHelper?.name} />}

            {(sysState === SYS.EN_ROUTE || sysState === SYS.AT_SCENE || sysState === SYS.AT_HOSPITAL) && (
              <HealthMonitor sysState={sysState} />
            )}

            {sysState === SYS.AT_SCENE && (
              <AtSceneCard aiAnalysis={aiAnalysis} assignedHelper={assignedHelper} onTransferToHospital={handleTransferToHospital} />
            )}

            {sysState === SYS.AT_HOSPITAL && (
              <HospitalModeCard aiAnalysis={aiAnalysis} assignedHospital={assignedHospital} />
            )}

            {fetchedHospitals.length > 0 && sysState !== SYS.AT_HOSPITAL && (
              <div className="card">
                <div className="card-accent" style={{ background: "linear-gradient(90deg,transparent,rgba(236,72,153,.5),transparent)" }} />
                <div className="card-head">
                  <CardTitle icon="🏥" label="Nearby Hospitals" />
                  <Chip label={`${fetchedHospitals.length} found`} color="#ec4899" />
                </div>
                <div className="card-body">
                  {fetchedHospitals.slice(0, 3).map((h, i) => (
                    <div key={i} className="hosp-item">
                      <div className="hosp-name">{h.name}</div>
                      <div className="hosp-addr">{h.address}</div>
                      <div className="hosp-meta">
                        <span className="hosp-stat" style={{ color: "#ec4899" }}>{h.distance}</span>
                        <span className="hosp-stat">⏱ ETA <span style={{ color: "#22c55e" }}>{h.eta}</span></span>
                      </div>
                      <div className="hosp-actions">
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}&travelmode=driving`} target="_blank" rel="noreferrer" className="hosp-btn" style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.28)", color: "#3b82f6", textDecoration: "none" }}>NAVIGATE</a>
                        {h.contact ? <a href={`tel:${h.contact}`} className="hosp-btn" style={{ background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.28)", color: "#22c55e", textDecoration: "none" }}>CALL</a> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ✅ FIX 2: HOLD-TO-CANCEL — replaces instant cancel */}
          <div className="float-sos-wrap" style={{ animation: "none", bottom: 28 }}>
            {sysState !== SYS.AT_HOSPITAL && (
              <HoldToCancelButton onConfirmCancel={handleCancelEmergency} />
            )}
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────
         NORMAL MODE
      ───────────────────────────────────────────── */}
      {!isEmergency && (
        <>
          <div className="normal-grid" style={{ paddingTop: rootPadTop }}>
            {/* ── LEFT ── */}
            <div className="lc">
              <div className="card">
                <div className="card-accent" style={{ background: "linear-gradient(90deg,transparent,var(--amber-l),transparent)" }} />
                <div className="card-head">
                  <CardTitle icon="👤" label="Operator Profile" />
                  <Chip label="Active" color="#22c55e" />
                </div>
                <div className="card-body">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div className="avatar">{USER.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div className="prof-name">{USER.name}</div>
                      <div className="prof-uid">{USER.uid}</div>
                    </div>
                    <button
                      onClick={() => setActiveModal("editProfile")}
                      style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "var(--amber)", fontFamily: "var(--fm)", fontSize: ".5rem", fontWeight: 700, letterSpacing: "1.5px", padding: "5px 10px", borderRadius: 6, cursor: "pointer", flexShrink: 0 }}
                    >✏ EDIT</button>
                  </div>
                  <div style={{ background: "var(--s2)", borderRadius: 7, padding: "10px 12px", border: "1px solid var(--line)", marginBottom: 12 }}>
                    <div style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, letterSpacing: "2px", color: "var(--t45)", textTransform: "uppercase", marginBottom: 5 }}>Vehicle</div>
                    <div style={{ fontFamily: "var(--fd)", fontSize: "1rem", fontWeight: 800, color: "var(--amber)" }}>{USER.vehicle}</div>
                    <div style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 500, letterSpacing: "1.5px", color: "var(--t70)", marginTop: 2 }}>{USER.model}</div>
                  </div>
                  <div className="hw-row">
                    {USER.hw.map(h => (
                      <div key={h.label} className="hw-item">
                        <div className="hw-label">{h.label}</div>
                        <div className="hw-val" style={{ color: h.color }}>
                          <div className="hw-dot" style={{ background: h.color }} />{h.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-accent" style={{ background: "linear-gradient(90deg,transparent,rgba(239,68,68,.5),transparent)" }} />
                <div className="card-head">
                  <CardTitle icon="🪪" label="Medical ID" />
                  <Chip label="Auto-attached" color="#ef4444" />
                </div>
                <div className="card-body">
                  <div className="med-row">
                    <div className="med-item"><div className="med-key">Blood Group</div><div className="blood">{USER.blood || <span style={{ color: "var(--t45)", fontSize: ".78rem" }}>Not set</span>}</div></div>
                    <div className="med-item"><div className="med-key">Conditions</div><div className="med-val">{USER.conditions || "None listed"}</div></div>
                    <div className="med-item"><div className="med-key">Allergies</div><div className="med-val" style={{ color: "#fbbf24" }}>{USER.allergies || "None listed"}</div></div>
                    <div className="med-item" style={{ borderBottom: "none", paddingBottom: 0 }}><div className="med-key">Emergency</div><div className="med-val" style={{ fontSize: ".74rem" }}>{USER.emergency1 || "Not set"}</div></div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-accent" style={{ background: "linear-gradient(90deg,transparent,rgba(59,130,246,.5),transparent)" }} />
                <div className="card-head">
                  <CardTitle icon="📋" label="Alert Log" />
                  <Chip label={`${alertLog.length} events`} color="#3b82f6" />
                </div>
                <div className="card-body">
                  {alertLog.slice(0, 4).map(a => (
                    <div key={a.id} className="alert-item">
                      <div className="alert-icon" style={{ background: a.bg, borderColor: a.border }}>{a.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="alert-type">{a.type}</div>
                        <div className="alert-time">{a.time}</div>
                        <div className="alert-action">{a.action}</div>
                        <span className="status-pill" style={{ background: `${a.statusColor}15`, borderColor: `${a.statusColor}35`, color: a.statusColor }}>{a.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── CENTER ── */}
            <div className="cc">
              <LiveMap lat={location.lat} lng={location.lng} hospitals={fetchedHospitals} sysState={sysState} assignedHelper={assignedHelper} />

              <div className="card">
                <div className="card-accent" style={{ background: "linear-gradient(90deg,transparent,rgba(239,68,68,.5),transparent)" }} />
                <div className="card-head">
                  <CardTitle icon="⚡" label="Emergency Actions" />
                  <Chip label="Tap to trigger" color="#fbbf24" />
                </div>
                <div className="card-body">
                  <div className="em-grid">
                    {NORMAL_ACTIONS.map(a => (
                      <div key={a.id} className="em-card" onClick={() => handleNormalAction(a.id)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = `${a.accent}55`}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line)"}
                      >
                        <div className="em-glow-bg" style={{ background: `radial-gradient(circle at 50% 0%,${a.glow},transparent 65%)` }} />
                        <div className="em-icon">{a.icon}</div>
                        <div className="em-name">{a.name}</div>
                        <div className="em-desc">{a.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <HealthMonitor sysState={sysState} />
            </div>

            {/* ── RIGHT ── */}
            <div className="rc">
              {/* ✅ FIX 6: Women safety tracking shown when SOS active */}
              {sosTrigger && (
                <WomenTrackingCard
                  active={sosTrigger}
                  onRevealSOS={() => { setWomenMaskActive(true); }}
                />
              )}

              <div className="card" style={{ flex: 1 }}>
                <div className="card-accent" style={{ background: "linear-gradient(90deg,transparent,rgba(236,72,153,.5),transparent)" }} />
                <div className="card-head">
                  <CardTitle icon="🏥" label="Hospitals Nearby" />
                  {hospitalLoading
                    ? <Chip label="Searching…" color="#fbbf24" pulse />
                    : fetchedHospitals.length > 0
                      ? <Chip label={`${fetchedHospitals.length} found`} color="#ec4899" />
                      : <button className="sys-btn" style={{ background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.28)", color: "#22c55e" }} onClick={handleFindHospital}>Find</button>}
                </div>
                <div className="card-body">
                  {hospitalLoading && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 0", color: "var(--t45)" }}><Spinner color="#ec4899" /><span style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, letterSpacing: "1.5px" }}>Querying OpenStreetMap…</span></div>}
                  {!hospitalLoading && fetchedHospitals.length === 0 && (
                    <div style={{ padding: "14px 0" }}>
                      <p style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 600, color: "var(--t45)", marginBottom: 11, letterSpacing: "1.5px" }}>Click Find to search real-time.</p>
                      <button className="modal-btn" style={{ background: "rgba(236,72,153,0.1)", borderColor: "rgba(236,72,153,0.28)", color: "#ec4899" }} onClick={handleFindHospital}>Find Nearest Hospitals</button>
                    </div>
                  )}
                  {!hospitalLoading && fetchedHospitals.length > 0 && (
                    fetchedHospitals.map((h, i) => (
                      <div key={i} className="hosp-item">
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ fontFamily: "var(--fd)", fontSize: ".78rem", fontWeight: 800, color: i === 0 ? "#ec4899" : "var(--t45)", width: 16, flexShrink: 0, marginTop: 1 }}>{i === 0 ? "★" : i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div className="hosp-name">{h.name}</div>
                            <div className="hosp-addr">{h.address}</div>
                            <div className="hosp-meta">
                              <span className="hosp-stat" style={{ color: "#ec4899" }}>{h.distance}</span>
                              <span className="hosp-stat">⏱ <span style={{ color: "#22c55e" }}>{h.eta}</span></span>
                            </div>
                            <div className="hosp-actions">
                              <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}&travelmode=driving`} target="_blank" rel="noreferrer" className="hosp-btn" style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.28)", color: "#3b82f6", textDecoration: "none" }}>NAVIGATE</a>
                              {h.contact ? <a href={`tel:${h.contact}`} className="hosp-btn" style={{ background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.28)", color: "#22c55e", textDecoration: "none" }}>CALL</a> : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="community">
              🔧&nbsp;<a onClick={() => setActiveModal("addMech")}>Submit a mechanic</a>&nbsp;·&nbsp;
              <a onClick={handleFindHospital}>Refresh hospitals</a>&nbsp;·&nbsp;
              <a onClick={() => addToast({ title: "Road Hazard", message: "Hazard flagged and submitted.", color: "#fbbf24" })}>Flag road hazard</a>
            </div>
          </div>

          {/* ✅ FIX 1: DOMINANT FLOATING SOS BUTTON (WITH 2-STEP "ARM" FLOW) */}
          <div className="float-sos-wrap">
            <div className="float-sos-ring float-sos-ring-1" style={{ position: "absolute", inset: 0, borderRadius: 20, border: "2px solid rgba(239,68,68,0.5)", pointerEvents: "none", width: "100%", height: "68px" }} />
            <div className="float-sos-ring float-sos-ring-2" style={{ position: "absolute", inset: 0, borderRadius: 20, border: "2px solid rgba(239,68,68,0.3)", pointerEvents: "none", width: "100%", height: "68px" }} />
            <button
              className="float-sos-main"
              style={{ position: "relative" }}
              onClick={handleMainSosClick}
            >
              {mainSosArmed ? (
                <>
                  <span style={{ fontSize: "1.4rem" }}>🛑</span>
                  CANCEL ({mainSosCountdown}s)
                </>
              ) : (
                <>
                  <span style={{ fontSize: "1.4rem" }}>🆘</span>
                  EMERGENCY SOS
                </>
              )}
            </button>
            <div className="float-sos-label">
              {mainSosArmed ? "Tap to abort emergency dispatch" : "Tap for immediate emergency dispatch"}
            </div>
          </div>
        </>
      )}

      {/* AI CHAT */}
      <IVERASChat isOpen={chatOpen} onClose={() => setChatOpen(false)} userVehicle={USER.model} location={location} sysState={sysState} />

      {/* DEV TOOLS */}
      <div className="dev-tools">
        <div className="dev-lbl">DEV · STATE</div>
        {STATE_ORDER.map(s => {
          const sm = STATE_META[s];
          return (
            <button key={s} className="dev-btn"
              style={{ border: `1px solid ${sysState === s ? sm.color : "var(--line2)"}`, background: sysState === s ? sm.bg : "transparent", color: sysState === s ? sm.color : "var(--t45)", opacity: sysState === s ? 1 : .55, fontSize: ".44rem" }}
              onClick={() => {
                if (s === SYS.AMBULANCE_ASSIGNED && !assignedHelper) setAssignedHelper({ name: "Raju Naik — Unit 42", unitId: "NexVitals-AMB-042", eta: "4 mins", etaMins: 4 });
                if (s !== SYS.NORMAL && !aiAnalysis) {
                  setAiAnalysis({ severity: "CRITICAL", confidence: 94, label: "High-impact collision", injuries_likely: true, hrSpike: "142", sewsScore: "7" });
                  notifyFamily();
                }
                setSysState(s);
              }}
            >{sm.icon} {s.replace(/_/g, " ")}</button>
          );
        })}
      </div>

      {/* ════ MODALS ════ */}
      <Modal isOpen={activeModal === "report"} onClose={() => { setActiveModal(null); setReportImage(null); }} title="⚡ Report Road Accident" accentColor="#ef4444">
        <div style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 600, letterSpacing: "1.5px", color: "var(--t70)", marginBottom: 16, lineHeight: 1.8 }}>GPS: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}<br />A responder will be assigned from the nearest available unit.</div>
        <label style={{ display: "block", height: 150, border: "2px dashed var(--line2)", borderRadius: 9, cursor: "pointer", overflow: "hidden", marginBottom: 14, background: "var(--s2)" }}>
          {reportImage ? <img src={reportImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8, color: "var(--t45)" }}>
              <span style={{ fontSize: "1.6rem", opacity: .4 }}>📷</span>
              <span style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, letterSpacing: "2px" }}>ATTACH SCENE IMAGE (Optional)</span>
              <span style={{ fontFamily: "var(--fm)", fontSize: ".48rem", color: "var(--t45)" }}>AI will analyze severity automatically</span>
            </div>}
          <input type="file" accept="image/*" onChange={e => { if (e.target.files[0]) setReportImage(URL.createObjectURL(e.target.files[0])); }} hidden />
        </label>
        {imageAnalyzing && <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 0", marginBottom: 8 }}><Spinner color="#ef4444" /><span style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, color: "#ef4444", letterSpacing: "1.5px" }}>Analyzing image...</span></div>}
        <button className="modal-btn" disabled={imageAnalyzing} style={{ background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.35)", color: "#ef4444" }} onClick={handleReportAccident}>{imageAnalyzing ? "Analyzing..." : "Submit Accident Report"}</button>
      </Modal>

      <Modal isOpen={activeModal === "fuel"} onClose={() => { setActiveModal(null); setFuelStatus("idle"); }} title="⛽ Fuel Assistance" accentColor="#fbbf24">
        {fuelStatus === "idle" && <><p style={{ fontSize: ".83rem", fontWeight: 500, color: "var(--t70)", marginBottom: 16, lineHeight: 1.6 }}>Broadcast a fuel request to nearby community drivers.</p><input className="modal-input" value={fuelAmount} onChange={e => setFuelAmount(e.target.value)} placeholder="e.g. 2 litres petrol / diesel" /><button className="modal-btn" disabled={!fuelAmount.trim()} style={{ background: fuelAmount.trim() ? "rgba(251,191,36,0.12)" : "transparent", borderColor: `rgba(251,191,36,${fuelAmount.trim() ? ".35" : ".15"})`, color: fuelAmount.trim() ? "#fbbf24" : "var(--t45)" }} onClick={handleFuelSearch}>Broadcast Request</button></>}
        {fuelStatus === "searching" && <div style={{ textAlign: "center", padding: "36px 0" }}><Spinner color="#fbbf24" /><div style={{ fontFamily: "var(--fm)", fontSize: ".58rem", fontWeight: 700, color: "#fbbf24", marginTop: 14, letterSpacing: "1.5px" }}>Broadcasting…</div></div>}
        {fuelStatus === "found" && nearbyDrivers.map((d, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < nearbyDrivers.length - 1 ? "1px solid var(--line)" : "none" }}><div><div style={{ fontWeight: 700, color: "var(--t90)", marginBottom: 3 }}>{d.name}</div><div style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 600, color: "var(--t45)" }}>{d.vehicle} · {d.distance}</div></div><a href={`tel:${d.contact}`} className="hosp-btn" style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.28)", color: "#3b82f6", textDecoration: "none", flex: "none", padding: "0 14px" }}>CALL</a></div>))}
      </Modal>

      <Modal isOpen={activeModal === "mechanic"} onClose={() => setActiveModal(null)} title="🔧 Road Support" accentColor="#14b8a6">
        {loadingMech ? <div style={{ textAlign: "center", padding: "36px 0" }}><Spinner color="#14b8a6" /></div> :
          nearbyMechanics.map((m, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < nearbyMechanics.length - 1 ? "1px solid var(--line)" : "none" }}><div><div style={{ fontWeight: 700, color: "var(--t90)", marginBottom: 3 }}>{m.name}</div><div style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 600, color: "var(--t45)" }}>{m.type} · {m.distance}</div></div><a href={`tel:${m.phone}`} className="hosp-btn" style={{ background: "rgba(20,184,166,0.1)", borderColor: "rgba(20,184,166,0.28)", color: "#14b8a6", textDecoration: "none", flex: "none", padding: "0 14px" }}>CALL</a></div>))}
      </Modal>

      <Modal isOpen={activeModal === "panic"} onClose={() => setActiveModal(null)} title="🚨 Emergency Alert" accentColor="#ef4444">
        {[["VEHICLE THEFT", "Pins vehicle · Notifies police · Live tracking", "#ef4444", "theft"], ["PERSONAL SOS", "Immediate rescue · Nearest unit dispatched", "#fbbf24", "sos"], ["WOMEN SAFETY", "Priority response · Police + emergency contacts · Screen disguised", "#ec4899", "women"]].map(([lbl, sub, c, type]) => (
          <button key={lbl} className="panic-btn" style={{ borderColor: `${c}35`, borderLeftColor: c, borderLeftWidth: 4 }} onMouseEnter={e => e.currentTarget.style.background = `${c}12`} onMouseLeave={e => e.currentTarget.style.background = "var(--s2)"} onClick={() => handlePanic(type)}>
            <div style={{ fontFamily: "var(--fm)", fontSize: ".62rem", fontWeight: 800, color: c, letterSpacing: "2px", marginBottom: 5 }}>{lbl}</div>
            <div style={{ fontSize: ".78rem", fontWeight: 500, color: "var(--t70)" }}>{sub}</div>
          </button>
        ))}
        {sosType && <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", marginTop: 12, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.28)", borderRadius: 5 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s ease infinite" }} /><span style={{ fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, color: "#22c55e", letterSpacing: "1.5px" }}>Alert transmitted</span></div>}
      </Modal>

      <Modal isOpen={activeModal === "medical"} onClose={() => setActiveModal(null)} title="🚑 Medical Dispatch" accentColor="#22c55e">
        <p style={{ fontSize: ".83rem", fontWeight: 500, color: "var(--t70)", marginBottom: 16, lineHeight: 1.6 }}>Ambulance dispatched to your GPS coordinates. Medical profile transmitted automatically.</p>
        <button className="modal-btn" style={{ background: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.35)", color: "#22c55e" }} onClick={handleAmbulance}>Dispatch Ambulance Now</button>
      </Modal>

      <Modal isOpen={activeModal === "addMech"} onClose={() => setActiveModal(null)} title="🔧 Submit Mechanic" accentColor="#22c55e">
        <p style={{ fontSize: ".83rem", fontWeight: 500, color: "var(--t70)", marginBottom: 16, lineHeight: 1.6 }}>Help the NexVitals community by adding a trusted mechanic.</p>
        {[{ placeholder: "Mechanic / Shop Name", type: "text" }, { placeholder: "Phone Number", type: "tel" }].map((f, i) => (<input key={i} type={f.type} placeholder={f.placeholder} className="modal-input" />))}
        <select className="modal-input" style={{ appearance: "none", cursor: "pointer" }}><option>Service Type</option><option>Car Repair</option><option>Bike Repair</option><option>Puncture Shop</option></select>
        <button className="modal-btn" style={{ background: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.35)", color: "#22c55e" }} onClick={() => { addToast({ title: "Mechanic Submitted", message: "Entry sent for admin review.", color: "#22c55e" }); setActiveModal(null); }}>Submit for Verification</button>
      </Modal>

      {/* ── EDIT PROFILE MODAL ── */}
      <EditProfileModal
        isOpen={activeModal === "editProfile"}
        onClose={() => setActiveModal(null)}
        currentProfile={userProfile}
        onSave={(updated) => {
          const merged = { ...userProfile, ...updated };
          localStorage.setItem("user", JSON.stringify(merged));
          setUserProfile(merged);
          addToast({ title: "Profile Updated", message: "Blood group, conditions & contacts saved.", color: "#22c55e" });
          setActiveModal(null);
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════
   EDIT PROFILE MODAL
════════════════════════════════════════════════════ */
function EditProfileModal({ isOpen, onClose, currentProfile, onSave }) {
  const [form, setForm] = React.useState({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setForm({
        blood: currentProfile.blood || "",
        conditions: currentProfile.conditions || "",
        allergies: currentProfile.allergies || "",
        emergency1: currentProfile.emergency1 || "",
        emergency2: currentProfile.emergency2 || "",
        phone: currentProfile.phone || "",
        vehicle: currentProfile.vehicle || "",
        vehicleType: currentProfile.vehicleType || "",
      });
    }
  }, [isOpen, currentProfile]);

  const fld = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = currentProfile.userId;
      if (userId) {
        await fetch(`/api/user/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      onSave(form);
    } catch (e) {
      // Still update locally even if network fails
      onSave(form);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inp = { background: "var(--s2)", border: "1px solid var(--line2)", borderRadius: 8, padding: "10px 12px", color: "var(--white)", fontFamily: "var(--fb)", fontSize: ".85rem", outline: "none", width: "100%", marginBottom: 10 };
  const lbl = { fontFamily: "var(--fm)", fontSize: ".52rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--t45)", display: "block", marginBottom: 5 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--s1)", border: "1px solid var(--amber-b)", borderRadius: 16, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto", padding: 28, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: "1.1rem", fontWeight: 800, color: "var(--white)" }}>✏️ Edit Medical Profile</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--t45)", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <label style={lbl}>Blood Group</label>
        <select value={form.blood || ""} onChange={e => fld("blood", e.target.value)} style={{ ...inp, appearance: "none", cursor: "pointer" }}>
          <option value="">Select blood group</option>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <label style={lbl}>Phone Number</label>
        <input style={inp} value={form.phone || ""} onChange={e => fld("phone", e.target.value)} placeholder="+91 99999 00000" />

        <label style={lbl}>Pre-existing Conditions</label>
        <textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} value={form.conditions || ""} onChange={e => fld("conditions", e.target.value)} placeholder="e.g. Type 2 Diabetes, Hypertension..." />

        <label style={lbl}>Known Allergies</label>
        <textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} value={form.allergies || ""} onChange={e => fld("allergies", e.target.value)} placeholder="e.g. Penicillin, NSAIDs, Latex..." />

        <label style={lbl}>Emergency Contact 1</label>
        <input style={inp} value={form.emergency1 || ""} onChange={e => fld("emergency1", e.target.value)} placeholder="Meera Kumar · +91 9999900000" />

        <label style={lbl}>Emergency Contact 2</label>
        <input style={inp} value={form.emergency2 || ""} onChange={e => fld("emergency2", e.target.value)} placeholder="Arjun Kumar · +91 9999900001 (optional)" />

        <label style={lbl}>Vehicle / Device Serial</label>
        <input style={inp} value={form.vehicle || ""} onChange={e => fld("vehicle", e.target.value)} placeholder="IVER-XXXX-XXXX or plate number" />

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 9, border: "1px solid var(--line2)", background: "transparent", color: "var(--t45)", fontFamily: "var(--fm)", fontSize: ".55rem", fontWeight: 700, letterSpacing: "2px", cursor: "pointer" }}>CANCEL</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: 12, borderRadius: 9, border: "none", background: "var(--amber)", color: "#000", fontFamily: "var(--fm)", fontSize: ".55rem", fontWeight: 800, letterSpacing: "2px", cursor: "pointer" }}>
            {saving ? "SAVING..." : "SAVE PROFILE"}
          </button>
        </div>
      </div>
    </div>
  );
}