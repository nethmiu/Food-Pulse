import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { User, MapPin, Upload, Trash2, DollarSign, Calendar, Save, Power, Locate } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CustomModal from '../components/CustomModal';
import { useNavigate } from 'react-router-dom';

// Fix for Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function LocationMarker({ location, setLocation }) {
    useMapEvents({
        click(e) {
            setLocation(e.latlng);
        },
    });
    return location === null ? null : <Marker position={location}></Marker>;
}

// Component to handle map view changes
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center);
    return null;
}

export default function RestaurantProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ totalSales: 0, monthlySales: 0, todaySales: 0 });
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState({ lat: 6.9271, lng: 79.8612 }); // Default to Colombo
    const [originalData, setOriginalData] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success', onConfirm: null });

    // Delete Confirmation State
    const [deleteEmail, setDeleteEmail] = useState('');

    const fileInputRef = useRef(null);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.token;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const user = res.data.user;
                setProfile(user);
                setStats(res.data.stats);
                setName(user.name);
                setEmail(user.email);
                setDescription(user.description || '');
                setAddress(user.address || '');
                if (user.location) setLocation(user.location);
                if (user.image) setImagePreview(`http://localhost:5000/uploads/${user.image}`);

                setOriginalData({
                    name: user.name,
                    email: user.email,
                    description: user.description || '',
                    address: user.address || '',
                    location: user.location || { lat: 6.9271, lng: 79.8612 }
                });
            } catch (error) {
                console.error("Error fetching profile", error);
            }
        };
        fetchProfile();
    }, [token]);

    const handleFindMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    alert("Could not get your location. Please ensure location services are enabled.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('description', description);
        formData.append('address', address);
        formData.append('location', JSON.stringify(location));
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const res = await axios.put('http://localhost:5000/api/users/profile/update', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update local storage if needed, but safer to just update state
            const updatedUser = { ...userInfo, ...res.data };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser)); // Be careful updating token/role if not intended

            setModal({
                isOpen: true,
                title: 'Success',
                message: 'Profile updated successfully!',
                type: 'success'
            });

            setTimeout(() => {
                navigate('/restaurant/profile/view');
            }, 1000);
        } catch (error) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update profile',
                type: 'alert'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Check for changes
    const hasChanges = Boolean(
        originalData && (
            name !== originalData.name ||
            email !== originalData.email ||
            description !== originalData.description ||
            address !== originalData.address ||
            JSON.stringify(location) !== JSON.stringify(originalData.location) ||
            imageFile !== null
        )
    );

    // Use Ref to access latest email value inside modal callback
    const deleteEmailRef = useRef('');

    const confirmDelete = async () => {
        if (deleteEmailRef.current !== profile.email) {
            alert("Email does not match. Please type your registered email to confirm.");
            return;
        }

        try {
            await axios.delete('http://localhost:5000/api/users/profile/delete', {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem('userInfo');
            navigate('/login');
        } catch (error) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Failed to delete account',
                type: 'alert'
            });
        }
    };

    const handleDelete = () => {
        setDeleteEmail('');
        deleteEmailRef.current = '';

        setModal({
            isOpen: true,
            title: 'Delete Account?',
            message: `This action is permanent and cannot be undone. To confirm, please type your email address: ${profile.email}`,
            type: 'confirm',
            onConfirm: confirmDelete
        });
    };

    const styles = {
        container: {
            padding: '40px',
            fontFamily: "'Inter', sans-serif",
            color: '#fff',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
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
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#fff'
        },
        statLabel: {
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.6)'
        },
        formCard: {
            background: '#1a1a1a',
            borderRadius: '20px',
            padding: '40px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        inputGroup: {
            marginBottom: '24px'
        },
        label: {
            display: 'block',
            marginBottom: '10px',
            color: 'rgba(255, 255, 255, 0.8)'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '1rem'
        },
        mapContainer: {
            height: '300px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        },
        imageSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '24px'
        },
        previewImage: {
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #FFD700'
        },
        uploadBtn: {
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fff'
        },
        actionButtons: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '40px'
        },
        saveButton: {
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#000',
            padding: '14px 32px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        deleteButton: {
            background: 'rgba(220, 38, 38, 0.1)',
            color: '#ef4444',
            padding: '14px 32px',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Restaurant Profile</h1>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: profile.isRestaurantOpen ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    color: profile.isRestaurantOpen ? '#10b981' : '#ef4444',
                    border: `1px solid ${profile.isRestaurantOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                    <Power size={16} />
                    <span>{profile.isRestaurantOpen ? 'Open Now' : 'Closed'}</span>
                </div>
            </div>



            {/* Profile Form */}
            <div style={styles.formCard}>
                <form onSubmit={handleUpdate}>
                    <div style={styles.imageSection}>
                        <img
                            src={imagePreview || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            style={styles.previewImage}
                        />
                        <div style={styles.uploadBtn} onClick={() => fileInputRef.current.click()}>
                            <Upload size={20} />
                            Change Profile Image
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                            accept="image/*"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Restaurant Name</label>
                            <input
                                type="text"
                                style={styles.input}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                style={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell customers about your restaurant..."
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Location (Click on map to update)</label>
                        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={handleFindMe} style={styles.uploadBtn}>
                                <Locate size={18} />
                                Find Me
                            </button>
                        </div>
                        <div style={styles.mapContainer}>
                            <MapContainer
                                center={location}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <ChangeView center={location} />
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker location={location} setLocation={setLocation} />
                            </MapContainer>
                        </div>
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="Address description (optional)"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div style={styles.actionButtons}>
                        <button type="button" style={styles.deleteButton} onClick={handleDelete}>
                            <Trash2 size={20} />
                            Delete Account
                        </button>

                        <button
                            type="submit"
                            style={{
                                ...styles.saveButton,
                                opacity: hasChanges ? 1 : 0.5,
                                cursor: hasChanges ? 'pointer' : 'not-allowed',
                                background: hasChanges ? styles.saveButton.background : '#333'
                            }}
                            disabled={!hasChanges || isLoading}
                        >
                            {isLoading ? 'Saving...' : (
                                <>
                                    <Save size={20} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <CustomModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm}
            >
                {modal.title === 'Delete Account?' && (
                    <input
                        type="email"
                        placeholder="Type your email to confirm"
                        style={{
                            width: '90%',
                            padding: '12px',
                            marginTop: '10px',
                            marginBottom: '20px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                        value={deleteEmail}
                        onChange={(e) => {
                            setDeleteEmail(e.target.value);
                            deleteEmailRef.current = e.target.value;
                        }}
                    />
                )}
            </CustomModal>
        </div>
    );
}
