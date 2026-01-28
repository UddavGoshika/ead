import React, { useState, useMemo } from "react";
import styles from "./PackagePayments.module.css";
import { Search, Eye, FileText, Download, X, Filter, UserCircle, Package } from "lucide-react";
import Invoice from "../../components/admin/Invoice";

/* ================= TYPES ================= */
type PaymentStatus = "Paid" | "Unpaid" | "Pending";

interface Payment {
    id: number;
    memberName: string;
    memberId: string;
    email: string;
    mobile: string;
    role: "Advocate" | "Client";
    packageName: string;
    subPackage: string;
    paymentMethod: string;
    amount: string; // Gross Amount
    discount: string;
    tax: string;
    netAmount: string;
    status: PaymentStatus;
    transactionId: string;
    transactionDate: string;
}

/* ================= MOCK DATA ================= */
const MOCK_PAYMENTS: Payment[] = [
    {
        id: 1,
        memberName: "Rohan Mehta",
        memberId: "ADV-001234",
        email: "rohan.mehta@example.com",
        mobile: "+91 98765 43210",
        role: "Advocate",
        packageName: "Ultra Pro",
        subPackage: "Platinum Premium",
        paymentMethod: "Bank Transfer",
        amount: "₹12,499.00",
        discount: "₹0.00",
        tax: "₹2,249.82",
        netAmount: "₹10,249.18",
        status: "Paid",
        transactionId: "TXN-84729104",
        transactionDate: "2024-01-20 14:30:22",
    },
    {
        id: 2,
        memberName: "Arhaan Malik",
        memberId: "CLI-005678",
        email: "arhaan.malik@lawyers.in",
        mobile: "+91 87654 32109",
        role: "Client",
        packageName: "Pro Lite",
        subPackage: "Gold Monthly",
        paymentMethod: "Online UPI",
        amount: "₹1,999.00",
        discount: "₹200.00",
        tax: "₹323.82",
        netAmount: "₹1,475.18",
        status: "Pending",
        transactionId: "TXN-95028471",
        transactionDate: "2024-01-22 10:15:45",
    },
    {
        id: 3,
        memberName: "Sarah Jenkins",
        memberId: "ADV-009988",
        email: "sarah.j@legalfirm.com",
        mobile: "+91 76543 21098",
        role: "Advocate",
        packageName: "Pro",
        subPackage: "Silver Yearly",
        paymentMethod: "Wallet",
        amount: "₹999.00",
        discount: "₹0.00",
        tax: "₹179.82",
        netAmount: "₹819.18",
        status: "Paid",
        transactionId: "TXN-20485712",
        transactionDate: "2024-01-23 18:45:10",
    },
    {
        id: 4,
        memberName: "Dustin Henderson",
        memberId: "CLI-002233",
        email: "dustin.h@gmail.com",
        mobile: "+91 65432 10987",
        role: "Client",
        packageName: "Pro Lite",
        subPackage: "Silver Trial",
        paymentMethod: "Bank Transfer",
        amount: "₹4,999.00",
        discount: "₹500.00",
        tax: "₹809.82",
        netAmount: "₹3,689.18",
        status: "Unpaid",
        transactionId: "TXN-39485710",
        transactionDate: "2024-01-24 09:20:15",
    }
];

interface Props {
    title?: string;
}

