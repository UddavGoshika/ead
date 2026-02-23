import { create } from 'zustand';
import io from 'socket.io-client';

const getSocketUrl = () => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) return envUrl;
    const { hostname, protocol, origin } = window.location;
    if (hostname === 'localhost' || /^(\d+\.){3}\d+$/.test(hostname)) {
        return `${protocol}//${hostname}:5000`;
    }
    return origin;
};

const API_BASE_URL = getSocketUrl();

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

        socket.on('message', (data) => {
            window.dispatchEvent(new CustomEvent('socket-message', { detail: data }));
        });

        socket.on('support:new-email', (data) => {
            window.dispatchEvent(new CustomEvent('support:new-email', { detail: data }));
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
