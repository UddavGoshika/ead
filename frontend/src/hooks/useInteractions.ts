import { useAuth } from '../context/AuthContext';
import { interactionService } from '../services/interactionService';
import { useRelationshipStore } from '../store/useRelationshipStore';
import { useQueryClient } from '@tanstack/react-query';

export const useInteractions = (showToast?: (msg: string) => void) => {
    const { user, refreshUser } = useAuth();
    const { setRelationship, hideProfile } = useRelationshipStore();
    const queryClient = useQueryClient();

    const handleInteraction = async (
        profile: any,
        action: string,
        data?: any
    ) => {
        if (!user) return;

        if (user.status === 'Pending') {
            alert("Your profile is under verification. You can perform interactions once approved (usually in 12-24 hours).");
            return;
        }

        const targetId = String(profile.userId?._id || profile.userId || profile.id || profile._id);
        const userId = String(user.id);
        const targetRole = profile.role || (user.role.toLowerCase() === 'advocate' ? 'client' : 'advocate');
        const profileName = profile.name || profile.display_name || (profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'User');

        try {
            let res;
            if (action === 'interest') {
                res = await interactionService.recordActivity(targetRole, targetId, 'interest', userId);
                setRelationship(targetId, 'INTEREST_SENT', 'sender');
                if (showToast) showToast(`Interest sent to ${profileName}`);
            } else if (action === 'superInterest') {
                res = await interactionService.recordActivity(targetRole, targetId, 'superInterest', userId);
                setRelationship(targetId, 'SUPER_INTEREST_SENT', 'sender');
                if (showToast) showToast(`Super Interest sent to ${profileName}!`);
            } else if (action === 'shortlist') {
                res = await interactionService.recordActivity(targetRole, targetId, 'shortlist', userId);
                const isShortlisted = res?.isShortlisted;
                setRelationship(targetId, isShortlisted ? 'SHORTLISTED' : 'NONE', 'sender');
                if (showToast) showToast(`${profileName} ${isShortlisted ? 'added to' : 'removed from'} shortlist`);
                queryClient.invalidateQueries({ queryKey: ['activities', userId] });
            } else if (action === 'withdraw') {
                await interactionService.withdrawInterest(userId, targetId, targetRole);
                setRelationship(targetId, 'NONE', 'sender');
                if (showToast) showToast('Interest Withdrawn');
                queryClient.invalidateQueries({ queryKey: ['activities', userId] });
            } else if (action === 'accept') {
                await interactionService.acceptInterest(userId, targetId, targetRole);
                setRelationship(targetId, 'ACCEPTED', 'receiver');
                if (showToast) showToast('Interest Accepted!');
                queryClient.invalidateQueries({ queryKey: ['activities', userId] });
                queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
            } else if (action === 'decline') {
                await interactionService.declineInterest(userId, targetId, targetRole);
                setRelationship(targetId, 'DECLINED', 'receiver');
                if (showToast) showToast('Interest Declined');
                queryClient.invalidateQueries({ queryKey: ['activities', userId] });
            } else if (action === 'block') {
                await interactionService.blockUser(userId, targetId, targetRole);
                setRelationship(targetId, 'BLOCKED', 'sender');
                if (showToast) showToast('User Blocked');
                hideProfile(targetId);
                queryClient.invalidateQueries({ queryKey: ['activities', userId] });
                queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
            } else if (action === 'unblock') {
                await interactionService.unblockUser(userId, targetId, targetRole);
                setRelationship(targetId, 'NONE', 'sender');
                if (showToast) showToast('User Unblocked');
                queryClient.invalidateQueries({ queryKey: ['activities', userId] });
            } else if (action === 'report') {
                await interactionService.recordActivity(targetRole, targetId, 'report', userId, data);
                if (showToast) showToast('User reported. Our team will investigate.');
            } else if (action === 'remove_connection') {
                await interactionService.removeConnection(userId, targetId, targetRole);
                setRelationship(targetId, 'NONE', 'sender');
                if (showToast) showToast('Connection Removed');
                queryClient.invalidateQueries({ queryKey: ['activities', userId] });
                queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
            } else if (action === 'unlock_contact') {
                res = await interactionService.recordActivity(targetRole, targetId, 'unlock_contact', userId);
                if (res.success) {
                    if (showToast) showToast('Contact Unlocked!');
                    return { success: true, ...res };
                }
            } else if (action === 'message_sent' && data) {
                await interactionService.sendMessage(userId, targetId, String(data));
                if (showToast) showToast(`Message sent to ${profileName}`);
                queryClient.invalidateQueries({ queryKey: ['activities', userId] });
                queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
            } else if (action === 'interaction_complete') {
                hideProfile(targetId);
                setRelationship(targetId, 'INTEREST_SENT', 'sender');
                if (showToast) showToast(`Profile removed from discovery`);
            }

            // Centralized Coin Refresh
            if (res && res.coins !== undefined) {
                refreshUser({
                    coins: res.coins,
                    coinsUsed: res.coinsUsed,
                    coinsReceived: res.coinsReceived
                });
            }

            return res;
        } catch (err: any) {
            console.error('[useInteractions] Action failed:', action, err);
            const errorData = err.response?.data;
            const msg = errorData?.message || 'Operation failed. Please try again.';

            if (showToast) showToast(msg);

            throw err;
        }
    };

    return { handleInteraction };
};
