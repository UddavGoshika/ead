import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocketStore } from '../../store/useSocketStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, X, Play, RotateCcw } from 'lucide-react';
import SnakeGame from './SnakeGame';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const GlobalUtilityHandler: React.FC = () => {
    const { isLoggedIn, logout, user } = useAuth(); // Added 'user'
    const { showToast } = useToast();
    const { initialize: initializeSocket, disconnect: disconnectSocket } = useSocketStore(); // Added this line
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showGame, setShowGame] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // --- SOCKET INITIALIZATION ---
    useEffect(() => {
        if (isLoggedIn && user) {
            const id = user.id || user._id;
            if (id) {
                console.log('[GlobalUtilityHandler] Initializing Global Socket for user:', id);
                initializeSocket(String(id));
            }
        } else {
            disconnectSocket();
        }
    }, [isLoggedIn, user?.id, user?._id, initializeSocket, disconnectSocket]);

    // --- NETWORK STATUS ---
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            showToast('Connected to use', 'success');
        };
        const handleOffline = () => {
            setIsOnline(false);
            showToast('Network disconnected', 'error');
            setShowGame(true); // Offer game when offline
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [showToast]);

    // --- AUTO LOGOUT ---
    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (isLoggedIn) {
            timerRef.current = setTimeout(() => {
                console.log('Inactivity logout triggered');
                logout();
                showToast('Logged out due to inactivity', 'info');
            }, INACTIVITY_TIMEOUT);
        }
    }, [isLoggedIn, logout, showToast]);

    useEffect(() => {
        if (!isLoggedIn) return;

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isLoggedIn, resetTimer]);

    return (
        <>
            <AnimatePresence>
                {showGame && (
                    <div style={styles.modalOverlay}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={styles.gameModal}
                        >
                            <div style={styles.gameHeader}>
                                <h3>🎮 Mini Break Game</h3>
                                <button onClick={() => setShowGame(false)} style={styles.closeBtn}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={styles.gameBody}>
                                <SnakeGame />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {!isOnline && (
                <div style={styles.offlineBanner}>
                    <WifiOff size={16} />
                    <span>You are currently offline. <button onClick={() => setShowGame(true)} style={styles.playBtn}>Play Game?</button></span>
                </div>
            )}
        </>
    );
};


const styles = {
    modalOverlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(5px)',
    },
    gameModal: {
        backgroundColor: '#1a1a1a',
        borderRadius: '20px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        border: '1px solid #333',
    },
    gameHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        color: '#fff',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#666',
        cursor: 'pointer',
    },
    gameBody: {
        height: '400px',
    },
    gameContainer: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    gameStats: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        color: '#F9D423',
        fontWeight: 'bold' as const,
        fontSize: '18px',
    },
    gameBoard: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        borderRadius: '12px',
        position: 'relative' as const,
        overflow: 'hidden',
        border: '1px solid #222',
        cursor: 'crosshair',
    },
    startScreen: {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center' as const,
        color: '#fff',
    },
    startBtn: {
        backgroundColor: '#F9D423',
        color: '#000',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '30px',
        fontSize: '18px',
        fontWeight: 'bold' as const,
        cursor: 'pointer',
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    ball: {
        width: '40px',
        height: '40px',
        backgroundColor: '#ff3e00',
        borderRadius: '50%',
        position: 'absolute' as const,
        cursor: 'pointer',
        boxShadow: '0 0 20px #ff3e00, 0 0 40px #ff3e00',
        border: '2px solid #fff',
    },
    offlineBanner: {
        position: 'fixed' as const,
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#ef4444',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 10000,
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    },
    playBtn: {
        background: '#fff',
        color: '#ef4444',
        border: 'none',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '12px',
        fontWeight: 'bold' as const,
        cursor: 'pointer',
        marginLeft: '5px',
    }
};

export default GlobalUtilityHandler;
