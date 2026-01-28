import React from "react";
import styles from "./ManualPayments.module.css";

type PaymentStatus = "Active" | "Inactive";

interface PaymentMethod {
    id: number;
    name: string;
    instructions: string;
    status: PaymentStatus;
}

const paymentMethods: PaymentMethod[] = [
    {
        id: 1,
        name: "Bank Transfer",
        instructions:
            "Transfer to Account: 1234567890, Bank: Enterprise Bank, Branch: Main",
        status: "Active",
    },
    {
        id: 2,
        name: "Cash Deposit",
        instructions: "Deposit at any branch with reference number",
        status: "Active",
    },
    {
        id: 3,
        name: "Cheque",
        instructions: "Mail cheque to: 123 Business St, City, Country",
        status: "Active",
    },
    {
        id: 4,
        name: "Money Order",
        instructions: "Purchase money order and send to office address",
        status: "Inactive",
    },
    {
        id: 5,
        name: "Western Union",
        instructions: "Send via Western Union with provided details",
        status: "Active",
    },
];

const ManualPaymentMethods: React.FC = () => {
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {/* HEADER */}
                <div className={styles.header}>
                    <h1>Manual Payment Methods</h1>
                    <button className={styles.addBtn}>
                        <span>＋</span> Add Method
                    </button>
                </div>

                {/* TABLE */}
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Method Name</th>
                                <th>Instructions</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paymentMethods.map((method) => (
                                <tr key={method.id}>
                                    <td className={styles.methodName}>{method.name}</td>
                                    <td className={styles.instructions}>
                                        {method.instructions}
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.status} ${method.status === "Active"
                                                ? styles.active
                                                : styles.inactive
                                                }`}
                                        >
                                            {method.status}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button className={styles.editBtn}>Edit</button>
                                        <button className={styles.detailsBtn}>Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManualPaymentMethods;
