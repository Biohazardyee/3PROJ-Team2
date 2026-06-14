import React, {useState, useEffect} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    StatusBar
} from "react-native";
import {Router, useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BackButton from "../components/BackButton";
import {useTheme} from "../context/ThemeContext";
import * as SecureStore from "expo-secure-store";
import {useTranslation} from "react-i18next";


type SettingRowProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    type?: "link" | "switch" | "action";
    value?: boolean;
    onValueChange?: (val: boolean) => void;
    onPress?: () => void;
    danger?: boolean;
    theme: any;
};

const SettingRow = ({
                        icon,
                        title,
                        subtitle,
                        type = "link",
                        value,
                        onValueChange,
                        onPress,
                        danger,
                        theme,
                    }: SettingRowProps) => (
    <TouchableOpacity
        style={[styles.row, {borderBottomColor: theme.border}]}
        onPress={onPress}
        disabled={type === "switch"}
        activeOpacity={0.7}
    >
        <View
            style={[
                styles.iconContainer,
                danger && {backgroundColor: "rgba(255, 77, 77, 0.1)"},
            ]}
        >
            <Ionicons
                name={icon}
                size={22}
                color={danger ? "#FF4D4D" : theme.accent}
            />
        </View>
        <View style={styles.rowTextContainer}>
            <Text
                style={[styles.rowTitle, {color: danger ? "#FF4D4D" : theme.text}]}
            >
                {title}
            </Text>
            {subtitle && (
                <Text style={[styles.rowSubtitle, {color: theme.subText}]}>
                    {subtitle}
                </Text>
            )}
        </View>
        {type === "link" && (
            <Ionicons name="chevron-forward" size={20} color={theme.subText}/>
        )}
        {type === "switch" && (
            <Switch
                trackColor={{false: "#3e3e3e", true: theme.accent}}
                thumbColor={value ? "#fff" : "#f4f3f4"}
                onValueChange={onValueChange}
                value={value}
            />
        )}
    </TouchableOpacity>
);

const Settings = () => {
    const router: Router = useRouter();

    const {isDarkMode, toggleTheme, theme} = useTheme();
    const {t} = useTranslation();

    const [notifications, setNotifications] = useState(true);

    useEffect((): void => {
        const loadNotifs: () => Promise<void> = async (): Promise<void> => {
            try {
                const savedNotifs: string | null = await AsyncStorage.getItem("pref_notifications");
                if (savedNotifs !== null) setNotifications(JSON.parse(savedNotifs));
            } catch (e) {
                console.error(e);
            }
        };
        loadNotifs();
    }, []);

    const toggleNotifications: (value: boolean) => Promise<void> = async (value: boolean): Promise<void> => {
        setNotifications(value);
        await AsyncStorage.setItem("pref_notifications", JSON.stringify(value));
    };


    const handleLogout: () => void = (): void => {
        Alert.alert(t("btn_logout"), t("logout_confirm"), [
            {text: t("cancel"), style: "cancel"},
            {
                text: t("btn_logout"),
                style: "destructive",
                onPress: async (): Promise<void> => {
                    await SecureStore.deleteItemAsync("userToken");
                    await SecureStore.deleteItemAsync("userId");
                    router.replace("/");
                },
            },
        ]);
    };

    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"}/>

            <View style={[styles.header, {backgroundColor: theme.background}]}>
                <BackButton/>
                <Text style={[styles.headerTitle, {color: theme.text}]}>
                    {t("settings_title")}
                </Text>
                <View style={{width: 45}}/>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, {color: theme.subText}]}>{t("settings_section_account")}</Text>
                <View style={[styles.section, {backgroundColor: theme.card}]}>
                    <SettingRow
                        theme={theme}
                        icon="person-outline"
                        title={t("settings_edit_profile")}
                        subtitle={t("settings_edit_profile_subtitle")}
                        onPress={() => router.push("/updateProfile")}
                    />
                </View>

                <Text style={[styles.sectionTitle, {color: theme.subText}]}>{t("settings_section_preferences")}</Text>
                <View style={[styles.section, {backgroundColor: theme.card}]}>
                    <SettingRow
                        theme={theme}
                        icon="moon-outline"
                        title={t("dark_mode")}
                        type="switch"
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                    />
                    <SettingRow
                        theme={theme}
                        icon="notifications-outline"
                        title={t("settings_notifications")}
                        subtitle={t("settings_notifications_subtitle")}
                        type="switch"
                        value={notifications}
                        onValueChange={toggleNotifications}
                    />
                    <SettingRow
                        theme={theme}
                        icon="language-outline"
                        title={t("settings_language")}
                        subtitle={t("settings_language_subtitle")}
                        onPress={() => router.push("/languages")}
                    />
                </View>

                <Text style={[styles.sectionTitle, {color: theme.subText}]}>{t("settings_section_data_security")}</Text>
                <View style={[styles.section, {backgroundColor: theme.card}]}>
                    <SettingRow
                        theme={theme}
                        icon="shield-checkmark-outline"
                        title={t("privacy")}
                        onPress={() => router.push("/privacy")}
                    />
                    <SettingRow
                        theme={theme}
                        icon="download-outline"
                        title={t("settings_export_data")}
                        type="action"
                    />
                </View>

                <View
                    style={[
                        styles.section,
                        {backgroundColor: theme.card, marginTop: 20},
                    ]}
                >
                    <SettingRow
                        theme={theme}
                        icon="log-out-outline"
                        title={t("btn_logout")}
                        type="action"
                        danger={true}
                        onPress={handleLogout}
                    />
                </View>

                <Text style={[styles.versionText, {color: theme.subText}]}>{t("app_version")}</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1},
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingTop: 20,
        paddingBottom: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    content: {flex: 1, paddingHorizontal: 20},
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        textTransform: "uppercase",
        marginTop: 25,
        marginBottom: 10,
        marginLeft: 5,
    },
    section: {borderRadius: 15, overflow: "hidden"},
    row: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(108, 92, 231, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    rowTextContainer: {flex: 1},
    rowTitle: {fontSize: 16, fontWeight: "500"},
    rowSubtitle: {fontSize: 13, marginTop: 2},
    versionText: {
        textAlign: "center",
        marginTop: 40,
        marginBottom: 40,
        fontSize: 14,
    },
});

export default Settings;