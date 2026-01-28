import React, { useState } from "react";
import styles from "./CurrencySettings.module.css";

type Currency = {
    id: number;
    name: string;
    symbol: string;
    code: string;
    enabled: boolean;
};

const initialCurrencies: Currency[] = [
    { id: 1, name: "Indian Rupee", symbol: "₹", code: "INR", enabled: true },
    { id: 2, name: "Norwegian Krone", symbol: "kr", code: "NOK", enabled: true },
    { id: 3, name: "Mexican Peso", symbol: "$", code: "MXN", enabled: false },
    { id: 4, name: "New Zealand Dollar", symbol: "$", code: "NZD", enabled: true },
    { id: 5, name: "Philippine Peso", symbol: "₱", code: "PHP", enabled: true },
    { id: 6, name: "Polish Zloty", symbol: "zł", code: "PLN", enabled: false },
    { id: 7, name: "Pound Sterling", symbol: "£", code: "GBP", enabled: true },
    { id: 8, name: "Swiss Franc", symbol: "CHF", code: "CHF", enabled: true },
    { id: 9, name: "Taka", symbol: "৳", code: "BDT", enabled: false },
    { id: 10, name: "Thai Baht", symbol: "฿", code: "THB", enabled: true },
];

const CurrencySettings: React.FC = () => {
    const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies);

    const toggleCurrency = (id: number) => {
        setCurrencies((prev) =>
            prev.map((c) =>
                c.id === id ? { ...c, enabled: !c.enabled } : c
            )
        );
    };

    return (
        <div className={styles.page}>
            {/* TOP SETTINGS */}
            <div className={styles.topGrid}>
                <div className={styles.card}>
                    <h3>System Default Currency</h3>
                    <div className={styles.inline}>
                        <select>
                            <option>U.S. Dollar</option>
                        </select>
                        <button className={styles.saveBtn}>Save</button>
                    </div>
                </div>

                <div className={styles.card}>
                    <h3>Set Currency Formats</h3>

                    <div className={styles.field}>
                        <label>Symbol Format</label>
                        <select>
                            <option>[Amount] [Symbol]</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label>Decimal Separator</label>
                        <select>
                            <option>1,234,567.00</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label>No of decimals</label>
                        <select>
                            <option>123.45</option>
                        </select>
                    </div>

                    <div className={styles.right}>
                        <button className={styles.saveBtn}>Save</button>
                    </div>
                </div>
            </div>

            {/* ALL CURRENCIES */}
            <div className={styles.card}>
                <div className={styles.tableHeader}>
                    <h3>All Currencies</h3>
                    <div className={styles.tableActions}>
                        <input placeholder="Type name & Enter" />
                        <button className={styles.addBtn}>Add New Currency</button>
                    </div>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Currency Name</th>
                            <th>Currency Symbol</th>
                            <th>Currency Code</th>
                            <th>Status</th>
                            <th>Options</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currencies.map((c) => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.name}</td>
                                <td>{c.symbol}</td>
                                <td>{c.code}</td>

                                {/* TOGGLE COLUMN */}
                                <td>
                                    <button
                                        className={`${styles.toggleBtn} ${c.enabled ? styles.on : styles.off
                                            }`}
                                        onClick={() => toggleCurrency(c.id)}
                                    >
                                        {c.enabled ? "ON" : "OFF"}
                                    </button>
                                </td>

                                <td className={styles.options}>
                                    <button className={styles.iconBtn}>✎</button>
                                    <button className={styles.iconBtn}>🗑</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={styles.pagination}>
                    <button className={styles.activePage}>1</button>
                    <button>2</button>
                    <button>3</button>
                </div>
            </div>
        </div>
    );
};

export default CurrencySettings;
