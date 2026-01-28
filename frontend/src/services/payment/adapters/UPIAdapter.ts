import type { PaymentOrder, PaymentResult } from '../../../types/payment';
import type { GatewayAdapter } from '../GatewayAdapter';

export class UPIAdapter implements GatewayAdapter {
    id = 'upi';
    name = 'UPI QR Code';

    async initialize(): Promise<void> {
        // No script loading needed for UPI QR
        return Promise.resolve();
    }

    async openCheckout(order: PaymentOrder, config: any): Promise<PaymentResult> {
        // In a real UPI flow, we generate a UPI URL:
        // upi://pay?pa=YOUR_UPI_ID&pn=YOUR_NAME&am=AMOUNT&tr=ORDER_ID&cu=INR
        const upiId = order.upiId || config.credentials?.upiId || 'e-advocate@okaxis';
        const payeeName = order.payeeName || config.credentials?.payeeName || 'E-Advocate Services';
        const amount = (order.amount).toFixed(2);

        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tr=${order.orderId}&cu=${order.currency || 'INR'}`;

        // For UPI/QR, we don't "open" a checkout, we return the URL for the UI to render as QR
        return Promise.resolve({
            success: true,
            orderId: order.orderId,
            paymentId: 'upi_pending_' + order.orderId,
            message: "Scan the QR code to pay via any UPI app",
            metadata: {
                ...order.metadata,
                upiUrl: upiUrl
            }
        });
    }
}
