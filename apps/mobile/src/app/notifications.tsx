import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { markNotificationClosed, setNotificationSourceTab } from "./notification-navigation-state";

type FilterKey = "Semua" | "Iuran" | "Keamanan" | "Rapat" | "Darurat";

type NotificationItem = {
    id: string;
    title: string;
    message: string;
    time: string;
    category: Exclude<FilterKey, "Semua">;
    unread: boolean;
    icon: keyof typeof Ionicons.glyphMap;
};

const FILTERS: FilterKey[] = ["Semua", "Iuran", "Keamanan", "Rapat", "Darurat"];

const NOTIFICATIONS: NotificationItem[] = [
    {
        id: "n1",
        title: "Kerja Bakti Minggu Ini",
        message: "Minggu, 08:00 WIB - Lapangan Serbaguna. Harap membawa alat kebersihan.",
        time: "Hari ini, 09:30",
        category: "Rapat",
        unread: true,
        icon: "megaphone-outline",
    },
    {
        id: "n2",
        title: "Tagihan Iuran Sampah",
        message: "Periode Mei 2024 belum dibayar. Mohon segera lunasi.",
        time: "Kemarin, 14:15",
        category: "Iuran",
        unread: true,
        icon: "wallet-outline",
    },
    {
        id: "n3",
        title: "Jadwal Ronda Malam",
        message: "Giliran Bapak: Selasa Malam. Pos Kamling RT 05.",
        time: "Senin, 10 Mei",
        category: "Keamanan",
        unread: false,
        icon: "shield-checkmark-outline",
    },
    {
        id: "n4",
        title: "Rapat Warga Bulanan",
        message: "Terima kasih atas kehadiran Bapak/Ibu pada rapat tanggal 8 Mei.",
        time: "Minggu, 9 Mei",
        category: "Rapat",
        unread: false,
        icon: "calendar-outline",
    },
    {
        id: "n5",
        title: "Info Keadaan Darurat",
        message: "Nomor siaga RT telah diperbarui. Cek menu Kontak Darurat.",
        time: "Sabtu, 8 Mei",
        category: "Darurat",
        unread: false,
        icon: "warning-outline",
    },
    {
        id: "n6",
        title: "Pemadaman Air PDAM",
        message: "Akan ada perbaikan pipa pada pukul 10:00 - 14:00.",
        time: "Jumat, 7 Mei",
        category: "Darurat",
        unread: false,
        icon: "water-outline",
    },
];

