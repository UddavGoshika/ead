import React, { useState } from "react";
import { Search, Eye, Download, Trash2, Shield, Calendar } from "lucide-react";
import styles from "./SupportRoles.module.css";
import SupportSidebar from "./SupportSidebar";
import SystemAlerts from "./SystemAlerts";

interface VaultImage {
    id: string;
    url: string;
    title: string;
    sender: string;
    timestamp: string;
    isNew: boolean;
}

const MOCK_IMAGES: VaultImage[] = [
    { id: "IMG1", url: "https://images.unsplash.com/photo-1589214159792-fd5bd2092cc7?auto=format&fit=crop&q=80&w=400", title: "Evidence_File_042.jpg", sender: "Adv. Rajesh Kumar", timestamp: "Today, 10:45 AM", isNew: true },
    { id: "IMG2", url: "https://images.unsplash.com/photo-1554224155-672629188427?auto=format&fit=crop&q=80&w=400", title: "Income_Cert_Scan.png", sender: "Sarah Williams", timestamp: "Yesterday, 4:20 PM", isNew: false },
    { id: "IMG3", url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=400", title: "Office_Premise_Photo", sender: "Adv. Amit Shah", timestamp: "Jan 22, 11:30 AM", isNew: false },
    { id: "IMG4", url: "https://images.unsplash.com/photo-1572177612104-71f347182255?auto=format&fit=crop&q=80&w=400", title: "Verification_Doc_B.jpg", sender: "Michael Chen", timestamp: "Jan 21, 9:15 AM", isNew: true },
    { id: "IMG5", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400", title: "System_Error_Log.png", sender: "Adv. Sneha Patil", timestamp: "Jan 20, 2:50 PM", isNew: false },
    { id: "IMG6", url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=400", title: "Meeting_Protocol.jpg", sender: "John Doe", timestamp: "Jan 19, 5:00 PM", isNew: false },
];

const ImageVault: React.FC = () => {
    const [selectedImg, setSelectedImg] = useState<VaultImage | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredImages = MOCK_IMAGES.filter(img =>
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.sender.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.hubWrapper}>
            <SupportSidebar onUserSelect={() => { }} />

            <main className={styles.mainContent}>
                <header className={styles.pageHeader}>
                    <div className={styles.headerTitle}>
                        <h1>Image Repository</h1>
                        <p><Shield size={14} color="var(--luxury-accent)" /> Encrypted Media Vault & Visual Intelligence</p>
                    </div>

                    <div className={styles.controls}>
                        <div className={styles.searchBox}>
                            <Search size={18} color="var(--luxury-accent)" />
                            <input
                                type="text"
                                placeholder="Search by Signal ID or Title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className={styles.controlBtn}>
                            <Calendar size={16} /> Date
                        </button>
                    </div>
                </header>

                <div className={styles.chatArea} style={{ padding: "40px" }}>
                    <div className={styles.vaultGrid}>
                        {filteredImages.map((img) => (
                            <div key={img.id} className={styles.vaultItem} onClick={() => setSelectedImg(img)}>
                                <img src={img.url} alt={img.title} className={styles.vaultImg} />
                                <div className={styles.vaultOverlay}>
                                    <div className={styles.vaultInfo}>
                                        <h4>{img.title}</h4>
                                        <span>Sent by {img.sender}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                                        <button className={styles.chip} style={{ padding: "4px 8px" }}><Eye size={12} /></button>
                                        <button className={styles.chip} style={{ padding: "4px 8px" }}><Download size={12} /></button>
                                    </div>
                                </div>
                                {img.isNew && <div className={styles.vaultBadge} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* HOLOGRAPHIC PREVIEW MODAL */}
                {selectedImg && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(2, 6, 23, 0.95)",
                            backdropFilter: "blur(20px)",
                            zIndex: 2000,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "50px"
                        }}
                        onClick={() => setSelectedImg(null)}
                    >
                        <div
                            style={{
                                position: "relative",
                                maxWidth: "1200px",
                                width: "100%",
                                animation: "modalOpen 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <img
                                src={selectedImg.url}
                                alt={selectedImg.title}
                                style={{
                                    width: "100%",
                                    borderRadius: "32px",
                                    boxShadow: "0 0 100px rgba(59, 130, 246, 0.2)",
                                    border: "1px solid var(--luxury-border)"
                                }}
                            />
                            <div style={{
                                position: "absolute",
                                bottom: "-80px",
                                left: "0",
                                right: "0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                color: "#fff"
                            }}>
                                <div>
                                    <h2 style={{ fontSize: "24px", fontWeight: 900, margin: 0 }}>{selectedImg.title}</h2>
                                    <p style={{ color: "var(--luxury-text-muted)", margin: "4px 0" }}>
                                        {selectedImg.sender} • {selectedImg.timestamp}
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: "15px" }}>
                                    <button className={styles.controlBtn} style={{ background: "var(--luxury-accent)", color: "#fff", border: "none" }}>
                                        <Download size={18} /> Download High-Res
                                    </button>
                                    <button className={styles.controlBtn}>
                                        <Trash2 size={18} /> Purge from Node
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <SystemAlerts />
            </main>
        </div>
    );
};

export default ImageVault;
