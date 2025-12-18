import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import CustomerHome from './pages/CustomerHome';
import RestaurantHome from './pages/RestaurantHome';
import RiderHome from './pages/RiderHome';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

import RestaurantLayout from './components/RestaurantLayout';
import AddMenu from './pages/AddMenu';
import MenuList from './pages/MenuList';
import RestaurantOrders from './pages/RestaurantOrders';
import RestaurantProfile from './pages/RestaurantProfile';
import ViewProfile from './pages/ViewProfile';
import ChangePassword from './pages/ChangePassword';
import { Navigate } from 'react-router-dom';

// ... other imports ...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- Protected Routes --- */}

        {/* Customer Route (allowedRole="customer" ලෙස දෙන්න) */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRole="customer">
              <CustomerHome />
            </ProtectedRoute>
          }
        />

        {/* Restaurant Route */}
        <Route
          path="/restaurant"
          element={
            <ProtectedRoute allowedRole="restaurant">
              <RestaurantLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="menu/list" replace />} />
          <Route path="menu/add" element={<AddMenu />} />
          <Route path="menu/list" element={<MenuList />} />
          <Route path="orders" element={<RestaurantOrders />} />

          {/* Profile Sub-routes */}
          <Route path="profile/manage" element={<RestaurantProfile />} />
          <Route path="profile/view" element={<ViewProfile />} />
          <Route path="profile/password" element={<ChangePassword />} />
        </Route>

        {/* Rider Route */}
        <Route
          path="/rider"
          element={
            <ProtectedRoute allowedRole="rider">
              <RiderHome />
            </ProtectedRoute>
          }
        />

        {/* Admin Route (මෙතැන ඉතා වැදගත්) */}
        {/* මෙතැන allowedRole="admin" දුන් විට Customer කෙනෙක්ට එන්න බැහැ */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;