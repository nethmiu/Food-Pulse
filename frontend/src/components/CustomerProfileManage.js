import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { User, MapPin, Upload, Trash2, Save, Locate, Phone, Mail } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import CustomModal from './CustomModal';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

function ChangeView({ center }) {
    const map = useMap();
    map.setView(center);
    return null;
}

const CustomerProfileManage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState({ lat: 6.9271, lng: 79.8612 }); // Default Colombo
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success', onConfirm: null });
    const [deleteEmail, setDeleteEmail] = useState('');
    const deleteEmailRef = useRef('');

    // Location Search
    const [locationSearchQuery, setLocationSearchQuery] = useState('');

    const fileInputRef = useRef(null);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.token;

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const user = res.data.user;
            setProfile(user);
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
            setAddress(user.address || '');
            if (user.location) setLocation(user.location);
            if (user.image) setImagePreview(`http://localhost:5000/uploads/${user.image}`);

        } catch (error) {
            console.error("Error fetching profile", error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleFindMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    alert('Unable to retrieve your location');
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleLocationSearch = async () => {
        if (!locationSearchQuery.trim()) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newLoc = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setLocation(newLoc);
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            alert('Error searching for location');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email); // Usually email update requires re-verification, but simple update here
        formData.append('phone', phone);
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

            // Update local storage 
            const updatedUser = { ...userInfo, ...res.data };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));

            setModal({
                isOpen: true,
                title: 'Success',
                message: 'Profile updated successfully!',
                type: 'success'
            });
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
            padding: '20px',
            color: '#fff',
            maxWidth: '800px',
            margin: '0 auto'
        },
        header: {
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '30px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        card: {
            background: '#1a1a1a',
            borderRadius: '20px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
        imageSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px'
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
            color: '#fff',
            transition: 'background 0.3s'
        },
        inputGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s'
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
            gap: '10px',
            width: '100%',
            justifyContent: 'center',
            marginTop: '20px'
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
            gap: '10px',
            marginTop: '40px',
            width: '100%',
            justifyContent: 'center'
        },
        mapContainer: {
            height: '250px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginTop: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }
    };

    if (!profile) return <div style={{ padding: '40px', color: '#fff' }}>Loading...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Manage Profile</h1>

            <div style={styles.card}>
                <form onSubmit={handleUpdate}>
                    <div style={styles.imageSection}>
                        <img
                            src={imagePreview || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            style={styles.previewImage}
                        />
                        <div
                            style={styles.uploadBtn}
                            onClick={() => fileInputRef.current.click()}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        >
                            <Upload size={18} />
                            Change Photo
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
                            <label style={styles.label}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="text"
                                    style={{ ...styles.input, paddingLeft: '40px' }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="email"
                                    style={{ ...styles.input, paddingLeft: '40px' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Phone Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="text"
                                style={{ ...styles.input, paddingLeft: '40px' }}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Delivery Address</label>
                        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '10px', flex: 1, alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Search city..."
                                    value={locationSearchQuery}
                                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                                    style={{ ...styles.input, width: '100%' }}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLocationSearch())}
                                />
                                <button
                                    type="button"
                                    onClick={handleLocationSearch}
                                    style={{
                                        background: '#FFD700',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 20px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '13px',
                                        whiteSpace: 'nowrap',
                                        height: '45px'
                                    }}
                                >
                                    Search
                                </button>
                            </div>
                            <button type="button" onClick={handleFindMe} style={styles.uploadBtn}>
                                <Locate size={18} />
                                Find Me
                            </button>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666', zIndex: 1 }} />
                            <input
                                type="text"
                                style={{ ...styles.input, paddingLeft: '40px' }}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter full address"
                            />
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
                    </div>

                    <button
                        type="submit"
                        style={styles.saveButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : (
                            <>
                                <Save size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>

                <button style={styles.deleteButton} onClick={handleDelete}>
                    <Trash2 size={20} />
                    Delete Account
                </button>
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
};

export default CustomerProfileManage;
