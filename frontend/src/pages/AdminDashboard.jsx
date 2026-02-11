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

  /* ================= MOVEMENT ENGINE ================= */

  useEffect(() => {
    const interval = setInterval(() => {
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

          const next = amb.route[amb.routeIndex];

          let status = amb.status;

          if (amb.routeIndex === 0) status = 'On Duty';
          if (amb.routeIndex === 1) status = 'On Duty';

          return {
            ...amb,
            position: next,
            routeIndex: amb.routeIndex + 1,
            status,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* ================= AUTO RESET TO IDLE ================= */

  useEffect(() => {
    ambulances.forEach((amb) => {
      if (amb.finished) {
        setTimeout(() => {
          setAmbulances((prev) =>
            prev.map((a) => {
              if (a.id === amb.id && a.finished) {
                return {
                  ...a,
                  status: 'Idle',
                  finished: false,
                  position: a.base,
                  route: [],
                  routeIndex: 0,
                };
              }
              return a;
            })
          );
        }, 4000);
      }
    });
  }, [ambulances]);

  /* ================= VERIFY ================= */

  const verifyAmbulance = (id) => {
    setAmbulances((prev) =>
      prev.map((amb) => {
        if (amb.id === id && !amb.verified) {
          return {
            ...amb,
            verified: true,
            status: 'Emergency',

            route: [
              amb.base,
              amb.accident,
              amb.hospital,
            ],

            routeIndex: 0,
            active: true,
          };
        }
        return amb;
      })
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

      <h1 style={title}>Admin Control Center</h1>

      <div style={grid}>

        {/* LEFT PANEL */}
        <div style={panel}>

          <h3 style={sectionTitle}>Ambulance Management</h3>

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

              <p>
                Verified:{' '}
                {amb.verified ? 'Yes' : 'No'}
              </p>

              {!amb.verified && (
                <button
                  style={openBtn}
                  onClick={() => setSelected(amb)}
                >
                  Verify Ambulance
                </button>
              )}

            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div style={panel}>

          <h3 style={sectionTitle}>Live GPS Tracking</h3>

          <MapContainer
            center={[17.385, 78.48]}
            zoom={13}
            style={mapStyle}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* ACCIDENT */}
            {ambulances.map((amb) => (
              <Marker
                key={'a' + amb.id}
                position={[
                  amb.accident.lat,
                  amb.accident.lng,
                ]}
                icon={accidentIcon}
              />
            ))}

            {/* HOSPITAL */}
            {ambulances.map((amb) => (
              <Marker
                key={'h' + amb.id}
                position={[
                  amb.hospital.lat,
                  amb.hospital.lng,
                ]}
                icon={hospitalIcon}
              />
            ))}

            {/* AMBULANCE */}
            {ambulances.map((amb) => (
              <Marker
                key={'m' + amb.id}
                position={[
                  amb.position.lat,
                  amb.position.lng,
                ]}
                icon={ambulanceIcon}
              >
                <Popup>
                  🚑 {amb.name}
                  <br />
                  {amb.status}
                </Popup>
              </Marker>
            ))}

            {/* ROUTES */}
            {ambulances.map(
              (amb) =>
                amb.route.length > 0 && (
                  <Polyline
                    key={'r' + amb.id}
                    positions={amb.route.map((p) => [
                      p.lat,
                      p.lng,
                    ])}
                    color="violet"
                  />
                )
            )}

          </MapContainer>

        </div>
      </div>

      {/* VERIFY MODAL */}
      {selected && (
        <div style={modalBg}>

          <div style={modal}>

            <h2>Verify Ambulance</h2>

            <p><b>Name:</b> {selected.name}</p>
            <p><b>Reg:</b> {selected.regNo}</p>
            <p><b>Driver:</b> {selected.driver}</p>

            <div style={btnRow}>

              <button
                style={verifyBtn}
                onClick={() =>
                  verifyAmbulance(selected.id)
                }
              >
                Accept
              </button>

              <button
                style={rejectBtn}
                onClick={() =>
                  rejectAmbulance(selected.id)
                }
              >
                Reject
              </button>

            </div>

          </div>

        </div>
      )}

      <button
        style={logoutBtn}
        onClick={() => navigate('/')}
      >
        Logout
      </button>

    </div>
  );
};

/* ================= STYLES ================= */

const container = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg,#2b0057,#12002b,#000)',
  color: '#fff',
  padding: '30px',
  fontFamily: 'Poppins',
};

const title = {
  textAlign: 'center',
  fontSize: '3rem',
  marginBottom: '15px',
  background: 'linear-gradient(90deg,#c77dff,#9d4edd)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.4fr',
  gap: '25px',
};

const panel = {
  background: 'rgba(0,0,0,0.65)',
  borderRadius: '20px',
  padding: '22px',
};

const sectionTitle = {
  color: '#e0aaff',
  marginBottom: '12px',
};

const card = {
  background: 'linear-gradient(180deg,#0b0b14,#050508)',
  padding: '14px',
  borderRadius: '16px',
  marginBottom: '12px',
};

const openBtn = {
  width: '100%',
  marginTop: '8px',
  padding: '8px',
  borderRadius: '18px',
  border: 'none',
  background: 'linear-gradient(90deg,#5a189a,#9d4edd)',
  color: '#fff',
  cursor: 'pointer',
};

const mapStyle = {
  height: '420px',
  borderRadius: '18px',
};

const modalBg = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10,0,30,0.85)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10000, // ✅ ABOVE MAP
};

const modal = {
  background: 'linear-gradient(180deg,#12002b,#050508)',
  padding: '28px',
  borderRadius: '22px',
  width: '420px',
};

const btnRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '22px',
};

const verifyBtn = {
  background: 'linear-gradient(90deg,#00ff9d,#00c896)',
  border: 'none',
  padding: '10px 28px',
  borderRadius: '22px',
  cursor: 'pointer',
};

const rejectBtn = {
  background: 'linear-gradient(90deg,#ff4d6d,#ff758f)',
  border: 'none',
  padding: '10px 28px',
  borderRadius: '22px',
  cursor: 'pointer',
};

const logoutBtn = {
  marginTop: '25px',
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: '14px 45px',
  borderRadius: '30px',
  border: 'none',
  background: 'linear-gradient(90deg,#5a189a,#9d4edd)',
  color: '#fff',
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