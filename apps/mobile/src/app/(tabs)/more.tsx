import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { checkBackendStatus, type BackendStatus } from "../../services/backend-status";

export default function MoreScreen() {
    const [status, setStatus] = useState<BackendStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const runCheck = useCallback(async () => {
        setIsLoading(true);
        try {
            const nextStatus = await checkBackendStatus();
            setStatus(nextStatus);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void runCheck();
    }, [runCheck]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Integrasi Backend</Text>
            <Text style={styles.subtitle}>Status koneksi Supabase dari aplikasi mobile</Text>

            <View style={styles.card}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FF5A36" />
                        <Text style={styles.loadingText}>Mengecek koneksi backend...</Text>
                    </View>
                ) : (
                    <>
                        <StatusRow label="Env configured" value={status?.envConfigured ? "Ya" : "Belum"} />
                        <StatusRow label="Session tersedia" value={status?.hasSession ? "Ya" : "Tidak"} />
                        <StatusRow
                            label="Backend reachable"
                            value={status?.backendReachable ? "Ya" : "Tidak"}
                            valueColor={status?.backendReachable ? "#16A34A" : "#DC2626"}
                        />
                        <StatusRow label="Pesan" value={status?.message ?? "Belum ada hasil pengecekan"} multiline />
                        <StatusRow label="Terakhir cek" value={status?.checkedAt ?? "-"} />
                    </>
                )}
            </View>

            <Pressable onPress={() => void runCheck()} style={styles.button}>
                <Text style={styles.buttonText}>{isLoading ? "Checking..." : "Cek Ulang"}</Text>
            </Pressable>
        </View>
    );
}

type StatusRowProps = {
    label: string;
    value: string;
    valueColor?: string;
    multiline?: boolean;
};

function StatusRow({ label, value, valueColor = "#111827", multiline = false }: StatusRowProps) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, { color: valueColor }, multiline && styles.multilineValue]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
        paddingHorizontal: 20,
        paddingTop: 64,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#111827",
    },
    subtitle: {
        marginTop: 8,
        fontSize: 14,
        color: "#6B7280",
    },
    card: {
        marginTop: 24,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 10,
    },
    row: {
        gap: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        color: "#6B7280",
        textTransform: "uppercase",
    },
    value: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    multilineValue: {
        lineHeight: 22,
    },
    button: {
        marginTop: 16,
        backgroundColor: "#FF5A36",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        height: 48,
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
    },
    loadingContainer: {
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    loadingText: {
        color: "#6B7280",
        fontSize: 14,
    },
});
