import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Dimensions, Animated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useTabTransition } from "./tab-transition";
import { consumeSkipAnimationForTab, setNotificationSourceTab } from "../notification-navigation-state";
import { fetchMe, getPersistedSession } from "../../services/auth";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_TOP_RADIUS = 40;
const HEADER_BOTTOM_RADIUS = 40;
const HOME_BALANCE_REVEAL_HEIGHT = 340;
const CONTENT_SLIDE_DISTANCE = 48;
const MORE_TO_HOME_CONTENT_SLIDE_DISTANCE = 28;
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const isFocused = useIsFocused();
    const tabTransition = useTabTransition();
    const headerMorph = useRef(new Animated.Value(0)).current;
    const notificationCardRef = useRef<any>(null);
    const isHomeTransitionTarget = tabTransition.to === "index" || tabTransition.to === null;
    const fromTab = tabTransition.to === "index" ? tabTransition.from : null;
    const isFromMore = fromTab === "more";
    const [displayName, setDisplayName] = useState("Warga");

    const openNotifications = () => {
        const pushWithOrigin = (x: number, y: number, width: number, height: number) => {
            setNotificationSourceTab("index");
            router.push({
                pathname: "/notifications",
                params: {
                    originX: `${x}`,
                    originY: `${y}`,
                    originW: `${width}`,
                    originH: `${height}`,
                    fromTab: "index",
                },
            });
        };

        const fallbackY = Platform.OS === "ios" ? insets.top + 145 : insets.top + 120;
        const node = notificationCardRef.current as any;

        if (node && typeof node.measureInWindow === "function") {
            node.measureInWindow((x: number, y: number, width: number, height: number) => {
                pushWithOrigin(x, y, width, height);
            });
            return;
        }

        pushWithOrigin(16, fallbackY, 340, 56);
    };

    useEffect(() => {
        if (isFocused && isHomeTransitionTarget) {
            const shouldSkipAnimation = consumeSkipAnimationForTab("index");

            if (shouldSkipAnimation) {
                headerMorph.stopAnimation();
                headerMorph.setValue(1);
                return;
            }

            headerMorph.stopAnimation();
            headerMorph.setValue(isFromMore ? 0.2 : 0);
            Animated.timing(headerMorph, {
                toValue: 1,
                duration: isFromMore ? 620 : 900,
                easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                useNativeDriver: false,
            }).start();
            return;
        }

        headerMorph.stopAnimation();
    }, [headerMorph, isFocused, isFromMore, isHomeTransitionTarget]);

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                const session = await getPersistedSession();
                if (!session) {
                    return;
                }

                const me = await fetchMe(session.access_token);
                if (!isMounted) {
                    return;
                }

                const name = me.profile?.name?.trim();
                if (name) {
                    setDisplayName(name);
                }
            } catch {
                // Keep fallback name when API is unavailable.
            }
        };

        loadProfile();
        return () => {
            isMounted = false;
        };
    }, []);

    const homePaddingTop = Platform.OS === "ios" ? 60 : 50;
    const iuranPaddingTop = Platform.OS === "ios" ? insets.top + 16 : insets.top + 20;
    const layananPaddingTop = Platform.OS === "ios" ? insets.top + 14 : insets.top + 20;
    const morePaddingTop = Platform.OS === "ios" ? insets.top + 18 : insets.top + 22;
    const compactHeaderPaddingTop = fromTab === "layanan" ? layananPaddingTop : fromTab === "more" ? morePaddingTop : iuranPaddingTop;
    const contentSlideDistance = isFromMore ? MORE_TO_HOME_CONTENT_SLIDE_DISTANCE : CONTENT_SLIDE_DISTANCE;

    const animatedHeaderContainerStyle = {
        marginHorizontal: headerMorph.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 8],
        }),
        marginTop: headerMorph.interpolate({
            inputRange: [0, 1],
            outputRange: [0, insets.top * 0.15],
        }),
        borderTopLeftRadius: headerMorph.interpolate({
            inputRange: [0, 1],
            outputRange: [0, HEADER_TOP_RADIUS],
        }),
        borderTopRightRadius: headerMorph.interpolate({
            inputRange: [0, 1],
            outputRange: [0, HEADER_TOP_RADIUS],
        }),
    };

    const animatedHeaderGradientStyle = {
        borderTopLeftRadius: headerMorph.interpolate({
            inputRange: [0, 1],
            outputRange: [0, HEADER_TOP_RADIUS],
        }),
        borderTopRightRadius: headerMorph.interpolate({
            inputRange: [0, 1],
            outputRange: [0, HEADER_TOP_RADIUS],
        }),
        paddingTop: headerMorph.interpolate({
            inputRange: [0, 1],
            outputRange: [compactHeaderPaddingTop, homePaddingTop],
        }),
    };

    const animatedBalanceRevealStyle = {
        maxHeight: headerMorph.interpolate({
            inputRange: [0, 1],
            outputRange: [0, HOME_BALANCE_REVEAL_HEIGHT],
        }),
        opacity: headerMorph.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        }),
        transform: [
            {
                translateY: headerMorph.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                }),
            },
        ],
    };

    const animatedContentWrapperStyle = {
        opacity: headerMorph.interpolate({
            inputRange: [0, 1],
            outputRange: [0.25, 1],
        }),
        transform: [
            {
                translateX: headerMorph.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-contentSlideDistance, 0],
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
                <Animated.View
                    style={[
                        styles.headerShadowContainer,
                        animatedHeaderContainerStyle,
                    ]}
                >
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
                            {/* Header Section */}
                            <View style={styles.header}>
                                <Text style={styles.welcomeText}>Welcome Back</Text>
                                <Text style={styles.nameText}>{displayName}</Text>
                            </View>

                            {/* Unpaid Dues Notification */}
                            <TouchableOpacity
                                ref={notificationCardRef}
                                style={styles.notificationCard}
                                activeOpacity={0.9}
                                onPress={openNotifications}
                            >
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

                        {/* Balance Card */}
                        <Animated.View style={[styles.balanceRevealContainer, animatedBalanceRevealStyle]}>
                            <View style={[styles.balanceCard, { marginBottom: 0 }]}>
                                <View style={styles.balanceHeader}>
                                    <View>
                                        <Text style={styles.balanceTitle}>Saldo Kas Saat Ini</Text>
                                        <View style={styles.updateInfo}>
                                            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                                            <Text style={styles.updateText}>Update terakhir: Hari ini</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.balanceAmount}>
                                    <Text style={styles.balanceNumber}>Rp 24.500.000</Text>
                                </View>

                                <View style={styles.balanceFooter}>
                                    <View>
                                        <Text style={styles.incomeLabel}>Total Pemasukan Bulan Ini</Text>
                                        <Text style={styles.incomeAmount}>+Rp 2.100.000</Text>
                                    </View>
                                    <TouchableOpacity style={styles.reportButton} activeOpacity={0.85}>
                                        <Text style={styles.reportButtonText}>Lihat Laporan</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Background Icon */}
                                <Ionicons
                                    name="wallet-outline"
                                    size={120}
                                    color="rgba(0,0,0,0.03)"
                                    style={styles.balanceIcon}
                                />
                            </View>
                        </Animated.View>
                    </AnimatedLinearGradient>
                </Animated.View>

                <Animated.View style={[styles.contentWrapper, animatedContentWrapperStyle]}>
                    {/* Services Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Layanan</Text>
                        <View style={styles.servicesGrid}>
                            <ServiceButton icon="card-outline" label="Bayar Iuran" />
                            <ServiceButton icon="download-outline" label="Unduh Laporan" />
                            <ServiceButton icon="people-outline" label="Data Warga" />
                            <ServiceButton icon="calendar-outline" label="Agenda" />
                            <ServiceButton icon="medkit-outline" label="Kontak Darurat" />
                            <ServiceButton icon="chatbubbles-outline" label="Chat Pengurus" />
                        </View>
                    </View>

                    {/* Upcoming Agenda Section */}
                    <View style={[styles.section, styles.lastSection]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Agenda Terdekat</Text>
                            <TouchableOpacity>
                                <Text style={styles.viewAllText}>Lihat Semua</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.agendaCard}>
                            <View style={styles.agendaDate}>
                                <Text style={styles.agendaDay}>MING</Text>
                                <Text style={styles.agendaNumber}>12</Text>
                            </View>
                            <View style={styles.agendaContent}>
                                <Text style={styles.agendaTitle}>Kerja Bakti Lingkungan</Text>
                                <Text style={styles.agendaTime}>08:00 - 11:00 WIB • Lapangan RT 05</Text>
                                <View style={styles.participantsRow}>
                                    <View style={styles.avatar} />
                                    <View style={[styles.avatar, styles.avatarOverlap]} />
                                    <View style={[styles.avatar, styles.avatarOverlap]} />
                                    <View style={[styles.avatarMore, styles.avatarOverlap]}>
                                        <Text style={styles.avatarMoreText}>+12</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

