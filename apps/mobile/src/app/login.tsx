import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
import { fetchMe, loginWithBackend, loginWithGoogle, persistSession, registerWithBackend } from "../services/auth";

const AUTH_HERO_URI =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDzssszQGsaRBh_KJwrhTISHHX_vheuzB0VO0O2C48ahRDMSokWbaRBLkVtr3EgvW-WiJVaZTVLxJxTvvoDphmt9L6faMHghF-UcLdprwfQuAHdqwkc5ItRjfRl07B8pDlYVxMtefBj6BttEmaNaxC73hMgIIzsCUoR9W0BdRfp4vam98tx3-mKOCidcfv90XTkdN2-EiJP1_BT_tLd0QYjR9PQ23qUVWkMpDlfjf4UIm3tfyC0W0tBpHgG4e5-U1kKXmNYQ1U5RYQZ";
const GOOGLE_ICON_URI = "https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png";
const ENABLE_GOOGLE_LOGIN = false;

type AuthTab = "login" | "register";
const PASSWORD_RESET_SUCCESS_NOTICE = "password-reset-success";
type ValidationIssueLike = {
    path?: unknown;
    message?: unknown;
};

const LOGIN_DICTIONARY = {
    id: {
        hero: {
            titlePrefix: "Sapa Warga",
            titleAccent: "RT/RW",
            subtitle: "Jadilah bagian dari komunitas yang aman,\nnyaman, dan saling peduli.",
        },
        tabs: {
            login: "Masuk",
            register: "Daftar",
        },
        loginForm: {
            emailLabel: "EMAIL",
            emailPlaceholder: "nama@email.com",
            passwordLabel: "KATA SANDI",
            passwordPlaceholder: "********",
            forgotPassword: "Lupa Password?",
        },
        registerForm: {
            nameLabel: "Nama Lengkap",
            namePlaceholder: "Contoh: Budi Santoso",
            emailLabel: "Email",
            emailPlaceholder: "nama@email.com",
            phoneLabel: "Nomor WhatsApp",
            phonePlaceholder: "0812xxxx",
            regionLabel: "Pilih Wilayah RT/RW",
            regionPlaceholder: "Ketuk untuk pilih RT Anda...",
            helpText: "Tidak tahu RT Anda? ",
            helpLink: "Tanya Admin",
            passwordLabel: "Kata Sandi",
            passwordPlaceholder: "Minimal 6 karakter",
        },
        actions: {
            processing: "Memproses...",
            loginNow: "Masuk Sekarang",
            registerNow: "Daftar Sekarang",
        },
        social: {
            divider: "ATAU MASUK DENGAN",
            google: "Google",
        },
        accountPrompt: {
            noAccount: "Belum punya akun? ",
            registerCitizen: "Daftar Warga",
            alreadyRegistered: "Sudah jadi warga terdaftar? ",
            login: "Login",
        },
        errors: {
            loginRequired: "Email dan kata sandi wajib diisi.",
            loginSessionMissing: "Session login tidak tersedia. Coba lagi.",
            loginEmailInvalid: "Format email tidak valid.",
            loginPasswordInvalid: "Kata sandi minimal 6 karakter.",
            loginFailed: "Gagal masuk. Periksa koneksi dan coba lagi.",
            registerRequired: "Nama, email, dan kata sandi wajib diisi.",
            registerNameInvalid: "Nama minimal 2 karakter.",
            registerEmailInvalid: "Format email tidak valid.",
            registerPhoneInvalid: "Nomor WhatsApp harus berisi 8-30 digit.",
            registerPasswordInvalid: "Kata sandi minimal 6 karakter.",
            registerCheckEmail: "Akun berhasil dibuat. Cek email verifikasi lalu login.",
            registerFailed: "Gagal daftar. Periksa koneksi dan coba lagi.",
            googleSessionMissing: "Session Google tidak tersedia. Coba lagi.",
            googleFailed: "Gagal masuk dengan Google. Coba lagi.",
            validationGeneric: "Data belum valid. Mohon periksa input kamu.",
        },
        success: {
            passwordReset: "Password berhasil direset. Silakan login dengan kata sandi baru.",
        },
    },
} as const;

const parseTabParam = (value: string | string[] | undefined): AuthTab => {
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized === "register" || normalized === "daftar") {
        return "register";
    }

    return "login";
};

const parseSingleParam = (value: string | string[] | undefined) => {
    return Array.isArray(value) ? value[0] : value;
};

