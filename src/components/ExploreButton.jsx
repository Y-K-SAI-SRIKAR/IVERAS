import React from 'react';
import styled from 'styled-components';

const ExploreButton = ({ children = 'Explore OUR Work', ...props }) => {
  return (
    <StyledWrapper>
      <button {...props}>
        {children}

        <span className="star star-1"><Star /></span>
        <span className="star star-2"><Star /></span>
        <span className="star star-3"><Star /></span>
        <span className="star star-4"><Star /></span>
        <span className="star star-5"><Star /></span>
        <span className="star star-6"><Star /></span>
      </button>
    </StyledWrapper>
  );
};

const Star = () => (
  <svg className="star-svg" viewBox="0 0 784.11 815.53" aria-hidden>
    <path d="M392.05 0c-20.9 210.08-184.06 378.41-392.05 407.78
      207.96 29.37 371.12 197.68 392.05 407.74
      20.93-210.06 184.09-378.37 392.05-407.74
      -207.98-29.38-371.16-197.69-392.06-407.78z" />
  </svg>
);

const StyledWrapper = styled.div`
  button {
    position: relative;
    padding: 12px 36px;
    background: #fec195;
    color: #181818;
    border: 3px solid #fec195;
    border-radius: 8px;
    font-size: 17px;
    font-weight: 500;
    cursor: pointer;
    isolation: isolate;
    transition:
      transform 0.12s ease,
      box-shadow 0.12s ease,
      background 0.3s ease,
      color 0.3s ease;
  }

  /* ===== STAR BASE ===== */
  .star {
    position: absolute;
    opacity: 0;
    transform: scale(0.4);
    pointer-events: none;
    z-index: -5;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease,
      top 0.5s cubic-bezier(0.2, 0.8, 0.3, 1),
      left 0.5s cubic-bezier(0.2, 0.8, 0.3, 1);
  }

  .star-svg {
    width: 10px;
    height: 10px;
    fill: #fffdef;
    filter: drop-shadow(0 0 6px #fffdef);
  }

  .star-1 { top: 45%; left: 35%; }
  .star-2 { top: 50%; left: 50%; }
  .star-3 { top: 45%; left: 45%; }
  .star-4 { top: 35%; left: 55%; }
  .star-5 { top: 55%; left: 60%; }
  .star-6 { top: 35%; left: 48%; }

  /* ===== HOVER ===== */
  button:hover {
    background: transparent;
    color: #fec195;
    box-shadow: 0 0 25px #fec1958c;
  }

  button:hover .star {
    opacity: 1;
    transform: scale(1);
    z-index: 2;
  }

  button:hover .star-1 { top: -60%; left: -20%; }
  button:hover .star-2 { top: -15%; left: 10%; }
  button:hover .star-3 { top: 55%;  left: 25%; }
  button:hover .star-4 { top: 25%;  left: 85%; }
  button:hover .star-5 { top: 30%;  left: 115%; }
  button:hover .star-6 { top: 5%;   left: 60%; }

  /* ===== CLICK / PRESS EFFECT ===== */
  button:active {
    transform: scale(0.96);
    box-shadow:
      inset 0 4px 8px rgba(0,0,0,0.25),
      0 0 35px rgba(254,193,149,0.9);
  }

  /* STAR BURST ON CLICK */
  button:active .star {
    transform: scale(1.4);
    transition-duration: 0.12s;
  }
`;

export default ExploreButton;
