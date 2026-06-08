import { Menu, MessageSquare, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import apiClient from "../api/client";
import { jwtDecode } from "jwt-decode";
import { NotificationBell } from "./NotificationBell";
import { useSocket } from "../context/SocketContext";

type HeaderProps = {
  onMenuClick: () => void;
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  const checkUser = async () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const res = await apiClient.get(`/users/public/${decoded.id}`);
        const userData = res.data.user || res.data;

        if (userData.profile_picture) {
          const img = userData.profile_picture.startsWith("data:")
            ? userData.profile_picture
            : `data:image/jpeg;base64,${userData.profile_picture}`;
          setProfilePic(img);
        } else {
          setProfilePic(null);
        }
      } catch (e) {
        console.error("Erreur fetch user header", e);
      }
    }
  };

  const fetchGlobalUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      const uId = decoded.id || decoded.userId;

      const res = await apiClient.get(`/conversations/user/${uId}`);
      const data = res.data.conversations || [];
      const total = data.reduce((acc: number, conv: any) => {
        const unread = conv.messages
          ? conv.messages.filter((m: any) => !m.is_read && m.sender_id !== uId)
              .length
          : 0;
        return acc + unread;
      }, 0);
      setUnreadMessagesCount(total);
    } catch (err) {
      console.error("Erreur au calcul des non lus (Header):", err);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    fetchGlobalUnreadCount();

    socket.on("update_conversation_list", fetchGlobalUnreadCount);

    const handleManualReadUpdate = () => {
      fetchGlobalUnreadCount();
    };

    window.addEventListener("messagesRead", handleManualReadUpdate);

    return () => {
      socket.off("update_conversation_list", fetchGlobalUnreadCount);
      window.removeEventListener("messagesRead", handleManualReadUpdate);
    };
  }, [socket, fetchGlobalUnreadCount]);

  useEffect(() => {
    const handleUpdate = () => checkUser();
    checkUser();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("profileUpdated", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("profileUpdated", handleUpdate);
    };
  }, []);

  return (
    <header className="h-16 bg-[#1C1C28] dark:bg-white border-b border-gray-800 dark:border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 relative transition-colors duration-300">
      <div className="flex items-center z-10">
        <button
          onClick={onMenuClick}
          className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-gray-900 transition-colors"
        >
          <Menu size={28} />
        </button>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 cursor-pointer group z-10"
        onClick={() => navigate("/home")}
      >
        <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl">
          <img
            src="/logo.png"
            alt="Melodia Logo"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <span className="text-2xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500 hidden sm:block">
          Melodia
        </span>
      </div>

      <div className="flex items-center gap-6 text-gray-300 dark:text-gray-600 z-10">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/conversations")}
              className="relative hover:text-white dark:hover:text-gray-900 transition-colors cursor-pointer"
            >
              <MessageSquare size={22} />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF1E56] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1C1C28] dark:border-white animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
            <NotificationBell />
            <button
              onClick={() => navigate("/profil")}
              className="w-10 h-10 rounded-full border-2 border-indigo-500/30 overflow-hidden bg-slate-800 flex items-center justify-center inline-flex"
            >
              {profilePic ? (
                <img
                  src={
                    profilePic.startsWith("data")
                      ? profilePic
                      : `data:image/jpeg;base64,${profilePic}`
                  }
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-indigo-300">ME</span>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <LogIn size={18} />
            <span className="hidden sm:inline">Connexion</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
