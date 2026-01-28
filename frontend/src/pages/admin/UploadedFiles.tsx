
import React, { useState } from "react";
import styles from "./UploadedFiles.module.css";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

/* ================= TYPES ================= */
interface FileItem {
    id: number;
    name: string;
    size: string;
    url: string;
    selected: boolean;
}

/* ================= MOCK DATA ================= */
const initialFiles: FileItem[] = [
    {
        id: 1,
        name: "woman-model-natural.webp",
        size: "76.77 KB",
        url: "https://randomuser.me/api/portraits/women/44.jpg",
        selected: false,
    },
    {
        id: 2,
        name: "blog5.webp",
        size: "60.08 KB",
        url: "https://picsum.photos/300/200",
        selected: false,
    },
    {
        id: 3,
        name: "profile-man.jpg",
        size: "132.65 KB",
        url: "https://randomuser.me/api/portraits/men/32.jpg",
        selected: false,
    },
    {
        id: 4,
        name: "creative-banner.png",
        size: "416.74 KB",
        url: "https://picsum.photos/400/200",
        selected: false,
    },
    {
        id: 5,
        name: "google-play.png",
        size: "4.41 KB",
        url: "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg",
        selected: false,
    },
    {
        id: 6,
        name: "app-store.png",
        size: "2.96 KB",
        url: "https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg",
        selected: false,
    },
];

/* ================= COMPONENT ================= */
const UploadedFiles: React.FC = () => {
    const [files, setFiles] = useState<FileItem[]>(initialFiles);
    const [selectAll, setSelectAll] = useState(false);

    const toggleSelectAll = () => {
        setSelectAll(!selectAll);
        setFiles(prev =>
            prev.map(f => ({ ...f, selected: !selectAll }))
        );
    };

    const toggleFile = (id: number) => {
        setFiles(prev =>
            prev.map(f =>
                f.id === id ? { ...f, selected: !f.selected } : f
            )
        );
    };

    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Uploaded Files"
                onSearch={(q) => console.log('Searching files', q)}
                placeholder="Search your files..."
            />

            <div className={styles.headerActionsSecondary}>
                <button className={styles.uploadBtn}>Upload New File</button>
            </div>

            {/* ================= TOOLBAR ================= */}
            <div className={styles.toolbar}>
                <h3>All Files</h3>

                <div className={styles.toolbarActions}>
                    <select className={styles.select}>
                        <option>Bulk Action</option>
                        <option>Delete</option>
                    </select>

                    <select className={styles.select}>
                        <option>Sort by newest</option>
                        <option>Sort by oldest</option>
                    </select>
                </div>
            </div>

            {/* ================= SELECT ALL ================= */}
            <div className={styles.selectAll}>
                <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                />
                <label>Select All</label>
            </div>

            {/* ================= FILE GRID ================= */}
            <div className={styles.grid}>
                {files.map(file => (
                    <div
                        key={file.id}
                        className={`${styles.fileCard} ${file.selected ? styles.active : ""
                            }`}
                    >
                        <div className={styles.cardHeader}>
                            <input
                                type="checkbox"
                                checked={file.selected}
                                onChange={() => toggleFile(file.id)}
                            />
                            <span className={styles.menu}>⋮</span>
                        </div>

                        <img src={file.url} className={styles.thumbnail} />

                        <div className={styles.fileInfo}>
                            <p className={styles.fileName}>{file.name}</p>
                            <span className={styles.fileSize}>{file.size}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UploadedFiles;
