import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError } from "../services/api";
import { fetchMe, getPersistedSession, updateMyProfile } from "../services/auth";

export default function AccountSettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setMessage(null);
                const session = await getPersistedSession();
                if (!session) {
                    router.replace("/login");
                    return;
                }

                const me = await fetchMe(session.access_token);
                if (!mounted) {
                    return;
                }

                setName(me.profile?.name || "");
                setPhone(me.profile?.phone || "");
                setEmail(me.auth_user.email || "");
            } catch (error) {
                if (error instanceof ApiError) {
                    setMessage(error.message);
                } else {
                    setMessage("Gagal memuat data akun.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadData();
        return () => {
            mounted = false;
        };
    }, [router]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);

            const session = await getPersistedSession();
            if (!session) {
                router.replace("/login");
                return;
            }

            const payload = {
                name: name.trim(),
                phone: phone.trim() || null,
            };

            const updated = await updateMyProfile(session.access_token, payload);
            setName(updated.profile.name);
            setPhone(updated.profile.phone || "");
            setMessage("Perubahan akun berhasil disimpan.");
        } catch (error) {
            if (error instanceof ApiError) {
                setMessage(error.message);
                return;
            }
            setMessage("Gagal menyimpan perubahan akun.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={["#FF7E5F", "#FEB47B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 10 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.headerIconButton} onPress={() => router.back()} activeOpacity={0.8}>
                        <Ionicons name="arrow-back" size={21} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerTitle}>Account Settings</Text>
                <Text style={styles.headerSubtitle}>Kelola informasi akun Anda</Text>
            </LinearGradient>

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <View style={styles.loadingWrap}>
                            <ActivityIndicator color="#FF7E5F" size="large" />
                            <Text style={styles.loadingText}>Memuat akun...</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.card}>
                                <Text style={styles.fieldLabel}>Nama Lengkap</Text>
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Nama lengkap"
                                    placeholderTextColor="#9CA3AF"
                                    style={styles.input}
                                    editable={!saving}
                                />

                                <Text style={styles.fieldLabel}>Email</Text>
                                <TextInput
                                    value={email}
                                    placeholder="Email"
                                    placeholderTextColor="#9CA3AF"
                                    style={[styles.input, styles.readonlyInput]}
                                    editable={false}
                                />

                                <Text style={styles.fieldLabel}>Nomor WhatsApp</Text>
                                <TextInput
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="0812xxxx"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                    style={styles.input}
                                    editable={!saving}
                                />
                            </View>

                            {message ? <Text style={styles.statusText}>{message}</Text> : null}
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {!loading ? (
                <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 16 }]}>
                    <TouchableOpacity
                        style={[styles.saveButton, saving ? styles.saveButtonDisabled : null]}
                        onPress={handleSave}
                        activeOpacity={0.9}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Text style={styles.saveButtonText}>Menyimpan...</Text>
                                <ActivityIndicator color="#FFFFFF" />
                            </>
                        ) : (
                            <>
                                <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                                <Ionicons name="checkmark-circle-outline" size={19} color="#FFFFFF" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F6F8",
    },
    flex: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 34,
        borderBottomRightRadius: 34,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    headerIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 29,
        color: "#FFFFFF",
        fontWeight: "900",
        letterSpacing: -0.4,
    },
    headerSubtitle: {
        marginTop: 4,
        color: "rgba(255,255,255,0.92)",
        fontSize: 14,
        fontWeight: "600",
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 18,
    },
    loadingWrap: {
        alignItems: "center",
        paddingTop: 32,
        gap: 10,
    },
    loadingText: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "700",
    },
    card: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E9EDF2",
        backgroundColor: "#FFFFFF",
        padding: 14,
    },
    fieldLabel: {
        fontSize: 13,
        color: "#4B5563",
        fontWeight: "800",
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#D7DCE3",
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 12,
        color: "#111827",
        fontSize: 15,
        fontWeight: "700",
    },
    readonlyInput: {
        color: "#6B7280",
        backgroundColor: "#F3F4F6",
    },
    statusText: {
        marginTop: 14,
        fontSize: 13,
        color: "#065F46",
        fontWeight: "700",
        textAlign: "center",
    },
    bottomAction: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 10,
        backgroundColor: "rgba(245,246,248,0.97)",
        borderTopWidth: 1,
        borderTopColor: "#E9EDF2",
    },
    saveButton: {
        height: 52,
        borderRadius: 999,
        backgroundColor: "#FF7A50",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    saveButtonDisabled: {
        opacity: 0.72,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "900",
    },
});
