import React, { useEffect, useState, useRef } from 'react';
import './Lifecycle.css';

const steps = [
  { 
    id: 1,
    title: "IMPACT DETECTED", 
    desc: "MPU-6050 sensors detect high-G collision (>3G). System runs rapid false-positive verification.", 
    icon: "💥", 
    side: "left" 
  },
  { 
    id: 2,
    title: "CLOUD SIGNAL", 
    desc: "GPS coordinates & severity data uploaded to MongoDB via SIM800L GPRS in < 2 seconds.", 
    icon: "📡", 
    side: "right" 
  },
  { 
    id: 3,
    title: "SMART DISPATCH", 
    desc: "Node B (Ambulance) receives mission. AI calculates OSRM path avoiding traffic.", 
    icon: "🚑", 
    side: "left" 
  },
  { 
    id: 4,
    title: "HOSPITAL ARRIVAL", 
    desc: "Autonomous navigation completes. Trauma center notified. Golden Hour secured.", 
    icon: "🏥", 
    side: "right" 
  }
];

const Lifecycle = () => {
  const containerRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [visibleItems, setVisibleItems] = useState([]);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const start = windowHeight * 0.5;
      const progress = start - rect.top;
      const total = rect.height - start;

      let percentage = (progress / total) * 100;
      percentage = Math.min(Math.max(percentage, 0), 100);

      setLineHeight(percentage);

      const newVisible = steps
        .filter((_, index) => percentage >= (index / steps.length) * 100 + 5)
        .map(step => step.id);

      setVisibleItems(newVisible);
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          updateScroll();
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="lifecycle-section" ref={containerRef}>
      <h2 className="lifecycle-title">
        THE <span className="highlight">IVERAS</span> CYCLE
      </h2>

      <div className="timeline-container">
        <div className="center-line-bg" />
        <div
          className="center-line-progress"
          style={{ height: `${lineHeight}%` }}
        />

        {steps.map(step => (
          <div
            key={step.id}
            className={`timeline-item ${step.side} ${
              visibleItems.includes(step.id) ? 'visible' : ''
            }`}
          >
            {/* ICON — cursor enabled */}
            <div
              className={`timeline-icon cursor-target ${
                visibleItems.includes(step.id) ? 'active' : ''
              }`}
            >
              {step.icon}
            </div>

            {/* CONTENT — cursor enabled */}
            <div className="timeline-content cursor-target">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Lifecycle;
