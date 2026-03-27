import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import Silk from '../PagesUI/Silk.jsx';
import BlurText from '../PagesUI/BlurText.jsx';
import CurvedLoop from '../PagesUI/CurvedLoop.jsx';

const G = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

@keyframes pulse-anim {
  0%,100%{ box-shadow:0 0 6px #f59e0b; transform:scale(1); }
  50%    { box-shadow:0 0 22px #f59e0b; transform:scale(1.35); }
}
`;

const ROLES = ["Admin", "Responder", "Hospital", "Patient"];

const LoginPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState("Responder");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [userFocus, setUserFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [forgotHover, setForgotHover] = useState(false);
  const [regHover, setRegHover] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password, role: selectedRole });

    if (!username || !password) {
      setErrorMsg("Identifier and access key are required");
      return;
    }

    console.log('Login successful, navigating to dashboard');
    switch (selectedRole) {
      case "Admin": navigate("/admin-dashboard"); break;
      case "Responder": navigate("/emergency-dashboard"); break;
      case "Hospital": navigate("/hospital-dashboard"); break;
      case "Patient": navigate("/patient-portal"); break;
      default: navigate("/dashboard"); break;
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  return (
    <div className="login-page-root">
      <style>{G}</style>
      <div style={{
        position: "fixed", inset: 0, zIndex: 9000, pointerEvents: "none", opacity: 0.022,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px"
      }} />

      {/* FULLSCREEN SILK BACKGROUND */}
      <div className="login-silk-bg">
        <Silk
          speed={5}
          scale={1}
          color="#f59e0b"
          noiseIntensity={1.2}
          rotation={0}
        />
      </div>

      {/* FOREGROUND CONTENT */}
      <div className="login-page">
        <div className="login-content">
          {/* BlurText ABOVE the login card */}
          <div className="login-blurtext-wrapper">
            <BlurText
              text="Welcome Back, Responder."
              delay={150}
              animateBy="words"
              direction="bottom"
              className="login-blurtext"
            />
          </div>

          {/* CARD + CURVED LOOP grouped together */}
          <div className="login-card-block">
            <div style={{
              background: "rgba(7,7,15,0.92)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "44px 40px",
              backdropFilter: "blur(24px) saturate(160%)",
              boxShadow: "0 0 80px rgba(245,158,11,0.06)",
              width: "100%",
              maxWidth: "420px",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)" }} />

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* LOGO HEADER INSIDE CARD */}
                <div style={{ display: "flex", flexDirection: "column", marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px #f59e0b", animation: "pulse-anim 2s ease-in-out infinite" }} />
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 800, letterSpacing: 4, color: "#f59e0b" }}>NexVitals</div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", letterSpacing: 3, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginTop: 4 }}>Emergency Response Platform</div>
                </div>

                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px", marginBottom: 6 }}>Sign In</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", marginBottom: 28 }}>Access your NexVitals dashboard</div>

                {/* ROLE SELECTOR */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {ROLES.map(r => (
                    <div key={r} onClick={() => setSelectedRole(r)} style={{
                      padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                      border: `1px solid ${selectedRole === r ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)"}`,
                      background: selectedRole === r ? "rgba(245,158,11,0.1)" : "transparent",
                      color: selectedRole === r ? "#f59e0b" : "rgba(255,255,255,0.35)",
                      transition: "all 0.2s ease"
                    }}>{r}</div>
                  ))}
                </div>

                {/* USERNAME FIELD */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.57rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 7, display: "block" }}>Identifier</label>
                  <div style={{ position: "relative" }}>
                    <svg
                      style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}
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
                      onFocus={() => setUserFocus(true)}
                      onBlur={() => setUserFocus(false)}
                      onChange={(e) => { setUsername(e.target.value); setErrorMsg(""); }}
                      style={{
                        width: "100%", height: 48, padding: "0 16px 0 44px", borderRadius: 10,
                        border: `1px solid ${userFocus ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`,
                        background: "rgba(13,13,28,1)", color: "#ffffff", fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem", outline: "none",
                        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                        boxShadow: userFocus ? "0 0 0 3px rgba(245,158,11,0.08)" : "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                {/* PASSWORD FIELD */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.57rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 7, display: "block" }}>Access Key</label>
                  <div style={{ position: "relative" }}>
                    <svg
                      style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input-field"
                      placeholder="Password"
                      value={password}
                      onFocus={() => setPassFocus(true)}
                      onBlur={() => setPassFocus(false)}
                      onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                      style={{
                        width: "100%", height: 48, padding: "0 16px 0 44px", borderRadius: 10,
                        border: `1px solid ${passFocus ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`,
                        background: "rgba(13,13,28,1)", color: "#ffffff", fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem", outline: "none",
                        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                        boxShadow: passFocus ? "0 0 0 3px rgba(245,158,11,0.08)" : "none",
                        boxSizing: "border-box"
                      }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <button type="submit"
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                    style={{
                      width: "100%", height: 50, borderRadius: 12, border: "none",
                      background: "linear-gradient(135deg, #f59e0b, #f97316)",
                      color: "#000000", fontFamily: "'Syne', sans-serif", fontSize: "0.85rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
                      transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
                      boxShadow: btnHover ? "0 0 50px rgba(245,158,11,0.45)" : "0 0 32px rgba(245,158,11,0.25)",
                      transform: btnHover ? "translateY(-2px)" : "none"
                    }}
                  >
                    ACCESS PLATFORM →
                  </button>
                </div>

                {errorMsg && (
                  <div style={{ color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", letterSpacing: 1.5, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    ⚠ {errorMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  onMouseEnter={() => setForgotHover(true)}
                  onMouseLeave={() => setForgotHover(false)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
                    color: forgotHover ? "#f59e0b" : "rgba(255,255,255,0.2)", marginTop: 16, display: "block", textAlign: "center", width: "100%", transition: "color 0.2s ease"
                  }}
                >
                  Forgot Password
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  onMouseEnter={() => setRegHover(true)}
                  onMouseLeave={() => setRegHover(false)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
                    color: regHover ? "#f59e0b" : "rgba(255,255,255,0.15)", marginTop: 8, display: "block", textAlign: "center", width: "100%", transition: "color 0.2s ease"
                  }}
                >
                  New to NexVitals? Request Access →
                </button>

                {/* SECURITY FOOTER INSIDE CARD */}
                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {[{ icon: "🔒", label: "Encrypted" }, { icon: "🛡️", label: "DPDP Compliant" }, { icon: "🚫", label: "Zero Ads" }].map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.5rem", letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.15)" }}>
                      <span style={{ fontSize: "0.6rem", marginTop: -1 }}>{item.icon}</span> {item.label}
                    </div>
                  ))}
                </div>

              </form>
            </div>

            {/* CURVED LOOP RIGHT UNDER CARD */}
            <div className="login-curvedloop-wrapper" style={{ marginTop: 24 }}>
              <CurvedLoop
                marqueeText="NexVitals ✦ EMERGENCY RESPONSE ✦ TEAM PADMA VYUHA ✦ "
                speed={0.5}
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
