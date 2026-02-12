export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    WARGA: "WARGA",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
