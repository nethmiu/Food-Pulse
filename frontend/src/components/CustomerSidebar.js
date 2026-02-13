import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, User, LogOut } from 'lucide-react';

const CustomerSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const styles = {
        sidebar: {
            width: '260px',
            height: '100vh',
            background: 'linear-gradient(180deg, #1a1a1a 0%, #000000 100%)',
            borderRight: '1px solid rgba(255, 215, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            position: 'fixed',
            left: 0,
            top: 0,
            color: '#fff',
            zIndex: 1000,
            overflowY: 'auto'
        },
        logoConfig: {
            marginBottom: '40px',
            textAlign: 'center'
        },
        logoText: {
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '28px',
            color: '#FFD700',
            letterSpacing: '2px',
            margin: 0
        },
        nav: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            flex: 1
        },
        link: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            color: 'rgba(255, 255, 255, 0.6)',
            textDecoration: 'none',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            fontSize: '0.95rem',
            fontWeight: '500',
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer'
        },
        activeLink: {
            background: 'rgba(255, 215, 0, 0.1)',
            color: '#FFD700',
            fontWeight: '600'
        },
        logoutBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'rgba(255, 0, 0, 0.1)',
            color: '#ff4444',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            marginTop: 'auto',
            transition: 'all 0.3s ease',
            width: '100%',
            fontFamily: "'Inter', sans-serif"
        }
    };

    const navItems = [
        { path: '/customer', icon: <Home size={20} />, label: 'Home' },
        { path: '/customer/cart', icon: <ShoppingBag size={20} />, label: 'My Cart' },
        // { path: '/customer/orders', icon: <ShoppingBag size={20} />, label: 'My Orders' }, // Future Scope
        // { path: '/customer/profile', icon: <User size={20} />, label: 'Profile' } // Future Scope
    ];

    return (
        <div style={styles.sidebar}>
            <div style={styles.logoConfig}>
                <h1 style={styles.logoText}>Food Pulse</h1>
            </div>

            <nav style={styles.nav}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            ...styles.link,
                            ...(isActive ? styles.activeLink : {})
                        })}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button style={styles.logoutBtn} onClick={handleLogout}>
                <LogOut size={20} />
                <span>Logout</span>
            </button>
        </div>
    );
};

export default CustomerSidebar; 