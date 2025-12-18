import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import Sidebar from './Sidebar';

const RestaurantLayout = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userInfo'));
        setUserInfo(storedUser);
    }, []);

    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            background: '#000000'
        },
        main: {
            flex: 1,
            marginLeft: '260px',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
            position: 'relative'
        },
        profileWrapper: {
            position: 'absolute',
            top: '20px',
            right: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            zIndex: 100,
            padding: '8px 12px',
            borderRadius: '50px',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease'
        },
        userName: {
            color: '#fff',
            fontWeight: '600',
            fontSize: '1rem',
            fontFamily: "'Inter', sans-serif"
        },
        profileIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '2px solid #FFD700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        },
        profileImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        }
    };

    return (
        <div style={styles.container}>
            <Sidebar />
            <main style={styles.main}>
                <div
                    style={styles.profileWrapper}
                    onClick={() => navigate('/restaurant/profile/view')}
                    title="View Profile"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                >
                    <span style={styles.userName}>{userInfo?.name || 'Restaurant'}</span>
                    <div style={styles.profileIcon}>
                        {userInfo?.image ? (
                            <img
                                src={`http://localhost:5000/uploads/${userInfo.image}`}
                                alt="Profile"
                                style={styles.profileImage}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                                }}
                            />
                        ) : (
                            <User size={20} color="#FFD700" />
                        )}
                    </div>
                </div>
                <Outlet />
            </main>
        </div>
    );
};

export default RestaurantLayout;
