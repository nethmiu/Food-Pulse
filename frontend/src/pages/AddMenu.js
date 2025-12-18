import React, { useState, useRef, useEffect } from 'react';
import { Plus, Upload, DollarSign, Image as ImageIcon, X, Edit2, Package, List } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomModal from '../components/CustomModal';

export default function AddMenu() {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are editing an item passed via state
    const editingItem = location.state?.item;

    const [name, setName] = useState(editingItem?.name || '');
    const [price, setPrice] = useState(editingItem?.price || '');
    const [category, setCategory] = useState(editingItem?.category || 'Appetizer');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(editingItem?.image ? `http://localhost:5000/uploads/${editingItem.image}` : null);
    const [isLoading, setIsLoading] = useState(false);
    const [buttonHover, setButtonHover] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success', onConfirm: null });

    const fileInputRef = useRef(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.token;

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category', category);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (editingItem) {
                await axios.put(`http://localhost:5000/api/menu/update/${editingItem._id}`, formData, config);
                setModal({
                    isOpen: true,
                    title: 'Success!',
                    message: 'Menu item updated successfully.',
                    type: 'success',
                    onConfirm: () => navigate('/restaurant/menu/list')
                });
            } else {
                await axios.post('http://localhost:5000/api/menu/add', formData, config);
                setModal({
                    isOpen: true,
                    title: 'Success!',
                    message: 'Menu item added successfully.',
                    type: 'success',
                    onConfirm: () => navigate('/restaurant/menu/list')
                });
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        container: {
            padding: '40px 40px',
            fontFamily: "'Inter', sans-serif",
            color: '#ffffff',
            maxWidth: '1600px',
            margin: '0 auto'
        },
        header: {
            textAlign: 'center',
            marginBottom: '50px'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px',
            letterSpacing: '1px'
        },
        formSection: {
            maxWidth: '700px',
            margin: '0 auto 60px',
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        },
        formTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#FFD700',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        inputGroup: {
            marginBottom: '24px',
            position: 'relative'
        },
        label: {
            display: 'block',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '10px'
        },
        inputWrapper: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        },
        inputIcon: {
            position: 'absolute',
            left: '16px',
            color: 'rgba(255, 255, 255, 0.4)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center'
        },
        input: {
            width: '100%',
            padding: '15px 16px 15px 48px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '0.95rem',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.3s ease',
            outline: 'none'
        },
        buttonGroup: {
            display: 'flex',
            gap: '12px',
            marginTop: '30px'
        },
        submitButton: {
            flex: 1,
            padding: '16px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#000000',
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: '700',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        submitButtonHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 30px rgba(255, 215, 0, 0.4)'
        },
        submitButtonDisabled: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.3)',
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none'
        },
        fileInputLabel: {
            width: '100%',
            padding: '15px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1.5px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s ease'
        },
        previewContainer: {
            marginTop: '15px',
            position: 'relative',
            width: 'full',
            height: '200px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 215, 0, 0.2)'
        },
        previewImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        removeImageBtn: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
        },
        loadingSpinner: {
            width: '20px',
            height: '20px',
            border: '2px solid transparent',
            borderTop: '2px solid #000000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }
    };

    // Check for changes (Edit Mode)
    const hasChanges = Boolean(
        editingItem && (
            name !== editingItem.name ||
            Number(price) !== Number(editingItem.price) ||
            category !== editingItem.category ||
            imageFile !== null
        )
    );

    // Validation
    const isFormValid = editingItem
        ? hasChanges && name && price // Edit Mode: Needs changes + valid fields
        : name && price && imageFile; // Add Mode: Needs all fields

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }
            `}</style>

            <div style={styles.header}>
                <h1 style={styles.title}>{editingItem ? 'Edit Menu Item' : 'Add New  Menu Item'}</h1>
            </div>

            <div style={styles.formSection}>
                <h3 style={styles.formTitle}>
                    {editingItem ? <Edit2 size={24} /> : <Plus size={24} />}
                    {editingItem ? 'Edit Details' : 'Item Details'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Food Name</label>
                        <div style={styles.inputWrapper}>
                            <div style={styles.inputIcon}>
                                <Package size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter food name"
                                style={styles.input}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Category</label>
                        <div style={styles.inputWrapper}>
                            <div style={styles.inputIcon}>
                                <List size={18} />
                            </div>
                            <select
                                style={{ ...styles.input, backgroundColor: '#1a1a1a', color: '#fff' }}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option style={{ backgroundColor: '#000', color: '#fff' }} value="Appetizer">Appetizer</option>
                                <option style={{ backgroundColor: '#000', color: '#fff' }} value="Main Course">Main Course</option>
                                <option style={{ backgroundColor: '#000', color: '#fff' }} value="Dessert">Dessert</option>
                                <option style={{ backgroundColor: '#000', color: '#fff' }} value="Beverage">Beverage</option>
                                <option style={{ backgroundColor: '#000', color: '#fff' }} value="Snack">Snack</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Price (LKR)</label>
                        <div style={styles.inputWrapper}>
                            <div style={styles.inputIcon}>
                                <DollarSign size={18} />
                            </div>
                            <input
                                type="number"
                                placeholder="Enter price"
                                style={styles.input}
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Food Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />

                        {!imagePreview && (
                            <div
                                style={styles.fileInputLabel}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <Upload size={20} />
                                <span>Click to upload image</span>
                            </div>
                        )}

                        {imagePreview && (
                            <div style={styles.previewContainer}>
                                <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                                <button type="button" style={styles.removeImageBtn} onClick={clearImage}>
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={styles.buttonGroup}>
                        <button
                            type="submit"
                            style={{
                                ...styles.submitButton,
                                ...(buttonHover && isFormValid ? styles.submitButtonHover : {}),
                                ...(!isFormValid || isLoading ? styles.submitButtonDisabled : {})
                            }}
                            onMouseEnter={() => setButtonHover(true)}
                            onMouseLeave={() => setButtonHover(false)}
                            disabled={!isFormValid || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div style={styles.loadingSpinner}></div>
                                    {editingItem ? 'UPDATING...' : 'ADDING...'}
                                </>
                            ) : (
                                <>
                                    {editingItem ? <Edit2 size={18} /> : <Plus size={18} />}
                                    {editingItem ? 'UPDATE ITEM' : 'ADD TO MENU'}
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
            />
        </div >
    );
}
