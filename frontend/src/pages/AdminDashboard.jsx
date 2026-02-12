// AdminDashboard.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import Silk from '../PagesUI/Silk.jsx';
import LogoutButton from '../PagesUI/LogoutButton.jsx';
import BlurText from '../PagesUI/BlurText.jsx';

/* ================= ICONS ================= */

const ambulanceIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2967/2967350.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1484/1484815.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const accidentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
  iconSize: [35, 35],
  iconAnchor: [18, 35],
});

/* ================= LOCATIONS ================= */

const BASES = [
  { lat: 17.375, lng: 78.47 },
  { lat: 17.39, lng: 78.46 },
  { lat: 17.37, lng: 78.49 },
];

const ACCIDENTS = [
  { lat: 17.382, lng: 78.482 },
  { lat: 17.395, lng: 78.475 },
  { lat: 17.368, lng: 78.488 },
];

const HOSPITALS = [
  { lat: 17.401, lng: 78.49 },
  { lat: 17.388, lng: 78.455 },
  { lat: 17.362, lng: 78.472 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);

  /* ================= AMBULANCES ================= */

  const [ambulances, setAmbulances] = useState([
    {
      id: 1,
      name: 'LifeCare Ambulance',
      driver: 'Ramesh',
      regNo: 'TS09AB1234',
      verified: false,
      status: 'Idle',
      base: BASES[0],
      accident: ACCIDENTS[0],
      hospital: HOSPITALS[0],
      position: BASES[0],
      route: [],
      routeIndex: 0,
      active: false,
      finished: false,
    },
    {
      id: 2,
      name: 'Apollo Emergency',
      driver: 'Suresh',
      regNo: 'TS10XY4567',
      verified: false,
      status: 'Idle',
      base: BASES[1],
      accident: ACCIDENTS[1],
      hospital: HOSPITALS[1],
      position: BASES[1],
      route: [],
      routeIndex: 0,
      active: false,
      finished: false,
    },
    {
      id: 3,
      name: 'MedPlus Rescue',
      driver: 'Kiran',
      regNo: 'TS08PQ8899',
      verified: false,
      status: 'Idle',
      base: BASES[2],
      accident: ACCIDENTS[2],
      hospital: HOSPITALS[2],
      position: BASES[2],
      route: [],
      routeIndex: 0,
      active: false,
      finished: false,
    },
  ]);

  /* ================= MOVEMENT ================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setAmbulances((prev) =>
        prev.map((amb) => {
          if (!amb.active) return amb;

          if (amb.routeIndex >= amb.route.length) {
            return {
              ...amb,
              active: false,
              finished: true,
              status: 'Completed',
            };
          }

          return {
            ...amb,
            position: amb.route[amb.routeIndex],
            routeIndex: amb.routeIndex + 1,
            status: 'On Duty',
          };
        })
      );
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  /* ================= AUTO RESET ================= */

  useEffect(() => {
    ambulances.forEach((amb) => {
      if (amb.finished) {
        setTimeout(() => {
          setAmbulances((prev) =>
            prev.map((a) =>
              a.id === amb.id && a.finished
                ? {
                    ...a,
                    status: 'Idle',
                    finished: false,
                    position: a.base,
                    route: [],
                    routeIndex: 0,
                  }
                : a
            )
          );
        }, 4000);
      }
    });
  }, [ambulances]);

  /* ================= VERIFY ================= */

  const verifyAmbulance = (id) => {
    setAmbulances((prev) =>
      prev.map((amb) =>
        amb.id === id && !amb.verified
          ? {
              ...amb,
              verified: true,
              status: 'Emergency',
              route: [amb.base, amb.accident, amb.hospital],
              routeIndex: 0,
              active: true,
            }
          : amb
      )
    );

    setSelected(null);
  };

  /* ================= REJECT ================= */

  const rejectAmbulance = (id) => {
    setAmbulances((prev) =>
      prev.map((amb) =>
        amb.id === id
          ? { ...amb, status: 'Rejected' }
          : amb
      )
    );

    setSelected(null);
  };

  return (
    <div style={container}>

      {/* BACKGROUND */}
      <div style={bgWrap}>
        <Silk speed={5} scale={1} color="#7B7481" noiseIntensity={1.5} />
      </div>

      {/* LOGOUT */}
      <div style={logoutPos}>
        <LogoutButton onClick={() => navigate('/')} />
      </div>

      {/* HEADER */}
      <div style={header}>
        <div style={headerText}>
          <BlurText
            text="ADMIN CONTROL CENTER"
            delay={200}
            animateBy="letters"
            direction="top"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div style={contentWrap}>

        <div style={grid}>

          {/* LEFT PANEL */}
          <div style={panelLeft}>

            <h3 style={sectionTitle}>Ambulance Management</h3>

            <div style={listScroll}>

              {ambulances.map((amb) => (
                <div key={amb.id} style={card}>

                  <h4>{amb.name}</h4>
                  <p>🚑 {amb.regNo}</p>
                  <p>👨‍✈️ {amb.driver}</p>

                  <p>
                    Status:{' '}
                    <span style={statusColor(amb.status)}>
                      {amb.status}
                    </span>
                  </p>

                  <p>Verified: {amb.verified ? 'Yes' : 'No'}</p>

                  {!amb.verified && (
                    <button
                      style={verifyBtnBase}
                      onClick={() => setSelected(amb)}
                      onMouseEnter={(e) => {
                        e.target.style.background =
                          'linear-gradient(90deg,#5a189a,#9d4edd)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#000';
                      }}
                    >
                      Verify Ambulance
                    </button>
                  )}

                </div>
              ))}

            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={panel}>

            <h3 style={sectionTitle}>Live GPS Tracking</h3>

            <MapContainer
              center={[17.385, 78.48]}
              zoom={13}
              style={mapStyle}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {ambulances.map((amb) => (
                <Marker
                  key={'a' + amb.id}
                  position={[amb.accident.lat, amb.accident.lng]}
                  icon={accidentIcon}
                />
              ))}

              {ambulances.map((amb) => (
                <Marker
                  key={'h' + amb.id}
                  position={[amb.hospital.lat, amb.hospital.lng]}
                  icon={hospitalIcon}
                />
              ))}

              {ambulances.map((amb) => (
                <Marker
                  key={'m' + amb.id}
                  position={[amb.position.lat, amb.position.lng]}
                  icon={ambulanceIcon}
                >
                  <Popup>
                    🚑 {amb.name}<br />
                    {amb.status}
                  </Popup>
                </Marker>
              ))}

              {ambulances.map(
                (amb) =>
                  amb.route.length > 0 && (
                    <Polyline
                      key={'r' + amb.id}
                      positions={amb.route.map((p) => [p.lat, p.lng])}
                      color="violet"
                    />
                  )
              )}

            </MapContainer>

          </div>
        </div>
      </div>

      {/* MODAL */}
      {selected && (
        <div style={modalBg}>

          <div style={modal}>

            <h2>Verify Ambulance</h2>

            <p><b>Name:</b> {selected.name}</p>
            <p><b>Reg:</b> {selected.regNo}</p>
            <p><b>Driver:</b> {selected.driver}</p>

            <div style={btnRow}>

              <button
                style={acceptBtn}
                onClick={() => verifyAmbulance(selected.id)}
              >
                Accept
              </button>

              <button
                style={rejectBtn}
                onClick={() => rejectAmbulance(selected.id)}
              >
                Reject
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/* ================= STYLES ================= */

const container = {
  minHeight: '100vh',
  color: '#fff',
  fontFamily: 'Poppins',
  position: 'relative',
};

const bgWrap = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
};

const logoutPos = {
  position: 'fixed',
  top: 20,
  right: 20,
  zIndex: 50,
};

const header = {
  marginTop: 90,
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
};

const headerText = {
  fontSize: '3.5rem',
  fontWeight: 900,
  letterSpacing: '3px',
};

const contentWrap = {
  position: 'relative',
  zIndex: 2,
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.4fr',
  gap: 25,
  padding: 30,
};

const panel = {
  background: 'rgba(0,0,0,0.7)',
  borderRadius: 20,
  padding: 22,
  backdropFilter: 'blur(12px)',
};

const panelLeft = {
  ...panel,
  height: '600px',
  display: 'flex',
  flexDirection: 'column',
};

const listScroll = {
  overflowY: 'auto',
  flex: 1,
};

const sectionTitle = {
  color: '#d4b3ff',
  marginBottom: 12,
};

const card = {
  background: 'linear-gradient(180deg,#0b0b14,#050508)',
  padding: 14,
  borderRadius: 16,
  marginBottom: 12,
};

const verifyBtnBase = {
  width: '100%',
  marginTop: 8,
  padding: 8,
  borderRadius: 18,
  border: '1px solid #9d4edd',
  background: '#000',
  color: '#fff',
  cursor: 'pointer',
  transition: '0.3s',
};

const mapStyle = {
  height: 520,
  borderRadius: 18,
};

const modalBg = {
  position: 'fixed',
  inset: 0,
  background: '#000', // ✅ PURE BLACK
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const modal = {
  background: '#050508',
  padding: 28,
  borderRadius: 22,
  width: 420,
};

const btnRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 22,
};

const acceptBtn = {
  background: '#00ff9d',
  border: 'none',
  padding: '10px 28px',
  borderRadius: 22,
  cursor: 'pointer',
};

const rejectBtn = {
  background: '#ff4d6d',
  border: 'none',
  padding: '10px 28px',
  borderRadius: 22,
  cursor: 'pointer',
};

const statusColor = (status) => ({
  color:
    status === 'Completed'
      ? '#00ff9d'
      : status === 'Rejected'
      ? '#ff4d6d'
      : status === 'On Duty'
      ? '#00c9ff'
      : status === 'Emergency'
      ? '#ffaa00'
      : '#fff',
});

export default AdminDashboard;
