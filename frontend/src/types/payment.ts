export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';
export type PaymentGateway = 'razorpay' | 'paytm' | 'stripe' | 'invoice' | 'upi' | 'cashfree';
export type PaymentMode = 'sandbox' | 'live';

export interface PaymentGatewayConfig {
    gateway: PaymentGateway;
    isActive: boolean;
    mode: PaymentMode;
    credentials: {
        key?: string;
        secret?: string;
        merchantId?: string;
        merchantKey?: string;
        website?: string;
        industryType?: string;
        channel?: string;
        public_key?: string; // Stripe
        secret_key?: string; // Stripe (backend)
        upiId?: string; // UPI
        payeeName?: string; // UPI
        appId?: string; // Cashfree
        secretKey?: string; // Cashfree
    };
}

export interface PaymentOrder {
    orderId: string;
    amount: number;
    currency: string;
    gateway: PaymentGateway;
    receipt?: string;
    metadata?: Record<string, any>;
    // Integration Specific (Real-world tokens/IDs)
    razorpayOrderId?: string;
    txnToken?: string;
    sessionId?: string;
    upiId?: string;
    payeeName?: string;
    paymentSessionId?: string; // Cashfree
    error?: string; // Propagate creation errors
}

export interface PaymentResult {
    success: boolean;
    orderId: string;
    transactionId?: string;
    paymentId?: string;
    signature?: string;
    error?: string;
    message?: string;
    metadata?: Record<string, any>;
}

export interface PaymentTransaction {
    id: string;
    userId: string;
    orderId: string;
    amount: number;
    currency: string;
    gateway: PaymentGateway;
    status: PaymentStatus;
    transactionId?: string;
    paymentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionPayment extends PaymentTransaction {
    packageId: string;
    packageName: string;
    tierName: string;
}

// API Contracts
export interface CreateOrderRequest {
    packageId: string;
    gateway: PaymentGateway;
    amount: number;
    currency: string;
}

export interface VerifyPaymentRequest {
    orderId: string;
    paymentId: string;
    signature?: string;
    gateway: PaymentGateway;
}

export interface OfflineInvoiceRequest {
    packageId: string;
    amount: number;
    notes?: string;
}
