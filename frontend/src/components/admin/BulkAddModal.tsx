import React, { useState, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import styles from './BulkAddModal.module.css';
import type { Member } from '../../types';

interface Props {
    onClose: () => void;
    onSuccess: (newMembers: Member[]) => void;
}

export const BulkAddModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'upload' | 'preview'>('upload');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const data = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.split(',').map(v => v.trim());
                const obj: any = {};
                headers.forEach((header, i) => {
                    obj[header.toLowerCase()] = values[i];
                });
                return {
                    ...obj,
                    id: Math.random().toString(36).substr(2, 9),
                    status: 'Active',
                    since: new Date().toLocaleDateString(),
                    verified: true,
                    reported: 0,
                    image: '/avatar_placeholder.png'
                };
            });
            setPreviewData(data);
            setStep('preview');
        };
        reader.readAsText(file);
    };

    const handleImport = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            onSuccess(previewData);
            setLoading(false);
            onClose();
        }, 1500);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Bulk Member Add</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <div className={styles.content}>
                    {step === 'upload' ? (
                        <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                            <Upload size={48} className={styles.uploadIcon} />
                            <h3>Click to upload CSV</h3>
                            <p>Drag and drop your member data file here</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".csv"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className={styles.previewSection}>
                            <div className={styles.previewHeader}>
                                <h3>File Contents Preview ({previewData.length} records)</h3>
                                <button className={styles.reuploadBtn} onClick={() => setStep('upload')}>Change File</button>
                            </div>
                            <div className={styles.tableWrapper}>
                                <table className={styles.previewTable}>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Plan</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row: Member, i: number) => (
                                            <tr key={i}>
                                                <td>{row.name}</td>
                                                <td>{row.email}</td>
                                                <td>{row.role}</td>
                                                <td>{row.plan || 'Free'}</td>
                                                <td><span className={styles.statusValid}>Valid</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    {step === 'preview' && (
                        <button className={styles.importBtn} onClick={handleImport} disabled={loading}>
                            {loading ? <><Loader2 className={styles.spinner} /> Importing...</> : 'Import All Members'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

