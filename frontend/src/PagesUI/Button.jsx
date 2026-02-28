// Button.jsx
import React from 'react';
import styled from 'styled-components';

const Button = ({ children, onClick }) => {
  return (
    <StyledWrapper>
      <button className="pill-btn" onClick={onClick}>
        <span className="box">{children}</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .pill-btn {
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    outline: none;
  }

  .box {
    min-width: 140px;
    height: 40px;
    padding: 0 26px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    transition:
      background 0.3s ease,
      transform 0.15s ease,
      box-shadow 0.15s ease;
    background: rgba(10, 10, 20, 0.85);
    color: #ffffff;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
  }

  .box:before,
  .box:after {
    position: absolute;
    content: '';
    inset: 0;
    border-radius: inherit;
    box-sizing: border-box;
    pointer-events: none;
  }

  .box:before {
    border: 1px solid rgba(180, 120, 255, 0);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s ease, border-color 0.35s ease;
  }

  .box:after {
    border: 1px solid rgba(180, 120, 255, 0.9);
    opacity: 0;
    box-shadow: 0 0 18px rgba(180, 120, 255, 0.6);
    transition: opacity 0.35s ease, box-shadow 0.35s ease;
  }

  .box:hover {
    background: rgba(40, 15, 90, 0.95);
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.6);
  }

  .box:hover:before {
    border-color: rgba(180, 120, 255, 0.9);
    transform: scaleX(1);
  }

  .box:hover:after {
    opacity: 1;
  }

  .pill-btn:active .box {
    transform: translateY(0) scale(0.96);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    transition-duration: 0.08s;
  }
`;

export default Button;
