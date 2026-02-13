import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle, ShoppingBag, Store, Bike, MapPin, Locate, Phone } from 'lucide-react';
import CustomModal from './CustomModal';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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

const MapRecenter = ({ lat, lng }) => {
    const map = useMap();
    React.useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 13);
        }
    }, [lat, lng, map]);
    return null;
};

const Register = () => {
    const [formData, setFormData] = useState({ name: '', username: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer', address: '' });
    const [location, setLocation] = useState({ lat: 6.9271, lng: 79.8612 }); // Default Colombo
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false
    });
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [loading, setLoading] = useState(false);

    // Location Search State
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
        onConfirm: null
    });

    const navigate = useNavigate();

    const validatePassword = (password) => {
        setPasswordValidation({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            validatePassword(value);
            if (formData.confirmPassword) {
                setPasswordsMatch(value === formData.confirmPassword);
            }
        }

        if (name === 'confirmPassword') {
            setPasswordsMatch(value === formData.password);
        }
    };

    const isPasswordValid = () => {
        return passwordValidation.length && passwordValidation.uppercase &&
            passwordValidation.number && passwordValidation.special && passwordsMatch;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Username Validation
        if (formData.username.length < 4) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Username must be at least 4 characters long.',
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please enter a valid email address.',
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        // Phone Validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Phone number must be exactly 10 digits.',
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        if (!isPasswordValid()) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please ensure password meets all requirements and passwords match',
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/users/register', {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
                address: formData.address,
                location: formData.role === 'restaurant' ? location : undefined
            });
            setModalConfig({
                isOpen: true,
                type: 'success',
                title: 'Welcome to Food Pulse!',
                message: 'Registration Successful! You can now log in to your account.',
                onConfirm: () => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    navigate('/login');
                }
            });
        } catch (err) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Registration Failed',
                message: err.response?.data?.message || 'Error registering user',
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
        } finally {
            setLoading(false);
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
                    // Location access denied or errored. Fail silently and let user manually pick location.
                    console.warn("Geolocation denied or failed", error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
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
                setSearchResult(newLoc); // Triggers MapRecenter
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            alert('Error searching for location');
        }
    };

    const ValidationCheck = ({ valid, text }) => (
        <div style={styles.validationCheck}>
            {valid ? (
                <CheckCircle size={14} style={{ color: '#FFD700' }} />
            ) : (
                <AlertCircle size={14} style={{ color: '#555' }} />
            )}
            <span style={{ color: valid ? '#FFD700' : '#777' }}>{text}</span>
        </div>
    );

    const roleOptions = [
        { id: 'customer', label: 'Customer', icon: ShoppingBag, description: 'Order food from restaurants' },
        { id: 'restaurant', label: 'Restaurant', icon: Store, description: 'Manage your restaurant' },
        { id: 'rider', label: 'Rider', icon: Bike, description: 'Deliver orders to customers' }
    ];

    const styles = {
        pageWrapper: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 20px',
            fontFamily: "'Poppins', 'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        },
        bgDecorator: {
            position: 'absolute',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
            zIndex: 0
        },
        bgDecorTop: {
            width: '400px',
            height: '400px',
            top: '-150px',
            right: '-150px'
        },
        bgDecorBottom: {
            width: '350px',
            height: '350px',
            bottom: '-100px',
            left: '-100px'
        },
        container: {
            width: '100%',
            maxWidth: '800px',
            position: 'relative',
            zIndex: 10
        },
        header: {
            textAlign: 'center',
            marginBottom: '40px'
        },
        title: {
            fontSize: '48px',
            fontWeight: '900',
            color: '#FFD700',
            marginBottom: '12px',
            fontFamily: "'Bebas Neue', 'Poppins', sans-serif",
            letterSpacing: '3px'
        },
        subtitle: {
            fontSize: '15px',
            color: '#888',
            fontFamily: "'Inter', sans-serif",
            fontWeight: '400',
            letterSpacing: '0.5px'
        },
        formContainer: {
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(20, 20, 20, 0.85) 100%)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '24px',
            padding: '45px 35px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 60px rgba(255, 215, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        },
        roleSelectionLabel: {
            fontSize: '14px',
            fontWeight: '700',
            color: '#FFD700',
            marginBottom: '16px',
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: '1px',
            textTransform: 'uppercase'
        },
        roleCardsContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
            marginBottom: '32px'
        },
        roleCard: {
            padding: '18px 12px',
            borderRadius: '16px',
            border: '2px solid rgba(255, 215, 0, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
        },
        roleCardActive: {
            border: '2px solid #FFD700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
        },
        roleCardIcon: {
            width: '32px',
            height: '32px'
        },
        roleCardLabel: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#fff',
            fontFamily: "'Poppins', sans-serif"
        },
        roleCardLabelActive: {
            color: '#FFD700'
        },
        roleCardDescription: {
            fontSize: '11px',
            color: '#888',
            fontFamily: "'Inter', sans-serif",
            lineHeight: '1.3'
        },
        formGroup: {
            marginBottom: '18px'
        },
        label: {
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#FFD700',
            marginBottom: '8px',
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
        },
        inputField: {
            width: '100%',
            padding: '14px 14px',
            fontSize: '14px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            border: '2px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '12px',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
            outline: 'none'
        },
        inputFieldFocus: {
            borderColor: '#FFD700',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
        },
        inputIcon: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        },
        iconWrapper: {
            position: 'absolute',
            right: '14px',
            display: 'flex',
            alignItems: 'center',
            color: '#666',
            cursor: 'pointer',
            transition: 'color 0.3s ease'
        },
        passwordInput: {
            paddingRight: '45px'
        },
        validationBox: {
            marginTop: '10px',
            padding: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 215, 0, 0.15)'
        },
        validationTitle: {
            fontSize: '11px',
            color: '#777',
            marginBottom: '8px',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: '600',
            textTransform: 'uppercase'
        },
        validationCheck: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            marginBottom: '4px'
        },
        matchIndicator: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
            fontSize: '12px',
            fontWeight: '500'
        },
        submitButton: {
            width: '100%',
            padding: '14px',
            marginTop: '24px',
            fontSize: '15px',
            fontWeight: '700',
            backgroundColor: '#555',
            color: '#999',
            border: 'none',
            borderRadius: '12px',
            cursor: 'not-allowed',
            fontFamily: "'Poppins', sans-serif",
            transition: 'all 0.3s ease',
            letterSpacing: '1px',
            textTransform: 'uppercase'
        },
        submitButtonActive: {
            backgroundColor: '#FFD700',
            color: '#000',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(255, 215, 0, 0.3)'
        },
        submitButtonHover: {
            backgroundColor: '#FFA500',
            boxShadow: '0 12px 30px rgba(255, 215, 0, 0.4)',
            transform: 'translateY(-2px)'
        },
        footerText: {
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '13px',
            color: '#666',
            fontFamily: "'Inter', sans-serif"
        },
        footerLink: {
            color: '#FFD700',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'color 0.3s ease',
            cursor: 'pointer'
        }
    };

    return (
        <div style={styles.pageWrapper}>
            {/* Background Decorators */}
            <div style={{ ...styles.bgDecorator, ...styles.bgDecorTop }}></div>
            <div style={{ ...styles.bgDecorator, ...styles.bgDecorBottom }}></div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

                input::placeholder {
                    color: #555;
                }

                input:focus {
                    outline: none;
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .register-container {
                    animation: slideInUp 0.6s ease-out;
                }
            `}</style>

            <div style={styles.container} className="register-container">
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>FOOD PULSE</h1>
                    <p style={styles.subtitle}>Join our premium food delivery platform</p>
                </div>

                {/* Form Container */}
                <div style={styles.formContainer}>
                    <form onSubmit={handleRegister}>
                        {/* Role Selection */}
                        <div style={styles.formGroup}>
                            <div style={styles.roleSelectionLabel}>Select your account type</div>
                            <div style={styles.roleCardsContainer}>
                                {roleOptions.map((option) => {
                                    const IconComponent = option.icon;
                                    const isSelected = formData.role === option.id;
                                    return (
                                        <div
                                            key={option.id}
                                            style={{
                                                ...styles.roleCard,
                                                ...(isSelected ? styles.roleCardActive : {})
                                            }}
                                            onClick={() => setFormData({ ...formData, role: option.id })}
                                        >
                                            <IconComponent
                                                style={{
                                                    ...styles.roleCardIcon,
                                                    color: isSelected ? '#FFD700' : '#888'
                                                }}
                                            />
                                            <div style={{
                                                ...styles.roleCardLabel,
                                                ...(isSelected ? styles.roleCardLabelActive : {})
                                            }}>
                                                {option.label}
                                            </div>
                                            <div style={styles.roleCardDescription}>
                                                {option.description}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Full Name */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                name="name"
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={styles.inputField}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFieldFocus)}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                                }}
                            />
                        </div>

                        {/* Username */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Username</label>
                            <input
                                name="username"
                                type="text"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={styles.inputField}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFieldFocus)}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                                }}
                            />
                        </div>

                        {/* Email */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={styles.inputField}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFieldFocus)}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                                }}
                            />
                        </div>

                        {/* Phone Number */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <div style={styles.inputIcon}>
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder="Enter Phone Number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    style={styles.inputField}
                                    onFocus={(e) => Object.assign(e.target.style, styles.inputFieldFocus)}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                                    }}
                                />
                                <div style={styles.iconWrapper}>
                                    <Phone size={18} style={{ color: '#666' }} />
                                </div>
                            </div>
                        </div>

                        {/* Address (For Customers) */}
                        {formData.role === 'customer' && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Address</label>
                                <div style={styles.inputIcon}>
                                    <input
                                        name="address"
                                        type="text"
                                        placeholder="Enter your address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        style={styles.inputField}
                                        onFocus={(e) => Object.assign(e.target.style, styles.inputFieldFocus)}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                                            e.target.style.boxShadow = 'none';
                                            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                                        }}
                                    />
                                    <div style={styles.iconWrapper}>
                                        <MapPin size={18} style={{ color: '#666' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Create Password</label>
                            <div style={styles.inputIcon}>
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={{ ...styles.inputField, ...styles.passwordInput }}
                                    onFocus={(e) => Object.assign(e.target.style, styles.inputFieldFocus)}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                                    }}
                                />
                                <div
                                    style={styles.iconWrapper}
                                    onClick={() => setShowPassword(!showPassword)}
                                    onMouseEnter={(e) => e.target.style.color = '#FFD700'}
                                    onMouseLeave={(e) => e.target.style.color = '#666'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>

                            {/* Password Validation */}
                            {formData.password && (
                                <div style={styles.validationBox}>
                                    <div style={styles.validationTitle}>Password Requirements:</div>
                                    <ValidationCheck valid={passwordValidation.length} text="At least 8 characters" />
                                    <ValidationCheck valid={passwordValidation.uppercase} text="One uppercase letter" />
                                    <ValidationCheck valid={passwordValidation.number} text="One number" />
                                    <ValidationCheck valid={passwordValidation.special} text="One special character (!@#$%^&*)" />
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Confirm Password</label>
                            <div style={styles.inputIcon}>
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    style={{ ...styles.inputField, ...styles.passwordInput }}
                                    onFocus={(e) => Object.assign(e.target.style, styles.inputFieldFocus)}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                                    }}
                                />
                                <div
                                    style={styles.iconWrapper}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    onMouseEnter={(e) => e.target.style.color = '#FFD700'}
                                    onMouseLeave={(e) => e.target.style.color = '#666'}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>

                            {/* Password Match Indicator */}
                            {formData.confirmPassword && (
                                <div style={{ ...styles.matchIndicator, color: passwordsMatch ? '#FFD700' : '#FF6B6B' }}>
                                    {passwordsMatch ? (
                                        <CheckCircle size={14} style={{ color: '#FFD700' }} />
                                    ) : (
                                        <AlertCircle size={14} style={{ color: '#FF6B6B' }} />
                                    )}
                                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                                </div>
                            )}
                        </div>

                        {/* Restaurant Specific Fields */}
                        {formData.role === 'restaurant' && (
                            <div style={{ marginTop: '20px', marginBottom: '30px', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '15px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <h3 style={{ color: '#FFD700', fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                                    <MapPin size={20} />
                                    Restaurant Location
                                </h3>

                                {/* Address Input */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Restaurant Address</label>
                                    <div style={styles.inputIcon}>
                                        <input
                                            name="address"
                                            type="text"
                                            placeholder="Enter full address"
                                            value={formData.address || ''}
                                            onChange={handleChange}
                                            required={formData.role === 'restaurant'}
                                            style={styles.inputField}
                                            onFocus={(e) => Object.assign(e.target.style, styles.inputFieldFocus)}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                                                e.target.style.boxShadow = 'none';
                                                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                                            }}
                                        />
                                        <div style={styles.iconWrapper}>
                                            <MapPin size={18} style={{ color: '#666' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Map */}
                                <div style={{ marginTop: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', gap: '10px', flex: 1, marginRight: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="Search city..."
                                                value={locationSearchQuery}
                                                onChange={(e) => setLocationSearchQuery(e.target.value)}
                                                style={{
                                                    padding: '8px', borderRadius: '8px', border: '1px solid #444',
                                                    background: 'rgba(0, 0, 0, 0.6)', color: '#fff', width: '100%'
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLocationSearch())}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleLocationSearch}
                                                style={{
                                                    background: '#FFD700', color: '#000', height: '50px', border: 'none', borderRadius: '8px',
                                                    padding: '5px 15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                                                }}
                                            >
                                                Search
                                            </button>
                                        </div>
                                        <label style={{ ...styles.label, marginBottom: '0', display: 'none' }}>Pin Location on Map</label>
                                        <button
                                            type="button"
                                            onClick={handleFindMe}
                                            style={{
                                                background: 'rgba(255, 215, 0, 0.1)',
                                                border: '1px solid rgba(255, 215, 0, 0.3)',
                                                color: '#FFD700',
                                                padding: '5px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = 'rgba(255, 215, 0, 0.2)';
                                                e.target.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'rgba(255, 215, 0, 0.1)';
                                                e.target.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <Locate size={14} />
                                            Find Me
                                        </button>
                                    </div>
                                    <div style={{
                                        height: '300px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        position: 'relative',
                                        zIndex: 0
                                    }}>
                                        <MapContainer center={location} zoom={13} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            <LocationMarker location={location} setLocation={setLocation} />
                                            {searchResult && <MapRecenter lat={searchResult.lat} lng={searchResult.lng} />}
                                        </MapContainer>
                                    </div>
                                    <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>
                                        Click on the map to set your exact location
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid()}
                            style={{
                                ...styles.submitButton,
                                ...(isPasswordValid() && !loading ? styles.submitButtonActive : {})
                            }}
                            onMouseEnter={(e) => {
                                if (isPasswordValid() && !loading) {
                                    Object.assign(e.target.style, styles.submitButtonHover);
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (isPasswordValid() && !loading) {
                                    e.target.style.backgroundColor = '#FFD700';
                                    e.target.style.boxShadow = '0 8px 20px rgba(255, 215, 0, 0.3)';
                                    e.target.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p style={styles.footerText}>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            style={styles.footerLink}
                            onMouseEnter={(e) => e.target.style.color = '#FFA500'}
                            onMouseLeave={(e) => e.target.style.color = '#FFD700'}
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>


            <CustomModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
            />
        </div >
    );
};

export default Register;