function toNumber(input: string | string[] | undefined, fallback: number) {
    if (typeof input !== "string") {
        return fallback;
    }

    const parsed = Number.parseFloat(input);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        originX?: string;
        originY?: string;
        originW?: string;
        originH?: string;
        fromTab?: string;
    }>();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const openProgress = useRef(new Animated.Value(0)).current;
    const isClosingRef = useRef(false);
    const [activeFilter, setActiveFilter] = useState<FilterKey>("Semua");

    const fallbackWidth = Math.max(screenWidth - 24, 280);
    const fallbackHeight = 56;
    const fromTabParam = typeof params.fromTab === "string" ? params.fromTab : null;

    const originX = toNumber(params.originX, 12);
    const originY = toNumber(params.originY, insets.top + 120);
    const originW = Math.max(toNumber(params.originW, fallbackWidth), 56);
    const originH = Math.max(toNumber(params.originH, fallbackHeight), 48);

    const filteredNotifications = useMemo(() => {
        if (activeFilter === "Semua") {
            return NOTIFICATIONS;
        }

        return NOTIFICATIONS.filter((item) => item.category === activeFilter);
    }, [activeFilter]);

    useEffect(() => {
        setNotificationSourceTab(fromTabParam);

        return () => {
            markNotificationClosed();
        };
    }, [fromTabParam]);

    useEffect(() => {
        openProgress.stopAnimation();
        openProgress.setValue(0);
        Animated.timing(openProgress, {
            toValue: 1,
            duration: 520,
            easing: Easing.bezier(0.22, 0.8, 0.22, 1),
            useNativeDriver: false,
        }).start();
    }, [openProgress]);

    const closePage = () => {
        if (isClosingRef.current) {
            return;
        }

        isClosingRef.current = true;
        openProgress.stopAnimation();
        Animated.timing(openProgress, {
            toValue: 0,
            duration: 300,
            easing: Easing.bezier(0.22, 0.8, 0.22, 1),
            useNativeDriver: false,
        }).start(() => {
            router.back();
        });
    };

    const animatedBackdropStyle = {
        opacity: openProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.92],
        }),
    };

    const animatedShellStyle = {
        left: openProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [originX, 0],
        }),
        top: openProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [originY, 0],
        }),
        width: openProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [originW, screenWidth],
        }),
        height: openProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [originH, screenHeight],
        }),
        borderRadius: openProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [Math.min(originH / 2, 28), 0],
        }),
        shadowOpacity: openProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.14, 0],
        }),
        shadowRadius: openProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 0],
        }),
    };

    const animatedMorphLayerStyle = {
        opacity: openProgress.interpolate({
            inputRange: [0, 0.4, 0.58, 1],
            outputRange: [1, 1, 0, 0],
        }),
        transform: [
            {
                scale: openProgress.interpolate({
                    inputRange: [0, 0.55, 1],
                    outputRange: [1, 1.01, 1.015],
                }),
            },
        ],
    };

    const animatedContentStyle = {
        opacity: openProgress.interpolate({
            inputRange: [0, 0.38, 1],
            outputRange: [0, 0, 1],
        }),
        transform: [
            {
                translateY: openProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                }),
            },
        ],
    };

    return (
        <View style={styles.root}>
            <StatusBar style="dark" />
            <Animated.View pointerEvents="none" style={[styles.backdrop, animatedBackdropStyle]} />

            <Animated.View style={[styles.animatedShell, animatedShellStyle]}>
                <Animated.View pointerEvents="none" style={[styles.morphLayer, animatedMorphLayerStyle]}>
                    <View style={styles.originCard}>
                        <View style={styles.originCardLeft}>
                            <View style={styles.originBadge}>
                                <LinearGradient
                                    colors={["#FB923C", "#EF4444"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.originBadgeGradient}
                                >
                                    <Text style={styles.originBadgeText}>2</Text>
                                </LinearGradient>
                            </View>
                            <Text style={styles.originCardText}>2 iuran belum dibayar</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.pageSurface, animatedContentStyle]}>
                    <ScrollView
                        stickyHeaderIndices={[0]}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={[styles.stickyHeader, { paddingTop: insets.top + 10 }]}>
                            <View style={styles.headerTopRow}>
                                <TouchableOpacity style={styles.circleIconButton} activeOpacity={0.8} onPress={closePage}>
                                    <Ionicons name="arrow-back" size={20} color="#1F2937" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.circleIconButton}
                                    activeOpacity={0.8}
                                    onPress={() => router.push("/notification-settings")}
                                >
                                    <Ionicons name="settings-outline" size={20} color="#F2930D" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.pageTitle}>Notifikasi Warga</Text>
                            <Text style={styles.pageSubtitle}>RT 05 / RW 02, Kel. Sukamaju</Text>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filterRow}
                            >
                                {FILTERS.map((filter) => {
                                    const isActive = filter === activeFilter;
                                    return (
                                        <TouchableOpacity
                                            key={filter}
                                            activeOpacity={0.85}
                                            style={[styles.filterChip, isActive ? styles.filterChipActive : styles.filterChipInactive]}
                                            onPress={() => setActiveFilter(filter)}
                                        >
                                            <Text style={[styles.filterChipText, isActive ? styles.filterChipTextActive : styles.filterChipTextInactive]}>
                                                {filter}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        <View style={styles.timelineWrapper}>
                            <View style={styles.timelineLine} />

                            {filteredNotifications.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.9}
                                    style={[styles.itemRow, !item.unread ? styles.itemRowRead : null]}
                                >
                                    <View style={styles.iconColumn}>
                                        {item.unread ? <View style={styles.unreadGlow} /> : null}
                                        <View style={[styles.iconCircle, item.unread ? styles.iconCircleUnread : styles.iconCircleRead]}>
                                            <Ionicons
                                                name={item.icon}
                                                size={23}
                                                color={item.unread ? "#F2930D" : "#9CA3AF"}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.itemBody}>
                                        <View style={styles.itemHeader}>
                                            <Text style={[styles.itemTitle, !item.unread ? styles.itemTitleRead : null]} numberOfLines={2}>
                                                {item.title}
                                            </Text>
                                            {item.unread ? (
                                                <View style={styles.newBadge}>
                                                    <Text style={styles.newBadgeText}>Baru</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                        <Text style={[styles.itemMessage, !item.unread ? styles.itemMessageRead : null]}>{item.message}</Text>
                                        <Text style={styles.itemTime}>{item.time}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}

                            <View style={styles.endStateRow}>
                                <Text style={styles.endStateText}>Semua notifikasi telah ditampilkan</Text>
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "transparent",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#F8F7F5",
    },
    animatedShell: {
        position: "absolute",
        overflow: "hidden",
        backgroundColor: "#F8F7F5",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    morphLayer: {
        ...StyleSheet.absoluteFillObject,
        paddingHorizontal: 0,
        paddingTop: 0,
        zIndex: 2,
    },
    originCard: {
        height: 56,
        borderRadius: 999,
        backgroundColor: "rgba(255, 255, 255, 0.78)",
        paddingVertical: 8,
        paddingLeft: 8,
        paddingRight: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    originCardLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    originBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: "hidden",
    },
    originBadgeGradient: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    originBadgeText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    originCardText: {
        fontSize: 14,
        color: "#1F2937",
        fontWeight: "500",
    },
    pageSurface: {
        flex: 1,
        backgroundColor: "#F8F7F5",
        zIndex: 1,
    },
    scrollContent: {
        paddingBottom: 28,
    },
    stickyHeader: {
        backgroundColor: "rgba(248,247,245,0.98)",
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(242,147,13,0.08)",
    },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    circleIconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    pageTitle: {
        fontSize: 28,
        color: "#111827",
        fontWeight: "600",
        letterSpacing: -0.5,
    },
    pageSubtitle: {
        marginTop: 4,
        marginBottom: 14,
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "400",
    },
    filterRow: {
        gap: 10,
        paddingRight: 12,
    },
    filterChip: {
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderWidth: 1,
    },
    filterChipActive: {
        backgroundColor: "#F2930D",
        borderColor: "#F2930D",
    },
    filterChipInactive: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: "600",
    },
    filterChipTextActive: {
        color: "#FFFFFF",
    },
    filterChipTextInactive: {
        color: "#4B5563",
    },
    timelineWrapper: {
        position: "relative",
        paddingTop: 18,
        paddingHorizontal: 12,
        gap: 10,
    },
    timelineLine: {
        position: "absolute",
        left: 46,
        top: 12,
        bottom: 24,
        width: 2,
        backgroundColor: "#E5E7EB",
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderRadius: 16,
        paddingHorizontal: 6,
        paddingVertical: 6,
        backgroundColor: "transparent",
    },
    itemRowRead: {
        opacity: 0.82,
    },
    iconColumn: {
        width: 56,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 4,
    },
    unreadGlow: {
        position: "absolute",
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "rgba(242,147,13,0.30)",
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
    },
    iconCircleUnread: {
        borderWidth: 2,
        borderColor: "#F2930D",
        backgroundColor: "#FFFFFF",
    },
    iconCircleRead: {
        borderWidth: 2,
        borderColor: "#E5E7EB",
        backgroundColor: "#F3F4F6",
    },
    itemBody: {
        flex: 1,
        paddingTop: 6,
        paddingLeft: 8,
        paddingRight: 8,
    },
    itemHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
    },
    itemTitle: {
        flex: 1,
        fontSize: 21,
        color: "#111827",
        fontWeight: "500",
        lineHeight: 24,
    },
    itemTitleRead: {
        color: "#4B5563",
    },
    newBadge: {
        borderRadius: 999,
        backgroundColor: "rgba(242,147,13,0.12)",
        paddingHorizontal: 9,
        paddingVertical: 3,
        marginTop: 2,
    },
    newBadgeText: {
        color: "#F2930D",
        fontSize: 11,
        fontWeight: "700",
    },
    itemMessage: {
        marginTop: 4,
        fontSize: 16,
        color: "#4B5563",
        fontWeight: "300",
        lineHeight: 22,
    },
    itemMessageRead: {
        color: "#6B7280",
    },
    itemTime: {
        marginTop: 8,
        fontSize: 12,
        color: "#9CA3AF",
        fontWeight: "400",
    },
    endStateRow: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 10,
        paddingBottom: 18,
    },
    endStateText: {
        fontSize: 12,
        color: "#D1D5DB",
        fontWeight: "400",
    },
});
