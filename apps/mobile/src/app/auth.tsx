import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

type AuthTab = "masuk" | "daftar";

type Field = {
    id: string;
    label: string;
    placeholder: string;
    secureTextEntry?: boolean;
};

const LOGIN_FIELDS: Field[] = [
    { id: "email", label: "Email", placeholder: "contoh@email.com" },
    { id: "password", label: "Password", placeholder: "Masukkan password", secureTextEntry: true },
];

const REGISTER_FIELDS: Field[] = [
    { id: "name", label: "Nama Lengkap", placeholder: "Masukkan nama lengkap" },
    { id: "phone", label: "Nomor HP", placeholder: "08xxxxxxxxxx" },
    { id: "email", label: "Email", placeholder: "contoh@email.com" },
    { id: "password", label: "Password", placeholder: "Buat password", secureTextEntry: true },
    { id: "confirmPassword", label: "Konfirmasi Password", placeholder: "Ulangi password", secureTextEntry: true },
];

export default function AuthScreen() {
    const [activeTab, setActiveTab] = useState<AuthTab>("masuk");

    const fields = useMemo(() => {
        if (activeTab === "daftar") {
            return REGISTER_FIELDS;
        }

        return LOGIN_FIELDS;
    }, [activeTab]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Aplikasi Rukun</Text>
                <Text style={styles.subtitle}>Masuk atau daftar untuk melanjutkan</Text>

                <View style={styles.tabContainer}>
                    <AuthTabButton label="Masuk" active={activeTab === "masuk"} onPress={() => setActiveTab("masuk")} />
                    <AuthTabButton label="Daftar" active={activeTab === "daftar"} onPress={() => setActiveTab("daftar")} />
                </View>

                <View style={styles.formCard}>
                    {fields.map((field) => (
                        <View key={field.id} style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{field.label}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={field.placeholder}
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={field.secureTextEntry}
                            />
                        </View>
                    ))}

                    <Pressable style={styles.primaryButton} onPress={() => router.replace("/(tabs)")}>
                        <Text style={styles.primaryButtonText}>{activeTab === "masuk" ? "Masuk" : "Daftar"}</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

type AuthTabButtonProps = {
    label: string;
    active: boolean;
    onPress: () => void;
};

function AuthTabButton({ label, active, onPress }: AuthTabButtonProps) {
    return (
        <Pressable onPress={onPress} style={[styles.tabButton, active && styles.activeTabButton]}>
            <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    scroll: {
        flex: 1,
    },
    container: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 40,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "#111827",
    },
    subtitle: {
        marginTop: 8,
        fontSize: 14,
        color: "#6B7280",
    },
    tabContainer: {
        marginTop: 28,
        backgroundColor: "#E5E7EB",
        borderRadius: 12,
        padding: 4,
        flexDirection: "row",
    },
    tabButton: {
        flex: 1,
        height: 42,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    activeTabButton: {
        backgroundColor: "#FFFFFF",
    },
    tabLabel: {
        color: "#6B7280",
        fontSize: 14,
        fontWeight: "700",
    },
    activeTabLabel: {
        color: "#111827",
    },
    formCard: {
        marginTop: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 16,
        gap: 14,
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        fontSize: 13,
        color: "#374151",
        fontWeight: "700",
    },
    input: {
        height: 46,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        paddingHorizontal: 12,
        fontSize: 14,
        color: "#111827",
        backgroundColor: "#F9FAFB",
    },
    primaryButton: {
        marginTop: 8,
        backgroundColor: "#FF5A36",
        borderRadius: 12,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});
