/**
 * NexVitals — Cinematic Dark Ops Landing Page
 * UPDATED: Incubation-ready improvements applied
 *  1. Hero — full rewrite: "AI-Powered Emergency Response That Saves Lives in Seconds"
 *  2. 60% claim — disclaimer + simulation caveat added
 *  3. NEW: "Why NexVitals is Different" section (4 cards)
 *  4. NEW: "Built for Real-World Deployment" section (trimmed to 2 points)
 *  5. NEW: "AI Core Engine" section (4 cards, replaces vague AI mentions)
 *  6. NEW: "Current Status" slim milestone strip
 *  7. CTA copy — "Request Pilot Deployment" + "Partner With Us"
 *  8. Team roles — updated specialty tags + multidisciplinary intro line
 *  9. Impact punch — full-width closing banner before footer
 * 10. Origin teaser line in hero subtext with anchor scroll
 * MOBILE FIXES preserved from original:
 *  - Navbar hamburger menu, trust badges flex-wrap, CTA stack, overflow hidden
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Beams from "./components/Beams";
import Shuffle from "./components/Shuffle";
import ShinyText from "./components/ShinyText";
import GradientText from "./components/GradientText";
import TargetCursor from "./components/TargetCursor";
import TrueFocus from "./components/TrueFocus";
import DecryptedText from "./components/DecryptedText";
import SplitText from "./components/SplitText";
import SparkleButton from "./components/SparkleButton";
import CountUp from "./components/CountUp";
import LogoLoop from "./components/LogoLoop";
import { SiReact, SiFastapi } from "react-icons/si";
import { FaAws, FaRaspberryPi, FaLinux, FaDocker, FaPython, FaJava } from "react-icons/fa";
import ExploreButton from "./components/ExploreButton";
import Lifecycle from "./components/Lifecycle";
import GetStarted from "./components/GetStarted";
import ThemeSwitch from "./components/ThemeSwitch";
import ScrollStack, { ScrollStackItem } from "./components/ScrollStack";

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
  --teal:    #14b8a6;
  --fd: 'Syne', sans-serif;
  --fm: 'JetBrains Mono', monospace;
  --fb: 'DM Sans', sans-serif;
  --ease: cubic-bezier(0.16,1,0.3,1);
}

html { scroll-behavior: smooth; overflow-x: hidden; max-width: 100%; }
body {
  background: var(--bg); color: var(--white); font-family: var(--fb);
  overflow-x: hidden; max-width: 100%;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-thumb { background: var(--amber-b); border-radius: 2px; }
::-webkit-scrollbar-track { background: transparent; }

body::after {
  content: ''; position: fixed; inset: 0; z-index: 9000; pointer-events: none; opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px;
}

/* ─── NAV ─────────────────────────────────────────── */
.iv-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 500;
  height: 62px; padding: 0 40px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(0,0,0,0.88);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border-bottom: 1px solid var(--line);
}
.iv-logo {
  font-family: var(--fd); font-size: 1.05rem; font-weight: 800;
  letter-spacing: 4px; color: var(--amber); text-transform: uppercase;
  display: flex; align-items: center; gap: 10px; user-select: none; flex-shrink: 0;
}
.iv-logo-pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--amber); box-shadow: 0 0 8px var(--amber);
  animation: iv-pulse 2s ease-in-out infinite;
}
@keyframes iv-pulse {
  0%,100%{ box-shadow:0 0 6px var(--amber); transform:scale(1); }
  50%    { box-shadow:0 0 22px var(--amber); transform:scale(1.35); }
}
.iv-nav-pills {
  display: flex; gap: 4px;
  background: var(--s2); border: 1px solid var(--line);
  border-radius: 50px; padding: 4px;
}
.iv-pill {
  padding: 5px 18px; border-radius: 50px; border: none; background: none;
  font-family: var(--fm); font-size: 0.62rem; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--t45); cursor: pointer; transition: all 0.2s ease;
}
.iv-pill:hover  { color: var(--white); background: var(--t10); }
.iv-pill.active { color: var(--amber); background: var(--amber-d); }
.iv-nav-right { display: flex; align-items: center; gap: 10px; }

/* Hamburger */
.iv-hamburger {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; cursor: pointer; padding: 6px;
}
.iv-hamburger span {
  display: block; width: 22px; height: 2px;
  background: var(--t70); border-radius: 2px; transition: all 0.25s ease;
}
.iv-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.iv-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.iv-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile drawer */
.iv-mobile-menu {
  position: fixed; top: 62px; left: 0; right: 0; z-index: 499;
  background: rgba(0,0,0,0.97); backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--line);
  padding: 20px 24px 28px;
  display: flex; flex-direction: column; gap: 8px;
  transform: translateY(-110%); opacity: 0;
  transition: transform 0.3s var(--ease), opacity 0.3s ease;
  pointer-events: none;
}
.iv-mobile-menu.open { transform: translateY(0); opacity: 1; pointer-events: auto; }
.iv-mobile-pill {
  width: 100%; padding: 14px 18px; border-radius: 10px;
  border: 1px solid var(--line); background: var(--s1);
  font-family: var(--fm); font-size: 0.72rem; font-weight: 600;
  letter-spacing: 2px; text-transform: uppercase;
  color: var(--t70); cursor: pointer; text-align: left; transition: all 0.2s ease;
}
.iv-mobile-pill:hover, .iv-mobile-pill.active { color: var(--amber); border-color: var(--amber-b); background: var(--amber-d); }
.iv-mobile-menu-actions { display: flex; gap: 10px; margin-top: 8px; }

/* ─── BUTTONS ─────────────────────────────────────── */
.iv-btn {
  display: inline-flex; align-items: center; gap: 8px;
  height: 38px; padding: 0 18px; border-radius: 8px;
  font-family: var(--fm); font-size: 0.65rem; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase;
  border: 1px solid; cursor: pointer;
  transition: all 0.2s var(--ease); white-space: nowrap; flex-shrink: 0;
}
.iv-btn svg { width: 13px; height: 13px; fill: currentColor; flex-shrink: 0; }
.iv-btn:active { transform: scale(0.96) !important; }
.iv-ghost { background: transparent; border-color: var(--line2); color: var(--t45); }
.iv-ghost:hover { border-color: var(--t45); color: var(--white); background: var(--t10); transform: translateY(-1px); }
.iv-amber { background: var(--amber-d); border-color: var(--amber-b); color: var(--amber); }
.iv-amber:hover { background: var(--amber-b); border-color: var(--amber); box-shadow: 0 0 22px rgba(245,158,11,0.28); transform: translateY(-2px); }
.iv-amber-lg { height: 48px; padding: 0 34px; font-size: 0.72rem; border-radius: 10px; }

/* ─── CHIP ────────────────────────────────────────── */
.iv-chip {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 14px; border-radius: 5px;
  font-family: var(--fm); font-size: 0.58rem; font-weight: 700;
  letter-spacing: 2.8px; text-transform: uppercase; border: 1px solid; white-space: nowrap;
}
.iv-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

/* ─── HERO ────────────────────────────────────────── */
.iv-hero {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 80px 20px 40px; text-align: center; position: relative;
  width: 100%; overflow: hidden;
}
.iv-hero-glow {
  position: absolute; top: 45%; left: 50%; transform: translate(-50%,-50%);
  width: 900px; height: 700px; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 68%);
  pointer-events: none;
}
.iv-hero-grid {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden; opacity: 0.03;
  background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
  background-size: 80px 80px;
}
.iv-eyebrow {
  display: flex; align-items: center; gap: 14px; margin-bottom: 28px;
  font-family: var(--fm); font-size: 0.6rem; letter-spacing: 4px;
  color: var(--amber); text-transform: uppercase;
  max-width: 100%; flex-wrap: wrap; justify-content: center;
}
.iv-eyebrow-bar { width: 36px; height: 1px; background: var(--amber); opacity: 0.6; flex-shrink: 0; }

