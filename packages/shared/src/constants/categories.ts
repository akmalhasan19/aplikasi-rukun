export const TRANSACTION_TYPES = {
    PEMASUKAN: "PEMASUKAN",
    PENGELUARAN: "PENGELUARAN",
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export const ORG_TYPES = {
    RT: "RT",
    MASJID: "MASJID",
    KOMUNITAS: "KOMUNITAS",
} as const;

export type OrgType = (typeof ORG_TYPES)[keyof typeof ORG_TYPES];
