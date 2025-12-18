import React, { useState, useEffect } from 'react';
import { Package, Edit2, Trash2, Plus, Search, Filter, List, DollarSign } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CustomModal from '../components/CustomModal';

export default function MenuList() {
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [priceFilter, setPriceFilter] = useState('All');
    const [hoveredCard, setHoveredCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success', onConfirm: null });
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.token;

    const fetchMenu = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/menu/my-menu', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMenuItems(res.data);
            setFilteredItems(res.data);
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    useEffect(() => {
        let result = menuItems;

        // Search Filter (Name or Price)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.price.toString().includes(query)
            );
        }

        // Category Filter
        if (categoryFilter !== 'All') {
            result = result.filter(item => item.category === categoryFilter);
        }

        // Price Filter
        if (priceFilter !== 'All') {
            if (priceFilter === 'under500') {
                result = result.filter(item => item.price < 500);
            } else if (priceFilter === '500-1000') {
                result = result.filter(item => item.price >= 500 && item.price <= 1000);
            } else if (priceFilter === 'above1000') {
                result = result.filter(item => item.price > 1000);
            }
        }

        setFilteredItems(result);
    }, [menuItems, searchQuery, categoryFilter, priceFilter]);

    const handleEdit = (item) => {
        navigate('/restaurant/menu/add', { state: { item } });
    };

    const confirmDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/menu/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModal({ isOpen: false });
            fetchMenu();
        } catch (error) {
            console.error('Error deleting item:', error);
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Failed to delete item.',
                type: 'alert'
            });
        }
    };

    const handleDelete = (id) => {
        setModal({
            isOpen: true,
            title: 'Delete Item?',
            message: 'Are you sure you want to delete this menu item? This action cannot be undone.',
            type: 'confirm',
            onConfirm: () => confirmDelete(id)
        });
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
        subtitle: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.1rem',
            fontWeight: '400'
        },
        menuSection: {
            width: '100%'
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
        searchContainer: {
            display: 'flex',
            gap: '15px',
            marginBottom: '40px',
            flexWrap: 'nowrap',
            alignItems: 'center',
            justifyContent: 'center'
        },
        searchInputWrapper: {
            position: 'relative',
            flex: '1',
            minWidth: '300px',
            maxWidth: '500px'
        },
        searchInput: {
            width: '100%',
            padding: '12px 16px 12px 48px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            fontFamily: "'Inter', sans-serif"
        },
        searchIcon: {
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255, 255, 255, 0.4)'
        },
        filterWrapper: {
            position: 'relative',
            minWidth: '180px'
        },
        filterIcon: {
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255, 255, 255, 0.4)',
            pointerEvents: 'none',
            zIndex: 1
        },
        filterSelect: {
            width: '100%',
            padding: '12px 16px 12px 40px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.9rem',
            outline: 'none',
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1em'
        },
        option: {
            background: '#1a1a1a',
            color: '#fff'
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
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

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div style={styles.header}>
                <h1 style={styles.title}>Menu Management</h1>
                <p style={styles.subtitle}>Manage your restaurant's offerings</p>
            </div>

            {/* Search and Filters */}
            <div style={styles.searchContainer}>
                <div style={styles.searchInputWrapper}>
                    <Search size={20} style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name or price..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={styles.filterWrapper}>
                    <List size={16} style={styles.filterIcon} />
                    <select
                        style={styles.filterSelect}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option style={styles.option} value="All">Categories</option>
                        <option style={styles.option} value="Appetizer">Appetizer</option>
                        <option style={styles.option} value="Main Course">Main</option>
                        <option style={styles.option} value="Dessert">Dessert</option>
                        <option style={styles.option} value="Beverage">Beverage</option>
                        <option style={styles.option} value="Snack">Snack</option>
                    </select>
                </div>

                <div style={styles.filterWrapper}>
                    <DollarSign size={16} style={styles.filterIcon} />
                    <select
                        style={styles.filterSelect}
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                    >
                        <option style={styles.option} value="All">Prices</option>
                        <option style={styles.option} value="under500">&lt; Rs.500.00</option>
                        <option style={styles.option} value="500-1000">Rs.500.00 - Rs.1000.00</option>
                        <option style={styles.option} value="above1000">&gt; Rs.1000.00</option>
                    </select>
                </div>
            </div>

            <div style={styles.menuSection}>
                <h2 style={styles.sectionTitle}>
                    <Package size={28} />
                    Your Menu ({filteredItems.length})
                </h2>

                {isLoading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>
                            <Package size={80} />
                        </div>
                        <p style={styles.emptyText}>No menu items yet</p>
                        <p style={{ marginTop: '10px' }}>Add your first item to get started!</p>
                        <button
                            style={{
                                marginTop: '20px',
                                padding: '12px 24px',
                                background: '#FFD700',
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                            onClick={() => navigate('/restaurant/menu/add')}
                        >
                            Add New  Menu Item
                        </button>
                    </div>
                ) : (
                    <div style={styles.menuGrid}>
                        {filteredItems.map((item) => (
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
                                        src={`http://localhost:5000/uploads/${item.image}`}
                                        alt={item.name}
                                        style={{
                                            ...styles.menuImage,
                                            ...(hoveredCard === item._id ? styles.menuImageHover : {})
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <h3 style={styles.itemName}>{item.name}</h3>
                                            <span style={{
                                                fontSize: '0.8rem',
                                                color: '#FFD700',
                                                background: 'rgba(255, 215, 0, 0.1)',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                display: 'inline-block',
                                                marginBottom: '6px'
                                            }}>
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={styles.itemPrice}>Rs. {item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <CustomModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm}
            />
        </div>
    );
}