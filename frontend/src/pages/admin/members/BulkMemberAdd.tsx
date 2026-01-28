import React, { useState } from "react";
import styles from "./BulkMemberAdd.module.css";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import { useAuth } from "../../../context/AuthContext";

const BulkMemberAdd: React.FC = () => {
    const { openAdvocateReg, openClientReg } = useAuth();
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const [role, setRole] = useState("Advocate");
    const [pkg, setPkg] = useState("Free");
    const [templateType, setTemplateType] = useState("Advocate");
    const [validationMode, setValidationMode] = useState("Strict");
    const [dupHandling, setDupHandling] = useState("Skip");

    const handleUpload = () => {
        if (file) {
            alert(`Uploading ${file.name} for ${role} on ${pkg} package...`);
        } else {
            alert("Please select a file first.");
        }
    };

    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Bulk Member Management"
                onSearch={() => { }}
                onAddClick={(role) => role === 'advocate' ? openAdvocateReg() : openClientReg()}
                placeholder="Search templates..."
            />

            <div className={styles.filterBar}>
                <div className={styles.selectableFilters}>
                    <div className={styles.filterSection}>
                        <label>Target Role</label>
                        <div className={styles.chipGroup}>
                            {['Advocate', 'Client'].map(r => (
                                <button key={r} className={`${styles.chip} ${role === r ? styles.active : ''}`} onClick={() => setRole(r)}>{r}</button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.filterSection}>
                        <label>Target Package</label>
                        <div className={styles.chipGroup}>
                            {['Free', 'Pro Lite', 'Pro', 'Ultra Pro'].map(p => (
                                <button key={p} className={`${styles.chip} ${pkg === p ? styles.active : ''}`} onClick={() => setPkg(p)}>{p}</button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.filterSection}>
                        <label>CSV Template</label>
                        <div className={styles.chipGroup}>
                            {['Advocate', 'Client'].map(t => (
                                <button key={t} className={`${styles.chip} ${templateType === t ? styles.active : ''}`} onClick={() => setTemplateType(t)}>{t} Template</button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.filterSection}>
                        <label>Validation</label>
                        <div className={styles.chipGroup}>
                            {['Strict', 'Relaxed'].map(v => (
                                <button key={v} className={`${styles.chip} ${validationMode === v ? styles.active : ''}`} onClick={() => setValidationMode(v)}>{v}</button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.filterSection}>
                        <label>Duplicates</label>
                        <div className={styles.chipGroup}>
                            {['Skip', 'Overwrite', 'Merge'].map(d => (
                                <button key={d} className={`${styles.chip} ${dupHandling === d ? styles.active : ''}`} onClick={() => setDupHandling(d)}>{d}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.instructions}>
                    <h3>Bulk Operations</h3>
                    <p>Configure the parameters above and upload your member manifest.</p>
                    <button className={styles.downloadBtn}>Download {templateType} Template (.csv)</button>
                </div>

                <div className={styles.uploadSection}>
                    <div className={styles.dropZone}>
                        <input
                            type="file"
                            id="bulkFileUpload"
                            className={styles.fileInput}
                            onChange={handleFileChange}
                            accept=".csv, .xlsx"
                        />
                        <label htmlFor="bulkFileUpload" className={styles.fileLabel}>
                            <div className={styles.uploadIcon}>📁</div>
                            <div className={styles.uploadText}>
                                {file ? <strong>{file.name}</strong> : "Click to select or drag and drop your CSV/Excel file"}
                            </div>
                            <div className={styles.uploadMeta}>Max file size: 10MB</div>
                        </label>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.uploadBtn} onClick={handleUpload}>
                            Start Import Process
                        </button>
                    </div>
                </div>

                <div className={styles.notes}>
                    <h4>Important Notes:</h4>
                    <ul>
                        <li>The system supports .CSV and .XLSX formats.</li>
                        <li>Ensure the headers match the template exactly.</li>
                        <li>Passwords will be generated automatically if not provided.</li>
                        <li>Members will receive an invitation email upon successful import.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BulkMemberAdd;
