/**
 * NexVitals — RegisterPage.jsx
 * Multi-role registration: User, Responder, Hospital, Patient Portal, (Admin hidden)
 * Design: Matches App.jsx cinematic dark-ops aesthetic exactly.
 * Fonts: Syne + JetBrains Mono + DM Sans
 * Accent: Amber (#f59e0b) + role-specific accents
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════ */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #000000;
  --s1:      #07070f;
  --s2:      #0d0d1c;
  --s3:      #131326;
  --line:    rgba(255,255,255,0.07);
  --line2:   rgba(255,255,255,0.14);
  --amber:   #f59e0b;
  --amber-l: #fcd34d;
  --amber-d: rgba(245,158,11,0.10);
  --amber-b: rgba(245,158,11,0.28);
  --white:   #ffffff;
  --t90:     rgba(255,255,255,0.90);
  --t70:     rgba(255,255,255,0.70);
  --t45:     rgba(255,255,255,0.45);
  --t20:     rgba(255,255,255,0.20);
  --t10:     rgba(255,255,255,0.10);
  --red:     #ef4444;
  --green:   #22c55e;
  --blue:    #3b82f6;
  --violet:  #8b5cf6;
  --pink:    #ec4899;
  --fd: 'Syne', sans-serif;
  --fm: 'JetBrains Mono', monospace;
  --fb: 'DM Sans', sans-serif;
  --ease: cubic-bezier(0.16,1,0.3,1);
}

html { scroll-behavior: smooth; overflow-x: hidden; }
body {
  background: var(--bg); color: var(--white); font-family: var(--fb);
  overflow-x: hidden; -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-thumb { background: var(--amber-b); border-radius: 2px; }

body::after {
  content: ''; position: fixed; inset: 0; z-index: 9000; pointer-events: none; opacity: 0.022;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px;
}

/* ─── NAV ─────────────────────────────────────────── */
.rp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 500;
  height: 62px; padding: 0 40px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(0,0,0,0.90);
  backdrop-filter: blur(24px) saturate(160%);
  border-bottom: 1px solid var(--line);
}
.rp-logo {
  font-family: var(--fd); font-size: 1.05rem; font-weight: 800;
  letter-spacing: 4px; color: var(--amber); text-transform: uppercase;
  display: flex; align-items: center; gap: 10px; user-select: none;
  cursor: pointer; text-decoration: none;
}
.rp-logo-pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--amber); box-shadow: 0 0 8px var(--amber);
  animation: pulse-anim 2s ease-in-out infinite;
}
@keyframes pulse-anim {
  0%,100%{ box-shadow:0 0 6px var(--amber); transform:scale(1); }
  50%    { box-shadow:0 0 22px var(--amber); transform:scale(1.35); }
}
.rp-nav-right { display: flex; align-items: center; gap: 10px; }
.rp-btn {
  display: inline-flex; align-items: center; gap: 8px;
  height: 38px; padding: 0 18px; border-radius: 8px;
  font-family: var(--fm); font-size: 0.65rem; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase;
  border: 1px solid; cursor: pointer; transition: all 0.2s var(--ease);
}
.rp-btn-ghost { background: transparent; border-color: var(--line2); color: var(--t45); }
.rp-btn-ghost:hover { border-color: var(--t45); color: var(--white); background: var(--t10); }

/* ─── LAYOUT ──────────────────────────────────────── */
.rp-root {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; padding: 80px 20px 60px;
  position: relative;
}

/* Ambient glow bg */
.rp-bg-glow {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
}
.rp-bg-glow::before {
  content: ''; position: absolute;
  top: 30%; left: 50%; transform: translate(-50%,-50%);
  width: 800px; height: 600px; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(245,158,11,0.04) 0%, transparent 70%);
}
.rp-bg-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.025;
  background-image:
    linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
  background-size: 80px 80px;
}

.rp-content { position: relative; z-index: 1; width: 100%; max-width: 860px; display: flex; flex-direction: column; align-items: center; gap: 0; }

/* ─── HEADER ──────────────────────────────────────── */
.rp-header { text-align: center; margin-bottom: 40px; }
.rp-eyebrow {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  font-family: var(--fm); font-size: 0.58rem; letter-spacing: 4px;
  color: var(--amber); text-transform: uppercase; margin-bottom: 16px;
}
.rp-eyebrow-bar { width: 28px; height: 1px; background: var(--amber); opacity: 0.5; }
.rp-header h1 {
  font-family: var(--fd); font-size: clamp(1.8rem,5vw,3rem);
  font-weight: 800; letter-spacing: -0.5px; color: var(--white); line-height: 1.05;
  margin-bottom: 10px;
}
.rp-header p { font-size: 0.95rem; color: var(--t45); line-height: 1.7; }
.rp-amber-text {
  background: linear-gradient(90deg, var(--amber), var(--amber-l));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ─── ROLE SELECTOR ───────────────────────────────── */
.rp-role-grid {
  display: grid; grid-template-columns: repeat(4,1fr);
  gap: 10px; width: 100%; margin-bottom: 32px;
}
.rp-role-card {
  position: relative; border-radius: 14px; border: 1px solid var(--line);
  background: var(--s1); padding: 18px 14px 16px;
  cursor: pointer; transition: all 0.25s var(--ease);
  display: flex; flex-direction: column; gap: 8px; overflow: hidden;
  text-align: left;
}
.rp-role-card:hover { border-color: var(--line2); transform: translateY(-2px); background: var(--s2); }
.rp-role-card.active { transform: translateY(-3px); }
.rp-role-card-glow {
  position: absolute; top: 0; right: 0; width: 120px; height: 120px;
  pointer-events: none; transition: opacity 0.3s;
  border-radius: 0 14px 0 0;
}
.rp-role-icon { font-size: 1.5rem; line-height: 1; }
.rp-role-name {
  font-family: var(--fd); font-size: 0.85rem; font-weight: 700; color: var(--white);
}
.rp-role-desc { font-size: 0.72rem; color: var(--t45); line-height: 1.5; }
.rp-role-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--fm); font-size: 0.5rem; letter-spacing: 1.8px;
  text-transform: uppercase; padding: 3px 8px; border-radius: 4px;
  border: 1px solid; margin-top: 2px; align-self: flex-start;
}

/* ─── PANEL ───────────────────────────────────────── */
.rp-panel {
  width: 100%; border-radius: 20px; border: 1px solid var(--line);
  background: var(--s1); position: relative; overflow: hidden;
  animation: rp-panel-in 0.35s var(--ease);
}
@keyframes rp-panel-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.rp-panel::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  transition: background 0.3s;
}
.rp-panel-inner { padding: 40px 44px; }

/* ─── STEP INDICATOR ──────────────────────────────── */
.rp-steps {
  display: flex; align-items: center; gap: 0;
  margin-bottom: 36px;
}
.rp-step-item {
  display: flex; align-items: center; gap: 0; flex: 1;
}
.rp-step-item:last-child { flex: none; }
.rp-step-circle {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--fm); font-size: 0.65rem; font-weight: 700;
  border: 1px solid; transition: all 0.3s var(--ease); position: relative; z-index: 1;
}
.rp-step-line {
  flex: 1; height: 1px; transition: background 0.3s;
}
.rp-step-label {
  position: absolute; top: 38px; left: 50%; transform: translateX(-50%);
  font-family: var(--fm); font-size: 0.48rem; letter-spacing: 1.5px;
  text-transform: uppercase; white-space: nowrap; color: var(--t20);
  transition: color 0.3s;
}

