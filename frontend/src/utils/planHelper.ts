import type { User } from '../types';

export const checkIsPremium = (user: User | null): boolean => {
    if (!user) return false;

    // Explicit server-driven flag
    if (user.isPremium) {
        // Double check trial expiry if it's a trial plan
        const plan = (user.plan || '').toLowerCase();
        const isTrial = plan.includes('trial') || plan.includes('temporary') || plan.includes('demo');

        if (isTrial && user.demoExpiry) {
            if (new Date() > new Date(user.demoExpiry)) {
                return false;
            }
        }
        return true;
    }

    // Fallback logic for local state
    const plan = (user.plan || '').toLowerCase();
    if (plan === 'free' || plan === '' || plan.includes('none')) return false;

    const isTrial = plan.includes('trial') || plan.includes('temporary') || plan.includes('demo');
    if (isTrial) {
        if (user.demoExpiry && new Date() > new Date(user.demoExpiry)) {
            return false;
        }
        return true;
    }

    // Any other plan (Pro, Lite, Silver, etc) is premium
    return true;
};
