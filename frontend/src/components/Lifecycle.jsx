import React, { useEffect, useState, useRef } from 'react';
import './Lifecycle.css';

const steps = [
  {
    id: 1,
    title: "CRITICAL EVENT DETECTED",
    tag: "VICTIM INTERFACE",
    desc: "Hardware sensors detect high-G impact or user triggers a Silent SOS. Live biometrics (SpO₂, HR) and exact GPS coordinates are instantly locked and streamed.",
    icon: "🚨",
    accent: "#60A5FA",
    accentDim: 'rgba(96,165,250,0.07)',
    accentBorder: 'rgba(96,165,250,0.30)',
    side: "left"
  },
  {
    id: 2,
    title: "AI ACCIDENT ASSESSMENT",
    tag: "INTELLIGENT CORE",
    desc: "AccidentDetectionModel intercepts the report, scoring severity in milliseconds. High-risk events are classified as CRITICAL with 94% confidence, auto-triggering the response chain.",
    icon: "🧠",
    accent: "#FFD700",
    accentDim: 'rgba(255,215,0,0.07)',
    accentBorder: 'rgba(255,215,0,0.30)',
    side: "right"
  },
  {
    id: 3,
    title: "SMART DISPATCH & ROUTING",
    tag: "RESPONDER HUB",
    desc: "The nearest active ambulance receives the mission. The victim's full medical profile pre-loads while the Smart Navigation Engine plots the fastest route to the scene.",
    icon: "🚑",
    accent: "#34D399",
    accentDim: 'rgba(52,211,153,0.07)',
    accentBorder: 'rgba(52,211,153,0.30)',
    side: "left"
  },
  {
    id: 4,
    title: "HOSPITAL PRE-ARRIVAL",
    tag: "MEDICAL HUB",
    desc: "SEWS streams continuous vitals to the ER dashboard in transit. Hospital AI auto-assigns beds and specialists, ensuring the trauma team is ready before the ambulance stops rolling.",
    icon: "🏥",
    accent: "#F472B6",
    accentDim: 'rgba(244,114,182,0.07)',
    accentBorder: 'rgba(244,114,182,0.30)',
    side: "right"
  },
  {
    id: 5,
    title: "CARE & RECOVERY",
    tag: "PATIENT PORTAL",
    desc: "Records are securely linked to a unique MRN. Patients and their families gain full transparency over diagnoses, ready reports, billing, and real-time discharge status.",
    icon: "❤️",
    accent: "#A78BFA",
    accentDim: 'rgba(167,139,250,0.07)',
    accentBorder: 'rgba(167,139,250,0.30)',
    side: "left"
  }
];

const Lifecycle = () => {
  const containerRef = useRef(null);
  const [progressHeight, setProgressHeight] = useState(0);
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    // 1. Smooth Progress Line Calculator
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far we've scrolled through the container
      const scrollPosition = windowHeight / 2 - rect.top;
      const totalHeight = rect.height;

      let percentage = (scrollPosition / totalHeight) * 100;
      percentage = Math.max(0, Math.min(percentage, 100)); // Clamp between 0 and 100

      setProgressHeight(percentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 2. Intersection Observer for Smooth Fade-Ins
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.dataset.id);
            setVisibleItems((prev) => [...new Set([...prev, id])]);
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -100px 0px" } // Triggers slightly before middle of screen
    );

    const rows = document.querySelectorAll('.iv-timeline-row');
    rows.forEach((row) => observer.observe(row));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <section className="lifecycle-section" ref={containerRef}>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '100px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '5px', padding: '4px 16px', marginBottom: '18px' }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '3.5px', fontWeight: 700, color: '#FFD700', fontFamily: '"Courier New", monospace' }}>
            SYSTEM LIFECYCLE
          </span>
        </div>
        <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(2rem, 5vw, 2.6rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px', lineHeight: 1.15, fontFamily: '"Poppins", sans-serif' }}>
          The Anatomy of a <span style={{ background: 'linear-gradient(90deg,#FFD700,#FFF4B5,#FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Rescue</span>
        </h2>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', maxWidth: '540px', marginInline: 'auto', lineHeight: 1.65 }}>
          How NexVitals transforms a moment of crisis into a synchronized, AI-driven chain of survival in seconds.
        </p>
      </div>

      {/* TIMELINE */}
      <div className="iv-timeline-container">

        {/* The Vertical Lines */}
        <div className="iv-timeline-line-bg" />
        <div
          className="iv-timeline-line-progress"
          style={{ height: `${progressHeight}%` }}
        />

        {steps.map((step) => {
          const isVisible = visibleItems.includes(step.id);

          return (
            <div
              key={step.id}
              data-id={step.id}
              className={`iv-timeline-row ${step.side} ${isVisible ? 'visible' : ''}`}
            >

              {/* THE CARD */}
              <div className="iv-timeline-card" style={{
                /* Added a solid #0a0a0a base underneath the transparent color wash */
                background: isVisible
                  ? `linear-gradient(${step.accentDim}, ${step.accentDim}), #0a0a0a`
                  : `linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0.02)), #0a0a0a`,
                borderColor: isVisible ? step.accentBorder : 'rgba(255,255,255,0.08)',
                boxShadow: isVisible ? `0 20px 40px rgba(0,0,0,0.8)` : 'none',
              }}>

                {/* HUD Targeting Brackets */}
                <div style={{ position: 'absolute', top: 16, left: 16, width: 16, height: 16, borderTop: '2px solid rgba(255,255,255,0.15)', borderLeft: '2px solid rgba(255,255,255,0.15)' }} />
                <div style={{ position: 'absolute', top: 16, right: 16, width: 16, height: 16, borderTop: '2px solid rgba(255,255,255,0.15)', borderRight: '2px solid rgba(255,255,255,0.15)' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16, width: 16, height: 16, borderBottom: '2px solid rgba(255,255,255,0.15)', borderLeft: '2px solid rgba(255,255,255,0.15)' }} />
                <div style={{ position: 'absolute', bottom: 16, right: 16, width: 16, height: 16, borderBottom: '2px solid rgba(255,255,255,0.15)', borderRight: '2px solid rgba(255,255,255,0.15)' }} />

                {/* Background Glow */}
                <div className="iv-timeline-glow" style={{
                  [step.side === 'left' ? 'right' : 'left']: 0,
                  background: `radial-gradient(circle at ${step.side === 'left' ? 'top right' : 'top left'}, ${step.accentDim}, transparent 70%)`
                }} />

                {/* Tag */}
                <div className="iv-timeline-tag" style={{
                  background: step.accent + '18',
                  borderColor: step.accentBorder
                }}>
                  <div className="iv-timeline-tag-dot" style={{ background: step.accent, boxShadow: `0 0 6px ${step.accent}` }} />
                  <span style={{ color: step.accent }}>{step.tag}</span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>

              {/* THE ICON (Now cleanly separated from the card) */}
              <div
                className={`iv-timeline-icon ${isVisible ? 'active' : ''}`}
                style={{
                  borderColor: isVisible ? step.accent : 'rgba(255,255,255,0.1)',
                  boxShadow: isVisible ? `0 0 20px ${step.accent}66` : 'none',
                  color: isVisible ? step.accent : '#888'
                }}
              >
                {step.icon}
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Lifecycle;