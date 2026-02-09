import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
      // TODO: Call your backend API here
      console.log('Registering user:', form);

      // Simulate delay
      await new Promise((res) => setTimeout(res, 800));

      // After successful registration, go to login or home
      navigate('/LoginPage');
    } catch (err) {
      console.error(err);
      // Example: setErrors({ api: 'Something went wrong, please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const goToLogin = () => {
    navigate('/LoginPage');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617',
        color: '#e5e7eb',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#020617',
          borderRadius: '16px',
          border: '1px solid #1f2937',
          padding: '24px 28px 28px',
          boxShadow: '0 20px 45px rgba(0,0,0,0.6)',
        }}
      >
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            marginBottom: '4px',
            textAlign: 'center',
          }}
        >
          Create your account
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: '#9ca3af',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          Join IVERAS and be part of the mission to save lives on the road.
        </p>

        {errors.api && (
          <div
            style={{
              marginBottom: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              background: '#451a1a',
              color: '#fecaca',
              fontSize: '0.85rem',
            }}
          >
            {errors.api}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div style={{ marginBottom: '12px' }}>
            <label
              htmlFor="name"
              style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Srikar "
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.name ? '#b91c1c' : '#374151'}`,
                background: '#020617',
                color: '#e5e7eb',
                outline: 'none',
                fontSize: '0.9rem',
              }}
            />
            {errors.name && (
              <span style={{ color: '#fca5a5', fontSize: '0.8rem' }}>{errors.name}</span>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '12px' }}>
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.email ? '#b91c1c' : '#374151'}`,
                background: '#020617',
                color: '#e5e7eb',
                outline: 'none',
                fontSize: '0.9rem',
              }}
            />
            {errors.email && (
              <span style={{ color: '#fca5a5', fontSize: '0.8rem' }}>{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '12px' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.password ? '#b91c1c' : '#374151'}`,
                background: '#020617',
                color: '#e5e7eb',
                outline: 'none',
                fontSize: '0.9rem',
              }}
            />
            {errors.password && (
              <span style={{ color: '#fca5a5', fontSize: '0.8rem' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="confirmPassword"
              style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.confirmPassword ? '#b91c1c' : '#374151'}`,
                background: '#020617',
                color: '#e5e7eb',
                outline: 'none',
                fontSize: '0.9rem',
              }}
            />
            {errors.confirmPassword && (
              <span style={{ color: '#fca5a5', fontSize: '0.8rem' }}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '999px',
              border: 'none',
              background:
                'linear-gradient(90deg, #4f46e5, #ec4899, #f97316)',
              color: '#f9fafb',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
              marginBottom: '10px',
            }}
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div
          style={{
            marginTop: '4px',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#9ca3af',
          }}
        >
          Already have an account?{' '}
          <button
            type="button"
            onClick={goToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.85rem',
              textDecoration: 'underline',
            }}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
