import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
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
import { fetchMe, loginWithBackend, persistSession } from "../services/auth";

const AUTH_HERO_URI =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDzssszQGsaRBh_KJwrhTISHHX_vheuzB0VO0O2C48ahRDMSokWbaRBLkVtr3EgvW-WiJVaZTVLxJxTvvoDphmt9L6faMHghF-UcLdprwfQuAHdqwkc5ItRjfRl07B8pDlYVxMtefBj6BttEmaNaxC73hMgIIzsCUoR9W0BdRfp4vam98tx3-mKOCidcfv90XTkdN2-EiJP1_BT_tLd0QYjR9PQ23qUVWkMpDlfjf4UIm3tfyC0W0tBpHgG4e5-U1kKXmNYQ1U5RYQZ";
const GOOGLE_ICON_URI = "https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png";

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setErrorMessage("Email dan kata sandi wajib diisi.");
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);

            const authPayload = await loginWithBackend({
                email: email.trim(),
                password,
            });

            if (!authPayload.session) {
                setErrorMessage("Session login tidak tersedia. Coba lagi.");
                return;
            }

            await persistSession(authPayload.session);
            await fetchMe(authPayload.session.access_token);
            router.replace("/(tabs)");
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(error.message);
                return;
            }

            setErrorMessage("Gagal masuk. Periksa koneksi dan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.screen}>
            <StatusBar style="dark" />

            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.cardWrap}>
                        <LinearGradient
                            colors={["rgba(238,157,43,0.18)", "rgba(238,157,43,0)"]}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={styles.headerGlow}
                        />

                        <View style={styles.heroWrap}>
                            <Image source={{ uri: AUTH_HERO_URI }} style={styles.heroImage} resizeMode="cover" />
                        </View>

                        <Text style={styles.title}>
                            Sapa Warga <Text style={styles.titleAccent}>RT/RW</Text>
                        </Text>
                        <Text style={styles.subtitle}>
                            Jadilah bagian dari komunitas yang aman,{"\n"}
                            nyaman, dan saling peduli.
                        </Text>

                        <View style={styles.segmentRow}>
                            <TouchableOpacity activeOpacity={0.9} style={[styles.segmentButton, styles.segmentButtonActive]}>
                                <Text style={[styles.segmentText, styles.segmentTextActive]}>Masuk</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.segmentButton}
                                onPress={() => router.push("/register")}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.segmentText}>Daftar</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formBlock}>
                            <Text style={styles.fieldLabel}>EMAIL</Text>
                            <View style={styles.inputWrap}>
                                <Ionicons name="mail-outline" size={24} color="#E2A445" />
                                <TextInput
                                    placeholder="nama@email.com"
                                    placeholderTextColor="#9AA3B1"
                                    style={styles.textInput}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!isSubmitting}
                                />
                            </View>

                            <Text style={styles.fieldLabel}>KATA SANDI</Text>
                            <View style={styles.inputWrap}>
                                <Ionicons name="lock-closed-outline" size={24} color="#E2A445" />
                                <TextInput
                                    placeholder="********"
                                    placeholderTextColor="#9AA3B1"
                                    style={styles.textInput}
                                    secureTextEntry={!isPasswordVisible}
                                    value={password}
                                    onChangeText={setPassword}
                                    editable={!isSubmitting}
                                />
                                <TouchableOpacity
                                    style={styles.trailingIconButton}
                                    onPress={() => setIsPasswordVisible((value) => !value)}
                                    activeOpacity={0.8}
                                    disabled={isSubmitting}
                                >
                                    <Ionicons
                                        name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                        size={24}
                                        color="#A2A9B6"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity activeOpacity={0.8} style={styles.forgotRow} disabled={isSubmitting}>
                                <Text style={styles.forgotText}>Lupa Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                        <TouchableOpacity
                            style={[styles.loginButton, isSubmitting ? styles.loginButtonDisabled : null]}
                            activeOpacity={0.9}
                            onPress={handleLogin}
                            disabled={isSubmitting}
                        >
                            <LinearGradient
                                colors={["#EE9D2B", "#F79D39"]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.loginButtonGradient}
                            >
                                <Text style={styles.loginButtonText}>{isSubmitting ? "Memproses..." : "Masuk Sekarang"}</Text>
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>ATAU MASUK DENGAN</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity style={styles.googleButton} activeOpacity={0.86} disabled={isSubmitting}>
                            <Image source={{ uri: GOOGLE_ICON_URI }} style={styles.googleIcon} resizeMode="contain" />
                            <Text style={styles.googleText}>Google</Text>
                        </TouchableOpacity>

                        <View style={styles.registerRow}>
                            <Text style={styles.registerText}>Belum punya akun? </Text>
                            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/register")} disabled={isSubmitting}>
                                <Text style={styles.registerLink}>Daftar Warga</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomArc} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#ECECEC",
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 18,
    },
    cardWrap: {
        position: "relative",
        overflow: "hidden",
        borderRadius: 40,
        borderWidth: 5,
        borderColor: "#F5F5F6",
        backgroundColor: "#ECECEC",
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 18,
    },
    headerGlow: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 230,
        borderBottomLeftRadius: 44,
        borderBottomRightRadius: 44,
    },
    heroWrap: {
        borderRadius: 28,
        backgroundColor: "#E9DCC7",
        padding: 14,
        marginTop: 6,
        shadowColor: "#2A2A2A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    heroImage: {
        width: "100%",
        height: 230,
        borderRadius: 22,
    },
    title: {
        marginTop: 20,
        fontSize: 27,
        fontWeight: "900",
        color: "#121B31",
        textAlign: "center",
        letterSpacing: -0.5,
    },
    titleAccent: {
        color: "#E29324",
    },
    subtitle: {
        marginTop: 12,
        textAlign: "center",
        color: "#5F6879",
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "700",
    },
    segmentRow: {
        marginTop: 24,
        borderRadius: 999,
        backgroundColor: "#DFE1E6",
        padding: 6,
        flexDirection: "row",
        alignItems: "center",
    },
    segmentButton: {
        flex: 1,
        borderRadius: 999,
        paddingVertical: 11,
        alignItems: "center",
        justifyContent: "center",
    },
    segmentButtonActive: {
        backgroundColor: "#F3F4F6",
        shadowColor: "#121212",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    segmentText: {
        fontSize: 19,
        color: "#6B7280",
        fontWeight: "700",
    },
    segmentTextActive: {
        color: "#E49524",
        fontWeight: "800",
    },
    formBlock: {
        marginTop: 22,
    },
    fieldLabel: {
        marginTop: 14,
        marginBottom: 10,
        fontSize: 16,
        fontWeight: "900",
        color: "#3A445A",
        letterSpacing: 1,
    },
    inputWrap: {
        height: 70,
        borderRadius: 999,
        backgroundColor: "#E2E4E8",
        borderWidth: 1,
        borderColor: "#D6D9E0",
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 17,
        color: "#374151",
        fontWeight: "700",
    },
    trailingIconButton: {
        paddingLeft: 6,
        paddingVertical: 6,
    },
    forgotRow: {
        marginTop: 12,
        alignSelf: "flex-end",
    },
    forgotText: {
        fontSize: 15,
        color: "#E49524",
        fontWeight: "700",
    },
    errorText: {
        marginTop: 14,
        fontSize: 13,
        color: "#B91C1C",
        fontWeight: "700",
        textAlign: "center",
    },
    loginButton: {
        marginTop: 24,
        borderRadius: 999,
        overflow: "hidden",
        shadowColor: "#F3A42D",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.32,
        shadowRadius: 16,
        elevation: 5,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonGradient: {
        height: 74,
        paddingHorizontal: 26,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    loginButtonText: {
        fontSize: 21,
        color: "#FFFFFF",
        fontWeight: "900",
    },
    dividerRow: {
        marginTop: 22,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#CCD1D9",
    },
    dividerText: {
        fontSize: 12,
        color: "#9198A6",
        fontWeight: "700",
    },
    googleButton: {
        marginTop: 22,
        height: 68,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "#CED3DB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    googleIcon: {
        width: 28,
        height: 28,
    },
    googleText: {
        fontSize: 18,
        color: "#17233B",
        fontWeight: "800",
    },
    registerRow: {
        marginTop: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    registerText: {
        fontSize: 15,
        color: "#5D6676",
        fontWeight: "600",
    },
    registerLink: {
        fontSize: 15,
        color: "#E49524",
        fontWeight: "800",
    },
    bottomArc: {
        alignSelf: "center",
        marginTop: 12,
        width: "140%",
        height: 44,
        borderTopLeftRadius: 160,
        borderTopRightRadius: 160,
        backgroundColor: "#EDE7DB",
    },
});
