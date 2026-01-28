import React, { useState, useEffect } from 'react';
import styles from './SearchSection.module.css';
import { ChevronDown, MapPin, Loader2, Handshake, Star, Bookmark, MessageCircle, Shield, Coins, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { advocateService, clientService } from '../../services/api';
import { interactionService } from '../../services/interactionService';
import type { ClientProfile } from '../../services/api';
import type { Advocate } from '../../types';
import ConfirmationModal from '../layout/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';

const SearchSection: React.FC = () => {
    const { searchRole, setSearchRole, user, isLoggedIn, openAuthModal } = useAuth();
    const [advocates, setAdvocates] = useState<Advocate[]>([]);
    const [clients, setClients] = useState<ClientProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal & Notification State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ targetId: string; targetRole: string } | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const advRes = await advocateService.getAdvocates();
            if (advRes.data.success) setAdvocates(advRes.data.advocates);
        } catch (err) { console.error('Error fetching advocates:', err); }

        try {
            const clientRes = await clientService.getClients();
            if (clientRes.data.success) setClients(clientRes.data.clients);
        } catch (err) { console.error('Error fetching clients:', err); }
        setLoading(false);
    };

    const handleAction = async (targetId: string, action: string) => {
        if (!isLoggedIn) {
            openAuthModal('login');
            return;
        }

        const role = searchRole === 'advocates' ? 'advocate' : 'client';

        if (action === 'chat') {
            setPendingAction({ targetId, targetRole: role });
            setIsConfirmOpen(true);
            return;
        }

        try {
            const userId = String(user?.id);
            const res = await interactionService.recordActivity(role, targetId, action, userId);

            if (res.success) {
                showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} sent successfully!`, 'info');
            }
        } catch (err: any) {
            showNotification(err.response?.data?.error || 'Action failed', 'info');
        }
    };

    const confirmChat = async () => {
        if (!pendingAction) return;
        setIsConfirmOpen(false);

        try {
            const userId = String(user?.id);
            const res = await interactionService.recordActivity(pendingAction.targetRole, pendingAction.targetId, 'chat', userId);

            if (res.success) {
                showNotification('Chat initiated! 2 coins deducted.', 'success');
                // Open chat interface logic here
            }
        } catch (err: any) {
            showNotification(err.response?.data?.error || 'Failed to initiate chat', 'info');
        }
    };

    const showNotification = (message: string, type: 'success' | 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const displayedProfiles = searchRole === 'advocates' ? advocates : clients;

    const maskId = (id: string) => {
        if (!id) return "********";
        let letterCount = 0;
        let numberCount = 0;
        return id.split('').map(char => {
            if (/[a-zA-Z]/.test(char)) {
                letterCount++;
                return letterCount <= 2 ? char : '*';
            }
            if (/[0-9]/.test(char)) {
                numberCount++;
                return numberCount <= 2 ? char : '*';
            }
            return char;
        }).join('');
    };

    const maskName = (name: string) => {
        if (!name) return "**";
        const parts = name.trim().split(/\s+/);
        return parts.map(part => {
            if (part.length <= 2) return part;
            return part.substring(0, 2) + "**";
        }).join(" ");
    };

    return (
        <section id="search" className={styles.searchSection}>
            <div className={styles.container}>
                {/* Notification Toast */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            className={`${styles.notification} ${styles[notification.type]}`}
                            initial={{ opacity: 0, y: -100, x: '-50%', scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -100, scale: 0.5 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 40,
                                mass: 1
                            }}
                        >
                            <div className={styles.notifIcon}>
                                <CheckCircle size={24} />
                            </div>
                            <div className={styles.notifText}>
                                <span>{notification.message}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={styles.header}>
                    <h2 className={styles.title}>Browse Profiles</h2>
                    <p className={styles.subtitle}>Search, filter, and connect with top-rated legal professionals.</p>
                </div>

                <div className={styles.controls}>
                    <div className={styles.roleToggle}>
                        <button
                            id="role-toggle-advocates"
                            className={`${styles.roleBtn} ${searchRole === 'advocates' ? styles.active : ''}`}
                            onClick={() => setSearchRole('advocates')}
                        >
                            Advocates
                        </button>
                        <button
                            id="role-toggle-clients"
                            className={`${styles.roleBtn} ${searchRole === 'clients' ? styles.active : ''}`}
                            onClick={() => setSearchRole('clients')}
                        >
                            Clients
                        </button>
                    </div>

                    <div className={styles.filterBar}>
                        <div className={styles.selectWrapper}>
                            <select><option>Location</option><option>Mumbai</option><option>Delhi</option></select>
                            <ChevronDown className={styles.chevron} size={18} />
                        </div>
                        <div className={`${styles.selectWrapper} ${searchRole === 'clients' ? styles.disabledFilter : ''}`}>
                            <select disabled={searchRole === 'clients'}>
                                {searchRole === 'clients' ? <option>Experience </option> : (
                                    <><option>Experience</option><option>0-5 Years</option><option>5-10 Years</option><option>10+ Years</option></>
                                )}
                            </select>
                            <ChevronDown className={styles.chevron} size={18} />
                        </div>
                        <div className={styles.selectWrapper}>
                            <select><option>Specialization</option><option>Corporate</option><option>Criminal</option></select>
                            <ChevronDown className={styles.chevron} size={18} />
                        </div>
                        <button className={styles.applyBtn}>Apply Filters</button>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}><Loader2 className={styles.spinner} size={40} /><p>Loading profiles...</p></div>
                ) : (
                    <div className={styles.resultsGrid}>
                        {displayedProfiles.length > 0 ? (
                            displayedProfiles.map((profile: any) => {
                                const name = profile.name || profile.firstName || 'User';
                                const initial = name.charAt(0).toUpperCase();

                                return (
                                    <div key={profile.id || profile._id} className={styles.luxuryCard}>
                                        <div className={styles.cardContent}>
                                            {/* Blurry Background Image */}
                                            {profile.profilePicPath ? (
                                                <img
                                                    src={`/${profile.profilePicPath.replace(/\\/g, '/')}`}
                                                    className={styles.profileImage}
                                                    alt={name}
                                                />
                                            ) : (
                                                <div className={styles.largeInitial}>{initial}</div>
                                            )}

                                            <div className={styles.topRightBadge}>
                                                <div className={styles.idPill}>
                                                    <Shield size={12} />
                                                    <span>{maskId(profile.unique_id)}</span>
                                                </div>
                                            </div>
                                            <div className={styles.cardOverlay}>
                                                <div className={styles.bottomLeft}>
                                                    <h3 className={styles.profileName}>{maskName(name)}</h3>
                                                    <div className={styles.locationInfo}>
                                                        <MapPin size={14} />
                                                        <span>{profile.specialization || (Array.isArray(profile.specialties) ? profile.specialties[0] : profile.specialties) || 'General Practice'}</span>
                                                    </div>
                                                </div>
                                                <div className={styles.bottomRight}>
                                                    <div className={styles.infoLine}><span className={styles.infoLabel}>Experience:</span><span className={styles.infoValue}>{profile.experience || 'N/A'}</span></div>
                                                    <div className={styles.infoLine}>
                                                        <span className={styles.infoLabel}>Practice:</span>
                                                        <span className={styles.infoValue}>{profile.specialization || (Array.isArray(profile.specialties) ? profile.specialties[0] : profile.specialties) || 'Legal Services'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.actionGrid}>
                                            <button className={styles.luxuryAction} onClick={() => handleAction(profile._id || profile.id, 'interest')}>
                                                <Handshake className={styles.actionIcon} size={20} /><span>Interest</span>
                                            </button>
                                            <button className={styles.luxuryAction} onClick={() => handleAction(profile._id || profile.id, 'superInterest')}>
                                                <Star className={styles.actionIcon} size={20} /><span>Super Interest</span>
                                            </button>
                                            <button className={styles.luxuryAction} onClick={() => handleAction(profile._id || profile.id, 'shortlist')}>
                                                <Bookmark className={styles.actionIcon} size={20} /><span>Shortlist</span>
                                            </button>
                                            <button className={styles.luxuryAction} onClick={() => handleAction(profile._id || profile.id, 'chat')}>
                                                <MessageCircle className={styles.actionIcon} size={20} /><span>Chat</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : <div className={styles.noResults}><p>No {searchRole} found.</p></div>}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmChat}
                title="Initiate Chat"
                message="You will cut 2 coins to initiate this chat. Do you want to proceed?"
                confirmText="Yes, Proceed"
                icon={<Coins size={48} color="#ffd700" />}
            />
        </section>
    );
};

export default SearchSection;
