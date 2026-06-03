import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom"; // 1. Importation du hook de navigation
import apiClient from "../api/client";

// Interface calquée sur le modèle backend utilisé par le mobile
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
    profile_image?: string;
  };
  related_user?: {
    username: string;
    profile_image?: string;
  };
}

const TabItem: React.FC<{
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
      active
        ? "bg-slate-700 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md"
        : "text-slate-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 hover:bg-slate-800 dark:hover:bg-gray-100"
    }`}
  >
    {label}
    {count !== undefined && count > 0 && (
      <span className={`text-xs opacity-80 ${active ? "" : "font-medium"}`}>
        ({count})
      </span>
    )}
  </button>
);

const NotificationCard: React.FC<{
  notification: AppNotification;
  onClick: () => void;
  onAvatarClick: (e: React.MouseEvent) => void;
}> = ({ notification, onClick, onAvatarClick }) => {
  const displayUser =
    notification.related_user?.username ||
    notification.sender?.username ||
    "Système";
  const userInitial = displayUser.charAt(0).toUpperCase();
  const userProfilePic =
    notification.related_user?.profile_image ||
    notification.sender?.profile_image;

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 dark:bg-white border rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-slate-600 dark:hover:border-gray-300 transition-colors cursor-pointer ${
        !notification.is_read
          ? "border-blue-500/40"
          : "border-slate-700 dark:border-gray-200"
      }`}
    >
      <div className="flex items-center gap-5">
        <div
          onClick={onAvatarClick}
          className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-slate-800 dark:bg-gray-100 flex items-center justify-center shadow-inner cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
        >
          {userProfilePic ? (
            <img
              src={userProfilePic}
              alt={displayUser}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-blue-500 font-bold text-lg">
              {userInitial}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <div className="text-slate-100 dark:text-gray-900 text-[15px] leading-relaxed">
            <span className="font-bold text-white dark:text-gray-900 tracking-wide">
              {displayUser}
            </span>{" "}
            <span className="text-slate-300 dark:text-gray-600">
              {notification.content || notification.action}
            </span>
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            {new Date(notification.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {!notification.is_read && (
        <div className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
      )}
    </div>
  );
};

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<"Tout" | "Non lues" | "Mentions">(
    "Tout",
  );
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserId(decoded.id || decoded.userId);
      } catch (e) {
        console.error("Token invalide:", e);
      }
    }
  }, []);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/notifications/user/${userId}`);
      setNotifications(res.data.notifications || []);
    } catch (e) {
      console.error("Erreur chargement notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  const handleMarkAllAsRead = async () => {
    const unreadNotifs = notifications.filter((n) => !n.is_read);
    if (unreadNotifs.length === 0) return;

    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      await Promise.all(
        unreadNotifs.map((notif) =>
          apiClient.put(`/notifications/${notif.id}`, { is_read: true }),
        ),
      );
    } catch (e) {
      console.error("Erreur lors du marquage global:", e);
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (notification.is_read) return;

    try {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n,
        ),
      );
      await apiClient.put(`/notifications/${notification.id}`, {
        is_read: true,
      });
    } catch (e) {
      console.error("Erreur lors du marquage unitaire:", e);
    }
  };

  const handleAvatarClick = async (
    e: React.MouseEvent,
    notification: AppNotification,
  ) => {
    e.stopPropagation();

    if (!notification.is_read) {
      await handleNotificationClick(notification);
    }

    if (notification.related_user_id) {
      navigate(`/profil/${notification.related_user_id}`);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === "Non lues")
      return notifications.filter((n) => !n.is_read);
    if (activeTab === "Mentions")
      return notifications.filter((n) => n.action === "mention");
    return notifications;
  }, [notifications, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-50 text-slate-50 dark:text-gray-900 p-6 md:p-10 lg:p-12 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white dark:text-gray-900 tracking-tight">
              {t("notifications_title", "Notifications")}
            </h1>
            <p className="text-slate-400 dark:text-gray-600 text-lg mt-1.5 font-medium">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`border px-6 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm ${
              unreadCount > 0
                ? "bg-slate-800 dark:bg-white dark:text-gray-900 dark:border-gray-200 text-slate-100 hover:bg-slate-700 dark:hover:bg-gray-100"
                : "bg-slate-900 dark:bg-gray-100 dark:text-gray-400 border-slate-800 dark:border-gray-200 text-slate-600 cursor-not-allowed"
            }`}
          >
            {t("mark_all_read", "Tout marquer comme lu")}
          </button>
        </header>

        <nav className="bg-slate-900 dark:bg-white border border-slate-700 dark:border-gray-200 rounded-xl p-1.5 flex justify-center gap-1.5 shadow-inner">
          <TabItem
            label={t("tab_all", "Tout")}
            active={activeTab === "Tout"}
            onClick={() => setActiveTab("Tout")}
          />
          <TabItem
            label={t("tab_unread", "Non lues")}
            count={unreadCount}
            active={activeTab === "Non lues"}
            onClick={() => setActiveTab("Non lues")}
          />
          <TabItem
            label={t("tab_mentions", "Mentions")}
            active={activeTab === "Mentions"}
            onClick={() => setActiveTab("Mentions")}
          />
        </nav>

        <main className="mt-10 space-y-5">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onAvatarClick={(e) => handleAvatarClick(e, notification)}
              />
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 dark:text-gray-400">
              {t("no_notifications", "Aucune notification.")}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Notifications;
