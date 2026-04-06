import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS & MOCK DATA ────────────────────────────────────────────────────

const INCIDENT = {
  id: "INC-2026-0874",
  type: "High-Speed Road Accident",
  subtype: "Multi-vehicle collision, rollover suspected",
  location: "NH-65 near Mangalagiri Flyover, km 14.2",
  coords: { lat: 16.4307, lng: 80.568 },
  eta: 6,
  reportedAt: "14:32:07",
};

const PATIENT = {
  name: "Arun Sharma",
  age: 34,
  gender: "Male",
  bloodGroup: "B+",
  conditions: ["Type 2 Diabetes", "Hypertension"],
  allergies: ["Penicillin", "NSAIDs"],
  weight: "72 kg",
  emergencyContact: "+91 98765 43210",
};

const AI_INITIAL = {
  severity: "CRITICAL",
  confidence: 91,
  likelyInjuries: ["Traumatic brain injury", "Left clavicle fracture", "Internal thoracic bleeding"],
  prepareItems: ["High-flow O₂ mask (15L/min)", "C-spine collar (cervical)", "IV line (18G)", "Hemostatic gauze", "Crystalloid fluids (500ml NS)"],
  firstAction: "Establish C-spine control, assess GCS immediately on contact",
  initialCondition: "Patient reported unconscious at scene. Vehicle intrusion noted. Crash sensors detected 45G impact.",
};

const BASELINE_VITALS = { spo2: 98, hr: 72, bp: "118/76", rr: 14 };

const DOCTOR_MESSAGES = [
  { id: 1, from: "dr", name: "Dr. Priya Nair", time: "14:38", text: "Received vitals. Prepare for possible intubation. Maintain C-spine." },
  { id: 2, from: "dr", name: "Dr. Priya Nair", time: "14:39", text: "ICU Bed 3 is cleared. Neuro team is on standby." },
  { id: 3, from: "dr", name: "Dr. Priya Nair", time: "14:41", text: "If SpO₂ drops below 90, initiate BVM ventilation en route." },
];

const PROTOCOLS = [
  { id: "A", label: "A — Airway", detail: "Position airway, jaw thrust. Apply C-spine collar.", critical: true },
  { id: "B", label: "B — Breathing / O₂", detail: "Non-rebreather mask at 15L/min. Monitor chest rise.", critical: true },
  { id: "C", label: "C — Circulation / Bleeding", detail: "Apply hemostatic gauze to visible wounds. Check for internal bleeding signs.", critical: true },
  { id: "D", label: "D — IV Access / Fluids", detail: "18G IV left antecubital. Infuse 500ml NS wide open.", critical: false },
  { id: "E", label: "E — Disability / GCS", detail: "Assess GCS, pupillary response. Log score.", critical: false },
  { id: "F", label: "F — Exposure / Hypothermia", detail: "Cut clothing as needed. Apply thermal blanket.", critical: false },
];

const HANDOFF_TRANSPORT_VITALS = { spo2: 94, hr: 108, bp: "94/62", rr: 22 };

