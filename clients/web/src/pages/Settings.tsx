import React, { useState, useRef } from "react";
import {
  User,
  Shield,
  Database,
  Trash2,
  ExternalLink,
  LogOut,
  Camera,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type TabType = "Profile" | "Privacy" | "Data";

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("Profile");

  // Etats pour le profil
  const [profilePic, setProfilePic] = useState<string | null>(() => {
    return localStorage.getItem("user_profile_pic") || null;
  });

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("user_profile_data");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Music Lover",
          username: "musiclover",
          bio: "Passionné de musique électronique et de découverte de nouveaux sons. 🎧 ✨",
          location: "Paris, France",
        };
  });

  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("user_profile_data", JSON.stringify(profileData));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64String = reader.result as string;
          setProfilePic(base64String);
          localStorage.setItem("user_profile_pic", base64String);
        } catch (error) {
          alert(t("pic_error_size"));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePic = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfilePic(null);
    localStorage.removeItem("user_profile_pic");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (window.confirm(t("logout_confirm"))) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] dark:bg-slate-50 text-slate-200 dark:text-gray-900 p-6 md:p-10 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-10">
        <header>
          <h1
            className="text-4xl font-bold text-white dark:text-gray-900 mb-2"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {t("settings_title")}
          </h1>
          <p className="text-slate-400 dark:text-gray-600">
            {t("settings_subtitle")}
          </p>
        </header>

        {/* Navigation */}
        <nav className="bg-[#1a1d26]/50 dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl p-1.5 flex gap-1 shadow-inner">
          {[
            {
              id: "Profile",
              label: t("tab_profile"),
              icon: <User size={18} />,
            },
            {
              id: "Privacy",
              label: t("tab_security"),
              icon: <Shield size={18} />,
            },
            { id: "Data", label: t("tab_data"), icon: <Database size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-[#2a2e3d] dark:bg-gray-100 text-white dark:text-gray-900 shadow-md"
                  : "text-slate-400 hover:text-white dark:hover:text-gray-900"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <main className="bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl p-8 shadow-xl transition-colors min-h-[500px]">
          {/* Profil */}
          {activeTab === "Profile" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section className="flex flex-col items-center md:flex-row gap-8">
                {/* Conteneur de l'avatar cliquable */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-32 h-32 md:w-24 md:h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-blue-400">ML</span>
                  )}

                  {/* Voile sombre au survol */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {!profilePic ? (
                      <span className="text-white">
                        <Camera size={20} />
                      </span>
                    ) : (
                      <button
                        onClick={handleDeletePic}
                        className="text-white hover:text-rose-500 p-2"
                        title={t("pic_delete_title")}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Input caché */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </section>

              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                      {t("label_full_name")}
                    </label>
                    <input
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f1117] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white dark:text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                      {t("label_username")}
                    </label>
                    <input
                      name="username"
                      value={profileData.username}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f1117] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white dark:text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                    {t("label_bio")}
                  </label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={profileData.bio}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f1117] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none text-white dark:text-gray-900"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 dark:border-gray-100 flex justify-between items-center">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 px-4 py-2 rounded-lg font-bold transition-all"
                >
                  <LogOut size={18} /> {t("btn_logout")}
                </button>
                <div className="flex items-center gap-4">
                  {isSaved && (
                    <span className="flex items-center gap-1 text-emerald-500 text-sm font-bold">
                      <CheckCircle size={16} /> {t("status_saved")}
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all"
                  >
                    {t("btn_save")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Onglet sécurité*/}
          {activeTab === "Privacy" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-white dark:text-gray-900">
                {t("security_title")}
              </h3>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder={t("old_password_placeholder")}
                  className="w-full bg-[#0f1117] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white dark:text-gray-900"
                />
                <input
                  type="password"
                  placeholder={t("new_password_placeholder")}
                  className="w-full bg-[#0f1117] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white dark:text-gray-900"
                />
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all">
                  {t("btn_update_password")}
                </button>
              </div>
            </div>
          )}

          {/* Données */}
          {activeTab === "Data" && (
            <div className="text-center py-12 space-y-6">
              <Database size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white dark:text-gray-900">
                {t("data_title")}
              </h3>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button className="flex justify-center items-center gap-2 bg-slate-800 p-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all text-white">
                  <ExternalLink size={16} /> {t("btn_export_data")}
                </button>
                <button className="text-rose-500 text-sm font-bold hover:underline mt-2">
                  {t("btn_delete_account")}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
