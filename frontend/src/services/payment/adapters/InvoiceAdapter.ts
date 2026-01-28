import type { PaymentOrder, PaymentResult } from '../../../types/payment';
import type { GatewayAdapter } from '../GatewayAdapter';

export class InvoiceAdapter implements GatewayAdapter {
    id = 'invoice';
    name = 'Offline Invoice';

    async initialize(): Promise<void> {
        // No script loading needed for offline invoice
        return Promise.resolve();
    }

    async openCheckout(order: PaymentOrder): Promise<PaymentResult> {
        // Offline invoice usually just confirms that the user wants to pay via invoice
        // and the backend will generate an unpaid transaction.
        return Promise.resolve({
            success: true,
            orderId: order.orderId,
            message: "Invoice request submitted. Please check your email for payment instructions."
        });
    }
}
