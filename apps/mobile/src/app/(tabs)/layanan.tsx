import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Animated, Easing, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabTransition } from "./tab-transition";

type FilterItem = {
    id: string;
    label: string;
    active?: boolean;
};

type CategoryItem = {
    id: string;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
};

type TicketStatus = "Menunggu" | "Diproses" | "Selesai";

type TicketItem = {
    id: string;
    title: string;
    description: string;
    code: string;
    time: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
    status: TicketStatus;
};

const FILTERS: FilterItem[] = [
    { id: "all", label: "Semua" },
    { id: "active", label: "Aktif (2)", active: true },
    { id: "waiting", label: "Menunggu (1)" },
    { id: "done", label: "Selesai (5)" },
];

const CATEGORIES: CategoryItem[] = [
    {
        id: "security",
        title: "Lapor Keamanan",
        subtitle: "Pencurian, Keributan",
        icon: "shield-checkmark-outline",
        iconColor: "#FF5A36",
        iconBg: "#F9FAFB",
    },
    {
        id: "cleaning",
        title: "Lapor Kebersihan",
        subtitle: "Sampah, Selokan",
        icon: "sparkles-outline",
        iconColor: "#FF5A36",
        iconBg: "#F9FAFB",
    },
    {
        id: "infra",
        title: "Infrastruktur",
        subtitle: "Jalan Rusak, Lampu",
        icon: "construct-outline",
        iconColor: "#FF5A36",
        iconBg: "#F9FAFB",
    },
    {
        id: "crowd",
        title: "Izin Keramaian",
        subtitle: "Hajatan, Acara",
        icon: "happy-outline",
        iconColor: "#FF5A36",
        iconBg: "#F9FAFB",
    },
    {
        id: "letter",
        title: "Permintaan Surat",
        subtitle: "Pengantar, Domisili",
        icon: "document-text-outline",
        iconColor: "#FF5A36",
        iconBg: "#F9FAFB",
    },
    {
        id: "other",
        title: "Lainnya",
        subtitle: "Kategori Lain",
        icon: "apps-outline",
        iconColor: "#FF5A36",
        iconBg: "#F9FAFB",
    },
];

const TICKETS: TicketItem[] = [
    {
        id: "1",
        title: "Pos Ronda RT 04 Kosong",
        description: "Petugas jaga malam tidak terlihat di pos sejak jam 11...",
        code: "#SEC-2023-001",
        time: "10 Menit yang lalu",
        icon: "shield-checkmark-outline",
        iconColor: "#EF4444",
        iconBg: "#FEF2F2",
        status: "Menunggu",
    },
    {
        id: "2",
        title: "Lampu Jalan Mati",
        description: "Jalan Mawar No. 12 lampu penerangan utama mati total.",
        code: "#INF-2023-089",
        time: "2 Jam yang lalu",
        icon: "construct-outline",
        iconColor: "#3B82F6",
        iconBg: "#EFF6FF",
        status: "Diproses",
    },
    {
        id: "3",
        title: "Tumpukan Sampah Liar",
        description: "Di ujung gang buntu banyak sampah menumpuk.",
        code: "#CLN-2023-055",
        time: "Kemarin",
        icon: "sparkles-outline",
        iconColor: "#10B981",
        iconBg: "#ECFDF5",
        status: "Selesai",
    },
];

const LAYANAN_HEADER_TARGET_BOTTOM = 18;
const HOME_TO_LAYANAN_START_BOTTOM = 220;
const IURAN_TO_LAYANAN_START_BOTTOM = 8;
const MORE_TO_LAYANAN_START_BOTTOM = 40;
const MORE_TO_LAYANAN_CONTENT_SLIDE_DISTANCE = 24;
const MORE_TO_LAYANAN_FAB_RISE = 16;
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedHeaderContainer = Animated.createAnimatedComponent(View);

function statusStyle(status: TicketStatus) {
    if (status === "Menunggu") {
        return { bg: "#FEF3C7", color: "#B45309" };
    }

    if (status === "Diproses") {
        return { bg: "#DBEAFE", color: "#1D4ED8" };
    }

    return { bg: "#DCFCE7", color: "#15803D" };
}

