export interface TeamMember {
    id: string;
    name: string;
    role: string;
    status: 'online' | 'offline' | 'away' | 'busy' | 'in-meeting';
    performance: number;
    tasks: {
        completed: number;
        pending: number;
        overdue: number;
    };
    availability: {
        current: 'available' | 'busy' | 'break';
        nextAvailable: string;
    };
    contact: {
        email: string;
        phone: string;
        slack: string;
    };
    skills: string[];
    lastActive: string;
    avatar?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'todo' | 'in-progress' | 'review' | 'done';
    dueDate: string;
    estimatedHours: number;
    actualHours: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Metric {
    id: string;
    name: string;
    value: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
    unit: string;
}

export interface Activity {
    id: string;
    type: 'task' | 'message' | 'meeting' | 'system';
    user: string;
    action: string;
    timestamp: string;
    details?: string;
    read: boolean;
}

export interface Alert {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high';
    read: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
}
