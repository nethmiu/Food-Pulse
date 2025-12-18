import React from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

const CustomModal = ({ isOpen, onClose, title, message, type = 'success', onConfirm, children }) => {
    if (!isOpen) return null;

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        },
        modal: {
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            animation: 'slideIn 0.3s ease-out'
        },
        iconContainer: {
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center'
        },
        title: {
            color: '#FFD700',
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '10px',
            fontFamily: "'Inter', sans-serif"
        },
        message: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1rem',
            marginBottom: '30px',
            lineHeight: '1.5',
            fontFamily: "'Inter', sans-serif"
        },
        buttonGroup: {
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
        },
        button: {
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: "'Inter', sans-serif",
            minWidth: '100px'
        },
        confirmButton: {
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#000',
        },
        cancelButton: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        },
        closeButton: {
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer'
        }
    };

    return (
        <div style={styles.overlay}>
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div style={styles.modal}>
                <button style={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                <div style={styles.iconContainer}>
                    {type === 'success' ? (
                        <CheckCircle size={60} color="#FFD700" />
                    ) : (
                        <AlertTriangle size={60} color="#FFD700" />
                    )}
                </div>

                <h3 style={styles.title}>{title}</h3>
                <p style={styles.message}>{message}</p>
                {children}

                <div style={styles.buttonGroup}>
                    {type === 'confirm' ? (
                        <>
                            <button
                                style={{ ...styles.button, ...styles.cancelButton }}
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                style={{ ...styles.button, ...styles.confirmButton }}
                                onClick={onConfirm}
                            >
                                Confirm
                            </button>
                        </>
                    ) : (
                        <button
                            style={{ ...styles.button, ...styles.confirmButton }}
                            onClick={onConfirm || onClose}
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomModal;
