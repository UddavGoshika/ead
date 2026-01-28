import React from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import styles from '../TeamLeadWorkspace.module.css';
import type { TeamMember } from '../types';

interface TeamMemberCardProps {
    member: TeamMember;
    onSelect: () => void;
    onStatusUpdate: (status: TeamMember['status']) => void;
    onDelete: () => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onSelect, onDelete }) => {
    return (
        <div className={styles.agentCard} onClick={onSelect}>
            <div className={styles.memberAvatar}>
                {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                ) : (
                    <div className={styles.avatarPlaceholder}>
                        {member.name.charAt(0)}
                    </div>
                )}
                <div className={`${styles.statusDot} ${styles[member.status]}`} />
            </div>
            <div className={styles.agentInfo}>
                <span className={styles.agentName}>{member.name}</span>
                <span className={styles.agentRole}>{member.role}</span>
            </div>
            <div className={styles.performanceMini}>
                <div className={styles.perfLabel}>PERFORMANCE</div>
                <div className={styles.perfValue}>{member.performance}%</div>
            </div>
            <div className={styles.cardActions}>
                <button className={styles.cardActionBtn} onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}>
                    <Trash2 size={16} />
                </button>
                <MoreVertical size={16} color="#64748b" />
            </div>
        </div>
    );
};

export default TeamMemberCard;
