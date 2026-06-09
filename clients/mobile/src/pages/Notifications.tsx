import React, { useState, useEffect, useMemo } from "react";
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
import Header from "@/src/components/Header";
import apiClient from "../api/client";
import { Router, useRouter } from "expo-router";
import { getValidSource } from "@/helpers/helpers";
import { useTranslation } from "react-i18next";

export interface AppNotification {
  id: string;
  is_read: boolean;
  action: string;
  type?: string;
  content?: string;
  related_user_id?: string;
  created_at: string;
  sender?: {
    username: string;
    initial?: string;
    profile_image?: string;
  };
  related_user?: {
    username: string;
    profile_image?: string;
  };
}

export default function Notifications() {
  const [filter, setFilter] = useState("Tout");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router: Router = useRouter();
  const { t } = useTranslation();

  useEffect((): void => {
    const fetchUserId: () => Promise<void> = async (): Promise<void> => {
      const storedId: string | null = await SecureStore.getItemAsync("userId");
      if (storedId) setUserId(storedId);
    };
    fetchUserId();
  }, []);

  const fetchNotifications: () => Promise<void> = async (): Promise<void> => {
    if (!userId) return;

    try {
      const response = await apiClient.get(`/notifications/user/${userId}`);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect((): void => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const onRefresh: () => void = (): void => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAllAsRead: () => void = async (): Promise<void> => {
    const unreadNotifs: AppNotification[] = notifications.filter(
      (n: AppNotification): boolean => !n.is_read,
    );
    if (unreadNotifs.length === 0) return;

    try {
      setNotifications((prev: AppNotification[]) =>
        prev.map((notif: AppNotification) => ({ ...notif, is_read: true })),
      );

      await Promise.all(
        unreadNotifs.map((notif: AppNotification) =>
          apiClient.put(`/notifications/${notif.id}`, { is_read: true }),
        ),
      );
    } catch (error) {
      console.error("Erreur mark as read:", error);
      fetchNotifications();
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (filter === "Tout") return notifications;
    if (filter === "Non lue") return notifications.filter((n) => !n.is_read);
    if (filter === "Mentions")
      return notifications.filter((n) => n.action === "mention");
    return notifications;
  }, [notifications, filter]);

  const handleNotificationPress = async (
    notification: AppNotification,
  ): Promise<void> => {
    if (!notification.is_read) {
      try {
        setNotifications((prev: AppNotification[]): AppNotification[] =>
          prev.map(
            (n: AppNotification): AppNotification =>
              n.id === notification.id ? { ...n, is_read: true } : n,
          ),
        );
        await apiClient.put(`/notifications/${notification.id}`, {
          is_read: true,
        });
      } catch (error) {
        console.error("Erreur lors du marquage comme lu:", error);
      }
    }

    if (notification.related_user_id) {
      router.push({
        pathname: "/profile",
        params: { id: notification.related_user_id },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.Content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
          />
        }
      >
        <View style={styles.TopPage}>
          <Text style={styles.Title}>{t("notifications_title")}</Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markRead}>{t("mark_all_read")}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.unreadText}>
          {t(unreadCount === 1 ? "unread_count_one" : "unread_count_other", { count: unreadCount })}
        </Text>

        <View style={styles.tabs}>
          {["Tout", "Non lue", "Mentions"].map((tabName: string) => (
            <TouchableOpacity
              key={tabName}
              style={[styles.tab, filter === tabName && styles.activeTab]}
              onPress={() => setFilter(tabName)}
            >
              <Text
                style={
                  filter === tabName ? styles.activeTabText : styles.tabText
                }
              >
                {tabName === "Tout" ? t("tab_all") : tabName === "Non lue" ? t("tab_unread") : t("tab_mentions")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#3b82f6"
            style={{ marginTop: 50 }}
          />
        ) : filteredNotifications.length === 0 ? (
          <Text
            style={{ color: "#64748b", textAlign: "center", marginTop: 50 }}
          >
            {t("no_notifications")}
          </Text>
        ) : (
          filteredNotifications.map((item) => {
            const displayUser =
              item.related_user?.username || item.sender?.username || "Système";
            const userInitial = displayUser.charAt(0).toUpperCase();

            const userProfilePic =
              item.related_user?.profile_image || item.sender?.profile_image;

            const imageSource = getValidSource(userProfilePic);

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
                style={[
                  styles.notificationCard,
                  !item.is_read && styles.unreadCardBorder,
                ]}
              >
                <View style={styles.iconPlace}>
                  {imageSource ? (
                    <Image source={imageSource} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{userInitial}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.Body}>
                  <Text style={styles.message}>
                    <Text style={styles.userName}>{displayUser} </Text>
                    {item.content || item.action}
                  </Text>
                  <Text style={styles.time}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>

                {!item.is_read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1C1C28" },
  Content: { padding: 20 },
  TopPage: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  Title: { color: "white", fontSize: 32, fontWeight: "bold" },
  markRead: { color: "#3b82f6", fontSize: 14, marginTop: 10 },
  unreadText: { color: "#94a3b8", fontSize: 16, marginTop: 5 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#1e1e2d",
    borderRadius: 12,
    padding: 4,
    marginVertical: 25,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#2d2d3f" },
  tabText: { color: "#94a3b8", fontWeight: "600" },
  activeTabText: { color: "white", fontWeight: "bold" },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#1c1c24",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2d2d3f",
  },
  unreadCardBorder: { borderColor: "#3b82f640" },
  iconPlace: { flexDirection: "row", alignItems: "center" },
  Icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2d2d3f",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#3b82f6", fontWeight: "bold" },
  Body: { flex: 1, marginLeft: 15 },
  message: { color: "#d1d5db", fontSize: 15, lineHeight: 20 },
  userName: { color: "white", fontWeight: "bold" },
  time: { color: "#64748b", fontSize: 13, marginTop: 4 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    marginLeft: 10,
  },
});
