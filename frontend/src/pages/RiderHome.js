import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function RiderHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const styles = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      background: '#1a1a1a',
      color: '#FFD700',
      borderBottom: '1px solid rgba(255, 215, 0, 0.1)'
    },
    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(255, 0, 0, 0.1)',
      color: '#ff4d4d',
      border: '1px solid rgba(255, 0, 0, 0.2)',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600'
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <div style={styles.header}>
        <h1>Rider Panel 🛵</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
      <div className="container" style={{ padding: '20px' }}>
        <p>View delivery tasks.</p>
      </div>
    </div>
  );
}