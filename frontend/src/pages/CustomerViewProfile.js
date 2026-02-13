import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerSidebar from '../components/CustomerSidebar';
import { User, Mail, MapPin, Phone, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerViewProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo) {
                    navigate('/login');
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                };

                const res = await axios.get('http://localhost:5000/api/users/profile', config);
                // Backend returns { user: { ... } } for customers now
                setProfile(res.data.user);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            background: '#0a0a0a',
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        },
        main: {
            flex: 1,
            marginLeft: '260px',
            padding: '40px'
        },
        header: {
            marginBottom: '40px',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 40px auto'
        },
        title: {
            fontSize: '32px',
            fontWeight: '700',
            color: '#FFD700',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '1px',
            marginBottom: '10px'
        },
        subtitle: {
            color: '#888',
            fontSize: '16px'
        },
        card: {
            background: '#1a1a1a',
            borderRadius: '20px',
            padding: '40px',
            border: '1px solid rgba(255, 215, 0, 0.1)',
            maxWidth: '800px',
            width: '100%',
            margin: '0 auto'
        },
        profileHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            marginBottom: '40px',
            paddingBottom: '30px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        },
        avatar: {
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            fontWeight: 'bold',
            color: '#000',
            boxShadow: '0 10px 20px rgba(255, 215, 0, 0.2)'
        },
        infoGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
        },
        infoItem: {
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
        },
        label: {
            color: '#888',
            fontSize: '14px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        value: {
            color: '#fff',
            fontSize: '18px',
            fontWeight: '500'
        },
        backBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#888',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '14px',
            transition: 'color 0.2s'
        }
    };

    if (loading) return (
        <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#FFD700' }}>Loading profile...</div>
        </div>
    );

    if (!profile) return (
        <div style={styles.container}>
            <CustomerSidebar />
            <div style={styles.main}>
                <div style={styles.title}>Error loading profile</div>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <CustomerSidebar />

            <div style={styles.main}>
                <button
                    style={styles.backBtn}
                    onClick={() => navigate('/customer')}
                    onMouseOver={(e) => e.target.style.color = '#FFD700'}
                    onMouseOut={(e) => e.target.style.color = '#888'}
                >
                    <ArrowLeft size={18} />
                    Back to Home
                </button>

                <div style={styles.header}>
                    <h1 style={styles.title}>My Profile</h1>
                    <p style={styles.subtitle}>Manage your personal information</p>
                </div>

                <div style={styles.card}>
                    <div style={styles.profileHeader}>
                        <div style={{
                            ...styles.avatar,
                            background: profile.image ? 'none' : styles.avatar.background,
                            overflow: 'hidden'
                        }}>
                            {profile.image ? (
                                <img
                                    src={`http://localhost:5000/uploads/${profile.image}`}
                                    alt={profile.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                profile.name ? profile.name.charAt(0).toUpperCase() : 'U'
                            )}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '5px' }}>{profile.name}</h2>
                            <p style={{ color: '#FFD700', fontSize: '14px' }}>{profile.role ? profile.role.toUpperCase() : 'CUSTOMER'}</p>
                        </div>
                    </div>

                    <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                            <div style={styles.label}><User size={16} color="#FFD700" /> Full Name</div>
                            <div style={styles.value}>{profile.name}</div>
                        </div>

                        <div style={styles.infoItem}>
                            <div style={styles.label}><Mail size={16} color="#FFD700" /> Email Address</div>
                            <div style={styles.value}>{profile.email}</div>
                        </div>

                        <div style={styles.infoItem}>
                            <div style={styles.label}><Phone size={16} color="#FFD700" /> Phone Number</div>
                            <div style={styles.value}>{profile.phone || 'Not set'}</div>
                        </div>

                        <div style={styles.infoItem}>
                            <div style={styles.label}><MapPin size={16} color="#FFD700" /> Address</div>
                            <div style={styles.value}>{profile.address || 'Not set'}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => navigate('/customer/profile/manage')}
                            style={{
                                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                color: '#000',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerViewProfile;
