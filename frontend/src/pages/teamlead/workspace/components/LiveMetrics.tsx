import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from '../TeamLeadWorkspace.module.css';
import type { Metric } from '../types';

interface LiveMetricsProps {
    metrics: Metric[];
}

const LiveMetrics: React.FC<LiveMetricsProps> = ({ metrics }) => {
    return (
        <div className={styles.metricsContainer}>
            {metrics.map(metric => (
                <div key={metric.id} className={styles.liveMetricItem}>
                    <div className={styles.metricLabel}>{metric.name}</div>
                    <div className={styles.metricMain}>
                        <div className={styles.metricValue}>
                            {metric.value}
                            <span className={styles.metricUnit}>{metric.unit}</span>
                        </div>
                        <div className={`${styles.metricTrend} ${styles[metric.trend]}`}>
                            {metric.trend === 'up' && <TrendingUp size={14} />}
                            {metric.trend === 'down' && <TrendingDown size={14} />}
                            {metric.trend === 'stable' && <Minus size={14} />}
                            <span>{Math.abs(metric.change)}%</span>
                        </div>
                    </div>
                    <div className={styles.metricProgress}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${(metric.value / metric.target) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LiveMetrics;
