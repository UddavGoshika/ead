import { create } from 'zustand';
import io from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface SocketState {
    socket: any | null;
    isConnected: boolean;
    initialize: (userId: string) => void;
    disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    isConnected: false,
    initialize: (userId) => {
        if (get().socket) return;

        const socket = io(API_BASE_URL);

        socket.on('connect', () => {
            console.log('Connected to socket server');
            set({ isConnected: true });
            socket.emit('register', userId);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
            set({ isConnected: false });
        });

        set({ socket });
    },
    disconnect: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false });
        }
    }
}));
