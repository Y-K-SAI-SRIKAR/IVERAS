import React, { useState, useEffect } from "react";
import CyberCard from "../components/CyberCard";

const UserDashboard = () => {
  const [showPanicOptions, setShowPanicOptions] = useState(false);
  const [location, setLocation] = useState({ lat: null, lon: null });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
    });
  }, []);

  /* ---------- ACTIONS ---------- */

  const nearbyPassengers = () => {
    alert("Nearby Passengers:\nRahul - 9876543210\nPriya - 9123456780");
  };

  const engineHelp = () => {
    alert("Nearest Mechanic: 9000012345");
  };

  const tyreHelp = () => {
    alert("Nearest Tyre Shop: 9888888888");
  };

  const medicalEmergency = () => {
    alert("Medical Emergency Alert Sent");
  };

  const womenRescue = () => {
    alert("Women Rescue Alert Sent");
  };

  const reportAccident = () => {
    alert("Accident Report Sent Successfully");
  };

  return (
    <div style={wrapper}>
      <h1 style={{ textAlign: "center" }}>USER DASHBOARD</h1>

      <div style={grid}>
        {/* ID CARD */}
        <section style={cardCenter}>
          <CyberCard />
        </section>

        {/* GPS */}
        <section style={card}>
          <h2>Live GPS Location</h2>

          {location.lat && (
            <iframe
              title="map"
              width="100%"
              height="250px"
              style={{ border: 0, borderRadius: "10px" }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lon}%2C${location.lat}%2C${location.lon}%2C${location.lat}&layer=mapnik`}
            />
          )}
        </section>

        {/* FUEL HELP */}
        <section style={card}>
          <h2>Fuel Help</h2>
          <button style={btn} onClick={nearbyPassengers}>
            Find Nearby Passengers
          </button>
        </section>

        {/* MECHANICAL HELP */}
        <section style={card}>
          <h2>Mechanical Help</h2>

          <button style={btn} onClick={engineHelp}>
            Engine Issue
          </button>

          <button style={btn} onClick={tyreHelp}>
            Tyre Issue
          </button>
        </section>

        {/* PANIC SYSTEM */}
        <section style={card}>
          <h2>Panic System</h2>

          <button
            style={btn}
            onClick={() => setShowPanicOptions(!showPanicOptions)}
          >
            Open Panic Options
          </button>

          {showPanicOptions && (
            <div>
              <button style={panicBtn} onClick={medicalEmergency}>
                Medical Emergency
              </button>

              <button style={panicBtn} onClick={womenRescue}>
                Women Rescue
              </button>
            </div>
          )}
        </section>

        {/* REPORT ACCIDENT BOX (NEW SEPARATE CARD) */}
        <section style={card}>
          <h2>Report Accident</h2>

          <button style={panicBtn} onClick={reportAccident}>
            Report Accident
          </button>
        </section>
      </div>
    </div>
  );
};

/* ---------- STYLES ---------- */

const wrapper = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#1a0033,#3a0070,#120024)",
  color: "#fff",
  padding: "20px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};

const card = {
  background: "#111",
  padding: "20px",
  borderRadius: "15px",
  textAlign: "center",
};

const cardCenter = {
  ...card,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const btn = {
  padding: "12px 25px",
  marginTop: "10px",
  borderRadius: "30px",
  border: "none",
  background: "linear-gradient(90deg,#5227FF,#FF9FFC)",
  color: "#fff",
  cursor: "pointer",
};

const panicBtn = {
  padding: "12px 25px",
  marginTop: "10px",
  borderRadius: "30px",
  border: "none",
  background: "linear-gradient(90deg,#FF3C3C,#FF8A00)",
  color: "#fff",
  cursor: "pointer",
};

export default UserDashboard;
