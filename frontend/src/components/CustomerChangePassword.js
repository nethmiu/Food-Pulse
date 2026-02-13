import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Save, Eye, EyeOff } from 'lucide-react';
import CustomModal from './CustomModal';

const CustomerChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'New passwords do not match',
                type: 'alert'
            });
            return;
        }

        if (newPassword.length < 6) {
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
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            await axios.put('http://localhost:5000/api/users/profile/password', {
                currentPassword,
                newPassword
            }, config);

            setModal({
                isOpen: true,
                title: 'Success',
                message: 'Password updated successfully!',
                type: 'success'
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
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
            padding: '20px',
            color: '#fff',
            maxWidth: '600px',
            margin: '0 auto'
        },
        header: {
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '30px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
        },
        card: {
            background: '#1a1a1a',
            borderRadius: '20px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
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
        inputWrapper: {
            position: 'relative'
        },
        input: {
            width: '100%',
            padding: '12px 40px 12px 40px', // Left padding for lock icon, right for eye icon
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s'
        },
        iconLeft: {
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666'
        },
        iconRight: {
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666',
            cursor: 'pointer'
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
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Change Password</h1>

            <div style={styles.card}>
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Current Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} style={styles.iconLeft} />
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                style={styles.input}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                            <div onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.iconRight}>
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>New Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} style={styles.iconLeft} />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                style={styles.input}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <div onClick={() => setShowNewPassword(!showNewPassword)} style={styles.iconRight}>
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm New Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} style={styles.iconLeft} />
                            <input
                                type="password"
                                style={styles.input}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={styles.saveButton}
                        disabled={isLoading}
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
                onClose={() => setModal({ ...modal, isOpen: false })}
            />
        </div>
    );
};

export default CustomerChangePassword;
