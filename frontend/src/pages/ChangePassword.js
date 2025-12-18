import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Save, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import CustomModal from '../components/CustomModal';

export default function ChangePassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.token;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleShowPassword = (field) => {
        setShowPassword({ ...showPassword, [field]: !showPassword[field] });
    };

    const handleCloseModal = () => {
        setModal({ ...modal, isOpen: false });
        if (modal.type === 'success') {
            localStorage.removeItem('userInfo');
            navigate('/login');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'New passwords do not match',
                type: 'alert'
            });
            return;
        }

        if (formData.newPassword.length < 6) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Password must be at least 6 characters',
                type: 'alert'
            });
            return;
        }

        setIsLoading(true);

        try {
            await axios.put('http://localhost:5000/api/users/profile/password',
                {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setModal({
                isOpen: true,
                title: 'Success',
                message: 'Password updated successfully. Logging out...',
                type: 'success'
            });

            setTimeout(() => {
                localStorage.removeItem('userInfo');
                navigate('/login');
            }, 2000);
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update password',
                type: 'alert'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        container: {
            padding: '40px',
            fontFamily: "'Inter', sans-serif",
            color: '#fff',
            maxWidth: '600px',
            margin: '0 auto'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '800',
            marginBottom: '30px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
        },
        card: {
            background: '#1a1a1a',
            borderRadius: '20px',
            padding: '40px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        },
        inputGroup: {
            marginBottom: '24px',
            position: 'relative'
        },
        label: {
            display: 'block',
            marginBottom: '10px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.95rem'
        },
        inputWrapper: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        },
        input: {
            width: '100%',
            padding: '14px 16px',
            paddingRight: '50px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease'
        },
        icon: {
            position: 'absolute',
            right: '15px',
            color: 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer'
        },
        button: {
            width: '100%',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#000',
            padding: '16px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '20px',
            transition: 'transform 0.2s ease'
        }
    };

    const isLengthValid = formData.newPassword.length >= 6;
    const isMatchValid = formData.newPassword === formData.confirmPassword && formData.newPassword !== '';
    const isFormValid = isLengthValid && isMatchValid && formData.currentPassword;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Change Password</h1>

            <div style={styles.card}>
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Current Password</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type={showPassword.current ? "text" : "password"}
                                name="currentPassword"
                                style={styles.input}
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                            />
                            <div style={styles.icon} onClick={() => toggleShowPassword('current')}>
                                {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                            </div>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>New Password</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type={showPassword.new ? "text" : "password"}
                                name="newPassword"
                                style={styles.input}
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                            <div style={styles.icon} onClick={() => toggleShowPassword('new')}>
                                {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                            </div>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm New Password</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                name="confirmPassword"
                                style={styles.input}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <div style={styles.icon} onClick={() => toggleShowPassword('confirm')}>
                                {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </div>
                        </div>
                    </div>

                    {/* Live Validation Indicators */}
                    <div style={{ marginBottom: '24px', padding: '15px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: isLengthValid ? '#10b981' : 'rgba(255,255,255,0.5)', transition: 'color 0.3s ease' }}>
                            {isLengthValid ? <CheckCircle size={18} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid currentColor' }}></div>}
                            <span style={{ fontSize: '0.9rem', fontWeight: isLengthValid ? '600' : '400' }}>At least 6 characters</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isMatchValid ? '#10b981' : 'rgba(255,255,255,0.5)', transition: 'color 0.3s ease' }}>
                            {isMatchValid ? <CheckCircle size={18} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid currentColor' }}></div>}
                            <span style={{ fontSize: '0.9rem', fontWeight: isMatchValid ? '600' : '400' }}>Passwords match</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{ ...styles.button, opacity: isFormValid ? 1 : 0.5, cursor: isFormValid ? 'pointer' : 'not-allowed' }}
                        disabled={isLoading || !isFormValid}
                    >
                        {isLoading ? 'Updating...' : (
                            <>
                                <Save size={20} />
                                Update Password
                            </>
                        )}
                    </button>
                </form>
            </div>

            <CustomModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={handleCloseModal}
            />
        </div>
    );
}