/* ─── FORM FIELDS ─────────────────────────────────── */
.rp-form { display: flex; flex-direction: column; gap: 20px; }
.rp-field-group { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.rp-field { display: flex; flex-direction: column; gap: 7px; }
.rp-label {
  font-family: var(--fm); font-size: 0.57rem; letter-spacing: 2px;
  text-transform: uppercase; color: var(--t45); font-weight: 700;
}
.rp-label span { color: var(--red); margin-left: 3px; }
.rp-input {
  height: 46px; padding: 0 16px; border-radius: 10px;
  border: 1px solid var(--line); background: var(--s2);
  color: var(--white); font-family: var(--fb); font-size: 0.92rem;
  outline: none; transition: all 0.2s var(--ease); width: 100%;
}
.rp-input:focus { border-color: var(--focus-color, var(--amber-b)); background: #0f0f1e; box-shadow: 0 0 0 3px var(--focus-glow, rgba(245,158,11,0.08)); }
.rp-input::placeholder { color: var(--t20); }
.rp-input:disabled { opacity: 0.4; cursor: not-allowed; }
.rp-select {
  height: 46px; padding: 0 16px; border-radius: 10px;
  border: 1px solid var(--line); background: var(--s2);
  color: var(--white); font-family: var(--fb); font-size: 0.92rem;
  outline: none; transition: all 0.2s var(--ease); width: 100%;
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.3)' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 14px center;
}
.rp-select:focus { border-color: var(--focus-color, var(--amber-b)); box-shadow: 0 0 0 3px var(--focus-glow, rgba(245,158,11,0.08)); }
.rp-select option { background: #0d0d1c; color: #fff; }
.rp-textarea {
  padding: 14px 16px; border-radius: 10px; border: 1px solid var(--line);
  background: var(--s2); color: var(--white); font-family: var(--fb); font-size: 0.92rem;
  outline: none; transition: all 0.2s var(--ease); resize: vertical; min-height: 100px; width: 100%;
}
.rp-textarea:focus { border-color: var(--focus-color, var(--amber-b)); background: #0f0f1e; box-shadow: 0 0 0 3px var(--focus-glow, rgba(245,158,11,0.08)); }
.rp-textarea::placeholder { color: var(--t20); }

/* Password toggle */
.rp-pw-wrap { position: relative; }
.rp-pw-toggle {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--t20); cursor: pointer; font-size: 13px;
  transition: color 0.2s; padding: 4px;
}
.rp-pw-toggle:hover { color: var(--t70); }

/* ─── HINT BOX ────────────────────────────────────── */
.rp-hint {
  padding: 14px 18px; border-radius: 10px; border: 1px solid;
  display: flex; gap: 14px; align-items: flex-start;
  font-size: 0.84rem; line-height: 1.65;
}
.rp-hint-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }

/* ─── CHECKBOX ────────────────────────────────────── */
.rp-check-row { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
.rp-check-box {
  width: 20px; height: 20px; border-radius: 6px; border: 1px solid var(--line2);
  background: var(--s2); flex-shrink: 0; display: flex; align-items: center;
  justify-content: center; margin-top: 2px; transition: all 0.2s;
}
.rp-check-box.checked { background: var(--green); border-color: var(--green); }
.rp-check-label { font-size: 0.85rem; color: var(--t45); line-height: 1.6; cursor: pointer; }
.rp-check-label a { color: var(--amber); text-decoration: none; }
.rp-check-label a:hover { text-decoration: underline; }

/* ─── OTP ─────────────────────────────────────────── */
.rp-otp-row { display: flex; gap: 10px; justify-content: flex-start; }
.rp-otp-digit {
  width: 52px; height: 58px; border-radius: 12px;
  border: 1px solid var(--line); background: var(--s2);
  color: var(--white); font-family: var(--fd); font-size: 1.5rem; font-weight: 700;
  text-align: center; outline: none; transition: all 0.2s;
}
.rp-otp-digit:focus { border-color: var(--focus-color, var(--amber-b)); background: #0f0f1e; box-shadow: 0 0 0 3px var(--focus-glow, rgba(245,158,11,0.08)); }

/* ─── PENDING STATE ───────────────────────────────── */
.rp-pending {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; text-align: center; padding: 20px 0 8px;
}
.rp-pending-icon {
  width: 72px; height: 72px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; border: 1px solid; position: relative;
  animation: rp-spin-border 8s linear infinite;
}
@keyframes rp-spin-border {
  from { box-shadow: 0 0 20px -5px currentColor; }
  50%  { box-shadow: 0 0 40px -5px currentColor; }
  to   { box-shadow: 0 0 20px -5px currentColor; }
}
.rp-pending h3 { font-family: var(--fd); font-size: 1.3rem; font-weight: 800; color: var(--white); }
.rp-pending p  { font-size: 0.9rem; color: var(--t45); line-height: 1.7; max-width: 420px; }

/* ─── SUCCESS ─────────────────────────────────────── */
.rp-success {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; text-align: center; padding: 16px 0;
}
.rp-success-ring {
  width: 80px; height: 80px; border-radius: 50%;
  border: 2px solid; display: flex; align-items: center; justify-content: center;
  font-size: 2.2rem; animation: rp-ring-pop 0.5s var(--ease) both;
}
@keyframes rp-ring-pop { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
.rp-success h3 { font-family: var(--fd); font-size: 1.5rem; font-weight: 800; color: var(--white); }
.rp-success p  { font-size: 0.9rem; color: var(--t45); line-height: 1.7; max-width: 400px; }

/* ─── BUTTONS ─────────────────────────────────────── */
.rp-action-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 8px; }
.rp-submit {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  height: 50px; padding: 0 32px; border-radius: 12px; border: none;
  font-family: var(--fm); font-size: 0.68rem; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; cursor: pointer;
  transition: all 0.22s var(--ease); position: relative; overflow: hidden;
}
.rp-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.rp-submit-outline {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 50px; padding: 0 24px; border-radius: 12px;
  border: 1px solid var(--line2); background: transparent;
  font-family: var(--fm); font-size: 0.65rem; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: var(--t45); cursor: pointer;
  transition: all 0.22s var(--ease);
}
.rp-submit-outline:hover { border-color: var(--t45); color: var(--white); background: var(--t10); }

/* ─── PROGRESS BAR ────────────────────────────────── */
.rp-progress-bar {
  height: 2px; width: 100%; position: relative; overflow: hidden; border-radius: 1px;
  background: var(--line); margin-bottom: 32px;
}
.rp-progress-fill {
  height: 100%; border-radius: 1px; transition: width 0.45s var(--ease);
}

/* ─── SECTION LABEL ───────────────────────────────── */
.rp-sec-label {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
}
.rp-sec-label-text {
  font-family: var(--fm); font-size: 0.55rem; letter-spacing: 3px;
  text-transform: uppercase; color: var(--t20); white-space: nowrap;
}
.rp-sec-label-line { flex: 1; height: 1px; background: var(--line); }

/* ─── UPLOAD ZONE ─────────────────────────────────── */
.rp-upload {
  border: 1px dashed var(--line2); border-radius: 10px; padding: 24px;
  text-align: center; cursor: pointer; transition: all 0.2s;
  background: var(--s2);
}
.rp-upload:hover { border-color: var(--amber-b); background: rgba(245,158,11,0.03); }
.rp-upload p { font-size: 0.82rem; color: var(--t20); margin-top: 8px; }

/* ─── RADIO TILES ─────────────────────────────────── */
.rp-radio-group { display: flex; gap: 10px; flex-wrap: wrap; }
.rp-radio-tile {
  flex: 1; min-width: 120px; padding: 14px 16px; border-radius: 10px;
  border: 1px solid var(--line); background: var(--s2); cursor: pointer;
  transition: all 0.2s; display: flex; align-items: center; gap: 10px;
}
.rp-radio-tile:hover { border-color: var(--line2); }
.rp-radio-tile.checked { background: var(--s3); }
.rp-radio-dot {
  width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--line2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s;
}
.rp-radio-inner { width: 8px; height: 8px; border-radius: 50%; transition: all 0.2s; }
.rp-radio-label { font-size: 0.85rem; font-weight: 600; color: var(--t70); }

/* ─── DIVIDER ─────────────────────────────────────── */
.rp-divider-text {
  display: flex; align-items: center; gap: 14px;
  font-family: var(--fm); font-size: 0.55rem; letter-spacing: 2px;
  text-transform: uppercase; color: var(--t20);
}
.rp-divider-line { flex: 1; height: 1px; background: var(--line); }

/* ─── SSO BUTTONS ─────────────────────────────────── */
.rp-sso-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.rp-sso-btn {
  height: 46px; border-radius: 10px; border: 1px solid var(--line2);
  background: var(--s2); color: var(--t70); font-family: var(--fm);
  font-size: 0.62rem; letter-spacing: 1.5px; text-transform: uppercase;
  cursor: pointer; transition: all 0.2s; display: flex; align-items: center;
  justify-content: center; gap: 8px;
}
.rp-sso-btn:hover { border-color: var(--t45); color: var(--white); background: var(--s3); }

/* ─── LOGIN LINK ──────────────────────────────────── */
.rp-login-link {
  text-align: center; margin-top: 28px;
  font-size: 0.82rem; color: var(--t20);
}
.rp-login-link a { color: var(--amber); text-decoration: none; font-weight: 600; }
.rp-login-link a:hover { text-decoration: underline; }

/* ─── RESPONSIVE ──────────────────────────────────── */
@media(max-width:760px){
  .rp-nav { padding: 0 18px; }
  .rp-role-grid { grid-template-columns: 1fr 1fr; }
  .rp-panel-inner { padding: 28px 22px; }
  .rp-field-group { grid-template-columns: 1fr; }
  .rp-sso-row { grid-template-columns: 1fr; }
}
@media(max-width:480px){
  .rp-role-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .rp-role-card { padding: 14px 12px 12px; }
  .rp-role-name { font-size: 0.78rem; }
  .rp-role-desc { display: none; }
  .rp-panel-inner { padding: 22px 16px; }
  .rp-otp-digit { width: 42px; height: 50px; font-size: 1.3rem; }
  .rp-header h1 { font-size: 1.6rem; }
}
`;

/* ═══════════════════════════════════════════════════
   ROLE CONFIGS
═══════════════════════════════════════════════════ */
const ROLES = [
  {
    id: "user",
    icon: "🙋",
    name: "Device User",
    desc: "Subscribe & pair your NexVitals hardware",
    badge: "Self-Service",
    accent: "#f59e0b",
    focusColor: "rgba(245,158,11,0.5)",
    focusGlow: "rgba(245,158,11,0.08)",
    steps: ["Account", "Device", "Medical Profile"],
  },
  {
    id: "responder",
    icon: "🚑",
    name: "Emergency Responder",
    desc: "Paramedic, police or ambulance crew",
    badge: "Verified Access",
    accent: "#22c55e",
    focusColor: "rgba(34,197,94,0.5)",
    focusGlow: "rgba(34,197,94,0.08)",
    steps: ["Identity", "Agency", "Submit"],
  },
  {
    id: "hospital",
    icon: "🏥",
    name: "Hospital",
    desc: "Enterprise onboarding for facilities",
    badge: "Enterprise",
    accent: "#ec4899",
    focusColor: "rgba(236,72,153,0.5)",
    focusGlow: "rgba(236,72,153,0.08)",
    steps: ["Facility", "Compliance", "Admin Setup"],
  },
  {
    id: "patient",
    icon: "🩺",
    name: "Patient Portal",
    desc: "Claim your hospital discharge record",
    badge: "MRN Claim",
    accent: "#8b5cf6",
    focusColor: "rgba(139,92,246,0.5)",
    focusGlow: "rgba(139,92,246,0.08)",
    steps: ["Verify MRN", "OTP", "Set Password"],
  },
];

/* ═══════════════════════════════════════════════════
   MINI COMPONENTS
═══════════════════════════════════════════════════ */
function Chip({ label, accent }) {
  const col = accent || "#f59e0b";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 5, background: `${col}14`, border: `1px solid ${col}33`, color: col, fontFamily: "var(--fm)", fontSize: "0.56rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: col, boxShadow: `0 0 5px ${col}` }} />
      {label}
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div className="rp-field">
      <label className="rp-label">{label}{required && <span>*</span>}</label>
      {children}
      {error && <div style={{ color: "var(--red)", fontSize: "0.75rem", marginTop: -2 }}>{error}</div>}
    </div>
  );
}

function PwInput({ id, placeholder, value, onChange, accent, error }) {
  const [show, setShow] = useState(false);
  
  let strength = "";
  let segments = 0;
  let sColor = "var(--line)";
  
  if (value) {
    const hasNum = /\d/.test(value);
    const hasSpec = /[^a-zA-Z0-9]/.test(value);
    
    if (value.length > 10 && hasNum && hasSpec) {
      strength = "Strong"; segments = 3; sColor = "var(--green)";
    } else if (value.length >= 6 && hasNum) {
      strength = "Medium"; segments = 2; sColor = "var(--amber)";
    } else {
      strength = "Weak"; segments = 1; sColor = "var(--red)";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div className="rp-pw-wrap">
        <input
          id={id}
          type={show ? "text" : "password"}
          className="rp-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ "--focus-color": accent + "88", "--focus-glow": accent + "14", paddingRight: 44 }}
        />
        <button type="button" className="rp-pw-toggle" onClick={() => setShow(s => !s)}>
          {show ? "🙈" : "👁"}
        </button>
      </div>
      {value && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
          <div style={{ display: "flex", gap: 4, flex: 1, marginRight: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= segments ? sColor : "var(--line)", transition: "background 0.3s" }} />
            ))}
          </div>
          <span style={{ fontSize: "0.6rem", color: sColor, fontFamily: "var(--fm)", textTransform: "uppercase", letterSpacing: 1 }}>{strength}</span>
        </div>
      )}
    </div>
  );
}

function HintBox({ icon, text, accent, bg }) {
  return (
    <div className="rp-hint" style={{ background: bg || `${accent}0a`, borderColor: `${accent}28`, color: "var(--t70)" }}>
      <span className="rp-hint-icon">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function CheckRow({ checked, onToggle, children }) {
  return (
    <div className="rp-check-row" onClick={onToggle}>
      <div className={`rp-check-box${checked ? " checked" : ""}`}>
        {checked && <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 5.5L4.5 8L9 3" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
      </div>
      <div className="rp-check-label">{children}</div>
    </div>
  );
}

function RadioTile({ label, icon, checked, onSelect, accent }) {
  return (
    <div className={`rp-radio-tile${checked ? " checked" : ""}`} style={checked ? { borderColor: `${accent}44` } : {}} onClick={onSelect}>
      <div className="rp-radio-dot" style={checked ? { borderColor: accent } : {}}>
        <div className="rp-radio-inner" style={{ background: checked ? accent : "transparent" }} />
      </div>
      <span style={{ fontSize: "1rem", lineHeight: 1 }}>{icon}</span>
      <span className="rp-radio-label" style={checked ? { color: accent } : {}}>{label}</span>
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <div className="rp-sec-label">
      <span className="rp-sec-label-text">{text}</span>
      <div className="rp-sec-label-line" />
    </div>
  );
}

function OtpInput({ value, onChange, accent, length = 6 }) {
  const refs = Array.from({ length }, () => useRef(null));
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? v : d));
    onChange(next.join(""));
    if (v && i < length - 1) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  return (
    <div className="rp-otp-row">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="rp-otp-digit"
          style={{ "--focus-color": accent + "88", "--focus-glow": accent + "14" }}
        />
      ))}
    </div>
  );
}

function SubmitBtn({ label, accent, onClick, disabled, loading }) {
  return (
    <button
      type="button"
      className="rp-submit"
      onClick={onClick}
      disabled={disabled || loading}
      style={{ background: accent, color: "#000", boxShadow: `0 0 32px ${accent}33` }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.boxShadow = `0 0 50px ${accent}55, 0 0 0 1px ${accent}55`; }}
      onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 32px ${accent}33`}
    >
      {loading ? (
        <span style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#000", display: "inline-block", animation: `pulse-anim ${0.6 + d * 0.15}s ease infinite` }} />)}
        </span>
      ) : label}
    </button>
  );
}

