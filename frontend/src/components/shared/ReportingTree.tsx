import React from 'react';
import styles from './ReportingTree.module.css';
import { MdPerson, MdSupervisorAccount, MdSettings, MdTrendingUp } from 'react-icons/md';

interface TreeNode {
    id: string;
    role: string;
    name: string;
    status: 'online' | 'offline' | 'busy';
    throughput?: string;
    children?: TreeNode[];
}

const MOCK_TREE: TreeNode = {
    id: '1',
    role: 'Operations Manager',
    name: 'Director Chen',
    status: 'online',
    children: [
        {
            id: '2',
            role: 'Team Lead (Ops)',
            name: 'Sarah Jenkins',
            status: 'online',
            throughput: '94%',
            children: [
                { id: '3', role: 'Telecaller', name: 'Alex Rivera', status: 'online', throughput: '88%' },
                { id: '4', role: 'Data Entry', name: 'John Doe', status: 'busy', throughput: '92%' },
                { id: '5', role: 'Customer Care', name: 'Maria Garcia', status: 'online', throughput: '96%' },
            ]
        },
        {
            id: '6',
            role: 'Team Lead (Support)',
            name: 'Mike Ross',
            status: 'online',
            throughput: '89%',
            children: [
                { id: '7', role: 'Call Support', name: 'Sam Wilson', status: 'online', throughput: '82%' },
                { id: '8', role: 'Live Chat', name: 'Clara Oswald', status: 'offline', throughput: '91%' },
            ]
        }
    ]
};

const TreeItem: React.FC<{ node: TreeNode; depth: number }> = ({ node, depth }) => {
    return (
        <div className={styles.treeNode} style={{ marginLeft: `${depth * 24}px` }}>
            <div className={styles.nodeContent}>
                <div className={`${styles.statusDot} ${styles[node.status]}`} />
                <div className={styles.iconWrapper}>
                    {depth === 0 ? <MdSettings /> : depth === 1 ? <MdSupervisorAccount /> : <MdPerson />}
                </div>
                <div className={styles.nodeInfo}>
                    <div className={styles.role}>{node.role}</div>
                    <div className={styles.name}>{node.name}</div>
                </div>
                {node.throughput && (
                    <div className={styles.throughput}>
                        <MdTrendingUp size={12} />
                        <span>{node.throughput}</span>
                    </div>
                )}
            </div>
            {node.children && (
                <div className={styles.connectorLine}>
                    {node.children.map(child => (
                        <TreeItem key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ReportingTree: React.FC = () => {
    return (
        <div className={styles.treeContainer}>
            <div className={styles.treeHeader}>
                <h3>Operational Hierarchy</h3>
                <p>Live visibility into the professional reporting structure.</p>
            </div>
            <div className={styles.treeBody}>
                <TreeItem node={MOCK_TREE} depth={0} />
            </div>
        </div>
    );
};

export default ReportingTree;
