import React from 'react';
import { motion } from 'framer-motion';
import styles from './StatCard.module.css';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: string | number;
        isPositive: boolean;
        label: string;
    };
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colorMap = {
    blue: { bg: '#3b82f620', icon: '#3b82f6' },
    green: { bg: '#10b98120', icon: '#10b981' },
    yellow: { bg: '#facc1520', icon: '#facc15' },
    red: { bg: '#ef444420', icon: '#ef4444' },
    purple: { bg: '#8b5cf620', icon: '#8b5cf6' }
};

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    trend,
    color = 'yellow'
}) => {
    const theme = colorMap[color];

    return (
        <motion.div
            className={styles.card}
            whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
            transition={{ duration: 0.2 }}
        >
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <h3 className={styles.title}>{title}</h3>
                    <div className={styles.value}>{value}</div>
                </div>
                <div className={styles.iconWrapper} style={{ backgroundColor: theme.bg, color: theme.icon }}>
                    {icon}
                </div>
            </div>

            {trend && (
                <div className={styles.footer}>
                    <span className={`${styles.trendValue} ${trend.isPositive ? styles.positive : styles.negative}`}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}
                    </span>
                    <span className={styles.trendLabel}>vs last {trend.label}</span>
                </div>
            )}
        </motion.div>
    );
};
