// UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Silk from '../PagesUI/Silk.jsx';
import LogoutButton from '../PagesUI/LogoutButton.jsx';
import BlurText from '../PagesUI/BlurText.jsx';
import MagicBento from '../PagesUI/MagicBento.jsx';
import SparkleButton from '../components/SparkleButton.jsx';

const UserDashboard = () => {
  const navigate = useNavigate();

  const [showPanicOptions, setShowPanicOptions] = useState(false);
  const [location, setLocation] = useState({ lat: null, lon: null });

  const [showAccidentBox, setShowAccidentBox] = useState(false);
  const [accidentImage, setAccidentImage] = useState(null);
  const [canSubmitAccident, setCanSubmitAccident] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => console.error('Error getting location:', err)
    );
  }, []);

  const nearbyPassengers = () => {
    alert('Nearby Passengers:\nRahul - 9876543210\nPriya - 9123456780');
  };
  const engineHelp = () => alert('Nearest Mechanic: 9000012345');
  const tyreHelp = () => alert('Nearest Tyre Shop: 9888888888');
  const medicalEmergency = () => alert('Medical Emergency Alert Sent');
  const womenRescue = () => alert('Women Rescue Alert Sent');

  const reportAccident = () => {
    setShowAccidentBox(true);
    setAccidentImage(null);
    setCanSubmitAccident(false);

    setTimeout(() => {
      const el = document.getElementById('accident-report-box');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleAccidentImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setAccidentImage(null);
      setCanSubmitAccident(false);
      return;
    }
    setAccidentImage(file);
    setCanSubmitAccident(true);
  };

  const handleAccidentSubmit = () => {
    if (!accidentImage) return;
    alert('Accident reported successfully !');
    setAccidentImage(null);
    setCanSubmitAccident(false);
    setShowAccidentBox(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        fontFamily: '"Poppins", sans-serif',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Silk background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <Silk
          speed={5}
          scale={1}
          color="#7B7481"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      {/* Scrollable foreground area */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '20px 20px 0 20px',
            textAlign: 'center',
            boxSizing: 'border-box',
            width: '100%',
            minHeight: 'fit-content',
          }}
        >
          {/* Logout */}
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 10,
            }}
          >
            <LogoutButton onClick={handleLogout} />
          </div>

          {/* Heading */}
          <div
            style={{
              marginTop: '60px',
              fontSize: '2.5rem',
              fontWeight: 800,
            }}
          >
            <BlurText
              text="WELCOME TO IVERAS , USER !"
              delay={200}
              animateBy="letters"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
            />
          </div>

          {/* MagicBento */}
          <div
            style={{
              marginTop: '40px',
              width: '90%',
              maxWidth: '1200px',
            }}
          >
            <MagicBento
              textAutoHide={true}
              enableStars
              enableSpotlight
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={true}
              clickEffect
              spotlightRadius={400}
              particleCount={12}
              glowColor="132, 0, 255"
              disableAnimations={false}
              featureHandlers={{
                nearbyPassengers,
                engineHelp,
                tyreHelp,
                medicalEmergency,
                womenRescue,
                reportAccident,
                showPanicOptions,
                setShowPanicOptions,
                location,
              }}
            />
          </div>

          {/* Slim accident bento */}
          {showAccidentBox && (
            <div
              id="accident-report-box"
              style={{
                marginTop: '16px',
                width: '90%',
                maxWidth: '1200px',
              }}
            >
              <div
                className="magic-bento-card magic-bento-card--border-glow"
                style={{
                  backgroundColor: '#060010',
                  '--glow-color': '132, 0, 255',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  aspectRatio: 'unset',
                  minHeight: '120px',
                  padding: '0.75em 1.25em',
                }}
              >
                <div
                  className="magic-bento-card__header"
                  style={{ width: '100%' }}
                >
                  <div className="magic-bento-card__label">
                    ACCIDENT REPORT
                  </div>
                </div>

                <div
                  className="magic-bento-card__content"
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '0.35rem',
                      flex: 1,
                    }}
                  >
                    <h2 className="magic-bento-card__title">
                      Upload accident image and submit report
                    </h2>

                    <label
                      style={{
                        fontSize: '0.8rem',
                        opacity: 0.9,
                        textAlign: 'left',
                      }}
                    >
                      Attach accident photo (jpg / png):
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAccidentImageChange}
                      style={{
                        fontSize: '0.75rem',
                        color: '#ffffff',
                        background: 'transparent',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        border: '1px solid rgba(180, 120, 255, 0.4)',
                        maxWidth: '260px',
                      }}
                    />

                    {accidentImage && (
                      <p
                        style={{
                          fontSize: '0.7rem',
                          opacity: 0.85,
                          margin: 0,
                        }}
                      >
                        Selected: {accidentImage.name}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.4rem',
                    }}
                  >
                    <button
                      className="pill-btn"
                      onClick={handleAccidentSubmit}
                      disabled={!canSubmitAccident}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        cursor: canSubmitAccident ? 'pointer' : 'not-allowed',
                        outline: 'none',
                      }}
                    >
                      <span
                        className="box"
                        style={{
                          minWidth: '170px',
                          height: '36px',
                          padding: '0 22px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          letterSpacing: '0.08em',
                          background: canSubmitAccident
                            ? 'rgba(40, 15, 90, 0.95)'
                            : 'rgba(40, 15, 90, 0.45)',
                          color: '#ffffff',
                          border: '1px solid rgba(180, 120, 255, 0.7)',
                        }}
                      >
                        REPORT ACCIDENT
                      </span>
                    </button>

                    <button
                      className="pill-btn"
                      onClick={() => {
                        setShowAccidentBox(false);
                        setAccidentImage(null);
                        setCanSubmitAccident(false);
                      }}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        outline: 'none',
                        marginTop: '4px',
                      }}
                    >
                      <span
                        className="box"
                        style={{
                          minWidth: '110px',
                          height: '30px',
                          padding: '0 18px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                          fontSize: '0.65rem',
                          letterSpacing: '0.08em',
                          background: 'rgba(20, 20, 30, 0.9)',
                          color: '#ffffff',
                          border: '1px solid rgba(180, 120, 255, 0.5)',
                        }}
                      >
                        CLOSE
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* "Having Trouble..?" text */}
          <div
            style={{
              marginTop: '8px',
              marginBottom: '4px',
              fontSize: '1rem',
              fontWeight: 500,
              opacity: 0.85,
              letterSpacing: '0.05em',
            }}
          >
            Having Trouble..?
          </div>

          {/* SparkleButton */}
          <div
            style={{
              marginTop: '8px',
              marginBottom: '0px',
            }}
          >
            <SparkleButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
