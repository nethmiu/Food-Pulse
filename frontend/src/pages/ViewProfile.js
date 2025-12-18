import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, MapPin, Mail, Calendar, DollarSign, Store } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function ViewProfile() {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ totalSales: 0, monthlySales: 0, todaySales: 0 });

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.token;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(res.data.user);
                setStats(res.data.stats);
            } catch (error) {
                console.error("Error fetching profile", error);
            }
        };
        fetchProfile();
    }, [token]);

    const styles = {
        container: {
            padding: '40px',
            fontFamily: "'Inter', sans-serif",
            color: '#fff',
            maxWidth: '1000px',
            margin: '0 auto'
        },
        headerCard: {
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%)',
            borderRadius: '20px',
            padding: '40px',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        },
        profileImage: {
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid #FFD700',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)'
        },
        infoSection: {
            flex: 1
        },
        name: {
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '10px',
            color: '#fff'
        },
        email: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1rem',
            marginBottom: '20px'
        },
        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            background: profile?.isRestaurantOpen ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: profile?.isRestaurantOpen ? '#10b981' : '#ef4444',
            border: `1px solid ${profile?.isRestaurantOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        statCard: {
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
        },
        statIcon: {
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'rgba(255, 215, 0, 0.1)',
            color: '#FFD700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        statInfo: {
            display: 'flex',
            flexDirection: 'column'
        },
        statValue: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#fff'
        },
        statLabel: {
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.6)'
        },
        card: {
            background: '#1a1a1a',
            borderRadius: '20px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        cardTitle: {
            fontSize: '1.2rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#FFD700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        mapContainer: {
            height: '250px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginTop: '15px'
        },
        addressText: {
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '10px',
            lineHeight: '1.5'
        }
    };

    const loadingStyles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
            width: '100%'
        },
        spinner: {
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 215, 0, 0.3)',
            borderTop: '3px solid #FFD700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }
    };

    if (!profile) return (
        <>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div style={loadingStyles.container}>
                <div style={loadingStyles.spinner}></div>
            </div>
        </>
    );

    const location = profile.location || { lat: 6.9271, lng: 79.8612 };

    return (
        <div style={styles.container}>
            <div style={styles.headerCard}>
                <img
                    src={profile.image ? `http://localhost:5000/uploads/${profile.image}` : 'https://via.placeholder.com/150'}
                    alt="Profile"
                    style={styles.profileImage}
                />
                <div style={styles.infoSection}>
                    <h1 style={styles.name}>{profile.name}</h1>
                    <div style={styles.email}>
                        <Mail size={16} />
                        {profile.email}
                    </div>
                    <div style={{ ...styles.email, marginTop: '-10px' }}>
                        <Calendar size={16} />
                        Joined {new Date(profile.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                    {profile.description && (
                        <div style={{ marginTop: '15px', fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.5', whiteSpace: 'pre-line', maxWidth: '600px' }}>
                            {profile.description}
                        </div>
                    )}
                    <div style={{ ...styles.statusBadge, marginTop: '20px' }}>
                        <Store size={16} />
                        {profile.isRestaurantOpen ? 'Open for Business' : 'Currently Closed'}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}><DollarSign size={24} /></div>
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>Rs. {stats.todaySales.toLocaleString()}</span>
                        <span style={styles.statLabel}>Today's Sales</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}><Calendar size={24} /></div>
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>Rs. {stats.monthlySales.toLocaleString()}</span>
                        <span style={styles.statLabel}>Monthly Sales</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}><DollarSign size={24} /></div>
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>Rs. {stats.totalSales.toLocaleString()}</span>
                        <span style={styles.statLabel}>Total Sales</span>
                    </div>
                </div>
            </div>



            {/* Location Section */}
            <div style={styles.card}>
                <h2 style={styles.cardTitle}><MapPin size={20} /> Location</h2>
                <p style={styles.addressText}>{profile.address || 'No address details provided.'}</p>
                <div style={styles.mapContainer}>
                    <MapContainer
                        center={location}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        dragging={false}
                        zoomControl={false}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={location} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}
