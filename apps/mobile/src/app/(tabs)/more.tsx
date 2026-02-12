import { useCallback, useRef, useState } from "react";
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { ApiError } from "../../services/api";
import { clearPersistedSession, fetchMe, getPersistedSession, logoutWithBackend } from "../../services/auth";

type SectionRowProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    disabled?: boolean;
    danger?: boolean;
    last?: boolean;
};

function SectionRow({ icon, title, subtitle, onPress, disabled, danger, last }: SectionRowProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.row, last ? styles.rowLast : null, disabled ? styles.rowDisabled : null]}
            onPress={onPress}
            disabled={disabled}
        >
            <View style={styles.rowLeft}>
                <View style={[styles.rowIconWrap, danger ? styles.rowIconWrapDanger : null]}>
                    <Ionicons name={icon} size={19} color={danger ? "#DC2626" : "#E29B36"} />
                </View>
                <View style={styles.rowTextWrap}>
                    <Text style={[styles.rowTitle, danger ? styles.rowTitleDanger : null]}>{title}</Text>
                    {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
                </View>
            </View>
            {danger ? null : <Ionicons name="chevron-forward" size={18} color="#A3AAB6" />}
        </TouchableOpacity>
    );
}

export default function MoreScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [displayName, setDisplayName] = useState("Warga");
    const [displayEmail, setDisplayEmail] = useState("Belum login");
    const [isBusy, setIsBusy] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const reveal = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            let mounted = true;

            reveal.stopAnimation();
            reveal.setValue(0);
            Animated.timing(reveal, {
                toValue: 1,
                duration: 360,
                useNativeDriver: true,
            }).start();

            const loadProfile = async () => {
                setStatusMessage(null);
                try {
                    const session = await getPersistedSession();
                    if (!session) {
                        if (mounted) {
                            setDisplayName("Warga");
                            setDisplayEmail("Belum login");
                        }
                        return;
                    }

                    const me = await fetchMe(session.access_token);
                    if (!mounted) {
                        return;
                    }

                    setDisplayName(me.profile?.name?.trim() || "Warga");
                    setDisplayEmail(me.auth_user.email || "Tanpa email");
                } catch {
                    if (mounted) {
                        setStatusMessage("Gagal memuat data akun.");
                    }
                }
            };

            loadProfile();
            return () => {
                mounted = false;
            };
        }, [reveal]),
    );

    const firstInitial = displayName.trim().charAt(0).toUpperCase() || "W";

    const showSoonAlert = () => {
        Alert.alert("Segera hadir", "Fitur ini sedang disiapkan.");
    };

    const handleLogout = () => {
        Alert.alert("Keluar akun", "Yakin ingin keluar dari akun ini?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Keluar",
                style: "destructive",
                onPress: async () => {
                    try {
                        setIsBusy(true);
                        const session = await getPersistedSession();
                        if (session) {
                            await logoutWithBackend(session.access_token);
                        }
                    } catch (error) {
                        if (error instanceof ApiError) {
                            setStatusMessage(error.message);
                        }
                    } finally {
                        await clearPersistedSession();
                        setIsBusy(false);
                        router.replace("/login");
                    }
                },
            },
        ]);
    };

    const headerAnimatedStyle = {
        opacity: reveal,
        transform: [
            {
                translateY: reveal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-14, 0],
                }),
            },
        ],
    };

    const contentAnimatedStyle = {
        opacity: reveal.interpolate({
            inputRange: [0, 0.25, 1],
            outputRange: [0, 0, 1],
        }),
        transform: [
            {
                translateY: reveal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                }),
            },
        ],
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["rgba(226,155,54,0.24)", "rgba(226,155,54,0.06)", "rgba(226,155,54,0)"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.bgTopGlow}
            />

            <Animated.View style={headerAnimatedStyle}>
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <Text style={styles.headerTitle}>Lainnya</Text>
                    <TouchableOpacity activeOpacity={0.85} style={styles.headerRoundButton} onPress={showSoonAlert}>
                        <Ionicons name="qr-code-outline" size={20} color="#505A67" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={contentAnimatedStyle}>
                    <View style={styles.profileCard}>
                        <View style={styles.profileDecorLarge} />
                        <View style={styles.profileRow}>
                            <View style={styles.avatarOuter}>
                                <LinearGradient
                                    colors={["#F7B459", "#E2912B"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.avatarInner}
                                >
                                    <Text style={styles.avatarInitial}>{firstInitial}</Text>
                                </LinearGradient>
                                <View style={styles.onlineDot} />
                            </View>

                            <View style={styles.profileTextWrap}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.profileName} numberOfLines={1}>
                                        {displayName}
                                    </Text>
                                    <View style={styles.roleBadge}>
                                        <Text style={styles.roleBadgeText}>Warga</Text>
                                    </View>
                                </View>
                                <Text style={styles.profileRtRw}>RT 005 / RW 012</Text>
                                <Text style={styles.profileArea} numberOfLines={1}>
                                    {displayEmail}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.profileActions}>
                            <TouchableOpacity
                                style={[styles.profileActionButton, styles.profileActionPrimary]}
                                activeOpacity={0.85}
                                onPress={() => router.push("/account-settings")}
                            >
                                <Ionicons name="create-outline" size={18} color="#E29B36" />
                                <Text style={styles.profileActionPrimaryText}>Edit Profil</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.profileActionButton}
                                activeOpacity={0.85}
                                onPress={showSoonAlert}
                            >
                                <Ionicons name="shield-checkmark-outline" size={18} color="#616B79" />
                                <Text style={styles.profileActionSecondaryText}>Keamanan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionLabel}>Umum</Text>
                        <View style={styles.sectionCard}>
                            <SectionRow
                                icon="notifications-outline"
                                title="Notifikasi"
                                subtitle="Atur reminder dan preferensi notifikasi"
                                onPress={() => router.push("/notification-settings")}
                            />
                            <SectionRow
                                icon="time-outline"
                                title="Riwayat Aktivitas"
                                subtitle="Pantau aktivitas akun dan pembaruan"
                                onPress={showSoonAlert}
                                last
                            />
                        </View>
                    </View>

                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionLabel}>Lingkungan</Text>
                        <View style={styles.sectionCard}>
                            <SectionRow
                                icon="information-circle-outline"
                                title="Tentang RT 005"
                                subtitle="Informasi ringkas wilayah dan program"
                                onPress={showSoonAlert}
                            />
                            <SectionRow
                                icon="people-outline"
                                title="Struktur Pengurus"
                                subtitle="Lihat ketua RT/RW dan pengurus aktif"
                                onPress={showSoonAlert}
                            />
                            <SectionRow
                                icon="call-outline"
                                title="Kontak Darurat"
                                subtitle="Nomor penting untuk kondisi darurat"
                                onPress={showSoonAlert}
                                last
                            />
                        </View>
                    </View>

                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionLabel}>Aplikasi</Text>
                        <View style={styles.sectionCard}>
                            <SectionRow
                                icon="settings-outline"
                                title="Pengaturan"
                                subtitle="Kelola akun dan preferensi aplikasi"
                                onPress={() => router.push("/account-settings")}
                            />
                            <SectionRow
                                icon="help-circle-outline"
                                title="Bantuan & Dukungan"
                                subtitle="Panduan penggunaan dan kontak bantuan"
                                onPress={showSoonAlert}
                            />
                            <SectionRow
                                icon="log-out-outline"
                                title="Keluar"
                                subtitle="Akhiri sesi dan kembali ke login"
                                danger
                                disabled={isBusy}
                                onPress={handleLogout}
                                last
                            />
                        </View>
                    </View>

                    <View style={styles.versionWrap}>
                        <Text style={styles.versionText}>Versi Aplikasi 1.0.0</Text>
                        <Text style={styles.versionSubText}>Aplikasi Rukun Indonesia</Text>
                    </View>

                    {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F7F6",
    },
    bgTopGlow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 260,
    },
    header: {
        paddingHorizontal: 22,
        paddingBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "900",
        color: "#202735",
        letterSpacing: -0.6,
    },
    headerRoundButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#ECE6DE",
        alignItems: "center",
        justifyContent: "center",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 6,
    },
    profileCard: {
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderWidth: 1,
        borderColor: "#EFE8DF",
        shadowColor: "#D18B2A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 4,
        overflow: "hidden",
    },
    profileDecorLarge: {
        position: "absolute",
        right: -34,
        top: -34,
        width: 130,
        height: 130,
        borderRadius: 999,
        backgroundColor: "rgba(226,155,54,0.08)",
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarOuter: {
        width: 78,
        height: 78,
        borderRadius: 39,
        padding: 4,
        backgroundColor: "#F3EEE7",
        marginRight: 13,
    },
    avatarInner: {
        flex: 1,
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInitial: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "900",
    },
    onlineDot: {
        position: "absolute",
        right: 2,
        bottom: 2,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#22C55E",
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    profileTextWrap: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    profileName: {
        flexShrink: 1,
        fontSize: 21,
        color: "#202735",
        fontWeight: "900",
    },
    roleBadge: {
        borderRadius: 999,
        backgroundColor: "#E29B36",
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    roleBadgeText: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "900",
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    profileRtRw: {
        marginTop: 2,
        fontSize: 13,
        color: "#6B7380",
        fontWeight: "700",
    },
    profileArea: {
        marginTop: 2,
        fontSize: 12,
        color: "#9AA2AE",
        fontWeight: "600",
    },
    profileActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
    },
    profileActionButton: {
        flex: 1,
        height: 42,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    profileActionPrimary: {
        borderColor: "#E29B36",
        backgroundColor: "#FFF7EC",
    },
    profileActionPrimaryText: {
        color: "#E29B36",
        fontSize: 13,
        fontWeight: "800",
    },
    profileActionSecondaryText: {
        color: "#616B79",
        fontSize: 13,
        fontWeight: "800",
    },
    sectionBlock: {
        marginTop: 16,
    },
    sectionLabel: {
        marginBottom: 8,
        marginLeft: 3,
        fontSize: 11,
        color: "#9CA3AF",
        fontWeight: "900",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    sectionCard: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ECE8E2",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        shadowColor: "#121212",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    row: {
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F2F4F7",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    rowDisabled: {
        opacity: 0.75,
    },
    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 10,
    },
    rowIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFF5E8",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 11,
    },
    rowIconWrapDanger: {
        backgroundColor: "#FEE2E2",
    },
    rowTextWrap: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 15,
        color: "#2E384A",
        fontWeight: "800",
    },
    rowTitleDanger: {
        color: "#DC2626",
    },
    rowSubtitle: {
        marginTop: 2,
        fontSize: 12,
        color: "#7A8495",
        fontWeight: "600",
    },
    versionWrap: {
        marginTop: 18,
        marginBottom: 6,
        alignItems: "center",
    },
    versionText: {
        fontSize: 11,
        color: "#A2AAB6",
        fontWeight: "700",
    },
    versionSubText: {
        marginTop: 2,
        fontSize: 10,
        color: "#C0C6CF",
        fontWeight: "600",
    },
    statusMessage: {
        marginTop: 8,
        textAlign: "center",
        fontSize: 13,
        color: "#B91C1C",
        fontWeight: "700",
    },
});
