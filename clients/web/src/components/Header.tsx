import { Bell, Menu, MessageSquare, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../api/client";
import { jwtDecode } from "jwt-decode";

type HeaderProps = {
  onMenuClick: () => void;
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      checkUser();
    };

    checkUser();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("profileUpdated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("profileUpdated", handleUpdate);
    };
  }, []);

  const checkUser = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      const userStr = localStorage.getItem("user");
      if (userStr && userStr !== "undefined") {
        try {
          const user = JSON.parse(userStr);
          setProfilePic(user.profile_picture);
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      if (!userStr || userStr === "undefined") {
        const decoded: any = jwtDecode(token);
        apiClient.get(`/users/public/${decoded.id}`).then((res) => {
          const userData = res.data;
          localStorage.setItem("user", JSON.stringify(userData));
          setProfilePic(userData.profile_picture);
        });
      }
    }
  };

  useEffect(() => {
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  return (
    // Centre le logo
    <header className="h-16 bg-[#1C1C28] dark:bg-white border-b border-gray-800 dark:border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 relative transition-colors duration-300">
      {/* Menu burger */}
      <div className="flex items-center z-10">
        <button
          onClick={onMenuClick}
          className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-gray-900 transition-colors"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Logo cliquable */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 cursor-pointer group z-10"
        onClick={() => navigate("/home")}
      >
        {/* Agrandissement au survol logo */}
        <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl">
          <img
            src="/logo.png"
            alt="Melodia Logo"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Nom de l'application avec un dégradé de texte */}
        <span className="text-2xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500 hidden sm:block">
          Melodia
        </span>
      </div>

      {/* Boutons messages + notifications */}
      <div className="flex items-center gap-6 text-gray-300 dark:text-gray-600 z-10">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/conversations")}
              className="relative hover:text-white dark:hover:text-gray-900 transition-colors cursor-pointer"
            >
              <MessageSquare size={22} />
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF1E56] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1C1C28] dark:border-white">
                2
              </span>
            </button>

            <button
              onClick={() => navigate("/notifications")}
              className="relative hover:text-white dark:hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Bell size={22} />
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF1E56] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1C1C28] dark:border-white">
                3
              </span>
            </button>

            {/* Avatar utilisateur */}
            <button
              onClick={() => navigate("/profil")}
              className="w-10 h-10 rounded-full border-2 border-indigo-500/30 overflow-hidden bg-slate-800 flex items-center justify-center"
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
          /* Bouton de connexion si non connecté */
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
