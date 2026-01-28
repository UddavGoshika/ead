import type { PaymentOrder, PaymentResult } from '../../../types/payment';
import type { GatewayAdapter } from '../GatewayAdapter';
import { ScriptLoader } from '../ScriptLoader';

export class PaytmAdapter implements GatewayAdapter {
    id = 'paytm';
    name = 'Paytm';

    async initialize(config: any): Promise<void> {
        const mid = config.credentials.merchantId;
        const isSandbox = config.mode === 'sandbox';
        const domain = isSandbox ? 'securegw-stage.paytm.in' : 'securegw.paytm.in';
        const scriptUrl = `https://${domain}/merchantpgpui/checkoutjs/merchants/${mid}.js`;
        console.log(`[PAYTM] Loading SDK from: ${scriptUrl}`);
        await ScriptLoader.load(scriptUrl, 'paytm-sdk');
    }

    async openCheckout(order: PaymentOrder, config: any): Promise<PaymentResult> {
        return new Promise((resolve) => {
            const paytm = (window as any).Paytm;

            if (!paytm || !paytm.CheckoutJS) {
                return resolve({
                    success: false,
                    orderId: order.orderId,
                    error: "Paytm SDK not available"
                });
            }

            const checkoutOptions = {
                root: "",
                flow: "DEFAULT",
                data: {
                    orderId: order.orderId,
                    token: order.txnToken || order.metadata?.txnToken,
                    tokenType: "TXN_TOKEN",
                    amount: order.amount
                },
                merchant: {
                    mid: config.credentials.merchantId,
                    redirect: true
                },
                handler: {
                    notifyMerchant: (eventName: string, data: any) => {
                        console.log("[PAYTM] event:", eventName, data);
                        if (eventName === 'SESSION_EXPIRED') {
                            resolve({ success: false, orderId: order.orderId, error: "Session Expired" });
                        }
                    }
                }
            };

            const invokeCheckout = () => {
                console.log("[PAYTM] Initiating checkout with options:", JSON.stringify(checkoutOptions, null, 2));
                try {
                    if (paytm.CheckoutJS && typeof paytm.CheckoutJS.init === 'function') {
                        paytm.CheckoutJS.init(checkoutOptions)
                            .then(() => paytm.CheckoutJS.invoke())
                            .catch((err: any) => {
                                console.error("[PAYTM] init/invoke error:", err);
                                resolve({ success: false, orderId: order.orderId, error: err.message });
                            });
                    } else {
                        console.error("[PAYTM] CheckoutJS.init not found. Structure:", paytm.CheckoutJS);
                        resolve({ success: false, orderId: order.orderId, error: "Paytm.CheckoutJS.init is not a function" });
                    }
                } catch (e: any) {
                    console.error("[PAYTM] invokeCheckout exception:", e);
                    resolve({ success: false, orderId: order.orderId, error: e.message });
                }
            };

            if (paytm.CheckoutJS.onLoad && typeof paytm.CheckoutJS.onLoad === 'function') {
                paytm.CheckoutJS.onLoad(() => {
                    invokeCheckout();
                });
            } else {
                // Short delay to ensure script internal execution
                setTimeout(invokeCheckout, 1000);
            }
        });
    }
}
