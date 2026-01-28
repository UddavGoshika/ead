import React from 'react';
import { Target, MessageSquare, Calendar, Activity as ActivityIcon } from 'lucide-react';
import styles from '../TeamLeadWorkspace.module.css';
import type { Activity } from '../types';

interface RecentActivityProps {
    activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
    return (
        <div className={styles.activityList}>
            {activities.map(activity => (
                <div key={activity.id} className={`${styles.activityItem} ${!activity.read ? styles.unread : ''}`}>
                    <div className={styles.activityIcon}>
                        {activity.type === 'task' && <Target size={14} />}
                        {activity.type === 'message' && <MessageSquare size={14} />}
                        {activity.type === 'meeting' && <Calendar size={14} />}
                        {activity.type === 'system' && <ActivityIcon size={14} />}
                    </div>
                    <div className={styles.activityContent}>
                        <div className={styles.activityHeader}>
                            <span className={styles.activityUser}>{activity.user}</span>
                            <span className={styles.activityTime}>{activity.timestamp}</span>
                        </div>
                        <div className={styles.activityAction}>{activity.action}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentActivity;
