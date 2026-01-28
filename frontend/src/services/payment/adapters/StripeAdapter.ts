import type { PaymentOrder, PaymentResult } from '../../../types/payment';
import type { GatewayAdapter } from '../GatewayAdapter';
import { ScriptLoader } from '../ScriptLoader';

export class StripeAdapter implements GatewayAdapter {
    id = 'stripe';
    name = 'Stripe';

    async initialize(): Promise<void> {
        await ScriptLoader.load('https://js.stripe.com/v3/', 'stripe-sdk');
    }

    async openCheckout(order: PaymentOrder, config: any): Promise<PaymentResult> {
        // REAL STRIPE INTEGRATION
        const stripe = (window as any).Stripe(config.credentials.public_key);

        const { error } = await stripe.redirectToCheckout({
            sessionId: order.sessionId || order.orderId,
        });

        if (error) {
            return {
                success: false,
                orderId: order.orderId,
                error: error.message
            };
        }

        // Redirect happens, so this point might not be reached successfully in the current page
        return {
            success: true,
            orderId: order.orderId,
            message: "Redirecting to Stripe..."
        };
    }
}
