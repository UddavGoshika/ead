import axios from 'axios';
import type {
    PaymentGateway,
    PaymentGatewayConfig,
    PaymentOrder,
    PaymentResult,
    CreateOrderRequest,
    VerifyPaymentRequest
} from '../../types/payment';
import type { GatewayAdapter } from './GatewayAdapter';
import { RazorpayAdapter } from './adapters/RazorpayAdapter';
import { PaytmAdapter } from './adapters/PaytmAdapter';
import { StripeAdapter } from './adapters/StripeAdapter';
import { InvoiceAdapter } from './adapters/InvoiceAdapter';
import { UPIAdapter } from './adapters/UPIAdapter';
import { CashfreeAdapter } from './adapters/CashfreeAdapter';

export class PaymentManager {
    private static instance: PaymentManager;
    private adapters: Map<string, GatewayAdapter> = new Map();
    private configs: PaymentGatewayConfig[] = [];
    private API_URL = '/api'; // Relative path to use Vite proxy

    private constructor() {
        this.registerAdapter(new RazorpayAdapter());
        this.registerAdapter(new PaytmAdapter());
        this.registerAdapter(new StripeAdapter());
        this.registerAdapter(new InvoiceAdapter());
        this.registerAdapter(new UPIAdapter());
        this.registerAdapter(new CashfreeAdapter());
    }

    static getInstance(): PaymentManager {
        if (!PaymentManager.instance) {
            PaymentManager.instance = new PaymentManager();
        }
        return PaymentManager.instance;
    }

    private registerAdapter(adapter: GatewayAdapter) {
        this.adapters.set(adapter.id, adapter);
    }

    async fetchConfigs(): Promise<PaymentGatewayConfig[]> {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${this.API_URL}/payments/config`, {
                headers: { Authorization: token || '' }
            });
            if (response.data.success && response.data.configs && response.data.configs.length > 0) {
                this.configs = response.data.configs;
            } else {
                this.setFallbackConfigs();
            }
            return this.configs;
        } catch (error) {
            console.error("Failed to fetch payment configs, using fallbacks", error);
            this.setFallbackConfigs();
            return this.configs;
        }
    }

    private setFallbackConfigs() {
        this.configs = [
            { gateway: 'razorpay', isActive: true, mode: 'sandbox', credentials: {} },
            { gateway: 'cashfree', isActive: true, mode: 'sandbox', credentials: {} },
            { gateway: 'paytm', isActive: false, mode: 'sandbox', credentials: {} },
            { gateway: 'stripe', isActive: false, mode: 'sandbox', credentials: {} },
            { gateway: 'invoice', isActive: false, mode: 'sandbox', credentials: {} },
            { gateway: 'upi', isActive: false, mode: 'sandbox', credentials: {} }
        ];
    }

    async getEnabledGateways(): Promise<PaymentGatewayConfig[]> {
        if (this.configs.length === 0) {
            await this.fetchConfigs();
        }
        return this.configs.filter(c => c.isActive);
    }

    async processPayment(
        gateway: PaymentGateway,
        packageId: string,
        amount: number,
        currency: string = 'INR',
        metadata: any = {}
    ): Promise<PaymentResult> {
        const adapter = this.adapters.get(gateway);
        if (!adapter) {
            return { success: false, orderId: '', error: `Gateway ${gateway} not supported` };
        }

        const config = this.configs.find(c => c.gateway === gateway);
        if (!config || !config.isActive) {
            return { success: false, orderId: '', error: `Gateway ${gateway} is not active` };
        }

        try {
            // 1. Initialize Adapter (loads scripts)
            await adapter.initialize(config);

            // 2. Create Order via Backend
            // 2. Create Order via Backend
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, orderId: '', error: "Authentication missing. Please Logout and Login again." };
            }

            const orderReq: CreateOrderRequest = { packageId, gateway, amount, currency };
            const orderRes = await axios.post(`${this.API_URL}/payments/create-order`, {
                ...orderReq,
                metadata
            }, {
                headers: { Authorization: token || '' }
            });

            if (!orderRes.data.success) {
                return { success: false, orderId: '', error: orderRes.data.message };
            }

            const order: PaymentOrder = orderRes.data.order;

            // 3. Open Gateway Checkout
            const result = await adapter.openCheckout(order, config);

            if (!result.success) {
                return result;
            }

            // 4. Verify Payment via Backend
            if (gateway !== 'invoice') {
                const verifyReq: VerifyPaymentRequest = {
                    orderId: result.orderId,
                    paymentId: result.paymentId!,
                    signature: result.signature,
                    gateway
                };
                const token = localStorage.getItem('token');
                const verifyRes = await axios.post(`${this.API_URL}/payments/verify`, verifyReq, {
                    headers: { Authorization: token || '' }
                });

                if (verifyRes.data.success) {
                    return { ...result, success: true, message: "Payment verified successfully" };
                } else {
                    return { ...result, success: false, error: verifyRes.data.message || "Verification failed" };
                }
            }

            return result;
        } catch (error: any) {
            console.error(`Payment processing failed for ${gateway}`, error);
            return {
                success: false,
                orderId: '',
                error: error.response?.data?.message || error.message || "Payment process interrupted"
            };
        }
    }
}