/* NEW: Hero headline rewritten */
.iv-h1 {
  font-family: var(--fd); font-size: clamp(2rem,6.5vw,6.5rem);
  font-weight: 800; letter-spacing: -2px; line-height: 0.95; margin-bottom: 16px;
  width: 100%; word-break: break-word;
}
.iv-h1-sub {
  font-family: var(--fd); font-size: clamp(0.75rem,2.8vw,2.8rem);
  font-weight: 600; color: var(--t45); letter-spacing: clamp(2px,1vw,5px);
  text-transform: uppercase; margin-bottom: 20px;
  width: 100%; overflow: hidden;
}
.iv-hero-desc {
  font-size: clamp(0.88rem,1.8vw,1.2rem); color: var(--amber);
  letter-spacing: 0.4px; margin-bottom: 8px;
  width: 100%; padding: 0 8px; word-break: break-word; font-weight: 600;
}
.iv-hero-sub  { font-size: clamp(0.75rem,1.4vw,0.95rem); color: var(--t45); margin-bottom: 12px; padding: 0 8px; }
.iv-hero-origin-tease {
  font-size: clamp(0.7rem,1.3vw,0.85rem); color: var(--t20);
  margin-bottom: 36px; padding: 0 8px; font-style: italic;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.iv-hero-origin-tease a {
  color: var(--amber); opacity: 0.7; text-decoration: none;
  font-family: var(--fm); font-size: 0.6rem; letter-spacing: 1.5px;
  text-transform: uppercase; transition: opacity 0.2s;
}
.iv-hero-origin-tease a:hover { opacity: 1; }
.iv-hero-cta  {
  display: flex; align-items: center; gap: 14px;
  flex-wrap: wrap; justify-content: center;
  width: 100%; padding: 0 20px;
}
.iv-hero-cta-note {
  margin-top: 12px; font-family: var(--fm); font-size: 0.55rem;
  letter-spacing: 1.5px; color: var(--t20); text-transform: uppercase; text-align: center;
}

/* Trust Badges */
.iv-trust-row {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: 10px; margin-top: 48px;
  width: 100%; padding: 0 16px;
}
.iv-trust-badge {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50px; font-family: var(--fm); font-size: 0.72rem;
  color: #dcdcdc; letter-spacing: 1px;
  transition: border-color 0.3s ease, background 0.3s ease; white-space: nowrap;
}
.iv-trust-badge:hover { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.3); color: #fff; }

/* ─── STAT ────────────────────────────────────────── */
.iv-stat-num {
  font-family: var(--fd); font-size: clamp(2.2rem,5vw,4rem);
  font-weight: 800; color: var(--amber);
  text-shadow: 0 0 50px rgba(245,158,11,0.4);
  margin: 0 8px; display: inline-block;
}
.iv-stat-footnote {
  display: block; margin-top: 12px;
  font-family: var(--fm); font-size: 0.54rem; letter-spacing: 1.5px;
  color: var(--t45); text-transform: uppercase;
}
.iv-stat-footnote a { color: var(--amber); opacity: 0.6; text-decoration: none; }
.iv-stat-footnote a:hover { opacity: 1; }

/* ─── SECTION HELPERS ─────────────────────────────── */
.iv-sec { width: 100%; max-width: 1100px; padding: 100px 32px 0; margin: 0 auto; box-sizing: border-box; }
.iv-sec-head { text-align: center; margin-bottom: 56px; }
.iv-sec-head h2 {
  font-family: var(--fd); font-size: clamp(2rem,4.5vw,3.2rem);
  font-weight: 800; color: var(--white); line-height: 1.08;
  letter-spacing: -0.5px; margin: 14px 0 12px;
}
.iv-sec-head p { color: var(--t45); font-size: 1.05rem; line-height: 1.72; max-width: 560px; margin: 0 auto; }
.iv-amber-text {
  background: linear-gradient(90deg, var(--amber), var(--amber-l), var(--amber));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.iv-divider { height: 1px; }

/* ─── ORIGIN ──────────────────────────────────────── */
.iv-origin-card {
  background: var(--s1); border: 1px solid var(--line);
  border-radius: 20px; padding: 52px 56px; position: relative; overflow: hidden;
}
.iv-origin-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--amber-b), transparent);
}
.iv-origin-grid { display: grid; grid-template-columns: 1fr 1px 1fr; gap: 0 56px; align-items: start; }
.iv-origin-sep { background: var(--line); min-height: 460px; }
.iv-tl { position: relative; padding-left: 28px; }
.iv-tl-spine {
  position: absolute; left: 5px; top: 8px; bottom: 8px; width: 1px;
  background: linear-gradient(to bottom, var(--amber-b), transparent);
}
.iv-tl-item { position: relative; margin-bottom: 26px; }
.iv-tl-node {
  position: absolute; left: -28px; top: 5px;
  width: 11px; height: 11px; border-radius: 50%;
  border: 1px solid; background: var(--bg);
  display: flex; align-items: center; justify-content: center;
}
.iv-tl-dot { width: 5px; height: 5px; border-radius: 50%; }
@keyframes iv-tl-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }
.iv-tl-time { font-family: var(--fm); font-size: 0.57rem; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; margin-bottom: 5px; }
.iv-tl-text { font-size: 0.88rem; color: var(--t45); line-height: 1.72; }
.iv-quote {
  border-left: 2px solid var(--amber-b); padding: 16px 20px;
  background: rgba(245,158,11,0.03); border-radius: 0 8px 8px 0; margin-bottom: 26px;
}
.iv-quote p { font-style: italic; font-size: 0.98rem; color: var(--t90); line-height: 1.75; font-family: var(--fb); }
.iv-origin-cta { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; margin: 28px 0; }
.iv-origin-cta-btn {
  display: inline-flex; align-items: center; gap: 10px;
  height: 46px; padding: 0 24px; border-radius: 10px;
  font-family: var(--fm); font-size: 0.66rem; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase;
  background: var(--amber-d); border: 1px solid var(--amber-b);
  color: var(--amber); cursor: pointer; transition: all 0.22s var(--ease);
}
.iv-origin-cta-btn:hover { background: var(--amber-b); border-color: var(--amber); box-shadow: 0 0 24px rgba(245,158,11,0.25); transform: translateY(-2px); }
.iv-origin-cta-note { font-family: var(--fm); font-size: 0.56rem; letter-spacing: 1.5px; color: var(--t20); text-transform: uppercase; }

/* ─── STEP CARDS ──────────────────────────────────── */
.iv-step-card {
  background: var(--s1); border: 1px solid var(--line);
  border-radius: 16px; padding: 32px; position: relative; overflow: hidden;
  transition: transform 0.3s ease, border-color 0.3s ease;
}
.iv-step-card:hover { transform: translateY(-5px); border-color: rgba(245,158,11,0.4); }
.iv-step-num { font-family: var(--fd); font-size: 3rem; font-weight: 900; color: rgba(255,255,255,0.05); position: absolute; top: 10px; right: 20px; pointer-events: none; }
.iv-step-card h3 { font-family: var(--fd); font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 12px; }
.iv-step-card p  { font-size: 0.95rem; color: var(--t45); line-height: 1.6; }

/* ─── DIFF / AI / COMPLIANCE CARDS ───────────────── */
.iv-feat-card {
  border-radius: 16px; border: 1px solid var(--line); background: var(--s1);
  padding: 28px 24px; display: flex; flex-direction: column; gap: 12px;
  position: relative; overflow: hidden; transition: all 0.3s var(--ease);
}
.iv-feat-card:hover { border-color: var(--line2); transform: translateY(-3px); background: var(--s2); }
.iv-feat-card-icon { font-size: 2rem; line-height: 1; }
.iv-feat-card-title { font-family: var(--fd); font-size: 1rem; font-weight: 700; color: var(--white); line-height: 1.2; }
.iv-feat-card-desc  { font-size: 0.87rem; color: var(--t45); line-height: 1.68; }
.iv-feat-card-glow  { position: absolute; top: 0; right: 0; width: 130px; height: 130px; pointer-events: none; transition: opacity 0.3s; }

/* ─── MILESTONE STRIP ─────────────────────────────── */
.iv-milestone-strip {
  display: flex; align-items: stretch;
  background: var(--s1); border: 1px solid var(--line);
  border-radius: 16px; overflow: hidden; position: relative;
}
.iv-milestone-strip::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--amber-b), transparent);
}
.iv-milestone {
  flex: 1; padding: 28px 20px; display: flex; flex-direction: column;
  gap: 8px; border-right: 1px solid var(--line); position: relative;
  transition: background 0.25s ease;
}
.iv-milestone:last-child { border-right: none; }
.iv-milestone:hover { background: var(--s2); }
.iv-milestone-status {
  font-family: var(--fm); font-size: 0.55rem; letter-spacing: 2px;
  text-transform: uppercase; font-weight: 700; display: flex; align-items: center; gap: 6px;
}
.iv-milestone-title { font-family: var(--fd); font-size: 0.95rem; font-weight: 700; color: var(--white); line-height: 1.2; }
.iv-milestone-desc  { font-size: 0.8rem; color: var(--t45); line-height: 1.6; }

/* ─── COMPLIANCE STRIP ────────────────────────────── */
.iv-compliance-strip {
  display: grid; grid-template-columns: 1fr 1px 1fr; gap: 0;
  background: var(--s1); border: 1px solid var(--line); border-radius: 16px; overflow: hidden;
  position: relative;
}
.iv-compliance-strip::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent);
}
.iv-compliance-col { padding: 36px 32px; display: flex; flex-direction: column; gap: 14px; }
.iv-compliance-sep { background: var(--line); }

/* ─── IMPACT PUNCH BANNER ─────────────────────────── */
.iv-impact-banner {
  width: 100%; padding: 80px 32px;
  background: linear-gradient(135deg, #0a0005 0%, #050010 50%, #0a0500 100%);
  border-top: 1px solid rgba(245,158,11,0.15);
  border-bottom: 1px solid rgba(245,158,11,0.15);
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 20px; position: relative; overflow: hidden;
}
.iv-impact-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.06) 0%, transparent 65%);
  pointer-events: none;
}
.iv-impact-banner-headline {
  font-family: var(--fd); font-size: clamp(1.5rem,4vw,3rem);
  font-weight: 800; color: var(--white); line-height: 1.15;
  letter-spacing: -0.5px; max-width: 760px;
}
.iv-impact-banner-body {
  font-size: clamp(0.88rem,1.5vw,1.05rem); color: var(--t45);
  line-height: 1.75; max-width: 560px;
}
.iv-impact-partner-btn {
  display: inline-flex; align-items: center; gap: 10px;
  height: 52px; padding: 0 32px; border-radius: 12px;
  font-family: var(--fm); font-size: 0.7rem; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase;
  background: var(--amber); color: #000; border: none; cursor: pointer;
  transition: all 0.22s var(--ease); margin-top: 8px;
  box-shadow: 0 0 40px rgba(245,158,11,0.25);
}
.iv-impact-partner-btn:hover { background: var(--amber-l); box-shadow: 0 0 60px rgba(245,158,11,0.4); transform: translateY(-3px); }

/* ─── USE CASES ───────────────────────────────────── */
.iv-use-case {
  border-radius: 16px; padding: 32px 24px; min-height: 220px;
  display: flex; flex-direction: column; justify-content: flex-end;
  background-size: cover; background-position: center;
  border: 1px solid rgba(255,255,255,0.1);
  transition: transform 0.3s ease, filter 0.3s ease; filter: grayscale(80%);
}
.iv-use-case:hover { transform: scale(1.02); filter: grayscale(0%); border-color: rgba(255,255,255,0.3); }
.iv-use-case h4 { font-family: var(--fd); font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 8px; }
.iv-use-case p  { font-size: 0.9rem; color: rgba(255,255,255,0.8); line-height: 1.5; }

/* ─── DASHBOARD ROWS ──────────────────────────────── */
.iv-dash-list { display: flex; flex-direction: column; gap: 18px; }
.iv-dash-row {
  display: flex; gap: 44px; align-items: center;
  padding: 36px 44px; min-height: 380px;
  border-radius: 20px; border: 1px solid;
  background: var(--s1); position: relative; overflow: hidden;
  transition: border-color 0.3s var(--ease), background 0.3s var(--ease);
}
.iv-dash-row:hover { background: var(--s2); }
.iv-dash-img {
  flex: 0 0 55%; min-width: 0; border-radius: 14px; overflow: hidden;
  aspect-ratio: 16/9; position: relative; border: 1px solid var(--line); background: var(--bg);
}
.iv-dash-img img { width:100%; height:100%; object-fit:cover; display:block; }
.iv-dash-info { flex: 1; display: flex; flex-direction: column; gap: 11px; min-width: 0; }
.iv-dash-h3 { font-family: var(--fd); font-size: 1.85rem; font-weight: 800; color: var(--white); line-height: 1.1; letter-spacing: -0.2px; }
.iv-dash-tagline { font-size: 1rem; font-weight: 600; line-height: 1.4; }
.iv-dash-desc    { font-size: 0.9rem; color: var(--t45); line-height: 1.72; }
.iv-feats { margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:8px; }
.iv-feat  { display: flex; align-items: flex-start; gap: 9px; }
.iv-feat-check { margin-top: 2px; flex-shrink: 0; width: 17px; height: 17px; border-radius: 5px; display: flex; align-items: center; justify-content: center; border: 1px solid; }

