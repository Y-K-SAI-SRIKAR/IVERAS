import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import './Srikar.css';

const springValues = { damping: 30, stiffness: 100, mass: 2 };

const member = {
  initial: 'S',
  name: 'Yerraguntla Kameswara Sai Srikar',
  role: 'Co-Founder – Automation, Cloud & AI',
  tags: ['Cloud & AWS', 'AI Agents', 'Automation'],
  accent: '#34D399',
  accentDim: 'rgba(52,211,153,0.10)',
  accentBorder: 'rgba(52,211,153,0.30)',
};

export default function Srikar({
  captionText = member.name,
  containerHeight = '300px',
  containerWidth = '240px',
  imageHeight = '300px',
  imageWidth = '260px',
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = false,
  showTooltip = true,
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });
  const [lastY, setLastY] = useState(0);

  function handleMouse(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    rotateFigcaption.set(-(offsetY - lastY) * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() { scale.set(scaleOnHover); opacity.set(1); }
  function handleMouseLeave() {
    opacity.set(0); scale.set(1);
    rotateX.set(0); rotateY.set(0); rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={ref}
      className="tilted-card-figure"
      style={{ height: containerHeight, width: containerWidth }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="tilted-card-mobile-alert">This effect is not optimized for mobile.</div>
      )}
      <motion.div
        className="tilted-card-inner"
        style={{ width: imageWidth, height: imageHeight, rotateX, rotateY, scale }}
      >
        <div className="tcard-face" style={{ '--accent': member.accent, '--accent-dim': member.accentDim, '--accent-border': member.accentBorder, width: imageWidth, height: imageHeight }}>
          <div className="tcard-glow" />
          <div className="tcard-circle">
            <span className="tcard-initial">{member.initial}</span>
          </div>
          <div className="tcard-name">{member.name}</div>
          <div className="tcard-role">{member.role}</div>
          <div className="tcard-divider" />
          <div className="tcard-tags">
            {member.tags.map(t => <span key={t} className="tcard-tag">{t}</span>)}
          </div>
        </div>
      </motion.div>
      {showTooltip && (
        <motion.figcaption className="tilted-card-caption" style={{ x, y, opacity, rotate: rotateFigcaption }}>
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}