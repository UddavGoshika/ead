
import type { GatewayAdapter } from '../GatewayAdapter';
import type { PaymentGatewayConfig, PaymentOrder, PaymentResult } from '../../../types/payment';

export class CashfreeAdapter implements GatewayAdapter {
    id = "cashfree";
    name = "Cashfree Payments";

    async initialize(config: PaymentGatewayConfig): Promise<void> {
        console.log("Initializing Cashfree Adapter", config);
        // Load Cashfree SDK v3
        return new Promise((resolve) => {
            if (document.getElementById('cashfree-sdk')) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.id = 'cashfree-sdk';
            script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            script.onload = () => resolve();
            document.body.appendChild(script);
        });
    }

    async openCheckout(order: PaymentOrder, config: PaymentGatewayConfig): Promise<PaymentResult> {
        console.log("[Cashfree Adapter] Opening Real Checkout for order:", order);

        // Get session ID (either from root or metadata)
        const paymentSessionId = order.paymentSessionId || (order.metadata && order.metadata.paymentSessionId);

        if (order.error) {
            return Promise.resolve({
                success: false,
                orderId: order.orderId,
                error: order.error
            });
        }

        if (!paymentSessionId) {
            return Promise.resolve({
                success: false,
                orderId: order.orderId,
                error: "Payment Session ID missing. Please check Cashfree Credentials in Admin Panel."
            });
        }

        try {
            // @ts-ignore - window.Cashfree is added by the script
            const cashfree = await new window.Cashfree({
                mode: config.mode === 'live' ? "production" : "sandbox"
            });

            // Start checkout
            // Start checkout with strict success requirement
            cashfree.checkout({
                paymentSessionId: paymentSessionId,
                returnUrl: window.location.origin + '/dashboard?status={payment_status}&order_id={order_id}', // Explicit status tracking
                redirectTarget: "_self"
            });

            // Return success: true immediately because Cashfree handles redirect/popup.
            // When user returns, the 'verify' flow on dashboard init will handle status check.
            return Promise.resolve({
                success: true,
                orderId: order.orderId,
                paymentId: "PENDING_REDIRECT", // Placeholder
                metadata: {
                    paymentSessionId: paymentSessionId
                }
            });

        } catch (e: any) {
            console.error("Cashfree SDK Error:", e);
            return Promise.resolve({
                success: false,
                orderId: order.orderId,
                error: "Failed to launch Cashfree Checkout: " + e.message
            });
        }
    }
}
