import type { PaymentOrder, PaymentResult } from '../../../types/payment';
import type { GatewayAdapter } from '../GatewayAdapter';
import { ScriptLoader } from '../ScriptLoader';

export class RazorpayAdapter implements GatewayAdapter {
    id = 'razorpay';
    name = 'Razorpay';

    async initialize(): Promise<void> {
        await ScriptLoader.load('https://checkout.razorpay.com/v1/checkout.js', 'razorpay-sdk');
    }

    async openCheckout(order: PaymentOrder, config: any): Promise<PaymentResult> {
        // Real Razorpay SDK Integration
        return new Promise((resolve) => {
            const options = {
                key: config.credentials.key,
                amount: order.amount,
                currency: order.currency,
                name: "E-Advocate Services",
                description: order.metadata?.description || "Subscription Payment",
                order_id: order.razorpayOrderId || order.orderId,
                handler: (response: any) => {
                    resolve({
                        success: true,
                        orderId: order.orderId,
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        message: "Payment successful"
                    });
                },
                prefill: {
                    name: order.metadata?.userName,
                    email: order.metadata?.userEmail,
                    contact: order.metadata?.userPhone
                },
                theme: {
                    color: "#facc15"
                },
                modal: {
                    ondismiss: () => {
                        resolve({
                            success: false,
                            orderId: order.orderId,
                            error: "Payment cancelled by user"
                        });
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (response: any) => {
                resolve({
                    success: false,
                    orderId: order.orderId,
                    error: response.error.description,
                    message: response.error.reason
                });
            });
            rzp.open();
        });
    }
}
