import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldAlert, AlertTriangle, CheckCircle, ChevronRight,
  BrainCircuit, Clock, Ambulance, Building2, MapPin,
  AlertOctagon, GitCommit, Bell, BarChart3, Users,
  Network, Radio, Zap, HeartPulse, Stethoscope, ArrowRight, TrendingUp,
  Bed, Receipt
} from 'lucide-react';

/* ─── DESIGN SYSTEM ───────────────────────────────────────────────────────── */
const DS = {
  bg: "#05090F",
  surface: "#0A111B",
  surfaceHigh: "#0F1826",
  surfaceHover: "#142033",
  border: "#1A273A",
  borderLight: "#23354E",
  text: "#F0F4F8",
  textMid: "#82A0C2",
  textDim: "#4A688A",
  accent: "#3B82F6",
  green: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
  purple: "#8B5CF6",
  cyan: "#06B6D4"
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1C2D42; border-radius: 2px; }
  @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes slide-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fade-in { from{opacity:0} to{opacity:1} }
  @keyframes critical-glow { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0)} 50%{box-shadow:0 0 0 6px rgba(239,68,68,0.2)} }
  @keyframes amber-glow { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0)} 50%{box-shadow:0 0 0 6px rgba(245,158,11,0.2)} }
  @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
  .grid-container { display: grid; gap: 20px; }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
