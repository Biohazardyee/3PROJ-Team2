import React, {useState, useEffect, useRef} from "react";
import {
    User,
    Shield,
    Database,
    Trash2,
    ExternalLink,
    LogOut,
    Camera,
    CheckCircle,
    Music,
    Loader2,
} from "lucide-react";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {jwtDecode} from "jwt-decode";
import {toast} from "react-toastify";
import apiClient from "../api/client";
import {AxiosResponse} from "axios";
import {useConfirm} from "../context/ConfirmContext";

type TabType = "Profile" | "Privacy" | "Data";

const USERNAME_MAX: number = 20;
const PSEUDO_MAX: number = 30;
const BIO_MAX: number = 150;

const Settings: React.FC = () => {
    const {t} = useTranslation();
    const confirm = useConfirm();
    const navigate: NavigateFunction = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>("Profile");

    const [userId, setUserId] = useState<string>("");

    const [username, setUsername] = useState("");
    const [pseudo, setPseudo] = useState("");
    const [favoriteBand, setFavoriteBand] = useState("");
    const [biography, setBiography] = useState("");
    const [profilePicture, setProfilePicture] = useState<string>(() => {
        return localStorage.getItem("user_profile_pic") || "";
    });

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [statusMessage] = useState("");

    const [suggestions, setSuggestions] = useState<{ name: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const fileInputRef: React.RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
    const searchTimeout: React.RefObject<any> = useRef<any>(null);

    useEffect((): void => {
        const loadUserData = async (): Promise<void> => {
            try {
                const token: string | null = localStorage.getItem("token") || localStorage.getItem("userToken");
                if (!token) return;

                const decoded: any = jwtDecode(token);
                const decodedId = decoded.id;

                setUserId(decodedId);

                const res: AxiosResponse = await apiClient.get(`/users/public/${decodedId}`);
                const user = res.data.user || res.data;

                setUsername(user.username || "");
                setPseudo(user.pseudo || "");
                setFavoriteBand(user.favorite_band || "");
                setBiography(user.biography || "");

                if (user.profile_picture) {
                    const formattedPic = user.profile_picture.startsWith("data:")
                        ? user.profile_picture
                        : `data:image/png;base64,${user.profile_picture}`;

                    setProfilePicture(formattedPic);
                    localStorage.setItem("user_profile_pic", formattedPic);
                }
            } catch (e) {
                console.error("Erreur lors du chargement du profil:", e);
            }
        };

        loadUserData();
    }, []);

    const searchArtists = (text: string): void => {
        setFavoriteBand(text);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (text.length > 2) {
            setIsSearching(true);
            setShowSuggestions(true);

            searchTimeout.current = setTimeout(async (): Promise<void> => {
                try {
                    const response: AxiosResponse = await apiClient.get(`/api/search?query=${text}`);
                    const albums = response.data.searchResults?.results?.albummatches?.album || [];
                    const uniqueArtists: string[] = [...new Set(albums.map((a: any) => a.artist))] as string[];

                    setSuggestions(uniqueArtists.map((name: string): { name: string } => ({name})).slice(0, 5));
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsSearching(false);
                }
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSaveProfile = async (): Promise<void> => {
        if (!userId) return;

        try {
            setLoading(true);
            const base64ForBackend: string = profilePicture.includes("base64,")
                ? profilePicture.split("base64,")[1]
                : profilePicture;

            await apiClient.put(`/users/${userId}`, {
                username,
                pseudo,
                favorite_band: favoriteBand,
                biography,
                profile_picture: base64ForBackend,
            });

            const currentLocalUser: string | null = localStorage.getItem("user");
            if (currentLocalUser) {
                const parsedUser = JSON.parse(currentLocalUser);
                localStorage.setItem("user", JSON.stringify({
                    ...parsedUser,
                    username,
                    pseudo,
                    biography,
                    favorite_band: favoriteBand
                }));
            }

            window.dispatchEvent(new Event("profileUpdated"));

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            console.error(err);
            toast.error(t("save_error", "Erreur lors de la sauvegarde."));
        } finally {
            setLoading(false);
        }
    };
    const handleUpdatePassword = async (): Promise<void> => {
        if (!oldPassword || !newPassword) {
            toast.error(t("fill_all_fields", "Veuillez remplir tous les champs"));
            return;
        }

        try {
            setLoading(true);
            await apiClient.put(`/users/${userId}`, {
                oldPassword,
                password: newPassword,
            });

            setOldPassword("");
            setNewPassword("");
            toast.success(t("password_update_success", "Mot de passe mis à jour avec succès"));
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || t("password_update_error", "Erreur lors de la modification"));
        } finally {
            setLoading(false);
        }
    };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file: File | undefined = e.target.files?.[0];
        if (file) {
            const reader: FileReader = new FileReader();
            reader.onloadend = (): void => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeletePic = (e: React.MouseEvent): void => {
        e.stopPropagation();
        setProfilePicture("");
        localStorage.removeItem("user_profile_pic");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleLogout = async (): Promise<void> => {
        const ok = await confirm({
            title: t("logout_title", "Déconnexion"),
            message: t("logout_confirm"),
            confirmText: t("logout", "Se déconnecter"),
            danger: true,
        });
        if (!ok) return;
        localStorage.removeItem("token");
        localStorage.removeItem("userToken");
        localStorage.removeItem("user");
        localStorage.removeItem("user_profile_pic");
        window.dispatchEvent(new Event("auth-changed"));
        navigate("/");
    };

    return (
        <div
            className="min-h-screen bg-[#13131A] dark:bg-slate-50 text-slate-200 dark:text-gray-900 p-6 md:p-10 font-sans transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-10">
                <header>
                    <h1 className="text-4xl font-bold text-white dark:text-gray-900 mb-2"
                        style={{fontFamily: "'Orbitron', sans-serif"}}>
                        {t("settings_title")}
                    </h1>
                    <p className="text-slate-400 dark:text-gray-600">{t("settings_subtitle")}</p>
                </header>

                {/* Navigation Onglets */}
                <nav
                    className="bg-[#1a1d26]/50 dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl p-1.5 flex gap-1 shadow-inner">
                    {[
                        {id: "Profile", label: t("tab_profile"), icon: <User size={18}/>},
                        {id: "Privacy", label: t("tab_security"), icon: <Shield size={18}/>},
                        {id: "Data", label: t("tab_data"), icon: <Database size={18}/>},
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

                <main
                    className="bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl p-8 shadow-xl transition-colors min-h-125">

                    {/* --- ONGLET : PROFIL --- */}
                    {activeTab === "Profile" && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <section className="flex flex-col items-center md:flex-row gap-8">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative group w-28 h-28 rounded-full bg-slate-800 border-2 border-blue-500 flex items-center justify-center overflow-hidden cursor-pointer shadow-lg"
                                >
                                    {profilePicture ? (
                                        <img src={profilePicture} alt="Profile" className="w-full h-full object-cover"/>
                                    ) : (
                                        <span
                                            className="text-2xl font-bold text-blue-400">{username?.substring(0, 2).toUpperCase() || "U"}</span>
                                    )}

                                    <div
                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!profilePicture ? (
                                            <Camera size={20} className="text-white"/>
                                        ) : (
                                            <button onClick={handleDeletePic}
                                                    className="text-white hover:text-rose-500 p-2" type="button">
                                                <Trash2 size={20}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*"
                                       onChange={handleImageUpload}/>
                            </section>

                            <div className="grid gap-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Champ Username */}
                                    <div>
                                        <label
                                            className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
                                            <span>{t("label_username")}</span>
                                            <span
                                                className="text-slate-500 text-[11px] font-normal">{username.length}/{USERNAME_MAX}</span>
                                        </label>
                                        <input
                                            name="username"
                                            value={username}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.value.length <= USERNAME_MAX && setUsername(e.target.value)}
                                            className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white dark:text-gray-900"
                                        />
                                        <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5">
                                            {t("username_hint", "Identifiant unique (@) utilisé pour vous retrouver.")}
                                        </p>
                                    </div>

                                    {/* Champ Pseudo (nom d'affichage, non unique) */}
                                    <div>
                                        <label
                                            className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
                                            <span>{t("label_pseudo")}</span>
                                            <span
                                                className="text-slate-500 text-[11px] font-normal">{pseudo.length}/{PSEUDO_MAX}</span>
                                        </label>
                                        <input
                                            name="pseudo"
                                            value={pseudo}
                                            placeholder={t("pseudo_placeholder", "Votre nom d'affichage")}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.value.length <= PSEUDO_MAX && setPseudo(e.target.value)}
                                            className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white dark:text-gray-900 placeholder:text-slate-600"
                                        />
                                        <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5">
                                            {t("pseudo_hint", "Nom affiché sur votre profil (peut être identique à d'autres).")}
                                        </p>
                                    </div>

                                    {/* Champ Favorite Band avec suggestions */}
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                                            Favorite Band
                                        </label>
                                        <input
                                            name="favoriteBand"
                                            value={favoriteBand}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => searchArtists(e.target.value)}
                                            placeholder="Type to search bands..."
                                            className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white dark:text-gray-900"
                                        />

                                        {/* Menu déroulant des suggestions */}
                                        {showSuggestions && (
                                            <div
                                                className="absolute z-50 w-full bg-[#1c1c2e] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl mt-1 overflow-hidden shadow-2xl max-h-60">
                                                {isSearching ? (
                                                    <div className="flex items-center justify-center p-4">
                                                        <Loader2 className="animate-spin text-blue-500" size={20}/>
                                                    </div>
                                                ) : (
                                                    suggestions.map((item: { name: string }, i: number) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={(): void => {
                                                                setFavoriteBand(item.name);
                                                                setShowSuggestions(false);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-[#2a2a40] dark:hover:bg-gray-100 transition-colors text-white dark:text-gray-800"
                                                        >
                                                            <Music size={14} className="text-gray-400"/>
                                                            {item.name}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Champ Biographie */}
                                <div>
                                    <label
                                        className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
                                        <span>{t("label_bio")}</span>
                                        <span
                                            className="text-slate-500 text-[11px] font-normal">{biography.length}/{BIO_MAX}</span>
                                    </label>
                                    <textarea
                                        name="biography"
                                        rows={3}
                                        value={biography}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => e.target.value.length <= BIO_MAX && setBiography(e.target.value)}
                                        className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none text-white dark:text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Barre d'action Footer */}
                            <div
                                className="pt-6 border-t border-slate-800 dark:border-gray-100 flex justify-between items-center">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 px-4 py-2 rounded-lg font-bold transition-all"
                                >
                                    <LogOut size={18}/> {t("btn_logout")}
                                </button>
                                <div className="flex items-center gap-4">
                                    {isSaved && (
                                        <span
                                            className="flex items-center gap-1 text-emerald-500 text-sm font-bold animate-pulse">
                                            <CheckCircle
                                                size={16}/> {statusMessage}
                                        </span>
                                    )}
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="flex items-center justify-center min-w-35 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18}/> : t("btn_save")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- ONGLET : SÉCURITÉ --- */}
                    {activeTab === "Privacy" && (
                        <div className="space-y-8 animate-in fade-in duration-300 flex flex-col items-center">
                            <h3 className="text-lg font-bold text-white dark:text-gray-900 w-full max-w-xl">{t("security_title")}</h3>
                            <div className="space-y-4 max-w-xl w-full">
                                <input
                                    type="password"
                                    placeholder={t("old_password_placeholder")}
                                    value={oldPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
                                    className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white dark:text-gray-900"
                                />
                                <input
                                    type="password"
                                    placeholder={t("new_password_placeholder")}
                                    value={newPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                    className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white dark:text-gray-900"
                                />
                                <button
                                    onClick={handleUpdatePassword}
                                    disabled={loading}
                                    className="w-full flex justify-center items-center bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18}/> : t("btn_update_password")}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- ONGLET : DONNÉES --- */}
                    {activeTab === "Data" && (
                        <div className="text-center py-12 space-y-6">
                            <Database size={48} className="mx-auto text-slate-600 mb-4"/>
                            <h3 className="text-xl font-bold text-white dark:text-gray-900">{t("data_title")}</h3>
                            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                <button
                                    className="flex justify-center items-center gap-2 bg-slate-800 p-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all text-white">
                                    <ExternalLink size={16}/> {t("btn_export_data")}
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