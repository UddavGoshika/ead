import type { PaymentOrder, PaymentResult } from '../../types/payment';

export interface GatewayAdapter {
    id: string;
    name: string;

    /**
     * Load necessary scripts and initialize the gateway
     */
    initialize(config: any): Promise<void>;

    /**
     * Open the gateway's checkout UI
     */
    openCheckout(order: PaymentOrder, config: any): Promise<PaymentResult>;

    /**
     * Verify payment status with backend if needed (optional as PaymentManager handles verify API)
     */
    verify?(result: any): Promise<boolean>;
}