/* ─── LIGHTBOX ────────────────────────────────────── */
.iv-lb-bg {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(0,0,0,0.88); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 24px;
  animation: iv-lb-in 0.22s var(--ease);
}
@keyframes iv-lb-in { from{opacity:0} to{opacity:1} }
.iv-lb-panel {
  position: relative; max-width: 1100px; width: 100%;
  border-radius: 18px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 40px 120px rgba(0,0,0,0.9);
  animation: iv-lb-up 0.28s var(--ease);
}
@keyframes iv-lb-up { from{transform:scale(0.94) translateY(16px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
.iv-lb-panel img { width:100%; display:block; }
.iv-lb-close {
  position: absolute; top: 14px; right: 14px;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 15px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background 0.2s;
}
.iv-lb-close:hover { background: rgba(255,255,255,0.15); }

/* ─── ANNOTATION PINS ─────────────────────────────── */
.iv-ann-wrap { position: absolute; inset: 0; pointer-events: none; }
.iv-pin { position: absolute; pointer-events: auto; display: flex; align-items: center; gap: 8px; cursor: default; }
.iv-pin-dot {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--fm); font-size: 0.58rem; font-weight: 700;
  border: 1.5px solid; color: #000; z-index: 1;
  box-shadow: 0 0 14px rgba(0,0,0,0.6);
  animation: iv-pin-pop 0.35s var(--ease) both;
}
@keyframes iv-pin-pop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
.iv-pin-label {
  background: rgba(0,0,0,0.82); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 7px; padding: 5px 10px;
  font-family: var(--fb); font-size: 0.72rem; font-weight: 600;
  color: #fff; white-space: nowrap;
  opacity: 0; transform: translateX(-4px);
  transition: opacity 0.18s, transform 0.18s; pointer-events: none;
}
.iv-pin:hover .iv-pin-label { opacity: 1; transform: translateX(0); }
.iv-expand-hint {
  position: absolute; bottom: 10px; right: 10px;
  background: rgba(0,0,0,0.75); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px; padding: 5px 10px;
  font-family: var(--fm); font-size: 0.55rem; letter-spacing: 1.5px;
  text-transform: uppercase; color: rgba(255,255,255,0.5);
  display: flex; align-items: center; gap: 6px;
  transition: color 0.2s, border-color 0.2s; pointer-events: none;
}
.iv-dash-img:hover .iv-expand-hint { color: rgba(255,255,255,0.9); border-color: rgba(255,255,255,0.35); }

/* ─── AI GRID ─────────────────────────────────────── */
.iv-ai-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.iv-ai-card {
  border-radius: 16px; border: 1px solid var(--line); background: var(--s1);
  padding: 26px 20px; display: flex; flex-direction: column; gap: 12px;
  position: relative; overflow: hidden; cursor: default; transition: all 0.3s var(--ease);
}
.iv-ai-card:hover { border-color: var(--line2); transform: translateY(-3px); background: var(--s2); }
.iv-ai-icon  { font-size: 2rem; line-height: 1; transition: filter 0.3s; }
.iv-ai-title { font-family: var(--fd); font-size: 0.98rem; font-weight: 700; color: var(--white); line-height: 1.2; }
.iv-ai-desc  { font-size: 0.86rem; color: var(--t45); line-height: 1.65; }
.iv-ai-glow  { position:absolute; top:0; right:0; width:130px; height:130px; pointer-events:none; transition:opacity 0.3s; }

/* ─── VIDEO ───────────────────────────────────────── */
.iv-vid-wrap { width: 100%; max-width: 940px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.iv-vid-frame {
  border-radius: 18px; overflow: hidden;
  border: 1px solid rgba(239,68,68,0.2); background: #000; position: relative;
}
.iv-vid-frame::after { content:''; position:absolute; inset:0; pointer-events:none; background: linear-gradient(180deg,transparent 75%,rgba(0,0,0,0.5)); }
.iv-vid-frame video { width:100%; display:block; max-height:500px; object-fit:cover; }

/* ─── VISION STACK ────────────────────────────────── */
.iv-vision-outer { width: 100%; padding: 100px 0 0; }
.iv-vision-header { text-align: center; margin-bottom: 52px; padding: 0 24px; }

/* ─── TEAM ────────────────────────────────────────── */
.iv-team-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 20px; padding: 0 8px; justify-items: center;
}
.iv-team-card {
  width: 100%; max-width: 220px;
  background: var(--s1); border: 1px solid var(--line);
  border-radius: 18px; overflow: hidden; text-align: center;
  transition: transform 0.3s var(--ease), border-color 0.3s var(--ease);
}
.iv-team-card:hover { transform: translateY(-6px); border-color: var(--amber-b); }
.iv-team-photo { width: 100%; aspect-ratio: 1/1; object-fit: cover; object-position: top; display: block; }
.iv-team-photo-placeholder {
  width: 100%; aspect-ratio: 1/1; background: var(--s2);
  display: flex; align-items: center; justify-content: center;
}
.iv-team-info { padding: 18px 16px 22px; }
.iv-team-name { font-family: var(--fd); font-size: 0.9rem; font-weight: 700; color: var(--white); margin-bottom: 4px; line-height: 1.3; }
.iv-team-role { font-family: var(--fm); font-size: 0.52rem; letter-spacing: 1.8px; text-transform: uppercase; margin-bottom: 12px; }
.iv-team-tags { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; }
.iv-team-tag  { font-family: var(--fm); font-size: 0.48rem; letter-spacing: 1.2px; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; border: 1px solid; color: var(--t45); border-color: var(--line2); }

/* ─── LOGO STRIP ──────────────────────────────────── */
.iv-logo-strip { width: 100%; height: 76px; position: relative; overflow: hidden; margin-bottom: 24px; }
.iv-logo-strip .logoloop__item { font-size: 36px; color: rgba(255,255,255,0.28); }
.iv-logo-strip .logoloop__item:hover { color: var(--amber); }

/* ─── HR ──────────────────────────────────────────── */
.iv-hr { width: 100%; height: 1px; margin: 60px 0; background: linear-gradient(90deg, transparent, var(--line), transparent); }

/* ─── CHAT PANEL ──────────────────────────────────── */
.iv-chat-bg {
  position: fixed; inset: 0; z-index: 700;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); transition: opacity 0.3s;
}
.iv-chat {
  position: fixed; top: 0; right: 0;
  width: min(460px,100vw); height: 100vh; z-index: 701;
  background: #04040c; border-left: 1px solid var(--line);
  box-shadow: -40px 0 80px rgba(0,0,0,0.8);
  display: flex; flex-direction: column;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1); font-family: var(--fb);
}
.iv-chat-hd {
  padding: 18px 20px; border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg,#0b0b1a,#04040c);
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
}
.iv-chat-avatar {
  width: 38px; height: 38px; border-radius: 12px;
  background: linear-gradient(135deg,var(--amber),#f97316);
  display: flex; align-items: center; justify-content: center; font-size:16px;
  box-shadow: 0 0 20px rgba(245,158,11,0.3);
}
.iv-chat-close {
  width: 32px; height: 32px; border-radius: 8px;
  background: none; border: 1px solid var(--line);
  color: var(--t45); cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.iv-chat-close:hover { background: var(--t10); color: var(--white); border-color: var(--line2); }
.iv-chat-msgs {
  flex: 1; overflow-y: auto; padding: 18px 16px 10px;
  display: flex; flex-direction: column; gap: 12px;
  scrollbar-width: thin; scrollbar-color: var(--line) transparent;
}
.iv-bubble-user {
  max-width: 76%; padding: 10px 14px; border-radius: 18px 18px 4px 18px;
  background: linear-gradient(135deg,var(--amber),#f97316);
  color: #000; font-size: 0.875rem; line-height: 1.55; font-weight: 500;
  word-break: break-word; align-self: flex-end; margin-left: auto;
}
.iv-bubble-bot {
  max-width: 76%; padding: 10px 14px; border-radius: 18px 18px 18px 4px;
  background: var(--s2); border: 1px solid var(--line);
  color: var(--t70); font-size: 0.875rem; line-height: 1.55; word-break: break-word; white-space: pre-wrap;
}
.iv-typing { display: flex; gap: 5px; align-items: center; padding: 10px 14px; background: var(--s2); border: 1px solid var(--line); border-radius: 18px 18px 18px 4px; width: fit-content; }
.iv-typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); animation: iv-bounce 1.2s ease infinite; }
@keyframes iv-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
.iv-chat-inp  { padding: 12px 14px 18px; border-top: 1px solid var(--line); background: #04040c; flex-shrink: 0; }
.iv-chat-row  { display: flex; gap: 8px; align-items: flex-end; background: var(--s2); border: 1px solid var(--line); border-radius: 14px; padding: 10px 10px 10px 16px; transition: border-color 0.2s; }
.iv-chat-row:focus-within { border-color: var(--amber-b); }
.iv-chat-ta   { flex: 1; background: none; border: none; outline: none; color: var(--white); font-size: 0.875rem; resize: none; font-family: var(--fb); line-height: 1.5; max-height: 120px; scrollbar-width: none; }
.iv-chat-ta::placeholder { color: var(--t20); }
.iv-chat-send { width: 36px; height: 36px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; transition: all 0.2s; }

/* ═══════════════════════════════════════════════════
   RESPONSIVE — TABLET (≤960px)
═══════════════════════════════════════════════════ */
@media(max-width:960px){
  .iv-nav { padding: 0 20px; }
  .iv-nav-pills { display: none; }
  .iv-nav-right .iv-ghost { display: none; }
  .iv-hamburger { display: flex; }
  .iv-dash-row { flex-direction: column !important; padding: 24px 20px; gap: 22px; min-height: unset; }
  .iv-dash-img { flex: none; width: 100%; }
  .iv-ai-grid  { grid-template-columns: 1fr 1fr; }
  .iv-origin-grid { grid-template-columns: 1fr; }
  .iv-origin-sep  { display: none; }
  .iv-origin-card { padding: 32px 24px; }
  .iv-sec         { padding: 64px 20px 0; }
  .iv-team-grid   { grid-template-columns: repeat(2, 1fr); }
  .iv-milestone-strip { flex-direction: column; }
  .iv-milestone { border-right: none; border-bottom: 1px solid var(--line); }
  .iv-milestone:last-child { border-bottom: none; }
  .iv-compliance-strip { grid-template-columns: 1fr; }
  .iv-compliance-sep { display: none; }
}

/* ═══════════════════════════════════════════════════
   RESPONSIVE — MOBILE (≤600px)
═══════════════════════════════════════════════════ */
@media(max-width:600px){
  .iv-nav { padding: 0 16px; height: 56px; }
  .iv-nav-right .iv-btn { height: 34px; padding: 0 14px; font-size: 0.58rem; }
  .iv-hero { padding: 72px 0 40px; }
  .iv-h1 { font-size: clamp(1.7rem,9vw,3rem); letter-spacing: -0.5px; }
  .iv-h1-sub { font-size: clamp(0.55rem,3.5vw,1rem); letter-spacing: 2px; }
  .iv-hero-desc { font-size: 0.82rem; }
  .iv-hero-sub  { font-size: 0.75rem; }
  .iv-hero-cta  { flex-direction: column; align-items: stretch; padding: 0 24px; gap: 10px; }
  .iv-hero-cta .iv-btn { width: 100%; justify-content: center; }
  .iv-trust-badge { font-size: 0.65rem; padding: 6px 12px; }
  .iv-sec { padding: 52px 16px 0; }
  .iv-sec-head h2 { font-size: clamp(1.6rem,6vw,2.4rem); }
  .iv-sec-head p  { font-size: 0.92rem; }
  .iv-origin-card { padding: 24px 18px; border-radius: 14px; }
  .iv-quote p { font-size: 0.88rem; }
  .iv-ai-grid { grid-template-columns: 1fr; }
  .iv-dash-row { padding: 20px 16px; border-radius: 14px; }
  .iv-dash-h3  { font-size: 1.4rem; }
  .iv-team-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .iv-team-card { max-width: 100%; border-radius: 14px; }
  .iv-team-name { font-size: 0.78rem; }
  .iv-team-info { padding: 12px 10px 16px; }
  .iv-logo-strip { height: 56px; }
  .iv-logo-strip .logoloop__item { font-size: 24px; }
  .iv-step-card { padding: 24px 20px; }
  .iv-stat-num { font-size: clamp(2.8rem,12vw,4rem) !important; }
  .iv-impact-banner { padding: 52px 20px; }
  .iv-impact-banner-headline { font-size: clamp(1.3rem,6vw,2rem); }
  .iv-compliance-col { padding: 24px 20px; }
}

@media(max-width:380px){
  .iv-logo { font-size: 0.85rem; letter-spacing: 2px; }
  .iv-h1 { font-size: 1.7rem; }
  .iv-team-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .iv-team-name { font-size: 0.7rem; }
  .iv-team-role { font-size: 0.44rem; }
}
`;

/* ═══════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════ */
const DASHBOARDS = [
  { id: "admin", title: "Admin Dashboard", tag: "Command Center", accent: "#f59e0b", aD: "rgba(245,158,11,0.08)", aB: "rgba(245,158,11,0.25)", img: "/admin-dashboard.png", tagline: "Total visibility. Total control.", desc: "The nerve centre of NexVitals. Every unit, every incident, every alert — tracked live on a satellite map with AI-classified severity and real-time mission management from a single command interface.", feats: [{ l: "Live Satellite Map", d: "Real-time Mapbox tracking of all units, incidents and IRR zones" }, { l: "Fleet Status Panel", d: "All ambulance units listed with responder name, vehicle ID and live status" }, { l: "Live Cam Feed", d: "One-click camera access per unit to visually verify on-ground conditions" }, { l: "Pending Accidents Queue", d: "Incoming reports queued with AI-assigned severity badges for instant triage" }, { l: "Active Missions Tracker", d: "Live mission cards showing assigned unit, ETA and click-to-track route" }] },
  { id: "user", title: "User Dashboard", tag: "Victim Interface", accent: "#3b82f6", aD: "rgba(59,130,246,0.08)", aB: "rgba(59,130,246,0.25)", img: "/user-dashboard.png", tagline: "Help at the tap of a button.", desc: "Built for the person in crisis. Live biometrics, GPS tracking, six emergency action modes and a silent SOS — NexVitals identifies your location, condition, and vehicle, and puts the right help in motion within seconds.", feats: [{ l: "Women Safety — Silent SOS", d: "Tap-to-activate silent alert — notifies police control room instantly, no sound" }, { l: "Live GPS Tracking", d: "Real-time coordinates streamed to responders with a live map pin" }, { l: "Medical ID Auto-Attach", d: "Blood group, conditions and allergies linked to every SOS dispatched" }, { l: "Live Biometrics", d: "Heart rate, SpO₂, BP and temp monitored — flagged Normal or Critical" }, { l: "6 Emergency Action Modes", d: "Accident, Fuel Assist, Road Support, Panic, Ambulance, Hospitals — one tap" }] },
  { id: "emergency", title: "Emergency Assistant", tag: "Responder Hub", accent: "#22c55e", aD: "rgba(34,197,94,0.08)", aB: "rgba(34,197,94,0.25)", img: "/emergency-dashboard.png", tagline: "The right help, right now.", desc: "Built for the responder on the ground. AI severity scoring, full victim medical profile, live vitals tab, and a direct ER transmission line — everything needed before the ambulance stops rolling.", feats: [{ l: "AI Model Analysis", d: "AccidentDetectionModel scores cases — CRITICAL at 94% confidence in real time" }, { l: "Mission Details — Live", d: "Victim name, age, vehicle number and GPS loaded the moment a request is received" }, { l: "Medical Profile Pre-Load", d: "Blood group, existing conditions and critical allergies shown upfront" }, { l: "Live Vitals Tab", d: "Patient vitals streamed from the victim's device throughout transit" }, { l: "Transmit to ER", d: "One-tap push sends full incident data, vitals and treatment notes to hospital" }] },
  { id: "hospital", title: "Hospital Dashboard", tag: "Medical Hub", accent: "#ec4899", aD: "rgba(236,72,153,0.08)", aB: "rgba(236,72,153,0.25)", img: "/hospital-dashboard.png", tagline: "Ready before the patient arrives.", desc: "A full hospital OS — AI-assisted triage, intelligent bed allocation, live ward management, diagnostics, billing and the command hub. Every module connected, every status live.", feats: [{ l: "Triage — Emergency Intake", d: "Incoming patients auto-triaged with AI scores before the ambulance arrives" }, { l: "Allocation — AI Assignment", d: "Intelligent bed and specialist assignment based on injury type and capacity" }, { l: "Floor & Bed Management", d: "Live ICU-Trauma, General Ward, Cardiology, Pediatrics — all statuses live" }, { l: "Diagnostics — Labs & Path", d: "Lab results and pathology linked to the patient record instantly" }, { l: "Command — Central Hub", d: "Hospital-wide view: system status, inbound ambulances, inter-ward coordination" }] },
  { id: "patient", title: "Patient Portal", tag: "Patient Interface", accent: "#8b5cf6", aD: "rgba(139,92,246,0.08)", aB: "rgba(139,92,246,0.25)", img: "/patient-portal.png", tagline: "Your care. Your records. Your control.", desc: "A dedicated portal giving every admitted patient full visibility into their care journey — diagnosis, reports, billing, SOS history and discharge status, all linked by a unique MRN.", feats: [{ l: "MRN-Linked Identity", d: "Every patient record tied to a unique Medical Record Number for secure access" }, { l: "Current Diagnosis View", d: "Active diagnosis shown with attending doctor and ward assignment" }, { l: "Reports Ready", d: "Count of ready reports with timestamped log — CT, nursing, procedure" }, { l: "Billing — Amount Due", d: "Live outstanding balance tracked per admission, visible directly to patient" }, { l: "Discharge Status", d: "Real-time status — Not Yet / Scheduled / Cleared — no staff needed" }] },
];

const AI_FEATS = [
  { icon: "💥", title: "Accident Detection Model", accent: "#f59e0b", desc: "Trained on impact signature data. Classifies real collisions vs false triggers — speed bumps, potholes — with high confidence in real time. No human triage required." },
  { icon: "📊", title: "Severity Classification", accent: "#3b82f6", desc: "Scores every incident CRITICAL, MODERATE or STABLE using accelerometer data, biometrics and location context — so the right resource is always dispatched first." },
  { icon: "🗺️", title: "Smart Routing Optimization", accent: "#22c55e", desc: "Calculates the fastest ambulance-to-scene and scene-to-hospital route simultaneously, rerouted live with real traffic data. Both legs solved in one pass." },
  { icon: "🏥", title: "Hospital Triage Prediction", accent: "#ec4899", desc: "Pushes incident data ahead of the ambulance so the ER can pre-assign beds, specialists and equipment before the patient arrives. Treatment starts in transit." },
];

// NEW: Why NexVitals is Different
const DIFF_FEATS = [
  { icon: "⚙️", title: "Fully Automated Detection", accent: "#f59e0b", desc: "No human in the loop. Impact detected, classified and dispatched in under 5 seconds — no call center, no manual trigger, no delay." },
  { icon: "🧠", title: "AI Severity Classification", accent: "#3b82f6", desc: "Our AccidentDetectionModel scores every incident — CRITICAL, MODERATE or STABLE — before the ambulance moves. Right resource, every time." },
  { icon: "🏥", title: "Hospital Pre-Arrival Intelligence", accent: "#22c55e", desc: "The destination ER is prepped before the ambulance arrives. Triage, bed allocation and specialist assignment happen in transit, not on arrival." },
  { icon: "🔗", title: "End-to-End Ecosystem", accent: "#ec4899", desc: "Not just an alert app. NexVitals connects victims, responders, hospitals and administrators in one unified real-time platform." },
];

// NEW: Milestones
const MILESTONES = [
  { status: "done", label: "Prototype Built", desc: "Functional hardware module tested on both 2-wheeler and 4-wheeler form factors.", color: "#22c55e" },
  { status: "done", label: "Platform Live", desc: "All five dashboards operational — Admin, User, Responder, Hospital and Patient Portal.", color: "#22c55e" },
  { status: "done", label: "Simulation Results", desc: "AI routing simulations show up to 60% reduction in dispatch latency vs manual systems.", color: "#22c55e" },
  { status: "active", label: "Field Testing", desc: "Coordination underway for real-world pilot on select routes with emergency service partners.", color: "#f59e0b" },
];

const TL_EVENTS = [
  { t: "Before", tc: "rgba(255,255,255,0.28)", dc: "rgba(255,255,255,0.35)", bc: "rgba(255,255,255,0.15)", txt: "Father partially recovered. Family staying at a relative's house in Hyderabad.", pulse: false },
  { t: "~4:30 pm", tc: "rgba(255,180,0,0.7)", dc: "rgba(255,180,0,0.9)", bc: "rgba(255,180,0,0.4)", txt: "Father found unconscious. Nurse confirms vitals normal. Call an ambulance immediately.", pulse: false },
  { t: "The call", tc: "rgba(239,68,68,0.9)", dc: "#ef4444", bc: "rgba(239,68,68,0.45)", txt: "Ambulance contacted. Nearest available unit — 2 hours away. Driver says distance too long. No closer unit offered.", pulse: true },
  { t: "Leg 1", tc: "rgba(239,68,68,0.9)", dc: "#ef4444", bc: "rgba(239,68,68,0.45)", txt: "Ambulance driver agrees. Travels 1 hour toward the family from his station — heading into the middle.", pulse: false },
  { t: "Leg 2", tc: "rgba(239,68,68,0.9)", dc: "#ef4444", bc: "rgba(239,68,68,0.45)", txt: "Family books a cab, drives their unconscious father 1 hour toward the ambulance. Both vehicles moving. Neither knowing where they'd meet.", pulse: false },
  { t: "Leg 3", tc: "rgba(255,180,0,0.7)", dc: "rgba(255,180,0,0.9)", bc: "rgba(255,180,0,0.4)", txt: "They meet on the road. Father shifted from the cab into the ambulance on the roadside.", pulse: false },
  { t: "He made it", tc: "rgba(34,197,94,0.8)", dc: "#22c55e", bc: "rgba(34,197,94,0.4)", txt: "He reached hospital in time. He survived. But nobody should have to orchestrate that on a roadside with an unconscious family member in the back seat.", pulse: false },
];

const STACK_CARDS = [
  { title: "OUR VISION", body: "NexVitals was born out of a refusal to compromise. Our mission is to engineer a safety net that spans the nation — using cutting-edge innovation to outpace human error. We are not just building a project; we are building a shield." },
  { title: "OUR MISSION", body: "Every second counts. Every day in India, the sun sets on 485 lives lost to road accidents — 485 futures erased, countless families shattered. The gap between an accident and a rescue is where lives are lost. That is exactly where NexVitals steps in." },
  { title: "SAFETY IS A RIGHT", body: "At NexVitals, safety is not a luxury — it is a fundamental right. We are building a future where technology acts as a guardian, intervening the moment danger strikes. Even one life saved changes the world for an entire family." },
  { title: "THE SILENT LEFT BEHIND", body: "Beyond the statistics lie 485 homes left in silence — every single day. Not data points on a chart but fathers, mothers, children and friends whose journeys were cut short. NexVitals exists so those journeys continue." },
];

// UPDATED: Team with improved role tags
const TEAM = [
  { name: "Sreenivasan Venkata Raghavan", role: "Founder & Project Lead", specialty: "IoT Systems Lead", photo: "/rags.jpeg", initial: "R", accent: "#f59e0b", tags: ["IoT Systems", "Computer Vision", "Architecture"] },
  { name: "Yerraguntla Kameswara Sai Srikar", role: "Co-Founder · Cloud & AI", specialty: "AI/ML Lead", photo: "/srikar.png", initial: "S", accent: "#22c55e", tags: ["AI/ML Lead", "Cloud & AWS", "Automation"] },
  { name: "Konduri Lakshmi Prasanna", role: "Co-Founder & Vice Project Lead", specialty: "Frontend Lead", photo: "/prasanna.jpeg", initial: "P", accent: "#3b82f6", tags: ["Frontend Lead", "UX Design", "Workflow"] },
  { name: "Kotagiri Kavya Sri", role: "Co-Founder · Databases & Web", specialty: "Backend Lead", photo: "/kavya.jpeg", initial: "K", accent: "#ec4899", tags: ["Backend Lead", "Database Architecture", "Web Systems"] },
];

const TECH_LOGOS = [
  { node: <SiReact />, title: "React" },
  { node: <FaAws />, title: "AWS" },
  { node: <FaRaspberryPi />, title: "RPi" },
  { node: <FaLinux />, title: "Linux" },
  { node: <FaDocker />, title: "Docker" },
  { node: <FaPython />, title: "Python" },
  { node: <FaJava />, title: "Java" },
  { node: <SiFastapi />, title: "FastAPI" },
];

const NAV_LINKS = [
  { label: "Platform", id: "section-platform" },
  { label: "Lifecycle", id: "section-lifecycle" },
  { label: "Vision", id: "section-vision" },
  { label: "Team", id: "section-team" },
];

const DASH_PINS = {
  admin: [{ x: "18%", y: "22%", label: "Live satellite map — units & incidents", color: "#f59e0b", n: 1 }, { x: "72%", y: "35%", label: "AI severity badge queue", color: "#f59e0b", n: 2 }, { x: "42%", y: "68%", label: "Active missions tracker", color: "#f59e0b", n: 3 }],
  user: [{ x: "20%", y: "18%", label: "Silent SOS — one tap, no sound", color: "#3b82f6", n: 1 }, { x: "60%", y: "42%", label: "Live GPS pin streamed to responders", color: "#3b82f6", n: 2 }, { x: "35%", y: "72%", label: "Live biometrics — SpO₂ & HR", color: "#3b82f6", n: 3 }],
  emergency: [{ x: "15%", y: "20%", label: "AI model: CRITICAL at 94% confidence", color: "#22c55e", n: 1 }, { x: "65%", y: "38%", label: "Medical profile pre-loaded on dispatch", color: "#22c55e", n: 2 }, { x: "40%", y: "70%", label: "One-tap transmit to ER", color: "#22c55e", n: 3 }],
  hospital: [{ x: "22%", y: "16%", label: "Auto-triage before ambulance arrives", color: "#ec4899", n: 1 }, { x: "70%", y: "40%", label: "AI bed & specialist assignment", color: "#ec4899", n: 2 }, { x: "38%", y: "72%", label: "Live ward statuses — ICU, General", color: "#ec4899", n: 3 }],
  patient: [{ x: "18%", y: "20%", label: "MRN-linked identity & diagnosis", color: "#8b5cf6", n: 1 }, { x: "62%", y: "44%", label: "Reports ready + amount due — live", color: "#8b5cf6", n: 2 }, { x: "40%", y: "74%", label: "Discharge status — no staff needed", color: "#8b5cf6", n: 3 }],
};

/* ═══════════════════════════════════════════════════
   MINI COMPONENTS
═══════════════════════════════════════════════════ */
function Chip({ label, accent, dot = true }) {
  const bg = accent ? `${accent}14` : "rgba(245,158,11,0.10)";
  const br = accent ? `${accent}36` : "rgba(245,158,11,0.28)";
  const col = accent || "#f59e0b";
  return (
    <div className="iv-chip" style={{ background: bg, borderColor: br, color: col }}>
      {dot && <span className="iv-dot" style={{ background: col, boxShadow: `0 0 5px ${col}` }} />}
      {label}
    </div>
  );
}

function SecHead({ chip, chipAccent, title, hl, sub }) {
  return (
    <div className="iv-sec-head">
      <Chip label={chip} accent={chipAccent} />
      <h2>{title} {hl && <span className="iv-amber-text">{hl}</span>}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

function TeamCard({ m }) {
  const [err, setErr] = useState(false);
  return (
    <div className="iv-team-card">
      {m.photo && !err
        ? <img className="iv-team-photo" src={m.photo} alt={m.name} onError={() => setErr(true)} />
        : (
          <div className="iv-team-photo-placeholder">
            <span style={{ fontFamily: "var(--fd)", fontSize: "3.5rem", fontWeight: 800, color: m.accent, opacity: 0.5 }}>{m.initial}</span>
          </div>
        )
      }
      <div className="iv-team-info">
        <div className="iv-team-name">{m.name}</div>
        <div className="iv-team-role" style={{ color: m.accent }}>{m.role}</div>
        <div style={{ fontFamily: "var(--fm)", fontSize: "0.5rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--t20)", marginBottom: 10 }}>
          {m.specialty}
        </div>
        <div className="iv-team-tags">
          {m.tags.map(t => (
            <span key={t} className="iv-team-tag" style={{ borderColor: `${m.accent}33`, color: m.accent, opacity: 0.8 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// NEW: Generic feature card used for Diff + AI Engine sections
function FeatCard({ f }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="iv-feat-card"
      style={{ borderColor: hov ? `${f.accent}44` : "var(--line)", background: hov ? `${f.accent}0a` : "var(--s1)" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div className="iv-feat-card-glow" style={{ background: `radial-gradient(circle at top right,${f.accent}18,transparent 65%)`, opacity: hov ? 1 : 0.3 }} />
      <div className="iv-feat-card-icon" style={{ filter: hov ? `drop-shadow(0 0 10px ${f.accent}bb)` : "none" }}>{f.icon}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${f.accent}55,transparent)` }} />
      <div className="iv-feat-card-title">{f.title}</div>
      <div className="iv-feat-card-desc">{f.desc}</div>
    </div>
  );
}

