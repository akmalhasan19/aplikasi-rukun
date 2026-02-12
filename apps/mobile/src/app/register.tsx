import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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
import { fetchMe, persistSession, registerWithBackend } from "../services/auth";

export default function RegisterScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setErrorMessage("Nama, email, dan kata sandi wajib diisi.");
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);

            const authPayload = await registerWithBackend({
                name: name.trim(),
                email: email.trim(),
                password,
                phone: phone.trim() || undefined,
            });

            if (!authPayload.session) {
                setErrorMessage("Akun berhasil dibuat. Cek email verifikasi lalu login.");
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

            setErrorMessage("Gagal daftar. Periksa koneksi dan coba lagi.");
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
                        { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 28 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <LinearGradient
                        colors={["rgba(226,155,54,0.16)", "rgba(226,155,54,0)"]}
                        start={{ x: 0.2, y: 0 }}
                        end={{ x: 0.9, y: 1 }}
                        style={styles.topBlob}
                    />

                    <View style={styles.headerIconWrap}>
                        <Ionicons name="people" size={34} color="#E29B36" />
                    </View>

                    <Text style={styles.title}>Buat Akun Baru</Text>
                    <Text style={styles.subtitle}>
                        Bergabung dan mulai kelola{"\n"}lingkungan Anda bersama{"\n"}tetangga.
                    </Text>

                    <View style={styles.formBlock}>
                        <Text style={styles.fieldLabel}>Nama Lengkap</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="person" size={24} color="#98A0AE" />
                            <TextInput
                                placeholder="Contoh: Budi Santoso"
                                placeholderTextColor="#98A0AE"
                                style={styles.textInput}
                                value={name}
                                onChangeText={setName}
                                editable={!isSubmitting}
                            />
                        </View>

                        <Text style={styles.fieldLabel}>Email</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="mail-outline" size={23} color="#98A0AE" />
                            <TextInput
                                placeholder="nama@email.com"
                                placeholderTextColor="#98A0AE"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={styles.textInput}
                                value={email}
                                onChangeText={setEmail}
                                editable={!isSubmitting}
                            />
                        </View>

                        <Text style={styles.fieldLabel}>Nomor WhatsApp</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="chatbox" size={23} color="#98A0AE" />
                            <TextInput
                                placeholder="0812xxxx"
                                placeholderTextColor="#98A0AE"
                                keyboardType="phone-pad"
                                style={styles.textInput}
                                value={phone}
                                onChangeText={setPhone}
                                editable={!isSubmitting}
                            />
                        </View>

                        <Text style={styles.fieldLabel}>Pilih Wilayah RT/RW</Text>
                        <TouchableOpacity style={styles.inputWrap} activeOpacity={0.84} disabled>
                            <Ionicons name="location" size={24} color="#E29B36" />
                            <Text style={styles.dropdownPlaceholder}>Ketuk untuk pilih RT Anda...</Text>
                            <Ionicons name="chevron-down" size={26} color="#98A0AE" />
                        </TouchableOpacity>

                        <View style={styles.helpRow}>
                            <Text style={styles.helpText}>Tidak tahu RT Anda? </Text>
                            <TouchableOpacity activeOpacity={0.84} disabled={isSubmitting}>
                                <Text style={styles.helpLink}>Tanya Admin</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.fieldLabel}>Kata Sandi</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="lock-closed" size={23} color="#98A0AE" />
                            <TextInput
                                placeholder="Minimal 6 karakter"
                                placeholderTextColor="#98A0AE"
                                secureTextEntry={!isPasswordVisible}
                                style={styles.textInput}
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
                                    size={25}
                                    color="#98A0AE"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                    <TouchableOpacity
                        style={[styles.registerButton, isSubmitting ? styles.registerButtonDisabled : null]}
                        activeOpacity={0.9}
                        onPress={handleRegister}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <View style={styles.registerButtonInner}>
                                <Text style={styles.registerButtonText}>Memproses...</Text>
                                <ActivityIndicator color="#FFFFFF" />
                            </View>
                        ) : (
                            <Text style={styles.registerButtonText}>Daftar Sekarang</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>Sudah menjadi warga terdaftar?</Text>
                        <TouchableOpacity activeOpacity={0.82} onPress={() => router.replace("/login")} disabled={isSubmitting}>
                            <Text style={styles.loginLink}>
                                Masuk di sini <Ionicons name="arrow-forward" size={20} />
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.securityRow}>
                        <Ionicons name="shield-checkmark" size={17} color="#A7AEB9" />
                        <Text style={styles.securityText}>Data Anda aman & terlindungi</Text>
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
        paddingHorizontal: 24,
        position: "relative",
        overflow: "hidden",
    },
    topBlob: {
        position: "absolute",
        right: -80,
        top: -30,
        width: 260,
        height: 260,
        borderRadius: 130,
    },
    headerIconWrap: {
        alignSelf: "center",
        width: 116,
        height: 116,
        borderRadius: 58,
        backgroundColor: "#EFE3D0",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        marginTop: 22,
        textAlign: "center",
        fontSize: 34,
        fontWeight: "900",
        color: "#121B31",
        letterSpacing: -0.5,
    },
    subtitle: {
        marginTop: 14,
        textAlign: "center",
        fontSize: 20,
        lineHeight: 30,
        fontWeight: "700",
        color: "#4D586C",
    },
    formBlock: {
        marginTop: 22,
        gap: 4,
    },
    fieldLabel: {
        marginTop: 14,
        marginBottom: 10,
        fontSize: 16,
        fontWeight: "900",
        color: "#2C374B",
    },
    inputWrap: {
        height: 70,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "#D1D5DE",
        backgroundColor: "#EDEEF1",
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 17,
        color: "#3F4A5D",
        fontWeight: "700",
    },
    dropdownPlaceholder: {
        flex: 1,
        fontSize: 16,
        color: "#697386",
        fontWeight: "700",
    },
    trailingIconButton: {
        paddingVertical: 4,
        paddingLeft: 4,
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
        color: "#E29B36",
        fontWeight: "800",
    },
    errorText: {
        marginTop: 16,
        fontSize: 13,
        color: "#B91C1C",
        fontWeight: "700",
        textAlign: "center",
    },
    registerButton: {
        marginTop: 30,
        height: 72,
        borderRadius: 999,
        backgroundColor: "#E29B36",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#E29B36",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 5,
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonInner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    registerButtonText: {
        fontSize: 20,
        color: "#FFFFFF",
        fontWeight: "900",
    },
    loginRow: {
        marginTop: 38,
        alignItems: "center",
        gap: 6,
    },
    loginText: {
        fontSize: 15,
        color: "#425066",
        fontWeight: "700",
    },
    loginLink: {
        fontSize: 15,
        color: "#E29B36",
        fontWeight: "900",
    },
    securityRow: {
        marginTop: 34,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    securityText: {
        fontSize: 12,
        color: "#A7AEB9",
        fontWeight: "700",
    },
});
