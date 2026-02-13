import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const RestaurantProfileHeader = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const updateUserInfo = () => {
            const storedUser = JSON.parse(localStorage.getItem('userInfo'));
            setUserInfo(storedUser);
        };

        updateUserInfo();

        window.addEventListener('storage', updateUserInfo);
        // Custom event for local updates within the same window
        window.addEventListener('userInfoUpdated', updateUserInfo);

        return () => {
            window.removeEventListener('storage', updateUserInfo);
            window.removeEventListener('userInfoUpdated', updateUserInfo);
        };
    }, []);

    const [imageError, setImageError] = useState(false);

    // Reset error state when image changes
    useEffect(() => {
        setImageError(false);
    }, [userInfo?.image]);

    const styles = {
        // ... existing styles ...
        profileWrapper: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '50px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
            zIndex: 100
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
        <div
            style={styles.profileWrapper}
            onClick={() => navigate('/restaurant/profile/view')}
            title="View Profile"
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
        >
            <span style={styles.userName}>{userInfo?.name || 'Restaurant'}</span>
            <div style={styles.profileIcon}>
                {userInfo?.image && !imageError ? (
                    <img
                        src={`http://localhost:5000/uploads/${userInfo.image}`}
                        alt="Profile"
                        style={styles.profileImage}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <User size={20} color="#FFD700" />
                )}
            </div>
        </div>
    );
};

export default RestaurantProfileHeader;
