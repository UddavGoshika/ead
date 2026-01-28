import React from 'react';
import { Clock, MoreHorizontal } from 'lucide-react';
import styles from '../TeamLeadWorkspace.module.css';
import type { Task } from '../types';

interface TaskBoardProps {
    tasks: Task[];
    onTaskSelect: (task: Task) => void;
    onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
    onTaskDelete: (taskId: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskSelect }) => {
    const columns: Task['status'][] = ['todo', 'in-progress', 'review', 'done'];

    return (
        <div className={styles.taskBoard}>
            {columns.map(column => (
                <div key={column} className={styles.taskColumn}>
                    <div className={styles.columnHeader}>
                        <h3>{column.replace('-', ' ').toUpperCase()}</h3>
                        <span className={styles.taskCount}>
                            {tasks.filter(t => t.status === column).length}
                        </span>
                    </div>
                    <div className={styles.taskList}>
                        {tasks.filter(t => t.status === column).map(task => (
                            <div key={task.id} className={styles.taskCard} onClick={() => onTaskSelect(task)}>
                                <div className={styles.taskHeader}>
                                    <span className={`${styles.priorityBadge} ${styles[task.priority]}`}>
                                        {task.priority.toUpperCase()}
                                    </span>
                                    <button className={styles.taskActions}>
                                        <MoreHorizontal size={14} />
                                    </button>
                                </div>
                                <h4 className={styles.taskTitle}>{task.title}</h4>
                                <p className={styles.taskDesc}>{task.description}</p>
                                <div className={styles.taskMeta}>
                                    <div className={styles.metaItem}>
                                        <Clock size={12} />
                                        <span>{task.dueDate}</span>
                                    </div>
                                    <div className={styles.assigneeAvatar}>
                                        {task.assignee.charAt(0)}
                                    </div>
                                </div>
                                {task.tags.length > 0 && (
                                    <div className={styles.taskTags}>
                                        {task.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className={styles.tag}>{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskBoard;
