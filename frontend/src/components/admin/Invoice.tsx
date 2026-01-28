import React from 'react';
import styles from './Invoice.module.css';

interface InvoiceProps {
    payment: {
        id: number;
        memberName: string;
        memberId: string;
        email: string;
        mobile: string;
        packageName: string;
        subPackage: string;
        paymentMethod: string;
        amount: string;
        status: string;
        transactionId: string;
        transactionDate: string;
    };
}

const Invoice: React.FC<InvoiceProps> = ({ payment }) => {
    // Math to match the Amazon heavy-tax look
    const rawAmount = parseFloat(payment.amount.replace(/[^0-9.]/g, ''));
    const igstRate = 0.18;
    const netAmount = (rawAmount / (1 + igstRate)).toFixed(2);
    const taxAmount = (rawAmount - parseFloat(netAmount)).toFixed(2);
    const price = Number(netAmount); // base price
    const cgstRate = 0.09;
    const sgstRate = 0.09;

    const cgstAmount = (price * cgstRate).toFixed(2);
    const sgstAmount = (price * sgstRate).toFixed(2);

    const totalTax = (Number(cgstAmount) + Number(sgstAmount)).toFixed(2);
    const totalAmount = (price + Number(totalTax)).toFixed(2);

    return (
        <div className={styles.invoiceWrapper} id="printable-invoice">
            <div className={styles.topLogoRow}>
                <div className={styles.amazonLogo}>
                    <span className={styles.brand}>e-Advocate Services </span>
                    {/* <span className={styles.dotIn}>.in</span> */}
                </div>
                <div className={styles.invoiceTitleContainer}>
                    <p className={styles.mainTitle}>Tax Invoice/Bill of Supply/Cash Memo</p>
                    <p className={styles.subTitle}>(Original for Recipient)</p>
                </div>
            </div>

            <div className={styles.addressesGrid}>
                <div className={styles.addressBlock}>
                    <h4 className={styles.blockHeading}>Tatito Projects :</h4>
                    <p className={styles.sellerName}>e-Advocate Services</p>
                    <p>Tirupati, Andhra Pradesh

                        517501, India</p>
                    <p>eadvocate@gmail.com</p>
                    <p>517501</p>
                    <p>IN</p>
                    <div className={styles.regInfo}>
                        {/* <p><strong>PAN No:</strong> LSKPK6058D</p> */}
                        <p><strong>GST Registration No:</strong> 07AJIPA1572E4ZK</p>
                    </div>
                </div>

                <div className={styles.addressBlock}>
                    <h4 className={styles.blockHeading}>Billing Address :</h4>
                    <p className={styles.buyerName}>{payment.memberName}</p>
                    <p>Member ID: {payment.memberId}</p>
                    <p>{payment.mobile}</p>
                    <p>{payment.email}</p>
                    <p>IN</p>
                    {/* <p><strong>State/UT Code:</strong> 29</p> */}
                </div>
            </div>

            <div className={styles.metaInfoGrid}>
                <div className={styles.metaLeft}>
                    <p><strong>Id Number:</strong> {payment.transactionId.replace('TXN-', '408-')}</p>
                    <p><strong>Order Date:</strong> {payment.transactionDate.split(' ')[0]}</p>
                </div>
                <div className={styles.metaRight}>
                    <p><strong>Invoice Number:</strong> IN-{8200 + payment.id}</p>
                    {/* <p><strong>Invoice Details:</strong> DL-{payment.transactionId.slice(-10)}</p> */}
                    <p><strong>Invoice Date:</strong> {payment.transactionDate.split(' ')[0]}</p>
                </div>
            </div>

            <table className={styles.amazonTable}>
                <thead>
                    <tr>
                        <th style={{ width: "4%" }}>Sl. No</th>
                        <th style={{ width: "26%" }}>Description</th>
                        <th style={{ width: "10%" }}>Package</th>
                        <th style={{ width: "10%" }}>Sub Package</th>
                        <th style={{ width: "8%" }}>Unit Price</th>
                        <th style={{ width: "4%" }}>Qty</th>
                        <th style={{ width: "8%" }}>Net Amount</th>
                        <th style={{ width: "6%" }}>CGST (9%)</th>
                        <th style={{ width: "6%" }}>SGST (9%)</th>
                        <th style={{ width: "8%" }}>Total Amount</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td align="center">1</td>

                        <td>
                            <p className={styles.itemMajor}>
                                {payment.memberName} has purchased a {payment.packageName} membership plan for one Year.
                            </p>
                            <p className={styles.itemMinor}>
                                Subscription for Professional e-Advocate Services | HSN: 4901
                            </p>
                        </td>


                        <td align="center" style={{ color: "#080808" }}>
                            {payment.packageName} {/* Silver / Gold / Platinum */}
                        </td>

                        <td align="center" style={{ color: "#080808" }}>
                            {payment.subPackage} {/* Pro / Lite / UltraPro */}
                        </td>

                        <td align="right" style={{ color: "#080808" }}>₹{price.toFixed(2)}</td>

                        <td align="center" style={{ color: "#080808" }}>1</td>

                        <td align="right" style={{ color: "#080808" }}>₹{price.toFixed(2)}</td>

                        <td align="right" style={{ color: "#080808" }}>₹{cgstAmount}</td>

                        <td align="right" style={{ color: "#080808" }}>₹{sgstAmount}</td>

                        <td align="right" style={{ color: "#080808" }}>₹{totalAmount}</td>
                    </tr>

                    <tr className={styles.emptyRow}>
                        <td colSpan={10}>&nbsp;</td>
                    </tr>
                </tbody>

                <tfoot>
                    <tr className={styles.totalRow}>
                        <td colSpan={7} className={styles.totalText}>
                            TOTAL:
                        </td>
                        <td align="right">₹{cgstAmount}</td>
                        <td align="right">₹{sgstAmount}</td>
                        <td align="right">₹{totalAmount}</td>
                    </tr>
                </tfoot>
            </table>


            <div className={styles.amountWordsRow}>
                <p><strong>Amount in Words:</strong></p>
                <p className={styles.words}>Three Hundred Thirty only</p>
            </div>

            <div className={styles.signatureRow}>
                <div className={styles.signLeft}>
                    <p>Whether tax is payable under reverse charge - No</p>
                </div>
                <div className={styles.signRight}>
                    <p className={styles.sellerStamp}>e-Advocate Services:</p>
                    <div className={styles.signatureArea}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch%27s_Signature.png" alt="Sign" className={styles.signImg} />
                    </div>
                    <p className={styles.authorized}>Authorized Signatory</p>
                </div>
            </div>

            <div className={styles.bottomDisclaimer}>
                <p>*ASSPL-eAdvocate Services., ARIPL-eAdvocate Services Pvt. Ltd. (only where eAdvocate Services Pvt. Ltd. fulfillment center is co-located)</p>
                <p>Customers desirous of availing input GST credit are requested to create a Business account and purchase on eAdvocate Services Pvt. Ltd. from Business eligible offers</p>
                <p style={{ textAlign: 'center', marginTop: '10px' }}>Please note that this invoice is not a demand for payment</p>
                <p className={styles.pageNumber}>Page 1 of 1</p>
            </div>
        </div>
    );
};

export default Invoice;
