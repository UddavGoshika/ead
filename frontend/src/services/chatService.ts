import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    where,
    doc,
    setDoc
} from "firebase/firestore";
import { db } from "../firebase";

export interface ChatMessage {
    id?: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: any;
    type: 'text' | 'image' | 'file';
    fileUrl?: string;
}

export interface ChatSession {
    id: string;
    clientName: string;
    clientId: string;
    lastMessage: string;
    updatedAt: any;
    status: 'waiting' | 'active' | 'closed';
    assignedStaffId?: string;
}

export const chatService = {
    // Start a new chat session (Client side)
    async startSession(clientId: string, clientName: string) {
        const sessionRef = doc(collection(db, 'chat_sessions'));
        const sessionData: ChatSession = {
            id: sessionRef.id,
            clientId,
            clientName,
            lastMessage: 'Started a new session',
            updatedAt: serverTimestamp(),
            status: 'waiting'
        };
        await setDoc(sessionRef, sessionData);
        return sessionRef.id;
    },

    // Get waiting sessions (Staff side)
    listenToWaitingSessions(callback: (sessions: ChatSession[]) => void) {
        const q = query(
            collection(db, 'chat_sessions'),
            where('status', '==', 'waiting'),
            orderBy('updatedAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const sessions = snapshot.docs.map(doc => doc.data() as ChatSession);
            callback(sessions);
        });
    },

    // Join a session (Staff side)
    async joinSession(sessionId: string, staffId: string) {
        const sessionRef = doc(db, 'chat_sessions', sessionId);
        await setDoc(sessionRef, {
            status: 'active',
            assignedStaffId: staffId,
            updatedAt: serverTimestamp()
        }, { merge: true });
    },

    // Send a message
    async sendMessage(sessionId: string, message: Partial<ChatMessage>) {
        const messagesRef = collection(db, 'chat_sessions', sessionId, 'messages');
        await addDoc(messagesRef, {
            ...message,
            timestamp: serverTimestamp(),
            type: message.type || 'text'
        });

        // Update last message in session
        const sessionRef = doc(db, 'chat_sessions', sessionId);
        await setDoc(sessionRef, {
            lastMessage: message.text || 'Sent an attachment',
            updatedAt: serverTimestamp()
        }, { merge: true });
    },

    // Listen to messages in a session
    listenToMessages(sessionId: string, callback: (messages: ChatMessage[]) => void) {
        const q = query(
            collection(db, 'chat_sessions', sessionId, 'messages'),
            orderBy('timestamp', 'asc')
        );
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
            callback(messages);
        });
    },

    // Listen to session metadata
    listenToSession(sessionId: string, callback: (session: ChatSession) => void) {
        return onSnapshot(doc(db, 'chat_sessions', sessionId), (snapshot) => {
            if (snapshot.exists()) {
                callback({ id: snapshot.id, ...snapshot.data() } as ChatSession);
            }
        });
    },

    // Close a session
    async closeSession(sessionId: string) {
        const sessionRef = doc(db, 'chat_sessions', sessionId);
        await setDoc(sessionRef, {
            status: 'closed',
            updatedAt: serverTimestamp()
        }, { merge: true });
    }
};
