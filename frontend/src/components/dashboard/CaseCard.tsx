import React from 'react';
import { FileText, Calendar, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './CaseCard.module.css';
import type { Case } from '../../types';

interface CaseCardProps {
    caseData: Case;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseData }) => {
    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'open':
            case 'active':
                return <Clock size={16} className={styles.iconOpen} />;
            case 'closed':
            case 'resolved':
                return <CheckCircle2 size={16} className={styles.iconClosed} />;
            case 'pending':
                return <AlertCircle size={16} className={styles.iconPending} />;
            default: return <FileText size={16} />;
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.main}>
                <div className={styles.header}>
                    <div className={styles.titleInfo}>
                        <h3 className={styles.title}>{caseData.title}</h3>
                        <span className={styles.caseNumber}>{caseData.caseId}</span>
                    </div>
                    <div className={`${styles.statusBadge} ${styles[caseData.status.toLowerCase()]}`}>
                        {getStatusIcon(caseData.status)}
                        <span>{caseData.status}</span>
                    </div>
                </div>

                <div className={styles.details}>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Case Type</span>
                        <span className={styles.value}>{caseData.category}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Filing Date</span>
                        <span className={styles.value}>{caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Last Update</span>
                        <span className={styles.value}>
                            <Calendar size={14} />
                            {caseData.lastUpdate ? new Date(caseData.lastUpdate).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <button className={styles.viewBtn}>
                    <span>View Details</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default CaseCard;