function StepBar({ steps, current, accent }) {
  return (
    <div className="rp-steps" style={{ marginBottom: 44 }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="rp-step-item">
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                className="rp-step-circle"
                style={{
                  background: done ? accent : active ? `${accent}18` : "var(--s2)",
                  borderColor: done || active ? accent : "var(--line)",
                  color: done ? "#000" : active ? accent : "var(--t20)",
                  boxShadow: active ? `0 0 18px ${accent}44` : "none",
                }}
              >
                {done ? <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6L5 9L10 3" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg> : i + 1}
              </div>
              <span className="rp-step-label" style={{ color: active ? accent : done ? "var(--t45)" : "var(--t20)" }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="rp-step-line" style={{ background: done ? accent : "var(--line)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROLE FLOWS
═══════════════════════════════════════════════════ */

/* ── USER FLOW (3 steps) ── */
function UserFlow({ role, onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [vehicleType, setVehicleType] = useState("4-wheeler");
  const [bloodGroup, setBloodGroup] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", serial: "", phone: "", emergency1: "", emergency2: "", conditions: "", allergies: "" });
  const [errors, setErrors] = useState({});

  const fld = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const validateStep0 = () => {
    let err = {};
    if (!form.name.trim()) err.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Valid email is required";
    if (form.password.length < 8) err.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) err.confirm = "Passwords do not match";
    if (!agreedPrivacy || !agreedTerms) err.terms = "You must agree to all policies";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSerialChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let formatted = val;
    if (val.length > 4) formatted = val.slice(0, 4) + "-" + val.slice(4);
    if (val.length > 8) formatted = formatted.slice(0, 9) + "-" + formatted.slice(9, 13);
    fld("serial", formatted);
    if (errors.serial) setErrors(e => ({ ...e, serial: null }));
  };

  const progress = ((step / (role.steps.length - 1)) * 100);

  const next = async () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !/^IVER-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(form.serial)) {
      setErrors({ serial: "Invalid serial format. Expected IVER-XXXX-XXXX" });
      return;
    }
    setErrors({});
    if (step < role.steps.length - 1) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setStep(s => s + 1); }, 800);
    } else {
      setLoading(true);
      try {
        const res = await fetch("/api/register", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            userType: "User",
            phone: form.phone || "",
            blood: bloodGroup || "",
            conditions: form.conditions || "",
            allergies: form.allergies || "",
            emergency1: form.emergency1 || "",
            emergency2: form.emergency2 || "",
            vehicleType: vehicleType || "",
            vehicle: form.serial || "",
          })
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok) {
          localStorage.setItem("user", JSON.stringify(data));
          onSuccess(data.redirectUrl);
        } else alert(data.error);
      } catch (err) { setLoading(false); alert("Server error"); }
    }
  };

  if (step === role.steps.length) return (
    <div className="rp-success">
      <div className="rp-success-ring" style={{ borderColor: role.accent, color: role.accent }}>✓</div>
      <h3>You're all set!</h3>
      <p>Your NexVitals account is active. Pair your device serial <strong>{form.serial || "IVER-XXXX"}</strong> and complete your medical profile to enable AI emergency response.</p>
      <SubmitBtn label="Go to Dashboard →" accent={role.accent} onClick={onSuccess} />
    </div>
  );

  return (
    <>
      <div className="rp-progress-bar"><div className="rp-progress-fill" style={{ width: `${progress}%`, background: role.accent }} /></div>
      <StepBar steps={role.steps} current={step} accent={role.accent} />

      {step === 0 && (
        <div className="rp-form">
          <HintBox icon="🔐" text="Create your NexVitals account. Your credentials are encrypted and never shared." accent={role.accent} />
          <div className="rp-sso-row">
            <button type="button" className="rp-sso-btn">
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continue with Google
            </button>
            <button type="button" className="rp-sso-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.09.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.162 22 16.416 22 12c0-5.523-4.477-10-10-10z" /></svg>
              Continue with Apple
            </button>
          </div>
          <div className="rp-divider-text"><div className="rp-divider-line" />or register with email<div className="rp-divider-line" /></div>
          <Field label="Full Name" required error={errors.name}>
            <input className="rp-input" placeholder="Ravi Kumar" value={form.name} onChange={e => fld("name", e.target.value)} style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
          </Field>
          <div className="rp-field-group">
            <Field label="Email Address" required error={errors.email}>
              <input className="rp-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => fld("email", e.target.value)} style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
            </Field>
            <Field label="Phone Number" required>
              <input className="rp-input" type="tel" placeholder="+91 99999 00000" value={form.phone} onChange={e => fld("phone", e.target.value)} style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
            </Field>
          </div>
          <div className="rp-field-group">
            <Field label="Password" required error={errors.password}>
              <PwInput placeholder="Min 8 characters" value={form.password} onChange={e => fld("password", e.target.value)} accent={role.accent} />
            </Field>
            <Field label="Confirm Password" required error={errors.confirm}>
              <PwInput placeholder="Repeat password" value={form.confirm} onChange={e => fld("confirm", e.target.value)} accent={role.accent} />
            </Field>
          </div>
          <CheckRow checked={agreedPrivacy} onToggle={() => { setAgreedPrivacy(v => !v); setErrors(e => ({ ...e, terms: null })); }}>
            I agree to the <a href="#">Privacy Policy</a> and understand my data is protected.
          </CheckRow>
          <CheckRow checked={agreedTerms} onToggle={() => { setAgreedTerms(v => !v); setErrors(e => ({ ...e, terms: null })); }}>
            I agree to the <a href="#">Terms of Service</a>.
          </CheckRow>
          {errors.terms && <div style={{ color: "var(--red)", fontSize: "0.75rem", marginTop: -14, paddingLeft: 32 }}>{errors.terms}</div>}
          <div className="rp-action-row">
            <SubmitBtn label="Create Account →" accent={role.accent} onClick={next} loading={loading} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="rp-form">
          <HintBox icon="📟" text="Enter the serial number on your NexVitals device box. No device yet? Choose a plan to get one shipped to you." accent={role.accent} />
          <Field label="NexVitals Hardware Serial Number" required error={errors.serial}>
            <div className="rp-pw-wrap">
              <input className="rp-input" placeholder="IVER-XXXX-XXXX" value={form.serial} onChange={handleSerialChange} style={{ fontFamily: "var(--fm)", letterSpacing: 3, "--focus-color": role.focusColor, "--focus-glow": role.focusGlow, paddingRight: 44 }} />
              {/^IVER-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(form.serial) && (
                <div className="rp-pw-toggle" style={{ color: "var(--green)", pointerEvents: "none", fontSize: "16px", right: 12 }}>✓</div>
              )}
            </div>
          </Field>
          <Field label="Vehicle Type">
            <div className="rp-radio-group">
              {[{ label: "4-Wheeler", icon: "🚗" }, { label: "2-Wheeler", icon: "🏍️" }].map(opt => (
                <RadioTile key={opt.label} label={opt.label} icon={opt.icon} accent={role.accent} checked={vehicleType === opt.label} onSelect={() => setVehicleType(opt.label)} />
              ))}
            </div>
          </Field>
          <SectionLabel text="Choose a Subscription Plan" />
          {[
            { name: "Essentials", price: "₹299/mo", perks: "Crash detection · GPS · Manual SOS" },
            { name: "Pro", price: "₹599/mo", perks: "All Essentials + Biometrics · Hospital Prep · Priority Dispatch" },
          ].map((plan, i) => (
            <div key={plan.name} style={{ borderRadius: 12, border: `1px solid ${i === 1 ? role.accent + "44" : "var(--line)"}`, background: i === 1 ? `${role.accent}08` : "var(--s2)", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all 0.2s" }}>
              <div>
                <div style={{ fontFamily: "var(--fd)", fontWeight: 700, color: i === 1 ? role.accent : "var(--white)", marginBottom: 4 }}>{plan.name} {i === 1 && <span style={{ fontFamily: "var(--fm)", fontSize: "0.5rem", background: role.accent, color: "#000", borderRadius: 4, padding: "2px 6px", marginLeft: 6, letterSpacing: 1 }}>POPULAR</span>}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--t45)" }}>{plan.perks}</div>
              </div>
              <div style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: "1.2rem", color: role.accent }}>{plan.price}</div>
            </div>
          ))}
          <SectionLabel text="Secure Payment" />
          <div className="rp-field-group">
            <Field label="Cardholder Name">
              <input className="rp-input" placeholder="Name on card" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
            </Field>
            <Field label="Card Number">
              <input className="rp-input" placeholder="•••• •••• •••• ••••" style={{ fontFamily: "var(--fm)", letterSpacing: 2, "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
            </Field>
          </div>
          <div className="rp-field-group">
            <Field label="Expiry"><input className="rp-input" placeholder="MM / YY" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
            <Field label="CVV"><input className="rp-input" placeholder="•••" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
          </div>
          <div className="rp-action-row">
            <button type="button" className="rp-submit-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
            <SubmitBtn label="Pay & Continue →" accent={role.accent} onClick={next} loading={loading} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rp-form">
          <HintBox icon="🔒" text="This information will only be shared with paramedics and doctors in the event of an emergency. It is never used for any other purpose." accent={role.accent} />
          <SectionLabel text="Critical Medical Info" />
          <div className="rp-field-group">
            <Field label="Blood Group" required>
              <select className="rp-select" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }}>
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </Field>
            <Field label="Date of Birth" required>
              <input type="date" className="rp-input" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
            </Field>
          </div>
          <SectionLabel text="Emergency Contacts" />
          <div className="rp-field-group">
            <Field label="Emergency Contact 1 (Name + Number)" required>
              <input className="rp-input" placeholder="Meera Kumar · +91 9999900000" value={form.emergency1} onChange={e => fld("emergency1", e.target.value)} style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
            </Field>
            <Field label="Emergency Contact 2 (Optional)">
              <input className="rp-input" placeholder="Arjun Kumar · +91 9999900001" value={form.emergency2} onChange={e => fld("emergency2", e.target.value)} style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
            </Field>
          </div>
          <SectionLabel text="Medical History (for paramedics)" />
          <Field label="Pre-existing Conditions">
            <textarea className="rp-textarea" placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma..." value={form.conditions} onChange={e => fld("conditions", e.target.value)} style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
          </Field>
          <Field label="Known Allergies">
            <textarea className="rp-textarea" placeholder="e.g. Penicillin, Sulfa drugs, Latex..." value={form.allergies} onChange={e => fld("allergies", e.target.value)} style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
          </Field>
          <div className="rp-action-row">
            <button type="button" className="rp-submit-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
            <SubmitBtn label="Complete Setup ✓" accent={role.accent} onClick={next} loading={loading} />
          </div>
        </div>
      )}
    </>
  );
}

