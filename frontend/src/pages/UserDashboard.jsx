import React, { useEffect, useState } from "react";
import Silk from "../PagesUI/Silk.jsx";
import BlurText from "../PagesUI/BlurText.jsx";

const UserDashboard = () => {
  const [location, setLocation] = useState(null);

  /* ================= LOCATION ================= */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
    });
  }, []);

  const showAlert = (msg) => {
    alert(msg);
  };

  return (
    <div style={container}>

      {/* ===== SILK BACKGROUND ===== */}
      <div style={bgWrap}>
        <Silk speed={5} scale={1} color="#7B7481" noiseIntensity={1.5} />
      </div>

      {/* ===== CONTENT ===== */}
      <div style={contentWrap}>

        {/* ===== CENTERED HEADER ===== */}
        <div style={headerWrap}>
          <div style={headerText}>
            <BlurText
              text="WELCOME TO IVERAS - USER DASHBOARD"
              delay={200}
              animateBy="letters"
              direction="top"
            />
          </div>
        </div>

        {/* ===== TOP GRID ===== */}
        <div style={topGrid}>

          {/* USER ID CARD */}
          <div style={cardLarge}>
            <h4>IVERAS ID CARD</h4>
            <p style={sub}>USER DETAILS</p>

            <div style={idCard}>
              <h3>RAVI KUMAR</h3>
              <p>User ID: IVE90876</p>
              <p>Vehicle No: TS07GH4589</p>
              <p>Blood Group: B+</p>
              <p>Contact: 9876543210</p>
            </div>
          </div>

          {/* LOCATION */}
          <div style={cardLocation}>
            <h4>LIVE LOCATION</h4>
            <p style={sub}>CURRENT LOCATION 📍</p>

            {location ? (
              <iframe
                title="map"
                width="100%"
                height="250"
                style={{ borderRadius: "15px", marginTop: "15px" }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lon}%2C${location.lat}%2C${location.lon}%2C${location.lat}&layer=mapnik`}
              />
            ) : (
              <p style={{ marginTop: "50px" }}>
                Fetching your location...
              </p>
            )}
          </div>
        </div>

        {/* ===== BOTTOM GRID ===== */}
        <div style={bottomGrid}>

          {/* Fuel */}
          <div style={cardSmall}>
            <h4>REQUEST FUEL</h4>
            <button
              className="btn"
              onClick={() => showAlert("Nearest Fuel Driver: 9000012345")}
            >
              FUEL HELP
            </button>
          </div>

          {/* Road Support */}
          <div style={cardSmall}>
            <h4>ROAD SUPPORT</h4>
            <button
              className="btn block"
              onClick={() => showAlert("Nearest Mechanic: 9000012345")}
            >
              ENGINE ISSUE
            </button>
            <button
              className="btn block"
              onClick={() => showAlert("Nearest Tyre Repair: 9000012345")}
            >
              TYRE ISSUE
            </button>
          </div>

          {/* Panic */}
          <div style={cardSmall}>
            <h4>PANIC BUTTON</h4>
            <button
              className="btn block"
              onClick={() => showAlert("Emergency Alert Sent!")}
            >
              OPEN PANIC
            </button>
          </div>

          {/* Emergency */}
          <div style={cardSmall}>
            <h4>MEDICAL & WOMEN EMERGENCY</h4>
            <button
              className="btn block"
              onClick={() => showAlert("Medical Emergency Request Sent")}
            >
              MEDICAL EMERGENCY
            </button>
            <button
              className="btn block"
              onClick={() => showAlert("Women Rescue Request Sent")}
            >
              WOMEN RESCUE
            </button>
          </div>
        </div>
      </div>

      {/* Button CSS */}
      <style>
        {`
        .btn {
          background: black;
          color: white;
          padding: 8px 16px;
          border-radius: 25px;
          border: 1px solid rgba(160,120,255,0.5);
          cursor: pointer;
          margin-top: 12px;
          transition: 0.3s;
        }

        .btn:hover {
          box-shadow: 0 0 15px rgba(160,120,255,0.9);
          background: linear-gradient(90deg,#5a189a,#9d4edd);
        }

        .block {
          display: block;
          width: 80%;
          margin: 10px auto;
        }
        `}
      </style>

    </div>
  );
};

/* ================= STYLES ================= */

const container = {
  minHeight: "100vh",
  position: "relative",
  fontFamily: "Poppins",
  color: "white",
};

const bgWrap = {
  position: "fixed",
  inset: 0,
  zIndex: 0,
};

const contentWrap = {
  position: "relative",
  zIndex: 2,
  padding: "40px",
};

/* ✅ NEW: Perfect Center Header */
const headerWrap = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "50px",
  textAlign: "center",
};

const headerText = {
  fontSize: "3rem",
  fontWeight: 900,
  letterSpacing: "3px",
  textAlign: "center",
};

const topGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "30px",
  marginBottom: "40px",
};

const bottomGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "25px",
};

const cardSmall = {
  background: "rgba(0,0,0,0.7)",
  padding: "20px",
  borderRadius: "20px",
  textAlign: "center",
  backdropFilter: "blur(12px)",
};

const cardLarge = {
  background: "rgba(0,0,0,0.7)",
  padding: "25px",
  borderRadius: "20px",
  backdropFilter: "blur(12px)",
};

const cardLocation = {
  background: "rgba(0,0,0,0.7)",
  padding: "25px",
  borderRadius: "20px",
  backdropFilter: "blur(12px)",
};

const idCard = {
  marginTop: "20px",
  padding: "20px",
  borderRadius: "15px",
  background: "linear-gradient(135deg, #1a0033, #3a00aa)",
  textAlign: "center",
};

const sub = {
  fontSize: "12px",
  opacity: 0.7,
};

export default UserDashboard;
