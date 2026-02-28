// RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Silk from '../PagesUI/Silk.jsx';
import CustomDropdown from '../PagesUI/CustomDropdown.jsx';
import BlurText from '../PagesUI/BlurText.jsx';
import CurvedLoop from '../PagesUI/CurvedLoop.jsx';

import './RegisterPage.css';

const bloodGroupOptions = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

const RegisterPage = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',

    userType: 'Public',

    // Public Fields
    iotDeviceId: '',
    vehicleModel: '',
    emergencyPhone: '',
    contactNumber: '',
    bloodGroup: '',
    conditions: '',
    allergies: '',

    // Shared Fields
    vehicleNumber: '',

    // Emergency Assistant Fields
    ambulanceNumber: '',
    driverId: '',
    ambulanceImage: null,

    captcha: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // ---------------- CHANGE HANDLERS ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({
      ...prev,
      ambulanceImage: e.target.files[0]
    }));
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("✅ Register clicked");
    console.log("📤 Sending:", form);

    if (!form.name || !form.email || !form.password) {
      alert("Please fill Name, Email and Password");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          userType: form.userType,
          iotDeviceId: form.iotDeviceId,
          vehicleNumber: form.vehicleNumber,
          vehicleModel: form.vehicleModel,
          emergencyPhone: form.emergencyPhone,
          contactNumber: form.contactNumber,
          ambulanceNumber: form.ambulanceNumber,
          driverId: form.driverId,
          bloodGroup: form.bloodGroup,
          conditions: form.conditions,
          allergies: form.allergies
        })
      });

      const data = await res.json();
      console.log("📥 Backend Response:", data);

      if (res.ok) {
        alert("Registration Successful!");
        navigate("/LoginPage");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("❌ Network Error:", err);
      alert("Cannot connect to backend");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- NAVIGATE ----------------
  const goToLogin = () => {
    navigate("/LoginPage");
  };

  const isPublic = form.userType === "Public";

  // ---------------- UI ----------------
  return (
    <div className="register-page-root">

      {/* BACKGROUND */}
      <div className="register-silk-bg">
        <Silk
          speed={5}
          scale={1}
          color="#5b25a1"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      <div className="register-page">
        <div className="register-content">

          {/* HEADING */}
          <div className="register-heading-wrapper">
            <BlurText
              text="JOIN YOUR HANDS WITH IVERAS"
              delay={200}
              animateBy="letters"
              direction="top"
              className="register-heading-title"
            />
          </div>

          <div className="register-card-block">
            <div className="register-form-wrapper">

              <form className="form" onSubmit={handleSubmit}>

                <p id="heading">GET ACCESS</p>

                {/* --- COMMON FIELDS --- */}
                {/* USER TYPE */}
                <div className="field field-select">
                  <CustomDropdown
                    name="userType"
                    value={form.userType}
                    onChange={handleChange}
                    options={['Public', 'Emergency Assistant']}
                  />
                </div>

                {/* NAME */}
                <div className="field">
                  <input
                    className="input-field"
                    type="text"
                    name="name"
                    placeholder="FULL NAME"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>

                {/* EMAIL */}
                <div className="field">
                  <input
                    className="input-field"
                    type="email"
                    name="email"
                    placeholder="EMAIL"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>

                {/* --- PUBLIC SPECIFIC FIELDS (TOP HALF) --- */}
                {isPublic && (
                  <>
                    <div className="field">
                      <input
                        className="input-field"
                        type="text"
                        name="iotDeviceId"
                        placeholder="IOT DEVICE ID"
                        value={form.iotDeviceId}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <input
                        className="input-field"
                        type="text"
                        name="vehicleNumber"
                        placeholder="VEHICLE NUMBER"
                        value={form.vehicleNumber}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <input
                        className="input-field"
                        type="text"
                        name="vehicleModel"
                        placeholder="VEHICLE MODEL"
                        value={form.vehicleModel}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </div>
                  </>
                )}

                {/* --- EMERGENCY ASSISTANT SPECIFIC FIELDS --- */}
                {!isPublic && (
                  <>
                    <div className="field">
                      <input
                        className="input-field"
                        type="text"
                        name="vehicleNumber"
                        placeholder="VEHICLE NUMBER"
                        value={form.vehicleNumber}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <input
                        className="input-field"
                        type="text"
                        name="ambulanceNumber"
                        placeholder="AMBULANCE ID"
                        value={form.ambulanceNumber}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <input
                        className="input-field"
                        type="text"
                        name="driverId"
                        placeholder="DRIVER LICENSE"
                        value={form.driverId}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </div>
                    {/* IMAGE UPLOAD FOR AMBULANCE VERIFICATION */}
                    <div className="field">
                      <input
                        type="file"
                        name="ambulanceImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="register-file-input input-field"
                      />
                    </div>
                  </>
                )}

                {/* PASSWORD */}
                <div className="field">
                  <input
                    className="input-field"
                    type="password"
                    name="password"
                    placeholder="PASSWORD"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>

                {/* CONFIRM */}
                <div className="field">
                  <input
                    className="input-field"
                    type="password"
                    name="confirmPassword"
                    placeholder="CONFIRM PASSWORD"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>

                {/* --- PUBLIC SPECIFIC FIELDS (BOTTOM HALF) --- */}
                {isPublic && (
                  <>
                    <div className="field field-select">
                      <CustomDropdown
                        name="bloodGroup"
                        value={form.bloodGroup}
                        onChange={handleChange}
                        options={bloodGroupOptions}
                        placeholder="BLOOD GROUP"
                      />
                    </div>
                    <div className="field">
                      <input
                        className="input-field"
                        type="text"
                        name="conditions"
                        placeholder="MEDICAL CONDITIONS"
                        value={form.conditions}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <input
                        className="input-field"
                        type="text"
                        name="allergies"
                        placeholder="ALLERGIES"
                        value={form.allergies}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <input
                        className="input-field"
                        type="text"
                        name="emergencyPhone"
                        placeholder="EMERGENCY CONTACT"
                        value={form.emergencyPhone}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </div>
                  </>
                )}

                {/* CAPTCHA */}
                <div className="field">
                  <input
                    className="input-field"
                    type="text"
                    name="captcha"
                    placeholder="TYPE IVERAS"
                    value={form.captcha}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>

                {/* BUTTON */}
                <div className="btn">
                  <button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "JOIN IVERAS"}
                  </button>
                </div>

                {/* LOGIN */}
                <button
                  type="button"
                  className="button3"
                  onClick={goToLogin}
                >
                  ALREADY JOINED? LOGIN
                </button>

              </form>

            </div>
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: "20px" }}>
            <CurvedLoop
              marqueeText="TEAM ✦ PADMA ✦ VYUHA ✦ "
              speed={1}
              curveAmount={120}
              direction="right"
              interactive
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;