import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    const user = JSON.parse(localStorage.getItem('userInfo'));

    // Login වී නැත්නම් Login එකට යවන්න
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Login වී සිටියත්, අදාල Role එක නැත්නම් මුල් පිටුවට විසි කරන්න
    // උදාහරණ: Customer කෙනෙක් Admin පිටුවට යන්න හැදුවොත්
    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;