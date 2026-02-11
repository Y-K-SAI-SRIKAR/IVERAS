// RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Silk from '../PagesUI/Silk.jsx';
import CustomDropdown from '../PagesUI/CustomDropdown.jsx';
import BlurText from '../PagesUI/BlurText.jsx';
import CurvedLoop from '../PagesUI/CurvedLoop.jsx';
import './RegisterPage.css';

const bloodGroupOptions = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'Public',
    vehicleNumber: '',
    iotDeviceId: '',
    emergencyPhone: '',
    contactNumber: '',
    ambulanceNumber: '',
    driverId: '',
    ambulanceImage: null,
    idCardImage: null,
    bloodGroup: '',
    allergies: '',
    captcha: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'ambulanceImage' || name === 'idCardImage') {
      const file = files && files[0] ? files[0] : null;
      setForm((prev) => ({ ...prev, [name]: file }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
      return;
    }

    if (name === 'userType') {
      const newType = value;
      setForm((prev) => ({
        ...prev,
        userType: newType,
        vehicleNumber: newType === 'Public' ? prev.vehicleNumber : '',
        emergencyPhone: newType === 'Public' ? prev.emergencyPhone : '',
        contactNumber: newType === 'Public' ? prev.contactNumber : '',
        ambulanceNumber: newType === 'Emergency Assistant' ? prev.ambulanceNumber : '',
        driverId: newType === 'Emergency Assistant' ? prev.driverId : '',
        ambulanceImage: newType === 'Emergency Assistant' ? prev.ambulanceImage : null,
        idCardImage: newType === 'Emergency Assistant' ? prev.idCardImage : null,
      }));
      setErrors({});
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Name is required';

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Enter a valid email';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // IoT device is required only for Public
    if (form.userType === 'Public' && !form.iotDeviceId.trim()) {
      newErrors.iotDeviceId = 'IoT device ID is required';
    }

    if (form.userType === 'Public') {
      if (!form.vehicleNumber.trim()) {
        newErrors.vehicleNumber = 'Vehicle number is required';
      }
      if (!form.emergencyPhone.trim()) {
        newErrors.emergencyPhone = 'Emergency phone number is required';
      }
      if (!form.contactNumber.trim()) {
        newErrors.contactNumber = 'Contact number is required';
      }
    }

    if (form.userType === 'Emergency Assistant') {
      if (!form.ambulanceNumber.trim()) {
        newErrors.ambulanceNumber = 'Ambulance number is required';
      }
      if (!form.driverId.trim()) {
        newErrors.driverId = 'Driver ID is required';
      }
      if (!form.ambulanceImage) {
        newErrors.ambulanceImage = 'Ambulance image is required';
      }
      if (!form.idCardImage) {
        newErrors.idCardImage = 'ID card image is required';
      }
    }

    if (!form.bloodGroup.trim()) {
      newErrors.bloodGroup = 'Blood group is required';
    }

    if (!form.captcha.trim()) {
      newErrors.captcha = 'Captcha is required';
    } else if (form.captcha.trim().toUpperCase() !== 'IVERAS') {
      newErrors.captcha = 'Captcha does not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      console.log('Registering user:', form);
      await new Promise((res) => setTimeout(res, 800));
      navigate('/LoginPage');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const goToLogin = () => {
    navigate('/LoginPage');
  };

  const isPublic = form.userType === 'Public';
  const isEmergencyAssistant = form.userType === 'Emergency Assistant';

  const centeredInputStyle = { textAlign: 'center' };

  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  return (
    <div className="register-page-root">
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
          <div
            className="register-heading-wrapper"
            style={{ marginBottom: '32px' }}
          >
            <BlurText
              text="JOIN YOUR HANDS WITH IVERAS"
              delay={200}
              animateBy="letters"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="register-heading-title"
            />
          </div>

          <div className="register-card-block">
            <div className="register-form-wrapper">
              <form className="form" onSubmit={handleSubmit} noValidate>
                <p id="heading">GET ACCESS</p>

                <div className="field field-select">
                  <CustomDropdown
                    name="userType"
                    value={form.userType}
                    onChange={handleChange}
                    options={['Public', 'Emergency Assistant']}
                  />
                </div>
                {errors.userType && (
                  <span className="register-error-text">{errors.userType}</span>
                )}

                <div className="field">
                  <input
                    type="text"
                    className="input-field"
                    name="name"
                    placeholder="FULL NAME"
                    autoComplete="off"
                    value={form.name}
                    onChange={handleChange}
                    style={centeredInputStyle}
                  />
                </div>
                {errors.name && (
                  <span className="register-error-text">{errors.name}</span>
                )}

                <div className="field">
                  <input
                    type="email"
                    className="input-field"
                    name="email"
                    placeholder="EMAIL ID"
                    autoComplete="off"
                    value={form.email}
                    onChange={handleChange}
                    style={centeredInputStyle}
                  />
                </div>
                {errors.email && (
                  <span className="register-error-text">{errors.email}</span>
                )}

                {isPublic && (
                  <div className="field">
                    <input
                      type="text"
                      className="input-field"
                      name="iotDeviceId"
                      placeholder="IOT DEVICE ID"
                      autoComplete="off"
                      value={form.iotDeviceId}
                      onChange={handleChange}
                      style={centeredInputStyle}
                    />
                  </div>
                )}
                {errors.iotDeviceId && (
                  <span className="register-error-text">
                    {errors.iotDeviceId}
                  </span>
                )}

                {isPublic && (
                  <>
                    <div className="field">
                      <input
                        type="text"
                        className="input-field"
                        name="vehicleNumber"
                        placeholder="VEHICLE NUMBER (E.g : AP09AB1234)"
                        autoComplete="off"
                        value={form.vehicleNumber}
                        onChange={handleChange}
                        style={centeredInputStyle}
                      />
                    </div>
                    {errors.vehicleNumber && (
                      <span className="register-error-text">
                        {errors.vehicleNumber}
                      </span>
                    )}

                    <div className="field">
                      <input
                        type="tel"
                        className="input-field"
                        name="emergencyPhone"
                        placeholder="EMERGENCY PHONE NUMBER"
                        autoComplete="off"
                        value={form.emergencyPhone}
                        onChange={handleChange}
                        style={centeredInputStyle}
                      />
                    </div>
                    {errors.emergencyPhone && (
                      <span className="register-error-text">
                        {errors.emergencyPhone}
                      </span>
                    )}

                    <div className="field">
                      <input
                        type="tel"
                        className="input-field"
                        name="contactNumber"
                        placeholder="CONTACT NUMBER"
                        autoComplete="off"
                        value={form.contactNumber}
                        onChange={handleChange}
                        style={centeredInputStyle}
                      />
                    </div>
                    {errors.contactNumber && (
                      <span className="register-error-text">
                        {errors.contactNumber}
                      </span>
                    )}
                  </>
                )}

                {isEmergencyAssistant && (
                  <>
                    <div className="field">
                      <input
                        type="text"
                        className="input-field"
                        name="ambulanceNumber"
                        placeholder="AMBULANCE NUMBER"
                        autoComplete="off"
                        value={form.ambulanceNumber}
                        onChange={handleChange}
                        style={centeredInputStyle}
                      />
                    </div>
                    {errors.ambulanceNumber && (
                      <span className="register-error-text">
                        {errors.ambulanceNumber}
                      </span>
                    )}

                    <div className="field">
                      <input
                        type="text"
                        className="input-field"
                        name="driverId"
                        placeholder="DRIVER ID"
                        autoComplete="off"
                        value={form.driverId}
                        onChange={handleChange}
                        style={centeredInputStyle}
                      />
                    </div>
                    {errors.driverId && (
                      <span className="register-error-text">
                        {errors.driverId}
                      </span>
                    )}

                    <label className="register-file-label">
                      AMBULANCE IMAGE
                    </label>
                    <div className="field">
                      <input
                        type="file"
                        className="input-field register-file-input"
                        name="ambulanceImage"
                        accept="image/*"
                        onChange={handleChange}
                        title="Upload clear photo of the ambulance"
                      />
                    </div>
                    {errors.ambulanceImage && (
                      <span className="register-error-text">
                        {errors.ambulanceImage}
                      </span>
                    )}

                    <label className="register-file-label">
                      DRIVER ID CARD IMAGE
                    </label>
                    <div className="field">
                      <input
                        type="file"
                        className="input-field register-file-input"
                        name="idCardImage"
                        accept="image/*"
                        onChange={handleChange}
                        title="Upload front side of driver ID card"
                      />
                    </div>
                    {errors.idCardImage && (
                      <span className="register-error-text">
                        {errors.idCardImage}
                      </span>
                    )}
                  </>
                )}

                {/* Passwords for both user types */}
                <div className="field">
                  <input
                    type="password"
                    className="input-field"
                    name="password"
                    placeholder="PASSWORD (Min 6 CHARACTERS)"
                    value={form.password}
                    onChange={handleChange}
                    style={centeredInputStyle}
                  />
                </div>
                {errors.password && (
                  <span className="register-error-text">{errors.password}</span>
                )}

                <div className="field">
                  <input
                    type="password"
                    className="input-field"
                    name="confirmPassword"
                    placeholder="CONFIRM PASSWORD"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    style={centeredInputStyle}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="register-error-text">
                    {errors.confirmPassword}
                  </span>
                )}

                <p
                  style={{
                    textAlign: 'center',
                    marginTop: '8px',
                    marginBottom: '4px',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  MEDICAL DATA
                </p>

                {/* Blood group dropdown for both user types */}
                <div className="field field-select">
                  <CustomDropdown
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    options={bloodGroupOptions}
                  />
                </div>
                {errors.bloodGroup && (
                  <span className="register-error-text">
                    {errors.bloodGroup}
                  </span>
                )}

                <div className="field">
                  <input
                    type="text"
                    className="input-field"
                    name="allergies"
                    placeholder="ALLERGIES (If ANY)"
                    autoComplete="off"
                    value={form.allergies}
                    onChange={handleChange}
                    style={centeredInputStyle}
                  />
                </div>
                {errors.allergies && (
                  <span className="register-error-text">
                    {errors.allergies}
                  </span>
                )}

                {/* Captcha field */}
                <div className="field">
                  <input
                    type="text"
                    className="input-field"
                    name="captcha"
                    placeholder="TYPE 'IVERAS' TO VERIFY"
                    autoComplete="off"
                    value={form.captcha}
                    onChange={handleChange}
                    style={centeredInputStyle}
                  />
                </div>
                {errors.captcha && (
                  <span className="register-error-text">
                    {errors.captcha}
                  </span>
                )}

                <div className="btn">
                  <button
                    type="submit"
                    className="button1"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating account...' : 'JOIN IVERAS'}
                  </button>
                </div>

                <button
                  type="button"
                  className="button3 register-login-button"
                  onClick={goToLogin}
                >
                  ALREADY JOINED IVERAS ? ACCESS IVERAS
                </button>
              </form>
            </div>
          </div>

          {/* Footer curved marquee animation */}
          <div
            className="register-footer-marquee"
            style={{ marginTop: '32px' }}
          >
            <CurvedLoop
              marqueeText="TEAM ✦ PADMA ✦ VYUHA ✦ "
              speed={1}
              curveAmount={120}
              direction="right"
              interactive
              className="custom-text-style"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
