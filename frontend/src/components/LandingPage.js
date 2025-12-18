import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    const styles = {
        // Global Styles
        pageWrapper: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#000000',
            fontFamily: "'Poppins', 'Raleway', sans-serif"
        },

        // Navigation Bar
        navbar: {
            position: 'fixed',
            top: 0,
            width: '100%',
            padding: '20px 50px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            borderBottom: '1px solid rgba(255, 215, 0, 0.2)'
        },
        navLogo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none'
        },
        navIcon: {
            width: '35px',
            height: '35px',
            filter: 'invert(79%) sepia(79%) saturate(459%) hue-rotate(359deg) brightness(104%) contrast(103%)'
        },
        navTitle: {
            fontSize: '1.8rem',
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#FFD700',
            letterSpacing: '3px'
        },
        navLinks: {
            display: 'flex',
            gap: '30px',
            alignItems: 'center'
        },
        navLink: {
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            padding: '8px 16px',
            borderRadius: '20px'
        },

        // Hero Section
        heroSection: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(rgba(0, 0, 0, 0.88), rgba(0, 0, 0, 0.85)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: '120px 20px 80px',
            position: 'relative',
            overflow: 'hidden'
        },
        heroContent: {
            textAlign: 'center',
            maxWidth: '1200px',
            zIndex: 2,
            animation: 'fadeInUp 1s ease-out'
        },
        heroLogo: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            gap: '20px'
        },
        heroIconContainer: {
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 50px rgba(255, 215, 0, 0.6)',
            animation: 'pulse 3s ease-in-out infinite',
            transition: 'all 0.4s ease'
        },
        heroIcon: {
            width: '55px',
            height: '55px',
            filter: 'brightness(0)'
        },
        heroTitle: {
            fontSize: '6rem',
            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
            fontWeight: '700',
           
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '4px 4px 0px #FFD700, 8px 8px 25px rgba(255, 215, 0, 0.4)',
            letterSpacing: '12px',
            marginBottom: '20px',
            lineHeight: '1',
            textTransform: 'uppercase'
        },
        heroSubtitle: {
            fontSize: '1.8rem',
            fontFamily: "'Raleway', sans-serif",
            color: '#ffffff',
            fontWeight: '300',
            letterSpacing: '6px',
            marginBottom: '30px',
            textShadow: '2px 2px 10px rgba(0, 0, 0, 0.9)'
        },
        heroTagline: {
            fontSize: '1.3rem',
            fontFamily: "'Poppins', sans-serif",
            color: '#eeeeee',
            marginBottom: '60px',
            fontWeight: '300',
            maxWidth: '800px',
            margin: '0 auto 60px',
            lineHeight: '1.8',
            opacity: 0.9
        },

        // Features Section
        featuresSection: {
            padding: '100px 50px',
            backgroundColor: '#0A0A0A',
            position: 'relative'
        },
        sectionTitle: {
            textAlign: 'center',
            fontSize: '3.5rem',
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#FFD700',
            marginBottom: '80px',
            letterSpacing: '5px'
        },
        featuresGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '50px',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        featureCard: {
            background: 'linear-gradient(145deg, #111111, #0A0A0A)',
            padding: '50px 30px',
            borderRadius: '25px',
            border: '2px solid rgba(255, 215, 0, 0.15)',
            textAlign: 'center',
            transition: 'all 0.4s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
        },
        featureIconWrapper: {
            width: '100px',
            height: '100px',
            margin: '0 auto 30px',
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.4s ease',
            border: '2px solid rgba(255, 215, 0, 0.3)'
        },
        featureIcon: {
            width: '50px',
            height: '50px',
            filter: 'invert(79%) sepia(79%) saturate(459%) hue-rotate(359deg) brightness(104%) contrast(103%)',
            transition: 'all 0.4s ease'
        },
        featureTitle: {
            fontSize: '1.5rem',
            color: '#FFD700',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: '600',
            marginBottom: '15px',
            letterSpacing: '1px'
        },
        featureDescription: {
            fontSize: '1rem',
            color: '#cccccc',
            lineHeight: '1.6',
            opacity: 0.8
        },

        // Stats Section
        statsSection: {
            padding: '80px 50px',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, transparent 50%)',
            borderTop: '1px solid rgba(255, 215, 0, 0.1)',
            borderBottom: '1px solid rgba(255, 215, 0, 0.1)'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            maxWidth: '1000px',
            margin: '0 auto',
            textAlign: 'center'
        },
        statItem: {
            padding: '30px 20px'
        },
        statNumber: {
            fontSize: '3.5rem',
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#FFD700',
            marginBottom: '10px',
            fontWeight: '700'
        },
        statLabel: {
            fontSize: '1.1rem',
            color: '#ffffff',
            fontFamily: "'Poppins', sans-serif",
            opacity: 0.8
        },

        // CTA Section
        ctaSection: {
            padding: '120px 50px',
            background: 'linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            textAlign: 'center',
            position: 'relative'
        },
        ctaContent: {
            maxWidth: '800px',
            margin: '0 auto',
            zIndex: 2,
            position: 'relative'
        },
        ctaTitle: {
            fontSize: '3.5rem',
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#FFD700',
            marginBottom: '30px',
            letterSpacing: '4px'
        },
        ctaText: {
            fontSize: '1.2rem',
            color: '#eeeeee',
            marginBottom: '50px',
            lineHeight: '1.7',
            opacity: 0.9
        },
        buttonContainer: {
            display: 'flex',
            gap: '25px',
            justifyContent: 'center',
            flexWrap: 'wrap'
        },
        btnPrimary: {
            backgroundColor: '#FFD700',
            color: '#000000',
            border: 'none',
            padding: '20px 50px',
            fontSize: '1.2rem',
            fontWeight: '700',
            cursor: 'pointer',
            borderRadius: '50px',
            transition: 'all 0.3s ease',
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            boxShadow: '0 10px 30px rgba(255, 215, 0, 0.4)',
            textDecoration: 'none',
            display: 'inline-block'
        },
        btnSecondary: {
            backgroundColor: 'transparent',
            color: '#FFD700',
            border: '3px solid #FFD700',
            padding: '20px 50px',
            fontSize: '1.2rem',
            fontWeight: '700',
            cursor: 'pointer',
            borderRadius: '50px',
            transition: 'all 0.3s ease',
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            textDecoration: 'none',
            display: 'inline-block'
        },

        // Footer
        footer: {
            backgroundColor: '#000000',
            borderTop: '2px solid rgba(255, 215, 0, 0.3)',
            padding: '70px 50px 30px'
        },
        footerContent: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '50px',
            marginBottom: '40px'
        },
        footerSection: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        footerTitle: {
            fontSize: '1.5rem',
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#FFD700',
            letterSpacing: '2px',
            marginBottom: '15px'
        },
        footerText: {
            fontSize: '1rem',
            fontFamily: "'Poppins', sans-serif",
            color: '#cccccc',
            lineHeight: '1.6'
        },
        footerLink: {
            color: '#cccccc',
            textDecoration: 'none',
            fontSize: '1rem',
            fontFamily: "'Poppins', sans-serif",
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        socialIcons: {
            display: 'flex',
            gap: '15px',
            marginTop: '15px'
        },
        socialIcon: {
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            border: '2px solid #FFD700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        },
        socialIconImg: {
            width: '22px',
            height: '22px',
            filter: 'invert(79%) sepia(79%) saturate(459%) hue-rotate(359deg) brightness(104%) contrast(103%)'
        },
        footerBottom: {
            textAlign: 'center',
            paddingTop: '40px',
            borderTop: '1px solid rgba(255, 215, 0, 0.2)',
            color: '#999999',
            fontSize: '0.95rem',
            fontFamily: "'Poppins', sans-serif"
        },

        // Decorative Elements
        decorativeElement: {
            position: 'absolute',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
            zIndex: 1
        }
    };

    // Event Handlers
    const handleHover = (e, isHovering) => {
        if (isHovering) {
            e.target.style.transform = 'translateY(-5px) scale(1.05)';
            if (e.target.style.backgroundColor === 'rgb(255, 215, 0)' || e.target.style.backgroundColor === '') {
                e.target.style.backgroundColor = '#FFA500';
                e.target.style.boxShadow = '0 15px 40px rgba(255, 165, 0, 0.6)';
            } else {
                e.target.style.backgroundColor = '#FFD700';
                e.target.style.color = '#000';
            }
        } else {
            e.target.style.transform = 'translateY(0) scale(1)';
            if (e.target.style.border.includes('3px')) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#FFD700';
            } else {
                e.target.style.backgroundColor = '#FFD700';
                e.target.style.boxShadow = '0 10px 30px rgba(255, 215, 0, 0.4)';
            }
        }
    };

    const handleFeatureHover = (e, isHovering) => {
        const card = e.currentTarget;
        const iconWrapper = card.querySelector('.feature-icon-wrapper');
        const icon = card.querySelector('.feature-icon');
        
        if (isHovering) {
            card.style.transform = 'translateY(-12px) scale(1.02)';
            card.style.borderColor = 'rgba(255, 215, 0, 0.5)';
            card.style.boxShadow = '0 25px 50px rgba(255, 215, 0, 0.25)';
            card.style.backgroundColor = 'rgba(255, 215, 0, 0.02)';
            iconWrapper.style.transform = 'scale(1.15)';
            iconWrapper.style.background = 'rgba(255, 215, 0, 0.15)';
            icon.style.transform = 'scale(1.1)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.borderColor = 'rgba(255, 215, 0, 0.15)';
            card.style.boxShadow = 'none';
            card.style.backgroundColor = 'transparent';
            iconWrapper.style.transform = 'scale(1)';
            iconWrapper.style.background = 'rgba(255, 215, 0, 0.1)';
            icon.style.transform = 'scale(1)';
        }
    };

    const handleNavHover = (e, isHovering) => {
        if (isHovering) {
            e.target.style.color = '#FFD700';
            e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
        } else {
            e.target.style.color = '#ffffff';
            e.target.style.backgroundColor = 'transparent';
        }
    };

    const handleSocialHover = (e, isHovering) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = '#FFD700';
            e.currentTarget.style.transform = 'scale(1.2) rotate(5deg)';
            e.currentTarget.querySelector('img').style.filter = 'brightness(0)';
        } else {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.querySelector('img').style.filter = 'invert(79%) sepia(79%) saturate(459%) hue-rotate(359deg) brightness(104%) contrast(103%)';
        }
    };

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Raleway:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
                    
                    * { 
                        margin: 0; 
                        padding: 0; 
                        box-sizing: border-box; 
                    }
                    
                    html {
                        scroll-behavior: smooth;
                    }
                    
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(40px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes pulse {
                        0%, 100% {
                            transform: scale(1);
                            box-shadow: 0 20px 50px rgba(255, 215, 0, 0.5);
                        }
                        50% {
                            transform: scale(1.08);
                            box-shadow: 0 25px 60px rgba(255, 215, 0, 0.7);
                        }
                    }

                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-20px);
                        }
                    }

                    .feature-card:hover {
                        background: linear-gradient(145deg, #1a1a1a, #0f0f0f);
                        border-color: rgba(255, 215, 0, 0.5);
                    }

                    @media (max-width: 768px) {
                        .hero-title { font-size: 3.5rem !important; letter-spacing: 6px !important; }
                        .hero-subtitle { font-size: 1.3rem !important; letter-spacing: 3px !important; }
                        .section-title { font-size: 2.5rem !important; }
                        .nav-links { display: none !important; }
                        .features-grid { grid-template-columns: 1fr !important; }
                    }
                `}
            </style>

            <div style={styles.pageWrapper}>
                {/* Navigation Bar */}
                <nav style={styles.navbar}>
                    <Link to="/" style={styles.navLogo}>
                        <img 
                            src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
                            alt="Food Pulse"
                            style={styles.navIcon}
                        />
                        <span style={styles.navTitle}>FOOD PULSE</span>
                    </Link>
                    <div style={styles.navLinks}>
                        <a href="#features" style={styles.navLink} onMouseEnter={(e) => handleNavHover(e, true)} onMouseLeave={(e) => handleNavHover(e, false)}>Features</a>
                        <a href="#how-it-works" style={styles.navLink} onMouseEnter={(e) => handleNavHover(e, true)} onMouseLeave={(e) => handleNavHover(e, false)}>How It Works</a>
                        <a href="#restaurants" style={styles.navLink} onMouseEnter={(e) => handleNavHover(e, true)} onMouseLeave={(e) => handleNavHover(e, false)}>Restaurants</a>
                        <a href="#contact" style={styles.navLink} onMouseEnter={(e) => handleNavHover(e, true)} onMouseLeave={(e) => handleNavHover(e, false)}>Contact</a>
                    </div>
                </nav>

                {/* Hero Section */}
                <section style={styles.heroSection} id="home">
                    <div style={{...styles.decorativeElement, width: '400px', height: '400px', top: '-200px', left: '-200px'}}></div>
                    <div style={{...styles.decorativeElement, width: '300px', height: '300px', bottom: '-150px', right: '-150px'}}></div>
                    
                    <div style={styles.heroContent}>
                        <div style={styles.heroLogo}>
                            <div style={styles.heroIconContainer}>
                                <img 
                                    src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
                                    alt="Food Pulse"
                                    style={styles.heroIcon}
                                />
                            </div>
                        </div>
                        
                        <h1 style={styles.heroTitle} className="hero-title">FOOD PULSE</h1>
                        <p style={styles.heroSubtitle} className="hero-subtitle">PREMIUM FOOD DELIVERY EXPERIENCE</p>
                        <p style={styles.heroTagline}>
                            Experience culinary excellence delivered to your doorstep. Our master chefs craft each meal with premium ingredients, 
                            while our lightning-fast delivery ensures your food arrives hot, fresh, and perfectly prepared.
                        </p>
                        
                        <div style={styles.buttonContainer}>
                            <Link 
                                to="/login" 
                                style={styles.btnPrimary}
                                onMouseEnter={(e) => handleHover(e, true)}
                                onMouseLeave={(e) => handleHover(e, false)}
                            >
                                Order Now
                            </Link>
                            <Link 
                                to="/register" 
                                style={styles.btnSecondary}
                                onMouseEnter={(e) => handleHover(e, true)}
                                onMouseLeave={(e) => handleHover(e, false)}
                            >
                                Explore Menu
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section style={styles.featuresSection} id="features">
                    <h2 style={styles.sectionTitle}>WHY CHOOSE FOOD PULSE</h2>
                    <div style={styles.featuresGrid}>
                        {[
                            {
                                icon: 'https://cdn-icons-png.flaticon.com/512/2769/2769339.png',
                                title: 'Lightning Fast Delivery',
                                description: 'Average delivery time of 30 minutes guaranteed. Our optimized routes ensure your food arrives hot and fresh.'
                            },
                            {
                                icon: 'https://cdn-icons-png.flaticon.com/512/3655/3655682.png',
                                title: 'Premium Quality',
                                description: 'All ingredients are sourced from trusted suppliers. Master chefs prepare each dish with precision and care.'
                            },
                            {
                                icon: 'https://cdn-icons-png.flaticon.com/512/1041/1041916.png',
                                title: '24/7 Support',
                                description: 'Round-the-clock customer service. Any issues? We are here to help you anytime, anywhere.'
                            },
                            {
                                icon: 'https://cdn-icons-png.flaticon.com/512/1524/1524825.png',
                                title: 'Easy Tracking',
                                description: 'Real-time order tracking from kitchen to your doorstep. Know exactly when your food will arrive.'
                            },
                            {
                                icon: 'https://cdn-icons-png.flaticon.com/512/9296/9296472.png',
                                title: 'Multiple Cuisines',
                                description: 'Explore 500+ restaurants offering local and international cuisines. Something for every palate.'
                            },
                            {
                                icon: 'https://cdn-icons-png.flaticon.com/512/2910/2910762.png',
                                title: 'Secure Payments',
                                description: 'Multiple payment options with bank-level security. Your transactions are always safe with us.'
                            }
                        ].map((feature, index) => (
                            <div 
                                key={index}
                                style={styles.featureCard}
                                className="feature-card"
                                onMouseEnter={(e) => handleFeatureHover(e, true)}
                                onMouseLeave={(e) => handleFeatureHover(e, false)}
                            >
                                <div style={styles.featureIconWrapper} className="feature-icon-wrapper">
                                    <img 
                                        src={feature.icon} 
                                        alt={feature.title}
                                        style={styles.featureIcon}
                                        className="feature-icon"
                                    />
                                </div>
                                <h3 style={styles.featureTitle}>{feature.title}</h3>
                                <p style={styles.featureDescription}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stats Section */}
                <section style={styles.statsSection}>
                    <div style={styles.statsGrid}>
                        {[
                            { number: '50,000+', label: 'Happy Customers' },
                            { number: '500+', label: 'Partner Restaurants' },
                            { number: '30min', label: 'Average Delivery' },
                            { number: '24/7', label: 'Customer Support' }
                        ].map((stat, index) => (
                            <div key={index} style={styles.statItem}>
                                <div style={styles.statNumber}>{stat.number}</div>
                                <div style={styles.statLabel}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section style={styles.ctaSection} id="cta">
                    <div style={styles.ctaContent}>
                        <h2 style={styles.ctaTitle}>READY TO EXPERIENCE THE DIFFERENCE?</h2>
                        <p style={styles.ctaText}>
                            Join thousands of satisfied customers who trust Food Pulse for their daily meals. 
                            Download our app or order online to get started with premium food delivery today.
                        </p>
                        <div style={styles.buttonContainer}>
                            <Link 
                                to="/login" 
                                style={styles.btnPrimary}
                                onMouseEnter={(e) => handleHover(e, true)}
                                onMouseLeave={(e) => handleHover(e, false)}
                            >
                                Get Started
                            </Link>
                            <Link 
                                to="/register" 
                                style={styles.btnSecondary}
                                onMouseEnter={(e) => handleHover(e, true)}
                                onMouseLeave={(e) => handleHover(e, false)}
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer style={styles.footer}>
                    <div style={styles.footerContent}>
                        <div style={styles.footerSection}>
                            <h3 style={styles.footerTitle}>FOOD PULSE</h3>
                            <p style={styles.footerText}>
                                Your trusted partner for premium food delivery. We bring restaurant-quality meals 
                                to your doorstep with unparalleled speed, quality, and service excellence.
                            </p>
                            <div style={styles.socialIcons}>
                                {['https://cdn-icons-png.flaticon.com/512/733/733547.png', 'https://cdn-icons-png.flaticon.com/512/733/733579.png', 'https://cdn-icons-png.flaticon.com/512/733/733558.png'].map((icon, index) => (
                                    <div 
                                        key={index}
                                        style={styles.socialIcon}
                                        onMouseEnter={(e) => handleSocialHover(e, true)}
                                        onMouseLeave={(e) => handleSocialHover(e, false)}
                                    >
                                        <img src={icon} alt={`Social ${index}`} style={styles.socialIconImg} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={styles.footerSection}>
                            <h3 style={styles.footerTitle}>Quick Links</h3>
                            {['About Us', 'Our Menu', 'Partner Restaurants', 'Careers'].map((link, index) => (
                                <a 
                                    key={index}
                                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                                    style={styles.footerLink}
                                >
                                    {link}
                                </a>
                            ))}
                        </div>

                        <div style={styles.footerSection}>
                            <h3 style={styles.footerTitle}>Contact Info</h3>
                            <p style={styles.footerText}>
                                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Phone" style={{width: '18px', marginRight: '10px', filter: 'invert(79%) sepia(79%) saturate(459%) hue-rotate(359deg) brightness(104%) contrast(103%)'}} />
                                +94 11 234 5678
                            </p>
                            <p style={styles.footerText}>
                                <img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" alt="Email" style={{width: '18px', marginRight: '10px', filter: 'invert(79%) sepia(79%) saturate(459%) hue-rotate(359deg) brightness(104%) contrast(103%)'}} />
                                info@foodpulse.com
                            </p>
                            <p style={styles.footerText}>
                                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Location" style={{width: '18px', marginRight: '10px', filter: 'invert(79%) sepia(79%) saturate(459%) hue-rotate(359deg) brightness(104%) contrast(103%)'}} />
                                Negombo, Sri Lanka
                            </p>
                        </div>

                        <div style={styles.footerSection}>
                            <h3 style={styles.footerTitle}>Business Hours</h3>
                            <p style={styles.footerText}>Monday - Friday: 8:00 AM - 11:00 PM</p>
                            <p style={styles.footerText}>Saturday - Sunday: 9:00 AM - 12:00 AM</p>
                            <p style={{...styles.footerText, color: '#FFD700', fontWeight: '600', marginTop: '15px'}}>
                                24/7 Online Ordering Available
                            </p>
                        </div>
                    </div>

                    <div style={styles.footerBottom}>
                        <p>© 2024 Food Pulse Premium Delivery Service. All Rights Reserved. Crafted with passion for exceptional food experiences.</p>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default LandingPage;