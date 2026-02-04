import api from './api';

export interface Call {
    _id: string;
    caller: any;
    receiver: any;
    type: 'audio' | 'video';
    status: 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
    roomName: string;
    timestamp: string;
}

export const callService = {
    initiateCall: async (callerId: string, receiverId: string, type: 'audio' | 'video') => {
        const response = await api.post('/calls', { callerId, receiverId, type });
        return response.data.call;
    },

    getActiveCalls: async (userId: string) => {
        const response = await api.get(`/calls/active/${userId}`);
        return response.data;
    },

    updateCallStatus: async (callId: string, status: string) => {
        const response = await api.patch(`/calls/${callId}`, { status });
        return response.data.call;
    },

    getCallDetails: async (callId: string) => {
        const response = await api.get(`/calls/${callId}`);
        return response.data.call;
    }
};
