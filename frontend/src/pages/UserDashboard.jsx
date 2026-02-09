import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/'); // Go back to home page
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000000',
      color: '#ffffff',
      fontFamily: '"Poppins", sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '4rem', 
        fontWeight: '900', 
        marginBottom: '20px',
        background: 'linear-gradient(90deg, #FFD700, #FFF, #FFD700)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Login Dashboard
      </h1>
      
      <p style={{ fontSize: '1.5rem', marginBottom: '30px', opacity: 0.8 }}>
        Welcome to IVERAS Dashboard!
      </p>
      
      <button 
        onClick={handleLogout}
        style={{
          padding: '15px 40px',
          fontSize: '1.2rem',
          fontWeight: '600',
          background: 'linear-gradient(90deg, #5227FF, #FF9FFC)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 30px rgba(82, 39, 255, 0.4)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 15px 40px rgba(82, 39, 255, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 10px 30px rgba(82, 39, 255, 0.4)';
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default LoginDashboard;