`;

/* ─── SIMULATED DATA STORES ───────────────────────────────────────────────── */
const PIPELINE_STATS = {
  incoming: 14,
  allocation: 8,
  triage: 22,
  admitted: 145,
  billing: 12,
  discharged: 38
};

const INCIDENTS = [
  { id: 'INC-9901', severity: 'Critical', location: 'Downtown Financial District', unit: 'Unit 42', eta: '3 mins', status: 'En Route', type: 'Trauma / MVA' },
  { id: 'INC-9902', severity: 'Critical', location: 'Westside Highway', unit: 'Unit 17', eta: '6 mins', status: 'En Route', type: 'Cardiac Arrest' },
  { id: 'INC-9903', severity: 'Moderate', location: 'North Sector Metro Station', unit: 'Unit 05', eta: '12 mins', status: 'En Route', type: 'Fall Injury' },
  { id: 'INC-9904', severity: 'Low', location: 'Suburban Mall', unit: 'Unit 11', eta: '--', status: 'On Scene', type: 'Minor Laceration' },
  { id: 'INC-9905', severity: 'Critical', location: 'Industrial Park Zone B', unit: 'Unit 09', eta: '15 mins', status: 'Transport', type: 'Chemical Burn' },
  { id: 'INC-9906', severity: 'Moderate', location: 'Eastside Residential', unit: 'Unit 22', eta: '--', status: 'Completed', type: 'Asthma Attack' }
];

const HOSPITALS = [
  { id: 'H01', name: 'City General Hospital', icu: { occ: 18, total: 20 }, ward: { occ: 145, total: 180 }, activeEmergencies: 5, status: 'red' },
  { id: 'H02', name: 'Metro Central Med', icu: { occ: 12, total: 25 }, ward: { occ: 90, total: 150 }, activeEmergencies: 2, status: 'green' },
  { id: 'H03', name: 'Westside Trauma Center', icu: { occ: 14, total: 15 }, ward: { occ: 110, total: 120 }, activeEmergencies: 6, status: 'red' },
  { id: 'H04', name: 'North Valley Clinic', icu: { occ: 5, total: 10 }, ward: { occ: 45, total: 80 }, activeEmergencies: 1, status: 'green' }
];

const AMBULANCES = [
  { id: 'Unit 42', status: 'En Route', case: 'INC-9901', eta: '3 mins', location: '2.4km from scene' },
  { id: 'Unit 17', status: 'En Route', case: 'INC-9902', eta: '6 mins', location: '4.1km from scene' },
  { id: 'Unit 05', status: 'En Route', case: 'INC-9903', eta: '12 mins', location: '8.0km from scene' },
  { id: 'Unit 09', status: 'Transport', case: 'INC-9905', eta: '8 mins (to H03)', location: 'En route to hospital' },
  { id: 'Unit 11', status: 'On Scene', case: 'INC-9904', eta: '--', location: 'Suburban Mall' },
  { id: 'Unit 22', status: 'Idle', case: '--', eta: '--', location: 'Base Station East' },
  { id: 'Unit 03', status: 'Idle', case: '--', eta: '--', location: 'Base Station Central' },
  { id: 'Unit 14', status: 'Busy', case: 'Maintenance', eta: '--', location: 'Depot' }
];

const ALERTS = [
  { id: 1, type: 'Critical', text: 'Westside Trauma Center ICU at 93% capacity. Divert inbound trauma.', time: 'Just now' },
  { id: 2, type: 'Critical', text: 'Multiple critical patients (3) inbound from Highway MVA.', time: '2 mins ago' },
  { id: 3, type: 'Warning', text: 'Unit 05 experiencing 5+ min delay due to heavy traffic on North Route.', time: '8 mins ago' },
  { id: 4, type: 'Warning', text: 'City General discharge backlog causing ward bed shortage.', time: '15 mins ago' }
];

const AI_INSIGHTS = [
  { icon: Building2, text: 'High probability (89%) of ICU overload at City General in next 45 minutes based on incoming triage data.', action: 'Initiate protocol Divert-Alpha' },
  { icon: Ambulance, text: 'Recommend increasing ambulance deployment in Northern Sector due to projected rush-hour anomaly.', action: 'Redeploy 3 units' },
  { icon: TrendingUp, text: 'Trauma cases trending +18% above 30-day average. Suggesting preemptive OR prep at Metro Central.', action: 'Alert OR Staff' }
];

/* ─── UI COMPONENTS ───────────────────────────────────────────────────────── */
const Card = ({ children, style, glow }) => (
  <div style={{
    background: DS.surface,
    border: `1px solid ${DS.border}`,
    borderRadius: 12,
    padding: 20,
    boxShadow: glow ? `0 0 20px ${glow}15` : '0 8px 32px rgba(0,0,0,0.2)',
    animation: glow ? 'critical-glow 2.5s infinite' : 'slide-up 0.3s ease',
    ...style
  }}>
    {children}
  </div>
);

const Badge = ({ label, color }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 6, fontSize: 10, fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'IBM Plex Mono', monospace" }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
    {label}
  </span>
);

const MetricCard = ({ title, value, icon: Icon, color, sub, pulse }) => (
  <div style={{ background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: DS.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>{title}</p>
        <p style={{ fontSize: 32, fontWeight: 800, color: DS.text, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1 }}>{value}</p>
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} style={{ animation: pulse ? 'pulse-dot 2s infinite' : 'none' }} />
      </div>
    </div>
    <p style={{ fontSize: 12, color: DS.textMid, fontWeight: 500 }}>{sub}</p>
  </div>
);

/* ─── TABS ────────────────────────────────────────────────────────────────── */
const OverviewTab = () => {
  const icuBedsAvail = HOSPITALS.reduce((acc, h) => acc + (h.icu.total - h.icu.occ), 0);
  const totalActiveUnits = AMBULANCES.filter(a => a.status !== 'Idle').length;
  const criticalEmergencies = INCIDENTS.filter(i => i.severity === 'Critical').length;
  const critAlerts = ALERTS.filter(a => a.type === 'Critical').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-in 0.4s ease' }}>
      <div className="grid-container grid-4">
        <MetricCard title="Active Emergencies" value={INCIDENTS.length} sub={`${criticalEmergencies} critical priority`} icon={ShieldAlert} color={DS.red} pulse={true} />
        <MetricCard title="Ambulances Active" value={totalActiveUnits} sub={`${AMBULANCES.length - totalActiveUnits} units idle/standby`} icon={Ambulance} color={DS.accent} />
        <MetricCard title="Hospitals Online" value={HOSPITALS.length} sub="Regional network connected" icon={Building2} color={DS.green} />
        <MetricCard title="ICU Beds Available" value={icuBedsAvail} sub="Across 4 network hospitals" icon={Bed} color={icuBedsAvail < 10 ? DS.amber : DS.cyan} />
      </div>

      <div className="grid-container grid-2">
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${DS.borderLight}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BrainCircuit size={18} color={DS.purple} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: DS.text, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>AI Predictive Insights</h3>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {AI_INSIGHTS.map((insight, idx) => (
              <div key={idx} style={{ background: `${DS.purple}08`, border: `1px solid ${DS.purple}20`, borderRadius: 8, padding: 16, display: 'flex', gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: `${DS.purple}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <insight.icon size={16} color={DS.purple} />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: DS.text, lineHeight: 1.5, marginBottom: 10 }}>{insight.text}</p>
                  <button style={{ background: DS.surfaceHigh, border: `1px solid ${DS.purple}40`, color: DS.purple, padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer', transition: 'all 0.2s' }}>
                    {insight.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${DS.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertOctagon size={18} color={DS.amber} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: DS.text, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>System Alerts</h3>
            </div>
            {critAlerts > 0 && <Badge label={`${critAlerts} CRITICAL`} color={DS.red} />}
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ALERTS.map(alert => (
              <div key={alert.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, background: alert.type === 'Critical' ? `${DS.red}10` : `${DS.amber}10`, border: `1px solid ${alert.type === 'Critical' ? DS.red : DS.amber}30`, borderRadius: 8 }}>
                {alert.type === 'Critical' ? <AlertOctagon size={16} color={DS.red} style={{ marginTop: 2, animation: 'pulse-dot 1.5s infinite' }} /> : <AlertTriangle size={16} color={DS.amber} style={{ marginTop: 2 }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DS.text, marginBottom: 4 }}>{alert.text}</p>
                  <p style={{ fontSize: 10, color: DS.textDim, fontFamily: "'IBM Plex Mono', monospace" }}>{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const IncidentsTab = () => (
  <div style={{ animation: 'fade-in 0.4s ease' }}>
    <Card style={{ padding: 0 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${DS.border}` }}>
            {['Incident ID', 'Severity', 'Type & Location', 'Assigned Unit', 'ETA', 'Status'].map(h => (
              <th key={h} style={{ padding: '16px 20px', fontSize: 11, fontWeight: 600, color: DS.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'IBM Plex Mono', monospace" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INCIDENTS.map(inc => {
            const sevColor = inc.severity === 'Critical' ? DS.red : inc.severity === 'Moderate' ? DS.amber : DS.green;
            return (
              <tr key={inc.id} style={{ borderBottom: `1px solid ${DS.borderLight}`, transition: 'background 0.2s' }}>
                <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700, color: DS.text, fontFamily: "'IBM Plex Mono', monospace" }}>{inc.id}</td>
                <td style={{ padding: '16px 20px' }}>
                  <Badge label={inc.severity} color={sevColor} />
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DS.text, marginBottom: 4 }}>{inc.type}</p>
                  <p style={{ fontSize: 11, color: DS.textMid, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />{inc.location}</p>
                </td>
                <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: DS.accent, fontFamily: "'IBM Plex Mono', monospace" }}>{inc.unit}</td>
                <td style={{ padding: '16px 20px', fontSize: 13, color: DS.textMid, fontFamily: "'IBM Plex Mono', monospace" }}>{inc.eta}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: inc.status === 'En Route' ? DS.amber : inc.status === 'Completed' ? DS.green : DS.text, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase' }}>
                    {inc.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  </div>
);

const PipelineTab = () => {
  const stages = [
    { id: 'incoming', label: 'Incoming Triage', icon: Ambulance, color: DS.red, count: PIPELINE_STATS.incoming },
    { id: 'allocation', label: 'AI Allocation', icon: BrainCircuit, color: DS.amber, count: PIPELINE_STATS.allocation },
    { id: 'triage', label: 'ER / Triage', icon: Stethoscope, color: DS.accent, count: PIPELINE_STATS.triage },
    { id: 'admitted', label: 'Floor Admitted', icon: Bed, color: DS.cyan, count: PIPELINE_STATS.admitted },
    { id: 'billing', label: 'Billing Pending', icon: Receipt, color: DS.purple, count: PIPELINE_STATS.billing },
    { id: 'discharged', label: 'Discharged Today', icon: CheckCircle, color: DS.green, count: PIPELINE_STATS.discharged }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-in 0.4s ease' }}>
      <Card style={{ padding: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 40, right: 40, height: 2, background: DS.borderLight, zIndex: 0, transform: 'translateY(-50%)' }} />

          {stages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, background: DS.surface, padding: '0 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${stage.color}15`, border: `2px solid ${stage.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${stage.color}20` }}>
                  <stage.icon size={28} color={stage.color} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: DS.text, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1, marginBottom: 6 }}>{stage.count}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'IBM Plex Mono', monospace" }}>{stage.label}</p>
                </div>
              </div>
              {idx < stages.length - 1 && (
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <ArrowRight size={24} color={DS.borderLight} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <div className="grid-container grid-2">
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: DS.text, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 20 }}>Throughput Bottlenecks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: DS.text, marginBottom: 8 }}>
                <span>ER to Floor Admission Wait</span>
                <span style={{ color: DS.amber }}>45 mins (Target: &lt;30m)</span>
              </div>
              <div style={{ height: 6, background: DS.borderLight, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: DS.amber }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: DS.text, marginBottom: 8 }}>
                <span>Discharge Billing Clearance</span>
                <span style={{ color: DS.red }}>2.4 hrs (Target: &lt;1h)</span>
              </div>
              <div style={{ height: 6, background: DS.borderLight, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '90%', height: '100%', background: DS.red }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: DS.text, marginBottom: 8 }}>
                <span>Ambulance Turnaround Time</span>
                <span style={{ color: DS.green }}>18 mins (Target: &lt;20m)</span>
              </div>
              <div style={{ height: 6, background: DS.borderLight, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', background: DS.green }} />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: DS.text, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 20 }}>System Volume Forecast</h3>
          <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 12, padding: '20px 0', borderBottom: `1px solid ${DS.borderLight}` }}>
            {[40, 55, 30, 80, 95, 60, 45, 70, 85].map((h, i) => (
              <div key={i} style={{ flex: 1, background: i === 4 ? DS.red : DS.accent, height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: i === 4 ? 1 : 0.6, position: 'relative' }}>
                {i === 4 && <span style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: DS.red, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>PEAK</span>}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 10, color: DS.textDim, fontFamily: "'IBM Plex Mono', monospace" }}>
            <span>-4 Hours</span>
            <span>Current</span>
            <span>+4 Hours</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

const HospitalsTab = () => (
  <div className="grid-container grid-2" style={{ animation: 'fade-in 0.4s ease' }}>
    {HOSPITALS.map(h => {
      const icuPct = Math.round((h.icu.occ / h.icu.total) * 100);
      const wardPct = Math.round((h.ward.occ / h.ward.total) * 100);
      return (
        <Card key={h.id} glow={h.status === 'red' ? DS.red : null}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: DS.surfaceHover, border: `1px solid ${DS.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={24} color={DS.text} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: DS.text }}>{h.name}</h3>
                <p style={{ fontSize: 11, color: DS.textDim, fontFamily: "'IBM Plex Mono', monospace" }}>Network ID: {h.id}</p>
              </div>
            </div>
            <Badge label={h.status === 'red' ? 'CRITICAL LOAD' : 'NOMINAL'} color={h.status === 'red' ? DS.red : DS.green} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                <span style={{ color: DS.textMid }}>ICU Occupancy</span>
                <span style={{ color: icuPct > 85 ? DS.red : DS.text, fontWeight: 700 }}>{h.icu.occ} / {h.icu.total} ({icuPct}%)</span>
              </div>
              <div style={{ height: 6, background: DS.surfaceHigh, borderRadius: 3, border: `1px solid ${DS.borderLight}` }}>
                <div style={{ height: '100%', width: `${icuPct}%`, background: icuPct > 85 ? DS.red : DS.accent, borderRadius: 2 }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                <span style={{ color: DS.textMid }}>Ward Occupancy</span>
                <span style={{ color: wardPct > 85 ? DS.amber : DS.text, fontWeight: 700 }}>{h.ward.occ} / {h.ward.total} ({wardPct}%)</span>
              </div>
              <div style={{ height: 6, background: DS.surfaceHigh, borderRadius: 3, border: `1px solid ${DS.borderLight}` }}>
                <div style={{ height: '100%', width: `${wardPct}%`, background: wardPct > 85 ? DS.amber : DS.green, borderRadius: 2 }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${DS.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={14} color={DS.accent} />
              <span style={{ fontSize: 12, color: DS.textMid }}>Active ER Traumas: <strong style={{ color: DS.text }}>{h.activeEmergencies}</strong></span>
            </div>
            <button style={{ background: 'transparent', border: `1px solid ${DS.borderLight}`, color: DS.text, padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer' }}>Manage Overrides</button>
          </div>
        </Card>
      );
    })}
  </div>
);

const AmbulancesTab = () => (
  <div style={{ animation: 'fade-in 0.4s ease' }}>
    <Card style={{ padding: 0 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${DS.border}` }}>
            {['Unit ID', 'Status', 'Current Case', 'ETA / Location', 'Actions'].map(h => (
              <th key={h} style={{ padding: '16px 20px', fontSize: 11, fontWeight: 600, color: DS.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'IBM Plex Mono', monospace" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AMBULANCES.map((unit, idx) => {
            const sColor = unit.status === 'En Route' ? DS.red : unit.status === 'On Scene' ? DS.amber : unit.status === 'Transport' ? DS.accent : DS.green;
            return (
              <tr key={idx} style={{ borderBottom: `1px solid ${DS.borderLight}`, transition: 'background 0.2s' }}>
                <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700, color: DS.text, fontFamily: "'IBM Plex Mono', monospace", display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: DS.surfaceHigh, border: `1px solid ${DS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ambulance size={14} color={sColor} />
                  </div>
                  {unit.id}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <Badge label={unit.status} color={sColor} />
                </td>
                <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: unit.case !== '--' ? DS.text : DS.textDim, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {unit.case}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  {unit.eta !== '--' ? (
                    <p style={{ fontSize: 13, fontWeight: 700, color: DS.red, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>ETA: {unit.eta}</p>
                  ) : null}
                  <p style={{ fontSize: 11, color: DS.textMid, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> {unit.location}</p>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <button style={{ background: DS.surfaceHigh, border: `1px solid ${DS.borderLight}`, color: DS.text, padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer' }}>Ping Unit</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  </div>
);

/* ─── MAIN APP COMPONENT ──────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const adminProfile = (() => { try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; } })();
  const adminName = adminProfile.name || 'Admin';
  const adminId = adminProfile.userId || '';

  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'pipeline', label: 'Pipeline', icon: Network },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    { id: 'ambulances', label: 'Ambulances', icon: Radio },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', background: DS.bg, color: DS.text, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* TOP NAVIGATION */}
      <header style={{ height: 60, background: DS.surface, borderBottom: `1px solid ${DS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 36, height: 36, background: `${DS.accent}15`, border: `1px solid ${DS.accent}40`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={20} color={DS.accent} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.15em', color: DS.text, fontFamily: "'Syne', sans-serif", lineHeight: 1.2 }}>NexVitals</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: DS.accent, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>Global Admin Control</span>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: 8, height: '100%' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', height: '100%', background: 'transparent',
                border: 'none', borderBottom: `2px solid ${activeTab === t.id ? DS.accent : 'transparent'}`,
                color: activeTab === t.id ? DS.text : DS.textMid, cursor: 'pointer', transition: 'all 0.2s',
                fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em'
              }}
            >
              <t.icon size={14} color={activeTab === t.id ? DS.accent : DS.textDim} />
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${DS.green}10`, padding: '6px 12px', borderRadius: 6, border: `1px solid ${DS.green}25` }}>
            <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: DS.green, opacity: 0.4, animation: 'pulse-dot 1.5s infinite' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: DS.green }} />
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: DS.green, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' }}>System Live</span>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: DS.surfaceHigh, border: `1px solid ${DS.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={16} color={DS.textDim} />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 32, position: 'relative' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: DS.text, fontFamily: "'Syne', sans-serif", margin: 0, marginBottom: 4 }}>
                {tabs.find(t => t.id === activeTab)?.label} Dashboard
              </h1>
              <p style={{ fontSize: 12, color: DS.textDim, fontFamily: "'IBM Plex Mono', monospace" }}>Real-time telemetry updated just now.</p>
            </div>
          </div>

          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'incidents' && <IncidentsTab />}
          {activeTab === 'pipeline' && <PipelineTab />}
          {activeTab === 'hospitals' && <HospitalsTab />}
          {activeTab === 'ambulances' && <AmbulancesTab />}
        </div>
      </main>
    </div>
  );
}