// ─── STYLES ───────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Barlow:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-void:    #060810;
    --bg-base:    #0b0d15;
    --bg-panel:   #0f1220;
    --bg-card:    #141828;
    --bg-lift:    #1a1f35;
    --border:     rgba(255,255,255,0.06);
    --border-med: rgba(255,255,255,0.12);

    --red:        #ff3b3b;
    --red-glow:   rgba(255,59,59,0.25);
    --red-dim:    rgba(255,59,59,0.12);
    --amber:      #ffb020;
    --amber-glow: rgba(255,176,32,0.2);
    --green:      #22d07a;
    --green-glow: rgba(34,208,122,0.2);
    --blue:       #4facfe;
    --blue-glow:  rgba(79,172,254,0.2);
    --cyan:       #00f5d4;
    --purple:     #9b72ff;

    --text-primary:   #f0f2ff;
    --text-secondary: rgba(240,242,255,0.55);
    --text-muted:     rgba(240,242,255,0.3);

    --font-head: 'Rajdhani', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --font-body: 'Barlow', sans-serif;
  }

  body { background: var(--bg-void); color: var(--text-primary); font-family: var(--font-body); }

  .hd-root {
    min-height: 100vh;
    background: var(--bg-void);
    font-family: var(--font-body);
    font-size: 14px;
    overflow-x: hidden;
  }

  /* ── TOPBAR ── */
  .topbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    height: 52px;
    background: rgba(11,13,21,0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px;
  }
  .topbar-left { display: flex; align-items: center; gap: 16px; }
  .topbar-logo { font-family: var(--font-head); font-size: 18px; font-weight: 700; letter-spacing: 2px; color: var(--blue); }
  .topbar-logo span { color: var(--red); }
  .topbar-id { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
  .topbar-right { display: flex; align-items: center; gap: 20px; }
  .topbar-time { font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); animation: pulse-dot 2s ease infinite; }
  @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

  /* ── SCREEN WRAPPER ── */
  .screen { padding: 72px 24px 40px; max-width: 1200px; margin: 0 auto; }
  .screen-wide { padding: 72px 16px 40px; max-width: 1400px; margin: 0 auto; }

  /* ── ALERT SCREEN ── */
  .alert-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 24px;
  }
  .alert-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--red-dim); border: 1px solid var(--red);
    color: var(--red); padding: 6px 14px; border-radius: 4px;
    font-family: var(--font-head); font-size: 13px; font-weight: 700; letter-spacing: 2px;
    animation: alert-flash 1.2s ease infinite;
  }
  @keyframes alert-flash { 0%,100% { box-shadow: 0 0 12px var(--red-glow); } 50% { box-shadow: 0 0 24px var(--red-glow); } }
  .alert-title { font-family: var(--font-head); font-size: 32px; font-weight: 700; line-height: 1.1; margin-top: 10px; }
  .alert-sub { color: var(--text-secondary); margin-top: 4px; font-size: 13px; }
  .inc-id { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-top: 6px; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }

  .panel {
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
  }
  .panel-title {
    font-family: var(--font-head); font-size: 11px; font-weight: 700;
    letter-spacing: 2px; color: var(--text-muted); text-transform: uppercase;
    margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
  }
  .panel-title::after { content:''; flex:1; height:1px; background: var(--border); }

  .info-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--border); }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: var(--text-muted); font-size: 12px; }
  .info-val { color: var(--text-primary); font-weight: 500; font-size: 13px; font-family: var(--font-mono); }

  .tag { display: inline-flex; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; margin: 2px; }
  .tag-red { background: var(--red-dim); color: var(--red); border: 1px solid rgba(255,59,59,0.3); }
  .tag-amber { background: var(--amber-glow); color: var(--amber); border: 1px solid rgba(255,176,32,0.3); }
  .tag-green { background: var(--green-glow); color: var(--green); border: 1px solid rgba(34,208,122,0.3); }
  .tag-blue { background: var(--blue-glow); color: var(--blue); border: 1px solid rgba(79,172,254,0.3); }

  .ai-severity {
    display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
    padding: 14px; background: var(--red-dim); border: 1px solid var(--red); border-radius: 6px;
  }
  .ai-sev-label { font-family: var(--font-head); font-size: 28px; font-weight: 700; color: var(--red); }
  .confidence-bar-wrap { flex: 1; }
  .confidence-text { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; }
  .confidence-bar { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
  .confidence-fill { height: 100%; background: linear-gradient(90deg, var(--red), var(--amber)); border-radius: 3px; transition: width 1s ease; }

  .prep-list { list-style: none; }
  .prep-list li { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; color: var(--text-secondary); font-size: 13px; border-bottom: 1px solid var(--border); }
  .prep-list li:last-child { border-bottom: none; }
  .prep-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); margin-top: 5px; flex-shrink: 0; }

  .nearest-block {
    background: linear-gradient(135deg, rgba(34,208,122,0.08), rgba(79,172,254,0.08));
    border: 1px solid rgba(34,208,122,0.25); border-radius: 8px;
    padding: 16px 20px; display: flex; align-items: center; gap: 14px;
    margin-bottom: 20px;
  }
  .nearest-icon { font-size: 28px; }
  .nearest-text { font-family: var(--font-head); font-size: 16px; font-weight: 600; color: var(--green); }
  .nearest-sub { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

  .btn-row { display: flex; gap: 12px; }
  .btn {
    flex: 1; padding: 14px 20px; border: none; border-radius: 6px; cursor: pointer;
    font-family: var(--font-head); font-size: 16px; font-weight: 700; letter-spacing: 1.5px;
    transition: all 0.15s ease; text-transform: uppercase;
  }
  .btn-accept {
    background: linear-gradient(135deg, #1a4d3a, #22d07a);
    color: #fff; border: 1px solid var(--green);
    box-shadow: 0 0 20px rgba(34,208,122,0.2);
  }
  .btn-accept:hover { box-shadow: 0 0 30px rgba(34,208,122,0.4); transform: translateY(-1px); }
  .btn-decline {
    background: rgba(255,59,59,0.08); color: var(--red);
    border: 1px solid rgba(255,59,59,0.3);
  }
  .btn-decline:hover { background: rgba(255,59,59,0.15); }

  /* ── MODE SELECTION ── */
  .mode-screen {
    min-height: calc(100vh - 52px); display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .mode-card {
    max-width: 600px; width: 100%; text-align: center;
  }
  .mode-title { font-family: var(--font-head); font-size: 36px; font-weight: 700; margin-bottom: 8px; letter-spacing: 2px; }
  .mode-sub { color: var(--text-secondary); margin-bottom: 40px; font-size: 14px; }
  .mode-options { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .mode-btn {
    background: var(--bg-panel); border: 1px solid var(--border-med);
    border-radius: 12px; padding: 36px 20px; cursor: pointer;
    transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; gap: 12px;
    text-align: center;
  }
  .mode-btn:hover { border-color: var(--blue); box-shadow: 0 0 30px var(--blue-glow); transform: translateY(-2px); }
  .mode-btn.paramedic:hover { border-color: var(--red); box-shadow: 0 0 30px var(--red-glow); }
  .mode-emoji { font-size: 42px; }
  .mode-label { font-family: var(--font-head); font-size: 20px; font-weight: 700; letter-spacing: 1px; }
  .mode-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

  /* ── VITALS ── */
  .vitals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
  .vital-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; padding: 16px; text-align: center; position: relative; overflow: hidden;
    transition: border-color 0.3s ease;
  }
  .vital-card.critical { border-color: var(--red); }
  .vital-card.warning { border-color: var(--amber); }
  .vital-card.stable { border-color: rgba(34,208,122,0.3); }
  .vital-card::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at center top, rgba(255,59,59,0.04), transparent 70%);
    pointer-events: none;
  }
  .vital-card.warning::before { background: radial-gradient(ellipse at center top, rgba(255,176,32,0.06), transparent 70%); }
  .vital-card.stable::before { background: radial-gradient(ellipse at center top, rgba(34,208,122,0.04), transparent 70%); }
  .vital-name { font-size: 10px; letter-spacing: 2px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
  .vital-val {
    font-family: var(--font-mono); font-size: 32px; font-weight: 700; line-height: 1.1;
    margin: 6px 0 4px;
  }
  .vital-val.critical { color: var(--red); text-shadow: 0 0 16px var(--red-glow); }
  .vital-val.warning { color: var(--amber); text-shadow: 0 0 16px var(--amber-glow); }
  .vital-val.stable { color: var(--green); }
  .vital-unit { font-size: 11px; color: var(--text-muted); }
  .vital-dev { font-family: var(--font-mono); font-size: 11px; margin-top: 6px; padding: 2px 6px; border-radius: 3px; display: inline-block; }
  .vital-dev.up { background: rgba(255,59,59,0.15); color: var(--red); }
  .vital-dev.down { background: rgba(255,59,59,0.15); color: var(--red); }
  .vital-dev.ok { background: rgba(34,208,122,0.1); color: var(--green); }
  .vital-base { font-size: 10px; color: var(--text-muted); margin-top: 4px; }

  /* ── AI PANEL ── */
  .ai-panel {
    background: linear-gradient(135deg, rgba(155,114,255,0.06), rgba(79,172,254,0.06));
    border: 1px solid rgba(155,114,255,0.25); border-radius: 8px; padding: 20px;
    margin-bottom: 16px;
  }
  .ai-panel-title {
    font-family: var(--font-head); font-size: 11px; font-weight: 700;
    letter-spacing: 2px; color: var(--purple); text-transform: uppercase;
    display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
  }
  .ai-pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--purple); animation: pulse-dot 1.5s ease infinite; }
  .ai-injury { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
  .ai-action {
    background: rgba(255,176,32,0.08); border: 1px solid rgba(255,176,32,0.2);
    border-radius: 6px; padding: 10px 14px; font-size: 13px; color: var(--amber); margin-top: 10px;
    display: flex; gap: 8px;
  }

  /* ── FLOW PANEL ── */
  .flow-bar {
    display: flex; align-items: center; background: var(--bg-panel);
    border: 1px solid var(--border); border-radius: 8px; padding: 14px 20px;
    margin-bottom: 16px; gap: 0;
  }
  .flow-node {
    display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1;
  }
  .flow-node-label { font-size: 10px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }
  .flow-node-icon { font-size: 20px; }
  .flow-node-status { font-family: var(--font-mono); font-size: 10px; color: var(--green); }
  .flow-arrow {
    flex: 0 0 auto; display: flex; flex-direction: column; align-items: center;
    gap: 2px; padding: 0 8px;
  }
  .flow-arrow-line { width: 40px; height: 2px; background: linear-gradient(90deg, var(--green), var(--blue)); position: relative; overflow: visible; }
  .flow-arrow-line::after { content: '▶'; font-size: 8px; color: var(--blue); position: absolute; right: -6px; top: -5px; }
  .flow-latency { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); margin-top: 4px; }

  /* ── HOSPITAL PANEL ── */
  .hosp-status { display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-card); border-radius: 6px; margin-bottom: 8px; }
  .hosp-dot-green { width: 10px; height: 10px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); }
  .hosp-dot-amber { width: 10px; height: 10px; border-radius: 50%; background: var(--amber); box-shadow: 0 0 8px var(--amber); }
  .hosp-text { flex: 1; font-size: 13px; }
  .hosp-sub { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

  /* ── PROTOCOL ── */
  .protocol-step {
    display: flex; align-items: flex-start; gap: 14px; padding: 14px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; margin-bottom: 8px; cursor: pointer;
    transition: all 0.2s ease; position: relative; overflow: hidden;
  }
  .protocol-step:hover { border-color: var(--border-med); background: var(--bg-lift); }
  .protocol-step.done { border-color: rgba(34,208,122,0.4); background: rgba(34,208,122,0.04); }
  .protocol-step.done::after {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: var(--green);
  }
  .protocol-step.critical-step { border-left: 3px solid var(--red); }
  .step-index {
    width: 28px; height: 28px; border-radius: 50%; background: var(--bg-lift);
    border: 1px solid var(--border-med); display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 12px; font-weight: 700; flex-shrink: 0;
    transition: all 0.2s ease;
  }
  .protocol-step.done .step-index { background: rgba(34,208,122,0.15); border-color: var(--green); color: var(--green); }
  .step-label { font-weight: 600; font-size: 14px; margin-bottom: 3px; }
  .step-detail { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
  .step-time { font-family: var(--font-mono); font-size: 10px; color: var(--green); margin-top: 4px; }

  /* ── CHAT ── */
  .chat-box {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; height: 200px; overflow-y: auto; padding: 12px;
    display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px;
    scrollbar-width: thin; scrollbar-color: var(--bg-lift) transparent;
  }
  .chat-msg { display: flex; gap: 8px; }
  .chat-msg.mine { flex-direction: row-reverse; }
  .chat-avatar {
    width: 28px; height: 28px; border-radius: 50%; background: var(--bg-lift);
    border: 1px solid var(--border-med); display: flex; align-items: center; justify-content: center;
    font-size: 12px; flex-shrink: 0; font-family: var(--font-head); font-weight: 700;
    color: var(--blue);
  }
  .chat-msg.mine .chat-avatar { color: var(--green); }
  .chat-bubble {
    max-width: 80%; padding: 8px 12px; border-radius: 8px;
    font-size: 12px; line-height: 1.5;
    background: var(--bg-lift); border: 1px solid var(--border-med);
  }
  .chat-msg.mine .chat-bubble { background: rgba(34,208,122,0.08); border-color: rgba(34,208,122,0.2); }
  .chat-meta { font-size: 10px; color: var(--text-muted); margin-top: 3px; }
  .chat-input-row { display: flex; gap: 8px; }
  .chat-input {
    flex: 1; background: var(--bg-card); border: 1px solid var(--border-med);
    border-radius: 6px; padding: 8px 12px; color: var(--text-primary);
    font-family: var(--font-body); font-size: 13px; outline: none;
  }
  .chat-input:focus { border-color: var(--blue); }
  .btn-send {
    background: var(--blue); color: #000; border: none; border-radius: 6px;
    padding: 8px 14px; cursor: pointer; font-weight: 700; font-size: 13px;
    font-family: var(--font-head); letter-spacing: 1px;
  }

  /* ── ACTION BTNS ── */
  .action-btn {
    width: 100%; padding: 10px 16px; border-radius: 6px; cursor: pointer;
    font-family: var(--font-head); font-size: 13px; font-weight: 700; letter-spacing: 1px;
    border: none; text-transform: uppercase; transition: all 0.15s ease; margin-bottom: 8px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .action-btn:last-child { margin-bottom: 0; }
  .btn-blue { background: rgba(79,172,254,0.12); color: var(--blue); border: 1px solid rgba(79,172,254,0.3); }
  .btn-blue:hover { background: rgba(79,172,254,0.2); box-shadow: 0 0 16px var(--blue-glow); }
  .btn-green-sm { background: rgba(34,208,122,0.1); color: var(--green); border: 1px solid rgba(34,208,122,0.25); }
  .btn-green-sm:hover { background: rgba(34,208,122,0.18); }
  .btn-red-sm { background: rgba(255,59,59,0.1); color: var(--red); border: 1px solid rgba(255,59,59,0.25); }
  .btn-purple-sm { background: rgba(155,114,255,0.1); color: var(--purple); border: 1px solid rgba(155,114,255,0.25); }
  .btn-purple-sm:hover { background: rgba(155,114,255,0.18); }

  /* ── STAGE NAV ── */
  .stage-tabs {
    display: flex; gap: 4px; background: var(--bg-panel);
    border: 1px solid var(--border); border-radius: 8px; padding: 4px;
    margin-bottom: 20px; overflow-x: auto;
  }
  .stage-tab {
    flex: 1; padding: 8px 12px; border-radius: 5px; cursor: pointer;
    font-family: var(--font-head); font-size: 12px; font-weight: 600; letter-spacing: 1px;
    border: none; background: transparent; color: var(--text-muted); white-space: nowrap;
    transition: all 0.15s ease; text-transform: uppercase;
  }
  .stage-tab.active { background: var(--bg-card); color: var(--text-primary); }
  .stage-tab.active.red { border-bottom: 2px solid var(--red); color: var(--red); }
  .stage-tab.active.blue { border-bottom: 2px solid var(--blue); color: var(--blue); }
  .stage-tab.active.amber { border-bottom: 2px solid var(--amber); color: var(--amber); }
  .stage-tab.active.green { border-bottom: 2px solid var(--green); color: var(--green); }
  .stage-tab.active.purple { border-bottom: 2px solid var(--purple); color: var(--purple); }

  /* ── TREND ── */
  .trend-chip {
    display: inline-flex; align-items: center; gap: 4px;
    font-family: var(--font-mono); font-size: 11px; padding: 2px 8px; border-radius: 3px;
  }
  .trend-worse { background: rgba(255,59,59,0.15); color: var(--red); }
  .trend-better { background: rgba(34,208,122,0.1); color: var(--green); }
  .trend-stable-chip { background: rgba(255,176,32,0.1); color: var(--amber); }

  /* ── HANDOFF ── */
  .handoff-header {
    text-align: center; padding: 30px 0 20px;
  }
  .handoff-title { font-family: var(--font-head); font-size: 36px; font-weight: 700; letter-spacing: 2px; }
  .handoff-sub { color: var(--text-secondary); margin-top: 6px; }
  .handoff-complete {
    display: inline-flex; align-items: center; gap: 8px; margin-top: 12px;
    background: rgba(34,208,122,0.1); border: 1px solid rgba(34,208,122,0.3);
    color: var(--green); padding: 6px 16px; border-radius: 4px;
    font-family: var(--font-head); font-size: 13px; font-weight: 700; letter-spacing: 1.5px;
  }

  .log-item {
    display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .log-item:last-child { border-bottom: none; }
  .log-time { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); flex-shrink: 0; width: 50px; }
  .log-text { font-size: 13px; color: var(--text-secondary); }
  .log-text strong { color: var(--text-primary); }

  .vital-compare-row {
    display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 0;
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
    margin-bottom: 12px;
  }
  .vcr-header { background: var(--bg-lift); padding: 8px 12px; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; border-right: 1px solid var(--border); }
  .vcr-header:last-child { border-right: none; }
  .vcr-cell { padding: 10px 12px; border-right: 1px solid var(--border); border-top: 1px solid var(--border); font-family: var(--font-mono); font-size: 13px; }
  .vcr-cell:last-child { border-right: none; }
  .vcr-label { font-family: var(--font-body); font-size: 12px; color: var(--text-secondary); border-right: 1px solid var(--border); border-top: 1px solid var(--border); padding: 10px 12px; }

  .calling-indicator {
    background: rgba(34,208,122,0.08); border: 1px solid rgba(34,208,122,0.25);
    border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 8px;
  }
  .calling-text { font-family: var(--font-head); font-size: 15px; color: var(--green); font-weight: 700; margin-bottom: 6px; }
  .calling-instruction { font-size: 12px; color: var(--text-secondary); font-style: italic; }

  .ai-validation-item {
    display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); align-items: flex-start;
  }
  .ai-validation-item:last-child { border-bottom: none; }
  .av-conf {
    font-family: var(--font-mono); font-size: 11px; padding: 2px 6px; border-radius: 3px;
    background: rgba(155,114,255,0.1); color: var(--purple); flex-shrink: 0;
  }
  .av-conf.confirmed { background: rgba(34,208,122,0.1); color: var(--green); }

  .source-badge {
    display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px;
    background: rgba(79,172,254,0.08); border: 1px solid rgba(79,172,254,0.2);
    border-radius: 20px; font-size: 12px; color: var(--blue); margin-bottom: 14px;
  }
  .source-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); animation: pulse-dot 1.5s ease infinite; }

  .nav-mini {
    background: var(--bg-panel); border: 1px solid var(--border);
    border-radius: 8px; padding: 14px 20px;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .nav-eta { font-family: var(--font-head); font-size: 22px; font-weight: 700; color: var(--text-primary); }
  .nav-eta span { font-size: 13px; color: var(--text-muted); font-family: var(--font-body); }
  .nav-dest { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

  .eta-chip {
    font-family: var(--font-mono); font-size: 11px; padding: 2px 8px;
    border-radius: 3px; background: rgba(255,176,32,0.12); color: var(--amber);
    display: inline-block; margin-left: 8px;
  }

  @media (max-width: 768px) {
    .vitals-grid { grid-template-columns: repeat(2, 1fr); }
    .grid-2 { grid-template-columns: 1fr; }
    .grid-3 { grid-template-columns: 1fr; }
    .mode-options { grid-template-columns: 1fr; }
    .vital-compare-row { grid-template-columns: 1fr 1fr; }
  }
`;

// ─── UTILITY ─────────────────────────────────────────────────────────────────

function useClockTick() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString("en-IN", { hour12: false }));
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString("en-IN", { hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function randomDelta(val, range) {
  return Math.max(0, val + Math.floor((Math.random() - 0.5) * range));
}

function useVitals(active) {
  const [vitals, setVitals] = useState({ spo2: 94, hr: 108, bp: "94/62", rr: 22 });
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setVitals(v => {
        const nextSpo2 = Math.min(99, Math.max(85, randomDelta(v.spo2, 3)));
        const nextHr = Math.min(150, Math.max(50, randomDelta(v.hr, 8)));
        const nextBpSys = Math.min(160, Math.max(70, randomDelta(parseInt(v.bp.split('/')[0]), 6)));
        const nextBpDia = Math.min(100, Math.max(40, randomDelta(parseInt(v.bp.split('/')[1]), 4)));
        const nextRr = Math.min(35, Math.max(10, randomDelta(v.rr, 3)));

        // Physiological guards as per requirements
        const safeSpo2 = v.spo2 + Math.max(-3, Math.min(3, nextSpo2 - v.spo2));
        const safeHr = v.hr + Math.max(-15, Math.min(15, nextHr - v.hr));
        const safeRr = v.rr + Math.max(-2, Math.min(2, nextRr - v.rr));

        return {
          spo2: safeSpo2,
          hr: safeHr,
          bp: `${nextBpSys}/${nextBpDia}`,
          rr: safeRr
        };
      });
    }, 2500);
    return () => clearInterval(t);
  }, [active]);
  return vitals;
}

function useChatLogic(initialMessages) {
  const [chatMessages, setChatMessages] = useState(initialMessages.map(m => ({ ...m, status: "delivered" })));
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const pendingMessages = useRef([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (pendingMessages.current.length > 0) {
        setChatMessages(prev => prev.map(m => {
          if (m.status === "queued") return { ...m, status: "delivered" };
          return m;
        }));
        pendingMessages.current = [];
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const sendChat = (text) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString("en-IN", { hour12: false });
    const newMsgId = Date.now();
    
    if (isOffline) {
      pendingMessages.current.push({ id: newMsgId, text });
      setChatMessages(m => [...m, { id: newMsgId, from: "me", name: "Paramedic", time: now, text, status: "queued" }]);
    } else {
      setChatMessages(m => [...m, { id: newMsgId, from: "me", name: "Paramedic", time: now, text, status: "sending" }]);
      setTimeout(() => {
        setChatMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: "delivered" } : m));
      }, 600);
    }
  };

  return { chatMessages, isOffline, sendChat };
}

function vitalStatus(type, val) {
  const v = parseInt(val);
  if (type === "spo2") return v < 90 ? "critical" : v < 95 ? "warning" : "stable";
  if (type === "hr") return v > 120 || v < 50 ? "critical" : v > 100 || v < 60 ? "warning" : "stable";
  if (type === "rr") return v > 25 || v < 10 ? "critical" : v > 20 ? "warning" : "stable";
  return "stable";
}

function VitalCard({ name, value, unit, baseline, type }) {
  const status = vitalStatus(type, value);
  const baseNum = parseInt(baseline);
  const curNum = parseInt(value);
  const diff = curNum - baseNum;
  const devClass = Math.abs(diff) < 3 ? "ok" : "up";
  return (
    <div className={`vital-card ${status}`}>
      <div className="vital-name">{name}</div>
      <div className={`vital-val ${status}`}>{value}</div>
      <div className="vital-unit">{unit}</div>
      {baseline && (
        <>
          <div className={`vital-dev ${devClass}`}>{diff > 0 ? `+${diff}` : diff} vs baseline</div>
          <div className="vital-base">Baseline: {baseline}</div>
        </>
      )}
    </div>
  );
}

// ─── TOPBAR ──────────────────────────────────────────────────────────────────

function useResponderProfile() {
  const [profile, setProfile] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
  });
  React.useEffect(() => {
    const cached = (() => { try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; } })();
    const userId = cached.userId;
    if (!userId) return;
    fetch(`/api/user/${userId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          const merged = { ...cached, ...data };
          localStorage.setItem("user", JSON.stringify(merged));
          setProfile(merged);
        }
      })
      .catch(() => {});
  }, []);
  return profile;
}