const resolveValidationField = (rawIssue: ValidationIssueLike): string | null => {
    if (!Array.isArray(rawIssue.path) || rawIssue.path.length === 0) {
        return null;
    }

    const field = rawIssue.path[0];
    return typeof field === "string" ? field : null;
};

const resolveValidationMessage = (error: ApiError, tab: AuthTab, t: (typeof LOGIN_DICTIONARY)["id"]) => {
    if (Array.isArray(error.details)) {
        for (const item of error.details) {
            if (!item || typeof item !== "object") {
                continue;
            }

            const issue = item as ValidationIssueLike;
            const field = resolveValidationField(issue);

            if (field === "email") {
                return tab === "login" ? t.errors.loginEmailInvalid : t.errors.registerEmailInvalid;
            }

            if (field === "password") {
                return tab === "login" ? t.errors.loginPasswordInvalid : t.errors.registerPasswordInvalid;
            }

            if (field === "name") {
                return t.errors.registerNameInvalid;
            }

            if (field === "phone") {
                return t.errors.registerPhoneInvalid;
            }

            if (typeof issue.message === "string" && issue.message.trim().length > 0) {
                return issue.message;
            }
        }
    }

    if (error.message === "Validation error") {
        return t.errors.validationGeneric;
    }

    return error.message;
};

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { tab, notice } = useLocalSearchParams<{ tab?: string | string[]; notice?: string | string[] }>();
    const t = LOGIN_DICTIONARY.id;

    const [activeTab, setActiveTab] = useState<AuthTab>(() => parseTabParam(tab));

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false);

    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPhone, setRegisterPhone] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [isRegisterPasswordVisible, setIsRegisterPasswordVisible] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const parsedTab = parseTabParam(tab);
        setActiveTab((currentTab) => (currentTab === parsedTab ? currentTab : parsedTab));
    }, [tab]);

    useEffect(() => {
        const parsedNotice = parseSingleParam(notice);
        if (parsedNotice === PASSWORD_RESET_SUCCESS_NOTICE) {
            setActiveTab("login");
            setErrorMessage(null);
            setSuccessMessage(t.success.passwordReset);
            return;
        }

        setSuccessMessage(null);
    }, [notice, t.success.passwordReset]);

    const selectTab = (nextTab: AuthTab) => {
        if (isSubmitting || nextTab === activeTab) {
            return;
        }

        setErrorMessage(null);
        setSuccessMessage(null);
        setActiveTab(nextTab);
    };

    const handleLogin = async () => {
        if (!loginEmail.trim() || !loginPassword.trim()) {
            setErrorMessage(t.errors.loginRequired);
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            setSuccessMessage(null);

            const authPayload = await loginWithBackend({
                email: loginEmail.trim(),
                password: loginPassword,
            });

            if (!authPayload.session) {
                setErrorMessage(t.errors.loginSessionMissing);
                return;
            }

            await persistSession(authPayload.session);
            await fetchMe(authPayload.session.access_token);
            router.replace("/(tabs)");
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(resolveValidationMessage(error, "login", t));
                return;
            }

            setErrorMessage(t.errors.loginFailed);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = async () => {
        if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
            setErrorMessage(t.errors.registerRequired);
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            setSuccessMessage(null);

            const authPayload = await registerWithBackend({
                name: registerName.trim(),
                email: registerEmail.trim(),
                password: registerPassword,
                phone: registerPhone.trim() || undefined,
            });

            if (!authPayload.session) {
                setErrorMessage(t.errors.registerCheckEmail);
                return;
            }

            await persistSession(authPayload.session);
            await fetchMe(authPayload.session.access_token);
            router.replace("/(tabs)");
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(resolveValidationMessage(error, "register", t));
                return;
            }

            setErrorMessage(t.errors.registerFailed);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            setSuccessMessage(null);

            const authPayload = await loginWithGoogle();
            if (!authPayload.session) {
                setErrorMessage(t.errors.googleSessionMissing);
                return;
            }

            await persistSession(authPayload.session);
            await fetchMe(authPayload.session.access_token);
            router.replace("/(tabs)");
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(resolveValidationMessage(error, "login", t));
                return;
            }

            setErrorMessage(t.errors.googleFailed);
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
                            {t.hero.titlePrefix} <Text style={styles.titleAccent}>{t.hero.titleAccent}</Text>
                        </Text>
                        <Text style={styles.subtitle}>{t.hero.subtitle}</Text>

                        <View style={styles.segmentRow}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={[styles.segmentButton, activeTab === "login" ? styles.segmentButtonActive : null]}
                                onPress={() => selectTab("login")}
                                disabled={isSubmitting}
                            >
                                <Text style={[styles.segmentText, activeTab === "login" ? styles.segmentTextActive : null]}>
                                    {t.tabs.login}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[styles.segmentButton, activeTab === "register" ? styles.segmentButtonActive : null]}
                                onPress={() => selectTab("register")}
                                disabled={isSubmitting}
                            >
                                <Text style={[styles.segmentText, activeTab === "register" ? styles.segmentTextActive : null]}>
                                    {t.tabs.register}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formBlock}>
                            {activeTab === "login" ? (
                                <>
                                    <Text style={styles.fieldLabel}>{t.loginForm.emailLabel}</Text>
                                    <View style={styles.inputWrap}>
                                        <Ionicons name="mail-outline" size={24} color="#E2A445" />
                                        <TextInput
                                            placeholder={t.loginForm.emailPlaceholder}
                                            placeholderTextColor="#9AA3B1"
                                            style={styles.textInput}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            value={loginEmail}
                                            onChangeText={setLoginEmail}
                                            editable={!isSubmitting}
                                        />
                                    </View>

                                    <Text style={styles.fieldLabel}>{t.loginForm.passwordLabel}</Text>
                                    <View style={styles.inputWrap}>
                                        <Ionicons name="lock-closed-outline" size={24} color="#E2A445" />
                                        <TextInput
                                            placeholder={t.loginForm.passwordPlaceholder}
                                            placeholderTextColor="#9AA3B1"
                                            style={styles.textInput}
                                            secureTextEntry={!isLoginPasswordVisible}
                                            value={loginPassword}
                                            onChangeText={setLoginPassword}
                                            editable={!isSubmitting}
                                        />
                                        <TouchableOpacity
                                            style={styles.trailingIconButton}
                                            onPress={() => setIsLoginPasswordVisible((value) => !value)}
                                            activeOpacity={0.8}
                                            disabled={isSubmitting}
                                        >
                                            <Ionicons
                                                name={isLoginPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                                size={24}
                                                color="#A2A9B6"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={styles.forgotRow}
                                        disabled={isSubmitting}
                                        onPress={() => router.push("/forgot-password")}
                                    >
                                        <Text style={styles.forgotText}>{t.loginForm.forgotPassword}</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.fieldLabel}>{t.registerForm.nameLabel}</Text>
                                    <View style={styles.inputWrap}>
                                        <Ionicons name="person" size={24} color="#E2A445" />
                                        <TextInput
                                            placeholder={t.registerForm.namePlaceholder}
                                            placeholderTextColor="#9AA3B1"
                                            style={styles.textInput}
                                            value={registerName}
                                            onChangeText={setRegisterName}
                                            editable={!isSubmitting}
                                        />
                                    </View>

                                    <Text style={styles.fieldLabel}>{t.registerForm.emailLabel}</Text>
                                    <View style={styles.inputWrap}>
                                        <Ionicons name="mail-outline" size={24} color="#E2A445" />
                                        <TextInput
                                            placeholder={t.registerForm.emailPlaceholder}
                                            placeholderTextColor="#9AA3B1"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            style={styles.textInput}
                                            value={registerEmail}
                                            onChangeText={setRegisterEmail}
                                            editable={!isSubmitting}
                                        />
                                    </View>

                                    <Text style={styles.fieldLabel}>{t.registerForm.phoneLabel}</Text>
                                    <View style={styles.inputWrap}>
                                        <Ionicons name="chatbox-outline" size={24} color="#E2A445" />
                                        <TextInput
                                            placeholder={t.registerForm.phonePlaceholder}
                                            placeholderTextColor="#9AA3B1"
                                            keyboardType="phone-pad"
                                            style={styles.textInput}
                                            value={registerPhone}
                                            onChangeText={setRegisterPhone}
                                            editable={!isSubmitting}
                                        />
                                    </View>

                                    <Text style={styles.fieldLabel}>{t.registerForm.regionLabel}</Text>
                                    <TouchableOpacity style={styles.inputWrap} activeOpacity={0.84} disabled>
                                        <Ionicons name="location-outline" size={24} color="#E2A445" />
                                        <Text style={styles.dropdownPlaceholder}>{t.registerForm.regionPlaceholder}</Text>
                                        <Ionicons name="chevron-down" size={24} color="#A2A9B6" />
                                    </TouchableOpacity>

                                    <View style={styles.helpRow}>
                                        <Text style={styles.helpText}>{t.registerForm.helpText}</Text>
                                        <TouchableOpacity activeOpacity={0.84} disabled={isSubmitting}>
                                            <Text style={styles.helpLink}>{t.registerForm.helpLink}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.fieldLabel}>{t.registerForm.passwordLabel}</Text>
                                    <View style={styles.inputWrap}>
                                        <Ionicons name="lock-closed-outline" size={24} color="#E2A445" />
                                        <TextInput
                                            placeholder={t.registerForm.passwordPlaceholder}
                                            placeholderTextColor="#9AA3B1"
                                            secureTextEntry={!isRegisterPasswordVisible}
                                            style={styles.textInput}
                                            value={registerPassword}
                                            onChangeText={setRegisterPassword}
                                            editable={!isSubmitting}
                                        />
                                        <TouchableOpacity
                                            style={styles.trailingIconButton}
                                            onPress={() => setIsRegisterPasswordVisible((value) => !value)}
                                            activeOpacity={0.8}
                                            disabled={isSubmitting}
                                        >
                                            <Ionicons
                                                name={isRegisterPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                                size={24}
                                                color="#A2A9B6"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>

                        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                        <TouchableOpacity
                            style={[styles.loginButton, isSubmitting ? styles.loginButtonDisabled : null]}
                            activeOpacity={0.9}
                            onPress={activeTab === "login" ? handleLogin : handleRegister}
                            disabled={isSubmitting}
                        >
                            <LinearGradient
                                colors={["#EE9D2B", "#F79D39"]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.loginButtonGradient}
                            >
                                <Text style={styles.loginButtonText}>
                                    {isSubmitting
                                        ? t.actions.processing
                                        : activeTab === "login"
                                          ? t.actions.loginNow
                                          : t.actions.registerNow}
                                </Text>
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {activeTab === "login" ? (
                            <>
                                {ENABLE_GOOGLE_LOGIN ? (
                                    <>
                                        <View style={styles.dividerRow}>
                                            <View style={styles.dividerLine} />
                                            <Text style={styles.dividerText}>{t.social.divider}</Text>
                                            <View style={styles.dividerLine} />
                                        </View>

                                        <TouchableOpacity
                                            style={styles.googleButton}
                                            activeOpacity={0.86}
                                            onPress={handleGoogleLogin}
                                            disabled={isSubmitting}
                                        >
                                            <Image source={{ uri: GOOGLE_ICON_URI }} style={styles.googleIcon} resizeMode="contain" />
                                            <Text style={styles.googleText}>{t.social.google}</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : null}

                                <View style={styles.registerRow}>
                                    <Text style={styles.registerText}>{t.accountPrompt.noAccount}</Text>
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => selectTab("register")}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.registerLink}>{t.accountPrompt.registerCitizen}</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <View style={styles.registerRow}>
                                <Text style={styles.registerText}>{t.accountPrompt.alreadyRegistered}</Text>
                                <TouchableOpacity activeOpacity={0.85} onPress={() => selectTab("login")} disabled={isSubmitting}>
                                    <Text style={styles.registerLink}>{t.accountPrompt.login}</Text>
                                </TouchableOpacity>
                            </View>
                        )}

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
        letterSpacing: 0.3,
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
    dropdownPlaceholder: {
        flex: 1,
        fontSize: 16,
        color: "#6B7280",
        fontWeight: "700",
    },
    trailingIconButton: {
        paddingLeft: 6,
        paddingVertical: 6,
    },
    helpRow: {
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    helpText: {
        fontSize: 14,
        color: "#5D6676",
        fontWeight: "700",
    },
    helpLink: {
        fontSize: 14,
        color: "#E49524",
        fontWeight: "800",
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
    successText: {
        marginTop: 14,
        fontSize: 13,
        color: "#065F46",
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
        height: 62,
        paddingHorizontal: 22,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    loginButtonText: {
        fontSize: 18,
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
        marginTop: 18,
        height: 56,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "#CED3DB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    googleIcon: {
        width: 22,
        height: 22,
    },
    googleText: {
        fontSize: 16,
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
