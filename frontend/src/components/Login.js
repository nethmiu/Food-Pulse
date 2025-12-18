import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [identifier, setIdentifier] = useState(''); // Email or Username
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/users/login', { identifier, password });
            localStorage.setItem('userInfo', JSON.stringify(res.data));
            const role = res.data.role;
            if (role === 'customer') navigate('/customer');
            else if (role === 'restaurant') navigate('/restaurant/profile/view');
            else if (role === 'rider') navigate('/rider');
            else if (role === 'admin') navigate('/admin');
        } catch (err) {
            alert(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        pageWrapper: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #000000 0%, #0f0f0f 60%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 20px',
            fontFamily: "'Poppins', 'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        },
        bgDecorator: {
            position: 'absolute',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
            zIndex: 0
        },
        bgTop: { width: '420px', height: '420px', top: '-160px', left: '-160px' },
        bgBottom: { width: '360px', height: '360px', bottom: '-120px', right: '-120px' },
        container: { width: '100%', maxWidth: '520px', position: 'relative', zIndex: 10 },
        card: {
            background: 'linear-gradient(180deg, rgba(10,10,10,0.95), rgba(20,20,20,0.9))',
            border: '1px solid rgba(255,215,0,0.12)',
            borderRadius: '18px',
            padding: '36px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
        },
        header: { textAlign: 'center', marginBottom: '18px' },
        title: { fontSize: '36px', color: '#FFD700', fontWeight: 800, letterSpacing: '2px', marginBottom: '6px' },
        subtitle: { fontSize: '13px', color: '#999' },
        formGroup: { marginTop: '18px' },
        label: { display: 'block', fontSize: '12px', color: '#FFD700', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' },
        input: {
            width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,215,0,0.08)',
            background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '14px', outline: 'none', transition: 'all 0.2s ease'
        },
        inputFocus: { boxShadow: '0 0 0 4px rgba(255,215,0,0.06)', borderColor: '#FFD700' },
        inputIconWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
        iconBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', cursor: 'pointer' },
        submit: { width: '100%', padding: '12px', marginTop: '22px', borderRadius: '10px', border: 'none', background: '#FFD700', color: '#000', fontWeight: 800, letterSpacing: '1px', cursor: 'pointer' },
        submitDisabled: { background: '#444', color: '#999', cursor: 'not-allowed' },
        links: { marginTop: '14px', textAlign: 'center', color: '#888' },
        link: { color: '#FFD700', textDecoration: 'none', fontWeight: 700 }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={{ ...styles.bgDecorator, ...styles.bgTop }}></div>
            <div style={{ ...styles.bgDecorator, ...styles.bgBottom }}></div>

            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={{ fontFamily: "'Bebas Neue', 'Poppins', sans-serif", fontSize: '22px', color: '#FFD700', letterSpacing: '2px' }}>FOOD PULSE</div>
                        <h2 style={styles.title}>Welcome Back</h2>
                        <div style={styles.subtitle}>Sign in to continue to your account</div>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email or Username</label>
                            <input
                                style={styles.input}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                onBlur={(e) => e.target.style.boxShadow = 'none'}
                                type="text"
                                placeholder="you@example.com"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password</label>
                            <div style={styles.inputIconWrap}>
                                <input
                                    style={{ ...styles.input, paddingRight: '44px' }}
                                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div style={styles.iconBtn} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>
                        </div>

                        <button type="submit" style={{ ...styles.submit, ...(loading ? styles.submitDisabled : {}) }} disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={styles.links}>
                        <div style={{ marginBottom: '8px' }}>
                            <Link to="/register" style={styles.link}>Don't have an account? Create one</Link>
                        </div>
                        <div>
                            <Link to="/" style={styles.link}>Back to Home</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;