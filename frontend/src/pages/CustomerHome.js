import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomerSidebar from '../components/CustomerSidebar';
import { Search, MapPin, Star, Plus, Minus, Trash2, ShoppingBag, X, ChevronLeft } from 'lucide-react';
import CustomModal from '../components/CustomModal';

const CustomerHome = () => {
  const [view, setView] = useState('list'); // 'list', 'restaurant', 'cart'
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const pendingCartItemRef = React.useRef(null); // Item waiting for confirmation
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Sync view with URL
  useEffect(() => {
    if (location.pathname.includes('/cart')) {
      setView('cart');
    } else {
      // If we are just at /customer or /customer/, default to list unless specific state set
      if (view === 'cart') setView('list');
    }
  }, [location.pathname]);

  // Auto Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // If query is empty, we might typically show all restaurants, 
      // but fetchRestaurants handles that if we call it.
      // However, we don't want to re-fetch on every empty string if already loaded.
      // Let's reuse handleSearch logic but wrapped here.
      if (searchQuery.trim()) {
        performSearch();
      } else {
        // If cleared, go back to list if not already
        if (view === 'search-results') {
          fetchRestaurants();
          setView('list');
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const matchedRestaurants = restaurants.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (matchedRestaurants.length > 0) {
        setRestaurants(matchedRestaurants);
        setView('list');
      } else {
        const res = await axios.get(`http://localhost:5000/api/menu/search/items?query=${searchQuery}`);
        if (res.data.length > 0) {
          setMenuItems(res.data);
          setView('search-results');
        } else {
          setRestaurants([]);
          setView('list');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch restaurants on load
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/users/restaurants');
      setRestaurants(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Search Input Change (Managed by useEffect now)
  // We keep this specific fetch for initial load or manual clear


  const handleRestaurantClick = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/menu/public/${restaurant._id}`);
      setMenuItems(res.data);
      setView('restaurant');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart on load
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/cart', config);
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  };

  const addToCart = async (item) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      alert("Please login");
      return;
    }

    await processAddToCart(item);
  };

  // handleConfirmClearCart removed as it's no longer needed

  const processAddToCart = async (item, showSuccess = true) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:5000/api/cart/add', {
        menuItemId: item._id,
        quantity: 1,
        restaurantId: item.restaurantId
      }, config);
      await fetchCart(); // Refresh cart to get populated data

      if (showSuccess) {
        setModal({ isOpen: true, title: 'Added to Cart', message: `${item.name} added to your cart`, type: 'success', showButton: false });
        setTimeout(() => setModal(prev => ({ ...prev, isOpen: false })), 1000);
      }
    } catch (error) {
      console.error(error);
      setModal({ isOpen: true, title: 'Error', message: 'Failed to add to cart', type: 'error' });
    }
  };

  const updateQuantity = async (itemId, change) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    // Find current quantity to calculate new quantity
    const currentItem = cart.find(i => i._id === itemId);
    if (!currentItem) return;
    const newQty = currentItem.quantity + change;

    // If newQty is 0, we can remove, but let's stick to update logic usually, 
    // my controller removes if <= 0?
    // Controller logic: if (item.quantity <= 0) cart.items = filter...
    // So yes, sending 0 or less will remove it.

    if (newQty <= 0) {
      // Remove
      removeFromCart(itemId);
      return;
    }

    try {
      await axios.put('http://localhost:5000/api/cart/update', {
        menuItemId: itemId,
        quantity: newQty
      }, config);
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const removeFromCart = async (itemId) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    try {
      await axios.post('http://localhost:5000/api/cart/remove', {
        menuItemId: itemId
      }, config);
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const orderData = {
        items: cart.map(item => ({
          menuItemId: item._id,
          quantity: item.quantity,
          price: item.price,
          restaurantId: item.restaurantId
        }))
      };

      await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      // Clear cart in backend
      await axios.delete('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      setCart([]);
      setModal({ isOpen: true, title: 'Order Placed!', message: 'Your order has been placed successfully.', type: 'success' });
      setView('list'); // Go back home
    } catch (error) {
      setModal({ isOpen: true, title: 'Order Failed', message: error.response?.data?.message || 'Failed to place order', type: 'error' });
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
      marginLeft: '260px', // Sidebar width
      padding: '30px',
      position: 'relative'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#FFD700',
      fontFamily: "'Bebas Neue', sans-serif",
      letterSpacing: '1px'
    },
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 215, 0, 0.2)',
      borderRadius: '12px',
      padding: '10px 16px',
      width: '400px',
      gap: '10px'
    },
    input: {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      width: '100%',
      outline: 'none',
      fontSize: '14px'
    },
    cartBtn: {
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      color: '#000',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '24px'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      transition: 'transform 0.3s ease, border-color 0.3s ease',
      cursor: 'pointer'
    },
    cardImage: {
      width: '100%',
      height: '180px',
      objectFit: 'cover'
    },
    cardContent: {
      padding: '20px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#fff'
    },
    cardText: {
      fontSize: '13px',
      color: '#888',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    menuGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '20px'
    },
    menuCard: {
      background: '#1a1a1a',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid rgba(255, 215, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    menuImg: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '8px'
    },
    price: {
      color: '#FFD700',
      fontSize: '18px',
      fontWeight: '700'
    },
    addBtn: {
      background: 'rgba(255, 215, 0, 0.1)',
      color: '#FFD700',
      border: '1px solid rgba(255, 215, 0, 0.3)',
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      marginTop: 'auto',
      fontWeight: '600',
      transition: 'all 0.2s'
    },
    backBtn: {
      background: 'transparent',
      border: 'none',
      color: '#888',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      cursor: 'pointer',
      marginBottom: '20px',
      fontSize: '14px'
    },
    cartPanel: {
      background: '#151515',
      borderRadius: '16px',
      padding: '30px',
      margin: '0 auto',
      maxWidth: '800px',
      border: '1px solid rgba(255, 215, 0, 0.1)',
      minHeight: '400px'
    },
    cartItem: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      paddingBottom: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
    qtyBtn: {
      width: '24px',
      height: '24px',
      borderRadius: '4px',
      border: '1px solid #333',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <CustomerSidebar />

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              {view === 'list' ? 'Discover Restaurants' :
                view === 'restaurant' ? selectedRestaurant?.name :
                  view === 'search-results' ? 'Search Results' : 'Your Information'}
            </h1>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {view === 'list' ? `${restaurants.length} restaurants open now` : ''}
            </p>
          </div>

          <div style={styles.searchBar}>
            <Search size={18} color="#666" />
            <input
              style={styles.input}
              placeholder="Search restaurants or food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
            onClick={() => setView(view === 'cart' ? 'list' : 'cart')}
          >
            <ShoppingBag size={28} color="#FFD700" />
            {cart.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ff4444',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {view === 'list' && (
          <div style={styles.grid}>
            {restaurants.map(restaurant => (
              <div
                key={restaurant._id}
                style={styles.card}
                onClick={() => handleRestaurantClick(restaurant)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <img
                  src={`http://localhost:5000/uploads/${restaurant.image || 'default-restaurant.jpg'}`}
                  alt={restaurant.name}
                  style={styles.cardImage}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/300x180?text=No+Image'}
                />
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{restaurant.name}</h3>
                  <p style={styles.cardText}><MapPin size={14} /> {restaurant.address}</p>
                  <p style={{ ...styles.cardText, marginTop: '8px', fontSize: '12px' }}>{restaurant.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'restaurant' && selectedRestaurant && (
          <div>
            <button style={styles.backBtn} onClick={() => setView('list')}>
              <ChevronLeft size={16} /> Back to Restaurants
            </button>

            <div style={styles.menuGrid}>
              {menuItems.map(item => (
                <div key={item._id} style={styles.menuCard}>
                  <img
                    src={`http://localhost:5000/uploads/${item.image}`}
                    alt={item.name}
                    style={styles.menuImg}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#fff', marginBottom: '5px' }}>{item.name}</h4>
                    <p style={{ color: '#666', fontSize: '12px' }}>{item.category}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={styles.price}>Rs. {item.price}</span>
                    <button
                      style={styles.addBtn}
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'search-results' && (
          <div>
            <button style={styles.backBtn} onClick={() => { setSearchQuery(''); fetchRestaurants(); setView('list'); }}>
              <ChevronLeft size={16} /> Clear Search
            </button>
            <div style={styles.menuGrid}>
              {menuItems.map(item => (
                <div key={item._id} style={styles.menuCard}>
                  <img
                    src={`http://localhost:5000/uploads/${item.image}`}
                    alt={item.name}
                    style={styles.menuImg}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#fff', marginBottom: '5px' }}>{item.name}</h4>
                    {/* Ideally show restaurant name here, but need populate */}
                    <p style={{ color: '#666', fontSize: '12px' }}>{item.category}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={styles.price}>Rs. {item.price}</span>
                    <button
                      style={styles.addBtn}
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'cart' && (
          <div style={styles.cartPanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ ...styles.title, fontSize: '24px' }}>Your Cart</h2>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setView('list')}><X size={24} /></button>
            </div>

            {cart.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>Your cart is empty.</p>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {cart.map(item => (
                    <div key={item._id} style={styles.cartItem}>
                      <img
                        src={`http://localhost:5000/uploads/${item.image}`}
                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                        alt=""
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>{item.name}</h4>
                        <div style={{ color: '#FFD700', fontSize: '13px' }}>Rs. {item.price * item.quantity}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button style={styles.qtyBtn} onClick={() => updateQuantity(item._id, -1)}><Minus size={12} /></button>
                          <span style={{ fontSize: '13px' }}>{item.quantity}</span>
                          <button style={styles.qtyBtn} onClick={() => updateQuantity(item._id, 1)}><Plus size={12} /></button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                    <span>Total</span>
                    <span style={{ color: '#FFD700' }}>Rs. {calculateTotal()}</span>
                  </div>
                  <button
                    style={{ ...styles.cartBtn, width: '100%', justifyContent: 'center' }}
                    onClick={placeOrder}
                  >
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        showButton={modal.showButton}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm || (() => setModal({ ...modal, isOpen: false }))}
      />
    </div>
  );
};

export default CustomerHome;