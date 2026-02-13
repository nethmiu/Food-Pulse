import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CustomerSidebar from '../components/CustomerSidebar';
import CustomModal from '../components/CustomModal';
import CustomerProfileHeader from '../components/CustomerProfileHeader';
import { User, Mail, MapPin, Phone, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerProfileManage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success', onConfirm: null });
    const [deleteEmail, setDeleteEmail] = useState('');
    const deleteEmailRef = useRef('');
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
                const user = res.data.user;
                const initialData = {
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: user.address || ''
                };
                setFormData(initialData);
                setOriginalData(initialData);

                if (user.image) {
                    setImagePreview(`http://localhost:5000/uploads/${user.image}`);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setModal({ type: 'alert', title: 'Error', message: 'Failed to load profile data.', isOpen: true });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const confirmDelete = async () => {
        if (deleteEmailRef.current !== formData.email) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Email does not match. Please type your registered email to confirm.',
                type: 'alert'
            });
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                data: { email: deleteEmailRef.current }
            };

            await axios.delete('http://localhost:5000/api/users/profile/delete', config);

            localStorage.removeItem('userInfo');
            navigate('/login');
        } catch (error) {
            console.error("Error deleting account:", error);
            setModal({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Failed to delete account',
                type: 'alert'
            });
        }
    };

    const handleDeleteClick = () => {
        setDeleteEmail('');
        deleteEmailRef.current = '';

        setModal({
            isOpen: true,
            title: 'Delete Account?',
            message: `This action is permanent and cannot be undone. To confirm, please type your email address: ${formData.email}`,
            type: 'confirm',
            onConfirm: confirmDelete
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('address', formData.address);
            if (image) {
                formDataToSend.append('image', image);
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                    // Axios sets Content-Type to multipart/form-data with boundary automatically
                }
            };

            const res = await axios.put('http://localhost:5000/api/users/profile/update', formDataToSend, config);

            // Update local storage if needed (name/email might change)
            const updatedUserInfo = { ...userInfo, ...res.data };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

            setModal({
                isOpen: true,
                title: 'Success',
                message: 'Profile updated successfully!',
                type: 'success',
                onConfirm: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    navigate('/customer/profile/view');
                }
            });

        } catch (error) {
            console.error("Error updating profile:", error);
            setModal({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update profile.',
                type: 'alert'
            });
        } finally {
            setSaving(false);
        }
    };

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
        formGroup: {
            marginBottom: '24px'
        },
        label: {
            display: 'block',
            color: '#888',
            fontSize: '14px',
            marginBottom: '8px',
            alignItems: 'center',
            gap: '8px'
        },
        input: {
            width: '100%',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '16px',
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            transition: 'all 0.3s ease'
        },
        inputFocus: {
            borderColor: '#FFD700',
            background: 'rgba(255, 215, 0, 0.05)'
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
        },
        submitBtn: {
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#000',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%',
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            maxWidth: '200px',
            marginLeft: 'auto'
        },
        messageBox: {
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        }
    };

    if (loading) return (
        <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#FFD700' }}>Loading...</div>
        </div>
    );

    return (
        <div style={styles.container}>
            <CustomerSidebar />

            <div style={styles.main}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button
                        style={{ ...styles.backBtn, marginBottom: 0 }}
                        onClick={() => navigate('/customer/profile/view')}
                        onMouseOver={(e) => e.target.style.color = '#FFD700'}
                        onMouseOut={(e) => e.target.style.color = '#888'}
                    >
                        <ArrowLeft size={18} />
                        Back to Profile
                    </button>
                    <CustomerProfileHeader />
                </div>

                <div style={styles.header}>
                    <h1 style={styles.title}>Edit Profile</h1>
                    <p style={styles.subtitle}>Update your personal information</p>
                </div>

                <div style={styles.card}>
                    <form onSubmit={handleSubmit}>
                        {/* Profile Image Upload */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: '#333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                marginBottom: '15px',
                                border: '2px solid #FFD700',
                                position: 'relative'
                            }}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={50} color="#666" />
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                id="profile-image-upload"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor="profile-image-upload"
                                style={{
                                    color: '#FFD700',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    padding: '8px 16px',
                                    border: '1px solid #FFD700',
                                    borderRadius: '20px',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => { e.target.style.background = '#FFD700'; e.target.style.color = '#000'; }}
                                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#FFD700'; }}
                            >
                                Change Photo
                            </label>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}><User size={16} color="#FFD700" style={{ marginBottom: '-3px', marginRight: '5px' }} /> Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                style={styles.input}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FFD700';
                                    e.target.style.background = 'rgba(255, 215, 0, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}><Mail size={16} color="#FFD700" style={{ marginBottom: '-3px', marginRight: '5px' }} /> Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={styles.input}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FFD700';
                                    e.target.style.background = 'rgba(255, 215, 0, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}><Phone size={16} color="#FFD700" style={{ marginBottom: '-3px', marginRight: '5px' }} /> Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={styles.input}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FFD700';
                                    e.target.style.background = 'rgba(255, 215, 0, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}><MapPin size={16} color="#FFD700" style={{ marginBottom: '-3px', marginRight: '5px' }} /> Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                style={styles.input}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FFD700';
                                    e.target.style.background = 'rgba(255, 215, 0, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                                placeholder="Enter your address"
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                style={{
                                    background: 'rgba(255, 0, 0, 0.1)',
                                    color: '#ff4444',
                                    border: '1px solid #ff4444',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => { e.target.style.background = '#ff4444'; e.target.style.color = '#fff'; }}
                                onMouseOut={(e) => { e.target.style.background = 'rgba(255, 0, 0, 0.1)'; e.target.style.color = '#ff4444'; }}
                            >
                                Delete Account
                            </button>

                            <button
                                type="submit"
                                style={{
                                    ...styles.submitBtn,
                                    margin: 0,
                                    opacity: (!image && originalData && JSON.stringify(formData) === JSON.stringify(originalData)) || saving ? 0.5 : 1,
                                    cursor: (!image && originalData && JSON.stringify(formData) === JSON.stringify(originalData)) || saving ? 'not-allowed' : 'pointer',
                                    filter: (!image && originalData && JSON.stringify(formData) === JSON.stringify(originalData)) ? 'grayscale(100%)' : 'none'
                                }}
                                disabled={(!image && originalData && JSON.stringify(formData) === JSON.stringify(originalData)) || saving}
                            >
                                {saving ? 'Saving...' : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

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
            </div>
        </div>
    );
};

export default CustomerProfileManage;