function ServiceButton({ icon, label }: { icon: string; label: string }) {
    return (
        <TouchableOpacity style={styles.serviceButton} activeOpacity={0.7}>
            <View style={styles.serviceIconContainer}>
                <Ionicons name={icon as any} size={20} color="#FF5A36" />
            </View>
            <Text style={styles.serviceLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    headerShadowContainer: {
        marginHorizontal: 8,
        // Shadow for 3D/Floating effect
        shadowColor: "#000", // Darker shadow for visibility
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15, // Slightly lower opacity for black shadow
        shadowRadius: 16,
        elevation: 12, // Higher elevation for android
        borderTopLeftRadius: HEADER_TOP_RADIUS,
        borderTopRightRadius: HEADER_TOP_RADIUS,
        borderBottomLeftRadius: HEADER_BOTTOM_RADIUS,
        borderBottomRightRadius: HEADER_BOTTOM_RADIUS,
        backgroundColor: 'transparent', // Ensure compatibility
    },
    headerGradient: {
        borderTopLeftRadius: HEADER_TOP_RADIUS,
        borderTopRightRadius: HEADER_TOP_RADIUS,
        borderBottomLeftRadius: HEADER_BOTTOM_RADIUS,
        borderBottomRightRadius: HEADER_BOTTOM_RADIUS,
        paddingHorizontal: 8, // Content padding inside gradient
        paddingBottom: 9,
        // Ensure overflow is hidden if we want to clip content, 
        // but for shadow container we usually don't want overflow hidden on the container itself.
        // The gradient handles the background.
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 120, // Keep bottom padding for scrolling past tabs
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
        marginBottom: 8,
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
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.08,
        shadowRadius: 40,
        elevation: 8,
        overflow: "hidden",
        position: "relative",
    },
    balanceRevealContainer: {
        overflow: "hidden",
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
        marginBottom: 8,
    },
    balanceTitle: {
        fontSize: 20,
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
    balanceAmount: {
        marginVertical: 32,
    },
    balanceNumber: {
        fontSize: 30,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -1,
    },
    balanceFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    incomeLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginBottom: 4,
    },
    incomeAmount: {
        fontSize: 14,
        fontWeight: "700",
        color: "#10B981",
    },
    reportButton: {
        backgroundColor: "#1E1E24",
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
        fontWeight: "600",
    },
    section: {
        marginBottom: 32,
    },
    lastSection: {
        marginBottom: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FF5A36",
    },
    servicesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    serviceButton: {
        backgroundColor: "#FFFFFF",
        width: "48%",
        padding: 12,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    serviceIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F9FAFB",
        alignItems: "center",
        justifyContent: "center",
    },
    serviceLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        flex: 1,
    },
    agendaCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 16,
        flexDirection: "row",
        gap: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    agendaDate: {
        backgroundColor: "rgba(255, 90, 54, 0.1)",
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    agendaDay: {
        fontSize: 10,
        fontWeight: "700",
        color: "#FF5A36",
        textTransform: "uppercase",
    },
    agendaNumber: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FF5A36",
    },
    agendaContent: {
        flex: 1,
    },
    agendaTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
    },
    agendaTime: {
        fontSize: 12,
        color: "#9CA3AF",
        marginBottom: 8,
    },
    participantsRow: {
        flexDirection: "row",
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#E5E7EB",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    avatarOverlap: {
        marginLeft: -8,
    },
    avatarMore: {
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarMoreText: {
        fontSize: 8,
        fontWeight: "700",
        color: "#6B7280",
    },
});
