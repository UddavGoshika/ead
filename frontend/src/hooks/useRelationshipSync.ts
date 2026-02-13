import { useEffect } from 'react';
import { useSocketStore } from '../store/useSocketStore';
import { useRelationshipStore } from '../store/useRelationshipStore';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export const useRelationshipSync = () => {
    const { socket } = useSocketStore();
    const { setRelationship } = useRelationshipStore();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket) return;

        // Listen for relationship updates
        socket.on('relationship.updated', (data: any) => {
            const { sender_id, receiver_id, relationship_state, my_role } = data;

            // If I am involved, update my local store
            const partnerId = my_role === 'sender' ? receiver_id : sender_id;

            // Map the state correctly based on role
            let finalState = relationship_state;
            if (relationship_state === 'INTEREST') {
                finalState = my_role === 'sender' ? 'INTEREST_SENT' : 'INTEREST_RECEIVED';
            }

            setRelationship(partnerId, finalState, my_role);

            // Invalidate queries to refresh lists (Messenger, Activities, etc)
            queryClient.invalidateQueries({ queryKey: ['relationships'] });
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['callHistory'] });
        });

        // Listen for stats updates
        socket.on('stats.updated', (data: any) => {
            if (data.affectedUsers.includes(user?.id?.toString())) {
                queryClient.invalidateQueries({ queryKey: ['stats'] });
            }
        });

        return () => {
            socket.off('relationship.updated');
            socket.off('stats.updated');
        };
    }, [socket, setRelationship, queryClient, user?.id]);
};
