import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomerSidebar from '../components/CustomerSidebar';
import CustomerProfileHeader from '../components/CustomerProfileHeader';
import { Search, MapPin, Star, Plus, Minus, Trash2, ShoppingBag, X, ChevronLeft, Filter, SlidersHorizontal, DollarSign, Navigation, User } from 'lucide-react';
import CustomModal from '../components/CustomModal';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const haversineDistance = (coords1, coords2) => {
  if (!coords1 || !coords2) return null;
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1.lat)) *
    Math.cos(toRad(coords2.lat)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const CustomerHome = () => {
  const [view, setView] = useState('list'); // 'list', 'restaurant', 'cart'
  const [restaurants, setRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]); // Master list
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const pendingCartItemRef = React.useRef(null); // Item waiting for confirmation
  const [searchFocused, setSearchFocused] = useState(false);
  const [dynamicMaxPrice, setDynamicMaxPrice] = useState(10000);
  const [minPrice, setMinPrice] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Location State
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : null;
  }); // { lat, lng }

  const [locationModalOpen, setLocationModalOpen] = useState(() => {
    return !localStorage.getItem('userLocation');
  });

  const [tempLocation, setTempLocation] = useState(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState(''); // New search state
  const [searchResult, setSearchResult] = useState(null); // To center map

  // Component to recenter map
  const MapRecenter = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
      if (lat && lng) {
        map.flyTo([lat, lng], 13);
      }
    }, [lat, lng, map]);
    return null;
  };

  // Location Picker Map Component
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setTempLocation(e.latlng);
      },
    });
    return tempLocation ? <Marker position={tempLocation} /> : null;
  };

  const handleLocationSearch = async () => {
    if (!locationSearchQuery.trim()) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLoc = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setTempLocation(newLoc);
        setSearchResult(newLoc); // Triggers MapRecenter
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert('Error searching for location');
    }
  };

  const handleFindMe = () => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: false, // Changed to false for better reliability on desktops
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setTempLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Unable to retrieve your location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable it in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get your location timed out.";
              break;
            default:
              errorMessage = `An unknown error occurred: ${error.message}`;
              break;
          }
          alert(errorMessage);
        },
        options
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const confirmLocation = () => {
    if (tempLocation) {
      setUserLocation(tempLocation);
      localStorage.setItem('userLocation', JSON.stringify(tempLocation));
      setLocationModalOpen(false);
      // Trigger filter? useEffect will handle it
    }
  };

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
      applyFilters();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, userLocation, allRestaurants]);

  const applyFilters = async () => {
    // If no master list yet, do nothing (wait for fetch)
    if (allRestaurants.length === 0) return;

    setLoading(true);
    try {
      // Enforce Location: If no location, show nothing
      if (!userLocation) {
        setRestaurants([]);
        if (view === 'list') {
          // We will handle the "Please select location" in UI
        }
        setLoading(false);
        return;
      }

      let filtered = [...allRestaurants];

      // 1. Text Search (Restaurant Name)
      if (searchQuery.trim()) {
        filtered = filtered.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      // 2. Location Filter (Strict 10km)
      filtered = filtered.filter(r => {
        if (!r.location || !r.location.lat || !r.location.lng) return false;
        const dist = haversineDistance(userLocation, r.location);
        return dist <= 10;
      });

      if (filtered.length > 0 || !searchQuery.trim()) {
        setRestaurants(filtered);
        if (view === 'search-results') setView('list');
      } else {
        // Global Search for Items
        if (searchQuery.trim()) {
          const res = await axios.get(`http://localhost:5000/api/menu/search/items?query=${searchQuery}`);
          let items = res.data;

          // Strict Location Filter for Items too
          items = items.filter(item => {
            const rest = allRestaurants.find(r => r._id === item.restaurantId || r._id === item.restaurantId?._id);
            if (!rest || !rest.location) return false;
            return haversineDistance(userLocation, rest.location) <= 10;
          });

          if (items.length > 0) {
            setMenuItems(items);
            // Calculate Max Price for search results
            const maxPrice = Math.max(...items.map(item => item.price));
            setDynamicMaxPrice(maxPrice);
            setPriceRange(maxPrice);
            setView('search-results');
          } else {
            setRestaurants([]);
            setView('list');
          }
        } else {
          setRestaurants(filtered);
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
      setAllRestaurants(res.data);
      // Do NOT setRestaurants(res.data) initially. Wait for location.
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

      // Calculate Max Price for the slider
      if (res.data.length > 0) {
        const maxPrice = Math.max(...res.data.map(item => item.price));
        setDynamicMaxPrice(maxPrice);
        setPriceRange(maxPrice); // Set slider to max by default
      } else {
        setDynamicMaxPrice(5000);
        setPriceRange(5000);
      }

      setView('restaurant');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* --- Filter States --- */
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(10000); // Max price slider, default high enough

  // Reset filters when view changes or restaurant selected
  useEffect(() => {
    // Only reset if we are NOT in search results view or if search is cleared
    // But actually, we want to reset when entering a NEW restaurant or clearing search.
    // If we are just typing, we handle price updates in applyFilters.
    if (view !== 'search-results') {
      setSelectedCategory('All');
      // We do not force setPriceRange(10000) here if we want to support dynamic prices.
      // But for general list view, maybe we do.
      // Let's just remove searchQuery dependency so it doesn't reset EVERY TIME we type.
    }
  }, [view, selectedRestaurant]);

  // Derived state for filters
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = menuItems.filter(item => {
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchPrice = item.price >= minPrice && item.price <= priceRange;
    return matchCategory && matchPrice;
  });

  const [selectedItems, setSelectedItems] = useState([]);

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
      // Default to selecting all items when cart loads so user doesn't have to manually select
      setSelectedItems(data.map(item => item._id));
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  };

  const toggleSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item._id));
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
    return cart
      .filter(item => selectedItems.includes(item._id))
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    const itemsToOrder = cart.filter(item => selectedItems.includes(item._id));

    if (itemsToOrder.length === 0) {
      setModal({ isOpen: true, title: 'Error', message: 'Please select at least one item to order.', type: 'error' });
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const orderData = {
        items: itemsToOrder.map(item => ({
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
      background: '#fff',  // White background
      border: '1px solid rgba(255, 215, 0, 0.2)',
      borderRadius: '50px',
      padding: '6px 16px', // Reduced height
      width: '400px',
      height: '60px',
      gap: '10px'
    },
    input: {
      background: 'transparent',
      border: 'none',
      color: '#000', // Black text
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

          <div style={{ display: 'flex', gap: '15px' }}>
            <CustomerProfileHeader />

            <button
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '50px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
              onClick={() => setLocationModalOpen(true)}
            >
              <Navigation size={16} color="#FFD700" />
              {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Select Location'}
            </button>

            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
              onClick={() => {
                if (view === 'cart') {
                  navigate('/customer'); // Go back to list/home
                } else {
                  navigate('/customer/cart'); // Go to cart
                }
              }}
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


        </div>

        {/* Location Modal */}
        {locationModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <div style={{
              background: '#1a1a1a', padding: '30px', borderRadius: '16px',
              width: '600px', maxWidth: '90%', border: '1px solid #333'
            }}>
              <h2 style={{ color: '#FFD700', marginBottom: '20px' }}>Select Your Location</h2>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search city or address..."
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #444',
                    background: '#222', color: '#fff'
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                />
                <button
                  onClick={handleLocationSearch}
                  style={{
                    background: '#FFD700', color: '#000', border: 'none', borderRadius: '8px',
                    padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  Search
                </button>
              </div>

              <div style={{ marginBottom: '20px', height: '300px', borderRadius: '12px', overflow: 'hidden' }}>
                <MapContainer center={[6.9271, 79.8612]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker />
                  {searchResult && <MapRecenter lat={searchResult.lat} lng={searchResult.lng} />}
                </MapContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={handleFindMe}
                  style={{
                    background: '#333', color: '#fff', border: 'none',
                    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <User size={16} /> Find Me (GPS)
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setLocationModalOpen(false)}
                    style={{ padding: '10px 20px', background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLocation}
                    style={{
                      padding: '10px 20px', background: '#FFD700', color: '#000',
                      border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    Confirm Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'list' && (
          <div style={styles.grid}>
            {!userLocation && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
                <MapPin size={48} color="#FFD700" style={{ marginBottom: '20px' }} />
                <h2 style={{ color: '#fff', marginBottom: '10px' }}>Location Required</h2>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>Please select your location to find nearby restaurants (within 10km).</p>
                <button
                  onClick={() => setLocationModalOpen(true)}
                  style={{ padding: '12px 24px', background: '#FFD700', color: '#000', border: 'none', borderRadius: '50px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Select Location
                </button>
                <p style={{ color: '#666', marginTop: '15px', fontSize: '13px' }}>
                  (Click "Find Me" in the map to use GPS)
                </p>
              </div>
            )}

            {userLocation && restaurants.length === 0 && !loading && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px' }}>
                <p style={{ color: '#aaa', fontSize: '18px' }}>No restaurants found within 10km of your location.</p>
              </div>
            )}

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

            <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#aaa', fontSize: '14px' }}>Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #444', background: '#222', color: '#fff' }}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#aaa', fontSize: '14px' }}>Max Price: Rs. {priceRange}</span>
                <input
                  type="range"
                  min="0"
                  max={dynamicMaxPrice}
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  style={{ accentColor: '#FFD700', width: '300px' }}
                />
              </div>

            </div>

            <div style={styles.menuGrid}>
              {filteredItems.map(item => (
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

            <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', marginBottom: '20px', marginTop: '10px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#aaa', fontSize: '14px' }}>Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #444', background: '#222', color: '#fff' }}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

            </div>

            <div style={styles.menuGrid}>
              {filteredItems.map(item => (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ ...styles.title, fontSize: '24px' }}>Your Cart</h2>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setView('list')}><X size={24} /></button>
            </div>

            {cart.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '15px' }}>
                <input
                  type="checkbox"
                  checked={selectedItems.length === cart.length && cart.length > 0}
                  onChange={toggleSelectAll}
                  style={{ width: '22px', height: '22px', cursor: 'pointer', marginRight: '12px', accentColor: '#FFD700' }}
                />
                <span style={{ fontSize: '18px', fontWeight: '500', color: '#fff' }}>Select All ({cart.length} items)</span>
              </div>
            )}

            {cart.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', marginTop: '50px', fontSize: '18px' }}>Your cart is empty.</p>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ ...styles.cartItem, background: selectedItems.includes(item._id) ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => toggleSelection(item._id)}
                        style={{ width: '22px', height: '22px', cursor: 'pointer', marginRight: '15px', accentColor: '#FFD700' }}
                      />
                      <img
                        src={`http://localhost:5000/uploads/${item.image}`}
                        style={{ width: '90px', height: '90px', borderRadius: '10px', objectFit: 'cover' }}
                        alt=""
                      />
                      <div style={{ flex: 1, paddingLeft: '15px' }}>
                        <h4 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px', fontWeight: 'bold' }}>{item.name}</h4>
                        <div style={{ color: '#FFD700', fontSize: '18px', fontWeight: '500' }}>Rs. {item.price * item.quantity}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button style={styles.qtyBtn} onClick={() => updateQuantity(item._id, -1)}><Minus size={16} /></button>
                          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button style={styles.qtyBtn} onClick={() => updateQuantity(item._id, 1)}><Plus size={16} /></button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff4444',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '10px',
                            padding: '6px 10px',
                            borderRadius: '6px'
                          }}
                          onMouseOver={(e) => e.target.style.background = 'rgba(255, 68, 68, 0.1)'}
                          onMouseOut={(e) => e.target.style.background = 'none'}
                        >
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '25px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '20px', fontWeight: '700' }}>
                    <span>Total ({selectedItems.length} items)</span>
                    <span style={{ color: '#FFD700', fontSize: '24px' }}>Rs. {calculateTotal()}</span>
                  </div>
                  <button
                    style={{
                      ...styles.cartBtn,
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '18px',
                      padding: '15px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
                      color: '#000',
                      fontWeight: '700',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      border: 'none'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)'; }}
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
    </div >
  );
};

export default CustomerHome;