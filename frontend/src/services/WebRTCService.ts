import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "../firebase";

const servers = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302',
            ],
        },
    ],
    iceCandidatePoolSize: 10,
};

export class WebRTCService {
    pc: RTCPeerConnection;
    localStream: MediaStream | null = null;
    remoteStream: MediaStream | null = null;
    callId: string | null = null;

    constructor() {
        this.pc = new RTCPeerConnection(servers);
    }

    async startLocalStream(video: boolean = true) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
            video: video,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            },
        });
        this.remoteStream = new MediaStream();

        this.localStream.getTracks().forEach((track) => {
            if (this.localStream) this.pc.addTrack(track, this.localStream);
        });

        this.pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                if (this.remoteStream) this.remoteStream.addTrack(track);
            });
        };

        return { local: this.localStream, remote: this.remoteStream };
    }

    toggleAudio(enabled: boolean) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => track.enabled = enabled);
        }
    }

    toggleVideo(enabled: boolean) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => track.enabled = enabled);
        }
    }

    async ensureAuth() {
        if (!auth.currentUser) {
            console.log("Firebase: Signing in anonymously for WebRTC signaling...");
            await signInAnonymously(auth);
        }
    }

    async createCall(targetUserId: string, callerName: string, type: 'voice' | 'video') {
        await this.ensureAuth();
        const callDoc = doc(collection(db, 'calls'));
        const offerCandidates = collection(callDoc, 'offerCandidates');
        const answerCandidates = collection(callDoc, 'answerCandidates');

        this.callId = callDoc.id;

        this.pc.onicecandidate = (event) => {
            event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
        };

        const offerDescription = await this.pc.createOffer();
        await this.pc.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
            callerId: auth.currentUser?.uid,
            callerName: callerName,
            status: 'calling',
            callType: type,
            targetUserId: targetUserId,
            timestamp: serverTimestamp()
        };

        await setDoc(callDoc, { offer, createdAt: serverTimestamp() });

        // Listen for remote answer
        onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (!this.pc.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                this.pc.setRemoteDescription(answerDescription);
            }
        });

        // Listen for remote ICE candidates
        onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const candidate = new RTCIceCandidate(data);
                    this.pc.addIceCandidate(candidate);
                }
            });
        });

        return callDoc.id;
    }

    async answerCall(callId: string) {
        await this.ensureAuth();
        this.callId = callId;
        const callDoc = doc(db, 'calls', callId);
        const offerCandidates = collection(callDoc, 'offerCandidates');
        const answerCandidates = collection(callDoc, 'answerCandidates');

        this.pc.onicecandidate = (event) => {
            event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
        };

        const callData = (await getDoc(callDoc)).data();
        const offerDescription = callData?.offer;
        await this.pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

        const answerDescription = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        };

        await updateDoc(callDoc, { answer, status: 'connected' });

        onSnapshot(offerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    this.pc.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
    }

    async hangup() {
        if (this.callId) {
            try {
                const callDoc = doc(db, 'calls', this.callId);
                await deleteDoc(callDoc);
            } catch (err) {
                console.error("Hangup document deletion error:", err);
            }
        }
        if (this.pc) {
            this.pc.close();
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach(t => t.stop());
        }
        this.callId = null;
    }
}

export const useCallSignals = (userId: string, onIncomingCall: (callId: string, caller: any) => void) => {
    // Listen for calls where targetUserId matches our userId
    const q = query(collection(db, 'calls'), where('offer.targetUserId', '==', userId));

    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const data = change.doc.data();

                // --- PREVENT OLD CALLS ON LOGIN ---
                // Only trigger if the call was created in the last 10 seconds
                const createdAt = data.createdAt?.toDate();
                const now = new Date();
                const isRecent = createdAt && (now.getTime() - createdAt.getTime()) < 10000;

                if (data.offer && !data.answer && isRecent) {
                    onIncomingCall(change.doc.id, data.offer);
                }
            }
        });
    });
};
