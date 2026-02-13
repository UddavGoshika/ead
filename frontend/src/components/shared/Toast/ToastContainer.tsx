import React from 'react';
import { AnimatePresence } from 'framer-motion';
import ToastComponent from './ToastItem';
import type { Toast } from './ToastItem';
import styles from './ToastItem.module.css';

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className={styles.toastContainer}>
            <AnimatePresence>
                {toasts.map(toast => (
                    <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
