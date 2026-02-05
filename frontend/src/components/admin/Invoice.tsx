import React from 'react';
import styles from './Invoice.module.css';
import { useSettings } from '../../context/SettingsContext';

interface InvoiceProps {
    payment: {
        id: number | string;
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
    const { settings } = useSettings();
    // Updated Price Logic: Treat payment.amount as the Base Plan Price (Exclusive)
    const basePrice = parseFloat(payment.amount.replace(/[^0-9.]/g, '')) || 0;
    const cgstAmount = basePrice * 0.09;
    const sgstAmount = basePrice * 0.09;
    const totalAmount = basePrice + cgstAmount + sgstAmount;

    // Improved Date parsing
    const parseSafeDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;

        // Custom parser for DD-MM-YYYY or DD/MM/YYYY
        const parts = dateStr.split(/[\/\-\s]/);
        if (parts.length >= 3) {
            const d1 = parseInt(parts[0], 10);
            const m1 = parseInt(parts[1], 10) - 1;
            const y1 = parseInt(parts[2], 10);
            const nd = new Date(y1, m1, d1);
            if (!isNaN(nd.getTime())) return nd;
        }
        return new Date();
    };

    const txnDate = parseSafeDate(payment.transactionDate);
    const validUntil = new Date(txnDate);
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    validUntil.setDate(validUntil.getDate() - 1); // Subtract one day for exactly 1 year inclusive

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    };

    const invoiceNo = `TAP-EAD-${String(payment.id).slice(-3).padStart(3, '0')}`;

    // Logic to ensure correct package naming
    const formatPackageNames = (pkg: string, sub: string) => {
        const pInput = (pkg || "").toLowerCase();
        const sInput = (sub || "").toLowerCase();

        let finalPkg = "";
        let finalSub = sInput.charAt(0).toUpperCase() + sInput.slice(1).replace(/_/g, ' ');

        if (pInput.includes("lite")) finalPkg = "Pro Lite";
        else if (pInput.includes("ultra")) finalPkg = "Ultra Pro";
        else if (pInput.includes("pro")) finalPkg = "Pro";
        else if (pInput === "standard") finalPkg = "";
        else finalPkg = pkg;

        if (sInput === "standard") finalSub = "-";

        return { finalPkg, finalSub };
    };

    const { finalPkg, finalSub } = formatPackageNames(payment.packageName, payment.subPackage);

    // Number to Words converter (Indian System)
    const numberToWords = (num: number) => {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const inWords = (n: number): string => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10] : '');
            if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
            if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
            if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
            return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
        };

        const integerPart = Math.floor(num);
        const decimalPart = Math.round((num - integerPart) * 100);

        let res = 'Rupees ' + inWords(integerPart);
        if (decimalPart > 0) {
            res += 'and ' + inWords(decimalPart) + 'Paise ';
        }
        return res + 'Only';
    };

    const amountInWords = numberToWords(totalAmount);

    return (
        <div className={styles.invoiceOuterContainer}>
            {/* Watermark Image Container */}
            <div className={styles.watermarkImageContainer}>
                <img src="/assets/Tatito New.png" alt="Watermark" className={styles.watermarkImg} />
            </div>

            {/* Watermark Text */}
            <div className={styles.watermarkText}>
                e-Advocate Services
            </div>

            <div className={styles.invoiceWrapper} id="printable-invoice">
                <div className={styles.topLogoRow}>
                    <div className={styles.brandLogo}>
                        <img
                            src={settings?.invoice_header_url || "/assets/left-logo.jpeg"}
                            alt="e-Advocate Logo"
                            className={styles.invoiceLogoImg}
                        />
                    </div>
                    <div className={styles.invoiceTitleContainer}>
                        <p className={styles.mainTitle}>Tax Invoice/Bill of Supply/Cash Memo</p>
                        <p className={styles.subTitle}>(Original for Recipient)</p>
                    </div>
                </div>

                <div className={styles.addressesGrid}>
                    <div className={styles.addressBlock}>
                        <h4 className={styles.blockHeading} style={{ textDecoration: "underline", fontStyle: "Cursive", }}>M/s  TATITO  PROJECTS</h4>
                        <p className={styles.sellerName} style={{ fontSize: "15px", textDecoration: "underline" }}>e-Advocate Services</p>
                        <p><strong style={{ marginRight: "10px" }}>Add</strong>: 19-3-2/G11, Kanika Siddaiah Colony,</p>
                        <p style={{ marginLeft: "42px" }}>Tirupati, Andhra Pradesh - 517501, India</p>
                        <p><strong>Ph No</strong>: +91 7093 704 706</p>
                        <p><strong>Mail 1</strong>: support@eadvocateservices.com</p>
                        <p><strong>Mail 2</strong>: info@eadvocateservices.com</p>
                        <div className={styles.regInfo} style={{ marginTop: '10px' }}>
                            <p><strong>GST Reg No</strong>: <strong style={{ textDecoration: "underline" }}>37BRUPV5031J1Z1</strong></p>
                        </div>
                    </div>

                    <div className={styles.addressBlock}>
                        <h4 className={styles.blockHeading} style={{ textDecoration: "underline" }}>Subscription Plan Receipt :</h4>
                        <p className={styles.buyerName}>Name: {payment.memberName}</p>
                        <p style={{ fontWeight: "bold" }}>Member ID: {payment.memberId}</p>
                        <p>Mobile: {payment.mobile}</p>
                        <p>Email: {payment.email}</p>
                    </div>
                </div>

                <div className={styles.metaInfoGrid}>
                    <div className={styles.metaLeft}>
                        <p><strong>Invoice Number:</strong> <span style={{ textDecoration: "underline", fontWeight: "bold" }}>{invoiceNo}</span></p>
                        <p><strong>Invoice Date:</strong> {formatDate(txnDate)}</p>
                        {/* <p><strong>Expiry Date:</strong> <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{formatDate(validUntil)}</span></p> */}
                    </div>
                    <div className={styles.metaRight}>
                        <p><strong style={{ textDecoration: "underline" }}>TXN Date:</strong> {formatDate(txnDate)}</p>
                        <p><strong style={{ textDecoration: "underline" }}>TXN ID:</strong> <span style={{ textDecoration: "underline", fontWeight: "bold" }}>{payment.transactionId}</span></p>
                    </div>
                </div>

                <table className={styles.amazonTable}>
                    <thead>
                        <tr>
                            <th style={{ width: "8%" }}>S.NO</th>
                            <th style={{ width: "37%" }}>Description</th>
                            <th style={{ width: "15%" }}>Package</th>
                            <th style={{ width: "15%" }}>Sub Package</th>
                            <th style={{ width: "25%" }}>Cost / Amount / Price</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* Row 1: Main Subscription */}
                        <tr>
                            <td align="center">1</td>
                            <td>
                                <p className={styles.itemMajor}>
                                    Subscription - {finalPkg} {finalSub}
                                </p>
                                <p className={styles.itemMinor} style={{ fontSize: '10px' }}>
                                    Member: {payment.memberName} ({payment.memberId})<br />
                                    Period: {formatDate(txnDate)} to {formatDate(validUntil)}
                                </p>
                            </td>
                            <td align="center">
                                <span className={styles.packageLabel}>{finalPkg}</span>
                            </td>
                            <td align="center">
                                <span className={styles.packageLabel}>{finalSub}</span>
                            </td>
                            <td align="right">₹{basePrice.toFixed(2)}</td>
                        </tr>

                        {/* Row 2: CGST */}
                        <tr>
                            <td align="center">2</td>
                            <td>CGST - 9%</td>
                            <td></td>
                            <td></td>
                            <td align="right">₹{cgstAmount.toFixed(2)}</td>
                        </tr>

                        {/* Row 3: SGST */}
                        <tr>
                            <td align="center">3</td>
                            <td>SGST - 9%</td>
                            <td></td>
                            <td></td>
                            <td align="right">₹{sgstAmount.toFixed(2)}</td>
                        </tr>
                    </tbody>

                    <tfoot>
                        <tr className={styles.totalRow}>
                            <td colSpan={4} className={styles.totalText} style={{ textAlign: 'right', paddingRight: '20px' }}>
                                <strong>Grand Total with GST</strong><br />
                                <small style={{ fontWeight: 'normal', fontSize: '10px' }}>
                                    (CGST 9% + SGST 9% = 18% GST)
                                </small>
                            </td>
                            <td align="right">
                                <strong>₹{totalAmount.toFixed(2)}</strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div className={styles.amountWordsRow}>
                    <p><strong>Amount in Words:</strong></p>
                    <p className={styles.words} style={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '12px' }}>{amountInWords}</p>
                </div>

                <div className={styles.signatureRow}>
                    <div className={styles.signLeft}>
                        <p>Whether tax is payable under reverse charge - No</p>
                        <p style={{ marginTop: '20px', fontSize: '10px' }}>Powered by Tatito Projects</p>
                    </div>
                    <div className={styles.signRight}>
                        <p className={styles.sellerStamp}>e-Advocate Services:</p>
                        <div className={styles.signatureArea}>
                            <img src="/assets/sign.jpg" alt="Authorized Signatory" className={styles.signImg} />
                        </div>
                        <p className={styles.authorized}>Authorized Signatory</p>
                    </div>
                </div>

                <div className={styles.bottomDisclaimer}>
                    <p>*TATITO PROJECTS - e-Advocate Services.</p>
                    <p>Please note that this invoice is a computer generated document and does not require a physical signature.</p>
                    <p className={styles.pageNumber}>Page 1 of 1</p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
