import React, { useState, useEffect } from 'react';
import { Plus, Upload, DollarSign, Image, Trash2, Edit2, Package } from 'lucide-react';

export default function RestaurantHome() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [buttonHover, setButtonHover] = useState(false);

    // Simulated user (in real app, get from localStorage)
    const user = { token: 'demo-token' };
    const token = user?.token;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newItem = {
                _id: Date.now().toString(),
                name,
                price: parseFloat(price),
                image: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
            };

            if (editingId) {
                setMenuItems(menuItems.map(item =>
                    item._id === editingId ? { ...item, name, price: parseFloat(price), image: imageUrl } : item
                ));
                setEditingId(null);
            } else {
                setMenuItems([...menuItems, newItem]);
            }

            setName('');
            setPrice('');
            setImageUrl('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item) => {
        setName(item.name);
        setPrice(item.price.toString());
        setImageUrl(item.image);
        setEditingId(item._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setMenuItems(menuItems.filter(item => item._id !== id));
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setName('');
        setPrice('');
        setImageUrl('');
    };

    useEffect(() => {
        // Simulated initial data
        setMenuItems([
            {
                _id: '1',
                name: 'Gourmet Burger',
                price: 1500,
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
            },
            {
                _id: '2',
                name: 'Caesar Salad',
                price: 950,
                image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'
            },
            {
                _id: '3',
                name: 'Pasta Carbonara',
                price: 1200,
                image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400'
            }
        ]);
    }, []);

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
            padding: '40px 20px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            color: '#ffffff'
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
        subtitle: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.1rem',
            fontWeight: '400'
        },
        formSection: {
            maxWidth: '600px',
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
        inputFocus: {
            background: 'rgba(255, 255, 255, 0.08)',
            borderColor: '#FFD700',
            boxShadow: '0 0 0 3px rgba(255, 215, 0, 0.1)'
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
            cursor: 'not-allowed'
        },
        cancelButton: {
            padding: '16px 30px',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.8)',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: "'Inter', sans-serif"
        },
        divider: {
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent)',
            margin: '60px auto',
            maxWidth: '80%'
        },
        menuSection: {
            maxWidth: '1400px',
            margin: '0 auto'
        },
        sectionTitle: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#FFD700',
            textAlign: 'center',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
        },
        menuGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
            padding: '0 20px'
        },
        menuCard: {
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        },
        menuCardHover: {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(255, 215, 0, 0.2)',
            borderColor: 'rgba(255, 215, 0, 0.4)'
        },
        imageContainer: {
            position: 'relative',
            width: '100%',
            height: '200px',
            overflow: 'hidden',
            background: 'rgba(0, 0, 0, 0.3)'
        },
        menuImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'all 0.3s ease'
        },
        menuImageHover: {
            transform: 'scale(1.1)'
        },
        imageOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%)',
            opacity: 0,
            transition: 'all 0.3s ease'
        },
        imageOverlayVisible: {
            opacity: 1
        },
        cardActions: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            gap: '12px',
            opacity: 0,
            transition: 'all 0.3s ease'
        },
        cardActionsVisible: {
            opacity: 1
        },
        actionButton: {
            width: '44px',
            height: '44px',
            background: 'rgba(255, 215, 0, 0.9)',
            border: 'none',
            borderRadius: '50%',
            color: '#000000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
        },
        actionButtonHover: {
            background: '#FFD700',
            transform: 'scale(1.1)'
        },
        cardContent: {
            padding: '20px'
        },
        itemName: {
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '8px'
        },
        itemPrice: {
            fontSize: '1.5rem',
            fontWeight: '800',
            color: '#FFD700'
        },
        emptyState: {
            textAlign: 'center',
            padding: '80px 20px',
            color: 'rgba(255, 255, 255, 0.5)'
        },
        emptyIcon: {
            color: 'rgba(255, 215, 0, 0.3)',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center'
        },
        emptyText: {
            fontSize: '1.2rem',
            fontWeight: '600'
        },
        loadingSpinner: {
            width: '20px',
            height: '20px',
            border: '2px solid transparent',
            borderTop: '2px solid #000000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        },
        helpText: {
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '8px'
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }
            `}</style>

            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Restaurant Dashboard</h1>
                    <p style={styles.subtitle}>Manage your menu with ease</p>
                </div>

                {/* Add/Edit Form */}
                <div style={styles.formSection}>
                    <h3 style={styles.formTitle}>
                        {editingId ? <Edit2 size={24} /> : <Plus size={24} />}
                        {editingId ? 'Edit Menu Item' : 'Add New  Menu Item'}
                    </h3>

                    <div>
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
                            <label style={styles.label}>Image URL</label>
                            <div style={styles.inputWrapper}>
                                <div style={styles.inputIcon}>
                                    <Image size={18} />
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    style={styles.input}
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </div>
                            <p style={styles.helpText}>
                                Try: images.unsplash.com, pexels.com, or any image URL
                            </p>
                        </div>

                        <div style={styles.buttonGroup}>
                            <button
                                type="button"
                                style={{
                                    ...styles.submitButton,
                                    ...(buttonHover && name && price ? styles.submitButtonHover : {}),
                                    ...(!name || !price || isLoading ? styles.submitButtonDisabled : {})
                                }}
                                onMouseEnter={() => setButtonHover(true)}
                                onMouseLeave={() => setButtonHover(false)}
                                onClick={handleSubmit}
                                disabled={!name || !price || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div style={styles.loadingSpinner}></div>
                                        {editingId ? 'UPDATING...' : 'ADDING...'}
                                    </>
                                ) : (
                                    <>
                                        {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                                        {editingId ? 'UPDATE ITEM' : 'ADD TO MENU'}
                                    </>
                                )}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    style={styles.cancelButton}
                                    onClick={cancelEdit}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div style={styles.divider}></div>

                {/* Menu Display */}
                <div style={styles.menuSection}>
                    <h2 style={styles.sectionTitle}>
                        <Package size={28} />
                        Your Menu ({menuItems.length})
                    </h2>

                    {menuItems.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>
                                <Package size={80} />
                            </div>
                            <p style={styles.emptyText}>No menu items yet</p>
                            <p style={{ marginTop: '10px' }}>Add your first item to get started!</p>
                        </div>
                    ) : (
                        <div style={styles.menuGrid}>
                            {menuItems.map((item) => (
                                <div
                                    key={item._id}
                                    style={{
                                        ...styles.menuCard,
                                        ...(hoveredCard === item._id ? styles.menuCardHover : {})
                                    }}
                                    onMouseEnter={() => setHoveredCard(item._id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div style={styles.imageContainer}>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{
                                                ...styles.menuImage,
                                                ...(hoveredCard === item._id ? styles.menuImageHover : {})
                                            }}
                                        />
                                        <div style={{
                                            ...styles.imageOverlay,
                                            ...(hoveredCard === item._id ? styles.imageOverlayVisible : {})
                                        }}></div>
                                        <div style={{
                                            ...styles.cardActions,
                                            ...(hoveredCard === item._id ? styles.cardActionsVisible : {})
                                        }}>
                                            <button
                                                style={styles.actionButton}
                                                onClick={() => handleEdit(item)}
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                style={styles.actionButton}
                                                onClick={() => handleDelete(item._id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={styles.cardContent}>
                                        <h3 style={styles.itemName}>{item.name}</h3>
                                        <p style={styles.itemPrice}>Rs. {item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}