function Topbar({ stage, incidentId }) {
  const time = useClockTick();
  const responder = useResponderProfile();
  const stageLabels = {
    alert: "INCOMING ALERT",
    mode: "MODE SELECTION",
    enroute: "EN ROUTE",
    scene: "ON SCENE",
    transport: "TRANSPORTING",
    handoff: "HANDOFF",
  };
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">Nex<span>Vitals</span></div>
        <div className="topbar-id">
          {incidentId} &nbsp;·&nbsp; {stageLabels[stage] || stage}
        </div>
      </div>
      <div className="topbar-right">
        {responder.name && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:12,
            background:"rgba(79,172,254,0.08)", border:"1px solid rgba(79,172,254,0.2)",
            borderRadius:6, padding:"4px 10px" }}>
            <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--blue)" }}>
              {responder.name}
            </span>
            {responder.badge && (
              <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text-muted)" }}>
                · {responder.badge}
              </span>
            )}
            {responder.responderType && (
              <span style={{ fontSize:10, background:"rgba(34,208,122,0.1)", color:"var(--green)",
                border:"1px solid rgba(34,208,122,0.25)", padding:"1px 6px", borderRadius:3,
                fontFamily:"var(--font-mono)" }}>
                {responder.responderType}
              </span>
            )}
          </div>
        )}
        <div className="topbar-time">{time}</div>
        <div className="status-dot" />
      </div>
    </div>
  );
}

