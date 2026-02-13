import { create } from 'zustand';

interface RelationshipState {
    relationships: Record<string, any>;
    interactedIds: Set<string>;
    setRelationship: (userId: string, state: string, role: string) => void;
    updateRelationship: (userId: string, data: any) => void;
    setRelationships: (rels: Record<string, any>) => void;
    hideProfile: (userId: string) => void;
}

export const useRelationshipStore = create<RelationshipState>((set) => ({
    relationships: {},
    interactedIds: new Set(),
    setRelationship: (userId, state, role) => set((prev) => ({
        relationships: {
            ...prev.relationships,
            [userId]: { state, role }
        }
    })),
    updateRelationship: (userId, data) => set((prev) => ({
        relationships: {
            ...prev.relationships,
            [userId]: { ...(prev.relationships[userId] || {}), ...data }
        }
    })),
    setRelationships: (rels) => set({ relationships: rels }),
    hideProfile: (userId) => set((prev) => ({
        interactedIds: new Set(prev.interactedIds).add(userId)
    }))
}));
