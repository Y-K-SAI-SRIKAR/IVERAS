import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import Silk from '../PagesUI/Silk.jsx';
import BlurText from '../PagesUI/BlurText.jsx';
import CurvedLoop from '../PagesUI/CurvedLoop.jsx';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password });

    if (username && password) {
      console.log('Login successful, navigating to dashboard');
      navigate('/dashboard');
    } else {
      alert('Please enter username and password');
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleBlurTextComplete = () => {
    console.log('Login blur text animation completed!');
  };

  return (
    <div className="login-page-root">
      {/* FULLSCREEN SILK BACKGROUND */}
      <div className="login-silk-bg">
        <Silk
          speed={5}
          scale={1}
          color="#6825cc"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      {/* FOREGROUND CONTENT */}
      <div className="login-page">
        <div className="login-content">
          {/* BlurText ABOVE the login card */}
          <div className="login-blurtext-wrapper">
            <BlurText
              text="Good To See YOU Again Amigo ! "
              delay={225}
              animateBy="letters"
              direction="top"
              onAnimationComplete={handleBlurTextComplete}
              className="login-blurtext"
            />
          </div>

          {/* CARD + CURVED LOOP grouped together */}
          <div className="login-card-block">
            <div className="form-wrapper">
              <form className="form" onSubmit={handleLogin}>
                <p id="heading">ACCESS IVERAS</p>

                <div className="field">
                  <svg
                    className="input-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643z" />
                  </svg>

                  <input
                    type="text"
                    className="input-field"
                    placeholder="Username"
                    autoComplete="off"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="field">
                  <svg
                    className="input-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  </svg>

                  <input
                    type="password"
                    className="input-field"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="btn">
                  <button type="submit" className="button1">
                    ACCESS
                  </button>
                </div>

                <button
                  type="button"
                  className="button3"
                  onClick={handleForgotPassword}
                >
                  Forgot Password
                </button>
              </form>
            </div>

            {/* CURVED LOOP RIGHT UNDER CARD */}
            <div className="login-curvedloop-wrapper">
              <CurvedLoop
                marqueeText="TEAM ✦ PADMA ✦ VYUHA ✦ "
                speed={0.7}
                curveAmount={120}
                direction="right"
                interactive
                className="login-curvedloop-text"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
