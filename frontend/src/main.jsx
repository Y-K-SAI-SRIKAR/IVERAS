import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';


import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LoginDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HelperDashboard from './pages/HelperDashboard.jsx';
import AmbulanceStream from './pages/AmbulanceStream.jsx'; // <--- IMPORT THIS

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* LANDING PAGE */}
        <Route path="/" element={<App />} />

        {/* AUTH */}
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* DASHBOARDS */}
        <Route path="/dashboard" element={<LoginDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/helper" element={<HelperDashboard />} />

        {/* LIVE STREAMING */}
        <Route path="/live-stream" element={<AmbulanceStream />} /> {/* <--- NEW ROUTE */}

        {/* EXPLORE */}
        <Route path="/ExplorePage" element={<ExplorePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);