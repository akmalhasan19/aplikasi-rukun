import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Animated, Easing, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabTransition } from "./tab-transition";

const PAID_RESIDENTS = [
    { id: "1", colors: ["#0F766E", "#5EEAD4"] as const },
    { id: "2", colors: ["#155E75", "#67E8F9"] as const },
];
const PAID_RESIDENTS_MORE = 4;
const USER_IURAN_STATUS = "Belum Lunas";
const IS_USER_PAID = false;
const COLLECTIVE_PROGRESS = 78;

const IURAN_BREAKDOWN = [
    {
        id: "security",
        name: "Keamanan",
        category: "Wajib Bulanan",
        amount: "Rp 50.000",
        icon: "shield-checkmark-outline" as const,
        iconBg: "#F9FAFB",
        iconColor: "#FF5A36",
    },
    {
        id: "cleaning",
        name: "Kebersihan",
        category: "Wajib Bulanan",
        amount: "Rp 50.000",
        icon: "brush-outline" as const,
        iconBg: "#F9FAFB",
        iconColor: "#FF5A36",
    },
];

const IURAN_HISTORY = [
    { id: "sep-2023", title: "Iuran September", date: "10 Sep 2023" },
    { id: "agu-2023", title: "Iuran Agustus", date: "09 Agu 2023" },
];
const HEADER_TOP_RADIUS = 40;
const HEADER_BOTTOM_RADIUS = 40;
const HOME_LIKE_HEADER_PADDING_BOTTOM = 220;
const LAYANAN_LIKE_HEADER_PADDING_BOTTOM = 18;
const IURAN_HEADER_PADDING_BOTTOM = 8;
const HOME_LIKE_BALANCE_MARGIN_TOP = -208;
const IURAN_BALANCE_MARGIN_TOP = 12;
const CONTENT_SLIDE_DISTANCE = 48;
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function IuranScreen() {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const tabTransition = useTabTransition();
    const headerMarginHorizontal = useRef(new Animated.Value(0)).current;
    const headerMarginTop = useRef(new Animated.Value(0)).current;
    const headerTopRadius = useRef(new Animated.Value(0)).current;
    const headerPaddingTop = useRef(new Animated.Value(0)).current;
    const headerPaddingBottom = useRef(new Animated.Value(IURAN_HEADER_PADDING_BOTTOM)).current;
    const balanceCardMarginTop = useRef(new Animated.Value(IURAN_BALANCE_MARGIN_TOP)).current;
    const pageAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const iuranPaddingTop = Platform.OS === "ios" ? insets.top + 16 : insets.top + 20;
        const homePaddingTop = Platform.OS === "ios" ? 60 : 50;
        const layananPaddingTop = Platform.OS === "ios" ? insets.top + 14 : insets.top + 20;

        if (isFocused) {
            const fromTab = tabTransition.to === "iuran" ? tabTransition.from : null;
            const fromHome = fromTab === "index";
            const fromLayanan = fromTab === "layanan";

            const startMarginHorizontal = fromHome ? 8 : 0;
            const startMarginTop = fromHome ? insets.top * 0.15 : 0;
            const startTopRadius = fromHome ? HEADER_TOP_RADIUS : 0;
            const startPaddingTop = fromHome ? homePaddingTop : fromLayanan ? layananPaddingTop : iuranPaddingTop;
            const startPaddingBottom = fromHome
                ? HOME_LIKE_HEADER_PADDING_BOTTOM
                : fromLayanan
                    ? LAYANAN_LIKE_HEADER_PADDING_BOTTOM
                    : IURAN_HEADER_PADDING_BOTTOM;
            const startBalanceMarginTop = fromHome ? HOME_LIKE_BALANCE_MARGIN_TOP : IURAN_BALANCE_MARGIN_TOP;

            headerMarginHorizontal.stopAnimation();
            headerMarginTop.stopAnimation();
            headerTopRadius.stopAnimation();
            headerPaddingTop.stopAnimation();
            headerPaddingBottom.stopAnimation();
            balanceCardMarginTop.stopAnimation();

            headerMarginHorizontal.setValue(startMarginHorizontal);
            headerMarginTop.setValue(startMarginTop);
            headerTopRadius.setValue(startTopRadius);
            headerPaddingTop.setValue(startPaddingTop);
            headerPaddingBottom.setValue(startPaddingBottom);
            balanceCardMarginTop.setValue(startBalanceMarginTop);

            Animated.parallel([
                Animated.timing(headerMarginHorizontal, {
                    toValue: 0,
                    duration: 520,
                    easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    useNativeDriver: false,
                }),
                Animated.timing(headerMarginTop, {
                    toValue: 0,
                    duration: 520,
                    easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    useNativeDriver: false,
                }),
                Animated.timing(headerTopRadius, {
                    toValue: 0,
                    duration: 520,
                    easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    useNativeDriver: false,
                }),
                Animated.timing(headerPaddingTop, {
                    toValue: iuranPaddingTop,
                    duration: 520,
                    easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    useNativeDriver: false,
                }),
                Animated.timing(headerPaddingBottom, {
                    toValue: IURAN_HEADER_PADDING_BOTTOM,
                    duration: 520,
                    easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    useNativeDriver: false,
                }),
                Animated.timing(balanceCardMarginTop, {
                    toValue: IURAN_BALANCE_MARGIN_TOP,
                    duration: 520,
                    easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    useNativeDriver: false,
                }),
            ]).start();

            pageAnim.stopAnimation();
            pageAnim.setValue(0);
            Animated.timing(pageAnim, {
                toValue: 1,
                duration: 380,
                easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                useNativeDriver: true,
            }).start();
            return;
        }

        headerMarginHorizontal.stopAnimation();
        headerMarginTop.stopAnimation();
        headerTopRadius.stopAnimation();
        headerPaddingTop.stopAnimation();
        headerPaddingBottom.stopAnimation();
        balanceCardMarginTop.stopAnimation();
        pageAnim.stopAnimation();
    }, [
        balanceCardMarginTop,
        headerMarginHorizontal,
        headerMarginTop,
        headerPaddingBottom,
        headerPaddingTop,
        headerTopRadius,
        insets.top,
        isFocused,
        tabTransition.from,
        tabTransition.to,
        pageAnim,
    ]);

    const animatedHeaderContainerStyle = {
        marginHorizontal: headerMarginHorizontal,
        marginTop: headerMarginTop,
        borderTopLeftRadius: headerTopRadius,
        borderTopRightRadius: headerTopRadius,
    };

    const animatedHeaderGradientStyle = {
        borderTopLeftRadius: headerTopRadius,
        borderTopRightRadius: headerTopRadius,
        paddingTop: headerPaddingTop,
        paddingBottom: headerPaddingBottom,
    };

    const animatedBalanceCardWrapperStyle = {
        marginTop: balanceCardMarginTop,
    };

    const animatedContentWrapperStyle = {
        opacity: pageAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.25, 1],
        }),
        transform: [
            {
                translateX: pageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [CONTENT_SLIDE_DISTANCE, 0],
                }),
            },
        ],
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.headerShadowContainer, animatedHeaderContainerStyle]}>
                    <AnimatedLinearGradient
                        colors={["#FF7E5F", "#FEB47B", "#F5F7FA"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.headerGradient,
                            animatedHeaderGradientStyle,
                        ]}
                    >
                        <View>
                            <View style={styles.header}>
                                <Text style={styles.welcomeText}>RT 05 / RW 02</Text>
                                <Text style={styles.nameText}>Manajemen Iuran</Text>
                            </View>

                            <TouchableOpacity style={styles.notificationCard} activeOpacity={0.9}>
                                <View style={styles.notificationLeft}>
                                    <View style={styles.badge}>
                                        <LinearGradient
                                            colors={["#FB923C", "#EF4444"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.badgeGradient}
                                        >
                                            <Text style={styles.badgeText}>2</Text>
                                        </LinearGradient>
                                    </View>
                                    <Text style={styles.notificationText}>2 iuran belum dibayar</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </AnimatedLinearGradient>
                </Animated.View>

                <Animated.View style={[styles.balanceCardWrapper, animatedBalanceCardWrapperStyle]}>
                    <View style={styles.balanceCardShadow}>
                        <View style={styles.balanceCard}>
                            <View style={styles.balanceHeader}>
                                <View style={styles.balanceHeaderInfo}>
                                    <Text style={styles.balanceTitle}>Tagihan Bulan Ini</Text>
                                    <View style={styles.updateInfo}>
                                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                                        <Text style={styles.updateText}>Jatuh tempo: 10 Okt</Text>
                                    </View>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        IS_USER_PAID ? styles.statusBadgePaid : styles.statusBadgeUnpaid,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusBadgeText,
                                            IS_USER_PAID ? styles.statusBadgeTextPaid : styles.statusBadgeTextUnpaid,
                                        ]}
                                    >
                                        {USER_IURAN_STATUS}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.balanceAmount}>
                                <Text style={styles.balanceNumber}>Rp 100.000</Text>
                                <Text style={styles.balanceAmountInfo}>Total iuran wajib warga</Text>
                            </View>

                            <View style={styles.balanceFooter}>
                                <View style={styles.paidResidentsContainer}>
                                    <View style={styles.paidResidentsRow}>
                                        {PAID_RESIDENTS.map((resident, index) => (
                                            <LinearGradient
                                                key={resident.id}
                                                colors={resident.colors}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={[
                                                    styles.paidResidentAvatar,
                                                    index !== 0 ? styles.paidResidentOverlap : undefined,
                                                ]}
                                            >
                                                <Ionicons name="person" size={12} color="rgba(17,24,39,0.65)" />
                                            </LinearGradient>
                                        ))}
                                        <View style={[styles.morePaidBubble, styles.paidResidentOverlap]}>
                                            <Text style={styles.morePaidText}>+{PAID_RESIDENTS_MORE}</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.reportButton} activeOpacity={0.85}>
                                    <Text style={styles.reportButtonText}>Bayar Sekarang</Text>
                                </TouchableOpacity>
                            </View>

                            <Ionicons
                                name="wallet-outline"
                                size={120}
                                color="rgba(0,0,0,0.03)"
                                style={styles.balanceIcon}
                            />
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.contentWrapper, animatedContentWrapperStyle]}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Rincian Iuran</Text>
                        <View style={styles.rincianList}>
                            {IURAN_BREAKDOWN.map((item) => (
                                <TouchableOpacity key={item.id} style={styles.rincianCard} activeOpacity={0.85}>
                                    <View style={[styles.rincianIconContainer, { backgroundColor: item.iconBg }]}>
                                        <Ionicons name={item.icon} size={20} color={item.iconColor} />
                                    </View>
                                    <View style={styles.rincianContent}>
                                        <Text style={styles.rincianTitle}>{item.name}</Text>
                                        <Text style={styles.rincianSubtext}>{item.amount}</Text>
                                        <View style={styles.rincianStatusRow}>
                                            <View style={styles.rincianStatusDot} />
                                            <Text style={styles.rincianStatusText}>Belum Bayar</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <View>
                                <Text style={styles.progressTitle}>Progress Kolektif</Text>
                                <Text style={styles.progressSubtitle}>Partisipasi warga bulan ini</Text>
                            </View>
                            <Text style={styles.progressPercentage}>{COLLECTIVE_PROGRESS}%</Text>
                        </View>
                        <View style={styles.progressTrack}>
                            <LinearGradient
                                colors={["#FF7E5F", "#FEB47B"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressFill, { width: `${COLLECTIVE_PROGRESS}%` }]}
                            />
                        </View>
                        <Text style={styles.progressCaption}>45 dari 58 warga sudah membayar</Text>
                    </View>

                    <View style={[styles.section, styles.lastSection]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Riwayat</Text>
                            <TouchableOpacity>
                                <Text style={styles.viewAllText}>Lihat Semua</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.riwayatList}>
                            {IURAN_HISTORY.map((item) => (
                                <View key={item.id} style={styles.riwayatCard}>
                                    <View style={styles.riwayatLeft}>
                                        <View style={styles.riwayatIconContainer}>
                                            <Ionicons name="receipt-outline" size={18} color="#6B7280" />
                                        </View>
                                        <View>
                                            <Text style={styles.riwayatTitle}>{item.title}</Text>
                                            <Text style={styles.riwayatDate}>{item.date}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.riwayatDownloadButton} activeOpacity={0.8}>
                                        <Ionicons name="download-outline" size={17} color="#FF7E5F" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    headerShadowContainer: {
        marginHorizontal: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        backgroundColor: "transparent",
    },
    headerGradient: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingHorizontal: 8,
        paddingBottom: IURAN_HEADER_PADDING_BOTTOM,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 120,
    },
    contentWrapper: {
        paddingHorizontal: 16,
        paddingTop: 11,
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 14,
        color: "rgba(255,255,255,0.9)",
        fontWeight: "500",
        marginBottom: 4,
    },
    nameText: {
        fontSize: 28,
        color: "#FFFFFF",
        fontWeight: "700",
        letterSpacing: -0.5,
    },
    notificationCard: {
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: 999,
        paddingVertical: 8,
        paddingLeft: 8,
        paddingRight: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    notificationLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    badge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: "hidden",
    },
    badgeGradient: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    notificationText: {
        fontSize: 14,
        color: "#1F2937",
        fontWeight: "500",
    },
    balanceCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 32,
        padding: 24,
        marginBottom: 0,
        overflow: "hidden",
        position: "relative",
    },
    balanceCardShadow: {
        borderRadius: 32,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    balanceCardWrapper: {
        paddingHorizontal: 16,
        marginTop: 12,
        marginBottom: 20,
    },
    balanceIcon: {
        position: "absolute",
        right: -30,
        top: 40,
    },
    balanceHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 6,
        gap: 8,
    },
    balanceHeaderInfo: {
        flex: 1,
    },
    balanceTitle: {
        fontSize: 30 - 10,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
    },
    updateInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    updateText: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
    },
    statusBadgeUnpaid: {
        backgroundColor: "#FEE2E2",
        borderColor: "#FECACA",
    },
    statusBadgePaid: {
        backgroundColor: "#DCFCE7",
        borderColor: "#86EFAC",
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: "700",
    },
    statusBadgeTextUnpaid: {
        color: "#EF4444",
    },
    statusBadgeTextPaid: {
        color: "#10B981",
    },
    balanceAmount: {
        marginTop: 16,
        marginBottom: 18,
    },
    balanceNumber: {
        fontSize: 40 - 10,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -1,
    },
    balanceAmountInfo: {
        marginTop: 4,
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    balanceFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    paidResidentsContainer: {
        flex: 1,
    },
    paidResidentsRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 36,
    },
    paidResidentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    paidResidentOverlap: {
        marginLeft: -9,
    },
    morePaidBubble: {
        height: 32,
        minWidth: 38,
        paddingHorizontal: 8,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        backgroundColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
    },
    morePaidText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#6B7280",
    },
    reportButton: {
        backgroundColor: "#111827",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 999,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    reportButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    section: {
        marginBottom: 20,
    },
    lastSection: {
        marginBottom: 0,
    },
    sectionTitle: {
        fontSize: 31 - 13,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingHorizontal: 2,
    },
    viewAllText: {
        fontSize: 18 - 4,
        fontWeight: "600",
        color: "#FF7E5F",
    },
    rincianList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    rincianCard: {
        backgroundColor: "#FFFFFF",
        width: "48%",
        padding: 12,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    rincianIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    rincianContent: {
        flex: 1,
        minHeight: 44,
    },
    rincianTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 1,
    },
    rincianSubtext: {
        fontSize: 12,
        color: "#6B7280",
    },
    rincianStatusRow: {
        marginTop: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    rincianStatusDot: {
        width: 5,
        height: 5,
        borderRadius: 999,
        backgroundColor: "#EF4444",
    },
    rincianStatusText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#EF4444",
    },
    progressCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 2,
    },
    progressSubtitle: {
        fontSize: 14,
        color: "#6B7280",
    },
    progressPercentage: {
        fontSize: 34,
        fontWeight: "800",
        color: "#FF7E5F",
        letterSpacing: -0.6,
    },
    progressTrack: {
        width: "100%",
        height: 9,
        borderRadius: 999,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 999,
    },
    progressCaption: {
        marginTop: 8,
        textAlign: "right",
        fontSize: 13,
        color: "#6B7280",
    },
    riwayatList: {
        gap: 10,
    },
    riwayatCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        paddingVertical: 14,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    riwayatLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    riwayatIconContainer: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    },
    riwayatTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
    },
    riwayatDate: {
        marginTop: 2,
        fontSize: 14,
        color: "#6B7280",
    },
    riwayatDownloadButton: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#FFF1ED",
        alignItems: "center",
        justifyContent: "center",
    },
});
