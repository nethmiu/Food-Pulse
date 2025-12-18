import React from 'react';

export default function RestaurantOrders() {
    const styles = {
        container: {
            padding: '40px',
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        },
        title: {
            fontSize: '2.5rem',
            color: '#FFD700',
            marginBottom: '20px'
        }
    };
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Orders</h1>
            <p>Orders management coming soon...</p>
        </div>
    );
}
