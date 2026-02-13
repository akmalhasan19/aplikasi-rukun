import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ApiError } from "../services/api";
import { type BackendSession, resetForgotPassword, sendForgotPasswordOtp, verifyForgotPasswordOtp } from "../services/auth";

type Step = "email" | "otp" | "reset";

type ValidationIssueLike = {
    path?: unknown;
    message?: unknown;
};

function extractValidationMessage(error: ApiError): string | null {
    if (!Array.isArray(error.details)) {
        return null;
    }

    for (const item of error.details) {
        if (!item || typeof item !== "object") {
            continue;
        }

        const issue = item as ValidationIssueLike;
        if (Array.isArray(issue.path) && issue.path[0] === "otpCode") {
            return typeof issue.message === "string" ? issue.message : "OTP Code tidak valid.";
        }

        if (Array.isArray(issue.path) && issue.path[0] === "password") {
            return typeof issue.message === "string" ? issue.message : "Kata sandi baru tidak valid.";
        }
    }

    return null;
}

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [recoverySession, setRecoverySession] = useState<BackendSession | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSendOtp = async () => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            setErrorMessage("Inputkan email akun anda.");
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            const response = await sendForgotPasswordOtp(normalizedEmail);
            setMessage(response.message);
            setOtpCode("");
            setRecoverySession(null);
            setNewPassword("");
            setConfirmPassword("");
            setStep("otp");
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(error.message);
                return;
            }
            setErrorMessage("Gagal mengirim OTP.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async () => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            setErrorMessage("Inputkan email akun anda.");
            return;
        }

        const normalizedOtp = otpCode.replace(/\D/g, "").slice(0, 10);
        if (normalizedOtp.length < 6 || normalizedOtp.length > 10) {
            setErrorMessage("OTP Code harus 6-10 digit angka.");
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            const authPayload = await verifyForgotPasswordOtp({
                email: normalizedEmail,
                otpCode: normalizedOtp,
            });

            if (!authPayload.session) {
                setErrorMessage("Session tidak tersedia. Coba lagi.");
                return;
            }

            setRecoverySession(authPayload.session);
            setStep("reset");
            setMessage("OTP berhasil diverifikasi. Silakan buat kata sandi baru.");
        } catch (error) {
            if (error instanceof ApiError) {
                const validationMessage = extractValidationMessage(error);
                if (validationMessage) {
                    setErrorMessage(validationMessage);
                    return;
                }
                setErrorMessage(error.message);
                return;
            }
            setErrorMessage("OTP tidak valid atau sudah kedaluwarsa.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async () => {
        if (!recoverySession) {
            setErrorMessage("Session reset password tidak ditemukan. Verifikasi OTP lagi.");
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage("Kata sandi minimal 6 karakter.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Konfirmasi kata sandi tidak sama.");
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            const response = await resetForgotPassword({
                password: newPassword,
                accessToken: recoverySession.access_token,
            });

            setMessage(response.message || "Password berhasil diperbarui. Silakan login dengan password baru.");
            setStep("email");
            setOtpCode("");
            setRecoverySession(null);
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            if (error instanceof ApiError) {
                const validationMessage = extractValidationMessage(error);
                if (validationMessage) {
                    setErrorMessage(validationMessage);
                    return;
                }

                setErrorMessage(error.message);
                return;
            }

            setErrorMessage("Gagal memperbarui password.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {step === "email" ? (
                    <>
                        <Text style={styles.label}>Inputkan email akun anda</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="nama@email.com"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isSubmitting}
                            style={styles.input}
                        />
                        <TouchableOpacity
                            style={[styles.button, isSubmitting ? styles.buttonDisabled : null]}
                            disabled={isSubmitting}
                            onPress={handleSendOtp}
                            activeOpacity={0.9}
                        >
                            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Kirim OTP</Text>}
                        </TouchableOpacity>
                    </>
                ) : step === "otp" ? (
                    <>
                        <Text style={styles.label}>Inputkan OTP Code</Text>
                        <TextInput
                            value={otpCode}
                            onChangeText={(value) => setOtpCode(value.replace(/\D/g, "").slice(0, 10))}
                            placeholder="OTP Code"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="number-pad"
                            maxLength={10}
                            editable={!isSubmitting}
                            style={styles.input}
                        />
                        <TouchableOpacity
                            style={[styles.button, isSubmitting ? styles.buttonDisabled : null]}
                            disabled={isSubmitting}
                            onPress={handleVerifyOtp}
                            activeOpacity={0.9}
                        >
                            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Verifikasi OTP</Text>}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.label}>Buat kata sandi baru</Text>
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Kata sandi baru"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isSubmitting}
                            style={styles.input}
                        />
                        <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Konfirmasi kata sandi baru"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isSubmitting}
                            style={styles.input}
                        />
                        <TouchableOpacity
                            style={[styles.button, isSubmitting ? styles.buttonDisabled : null]}
                            disabled={isSubmitting}
                            onPress={handleResetPassword}
                            activeOpacity={0.9}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Simpan Password Baru</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {message ? <Text style={styles.messageText}>{message}</Text> : null}
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                <TouchableOpacity disabled={isSubmitting} onPress={() => router.replace("/login")} activeOpacity={0.8}>
                    <Text style={styles.backText}>Kembali ke Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    content: {
        width: "100%",
        maxWidth: 420,
        gap: 14,
    },
    label: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 16,
        color: "#111827",
        backgroundColor: "#F9FAFB",
    },
    button: {
        height: 50,
        borderRadius: 12,
        backgroundColor: "#111827",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "800",
    },
    messageText: {
        fontSize: 13,
        color: "#065F46",
        fontWeight: "700",
    },
    errorText: {
        fontSize: 13,
        color: "#B91C1C",
        fontWeight: "700",
    },
    backText: {
        fontSize: 14,
        color: "#4B5563",
        fontWeight: "700",
    },
});
