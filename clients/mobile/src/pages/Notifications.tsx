import React, {useState, useEffect, useMemo} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Image,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import {Ionicons} from "@expo/vector-icons";
import Header from "@/src/components/Header";
import apiClient from "../api/client";
import {Router, useRouter} from "expo-router";
import {getValidSource} from "@/helpers/helpers";
import {useTranslation} from "react-i18next";
import {useTheme} from "../context/ThemeContext";

export interface AppNotification {
    id: string;
    is_read: boolean;
    action: string;
    type?: string;
    content?: string;
    related_user_id?: string;
    created_at: string;
    sender?: {username: string; initial?: string; profile_image?: string};
    related_user?: {username: string; profile_image?: string};
}

type Tab = "all" | "unread" | "mentions";

type ActionConfig = {
    iconName: keyof typeof Ionicons.glyphMap;
    badgeBg: string;
    iconColor: string;
    accentColor: string;
};

const ACTION_CONFIG: Record<string, ActionConfig> = {
    like_added:     {iconName: "heart",          badgeBg: "rgba(244,63,94,0.18)",   iconColor: "#f43f5e", accentColor: "#f43f5e"},
    comment_added:  {iconName: "chatbubble",     badgeBg: "rgba(16,185,129,0.18)",  iconColor: "#10b981", accentColor: "#10b981"},
    review_added:   {iconName: "star",           badgeBg: "rgba(245,158,11,0.18)",  iconColor: "#f59e0b", accentColor: "#f59e0b"},
    new_message:    {iconName: "mail",           badgeBg: "rgba(59,130,246,0.18)",  iconColor: "#3b82f6", accentColor: "#3b82f6"},
    new_follow:     {iconName: "person-add",     badgeBg: "rgba(139,92,246,0.18)",  iconColor: "#8b5cf6", accentColor: "#8b5cf6"},
    recommendation: {iconName: "sparkles",       badgeBg: "rgba(6,182,212,0.18)",   iconColor: "#06b6d4", accentColor: "#06b6d4"},
};

const DEFAULT_CONFIG: ActionConfig = {
    iconName: "notifications-outline",
    badgeBg: "rgba(100,116,139,0.18)",
    iconColor: "#64748b",
    accentColor: "#64748b",
};

const getConfig = (action: string): ActionConfig => ACTION_CONFIG[action] ?? DEFAULT_CONFIG;

