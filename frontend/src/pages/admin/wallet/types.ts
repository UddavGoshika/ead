// src/components/WalletHistory/types.ts
export interface Transaction {
    id: string;
    name: string;
    userId: string;
    role: "Advocate" | "Client";
    wallet: "main" | "bonus" | "referral";
    source: string;
    plan: string;
    refBy: string;
    type: "credit" | "debit";
    amount: number;
    status: "completed" | "pending" | "failed";
    date: string; // YYYY-MM-DD
    email: string;
    phone: string;
    gateway: string;
    paymentMethod: string;
    notes?: string;
    ip?: string;
}

export type SortField = keyof Pick<Transaction, "date" | "id" | "name" | "userId" | "amount" | "type" | "status">;

export interface SortState {
    field: SortField;
    direction: "asc" | "desc";
}

export interface FilterState {
    search: string;
    role: "all" | Transaction["role"];
    type: "all" | Transaction["type"];
    wallet: "all" | Transaction["wallet"];
    source: string;
    gateway: string;
    method: string;
    status: "all" | Transaction["status"];
    minAmount: number | "";
    maxAmount: number | "";
    fromDate: string;
    toDate: string;
}