// ─── STAGE TABS (DEV NAV) ─────────────────────────────────────────────────────

function StageTabs({ stage, setStage }) {
  const tabs = [
    { id: "alert", label: "Alert", color: "red" },
    { id: "mode", label: "Mode", color: "blue" },
    { id: "enroute", label: "En Route", color: "blue" },
    { id: "scene", label: "On Scene", color: "amber" },
    { id: "transport", label: "Transport", color: "amber" },
    { id: "handoff", label: "Handoff", color: "green" },
  ];
  return (
    <div className="stage-tabs">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`stage-tab ${stage === t.id ? `active ${t.color}` : ""}`}
          onClick={() => setStage(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── ALERT SCREEN ─────────────────────────────────────────────────────────────

function AlertScreen({ onAccept, onDecline }) {
  return (
    <div className="screen">
      <div className="alert-header">
        <div>
          <div className="alert-badge">⚠ INCOMING EMERGENCY DISPATCH</div>
          <div className="alert-title">{INCIDENT.type}</div>
          <div className="alert-sub">{INCIDENT.subtype}</div>
          <div className="inc-id">{INCIDENT.id} · Reported {INCIDENT.reportedAt}</div>
        </div>
      </div>

      {/* Nearest responder block */}
      <div className="nearest-block">
        <div className="nearest-icon">📍</div>
        <div>
          <div className="nearest-text">You are the nearest available responder</div>
          <div className="nearest-sub">
            {INCIDENT.location} · ETA <strong>{INCIDENT.eta} min</strong>
            <span className="eta-chip">LIVE</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Patient Info */}
        <div className="panel">
          <div className="panel-title">👤 Patient</div>
          <div className="info-row">
            <span className="info-label">Name</span>
            <span className="info-val">{PATIENT.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Age / Gender</span>
            <span className="info-val">{PATIENT.age} yrs · {PATIENT.gender}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Blood Group</span>
            <span className="info-val" style={{ color: "var(--red)" }}>{PATIENT.bloodGroup}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Weight</span>
            <span className="info-val">{PATIENT.weight}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Conditions</span>
            <span className="info-val">
              {PATIENT.conditions.map(c => <span key={c} className="tag tag-amber">{c}</span>)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Allergies</span>
            <span className="info-val">
              {PATIENT.allergies.map(a => <span key={a} className="tag tag-red">{a}</span>)}
            </span>
          </div>
        </div>

        {/* AI Assessment */}
        <div className="panel">
          <div className="panel-title">🤖 AI Assessment</div>
          <div className="ai-severity">
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1 }}>SEVERITY</div>
              <div className="ai-sev-label">{AI_INITIAL.severity}</div>
            </div>
            <div className="confidence-bar-wrap">
              <div className="confidence-text">Supporting Evidence Strength: {AI_INITIAL.confidence}%</div>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: `${AI_INITIAL.confidence}%` }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", marginTop: 4 }}>
                AI assessment supports but does not replace clinical judgment
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, letterSpacing: 1 }}>LIKELY INJURIES</div>
          {AI_INITIAL.likelyInjuries.map(i => (
            <span key={i} className="tag tag-red" style={{ marginBottom: 4, display: "inline-block" }}>{i}</span>
          ))}
          <div style={{ marginTop: 14, fontSize: 12, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 8 }}>PREPARE ON DEPARTURE</div>
          <ul className="prep-list">
            {AI_INITIAL.prepareItems.map(item => (
              <li key={item}><span className="prep-dot" />{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-accept" onClick={onAccept}>✓ ACCEPT DISPATCH</button>
        <button className="btn btn-decline" onClick={onDecline}>✕ DECLINE</button>
      </div>
    </div>
  );
}

// ─── MODE SELECTION ───────────────────────────────────────────────────────────

function ModeSelection({ onSelect }) {
  return (
    <div className="mode-screen">
      <div className="mode-card">
        <div className="mode-title">SELECT MODE</div>
        <div className="mode-sub">Incident {INCIDENT.id} · Assign your role for this response</div>
        <div className="mode-options">
          <button
            className="mode-btn"
            onClick={() => {
              window.open(`https://www.google.com/maps?q=${INCIDENT.coords.lat},${INCIDENT.coords.lng}`, "_blank");
              onSelect("driver");
            }}
          >
            <div className="mode-emoji">🚗</div>
            <div className="mode-label">DRIVER MODE</div>
            <div className="mode-desc">Navigation-focused. Opens Google Maps with victim location. Real-time route guidance.</div>
            <span className="tag tag-blue" style={{ marginTop: 8 }}>OPENS MAPS</span>
          </button>
          <button className="mode-btn paramedic" onClick={() => onSelect("paramedic")}>
            <div className="mode-emoji">🚑</div>
            <div className="mode-label">PARAMEDIC MODE</div>
            <div className="mode-desc">Medical dashboard. AI vitals, protocol guidance, hospital communication.</div>
            <span className="tag tag-red" style={{ marginTop: 8 }}>MEDICAL FOCUS</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EN ROUTE ─────────────────────────────────────────────────────────────────

function EnRouteDashboard({ onArrive, vitals }) {
  const [isCalling, setIsCalling] = useState(false);
  const [vitalsSent, setVitalsSent] = useState(false);
  const [eta, setEta] = useState(INCIDENT.eta);

  useEffect(() => {
    const t = setInterval(() => setEta(e => Math.max(0, e - 1)), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="screen-wide">
      {/* AI Pre-Arrival */}
      <div className="ai-panel">
        <div className="ai-panel-title"><span className="ai-pulse" /> AI PRE-ARRIVAL INTELLIGENCE</div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 6 }}>PREDICTED INJURIES</div>
          <div>
            {AI_INITIAL.likelyInjuries.map(i => <span key={i} className="tag tag-red" style={{ marginRight: 4 }}>{i}</span>)}
          </div>
        </div>
        <div className="ai-action">
          <span>⚡</span>
          <span><strong>First action on arrival:</strong> {AI_INITIAL.firstAction}</span>
        </div>
      </div>

      {/* Vitals */}
      <div className="panel-title" style={{ marginBottom: 12 }}>🧬 LIVE VITALS — VEHICLE SENSOR STREAM</div>
      <div className="vitals-grid" style={{ marginBottom: 16 }}>
        <VitalCard name="SpO₂" value={vitals.spo2} unit="%" baseline={BASELINE_VITALS.spo2} type="spo2" />
        <VitalCard name="Heart Rate" value={vitals.hr} unit="bpm" baseline={BASELINE_VITALS.hr} type="hr" />
        <VitalCard name="Blood Pressure" value={vitals.bp} unit="mmHg" baseline={BASELINE_VITALS.bp} type="bp" />
        <VitalCard name="Resp. Rate" value={vitals.rr} unit="brpm" baseline={BASELINE_VITALS.rr} type="rr" />
      </div>

      <div className="grid-3">
        {/* Patient Context */}
        <div className="panel">
          <div className="panel-title">👤 Patient Context</div>
          <div className="info-row"><span className="info-label">Name</span><span className="info-val">{PATIENT.name}</span></div>
          <div className="info-row"><span className="info-label">Age/Gender</span><span className="info-val">{PATIENT.age}y · {PATIENT.gender}</span></div>
          <div className="info-row">
            <span className="info-label">Blood</span>
            <span className="info-val" style={{ color: "var(--red)" }}>{PATIENT.bloodGroup}</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 6 }}>CONDITIONS</div>
            {PATIENT.conditions.map(c => <span key={c} className="tag tag-amber">{c}</span>)}
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 6 }}>ALLERGIES</div>
            {PATIENT.allergies.map(a => <span key={a} className="tag tag-red">{a}</span>)}
          </div>

          {/* Call Patient */}
          <div style={{ marginTop: 16 }}>
            <div className="panel-title" style={{ marginBottom: 10 }}>📞 Smart Call</div>
            {isCalling ? (
              <div className="calling-indicator">
                <div className="calling-text">📞 Connected · Speaker Mode ON</div>
                <div className="calling-instruction">"Stay still. Help is 6 minutes away. Do not move your neck."</div>
                <button className="action-btn btn-red-sm" style={{ marginTop: 10 }} onClick={() => setIsCalling(false)}>END CALL</button>
              </div>
            ) : (
              <button className="action-btn btn-blue" onClick={() => setIsCalling(true)}>📞 CALL PATIENT</button>
            )}
          </div>
        </div>

        {/* Hospital Panel */}
        <div className="panel">
          <div className="panel-title">🏥 Apollo Trauma Centre</div>
          <div className="hosp-status">
            <div className="hosp-dot-green" />
            <div>
              <div className="hosp-text">Dr. Priya Nair — READY</div>
              <div className="hosp-sub">Trauma Surgeon · On standby</div>
            </div>
          </div>
          <div className="hosp-status">
            <div className="hosp-dot-green" />
            <div>
              <div className="hosp-text">ICU Bed 3 — AVAILABLE</div>
              <div className="hosp-sub">Neurology bay cleared</div>
            </div>
          </div>
          <div className="hosp-status">
            <div className="hosp-dot-amber" />
            <div>
              <div className="hosp-text">OR Suite 2 — ON HOLD</div>
              <div className="hosp-sub">Awaiting vitals confirmation</div>
            </div>
          </div>
          <button
            className={`action-btn ${vitalsSent ? "btn-green-sm" : "btn-blue"}`}
            style={{ marginTop: 12 }}
            onClick={() => setVitalsSent(true)}
          >
            {vitalsSent ? "✓ VITALS TRANSMITTED" : "📡 SEND VITALS TO HOSPITAL"}
          </button>
          <button className="action-btn btn-blue">📞 CALL HOSPITAL</button>
        </div>

        {/* Navigation + System Flow */}
        <div>
          <div className="nav-mini">
            <div>
              <div className="nav-eta">{eta} <span>min ETA</span></div>
              <div className="nav-dest">{INCIDENT.location}</div>
            </div>
            <button
              className="action-btn btn-blue"
              style={{ width: "auto", margin: 0 }}
              onClick={() => window.open(`https://www.google.com/maps?q=${INCIDENT.coords.lat},${INCIDENT.coords.lng}`, "_blank")}
            >
              🗺 MAPS
            </button>
          </div>

          {/* System Flow */}
          <div className="panel">
            <div className="panel-title" style={{ marginBottom: 14 }}>📡 System Flow</div>
            <div className="flow-bar" style={{ flexDirection: "column", gap: 8, padding: "12px 14px" }}>
              {[
                { icon: "🚗", label: "Vehicle Sensor", latency: "12ms", status: "LIVE" },
                { icon: "🤖", label: "AI Engine", latency: "38ms", status: "ACTIVE" },
                { icon: "🚑", label: "Ambulance", latency: "—", status: "IN TRANSIT" },
                { icon: "🏥", label: "Hospital", latency: "74ms", status: "STANDBY" },
              ].map((node, i, arr) => (
                <div key={node.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{node.icon}</span>
                      <span style={{ fontSize: 12 }}>{node.label}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--green)" }}>{node.status}</div>
                      {node.latency !== "—" && <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>{node.latency}</div>}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--blue)" }}>↓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button className="action-btn btn-amber" style={{ background: "rgba(255,176,32,0.1)", color: "var(--amber)", border: "1px solid rgba(255,176,32,0.3)", marginTop: 8 }} onClick={onArrive}>
            🔴 ARRIVED ON SCENE
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ON SCENE ────────────────────────────────────────────────────────────────

function OnSceneDashboard({ vitals, onTransport, actionLog, setActionLog }) {
  const [doneSteps, setDoneSteps] = useState([]);
  const { chatMessages, isOffline, sendChat } = useChatLogic(DOCTOR_MESSAGES);
  const [chatInput, setChatInput] = useState("");

  const toggleStep = (id) => {
    const now = new Date().toLocaleTimeString("en-IN", { hour12: false });
    if (doneSteps.includes(id)) {
      setDoneSteps(d => d.filter(s => s !== id));
    } else {
      setDoneSteps(d => [...d, id]);
      const step = PROTOCOLS.find(p => p.id === id);
      setActionLog(l => [...l, { time: now, text: `Protocol ${id} completed: ${step.label}` }]);
    }
  };

  const handleSendChat = () => {
    sendChat(chatInput);
    setChatInput("");
  };

  return (
    <div className="screen-wide">
      {/* Source badge */}
      <div>
        <span className="source-badge"><span className="source-dot" />Source: Ambulance Monitor Device</span>
      </div>

      <div className="vitals-grid" style={{ marginBottom: 20 }}>
        <VitalCard name="SpO₂" value={vitals.spo2} unit="%" baseline={BASELINE_VITALS.spo2} type="spo2" />
        <VitalCard name="Heart Rate" value={vitals.hr} unit="bpm" baseline={BASELINE_VITALS.hr} type="hr" />
        <VitalCard name="Blood Pressure" value={vitals.bp} unit="mmHg" baseline={BASELINE_VITALS.bp} type="bp" />
        <VitalCard name="Resp. Rate" value={vitals.rr} unit="brpm" baseline={BASELINE_VITALS.rr} type="rr" />
      </div>

      <div className="grid-2">
        {/* Protocol */}
        <div>
          <div className="panel-title" style={{ marginBottom: 12 }}>📋 ACTIVE PROTOCOL — ABCDEF FRAMEWORK</div>
          {PROTOCOLS.map(step => (
            <div
              key={step.id}
              className={`protocol-step ${doneSteps.includes(step.id) ? "done" : ""} ${step.critical ? "critical-step" : ""}`}
              onClick={() => toggleStep(step.id)}
            >
              <div className="step-index">
                {doneSteps.includes(step.id) ? "✓" : step.id}
              </div>
              <div style={{ flex: 1 }}>
                <div className="step-label">
                  {step.label}
                  {step.critical && <span className="tag tag-red" style={{ marginLeft: 8, fontSize: 10 }}>CRITICAL</span>}
                </div>
                <div className="step-detail">{step.detail}</div>
                {doneSteps.includes(step.id) && (
                  <div className="step-time">
                    ✓ Logged at {new Date().toLocaleTimeString("en-IN", { hour12: false })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          {/* AI Validation */}
          <div className="ai-panel" style={{ marginBottom: 16 }}>
            <div className="ai-panel-title"><span className="ai-pulse" /> AI INJURY VALIDATION</div>
            {[
              { injury: "Traumatic Brain Injury", conf: "CONFIRMED", match: true },
              { injury: "Left Clavicle Fracture", conf: "CONFIRMED", match: true },
              { injury: "Internal Thoracic Bleeding", conf: "SUSPECTED — monitor BP closely", match: false },
            ].map(item => (
              <div className="ai-validation-item" key={item.injury}>
                <span className={`av-conf ${item.match ? "confirmed" : ""}`}>{item.match ? "✓" : "⚠"}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.injury}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{item.conf}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Doctor Chat */}
          <div className="panel" style={{ marginBottom: 0 }}>
            <div className="panel-title">🏥 Real-Time Doctor Channel — Dr. Priya Nair</div>
            {isOffline && (
              <div style={{ background: "rgba(255,176,32,0.1)", borderBottom: "1px solid rgba(255,176,32,0.3)", padding: "6px 12px", color: "var(--amber)", fontSize: 11, textAlign: "center", fontWeight: 600 }}>
                Offline — messages queued
              </div>
            )}
            <div className="chat-box">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.from === "me" ? "mine" : ""}`}>
                  <div className="chat-avatar">{msg.from === "me" ? "P" : "Dr"}</div>
                  <div style={{ flex: 1 }}>
                    <div className="chat-bubble" style={{ maxWidth: "100%" }}>{msg.text}</div>
                    <div className="chat-meta" style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start", gap: 6, alignItems: "center" }}>
                      {msg.from === "me" && msg.status === "queued" && <span style={{ fontStyle: "italic", color: "var(--amber)" }}>(will send when online)</span>}
                      <span>{msg.name} · {msg.time}</span>
                      {msg.from === "me" && (
                        <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
                          {msg.status === "sending" ? "🕒" : msg.status === "delivered" ? "✓✓" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-input-row" style={{ marginTop: 10 }}>
              <input
                className="chat-input"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendChat()}
                placeholder="Message Dr. Nair..."
              />
              <button className="btn-send" onClick={handleSendChat}>SEND</button>
            </div>
          </div>

          <button
            className="action-btn"
            style={{ background: "rgba(255,176,32,0.1)", color: "var(--amber)", border: "1px solid rgba(255,176,32,0.3)", marginTop: 12 }}
            onClick={onTransport}
          >
            🚑 BEGIN TRANSPORT
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TRANSPORT ────────────────────────────────────────────────────────────────

function TransportDashboard({ vitals, onHandoff }) {
  const { chatMessages, isOffline, sendChat } = useChatLogic([
    { id: 1, from: "dr", name: "Dr. Priya Nair", time: "14:51", text: "Prepare IV push of 250ml NS. Keep SpO₂ above 92 if possible." },
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChat = () => {
    sendChat(chatInput);
    setChatInput("");
  };

  const spo2 = parseInt(vitals.spo2);
  const hr = parseInt(vitals.hr);

  return (
    <div className="screen-wide">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700 }}>TRANSPORT MODE</div>
        <span className="tag tag-amber">IN TRANSIT</span>
        {spo2 < 92 ? <span className="trend-chip trend-worse">⬇ SpO₂ DROPPING</span> :
          hr > 110 ? <span className="trend-chip trend-stable-chip">HR ELEVATED</span> :
            <span className="trend-chip trend-better">STABILISING</span>}
      </div>

      <div className="vitals-grid" style={{ marginBottom: 16 }}>
        <VitalCard name="SpO₂" value={vitals.spo2} unit="%" baseline={BASELINE_VITALS.spo2} type="spo2" />
        <VitalCard name="Heart Rate" value={vitals.hr} unit="bpm" baseline={BASELINE_VITALS.hr} type="hr" />
        <VitalCard name="Blood Pressure" value={vitals.bp} unit="mmHg" baseline={BASELINE_VITALS.bp} type="bp" />
        <VitalCard name="Resp. Rate" value={vitals.rr} unit="brpm" baseline={BASELINE_VITALS.rr} type="rr" />
      </div>

      <div className="grid-2">
        <div>
          {/* AI Monitoring */}
          <div className="ai-panel" style={{ marginBottom: 16 }}>
            <div className="ai-panel-title"><span className="ai-pulse" /> AI TRANSPORT MONITORING</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { flag: spo2 < 92, label: "SpO₂ alert", msg: `SpO₂ at ${spo2}% — consider BVM ventilation`, level: "red" },
                { flag: hr > 110, label: "Tachycardia", msg: `HR ${hr} bpm — monitor for fluid loss`, level: "amber" },
                { flag: true, label: "TBI Protocol Active", msg: "Maintain head elevation 30°, cervical collar on.", level: "blue" },
              ].filter(a => a.flag).map(alert => (
                <div key={alert.label} style={{
                  padding: "8px 12px", borderRadius: 6, fontSize: 12,
                  background: `var(--${alert.level}-dim)`, border: `1px solid var(--${alert.level})`,
                  color: `var(--${alert.level})`
                }}>
                  <strong>{alert.label}:</strong> {alert.msg}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="nav-mini">
            <div>
              <div className="nav-eta">4 <span>min ETA</span></div>
              <div className="nav-dest">Apollo Trauma Centre, Vijayawada</div>
            </div>
            <button
              className="action-btn btn-blue"
              style={{ width: "auto", margin: 0 }}
              onClick={() => window.open("https://www.google.com/maps", "_blank")}
            >
              🗺 MAPS
            </button>
          </div>
        </div>

        <div>
          <div className="panel">
            <div className="panel-title">🏥 Hospital Channel — Dr. Priya Nair</div>
            {isOffline && (
              <div style={{ background: "rgba(255,176,32,0.1)", borderBottom: "1px solid rgba(255,176,32,0.3)", padding: "6px 12px", color: "var(--amber)", fontSize: 11, textAlign: "center", fontWeight: 600 }}>
                Offline — messages queued
              </div>
            )}
            <div className="chat-box">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.from === "me" ? "mine" : ""}`}>
                  <div className="chat-avatar">{msg.from === "me" ? "P" : "Dr"}</div>
                  <div style={{ flex: 1 }}>
                    <div className="chat-bubble" style={{ maxWidth: "100%" }}>{msg.text}</div>
                    <div className="chat-meta" style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start", gap: 6, alignItems: "center" }}>
                      {msg.from === "me" && msg.status === "queued" && <span style={{ fontStyle: "italic", color: "var(--amber)" }}>(will send when online)</span>}
                      <span>{msg.name} · {msg.time}</span>
                      {msg.from === "me" && (
                        <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
                          {msg.status === "sending" ? "🕒" : msg.status === "delivered" ? "✓✓" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-input-row" style={{ marginTop: 10 }}>
              <input className="chat-input" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendChat()} placeholder="Update hospital team..." />
              <button className="btn-send" onClick={handleSendChat}>SEND</button>
            </div>
          </div>

          <button className="action-btn btn-green-sm" style={{ marginTop: 12 }} onClick={onHandoff}>
            🏥 ARRIVED AT HOSPITAL — BEGIN HANDOFF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HANDOFF ─────────────────────────────────────────────────────────────────

function HandoffScreen({ actionLog }) {
  return (
    <div className="screen">
      <div className="handoff-header">
        <div className="handoff-title">PATIENT HANDOFF REPORT</div>
        <div className="handoff-sub">Apollo Trauma Centre · {new Date().toLocaleString("en-IN")}</div>
        <div className="handoff-complete">✓ HANDOFF COMPLETE</div>
      </div>

      <div className="grid-2">
        {/* Patient Info */}
        <div className="panel">
          <div className="panel-title">👤 Patient</div>
          <div className="info-row"><span className="info-label">Name</span><span className="info-val">{PATIENT.name}</span></div>
          <div className="info-row"><span className="info-label">Age / Gender</span><span className="info-val">{PATIENT.age} · {PATIENT.gender}</span></div>
          <div className="info-row"><span className="info-label">Blood Group</span><span className="info-val" style={{ color: "var(--red)" }}>{PATIENT.bloodGroup}</span></div>
          <div className="info-row">
            <span className="info-label">Conditions</span>
            <span>{PATIENT.conditions.map(c => <span key={c} className="tag tag-amber">{c}</span>)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Allergies</span>
            <span>{PATIENT.allergies.map(a => <span key={a} className="tag tag-red">{a}</span>)}</span>
          </div>
        </div>

        {/* AI Summary */}
        <div className="ai-panel">
          <div className="ai-panel-title"><span className="ai-pulse" /> AI CASE SUMMARY</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>INITIAL CONDITION</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{AI_INITIAL.initialCondition}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>FINAL CONDITION AT HANDOFF</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Patient stabilised on scene. SpO₂ maintained above 92% during transport. BP recovering. C-spine precautions maintained throughout. GCS assessed at 10 (E3V3M4).
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            {[
              { label: "Predicted Injuries", val: "3 confirmed, 1 suspected" },
              { label: "AI Accuracy", val: "91%" },
              { label: "SEWS Score (Arrival)", val: "7 — High Risk" },
              { label: "SEWS Score (Handoff)", val: "5 — Medium Risk" },
            ].map(r => (
              <div className="info-row" key={r.label}>
                <span className="info-label">{r.label}</span>
                <span className="info-val">{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vital Summary Table */}
      <div style={{ marginBottom: 16 }}>
        <div className="panel-title" style={{ marginBottom: 12 }}>📊 Vital Signs Summary</div>
        <div className="vital-compare-row">
          {["Measure", "Baseline", "Post-Accident", "At Handoff"].map(h => (
            <div className="vcr-header" key={h}>{h}</div>
          ))}
          {[
            ["SpO₂ (%)", BASELINE_VITALS.spo2, HANDOFF_TRANSPORT_VITALS.spo2, "93"],
            ["Heart Rate (bpm)", BASELINE_VITALS.hr, HANDOFF_TRANSPORT_VITALS.hr, "98"],
            ["Blood Pressure", BASELINE_VITALS.bp, HANDOFF_TRANSPORT_VITALS.bp, "102/68"],
            ["Resp. Rate (brpm)", BASELINE_VITALS.rr, HANDOFF_TRANSPORT_VITALS.rr, "20"],
          ].map(row => (
            row.map((cell, i) => (
              <div key={i} className={i === 0 ? "vcr-label" : "vcr-cell"}>
                {cell}
              </div>
            ))
          ))}
        </div>
      </div>

      {/* Treatment Log */}
      <div className="panel">
        <div className="panel-title">🧾 Treatment Log</div>
        {[
          { time: "14:33", text: <><strong>Dispatch accepted.</strong> Unit dispatched to NH-65 Mangalagiri</> },
          { time: "14:38", text: <><strong>Vitals transmitted</strong> to Apollo Trauma Centre</> },
          { time: "14:39", text: <><strong>A — Airway secured.</strong> C-spine collar applied</> },
          { time: "14:40", text: <><strong>B — O₂ administered.</strong> 15L/min non-rebreather mask</> },
          { time: "14:41", text: <><strong>C — Bleeding controlled.</strong> Hemostatic gauze applied to head laceration</> },
          { time: "14:42", text: <><strong>D — IV access established.</strong> 18G left antecubital. 500ml NS initiated</> },
          { time: "14:43", text: <><strong>E — GCS assessed:</strong> E3V3M4 = 10</> },
          ...actionLog.map(l => ({ time: l.time, text: l.text })),
          { time: "14:52", text: <><strong>Transport initiated.</strong> Destination: Apollo Trauma Centre</> },
          { time: "14:57", text: <><strong>Arrived at hospital.</strong> Patient transferred to trauma team</> },
        ].map((item, i) => (
          <div className="log-item" key={i}>
            <span className="log-time">{item.time}</span>
            <span className="log-text">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function HelperDashboard() {
  const [stage, setStage] = useState("alert");
  const vitals = useVitals(stage === "enroute" || stage === "scene" || stage === "transport");
  const [actionLog, setActionLog] = useState([]);

  const handleAccept = () => setStage("mode");
  const handleDecline = () => alert("Dispatch declined. Reporting to dispatch center.");
  const handleModeSelect = (mode) => { if (mode === "paramedic") setStage("enroute"); };
  const handleArrive = () => setStage("scene");
  const handleTransport = () => setStage("transport");
  const handleHandoff = () => setStage("handoff");

  return (
    <>
      <style>{CSS}</style>
      <div className="hd-root">
        <Topbar stage={stage} incidentId={INCIDENT.id} />

        {stage !== "alert" && stage !== "mode" && (
          <div style={{ padding: "64px 16px 0", maxWidth: 1400, margin: "0 auto" }}>
            <StageTabs stage={stage} setStage={setStage} />
          </div>
        )}

        {stage === "alert" && <AlertScreen onAccept={handleAccept} onDecline={handleDecline} />}
        {stage === "mode" && <ModeSelection onSelect={handleModeSelect} />}
        {stage === "enroute" && <EnRouteDashboard vitals={vitals} onArrive={handleArrive} />}
        {stage === "scene" && <OnSceneDashboard vitals={vitals} onTransport={handleTransport} actionLog={actionLog} setActionLog={setActionLog} />}
        {stage === "transport" && <TransportDashboard vitals={vitals} onHandoff={handleHandoff} />}
        {stage === "handoff" && <HandoffScreen actionLog={actionLog} />}
      </div>
    </>
  );
}