export default function Notifications() {
    const [filter, setFilter] = useState<Tab>("all");
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const router: Router = useRouter();
    const {t} = useTranslation();
    const {theme, isDarkMode} = useTheme();

    useEffect((): void => {
        const fetchUserId = async (): Promise<void> => {
            const storedId = await SecureStore.getItemAsync("userId");
            if (storedId) setUserId(storedId);
        };
        fetchUserId();
    }, []);

    const fetchNotifications = async (): Promise<void> => {
        if (!userId) return;
        try {
            const response = await apiClient.get(`/notifications/user/${userId}`);
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error("Erreur notifications:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect((): void => {
        if (userId) fetchNotifications();
    }, [userId]);

    const onRefresh = (): void => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAllAsRead = async (): Promise<void> => {
        const unread = notifications.filter((n) => !n.is_read);
        if (!unread.length) return;
        try {
            setNotifications((prev) => prev.map((n) => ({...n, is_read: true})));
            await Promise.all(unread.map((n) => apiClient.put(`/notifications/${n.id}`, {is_read: true})));
        } catch (error) {
            console.error("Erreur mark as read:", error);
            fetchNotifications();
        }
    };

    const getActionText = (action: string): string => {
        const actionMap: Record<string, string> = {
            new_follow:    "action_started_following",
            like_added:    "action_like_added",
            comment_added: "action_commented_review",
            recommendation:"action_recommendation",
            new_message:   "action_new_message",
        };
        return t(actionMap[action] ?? action);
    };

    const formatTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const time = date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
        if (date.toDateString() === now.toDateString()) return time;
        if (date.toDateString() === yesterday.toDateString()) return `${t("yesterday")}, ${time}`;
        return date.toLocaleDateString([], {day: "numeric", month: "short"});
    };

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.is_read).length,
        [notifications],
    );

    const filteredNotifications = useMemo((): AppNotification[] => {
        const sorted = [...notifications].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        if (filter === "unread") return sorted.filter((n) => !n.is_read);
        if (filter === "mentions") return sorted.filter((n) => n.action === "mention" || n.action === "recommendation");
        return sorted;
    }, [notifications, filter]);

    const isToday = (dateStr: string): boolean =>
        new Date(dateStr).toDateString() === new Date().toDateString();

    const todayNotifs = filteredNotifications.filter((n) => isToday(n.created_at));
    const earlierNotifs = filteredNotifications.filter((n) => !isToday(n.created_at));

    const tabs: {key: Tab; label: string}[] = [
        {key: "all",      label: t("tab_all")},
        {key: "unread",   label: t("tab_unread")},
        {key: "mentions", label: t("tab_mentions")},
    ];

    const renderCard = (item: AppNotification) => {
        const config = getConfig(item.action);
        const displayUser = item.related_user?.username || item.sender?.username || t("user_system", "Système");
        const userInitial = displayUser.charAt(0).toUpperCase();
        const userProfilePic = item.related_user?.profile_image || item.sender?.profile_image;
        const imageSource = getValidSource(userProfilePic);

        return (
            <TouchableOpacity
                key={item.id}
                onPress={async () => {
                    if (!item.is_read) {
                        try {
                            setNotifications((prev) => prev.map((n) => n.id === item.id ? {...n, is_read: true} : n));
                            await apiClient.put(`/notifications/${item.id}`, {is_read: true});
                        } catch (e) {
                            console.error("Erreur marquage:", e);
                        }
                    }
                    if (item.related_user_id) {
                        router.push({pathname: "/profile", params: {id: item.related_user_id}});
                    }
                }}
                activeOpacity={0.75}
                style={[
                    styles.card,
                    {
                        backgroundColor: item.is_read ? theme.card : theme.surface,
                        borderColor: theme.border,
                        borderLeftColor: config.accentColor,
                    },
                    !item.is_read && {
                        shadowColor: config.accentColor,
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        shadowOffset: {width: 0, height: 2},
                        elevation: 3,
                    },
                ]}
            >
                {/* Avatar + badge */}
                <View style={styles.avatarWrapper}>
                    {imageSource ? (
                        <Image source={imageSource} style={styles.avatar}/>
                    ) : (
                        <View style={[styles.avatar, {backgroundColor: theme.surface}]}>
                            <Text style={[styles.avatarInitial, {color: config.accentColor}]}>{userInitial}</Text>
                        </View>
                    )}
                    <View style={[styles.actionBadge, {backgroundColor: config.badgeBg, borderColor: theme.background}]}>
                        <Ionicons name={config.iconName} size={10} color={config.iconColor}/>
                    </View>
                </View>

                {/* Body */}
                <View style={styles.body}>
                    <Text
                        style={[styles.messageText, {color: item.is_read ? theme.subText : theme.text}]}
                        numberOfLines={2}
                    >
                        <Text style={[styles.username, {color: item.is_read ? theme.subText : theme.text, opacity: item.is_read ? 0.9 : 1}]}>
                            {displayUser}{" "}
                        </Text>
                        {item.content || getActionText(item.action)}
                    </Text>
                    <Text style={[styles.timeText, {color: item.is_read ? theme.placeholder : config.accentColor}]}>
                        {formatTime(item.created_at)}
                    </Text>
                </View>

                {/* Unread dot */}
                {!item.is_read && (
                    <View style={[styles.unreadDot, {backgroundColor: config.accentColor, shadowColor: config.accentColor}]}/>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <Header/>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6"/>}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.pageHeader}>
                    <View style={styles.titleRow}>
                        <View style={styles.bellWrapper}>
                            <Ionicons name="notifications" size={22} color="#fff"/>
                            {unreadCount > 0 && (
                                <View style={styles.bellBadge}>
                                    <Text style={styles.bellBadgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
                                </View>
                            )}
                        </View>
                        <View>
                            <Text style={[styles.pageTitle, {color: theme.text}]}>{t("notifications_title")}</Text>
                            <Text style={[styles.pageSubtitle, {color: theme.subText}]}>
                                {unreadCount > 0
                                    ? t(unreadCount === 1 ? "unread_count_one" : "unread_count_other", {count: unreadCount})
                                    : t("no_notifications")}
                            </Text>
                        </View>
                    </View>

                    {unreadCount > 0 && (
                        <TouchableOpacity
                            onPress={markAllAsRead}
                            style={[styles.markAllBtn, {backgroundColor: theme.surface, borderColor: theme.border}]}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="checkmark-done" size={15} color="#3b82f6"/>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tabs */}
                <View style={[styles.tabBar, {borderBottomColor: theme.border}]}>
                    {tabs.map(({key, label}) => {
                        const isActive = filter === key;
                        const count = key === "unread" ? unreadCount : 0;
                        return (
                            <TouchableOpacity
                                key={key}
                                style={styles.tabItem}
                                onPress={() => setFilter(key)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.tabLabelRow}>
                                    <Text style={[styles.tabLabel, {color: isActive ? "#3b82f6" : theme.subText, fontWeight: isActive ? "700" : "500"}]}>
                                        {label}
                                    </Text>
                                    {count > 0 && (
                                        <View style={styles.tabBadge}>
                                            <Text style={styles.tabBadgeText}>{count}</Text>
                                        </View>
                                    )}
                                </View>
                                {isActive && <View style={styles.tabUnderline}/>}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Content */}
                {isLoading ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{marginTop: 60}}/>
                ) : filteredNotifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, {backgroundColor: theme.surface}]}>
                            <Ionicons name="notifications-off-outline" size={32} color={theme.subText}/>
                        </View>
                        <Text style={[styles.emptyText, {color: theme.subText}]}>{t("no_notifications")}</Text>
                    </View>
                ) : (
                    <>
                        {todayNotifs.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionLabel, {color: theme.subText}]}>{t("today").toUpperCase()}</Text>
                                    <View style={[styles.sectionLine, {backgroundColor: theme.border}]}/>
                                    <Text style={[styles.sectionCount, {color: theme.subText}]}>{todayNotifs.length}</Text>
                                </View>
                                {todayNotifs.map(renderCard)}
                            </View>
                        )}

                        {earlierNotifs.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionLabel, {color: theme.subText}]}>{t("notif_earlier").toUpperCase()}</Text>
                                    <View style={[styles.sectionLine, {backgroundColor: theme.border}]}/>
                                    <Text style={[styles.sectionCount, {color: theme.subText}]}>{earlierNotifs.length}</Text>
                                </View>
                                {earlierNotifs.map(renderCard)}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    scrollContent: {paddingBottom: 40},

    // Header
    pageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    titleRow: {flexDirection: "row", alignItems: "center", gap: 14},
    bellWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: "#3b82f6",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#3b82f6",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 4},
        elevation: 6,
    },
    bellBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#ef4444",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    bellBadgeText: {color: "#fff", fontSize: 10, fontWeight: "800"},
    pageTitle: {fontSize: 22, fontWeight: "800", letterSpacing: 0.3},
    pageSubtitle: {fontSize: 13, marginTop: 2},
    markAllBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    // Tabs
    tabBar: {
        flexDirection: "row",
        borderBottomWidth: 1,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        paddingBottom: 10,
        position: "relative",
    },
    tabLabelRow: {flexDirection: "row", alignItems: "center", gap: 6},
    tabLabel: {fontSize: 13},
    tabBadge: {
        backgroundColor: "#3b82f6",
        borderRadius: 8,
        minWidth: 18,
        height: 18,
        paddingHorizontal: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    tabBadgeText: {color: "#fff", fontSize: 10, fontWeight: "800"},
    tabUnderline: {
        position: "absolute",
        bottom: 0,
        left: 8,
        right: 8,
        height: 2,
        backgroundColor: "#3b82f6",
        borderRadius: 2,
    },

    // Section
    section: {paddingHorizontal: 20, marginBottom: 8},
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
        marginTop: 8,
    },
    sectionLabel: {fontSize: 11, fontWeight: "700", letterSpacing: 1.2},
    sectionLine: {flex: 1, height: 1},
    sectionCount: {fontSize: 11, fontWeight: "600"},

    // Card
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderLeftWidth: 3,
        gap: 12,
    },
    avatarWrapper: {position: "relative", width: 44, height: 44},
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitial: {fontSize: 16, fontWeight: "800"},
    actionBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
    },
    body: {flex: 1},
    messageText: {fontSize: 14, lineHeight: 20},
    username: {fontWeight: "700"},
    timeText: {fontSize: 12, marginTop: 3, fontWeight: "500"},
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        shadowOpacity: 0.6,
        shadowRadius: 4,
        shadowOffset: {width: 0, height: 0},
        elevation: 2,
    },

    // Empty
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
        gap: 16,
    },
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {fontSize: 14, textAlign: "center", maxWidth: 220, lineHeight: 20},
});
