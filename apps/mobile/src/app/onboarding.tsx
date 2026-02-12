import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HERO_IMAGE_URI =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAL5JKMafUfB9AzUv0dppkNfGIAXIYiWdzMfKo0yKOmVMHUhm3CEbRCez-NePfJxUSWejqHP71XfHm4twOXJbWgcBytjg72o_dCy1OQ0Rwh84kvGxlKsM938IWv9BS6CgvggUfyLl6DcyryN67fq07YffDbGKb-6Tr-Qi4XXIzpnkHxcJVJarMMoEh7KPPV7Z-6VaVNHcXRiuaK0819BFk757w08DfM-BO1tN_5W5vSC1iMWBo0hu1Yf1mcagaHGQdq-WPW0pJZ8V09";
const AVATAR_TOP_URI =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAu5oaE5skHCH_ljCn8kXNac147leLU5fA81xj_b-UZS-H3HdBLVySwoJ5p9XE8dpQxja1iX3nffgG9O4wfQOyQqWUB0Wz0ojpWIiMtaG_OXIe2trFtmSEIORzPrSIc02-02JSPR4-zvrZsxP3h22K-LA9BgGEVdSt3THr8L4oJ38FN98VqTHHz4OVWP8x5oncLT3vQ_FmAD9dWkJNYxFh4q5FcfrHflb9t_8kQg9fSmmn9QGRf-ydB5zu2FLVNM5LelTSuQXzRalfA";
const AVATAR_RIGHT_URI =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAISIg_Wrk9F4tKwyukLZHkXj9us6ydESFJLvrvRsIfISozzwmMlWbSkCpkzDNK6mXZYGjuwc9lvHXBZN5tgscH6GLcm6cSsSecy4o4o2SjIfR9A0ue9zttgPhYn-zFOLW6O4DBlXX2Woa2JF9j3xBvpiJAfTpG0VVEadfNeHeKFdYnmWwmj49OSDXjG13eJCP35FhqYE2xe91Unmm5eTdG48TGvH47KLsJIM-Xky_TNAN2R078Tq5RDVa6AhGafZeUXNgxscE6TW_n";
const AVATAR_LEFT_URI =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD4sWeorlFCuCOWBLI54RKr11gr1pH5XUch9IT328jT2-8Mhi-kxwddFILgVeSctzVIzhd7iSMD4YOX1XIU2xUp8WKg04vYBVgEFHnVjE-4hEpwcXLCcOApt1JilPppmSh8hXVmf1ncDWBehooCHWnhwTIW8q3Hwu9KoZkSWDCgVPJQvFhnKgNi0GUmetUVtgPdzDE9Ig41_SwukS6HUDgRzZ-DKW9K-yanSMmmqbvVvEg8aSRMW-ZaBAl7c7RSd7Ym5CoNsorxfjWj";

