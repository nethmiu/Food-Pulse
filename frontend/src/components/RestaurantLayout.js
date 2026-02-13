import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import Sidebar from './Sidebar';
import RestaurantProfileHeader from './RestaurantProfileHeader';

const RestaurantLayout = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userInfo'));
        setUserInfo(storedUser);
    }, []);

    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            background: '#000000'
        },
        main: {
            flex: 1,
            marginLeft: '260px',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
            position: 'relative'
        },
        headerWrapper: {
            position: 'absolute',
            top: '20px',
            right: '40px',
            zIndex: 100
        }
    };

    return (
        <div style={styles.container}>
            <Sidebar />
            <main style={styles.main}>
                <div style={styles.headerWrapper}>
                    <RestaurantProfileHeader />
                </div>
                <Outlet />
            </main>
        </div>
    );
};

export default RestaurantLayout;
