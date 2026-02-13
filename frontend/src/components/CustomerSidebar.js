import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, LogOut, ChevronDown, ChevronRight, UserCog, Lock } from 'lucide-react';

const CustomerSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openSubMenus, setOpenSubMenus] = useState({ profile: false });

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const toggleSubMenu = (key) => {
        setOpenSubMenus(prev => ({ ...prev, [key]: !prev[key] }));
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
        subMenu: {
            paddingLeft: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            marginTop: '5px'
        },
        subLink: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            color: 'rgba(255, 255, 255, 0.5)',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '0.85rem',
            transition: 'all 0.3s ease',
            fontFamily: "'Inter', sans-serif"
        },
        activeSubLink: {
            color: '#FFD700',
            background: 'rgba(255, 215, 0, 0.05)'
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
        },
        chevron: {
            marginLeft: 'auto',
            opacity: 0.5
        }
    };

    const navItems = [
        { path: '/customer', label: 'Home', icon: <Home size={20} />, end: true },
        { path: '/customer/cart', label: 'My Cart', icon: <ShoppingBag size={20} /> },
        {
            key: 'profile',
            label: 'Profile',
            icon: <User size={20} />,
            subItems: [
                { path: '/customer/profile/view', label: 'View Profile', icon: <User size={16} /> },
                { path: '/customer/profile/manage', label: 'Manage Profile', icon: <UserCog size={16} /> },
                { path: '/customer/profile/password', label: 'Change Password', icon: <Lock size={16} /> }
            ]
        }
    ];

    return (
        <div style={styles.sidebar}>
            <div style={styles.logoConfig}>
                <h1 style={styles.logoText}>Food Pulse</h1>
            </div>

            <nav style={styles.nav}>
                {navItems.map((item) => (
                    <div key={item.key || item.path}>
                        {item.subItems ? (
                            <>
                                <div
                                    style={{
                                        ...styles.link,
                                        ...(item.subItems.some(sub =>
                                            location.pathname === sub.path ||
                                            location.pathname.startsWith(`${sub.path}/`)
                                        ) ? styles.activeLink : {})
                                    }}
                                    onClick={() => toggleSubMenu(item.key)}
                                >
                                    {item.icon}
                                    {item.label}
                                    {openSubMenus[item.key] ?
                                        <ChevronDown size={16} style={styles.chevron} /> :
                                        <ChevronRight size={16} style={styles.chevron} />
                                    }
                                </div>
                                {openSubMenus[item.key] && (
                                    <div style={styles.subMenu}>
                                        {item.subItems.map(sub => (
                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                style={({ isActive }) => ({
                                                    ...styles.subLink,
                                                    ...(isActive ? styles.activeSubLink : {})
                                                })}
                                            >
                                                {sub.icon}
                                                {sub.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <NavLink
                                to={item.path}
                                end={item.end}
                                style={({ isActive }) => ({
                                    ...styles.link,
                                    ...(isActive ? styles.activeLink : {})
                                })}
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        )}
                    </div>
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