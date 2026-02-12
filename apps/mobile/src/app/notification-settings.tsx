import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NotifTypeKey = "iuran" | "layanan" | "pengumuman" | "darurat";
type ReminderOption = "H-7" | "H-3" | "H-1" | "Jatuh Tempo";

type NotifTypeItem = {
    key: NotifTypeKey;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
};

const NOTIF_TYPE_ITEMS: NotifTypeItem[] = [
    {
        key: "iuran",
        title: "Iuran Bulanan",
        subtitle: "Tagihan & konfirmasi bayar",
        icon: "receipt-outline",
        iconColor: "#FF7A50",
        iconBg: "#FFF1EC",
    },
    {
        key: "layanan",
        title: "Layanan Warga",
        subtitle: "Status permintaan surat",
        icon: "construct-outline",
        iconColor: "#FF7A50",
        iconBg: "#FFF1EC",
    },
    {
        key: "pengumuman",
        title: "Pengumuman",
        subtitle: "Berita RT/RW terbaru",
        icon: "megaphone-outline",
        iconColor: "#FF7A50",
        iconBg: "#FFF1EC",
    },
    {
        key: "darurat",
        title: "Darurat",
        subtitle: "Alert keamanan lingkungan",
        icon: "warning-outline",
        iconColor: "#FF7A50",
        iconBg: "#FFF1EC",
    },
];

const REMINDER_OPTIONS: ReminderOption[] = ["H-7", "H-3", "H-1", "Jatuh Tempo"];

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [notifTypeEnabled, setNotifTypeEnabled] = useState<Record<NotifTypeKey, boolean>>({
        iuran: true,
        layanan: true,
        pengumuman: true,
        darurat: true,
    });
    const [reminderOption, setReminderOption] = useState<ReminderOption>("H-7");
    const [silentMode, setSilentMode] = useState(false);

    const topPadding = 20;
    const bottomInsetPadding = insets.bottom + 16;

    const reminderLabelByOption = useMemo<Record<ReminderOption, string>>(
        () => ({
            "H-7": "7 Hari Sebelum (H-7)",
            "H-3": "3 Hari Sebelum (H-3)",
            "H-1": "1 Hari Sebelum (H-1)",
            "Jatuh Tempo": "Saat Jatuh Tempo",
        }),
        [],
    );

    const toggleNotifType = (key: NotifTypeKey) => {
        setNotifTypeEnabled((current) => ({
            ...current,
            [key]: !current[key],
        }));
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={["#FF7A50", "#FFB088"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.headerGradient, { paddingTop: topPadding }]}
            >
                <View style={styles.headerTopRow}>
                    <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.85} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerTextBlock}>
                    <Text style={styles.headerTitle}>Pengaturan Notifikasi</Text>
                    <Text style={styles.headerSubtitle}>Kelola preferensi pemberitahuan Anda</Text>
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
            >
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="options-outline" size={20} color="#FF7A50" />
                        <Text style={styles.sectionTitle}>Jenis Notifikasi</Text>
                    </View>

                    <View style={styles.card}>
                        {NOTIF_TYPE_ITEMS.map((item, index) => (
                            <View
                                key={item.key}
                                style={[
                                    styles.settingRow,
                                    index !== NOTIF_TYPE_ITEMS.length - 1 ? styles.settingRowDivider : null,
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.settingLeft}
                                    activeOpacity={0.85}
                                    onPress={() => toggleNotifType(item.key)}
                                >
                                    <View style={[styles.settingIconWrap, { backgroundColor: item.iconBg }]}>
                                        <Ionicons name={item.icon} size={20} color={item.iconColor} />
                                    </View>
                                    <View style={styles.settingTextWrap}>
                                        <Text style={styles.settingTitle}>{item.title}</Text>
                                        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                                    </View>
                                </TouchableOpacity>

                                <Switch
                                    value={notifTypeEnabled[item.key]}
                                    onValueChange={() => toggleNotifType(item.key)}
                                    trackColor={{ false: "#D1D5DB", true: "#FF7A50" }}
                                    thumbColor="#FFFFFF"
                                    ios_backgroundColor="#D1D5DB"
                                />
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="alarm-outline" size={20} color="#FF7A50" />
                        <Text style={styles.sectionTitle}>Frekuensi Reminder Iuran</Text>
                    </View>

                    <View style={styles.card}>
                        {REMINDER_OPTIONS.map((option) => {
                            const active = reminderOption === option;
                            return (
                                <TouchableOpacity
                                    key={option}
                                    activeOpacity={0.85}
                                    style={[styles.radioRow, active ? styles.radioRowActive : null]}
                                    onPress={() => setReminderOption(option)}
                                >
                                    <Text style={styles.radioLabel}>{reminderLabelByOption[option]}</Text>
                                    <Ionicons
                                        name={active ? "radio-button-on" : "radio-button-off"}
                                        size={21}
                                        color={active ? "#FF7A50" : "#9CA3AF"}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="moon-outline" size={20} color="#FF7A50" />
                        <Text style={styles.sectionTitle}>Mode Tenang</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingTextWrap}>
                                <Text style={styles.settingTitle}>Aktifkan Mode Tenang</Text>
                                <Text style={styles.settingSubtitle}>Heningkan notifikasi pada jam istirahat</Text>
                            </View>

                            <Switch
                                value={silentMode}
                                onValueChange={setSilentMode}
                                trackColor={{ false: "#D1D5DB", true: "#FF7A50" }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#D1D5DB"
                            />
                        </View>

                        <View style={styles.quietTimeRow}>
                            <View style={[styles.timeChip, !silentMode ? styles.timeChipDisabled : null]}>
                                <Text style={[styles.timeChipText, !silentMode ? styles.timeChipTextDisabled : null]}>22:00</Text>
                            </View>
                            <Text style={styles.quietBetweenText}>s/d</Text>
                            <View style={[styles.timeChip, !silentMode ? styles.timeChipDisabled : null]}>
                                <Text style={[styles.timeChipText, !silentMode ? styles.timeChipTextDisabled : null]}>06:00</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.bottomAction, { paddingBottom: bottomInsetPadding }]}>
                <TouchableOpacity style={styles.saveButton} activeOpacity={0.9}>
                    <Text style={styles.saveButtonText}>Simpan Pengaturan</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F6F8",
    },
    headerGradient: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    headerTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    headerIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.16)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTextBlock: {
        gap: 4,
        alignSelf: "center",
        width: "92%",
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.6,
        textAlign: "left",
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "rgba(255,255,255,0.88)",
        textAlign: "left",
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: "800",
        color: "#1F2937",
    },
    card: {
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#EEF1F4",
        paddingHorizontal: 14,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    settingRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    settingLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginRight: 12,
    },
    settingIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    settingTextWrap: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },
    settingSubtitle: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: "500",
        color: "#6B7280",
    },
    radioRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    radioRowActive: {
        backgroundColor: "#FFF6F2",
    },
    radioLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
    },
    quietTimeRow: {
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    timeChip: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    timeChipDisabled: {
        opacity: 0.6,
    },
    timeChipText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
    },
    timeChipTextDisabled: {
        color: "#9CA3AF",
    },
    quietBetweenText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#9CA3AF",
    },
    bottomAction: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 24,
        paddingTop: 14,
        backgroundColor: "rgba(245,246,248,0.94)",
        borderTopWidth: 1,
        borderTopColor: "#EEF1F4",
    },
    saveButton: {
        backgroundColor: "#1F1F1F",
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 5,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
});