/* ── RESPONDER FLOW (3 steps + pending) ── */
function ResponderFlow({ role, onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [responderType, setResponderType] = useState("Paramedic");
  const [agreedProtocol, setAgreedProtocol] = useState(false);
  const [form, setForm] = useState({ name: "", badge: "", email: "", mobile: "", agency: "", license: "", hospital: "", years: "" });
  const [errors, setErrors] = useState({});

  const fld = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const validateStep0 = () => {
    let err = {};
    if (!form.name.trim()) err.name = "Full Legal Name is required";
    if (!form.badge.trim()) err.badge = "Badge / ID Number is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Valid official email is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const next = async () => {
    if (step === 0 && !validateStep0()) return;
    setErrors({});
    if (step < role.steps.length - 1) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setStep(s => s + 1); }, 900);
    } else {
      setLoading(true);
      try {
        const res = await fetch("/api/register", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: "ResponderPassword123", userType: "Responder" })
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok) {
          localStorage.setItem("user", JSON.stringify(data));
          onSuccess(data.redirectUrl);
        } else alert(data.error);
      } catch (err) { setLoading(false); alert("Server error"); }
    }
  };

  const progress = ((step / (role.steps.length - 1)) * 100);

  return (
    <>
      <div className="rp-progress-bar"><div className="rp-progress-fill" style={{ width: `${progress}%`, background: role.accent }} /></div>
      <StepBar steps={role.steps} current={step} accent={role.accent} />

      {step === 0 && (
        <div className="rp-form">
          <HintBox icon="⚠️" text="Responder accounts have access to victim locations and patient data. Identity verification is mandatory — this is a zero-trust process." accent={role.accent} bg="rgba(34,197,94,0.05)" />
          <Field label="Responder Type" required>
            <div className="rp-radio-group">
              {[{ label: "Paramedic", icon: "🚑" }, { label: "Police Officer", icon: "👮" }, { label: "Fire Rescue", icon: "🚒" }, { label: "First Responder", icon: "🧑‍⚕️" }].map(opt => (
                <RadioTile key={opt.label} label={opt.label} icon={opt.icon} accent={role.accent} checked={responderType === opt.label} onSelect={() => setResponderType(opt.label)} />
              ))}
            </div>
          </Field>
          <div className="rp-field-group">
            <Field label="Full Legal Name" required error={errors.name}><input className="rp-input" placeholder="Karthik Reddy" value={form.name} onChange={e => fld("name", e.target.value)} style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
            <Field label="Badge / ID Number" required error={errors.badge}><input className="rp-input" placeholder="AP-MED-00482" value={form.badge} onChange={e => fld("badge", e.target.value.toUpperCase())} style={{ fontFamily: "var(--fm)", letterSpacing: 2, "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
          </div>
          <div className="rp-field-group">
            <Field label="Official Email" required error={errors.email}><input className="rp-input" type="email" placeholder="karthik@apems.gov.in" value={form.email} onChange={e => fld("email", e.target.value)} style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
            <Field label="Mobile Number" required><input className="rp-input" type="tel" placeholder="+91 99999 00000" value={form.mobile} onChange={e => fld("mobile", e.target.value)} style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
          </div>
          <div className="rp-action-row">
            <SubmitBtn label="Next: Agency Details →" accent={role.accent} onClick={next} loading={loading} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="rp-form">
          <HintBox icon="🏛️" text="Your credentials will be cross-verified with your agency's administrator before you gain platform access." accent={role.accent} bg="rgba(34,197,94,0.05)" />
          <div className="rp-field-group">
            <Field label="Agency / Department Name" required><input className="rp-input" placeholder="AP Emergency Medical Services" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
            <Field label="State Medical License No." required><input className="rp-input" placeholder="MCI-AP-29048" style={{ fontFamily: "var(--fm)", letterSpacing: 2, "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
          </div>
          <Field label="Associated Hospital / Fleet ID">
            <input className="rp-input" placeholder="CARE-VJA-FLEET-003 or Hospital Registration No." style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
          </Field>
          <Field label="Years of Service">
            <select className="rp-select" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }}>
              <option value="">Select range</option>
              {["Less than 1 year", "1–3 years", "3–7 years", "7–15 years", "15+ years"].map(y => <option key={y}>{y}</option>)}
            </select>
          </Field>
          <Field label="Upload Credential Document">
            <div className="rp-upload" onClick={() => document.getElementById("resp-doc")?.click()}>
              <span style={{ fontSize: "1.8rem" }}>📎</span>
              <p>Click to upload Badge Scan, License or Appointment Letter</p>
              <input id="resp-doc" type="file" hidden accept="image/*,.pdf" />
            </div>
          </Field>
          <CheckRow checked={agreedProtocol} onToggle={() => setAgreedProtocol(v => !v)}>
            I confirm that I am a registered emergency services professional. I understand misuse of this platform is a criminal offence under applicable law.
          </CheckRow>
          <div className="rp-action-row">
            <button type="button" className="rp-submit-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
            <SubmitBtn label="Submit for Verification →" accent={role.accent} onClick={next} loading={loading} disabled={!agreedProtocol} />
          </div>
        </div>
      )}

      {step >= 2 && (
        <div className="rp-pending">
          <div className="rp-pending-icon" style={{ borderColor: role.accent, color: role.accent, background: `${role.accent}0a` }}>⏳</div>
          <h3>Application Submitted</h3>
          <Chip label="Pending Agency Verification" accent={role.accent} />
          <p>Your account is pending verification by your agency administrator. You'll receive an email at the address you provided once access is granted — typically within 24–48 hours.</p>
          <HintBox icon="🔒" text="This process exists to protect victim data. Responders are the only role with live location access during active emergencies." accent={role.accent} bg="rgba(34,197,94,0.05)" />
          <div className="rp-action-row" style={{ justifyContent: "center" }}>
            <SubmitBtn label="Back to Home" accent={role.accent} onClick={onSuccess} />
          </div>
        </div>
      )}
    </>
  );
}

/* ── HOSPITAL FLOW (3 steps) ── */
function HospitalFlow({ role, onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreedBAA, setAgreedBAA] = useState(false);
  const [agreedNHA, setAgreedNHA] = useState(false);

  const next = async () => {
    if (step < role.steps.length - 1) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setStep(s => s + 1); }, 900);
    } else {
      setLoading(true);
      try {
        const res = await fetch("/api/register", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Hospital Admin", email: "admin@hospital.com", password: "HospitalPassword123", userType: "Hospital" })
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok) {
          localStorage.setItem("user", JSON.stringify(data));
          onSuccess(data.redirectUrl);
        } else alert(data.error);
      } catch (err) { setLoading(false); alert("Server error"); }
    }
  };

  const progress = ((step / (role.steps.length - 1)) * 100);

  return (
    <>
      <div className="rp-progress-bar"><div className="rp-progress-fill" style={{ width: `${progress}%`, background: role.accent }} /></div>
      <StepBar steps={role.steps} current={step} accent={role.accent} />

      {step === 0 && (
        <div className="rp-form">
          <HintBox icon="🏗️" text="Hospitals are enterprise clients. Once onboarded, the primary administrator can invite doctors, nurses and ward managers via internal links." accent={role.accent} bg="rgba(236,72,153,0.05)" />
          <div className="rp-field-group">
            <Field label="Hospital Name" required><input className="rp-input" placeholder="Care Hospital, Vijayawada" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
            <Field label="Hospital Registration Number" required><input className="rp-input" placeholder="AP-HOS-2019-00482" style={{ fontFamily: "var(--fm)", letterSpacing: 1, "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
          </div>
          <div className="rp-field-group">
            <Field label="State / UT" required>
              <select className="rp-select" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }}>
                <option value="">Select state</option>
                {["Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka", "Maharashtra", "Delhi", "Other"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Total Bed Capacity" required><input className="rp-input" type="number" placeholder="350" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
          </div>
          <Field label="Hospital Address" required>
            <textarea className="rp-textarea" placeholder="Street, City, PIN Code..." style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
          </Field>
          <SectionLabel text="Primary Administrator Details" />
          <div className="rp-field-group">
            <Field label="Admin Full Name" required><input className="rp-input" placeholder="Dr. Priya Sharma" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
            <Field label="Admin Designation" required><input className="rp-input" placeholder="Chief Medical Officer" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
          </div>
          <div className="rp-field-group">
            <Field label="Admin Email" required><input className="rp-input" type="email" placeholder="priya@carehospital.in" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
            <Field label="Admin Phone" required><input className="rp-input" type="tel" placeholder="+91 99999 00000" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
          </div>
          <div className="rp-action-row">
            <SubmitBtn label="Next: Compliance →" accent={role.accent} onClick={next} loading={loading} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="rp-form">
          <HintBox icon="📋" text="All hospitals must complete the data compliance agreement before NexVitals can share patient health records with your systems." accent={role.accent} bg="rgba(236,72,153,0.05)" />
          <SectionLabel text="Data Processing Agreement" />
          <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "20px", background: "var(--s2)", maxHeight: 180, overflowY: "auto", marginBottom: 4 }}>
            <p style={{ fontSize: "0.82rem", color: "var(--t45)", lineHeight: 1.8 }}>
              <strong style={{ color: "var(--white)" }}>Business Associate Agreement (BAA)</strong><br />
              By accepting this agreement, your facility confirms that all patient data received via NexVitals will be handled in accordance with applicable Indian digital health regulations, including but not limited to the DPDP Act 2023 and NHA Digital Health Guidelines. Data will be stored within designated data residency zones and not transmitted to third parties without explicit patient consent...
            </p>
          </div>
          <CheckRow checked={agreedBAA} onToggle={() => setAgreedBAA(v => !v)}>
            I accept the <a href="#">Business Associate Agreement (BAA)</a> on behalf of our facility.
          </CheckRow>
          <div style={{ marginTop: 8 }} />
          <CheckRow checked={agreedNHA} onToggle={() => setAgreedNHA(v => !v)}>
            Our facility acknowledges alignment with <a href="#">NHA Digital Health Compliance Guidelines</a>.
          </CheckRow>
          <Field label="Upload Facility License / Accreditation">
            <div className="rp-upload" onClick={() => document.getElementById("hosp-doc")?.click()}>
              <span style={{ fontSize: "1.8rem" }}>📄</span>
              <p>NABH / NMC registration certificate (PDF or image)</p>
              <input id="hosp-doc" type="file" hidden accept="image/*,.pdf" />
            </div>
          </Field>
          <div className="rp-action-row">
            <button type="button" className="rp-submit-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
            <SubmitBtn label="Next: Admin Setup →" accent={role.accent} onClick={next} loading={loading} disabled={!agreedBAA || !agreedNHA} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rp-form">
          <HintBox icon="🔑" text="Set up your administrator account. You can generate invite links for internal staff (doctors, nurses, ward managers) from your dashboard." accent={role.accent} bg="rgba(236,72,153,0.05)" />
          <div className="rp-field-group">
            <Field label="Administrator Username" required><input className="rp-input" placeholder="care-hosp-admin" style={{ fontFamily: "var(--fm)", "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
            <Field label="Official Admin Email" required><input className="rp-input" type="email" placeholder="admin@carehospital.in" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} /></Field>
          </div>
          <Field label="Set Admin Password" required>
            <PwInput placeholder="Min 12 characters, letters + numbers" value="" onChange={() => { }} accent={role.accent} />
          </Field>
          <div style={{ borderRadius: 12, border: "1px solid var(--line)", background: "var(--s2)", padding: "18px 20px" }}>
            <div style={{ fontFamily: "var(--fd)", fontWeight: 700, color: "var(--white)", marginBottom: 10, fontSize: "0.9rem" }}>After Approval You'll Be Able To:</div>
            {[
              "Generate invite links for doctors, nurses & ward managers",
              "Configure ER triage thresholds and bed alert rules",
              "View incoming ambulance transmissions in real time",
              "Manage all hospital staff roles from the Admin Hub",
            ].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, background: `${role.accent}18`, border: `1px solid ${role.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <svg width="10" height="10" viewBox="0 0 9 9"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke={role.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                </div>
                <span style={{ fontSize: "0.84rem", color: "var(--t45)", lineHeight: 1.6 }}>{f}</span>
              </div>
            ))}
          </div>
          <div className="rp-action-row">
            <button type="button" className="rp-submit-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
            <SubmitBtn label="Submit for Approval →" accent={role.accent} onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onSuccess(); }, 1000); }} loading={loading} />
          </div>
        </div>
      )}
    </>
  );
}

/* ── PATIENT PORTAL FLOW (3 steps) ── */
function PatientFlow({ role, onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const next = async () => {
    if (step < role.steps.length - 1) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setStep(s => s + 1); }, 900);
    } else {
      setLoading(true);
      try {
        const res = await fetch("/api/register", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Patient Name", email: "patient@example.com", password: "PatientPassword123", userType: "Patient" })
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok) {
          localStorage.setItem("user", JSON.stringify(data));
          onSuccess(data.redirectUrl);
        } else alert(data.error);
      } catch (err) { setLoading(false); alert("Server error"); }
    }
  };

  const progress = ((step / (role.steps.length - 1)) * 100);

  return (
    <>
      <div className="rp-progress-bar"><div className="rp-progress-fill" style={{ width: `${progress}%`, background: role.accent }} /></div>
      <StepBar steps={role.steps} current={step} accent={role.accent} />

      {step === 0 && (
        <div className="rp-form">
          <HintBox icon="🩺" text="You don't create a new account — you claim a record that already exists from your hospital admission. You'll need your Medical Record Number (MRN) found on your discharge summary." accent={role.accent} bg="rgba(139,92,246,0.05)" />
          <Field label="Medical Record Number (MRN)" required>
            <input className="rp-input" placeholder="MRN-2024-VJA-00482" style={{ fontFamily: "var(--fm)", letterSpacing: 2, fontSize: "1rem", "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
          </Field>
          <Field label="Phone Number on File at Hospital" required>
            <input className="rp-input" type="tel" placeholder="+91 99999 00000" style={{ "--focus-color": role.focusColor, "--focus-glow": role.focusGlow }} />
          </Field>
          <HintBox icon="📋" text="Your MRN is printed on your hospital discharge summary, appointment letter or prescription header." accent={role.accent} bg="rgba(139,92,246,0.05)" />
          <div className="rp-action-row">
            <SubmitBtn label="Send OTP to My Number →" accent={role.accent} onClick={next} loading={loading} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="rp-form">
          <HintBox icon="📱" text="A 6-digit verification code has been sent to your registered mobile number. This expires in 10 minutes." accent={role.accent} bg="rgba(139,92,246,0.05)" />
          <Field label="Enter OTP" required>
            <OtpInput value={otp} onChange={setOtp} accent={role.accent} length={6} />
          </Field>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -4 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--t20)" }}>Didn't receive?</span>
            <button type="button" style={{ background: "none", border: "none", color: role.accent, fontFamily: "var(--fm)", fontSize: "0.6rem", letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}>Resend OTP</button>
          </div>
          <div className="rp-action-row">
            <button type="button" className="rp-submit-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
            <SubmitBtn label="Verify →" accent={role.accent} onClick={next} loading={loading} disabled={otp.length < 6} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rp-form">
          <HintBox icon="🔐" text="Identity verified. Set a secure password to access your billing, lab reports, discharge summaries and SOS history." accent={role.accent} bg="rgba(139,92,246,0.05)" />
          <div style={{ borderRadius: 12, border: `1px solid ${role.accent}28`, background: `${role.accent}08`, padding: "18px 20px", display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: "2rem" }}>✅</span>
            <div>
              <div style={{ fontFamily: "var(--fd)", fontWeight: 700, color: "var(--white)", marginBottom: 4 }}>Record Found</div>
              <div style={{ fontSize: "0.82rem", color: "var(--t45)" }}>MRN verified · Admitted: 12 Jan 2025 · CARE Hospital, Vijayawada</div>
            </div>
          </div>
          <Field label="Set New Password" required>
            <PwInput placeholder="Min 8 characters" value="" onChange={() => { }} accent={role.accent} />
          </Field>
          <Field label="Confirm Password" required>
            <PwInput placeholder="Repeat password" value="" onChange={() => { }} accent={role.accent} />
          </Field>
          <div className="rp-action-row">
            <button type="button" className="rp-submit-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
            <SubmitBtn label="Access My Records →" accent={role.accent} onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onSuccess(); }, 1000); }} loading={loading} />
          </div>
        </div>
      )}
    </>
  );
}

/* ── SUCCESS SCREEN ── */
function SuccessScreen({ role, onReset, navigate }) {
  return (
    <div className="rp-success">
      <div className="rp-success-ring" style={{ borderColor: role.accent, color: role.accent }}>
        {role.id === "responder" ? "⏳" : "✓"}
      </div>
      <Chip label={role.badge} accent={role.accent} />
      <h3>{role.id === "responder" ? "Application Submitted" : role.id === "hospital" ? "Onboarding Request Sent" : "Welcome to NexVitals"}</h3>
      <p>
        {role.id === "user" && "Your account is active and your device is paired. NexVitals is now protecting every journey."}
        {role.id === "responder" && "Your credentials are under agency review. You'll be notified within 24–48 hours."}
        {role.id === "hospital" && "Your facility application is under review. The NexVitals team will contact your primary administrator within 2 business days."}
        {role.id === "patient" && "Your medical records are now accessible. View your bills, reports and discharge summaries anytime."}
      </p>
      <div className="rp-action-row" style={{ justifyContent: "center" }}>
        <SubmitBtn label="Go to Login →" accent={role.accent} onClick={() => navigate("/LoginPage")} />
        <button type="button" className="rp-submit-outline" onClick={onReset}>Register Another</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [done, setDone] = useState(false);
  const panelRef = useRef(null);

  const role = ROLES.find(r => r.id === selectedRole);

  const selectRole = (id) => {
    setSelectedRole(id);
    setDone(false);
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#000", color: "#fff", overflowX: "hidden" }}>
      <style>{G}</style>
      <div className="rp-bg-glow" />
      <div className="rp-bg-grid" />

      {/* NAV */}
      <nav className="rp-nav">
        <div className="rp-logo" onClick={() => navigate("/")}>
          <div className="rp-logo-pulse" />
          NexVitals
        </div>
        <div className="rp-nav-right">
          <button className="rp-btn rp-btn-ghost" onClick={() => navigate("/LoginPage")}>
            Sign In
          </button>
        </div>
      </nav>

      <div className="rp-root">
        <div className="rp-content">

          {/* HEADER */}
          <div className="rp-header">
            <div className="rp-eyebrow">
              <div className="rp-eyebrow-bar" />
              Join NexVitals
              <div className="rp-eyebrow-bar" />
            </div>
            <h1>
              Choose Your <span className="rp-amber-text">Access Role</span>
            </h1>
            <p>Each role has a dedicated onboarding flow designed for your specific context — from device users to hospital systems.</p>
          </div>

          {/* ROLE SELECTOR */}
          <div className="rp-role-grid">
            {ROLES.map(r => (
              <div
                key={r.id}
                className={`rp-role-card${selectedRole === r.id ? " active" : ""}`}
                style={selectedRole === r.id ? { borderColor: `${r.accent}55`, background: `${r.accent}0a` } : {}}
                onClick={() => selectRole(r.id)}
              >
                <div className="rp-role-card-glow" style={{ background: `radial-gradient(circle at top right,${r.accent}18,transparent 65%)`, opacity: selectedRole === r.id ? 1 : 0.3 }} />
                <div className="rp-role-icon">{r.icon}</div>
                <div className="rp-role-name" style={selectedRole === r.id ? { color: r.accent } : {}}>{r.name}</div>
                <div className="rp-role-desc">{r.desc}</div>
                <div className="rp-role-badge" style={{ background: `${r.accent}14`, borderColor: `${r.accent}33`, color: r.accent }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: r.accent }} />
                  {r.badge}
                </div>
              </div>
            ))}
          </div>

          {/* FORM PANEL */}
          {role && (
            <div ref={panelRef} className="rp-panel" style={{ borderColor: `${role.accent}22` }}>
              <div className="rp-panel" style={{ "--panel-accent": role.accent }}>
                {/* Accent top bar */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${role.accent}88, transparent)` }} />
              </div>

              {/* Panel header */}
              <div style={{ padding: "28px 44px 0", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${role.accent}14`, border: `1px solid ${role.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{role.icon}</div>
                <div>
                  <div style={{ fontFamily: "var(--fd)", fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>{role.name} Registration</div>
                  <div style={{ fontFamily: "var(--fm)", fontSize: "0.52rem", letterSpacing: "2px", color: "var(--t20)", textTransform: "uppercase", marginTop: 3 }}>{role.desc}</div>
                </div>
                <Chip label={role.badge} accent={role.accent} />
              </div>

              <div style={{ height: 1, background: "var(--line)", margin: "24px 44px 0" }} />

              <div className="rp-panel-inner" style={{ paddingTop: 28 }}>
                {done ? (
                  <SuccessScreen role={role} onReset={() => { setDone(false); setSelectedRole(null); }} navigate={navigate} />
                ) : (
                  <>
                    {role.id === "user" && <UserFlow role={role} onSuccess={(url) => url && typeof url === "string" ? navigate(url) : setDone(true)} />}
                    {role.id === "responder" && <ResponderFlow role={role} onSuccess={(url) => url && typeof url === "string" ? navigate(url) : setDone(true)} />}
                    {role.id === "hospital" && <HospitalFlow role={role} onSuccess={(url) => url && typeof url === "string" ? navigate(url) : setDone(true)} />}
                    {role.id === "patient" && <PatientFlow role={role} onSuccess={(url) => url && typeof url === "string" ? navigate(url) : setDone(true)} />}
                  </>
                )}
              </div>
            </div>
          )}

          {/* LOGIN LINK */}
          <div className="rp-login-link">
            Already have an account? <a href="/LoginPage" onClick={e => { e.preventDefault(); navigate("/LoginPage"); }}>Sign in →</a>
          </div>

          {/* SECURITY FOOTER NOTE */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 32, paddingBottom: 8 }}>
            {[
              { icon: "🔒", label: "End-to-End Encrypted" },
              { icon: "🛡️", label: "DPDP Act Compliant" },
              { icon: "🚫", label: "Zero Data Selling" },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--fm)", fontSize: "0.55rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--t20)" }}>
                <span style={{ fontSize: "0.9rem" }}>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}