const PackagePaymentList: React.FC<Props> = ({ title = "Package Payment List" }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterLevel, setFilterLevel] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedRole, setSelectedRole] = useState("All");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [modalOpen, setModalOpen] = useState<'view' | 'invoice' | null>(null);

    /* FILTER LOGIC */
    const filteredPayments = useMemo(() => {
        return MOCK_PAYMENTS.filter(p => {
            const matchesSearch =
                p.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = filterCategory === "All" || p.packageName === filterCategory;
            const matchesLevel = filterLevel === "All" || p.subPackage.includes(filterLevel);
            const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;
            const matchesRole = selectedRole === "All" || p.role === selectedRole;

            return matchesSearch && matchesCategory && matchesLevel && matchesStatus && matchesRole;
        });
    }, [searchTerm, filterCategory, filterLevel, selectedStatus, selectedRole]);

    const openModal = (type: 'view' | 'invoice', payment: Payment) => {
        setSelectedPayment(payment);
        setModalOpen(type);
    };

    const closeModal = () => {
        setModalOpen(null);
        setSelectedPayment(null);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={styles.page}>
            <h2 className={styles.pageTitle}>{title}</h2>

            <div className={styles.card}>
                <div className={styles.filterSection}>
                    <div className={styles.searchRow}>
                        <div className={styles.searchBarWrapper}>
                            <Search size={20} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Find by Name, Member ID, or Transaction ID..."
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={styles.dateRangePicker}>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                            <span className={styles.dateSep}>to</span>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.pillsGrid}>
                        <div className={styles.pillGroup}>
                            <label><Filter size={14} /> Status</label>
                            <div className={styles.pillList}>
                                {["All", "Paid", "Pending", "Unpaid"].map(status => (
                                    <button
                                        key={status}
                                        className={`${styles.pill} ${selectedStatus === status ? styles.pillActive : ""}`}
                                        onClick={() => setSelectedStatus(status)}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.pillGroup}>
                            <label><UserCircle size={14} /> Member Role</label>
                            <div className={styles.pillList}>
                                {["All", "Advocate", "Client"].map(role => (
                                    <button
                                        key={role}
                                        className={`${styles.pill} ${selectedRole === role ? styles.pillActive : ""}`}
                                        onClick={() => setSelectedRole(role)}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {title !== "Free Members" && (
                            <div className={styles.packageBlockFilters}>
                                {[
                                    { name: 'Free', sub: 'Basic Access', levels: [] },
                                    { name: 'Pro Lite', sub: 'Standard Premium', levels: ['Silver', 'Gold', 'Platinum'] },
                                    { name: 'Pro', sub: 'Advanced Features', levels: ['Silver', 'Gold', 'Platinum'] },
                                    { name: 'Ultra Pro', sub: 'Executive Support', levels: ['Silver', 'Gold', 'Platinum'] }
                                ].map(pkg => (
                                    <div key={pkg.name} className={`${styles.packageBlock} ${filterCategory === pkg.name ? styles.active : ''}`}>
                                        <div
                                            className={styles.blockTitle}
                                            onClick={() => {
                                                setFilterCategory(pkg.name);
                                                setFilterLevel('All');
                                            }}
                                        >
                                            {pkg.name}
                                            <div className={styles.blockSub}>{pkg.sub}</div>
                                        </div>
                                        {pkg.levels.length > 0 && (
                                            <div className={styles.levelGrid}>
                                                {pkg.levels.map(lvl => (
                                                    <button
                                                        key={lvl}
                                                        className={`${styles.levelMiniBtn} ${filterCategory === pkg.name && filterLevel === lvl ? styles.active : ''}`}
                                                        onClick={() => {
                                                            setFilterCategory(pkg.name);
                                                            setFilterLevel(lvl);
                                                        }}
                                                    >
                                                        {lvl.split(' ')[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Payment Transactions</h3>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Name / ID</th>
                                <th>Mobile / Mail</th>
                                <th>Package Details</th>
                                <th>Status</th>
                                <th>Method</th>
                                <th>Gross</th>
                                <th>Disc.</th>
                                <th>Tax</th>
                                <th>Net Rec.</th>
                                <th>Trans Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((p, index) => (
                                <tr key={p.id}>
                                    <td className={styles.sNo}>{index + 1}</td>
                                    <td>
                                        <div className={styles.stackedCell}>
                                            <span className={styles.primaryText}>{p.memberName}</span>
                                            <span className={styles.secondaryText}>{p.memberId}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.stackedCell}>
                                            <span className={styles.primaryText}>{p.mobile}</span>
                                            <span className={styles.secondaryText}>{p.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.stackedCell}>
                                            <span className={styles.primaryText}>{p.packageName}</span>
                                            <span className={styles.secondaryText}>{p.subPackage}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[p.status]}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.secondaryText}>{p.paymentMethod}</span>
                                    </td>
                                    <td><span className={styles.secondaryText}>{p.amount}</span></td>
                                    <td><span className={styles.discountText}>{p.discount}</span></td>
                                    <td><span className={styles.secondaryText}>{p.tax}</span></td>
                                    <td><span className={styles.amountText}>{p.netAmount}</span></td>
                                    <td>
                                        <div className={styles.stackedCell}>
                                            <span className={styles.secondaryText}>{p.transactionDate}</span>
                                            <span className={styles.secondaryText} style={{ fontSize: '10px' }}>{p.transactionId}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.actionsCell}>
                                            <button
                                                className={styles.actionIconView}
                                                onClick={() => openModal('view', p)}
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className={styles.actionIconInvoice}
                                                onClick={() => openModal('invoice', p)}
                                                title="Invoice"
                                            >
                                                <FileText size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={styles.paginationRow}>
                    <button className={styles.pagerBtn}>Prev</button>
                    <button className={`${styles.pagerBtn} ${styles.pagerActive}`}>1</button>
                    <button className={styles.pagerBtn}>Next</button>
                </div>
            </div>

            {modalOpen && selectedPayment && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modal} ${modalOpen === 'invoice' ? styles.invoiceModal : ''}`}>
                        <div className={styles.modalHeaderInner}>
                            <h3>{modalOpen === 'view' ? 'Transaction Intelligence' : 'Tax Invoice (India)'}</h3>
                            <button className={styles.modalCloseBtn} onClick={closeModal}><X size={20} /></button>
                        </div>

                        <div className={styles.modalContentBody}>
                            {modalOpen === 'view' ? (
                                <div className={styles.viewBody}>
                                    <div className={styles.viewSummaryHeader}>
                                        <div className={styles.memberBrief}>
                                            <div className={styles.avatarCircle}>
                                                <UserCircle size={28} />
                                            </div>
                                            <div>
                                                <div className={styles.primaryText} style={{ fontSize: '1.1rem' }}>{selectedPayment.memberName}</div>
                                                <div className={styles.secondaryText}>{selectedPayment.memberId} | {selectedPayment.role}</div>
                                            </div>
                                        </div>
                                        <div className={styles.amountDisplay}>
                                            <span className={styles.amountLabel}>Net Settlement</span>
                                            <span className={styles.amountVal}>{selectedPayment.netAmount}</span>
                                        </div>
                                    </div>

                                    <span className={styles.infoSectionTitle}>Subscription Intelligence</span>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Gross Amount</span>
                                            <span className={styles.infoValue}>{selectedPayment.amount}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Discount Applied</span>
                                            <span className={styles.infoValue}>{selectedPayment.discount}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Tax Component</span>
                                            <span className={styles.infoValue}>{selectedPayment.tax}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Settlement Status</span>
                                            <span className={`${styles.statusBadge} ${styles[selectedPayment.status]}`}>{selectedPayment.status}</span>
                                        </div>
                                    </div>

                                    <span className={styles.infoSectionTitle}>Audit Trail</span>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Transaction ID</span>
                                            <span className={styles.copyableId}>{selectedPayment.transactionId}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Registered Mobile</span>
                                            <span className={styles.infoValue}>{selectedPayment.mobile}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.amazonInvoiceContainer}>
                                    <Invoice payment={selectedPayment} />
                                    <div className={styles.invoiceActions}>
                                        <button className={styles.printBtn} onClick={handlePrint}>
                                            <Download size={18} /> Print Legal Invoice
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackagePaymentList;
