import React from 'react';
import styled from 'styled-components';
import './GetStarted.css';

const GetStarted = ({ onClick }) => {
  const handleMouseDown = (e) => {
    e.currentTarget.classList.add('button-active');
  };

  const handleMouseUp = (e) => {
    e.currentTarget.classList.remove('button-active');
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.classList.remove('button-active');
  };

  return (
    <StyledWrapper>
      <button
        className="button"
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        ⚡BE PART OF VISION
        <span className="button-span"> ─ SAVE LIVES⚡</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    position: relative;
    padding: 15px 24px;
    border: none;
    outline: none;
    background: #151515;
    color: #eee;
    border-radius: 999px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease-out;
    overflow: hidden;
  }

  /* glossy violet gradient edge */
  .button::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(135deg, #a855ff, #c4b5fd, #7c3aed);
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.95;
    pointer-events: none;
  }

  /* subtle inner glossy highlight */
  .button::after {
    content: '';
    position: absolute;
    inset: 2px 4px 50% 4px;
    border-radius: 999px 999px 40px 40px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.35),
      rgba(255, 255, 255, 0.05),
      transparent
    );
    opacity: 0.7;
    pointer-events: none;
  }

  .button:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 18px rgba(168, 85, 255, 0.6);
  }

  /* CLICK / ACTIVE ANIMATION */
  .button.button-active {
    transform: translateY(1px) scale(0.97);
    box-shadow: 0 0 10px rgba(124, 58, 237, 0.7);
  }

  .button-span {
    color: #aaa;
    margin-left: 4px;
    font-weight: 500;
  }
`;

export default GetStarted;
