import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import 'leaflet/dist/leaflet.css';
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LoginDashboard from './pages/UserDashboard.jsx'
import ExplorePage from './pages/ExplorePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/dashboard" element={<LoginDashboard />} />
        <Route path="/ExplorePage" element={<ExplorePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

