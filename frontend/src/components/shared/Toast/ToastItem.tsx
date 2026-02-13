import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import styles from './ToastItem.module.css';
import type { ToastType } from '../../../context/ToastContext';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const getIcon = () => {
        switch (toast.type) {
            case 'success': return <CheckCircle size={18} className={styles.successIcon} />;
            case 'error': return <AlertCircle size={18} className={styles.errorIcon} />;
            case 'warning': return <AlertTriangle size={18} className={styles.warningIcon} />;
            default: return <Info size={18} className={styles.infoIcon} />;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`${styles.toast} ${styles[toast.type]}`}
        >
            <div className={styles.iconContainer}>
                {getIcon()}
            </div>
            <div className={styles.message}>
                {toast.message}
            </div>
            <button className={styles.closeBtn} onClick={() => onRemove(toast.id)}>
                <X size={14} />
            </button>
            <div className={styles.progress} />
        </motion.div>
    );
};

export default ToastComponent;
