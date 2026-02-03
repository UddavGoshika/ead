import api from './api';
import type { Advocate } from '../types';

export interface Activity {
    id: string;
    type: 'interest' | 'super-interest' | 'shortlist' | 'chat_initiated' | 'message_sent';
    clientId: string;
    clientName: string;
    advocateId: string;
    advocateName: string;
    timestamp: number;
    details?: string;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: number;
}

export interface Conversation {
    advocate: Advocate;
    lastMessage?: Message;
    unreadCount: number;
}

export const interactionService = {
    recordActivity: async (targetRole: string, targetId: string, action: string, userId: string) => {
        const response = await api.post(`/interactions/${targetRole}/${targetId}/${action}`, { userId });
        return response.data;
    },

    getActivities: async (role: string, userId: string): Promise<Activity[]> => {
        const response = await api.get(`/interactions/my-requests/${role}/${userId}`);
        const data = response.data;

        const activities: Activity[] = [];

        // Map interests to Activity interface
        data.interests?.forEach((u: any) => {
            activities.push({
                id: u._id,
                type: 'interest',
                clientId: u.unique_id || u._id,
                clientName: u.name || `${u.firstName} ${u.lastName}`,
                advocateId: userId,
                advocateName: '', // Will be filled or ignored in display
                timestamp: Date.now(), // Backend doesn't store timestamp per interest yet, use current
            });
        });

        data.superInterests?.forEach((u: any) => {
            activities.push({
                id: u._id,
                type: 'super-interest',
                clientId: u.unique_id || u._id,
                clientName: u.name || `${u.firstName} ${u.lastName}`,
                advocateId: userId,
                advocateName: '',
                timestamp: Date.now(),
            });
        });

        data.shortlists?.forEach((u: any) => {
            activities.push({
                id: u._id,
                type: 'shortlist',
                clientId: u.unique_id || u._id,
                clientName: u.name || `${u.firstName} ${u.lastName}`,
                advocateId: userId,
                advocateName: '',
                timestamp: Date.now(),
            });
        });

        return activities;
    },

    sendMessage: async (senderId: string, receiverId: string, text: string) => {
        const response = await api.post('/interactions/messages', { sender: senderId, receiver: receiverId, text });
        const msg = response.data.message;
        return {
            id: msg._id,
            senderId: msg.sender,
            receiverId: msg.receiver,
            text: msg.text,
            timestamp: new Date(msg.timestamp).getTime()
        } as Message;
    },

    getConversationMessages: async (id1: string, id2: string): Promise<Message[]> => {
        const response = await api.get(`/interactions/messages/${id1}/${id2}`);
        return response.data.messages.map((msg: any) => ({
            id: msg._id,
            senderId: msg.sender,
            receiverId: msg.receiver,
            text: msg.text,
            timestamp: new Date(msg.timestamp).getTime()
        }));
    },

    getConversations: async (userId: string): Promise<Conversation[]> => {
        const response = await api.get(`/interactions/conversations/${userId}`);
        return response.data.conversations.map((c: any) => ({
            advocate: {
                unique_id: c.partnerUniqueId,
                id: c.partnerId,
                name: c.partnerName,
                profilePic: c.partnerImg,
                location: c.partnerLocation,
            } as any as Advocate,
            lastMessage: {
                id: 'last',
                senderId: '',
                receiverId: userId,
                text: c.lastMessage,
                timestamp: new Date(c.timestamp).getTime()
            },
            unreadCount: 0
        }));
    },

    getActivityStats: async (userId: string) => {
        const response = await api.get(`/interactions/stats/${userId}`);
        return response.data.stats;
    },

    getAllActivities: async (userId: string) => {
        const response = await api.get(`/interactions/all/${userId}`);
        return response.data.activities;
    },

    respondToActivity: async (activityId: string, status: 'accepted' | 'declined') => {
        const response = await api.post(`/interactions/respond/${activityId}/${status}`);
        return response.data;
    },

    deleteActivity: async (activityId: string) => {
        const response = await api.delete(`/interactions/${activityId}`);
        return response.data;
    }
};