function DashRow({ d, reverse }) {
  const [hov, setHov] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const pins = DASH_PINS[d.id] || [];

  useEffect(() => {
    if (!lightbox) return;
    const fn = e => { if (e.key === "Escape") setLightbox(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [lightbox]);

  return (
    <>
      <div
        className="iv-dash-row"
        style={{ flexDirection: reverse ? "row-reverse" : "row", borderColor: hov ? d.aB : "var(--line)" }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      >
        <div style={{ position: "absolute", top: 0, [reverse ? "left" : "right"]: 0, width: 260, height: 260, background: `radial-gradient(circle at ${reverse ? "top left" : "top right"},${d.aD},transparent 65%)`, opacity: hov ? 1 : 0.5, transition: "opacity 0.4s", pointerEvents: "none" }} />
        <div className="iv-dash-img" style={{ borderColor: hov ? d.aB : "var(--line)", cursor: "zoom-in" }} onClick={() => setLightbox(true)}>
          {d.img
            ? <img src={d.img} alt={d.title} />
            : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ width: "68%", display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
                    {[`${d.accent}66`, `${d.accent}44`, `${d.accent}22`].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
                  </div>
                  <div style={{ height: 10, width: "52%", borderRadius: 4, background: `${d.accent}55` }} />
                  {[90, 70, 80, 55, 75].map((w, i) => <div key={i} style={{ height: 6, width: `${w}%`, borderRadius: 3, background: "rgba(255,255,255,0.07)" }} />)}
                </div>
              </div>
            )
          }
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%,${d.aD},transparent 55%)`, pointerEvents: "none" }} />
          {hov && (
            <div className="iv-ann-wrap">
              {pins.map(p => (
                <div key={p.n} className="iv-pin" style={{ left: p.x, top: p.y, animationDelay: `${(p.n - 1) * 0.07}s` }}>
                  <div className="iv-pin-dot" style={{ background: p.color, borderColor: p.color }}>{p.n}</div>
                  <div className="iv-pin-label">{p.label}</div>
                </div>
              ))}
            </div>
          )}
          <div className="iv-expand-hint">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 4V1h3M7 1h3v3M10 7v3H7M4 10H1V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Click to expand
          </div>
        </div>
        <div className="iv-dash-info">
          <Chip label={d.tag} accent={d.accent} />
          <div className="iv-dash-h3">{d.title}</div>
          <div className="iv-dash-tagline" style={{ color: d.accent }}>{d.tagline}</div>
          <div className="iv-dash-desc">{d.desc}</div>
          <div className="iv-divider" style={{ background: `linear-gradient(90deg,${d.accent}44,transparent)` }} />
          <ul className="iv-feats">
            {d.feats.map((f, i) => (
              <li key={i} className="iv-feat">
                <div className="iv-feat-check" style={{ background: `${d.accent}18`, borderColor: `${d.accent}40` }}>
                  <svg width="10" height="10" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke={d.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--white)" }}>{f.l}</span>
                  <span style={{ fontSize: "0.88rem", color: "var(--t45)" }}> — {f.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {lightbox && (
        <div className="iv-lb-bg" onClick={() => setLightbox(false)}>
          <div className="iv-lb-panel" onClick={e => e.stopPropagation()}>
            {d.img
              ? <img src={d.img} alt={d.title} />
              : <div style={{ width: "100%", aspectRatio: "16/9", background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: "var(--fd)", fontSize: "1.4rem", color: "var(--t45)" }}>{d.title}</span></div>
            }
            <div className="iv-ann-wrap">
              {pins.map((p, idx) => (
                <div key={p.n} className="iv-pin" style={{ left: p.x, top: p.y, animationDelay: `${idx * 0.06 + 0.15}s` }}>
                  <div className="iv-pin-dot" style={{ background: p.color, borderColor: p.color }}>{p.n}</div>
                  <div style={{ background: "rgba(0,0,0,0.82)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 7, padding: "5px 10px", fontFamily: "var(--fb)", fontSize: "0.72rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>{p.label}</div>
                </div>
              ))}
            </div>
            <button className="iv-lb-close" onClick={() => setLightbox(false)}>✕</button>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 16px", background: "linear-gradient(0deg,rgba(0,0,0,0.85),transparent)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.accent, boxShadow: `0 0 8px ${d.accent}` }} />
                <span style={{ fontFamily: "var(--fm)", fontSize: "0.6rem", letterSpacing: "2px", color: d.accent, textTransform: "uppercase" }}>{d.tag}</span>
              </div>
              <span style={{ fontFamily: "var(--fm)", fontSize: "0.55rem", letterSpacing: "1.5px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Origin() {
  const navigate = useNavigate();
  return (
    <section id="section-origin" className="iv-sec">
      <div className="iv-origin-card">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
          <Chip label="Where NexVitals Began" />
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>
        <div className="iv-origin-grid">
          <div>
            <p style={{ margin: "0 0 26px", fontFamily: "var(--fm)", fontSize: "0.56rem", letterSpacing: "2.5px", color: "var(--t20)", textTransform: "uppercase" }}>
              Hyderabad · 2015 · ~4:30 pm
            </p>
            <div className="iv-tl">
              <div className="iv-tl-spine" />
              {TL_EVENTS.map((ev, i) => (
                <div key={i} className="iv-tl-item" style={{ marginBottom: i < TL_EVENTS.length - 1 ? 24 : 0 }}>
                  <div className="iv-tl-node" style={{ borderColor: ev.bc }}>
                    <div className="iv-tl-dot" style={{ background: ev.dc, animation: ev.pulse ? "iv-tl-pulse 1.4s ease-in-out infinite" : "none" }} />
                  </div>
                  <p className="iv-tl-time" style={{ color: ev.tc }}>{ev.t}</p>
                  <p className="iv-tl-text">{ev.txt}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="iv-origin-sep" />
          <div style={{ paddingTop: 4 }}>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, color: "var(--white)", lineHeight: 1.2, margin: "0 0 22px", letterSpacing: "-0.3px" }}>
              The night the system<br /><span className="iv-amber-text">left us with nothing.</span>
            </h2>
            <p style={{ margin: "0 0 15px", fontSize: "0.93rem", color: "var(--t45)", lineHeight: 1.75 }}>
              In 2015, our co-founder's father collapsed unconscious at a relative's house in Hyderabad. A nurse confirmed his vitals were stable — but said he needed a hospital immediately.
            </p>
            <p style={{ margin: "0 0 15px", fontSize: "0.93rem", color: "var(--t45)", lineHeight: 1.75 }}>
              The ambulance they reached was 2 hours away. The driver refused. With no system to tell them whether a closer unit existed, they had no choice — book a cab, put an unconscious man in the back seat, and drive toward the ambulance. Both vehicles moving for an hour.
            </p>
            <p style={{ margin: "0 0 28px", fontSize: "0.93rem", color: "var(--t45)", lineHeight: 1.75 }}>
              Three legs of a journey. In an emergency. Because no one knew where the nearest ambulance actually was.
            </p>
            <div className="iv-quote">
              <p>"We didn't even know if that was the nearest ambulance. We still don't know. That is the exact problem NexVitals was built to solve — so no family ever has to say the same."</p>
            </div>
            <div className="iv-origin-cta">
              <button className="iv-origin-cta-btn" onClick={() => { logEvent("cta_origin_click", Date.now(), "origin_section"); navigate("/register"); }}>
                See How NexVitals Solves This →
              </button>
              <span className="iv-origin-cta-note">⚡ No system failure should ever cost a life</span>
            </div>
            <p style={{ fontSize: "0.83rem", color: "var(--t20)", lineHeight: 1.75 }}>
              He survived. But the chaos of that evening is why NexVitals exists. We are building the infrastructure that should have been there in 2015, for every family on every road in India.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisionStack() {
  return (
    <section id="section-vision" className="iv-vision-outer">
      <div className="iv-vision-header">
        <Chip label="Our Purpose" accent="#f59e0b" />
        <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(2rem,4.5vw,3.2rem)", fontWeight: 800, color: "var(--white)", lineHeight: 1.08, letterSpacing: "-0.5px", marginTop: 14 }}>
          Why We <span className="iv-amber-text">Build</span>
        </h2>
      </div>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px" }}>
        <ScrollStack itemDistance={200} itemScale={0.04} itemStackDistance={48} stackPosition="18%" scaleEndPosition="8%" baseScale={0.88} rotationAmount={0} blurAmount={0}>
          {STACK_CARDS.map((c, i) => (
            <ScrollStackItem key={i}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center", padding: "clamp(28px,5vw,52px) clamp(20px,6vw,56px)", position: "relative", width: "100%", height: "100%", justifyContent: "center" }}>
                <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(245,158,11,0.28),transparent)", borderRadius: 1 }} />
                <Chip label={`0${i + 1}`} accent="var(--amber)" />
                <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.2rem,3vw,1.9rem)", fontWeight: 800, letterSpacing: 1, color: "var(--white)", margin: 0 }}>{c.title}</h2>
                <p style={{ fontSize: "clamp(0.85rem,1.5vw,1.02rem)", color: "var(--t70)", lineHeight: 1.75, maxWidth: 620, fontWeight: 300, margin: 0 }}>{c.body}</p>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}

function VideoSec() {
  const vRef = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) vRef.current?.play().catch(() => { });
      else vRef.current?.pause();
    }, { threshold: 0.4 });
    if (vRef.current) obs.observe(vRef.current);
    return () => { if (vRef.current) obs.unobserve(vRef.current); };
  }, []);
  return (
    <div className="iv-vid-wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="iv-chip" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.28)", color: "#ef4444" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444", flexShrink: 0, animation: "iv-bounce 1.5s ease infinite" }} />
          Live Hardware Demo
        </div>
        <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
      </div>
      <div>
        <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 800, color: "var(--white)", lineHeight: 1.15 }}>See NexVitals In Action</h2>
        <p style={{ marginTop: 6, fontSize: "0.9rem", color: "var(--t45)" }}>Real hardware. Real roads. Real results.</p>
      </div>
      <div className="iv-vid-frame">
        <video
          ref={vRef}
          src="https://res.cloudinary.com/dskaksxw0/video/upload/q_auto,f_auto/v1774621683/demo_1_nxtcrd.mp4"
          muted
          loop
          playsInline
          preload="metadata"
          style={{ width: "100%", borderRadius: "12px", objectFit: "cover" }}
        />
      </div>
    </div>
  );
}

// NEW: Milestone strip component
function MilestoneStrip() {
  return (
    <div className="iv-milestone-strip">
      {MILESTONES.map((m, i) => (
        <div key={i} className="iv-milestone">
          <div className="iv-milestone-status" style={{ color: m.color }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.color, boxShadow: `0 0 6px ${m.color}`, display: "inline-block", animation: m.status === "active" ? "iv-pulse 2s ease-in-out infinite" : "none" }} />
            {m.status === "done" ? "Complete" : "In Progress"}
          </div>
          <div className="iv-milestone-title">{m.label}</div>
          <div className="iv-milestone-desc">{m.desc}</div>
        </div>
      ))}
    </div>
  );
}

// NEW: Compliance section (trimmed to 2 points)
function ComplianceStrip() {
  return (
    <div className="iv-compliance-strip">
      <div className="iv-compliance-col">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: "1.6rem" }}>🔒</span>
          <div style={{ fontFamily: "var(--fd)", fontSize: "1.05rem", fontWeight: 700, color: "var(--white)" }}>Secure Patient Data Handling</div>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(59,130,246,0.4),transparent)", marginBottom: 14 }} />
        <p style={{ fontSize: "0.88rem", color: "var(--t45)", lineHeight: 1.72 }}>
          All biometric and personal data is encrypted end-to-end. Patient identity is tied to a unique MRN with access-controlled visibility across roles. Designed with data privacy as a first principle, not an afterthought.
        </p>
        <p style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--t20)", fontFamily: "var(--fm)", letterSpacing: "1px" }}>
          Roadmap includes alignment with NHA digital health guidelines.
        </p>
      </div>
      <div className="iv-compliance-sep" />
      <div className="iv-compliance-col">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: "1.6rem" }}>🏗️</span>
          <div style={{ fontFamily: "var(--fd)", fontSize: "1.05rem", fontWeight: 700, color: "var(--white)" }}>Designed for Emergency Services Integration</div>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(59,130,246,0.4),transparent)", marginBottom: 14 }} />
        <p style={{ fontSize: "0.88rem", color: "var(--t45)", lineHeight: 1.72 }}>
          Architecture built for integration with existing ambulance networks, police control rooms and hospital management systems. Modular design allows city-wide, state-wide or national rollout without re-engineering the core platform.
        </p>
        <p style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--t20)", fontFamily: "var(--fm)", letterSpacing: "1px" }}>
          Designed for B2G and B2B deployment — government emergency systems, hospitals and ambulance fleet operators.
        </p>
      </div>
    </div>
  );
}

// NEW: Impact Punch Banner
function ImpactBanner({ onPartner }) {
  return (
    <div className="iv-impact-banner">
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Chip label="The Stakes" accent="#f59e0b" />
        <div className="iv-impact-banner-headline">
          Every 1-minute delay in emergency response<br />
          <span className="iv-amber-text">reduces survival chances dramatically.</span>
        </div>
        <div className="iv-impact-banner-body">
          NexVitals exists for one reason — to eliminate that delay completely. Not someday. Right now. Built on real hardware, tested on real roads, designed for real deployment.
        </div>
        <button className="iv-impact-partner-btn" onClick={onPartner}>
          Partner With Us →
        </button>
      </div>
    </div>
  );
}

function genId() { return "s_" + Math.random().toString(36).slice(2, 9); }

function Chat({ open, onClose }) {
  const [msgs, setMsgs] = useState([{ role: "bot", text: "Hi! I'm IVAI. Ask me anything about NexVitals — the platform, the technology, or the team." }]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const [sid] = useState(genId);
  const endRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { if (open) setTimeout(() => taRef.current?.focus(), 350); }, [open]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const send = async () => {
    const t = inp.trim(); if (!t || busy) return;
    setMsgs(p => [...p, { role: "user", text: t }]);
    setInp(""); setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: t, session_id: sid }) });
      const d = await r.json();
      setMsgs(p => [...p, { role: "bot", text: d.reply }]);
    } catch {
      setMsgs(p => [...p, { role: "bot", text: "Sorry, I couldn't reach the server. Please make sure the backend is running." }]);
    } finally { setBusy(false); }
  };
  const onKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      <div className="iv-chat-bg" style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }} onClick={onClose} />
      <div className="iv-chat" style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}>
        <div className="iv-chat-hd">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="iv-chat-avatar">✦</div>
            <div>
              <div style={{ color: "var(--white)", fontWeight: 700, fontSize: 15, fontFamily: "var(--fd)" }}>IVAI Assistant</div>
              <div style={{ color: "var(--t20)", fontSize: 10, fontFamily: "var(--fm)", letterSpacing: "1.5px" }}>
                <span style={{ color: "#22c55e" }}>●</span> ONLINE
              </div>
            </div>
          </div>
          <button className="iv-chat-close" onClick={onClose}>✕</button>
        </div>
        <div className="iv-chat-msgs">
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
              {m.role === "bot" && <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,var(--amber),#f97316)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✦</div>}
              <div className={m.role === "user" ? "iv-bubble-user" : "iv-bubble-bot"}>{m.text}</div>
            </div>
          ))}
          {busy && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,var(--amber),#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✦</div>
              <div className="iv-typing">
                {[0, 1, 2].map(d => <div key={d} className="iv-typing-dot" style={{ animationDelay: `${d * 0.2}s` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="iv-chat-inp">
          <div className="iv-chat-row">
            <textarea ref={taRef} className="iv-chat-ta" value={inp} onChange={e => setInp(e.target.value)} onKeyDown={onKey}
              placeholder="Ask anything about NexVitals…" rows={1}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} />
            <button className="iv-chat-send"
              style={inp.trim() && !busy ? { background: "linear-gradient(135deg,var(--amber),#f97316)", color: "#000", boxShadow: "0 0 14px rgba(245,158,11,0.3)" } : { background: "var(--line)", color: "var(--t20)", cursor: "not-allowed" }}
              onClick={send} disabled={busy || !inp.trim()}>↑</button>
          </div>
          <p style={{ textAlign: "center", marginTop: 8, color: "var(--t20)", fontSize: "0.62rem", fontFamily: "var(--fm)", letterSpacing: "1.5px" }}>
            POWERED BY NexVitals · ENTER TO SEND
          </p>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════ */
const logEvent = (event, timestamp, source) => {
  console.log({ event, timestamp, source });
};

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [counting, setCounting] = useState(false);
  const [cursorOn] = useState(true);
  const [dark, setDark] = useState(true);
  const [chat, setChat] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => { setMounted(true); setCounting(true); }, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 960) setMobileMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (mobileMenuOpen) setMobileMenuOpen(false);
      for (const { id, label } of [...NAV_LINKS].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) { setActiveNav(label); return; }
      }
      setActiveNav("");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileMenuOpen]);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePartner = () => {
    logEvent("cta_partner_banner_click", Date.now(), "impact_banner");
    navigate("/register");
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#000", color: "#fff", position: "relative", overflowX: "hidden", maxWidth: "100vw" }}>
      <style>{G}</style>

      {/* Beams BG */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: dark ? 0.15 : 0.05, transition: "opacity 0.5s" }}>
        <Beams beamWidth={2.5} beamHeight={28} beamNumber={20} lightColor="#ffffff" speed={1} noiseIntensity={1.6} scale={0.22} rotation={25} />
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", overflowX: "hidden" }}>

        {/* ═══ NAV ═══ */}
        <nav className="iv-nav">
          <div className="iv-logo">
            <div className="iv-logo-pulse" />
            NexVitals
          </div>
          <div className="iv-nav-pills">
            {NAV_LINKS.map(({ label, id }) => (
              <button key={label} className={`iv-pill${activeNav === label ? " active" : ""}`} onClick={() => scrollTo(id)}>
                {label}
              </button>
            ))}
          </div>
          <div className="iv-nav-right">
            <ThemeSwitch checked={dark} onChange={e => setDark(e.target.checked)} />
            <button className="iv-btn iv-ghost" onClick={() => { logEvent("cta_login_nav_click", Date.now(), "desktop_nav"); navigate("/LoginPage"); }}>
              <svg viewBox="0 0 24 24"><path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z" /></svg>
              Login
            </button>
            <button className="iv-btn iv-amber" onClick={() => { logEvent("cta_pilot_nav_click", Date.now(), "desktop_nav"); navigate("/register"); }}>Request Pilot →</button>
            <button
              className={`iv-hamburger${mobileMenuOpen ? " open" : ""}`}
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        <div className={`iv-mobile-menu${mobileMenuOpen ? " open" : ""}`}>
          {NAV_LINKS.map(({ label, id }) => (
            <button key={label} className={`iv-mobile-pill${activeNav === label ? " active" : ""}`} onClick={() => scrollTo(id)}>
              {label}
            </button>
          ))}
          <div className="iv-mobile-menu-actions">
            <button className="iv-btn iv-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => { logEvent("cta_login_mobile_click", Date.now(), "mobile_nav"); navigate("/LoginPage"); setMobileMenuOpen(false); }}>
              Login
            </button>
            <button className="iv-btn iv-amber" style={{ flex: 1, justifyContent: "center" }} onClick={() => { logEvent("cta_pilot_mobile_click", Date.now(), "mobile_nav"); navigate("/register"); setMobileMenuOpen(false); }}>
              Request Pilot →
            </button>
          </div>
        </div>

        {/* ═══ HERO — REWRITTEN ═══ */}
        <section className="iv-hero">
          <div className="iv-hero-glow" />
          <div className="iv-hero-grid" />
          <div className="iv-eyebrow">
            <span className="iv-eyebrow-bar" />
            Team Padma Vyuha presents
            <span className="iv-eyebrow-bar" />
          </div>

          {/* NEW: Strong product headline */}
          <div className="iv-h1 cursor-target">
            {mounted
              ? <Shuffle text="AI-Powered Emergency Response" triggerOnce style={{ color: "var(--white)", fontFamily: "'Syne',sans-serif" }} />
              : "AI-Powered Emergency Response"
            }
          </div>

          {/* NEW: Subheadline pipeline */}
          <div className="iv-h1-sub cursor-target">
            <TrueFocus sentence="That Saves Lives in Seconds" manualMode={false} blurAmount={5} borderColor="#f59e0b" animationDuration={0.5} pauseBetweenAnimations={1} />
          </div>

          {/* NEW: Pipeline tagline */}
          <div className="iv-hero-desc cursor-target">
            <DecryptedText text="Detect. Analyze. Dispatch. Treat — all before it's too late." animateOn="view" revealDirection="start" sequential speed={55} maxIterations={8} />
          </div>

          <div className="iv-hero-sub cursor-target">
            <SplitText text="Saving Lives, One Second At A Time !" delay={38} duration={1.1} ease="power3.out" splitType="chars" from={{ opacity: 0, y: 22 }} to={{ opacity: 1, y: 0 }} textAlign="center" />
          </div>

          {/* NEW: Origin teaser */}
          <div className="iv-hero-origin-tease">
            Born from a real emergency. Built so it never happens again.
            <a href="#section-origin" onClick={e => { e.preventDefault(); scrollTo("section-origin"); }}>↓ Read our story</a>
          </div>

          {/* UPDATED CTAs */}
          <div className="iv-hero-cta">
            <button className="iv-btn iv-amber iv-amber-lg" onClick={() => { logEvent("cta_pilot_hero_click", Date.now(), "hero"); navigate("/register"); }}>Request Pilot Deployment →</button>
            <button className="iv-btn iv-ghost iv-amber-lg" onClick={() => { logEvent("cta_demo_hero_click", Date.now(), "hero"); document.getElementById("live-demo")?.scrollIntoView({ behavior: "smooth" }); }}>
              ▶ View Live Demo
            </button>
          </div>
          <div className="iv-hero-cta-note">
            Currently accepting pilot partners — hospitals, ambulance providers & smart city programs
          </div>

          {/* UPDATED trust badges */}
          <div className="iv-trust-row cursor-target">
            <div className="iv-trust-badge">⚡ &lt;5 sec detection</div>
            <div className="iv-trust-badge">📍 Real-time GPS tracking</div>
            <div className="iv-trust-badge">🚑 Smart AI dispatch</div>
            <div className="iv-trust-badge">🏥 Pre-arrival hospital prep</div>
          </div>
        </section>

        <TargetCursor spinDuration={2} hideDefaultCursor parallaxOn hoverDuration={0.2} enabled={cursorOn} />

        {/* ═══ IMPACT METRICS — UPDATED disclaimer ═══ */}
        <div style={{ width: "100%", maxWidth: "900px", margin: "60px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "50px", alignItems: "center" }}>
          <div style={{ textAlign: "center", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "16px", padding: "40px" }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.2rem,3.5vw,2.2rem)", fontWeight: 600, color: "var(--t90)", lineHeight: 1.3 }}>
              Projected to reduce response times by up to
              <span className="iv-stat-num" style={{ fontSize: "clamp(3rem,7vw,5.5rem)", display: "inline-block", margin: "0 8px" }}>
                <CountUp from={0} to={60} direction="up" duration={2} startCounting={counting} />%
              </span>
            </div>
            <p style={{ color: "var(--t45)", fontSize: "clamp(0.88rem,1.5vw,1.1rem)", marginTop: "16px", lineHeight: 1.7, maxWidth: "700px", marginInline: "auto" }}>
              Based on AI-driven routing simulations comparing automated dispatch against manual call-center response. By eliminating human delay at every step, NexVitals cuts the critical gap between an accident and a rescue.
            </p>
            {/* UPDATED: Added simulation caveat */}
            <span className="iv-stat-footnote">
              ⚠ Simulation-based estimate · Real-world validation ongoing ·{" "}
              <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer">Analysis: Google Gemini AI</a>{" "}
              · NCRB 2023 road accident baseline
            </span>
            <div style={{ marginTop: "24px", fontSize: "0.7rem", color: "var(--t45)", fontFamily: "var(--fm)" }}>
              Based on simulation data. Real-world results subject to deployment conditions and regulatory approval.
            </div>
          </div>

          <div style={{ width: "100%", height: "2px", background: "linear-gradient(90deg,transparent,rgba(239,68,68,0.6),transparent)", boxShadow: "0 0 20px rgba(239,68,68,0.3)" }} />

          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.2rem,3.5vw,2.2rem)", fontWeight: 600, color: "var(--t90)", lineHeight: 1.3 }}>
              Because
              <span className="iv-stat-num" style={{ color: "#ef4444", textShadow: "0 0 40px rgba(239,68,68,0.5)", fontSize: "clamp(3rem,7vw,5.5rem)", display: "inline-block", margin: "0 8px" }}>
                <CountUp from={0} to={485} direction="up" duration={2} startCounting={counting} />
              </span>
              lives lost daily
            </div>
            <p style={{ color: "var(--t45)", fontSize: "clamp(0.88rem,1.5vw,1.1rem)", marginTop: "16px", lineHeight: 1.7, maxWidth: "700px", marginInline: "auto" }}>
              On Indian roads, 485 families lose a loved one every single day. NexVitals is built to ensure that no call for help goes unanswered, and no location goes undetected.
            </p>
          </div>
        </div>

        {/* ═══ ORIGIN ═══ */}
        <Origin />

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="section-platform" className="iv-sec">
          <SecHead chip="Mechanism" title="How NexVitals Works" sub="A seamless, automated pipeline from the moment of impact to hospital arrival." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "24px" }}>
            <div className="iv-step-card"><div className="iv-step-num">01</div><h3>Detect</h3><p>On-board IoT sensors and accelerometers instantly recognize high-G impacts or manual SOS triggers, locking exact GPS coordinates.</p></div>
            <div className="iv-step-card"><div className="iv-step-num">02</div><h3>Process</h3><p>Our AccidentDetectionModel analyzes the severity in milliseconds while the Smart Navigation Engine routes the nearest active ambulance.</p></div>
            <div className="iv-step-card"><div className="iv-step-num">03</div><h3>Alert</h3><p>Responders receive live biometrics. The destination hospital is pinged to prep trauma beds before the ambulance even arrives.</p></div>
          </div>
        </section>

        {/* ═══ NEW: WHY NexVitals IS DIFFERENT ═══ */}
        <section className="iv-sec">
          <SecHead chip="Differentiation" chipAccent="#f59e0b" title="Why NexVitals is" hl="Different"
            sub="Four capabilities that separate NexVitals from every other emergency response solution." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "14px" }}>
            {DIFF_FEATS.map(f => <FeatCard key={f.title} f={f} />)}
          </div>
        </section>

        {/* ═══ USE CASES ═══ */}
        <section className="iv-sec">
          <SecHead chip="Hardware & Tracking" title="Adaptable & Continuous" sub="Built specifically for the road. NexVitals adapts to your vehicle and monitors your health seamlessly." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: "16px" }}>
            <div className="iv-use-case" style={{ backgroundImage: "linear-gradient(to bottom,rgba(0,0,0,0.3),#000),url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600')" }}><h4>One Device. Two Forms.</h4><p>Engineered in two distinct form factors: a robust module for 4-wheelers and a compact, weather-proof build for 2-wheelers.</p></div>
            <div className="iv-use-case" style={{ backgroundImage: "linear-gradient(to bottom,rgba(0,0,0,0.3),#000),url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600')" }}><h4>Wireless Vitals Sync</h4><p>Continuous biometric tracking for every trip. NexVitals monitors your baseline SpO₂ and heart rate before an emergency even happens.</p></div>
            <div className="iv-use-case" style={{ backgroundImage: "linear-gradient(to bottom,rgba(0,0,0,0.3),#000),url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=600')" }}><h4>Remote Area Fallback</h4><p>Offline-capable SMS-fallback ensures your SOS and coordinates reach responders even when 4G/5G networks drop.</p></div>
          </div>
        </section>

        {/* ═══ LIFECYCLE ═══ */}
        <section id="section-lifecycle" style={{ width: "100%", position: "relative", overflowX: "hidden" }}>
          <div style={{ position: "absolute", left: "calc(50% - 380px)", top: 0, bottom: 0, width: "1px", background: "linear-gradient(to bottom,transparent,rgba(245,158,11,0.10) 10%,rgba(245,158,11,0.07) 90%,transparent)", pointerEvents: "none" }} />
          {["01", "02", "03", "04", "05"].map((n, i) => (
            <div key={n} style={{ position: "absolute", left: "calc(50% - 340px)", top: `${10 + i * 18}%`, fontFamily: "var(--fd)", fontSize: "clamp(2.5rem,5vw,4.5rem)", fontWeight: 800, color: "rgba(245,158,11,0.035)", pointerEvents: "none", userSelect: "none", lineHeight: 1 }}>{n}</div>
          ))}
          <Lifecycle />
        </section>

        {/* ═══ VISION STACK ═══ */}
        <VisionStack />

        {/* ═══ PLATFORM OVERVIEW ═══ */}
        <section className="iv-sec" style={{ textAlign: "center" }}>
          <SecHead chip="Platform Overview" title="Everything You Need," hl="Built for Every Role"
            sub="Five purpose-built dashboards — each designed for a specific role in the emergency response chain, powered by AI at every layer." />
        </section>
        <section className="iv-sec">
          <div className="iv-dash-list">
            {DASHBOARDS.map((d, i) => <DashRow key={d.id} d={d} reverse={i % 2 !== 0} />)}
          </div>
        </section>

        {/* ═══ NEW: AI CORE ENGINE (replaces old vague AI section) ═══ */}
        <section className="iv-sec">
          <SecHead chip="Intelligence Layer" chipAccent="#3b82f6" title="What Our AI" hl="Actually Does"
            sub="Four models. One pipeline. Zero human delay — from impact detection to hospital handoff." />
          <div className="iv-ai-grid">
            {AI_FEATS.map(f => <FeatCard key={f.title} f={f} />)}
          </div>
        </section>

        {/* ═══ NEW: CURRENT STATUS MILESTONE STRIP ═══ */}
        <section className="iv-sec">
          <SecHead chip="Validation" chipAccent="#22c55e" title="Where We Are" hl="Right Now"
            sub="NexVitals is not a concept. Every milestone below represents real work, tested hardware and measured results." />
          <MilestoneStrip />
        </section>

        {/* ═══ NEW: COMPLIANCE / DEPLOYMENT READINESS (trimmed to 2 points) ═══ */}
        <section className="iv-sec">
          <SecHead chip="Deployment Readiness" chipAccent="#3b82f6" title="Built for" hl="Real-World Healthcare Systems"
            sub="Designed to plug into existing emergency infrastructure — not replace it." />
          <ComplianceStrip />
        </section>

        {/* ═══ VIDEO ═══ */}
        <section id="live-demo" className="iv-sec" style={{ maxWidth: 980 }}>
          <VideoSec />
        </section>

        {/* ═══ ASK AI ═══ */}
        <section style={{ margin: "80px 0 52px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "0 20px", textAlign: "center" }}>
          <div className="cursor-target" style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.2rem,3vw,1.6rem)", fontWeight: 700, color: "var(--white)" }}>
            Curious About NexVitals? 😉
          </div>
          <SparkleButton onClick={() => setChat(true)}>✦ Ask NexVitals AI</SparkleButton>
        </section>

        {/* ═══ LOGO STRIP ═══ */}
        <section className="iv-logo-strip cursor-target">
          <LogoLoop logos={TECH_LOGOS} speed={55} direction="left" logoHeight={38} gap={52} hoverSpeed={0} scaleOnHover fadeOut fadeOutColor="#000000" ariaLabel="Technology stack" />
        </section>

        <div className="iv-hr" />

        {/* ═══ GET STARTED ═══ */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
          <GetStarted onClick={() => { logEvent("cta_get_started_click", Date.now(), "pre_footer"); navigate("/register"); }} />
        </div>

        {/* ═══ TEAM — UPDATED ═══ */}
        <section id="section-team" className="iv-sec" style={{ textAlign: "center", paddingBottom: 0 }}>
          <div style={{ marginBottom: 10 }} className="cursor-target">
            <GradientText colors={["#f59e0b", "#fcd34d", "#f97316"]} animationSpeed={10} showBorder={false}>
              <span style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 800, letterSpacing: 2 }}>✨ Meet Our Team ✨</span>
            </GradientText>
          </div>
          {/* NEW: Team intro line */}
          <p style={{ color: "var(--t45)", fontSize: "0.95rem", marginBottom: 32, maxWidth: 540, margin: "0 auto 32px" }}>
            A multidisciplinary team of engineers building MedTech infrastructure from the ground up.
          </p>
          <div className="iv-team-grid">
            {TEAM.map(m => (
              <div key={m.name} className="cursor-target">
                <TeamCard m={m} />
              </div>
            ))}
          </div>
        </section>

        {/* ═══ NEW: IMPACT PUNCH BANNER ═══ */}
        <div style={{ width: "100%", marginTop: 80 }}>
          <ImpactBanner onPartner={handlePartner} />
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{ margin: "48px 0 22px", display: "flex", justifyContent: "center", alignItems: "center", padding: "0 20px", textAlign: "center" }} className="cursor-target">
          <ShinyText text="✨ Together We Achieve More ✨" speed={2.5} color="rgba(255,255,255,0.35)" shineColor="#ffffff" spread={130} direction="left" />
        </div>

        {/* ═══ EXPLORE ═══ */}
        <div style={{ marginBottom: 56, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px" }}>
          <ExploreButton onClick={() => { logEvent("cta_explore_click", Date.now(), "footer"); navigate("/ExplorePage"); }}>
            Explore Our Contribution towards NexVitals
          </ExploreButton>
        </div>

      </div>

      {/* ═══ CHAT SIDEBAR ═══ */}
      <Chat open={chat} onClose={() => setChat(false)} />
    </div>
  );
}