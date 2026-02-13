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
import {
    assignRegionalAdminRole,
    fetchMe,
    getPersistedSession,
    type RegionalAdminRole,
    updateMyProfile,
} from "../services/auth";

function normalizeAreaCode(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly.slice(0, 3);
}

function formatAreaCode(value: string) {
    return value.replace(/\D/g, "").padStart(3, "0").slice(-3);
}

export default function AccountSettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
    const [adminRoles, setAdminRoles] = useState<RegionalAdminRole[]>([]);
    const [assigningRole, setAssigningRole] = useState(false);
    const [targetEmail, setTargetEmail] = useState("");
    const [roleScope, setRoleScope] = useState<"RT" | "RW">("RT");
    const [kelurahan, setKelurahan] = useState("");
    const [rwCode, setRwCode] = useState("");
    const [rtCode, setRtCode] = useState("");
    const [roleMessage, setRoleMessage] = useState<string | null>(null);

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
                setIsPlatformAdmin(Boolean(me.is_platform_admin));
                setAdminRoles(Array.isArray(me.admin_roles) ? me.admin_roles : []);
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

    const handleAssignAdminRole = async () => {
        if (!targetEmail.trim() || !kelurahan.trim() || !rwCode.trim()) {
            setRoleMessage("Email target, kelurahan, dan RW wajib diisi.");
            return;
        }

        if (roleScope === "RT" && !rtCode.trim()) {
            setRoleMessage("RT wajib diisi untuk role admin RT.");
            return;
        }

        try {
            setAssigningRole(true);
            setRoleMessage(null);

            const session = await getPersistedSession();
            if (!session) {
                router.replace("/login");
                return;
            }

            const response = await assignRegionalAdminRole(session.access_token, {
                targetEmail: targetEmail.trim().toLowerCase(),
                roleScope,
                kelurahan: kelurahan.trim(),
                rw: formatAreaCode(rwCode),
                rt: roleScope === "RT" ? formatAreaCode(rtCode) : undefined,
            });

            const me = await fetchMe(session.access_token);
            setAdminRoles(Array.isArray(me.admin_roles) ? me.admin_roles : []);
            setRoleMessage(
                `Role ${response.assignment.role_scope} admin berhasil ditetapkan untuk ${response.target_user.email || "akun target"}.`,
            );
            setTargetEmail("");
            setKelurahan("");
            setRwCode("");
            setRtCode("");
            setRoleScope("RT");
        } catch (error) {
            if (error instanceof ApiError) {
                setRoleMessage(error.message);
                return;
            }

            setRoleMessage("Gagal menetapkan role admin wilayah.");
        } finally {
            setAssigningRole(false);
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
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 180 }]}
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

                            <View style={styles.card}>
                                <Text style={styles.sectionTitle}>Role Wilayah Saya</Text>
                                {adminRoles.length === 0 ? (
                                    <Text style={styles.helperText}>Belum ada role admin RT/RW yang ditetapkan.</Text>
                                ) : (
                                    adminRoles.map((role) => (
                                        <View key={role.id} style={styles.roleItem}>
                                            <Text style={styles.roleBadge}>{role.role_scope === "RT" ? "Admin RT" : "Admin RW"}</Text>
                                            <Text style={styles.roleAreaText}>
                                                Kel. {role.kelurahan} | RW {role.rw}
                                                {role.role_scope === "RT" ? ` | RT ${role.rt}` : ""}
                                            </Text>
                                        </View>
                                    ))
                                )}
                            </View>

                            {isPlatformAdmin ? (
                                <View style={styles.card}>
                                    <Text style={styles.sectionTitle}>Tetapkan Admin RT/RW</Text>
                                    <Text style={styles.helperText}>Gunakan email akun yang sudah terdaftar.</Text>

                                    <Text style={styles.fieldLabel}>Email Akun Target</Text>
                                    <TextInput
                                        value={targetEmail}
                                        onChangeText={setTargetEmail}
                                        placeholder="target@email.com"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        style={styles.input}
                                        editable={!assigningRole}
                                    />

                                    <Text style={styles.fieldLabel}>Level Role</Text>
                                    <View style={styles.scopeRow}>
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={[styles.scopeButton, roleScope === "RT" ? styles.scopeButtonActive : null]}
                                            onPress={() => setRoleScope("RT")}
                                            disabled={assigningRole}
                                        >
                                            <Text style={[styles.scopeText, roleScope === "RT" ? styles.scopeTextActive : null]}>Admin RT</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={[styles.scopeButton, roleScope === "RW" ? styles.scopeButtonActive : null]}
                                            onPress={() => setRoleScope("RW")}
                                            disabled={assigningRole}
                                        >
                                            <Text style={[styles.scopeText, roleScope === "RW" ? styles.scopeTextActive : null]}>Admin RW</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.fieldLabel}>Kelurahan</Text>
                                    <TextInput
                                        value={kelurahan}
                                        onChangeText={setKelurahan}
                                        placeholder="Nama kelurahan"
                                        placeholderTextColor="#9CA3AF"
                                        style={styles.input}
                                        editable={!assigningRole}
                                    />

                                    <Text style={styles.fieldLabel}>RW</Text>
                                    <TextInput
                                        value={rwCode}
                                        onChangeText={(value) => setRwCode(normalizeAreaCode(value))}
                                        placeholder="Contoh: 006"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="number-pad"
                                        maxLength={3}
                                        style={styles.input}
                                        editable={!assigningRole}
                                    />

                                    {roleScope === "RT" ? (
                                        <>
                                            <Text style={styles.fieldLabel}>RT</Text>
                                            <TextInput
                                                value={rtCode}
                                                onChangeText={(value) => setRtCode(normalizeAreaCode(value))}
                                                placeholder="Contoh: 012"
                                                placeholderTextColor="#9CA3AF"
                                                keyboardType="number-pad"
                                                maxLength={3}
                                                style={styles.input}
                                                editable={!assigningRole}
                                            />
                                        </>
                                    ) : null}

                                    <TouchableOpacity
                                        style={[styles.assignButton, assigningRole ? styles.assignButtonDisabled : null]}
                                        onPress={handleAssignAdminRole}
                                        activeOpacity={0.9}
                                        disabled={assigningRole}
                                    >
                                        {assigningRole ? (
                                            <>
                                                <Text style={styles.assignButtonText}>Memproses...</Text>
                                                <ActivityIndicator color="#FFFFFF" />
                                            </>
                                        ) : (
                                            <>
                                                <Text style={styles.assignButtonText}>Tetapkan Role Admin</Text>
                                                <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    {roleMessage ? <Text style={styles.statusText}>{roleMessage}</Text> : null}
                                </View>
                            ) : null}

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
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 15,
        color: "#1F2937",
        fontWeight: "900",
    },
    helperText: {
        marginTop: 6,
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "600",
    },
    roleItem: {
        marginTop: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 10,
        paddingVertical: 9,
        gap: 4,
    },
    roleBadge: {
        alignSelf: "flex-start",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: "#FFE4CC",
        color: "#C25D00",
        fontSize: 11,
        fontWeight: "900",
    },
    roleAreaText: {
        color: "#374151",
        fontSize: 13,
        fontWeight: "700",
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
    scopeRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 2,
    },
    scopeButton: {
        flex: 1,
        height: 42,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#F9FAFB",
        alignItems: "center",
        justifyContent: "center",
    },
    scopeButtonActive: {
        borderColor: "#FF7A50",
        backgroundColor: "#FFF2ED",
    },
    scopeText: {
        color: "#4B5563",
        fontSize: 13,
        fontWeight: "800",
    },
    scopeTextActive: {
        color: "#C2410C",
    },
    assignButton: {
        marginTop: 14,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#1F2937",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    assignButtonDisabled: {
        opacity: 0.72,
    },
    assignButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "900",
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
