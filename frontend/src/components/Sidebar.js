import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, User, LogOut, ChevronDown, ChevronRight, Plus, List, Store, Power, Lock } from 'lucide-react';
import axios from 'axios';
import CustomModal from './CustomModal';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openSubMenus, setOpenSubMenus] = useState({ menu: true });
    const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success', onConfirm: null });

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.token;

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/users/status', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsRestaurantOpen(res.data.isRestaurantOpen);
            } catch (error) {
                console.error("Error fetching status", error);
            }
        };
        fetchStatus();
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const toggleStatus = async () => {
        setModal({ isOpen: false });
        try {
            const newStatus = !isRestaurantOpen;
            const res = await axios.put('http://localhost:5000/api/users/status/update',
                { isOpen: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsRestaurantOpen(res.data.isRestaurantOpen);
            setModal({
                isOpen: true,
                title: 'Status Updated',
                message: res.data.message,
                type: 'success'
            });
        } catch (error) {
            console.error("Error updating status", error);
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Failed to update status',
                type: 'alert'
            });
        }
    };

    const confirmToggleStatus = () => {
        setModal({
            isOpen: true,
            title: isRestaurantOpen ? 'Close Restaurant?' : 'Open Restaurant?',
            message: isRestaurantOpen
                ? 'Are you sure you want to close the restaurant? Customers will not be able to place orders.'
                : 'Are you sure you want to open the restaurant? Customers will be able to place orders.',
            type: 'confirm',
            onConfirm: toggleStatus
        });
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
        {
            key: 'menu',
            label: 'Menu',
            icon: <Menu size={20} />,
            subItems: [
                { path: '/restaurant/menu/add', label: 'Add New  Menu Item', icon: <Plus size={16} /> },
                { path: '/restaurant/menu/list', label: 'Your Menu', icon: <List size={16} /> }
            ]
        },
        { path: '/restaurant/orders', icon: <ShoppingBag size={20} />, label: 'Orders' },
        {
            key: 'profile',
            label: 'Profile',
            icon: <User size={20} />,
            subItems: [
                { path: '/restaurant/profile/view', label: 'View Profile', icon: <User size={16} /> },
                { path: '/restaurant/profile/manage', label: 'Manage Profile', icon: <User size={16} /> },
                { path: '/restaurant/profile/password', label: 'Change Password', icon: <Lock size={16} /> }
            ]
        }
    ];

    return (
        <>
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

                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
                    <button
                        style={{
                            ...styles.logoutBtn,
                            background: isRestaurantOpen ? 'rgba(220, 38, 38, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: isRestaurantOpen ? '#ef4444' : '#10b981',
                            border: `1px solid ${isRestaurantOpen ? 'rgba(220, 38, 38, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                        }}
                        onClick={confirmToggleStatus}
                    >
                        <Power size={20} />
                        <span>{isRestaurantOpen ? 'Close Restaurant' : 'Open Restaurant'}</span>
                    </button>
                </div>
            </div>

            <CustomModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm}
            />
        </>
    );
};

export default Sidebar;