export default function LayananScreen() {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const tabTransition = useTabTransition();
    const isLayananTransitionTarget = tabTransition.to === "layanan" || tabTransition.to === null;
    const fromTab = tabTransition.to === "layanan" ? tabTransition.from : null;
    const isFromMore = fromTab === "more";
    const pageAnim = useRef(new Animated.Value(0)).current;
    const headerMarginHorizontal = useRef(new Animated.Value(0)).current;
    const headerMarginTop = useRef(new Animated.Value(0)).current;
    const headerTopRadius = useRef(new Animated.Value(0)).current;
    const headerPaddingTop = useRef(new Animated.Value(0)).current;
    const headerPaddingBottom = useRef(new Animated.Value(LAYANAN_HEADER_TARGET_BOTTOM)).current;

    useEffect(() => {
        const layananPaddingTop = Platform.OS === "ios" ? insets.top + 14 : insets.top + 20;
        const homePaddingTop = Platform.OS === "ios" ? 60 : 50;
        const iuranPaddingTop = Platform.OS === "ios" ? insets.top + 16 : insets.top + 20;

        if (isFocused && isLayananTransitionTarget) {
            const fromHome = fromTab === "index";
            const fromIuran = fromTab === "iuran";
            const transitionDuration = isFromMore ? 620 : 520;
            const pageStartValue = isFromMore ? 0.14 : 0;
            const pageDuration = isFromMore ? 430 : 380;

            const startMarginHorizontal = fromHome ? 8 : isFromMore ? 3 : 0;
            const startMarginTop = fromHome ? insets.top * 0.15 : isFromMore ? insets.top * 0.05 : 0;
            const startTopRadius = fromHome ? 40 : isFromMore ? 20 : 0;
            const startPaddingTop = fromHome ? homePaddingTop : fromIuran ? iuranPaddingTop : isFromMore ? layananPaddingTop + 6 : layananPaddingTop;
            const startPaddingBottom = fromHome
                ? HOME_TO_LAYANAN_START_BOTTOM
                : fromIuran
                    ? IURAN_TO_LAYANAN_START_BOTTOM
                    : isFromMore
                        ? MORE_TO_LAYANAN_START_BOTTOM
                    : LAYANAN_HEADER_TARGET_BOTTOM;

            headerMarginHorizontal.stopAnimation();
            headerMarginTop.stopAnimation();
            headerTopRadius.stopAnimation();
            headerPaddingTop.stopAnimation();
            headerPaddingBottom.stopAnimation();

            headerMarginHorizontal.setValue(startMarginHorizontal);
            headerMarginTop.setValue(startMarginTop);
            headerTopRadius.setValue(startTopRadius);
            headerPaddingTop.setValue(startPaddingTop);
            headerPaddingBottom.setValue(startPaddingBottom);

            Animated.parallel([
                Animated.timing(headerMarginHorizontal, {
                    toValue: 0,
                    duration: transitionDuration,
                    easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    useNativeDriver: false,
                }),
                Animated.timing(headerMarginTop, {
                    toValue: 0,
                    duration: transitionDuration,
                    easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    useNativeDriver: false,
                }),
                Animated.timing(headerTopRadius, {
                    toValue: 0,
                    duration: transitionDuration,
                    easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    useNativeDriver: false,
                }),
                Animated.timing(headerPaddingTop, {
                    toValue: layananPaddingTop,
                    duration: transitionDuration,
                    easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    useNativeDriver: false,
                }),
                Animated.timing(headerPaddingBottom, {
                    toValue: LAYANAN_HEADER_TARGET_BOTTOM,
                    duration: transitionDuration,
                    easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    useNativeDriver: false,
                }),
            ]).start();

            pageAnim.stopAnimation();
            pageAnim.setValue(pageStartValue);
            Animated.timing(pageAnim, {
                toValue: 1,
                duration: pageDuration,
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

        pageAnim.stopAnimation();
    }, [
        headerMarginHorizontal,
        headerMarginTop,
        headerPaddingBottom,
        headerPaddingTop,
        headerTopRadius,
        insets.top,
        isFocused,
        isLayananTransitionTarget,
        tabTransition.from,
        tabTransition.to,
        pageAnim,
    ]);

    const animatedContentStyle = {
        opacity: pageAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        }),
        transform: [
            {
                translateX: pageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [isFromMore ? MORE_TO_LAYANAN_CONTENT_SLIDE_DISTANCE : 40, 0],
                }),
            },
        ],
    };

    const animatedFabStyle = {
        opacity: pageAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        }),
        transform: [
            {
                translateY: pageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [isFromMore ? MORE_TO_LAYANAN_FAB_RISE : 24, 0],
                }),
            },
            {
                scale: pageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [isFromMore ? 0.96 : 0.92, 1],
                }),
            },
        ],
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View>
                <AnimatedHeaderContainer
                    style={[
                        styles.headerShadowContainer,
                        {
                            marginHorizontal: headerMarginHorizontal,
                            marginTop: headerMarginTop,
                            borderTopLeftRadius: headerTopRadius,
                            borderTopRightRadius: headerTopRadius,
                        },
                    ]}
                >
                    <AnimatedLinearGradient
                        colors={["#FF7E5F", "#FEB47B", "#F5F7FA"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.headerGradient,
                            {
                                borderTopLeftRadius: headerTopRadius,
                                borderTopRightRadius: headerTopRadius,
                                paddingTop: headerPaddingTop,
                                paddingBottom: headerPaddingBottom,
                            },
                        ]}
                    >
                        <View style={styles.headerTopRow}>
                            <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.8}>
                                <Ionicons name="arrow-back-outline" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Layanan Warga</Text>
                            <View style={styles.headerRightPlaceholder} />
                        </View>

                        <View style={styles.headerInfo}>
                            <Text style={styles.headerCaption}>Lapor masalah lingkunganmu</Text>
                            <Text style={styles.headerGreeting}>Halo, Pak Budi</Text>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filtersRow}
                        >
                            {FILTERS.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.85}
                                    style={[styles.filterChip, item.active ? styles.filterChipActive : styles.filterChipGhost]}
                                >
                                    <Text style={[styles.filterChipText, item.active ? styles.filterChipTextActive : styles.filterChipTextGhost]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </AnimatedLinearGradient>
                </AnimatedHeaderContainer>
            </View>

            <Animated.View style={[styles.mainContent, animatedContentStyle]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Kategori Laporan</Text>
                    </View>

                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.categoryCard} activeOpacity={0.9}>
                                <View style={[styles.categoryIconWrap, { backgroundColor: item.iconBg }]}>
                                    <Ionicons name={item.icon} size={22} color={item.iconColor} />
                                </View>
                                <Text style={styles.categoryTitle}>{item.title}</Text>
                                <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.sectionHeaderRow, styles.ticketHeaderRow]}>
                        <Text style={styles.sectionTitle}>Tiket Terbaru</Text>
                        <TouchableOpacity>
                            <Text style={styles.sectionLink}>Lihat Semua</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.ticketList}>
                        {TICKETS.map((ticket) => {
                            const status = statusStyle(ticket.status);

                            return (
                                <View key={ticket.id} style={styles.ticketCard}>
                                    <View style={[styles.ticketIconWrap, { backgroundColor: ticket.iconBg }]}>
                                        <Ionicons name={ticket.icon} size={20} color={ticket.iconColor} />
                                    </View>

                                    <View style={styles.ticketBody}>
                                        <View style={styles.ticketTopRow}>
                                            <Text style={styles.ticketTitle} numberOfLines={1}>
                                                {ticket.title}
                                            </Text>
                                            <View style={[styles.ticketStatusBadge, { backgroundColor: status.bg }]}>
                                                <Text style={[styles.ticketStatusText, { color: status.color }]}>
                                                    {ticket.status}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text style={styles.ticketDescription} numberOfLines={1}>
                                            {ticket.description}
                                        </Text>

                                        <View style={styles.ticketMetaRow}>
                                            <Text style={styles.ticketMetaText}>{ticket.code}</Text>
                                            <View style={styles.metaDot} />
                                            <Text style={styles.ticketMetaText}>{ticket.time}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </Animated.View>

            <Animated.View style={[styles.fabContainer, animatedFabStyle]}>
                <TouchableOpacity style={styles.fabButton} activeOpacity={0.9}>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.fabText}>Buat Laporan</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
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
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        backgroundColor: "transparent",
    },
    headerGradient: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingHorizontal: 18,
        paddingBottom: 18,
    },
    headerTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    headerIconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    headerRightPlaceholder: {
        width: 32,
        height: 32,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
    },
    headerInfo: {
        marginBottom: 16,
    },
    headerCaption: {
        color: "rgba(255,255,255,0.82)",
        fontSize: 13,
        fontWeight: "500",
    },
    headerGreeting: {
        marginTop: 2,
        color: "#FFFFFF",
        fontSize: 30,
        fontWeight: "700",
        letterSpacing: -0.4,
    },
    filtersRow: {
        gap: 10,
        paddingRight: 10,
    },
    filterChip: {
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    filterChipGhost: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    filterChipActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    filterChipText: {
        fontSize: 13,
    },
    filterChipTextGhost: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    filterChipTextActive: {
        color: "#FF7E5F",
        fontWeight: "700",
    },
    mainContent: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 160,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        paddingHorizontal: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
    },
    sectionLink: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FF7E5F",
    },
    categoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    categoryCard: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    categoryIconWrap: {
        width: 46,
        height: 46,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1F2937",
    },
    categorySubtitle: {
        marginTop: 3,
        fontSize: 12,
        color: "#9CA3AF",
    },
    ticketHeaderRow: {
        marginTop: 26,
    },
    ticketList: {
        gap: 10,
    },
    ticketCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    ticketIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    ticketBody: {
        flex: 1,
    },
    ticketTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
    },
    ticketTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: "700",
        color: "#1F2937",
    },
    ticketStatusBadge: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ticketStatusText: {
        fontSize: 10,
        fontWeight: "700",
    },
    ticketDescription: {
        marginTop: 2,
        fontSize: 12,
        color: "#6B7280",
    },
    ticketMetaRow: {
        marginTop: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    ticketMetaText: {
        fontSize: 10,
        color: "#9CA3AF",
    },
    metaDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#D1D5DB",
    },
    fabContainer: {
        position: "absolute",
        right: 18,
        bottom: Platform.OS === "ios" ? 102 : 90,
    },
    fabButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#111827",
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    fabText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },
});