export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: screenWidth } = useWindowDimensions();
    const slidesRef = useRef<ScrollView | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const goToMainApp = () => {
        router.replace("/login");
    };

    const goToSlide = (index: number) => {
        slidesRef.current?.scrollTo({
            x: index * screenWidth,
            animated: true,
        });
    };

    const goNext = () => {
        if (currentSlide < 3) {
            goToSlide(currentSlide + 1);
            return;
        }

        goToMainApp();
    };

    const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        if (nextIndex !== currentSlide) {
            setCurrentSlide(nextIndex);
        }
    };

    const pagination = (
        <View style={styles.paginationRow}>
            <View style={currentSlide === 0 ? styles.paginationActive : styles.paginationDot} />
            <View style={currentSlide === 1 ? styles.paginationActive : styles.paginationDot} />
            <View style={currentSlide === 2 ? styles.paginationActive : styles.paginationDot} />
            <View style={currentSlide === 3 ? styles.paginationActive : styles.paginationDot} />
        </View>
    );

    return (
        <View style={[styles.container, currentSlide !== 0 ? styles.containerSlideTwo : null]}>
            <StatusBar style="dark" />

            <ScrollView
                ref={slidesRef}
                horizontal
                pagingEnabled
                bounces={false}
                overScrollMode="never"
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                onMomentumScrollEnd={onMomentumScrollEnd}
                scrollEventThrottle={16}
            >
                <View style={[styles.slidePage, { width: screenWidth }]}>
                    <View style={[styles.topBackground, { paddingTop: insets.top + 10 }]}>
                        <View style={styles.skipRow}>
                            <TouchableOpacity activeOpacity={0.8} onPress={goToMainApp}>
                                <Text style={styles.skipText}>Lewati</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.heroWrap}>
                            <LinearGradient
                                colors={["#87A97D", "#95B78A"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroGradient}
                            >
                                <Image source={{ uri: HERO_IMAGE_URI }} style={styles.heroImage} resizeMode="cover" />
                            </LinearGradient>

                            <View style={styles.heroBadge}>
                                <Ionicons name="leaf" size={17} color="#F2930D" />
                                <Ionicons name="heart" size={13} color="#F2930D" style={styles.heroBadgeHeart} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.bottomContent}>
                        <Text style={styles.title}>Warga Bersatu,{"\n"}Lingkungan Maju</Text>
                        <Text style={styles.subtitle}>
                            Terhubung dengan tetangga dan{"\n"}kelola kebutuhan RT/RW dalam{"\n"}satu wadah yang hangat.
                        </Text>

                        {pagination}

                        <TouchableOpacity style={styles.startButton} activeOpacity={0.9} onPress={goNext}>
                            <Text style={styles.startButtonText}>Mulai</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.slidePage, { width: screenWidth }]}>
                    <View style={[styles.slideTwoContainer, { paddingTop: insets.top + 12 }]}>
                        <LinearGradient
                            colors={["rgba(242,147,13,0.16)", "rgba(242,147,13,0.02)", "rgba(242,147,13,0)"]}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.slideTwoBackdrop}
                        />

                        <View style={styles.skipRow}>
                            <TouchableOpacity activeOpacity={0.8} onPress={goToMainApp}>
                                <Text style={styles.skipText}>Lewati</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.slideTwoVisual}>
                            <View style={styles.balanceCard}>
                                <View style={styles.balanceCardTop}>
                                    <Text style={styles.balanceCardLabel}>KAS RT 05/02</Text>
                                    <View style={styles.balanceCardBadge}>
                                        <Text style={styles.balanceCardBadgeText}>Transparan</Text>
                                    </View>
                                </View>
                                <Text style={styles.balanceCardAmount}>Rp 15.450.000</Text>
                                <View style={styles.balanceCardProgressTrack}>
                                    <View style={styles.balanceCardProgressFill} />
                                </View>
                            </View>

                            <View style={styles.transactionCard}>
                                <View style={styles.transactionRow}>
                                    <View style={[styles.transactionIconWrap, styles.transactionIconBlue]}>
                                        <Ionicons name="water-outline" size={14} color="#3B82F6" />
                                    </View>
                                    <View style={styles.transactionTextWrap}>
                                        <Text style={styles.transactionTitle}>Iuran Sampah</Text>
                                        <Text style={styles.transactionMeta}>Senin, 12 Okt</Text>
                                    </View>
                                    <Text style={styles.transactionAmountNegative}>-25rb</Text>
                                </View>

                                <View style={styles.transactionRow}>
                                    <View style={[styles.transactionIconWrap, styles.transactionIconGreen]}>
                                        <Ionicons name="wallet-outline" size={14} color="#22C55E" />
                                    </View>
                                    <View style={styles.transactionTextWrap}>
                                        <Text style={styles.transactionTitle}>Iuran Bulanan</Text>
                                        <Text style={styles.transactionMeta}>Bapak Budi</Text>
                                    </View>
                                    <Text style={styles.transactionAmountPositive}>+50rb</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.slideTwoTextBlock}>
                            <Text style={styles.title}>Transparansi{"\n"}Dana Warga</Text>
                            <Text style={styles.subtitle}>
                                Pantau pembayaran iuran dan{"\n"}pengeluaran lingkungan secara{"\n"}real-time. Tanpa angka{"\n"}tersembunyi.
                            </Text>
                        </View>

                        <View style={styles.slideTwoBottom}>
                            {pagination}

                            <TouchableOpacity style={styles.startButton} activeOpacity={0.9} onPress={goNext}>
                                <Text style={styles.startButtonText}>Lanjut</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={[styles.slidePage, { width: screenWidth }]}>
                    <View style={[styles.slideThreeContainer, { paddingTop: insets.top + 12 }]}>
                        <LinearGradient
                            colors={["rgba(242,147,13,0.14)", "rgba(242,147,13,0)"]}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 0.8, y: 1 }}
                            style={styles.slideThreeBackdropTop}
                        />
                        <LinearGradient
                            colors={["rgba(242,147,13,0.10)", "rgba(242,147,13,0)"]}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.slideThreeBackdropBottom}
                        />

                        <View style={styles.skipRow}>
                            <TouchableOpacity activeOpacity={0.8} onPress={goToMainApp}>
                                <Text style={styles.skipText}>Lewati</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.slideThreeTimeline}>
                            <View style={styles.timelineConnector} />

                            <View style={styles.timelineRow}>
                                <View style={[styles.timelineNode, styles.timelineNodeMuted]}>
                                    <Ionicons name="send" size={18} color="#C7CBD1" />
                                </View>
                                <View style={[styles.timelineCard, styles.timelineCardMuted]}>
                                    <Text style={styles.timelineTitleMuted}>Laporan Terkirim</Text>
                                    <Text style={styles.timelineMetaMuted}>10:00 AM - Lampu Jalan Mati</Text>
                                </View>
                            </View>

                            <View style={styles.timelineRow}>
                                <View style={[styles.timelineNode, styles.timelineNodeActive]}>
                                    <Ionicons name="sync" size={18} color="#FFFFFF" />
                                </View>
                                <View style={[styles.timelineCard, styles.timelineCardActive]}>
                                    <View style={styles.timelineActiveHeader}>
                                        <Text style={styles.timelineTitleActive}>Sedang Proses</Text>
                                        <View style={styles.timelineBadge}>
                                            <Text style={styles.timelineBadgeText}>Baru saja</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.timelineMetaActive}>Petugas sedang menuju lokasi untuk perbaikan.</Text>
                                </View>
                            </View>

                            <View style={styles.timelineRow}>
                                <View style={[styles.timelineNode, styles.timelineNodeMuted]}>
                                    <Ionicons name="checkmark" size={18} color="#C7CBD1" />
                                </View>
                                <View style={[styles.timelineCard, styles.timelineCardMuted]}>
                                    <Text style={styles.timelineTitleMuted}>Selesai</Text>
                                    <Text style={styles.timelineMetaMuted}>Menunggu konfirmasi</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.slideThreeTextBlock}>
                            <Text style={styles.title}>Lapor Cepat,{"\n"}Respon Tepat</Text>
                            <Text style={styles.subtitle}>
                                Laporkan masalah sampah,{"\n"}keamanan, atau infrastruktur{"\n"}dan pantau penyelesaiannya{"\n"}secara langsung.
                            </Text>
                        </View>

                        <View style={styles.slideTwoBottom}>
                            {pagination}

                            <TouchableOpacity style={styles.startButton} activeOpacity={0.9} onPress={goNext}>
                                <Text style={styles.startButtonText}>Lanjut</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={[styles.slidePage, { width: screenWidth }]}>
                    <View style={[styles.slideFourContainer, { paddingTop: insets.top + 22 }]}>
                        <LinearGradient
                            colors={["rgba(242,147,13,0.10)", "rgba(242,147,13,0)"]}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={styles.slideFourBackdrop}
                        />

                        <View style={styles.slideFourSpacer} />

                        <View style={styles.communityGraphWrap}>
                            <View style={styles.graphOuterRing} />
                            <View style={[styles.graphLine, styles.graphLineTop]} />
                            <View style={[styles.graphLine, styles.graphLineLeft]} />
                            <View style={[styles.graphLine, styles.graphLineRight]} />

                            <View style={styles.graphCenterNode}>
                                <Ionicons name="home" size={36} color="#FFFFFF" />
                                <View style={styles.graphCheckBadge}>
                                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                                </View>
                            </View>

                            <Image source={{ uri: AVATAR_TOP_URI }} style={[styles.graphAvatar, styles.graphAvatarTop]} />
                            <Image source={{ uri: AVATAR_LEFT_URI }} style={[styles.graphAvatarSmall, styles.graphAvatarLeft]} />
                            <Image source={{ uri: AVATAR_RIGHT_URI }} style={[styles.graphAvatarSmall, styles.graphAvatarRight]} />

                            <View style={styles.graphBottomDot} />
                        </View>

                        <View style={styles.verifiedBadge}>
                            <Ionicons name="shield-checkmark" size={14} color="#15803D" />
                            <Text style={styles.verifiedBadgeText}>Terverifikasi Resmi RT/RW</Text>
                        </View>

                        <View style={styles.slideFourTextBlock}>
                            <Text style={styles.title}>Kepercayaan{"\n"}Adalah Kunci</Text>
                            <Text style={styles.subtitle}>
                                Bergabung dengan komunitas{"\n"}tetangga yang terverifikasi.{"\n"}Aman, nyaman, dan diakui resmi.
                            </Text>
                        </View>

                        <View style={styles.slideTwoBottom}>
                            {pagination}

                            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={goNext}>
                                <Text style={styles.primaryButtonText}>Gabung Sekarang</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ECECEC",
    },
    slidePage: {
        flex: 1,
    },
    containerSlideTwo: {
        backgroundColor: "#ECECEC",
    },
    topBackground: {
        flex: 0.56,
        backgroundColor: "#E7DBC6",
        paddingHorizontal: 22,
    },
    skipRow: {
        alignItems: "flex-end",
        marginBottom: 16,
    },
    skipText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#6B7280",
    },
    heroWrap: {
        marginTop: 18,
        borderRadius: 44,
        position: "relative",
    },
    heroGradient: {
        borderRadius: 44,
        padding: 12,
        height: 250,
        overflow: "hidden",
    },
    heroImage: {
        width: "100%",
        height: "100%",
        borderRadius: 36,
        opacity: 0.92,
    },
    heroBadge: {
        position: "absolute",
        right: 10,
        bottom: 10,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(255,255,255,0.92)",
        alignItems: "center",
        justifyContent: "center",
    },
    heroBadgeHeart: {
        position: "absolute",
        right: 12,
        top: 12,
    },
    bottomContent: {
        flex: 0.44,
        paddingHorizontal: 24,
        paddingTop: 18,
        paddingBottom: 20,
        justifyContent: "space-between",
    },
    title: {
        fontSize: 46 - 5,
        lineHeight: 46,
        fontWeight: "900",
        color: "#111827",
        letterSpacing: -0.6,
    },
    subtitle: {
        marginTop: 8,
        fontSize: 33 - 11,
        lineHeight: 35,
        color: "#6B7280",
        fontWeight: "700",
    },
    paginationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        marginTop: 10,
    },
    paginationActive: {
        width: 26,
        height: 6,
        borderRadius: 999,
        backgroundColor: "#F2930D",
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 999,
        backgroundColor: "#C4C9D2",
    },
    startButton: {
        marginTop: 12,
        backgroundColor: "#040404",
        borderRadius: 999,
        height: 56,
        paddingHorizontal: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    startButtonText: {
        color: "#FFFFFF",
        fontSize: 24 - 7,
        fontWeight: "800",
        marginLeft: 2,
    },
    slideTwoContainer: {
        flex: 1,
        paddingHorizontal: 24,
        overflow: "hidden",
    },
    slideTwoBackdrop: {
        position: "absolute",
        right: -80,
        top: -100,
        width: 300,
        height: 300,
        borderRadius: 160,
    },
    slideTwoVisual: {
        marginTop: 24,
        paddingHorizontal: 2,
        gap: 12,
    },
    balanceCard: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 14,
        transform: [{ rotate: "-1.5deg" }],
        borderWidth: 1,
        borderColor: "#ECECEC",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    balanceCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    balanceCardLabel: {
        fontSize: 13 - 2,
        fontWeight: "800",
        color: "#9CA3AF",
        letterSpacing: 1.1,
    },
    balanceCardBadge: {
        backgroundColor: "#DCFCE7",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 999,
    },
    balanceCardBadgeText: {
        fontSize: 11 - 1,
        fontWeight: "800",
        color: "#16A34A",
    },
    balanceCardAmount: {
        fontSize: 41 - 8,
        fontWeight: "900",
        color: "#111827",
        letterSpacing: -0.4,
        marginBottom: 8,
    },
    balanceCardProgressTrack: {
        height: 6,
        borderRadius: 999,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
    },
    balanceCardProgressFill: {
        width: "75%",
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#F2930D",
    },
    transactionCard: {
        backgroundColor: "rgba(255,255,255,0.88)",
        borderRadius: 36,
        borderWidth: 1,
        borderColor: "#ECECEC",
        paddingHorizontal: 14,
        paddingVertical: 12,
        transform: [{ rotate: "1deg" }],
    },
    transactionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 4,
    },
    transactionIconWrap: {
        width: 29,
        height: 29,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    transactionIconBlue: {
        backgroundColor: "#E0EDFF",
    },
    transactionIconGreen: {
        backgroundColor: "#DDF7E7",
    },
    transactionTextWrap: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 23 - 7,
        fontWeight: "800",
        color: "#1F2937",
    },
    transactionMeta: {
        marginTop: 1,
        fontSize: 12,
        fontWeight: "700",
        color: "#9CA3AF",
    },
    transactionAmountNegative: {
        fontSize: 16 + 2,
        fontWeight: "900",
        color: "#111827",
    },
    transactionAmountPositive: {
        fontSize: 16 + 2,
        fontWeight: "900",
        color: "#22C55E",
    },
    slideTwoTextBlock: {
        marginTop: 42,
    },
    slideTwoBottom: {
        marginTop: "auto",
        paddingBottom: 20,
        gap: 14,
    },
    slideThreeContainer: {
        flex: 1,
        paddingHorizontal: 24,
        overflow: "hidden",
        backgroundColor: "#ECECEC",
    },
    slideThreeBackdropTop: {
        position: "absolute",
        left: 20,
        top: 76,
        width: 140,
        height: 140,
        borderRadius: 70,
    },
    slideThreeBackdropBottom: {
        position: "absolute",
        left: 0,
        bottom: 160,
        width: 250,
        height: 180,
        borderRadius: 100,
    },
    slideThreeTimeline: {
        marginTop: 26,
        position: "relative",
        paddingLeft: 6,
        gap: 12,
    },
    timelineConnector: {
        position: "absolute",
        left: 28,
        top: 18,
        bottom: 18,
        width: 1.5,
        backgroundColor: "#D9DCE1",
    },
    timelineRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    timelineNode: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
    },
    timelineNodeMuted: {
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        backgroundColor: "#F2F3F5",
    },
    timelineNodeActive: {
        backgroundColor: "#F2930D",
        borderWidth: 4,
        borderColor: "rgba(242,147,13,0.2)",
        shadowColor: "#F2930D",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 4,
    },
    timelineCard: {
        flex: 1,
        borderRadius: 28,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    timelineCardMuted: {
        backgroundColor: "rgba(248,248,249,0.85)",
        borderWidth: 1,
        borderColor: "#E9EBEF",
    },
    timelineCardActive: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#F1D5B1",
        shadowColor: "#F2930D",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 2,
    },
    timelineTitleMuted: {
        fontSize: 16,
        fontWeight: "800",
        color: "#D0D4DA",
    },
    timelineMetaMuted: {
        marginTop: 1,
        fontSize: 13,
        fontWeight: "600",
        color: "#D0D4DA",
    },
    timelineActiveHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    timelineTitleActive: {
        fontSize: 31 - 10,
        fontWeight: "900",
        color: "#1F2937",
    },
    timelineBadge: {
        backgroundColor: "#FDE8D3",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    timelineBadgeText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#E57D26",
    },
    timelineMetaActive: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 19,
        fontWeight: "700",
        color: "#6B7280",
    },
    slideThreeTextBlock: {
        marginTop: 34,
    },
    slideFourContainer: {
        flex: 1,
        paddingHorizontal: 24,
        overflow: "hidden",
        backgroundColor: "#ECECEC",
    },
    slideFourBackdrop: {
        position: "absolute",
        top: -40,
        left: 0,
        right: 0,
        height: 220,
    },
    slideFourSpacer: {
        height: 18,
    },
    communityGraphWrap: {
        height: 260,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    graphOuterRing: {
        position: "absolute",
        width: 198,
        height: 198,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: "rgba(242,147,13,0.28)",
        borderStyle: "dashed",
    },
    graphLine: {
        position: "absolute",
        height: 1,
        backgroundColor: "rgba(242,147,13,0.20)",
        width: 86,
    },
    graphLineTop: {
        transform: [{ rotate: "-90deg" }],
        top: 66,
    },
    graphLineLeft: {
        transform: [{ rotate: "-28deg" }],
        left: 62,
        top: 132,
    },
    graphLineRight: {
        transform: [{ rotate: "28deg" }],
        right: 62,
        top: 132,
    },
    graphCenterNode: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: "#F2930D",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#F2930D",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 7,
    },
    graphCheckBadge: {
        position: "absolute",
        right: 2,
        top: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#22C55E",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    graphAvatar: {
        position: "absolute",
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        top: 30,
    },
    graphAvatarSmall: {
        position: "absolute",
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        top: 124,
    },
    graphAvatarTop: {
        top: 14,
    },
    graphAvatarLeft: {
        left: 36,
    },
    graphAvatarRight: {
        right: 36,
    },
    graphBottomDot: {
        position: "absolute",
        bottom: 26,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#F2930D",
    },
    verifiedBadge: {
        alignSelf: "center",
        marginTop: -6,
        borderRadius: 999,
        backgroundColor: "#E6F7EC",
        borderWidth: 1,
        borderColor: "#C8EBD4",
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    verifiedBadgeText: {
        fontSize: 13,
        fontWeight: "800",
        color: "#15803D",
    },
    slideFourTextBlock: {
        marginTop: 22,
    },
    primaryButton: {
        marginTop: 12,
        backgroundColor: "#F2930D",
        borderRadius: 999,
        height: 56,
        paddingHorizontal: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#F2930D",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 5,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 24 - 7,
        fontWeight: "900",
        marginLeft: 2,
    },
});
