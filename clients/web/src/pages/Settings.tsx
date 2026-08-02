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
    Music2,
    Link2,
    Unlink,
    Loader2,
    Settings as SettingsIcon,
    AtSign,
    Sparkles,
    AlertTriangle,
    Download,
} from "lucide-react";
import {NavigateFunction, useNavigate, useSearchParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {jwtDecode} from "jwt-decode";
import {toast} from "react-toastify";
import apiClient from "../api/client";
import {AxiosResponse} from "axios";
import {useConfirm} from "../context/ConfirmContext";
import {toImageDataUri} from "../utils/imageDataUri";

type TabType = "Profile" | "Privacy" | "Data" | "Connections";

const USERNAME_MAX: number = 20;
const PSEUDO_MAX: number = 30;
const BIO_MAX: number = 150;

const Settings: React.FC = () => {
    const {t} = useTranslation();
    const confirm = useConfirm();
    const navigate: NavigateFunction = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>("Profile");

    const [spotifyConnected, setSpotifyConnected] = useState(false);
    const [spotifyDisplayName, setSpotifyDisplayName] = useState<string | null>(null);
    const [loadingSpotify, setLoadingSpotify] = useState(false);

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
                    const formattedPic = toImageDataUri(user.profile_picture) as string;

                    setProfilePicture(formattedPic);
                    localStorage.setItem("user_profile_pic", formattedPic);
                }
            } catch (e) {
                console.error("Erreur lors du chargement du profil:", e);
            }
        };

        loadUserData();
    }, []);

    const fetchSpotifyStatus = async (): Promise<void> => {
        try {
            const res: AxiosResponse = await apiClient.get("/api/spotify/status");
            setSpotifyConnected(!!res.data.connected);
            setSpotifyDisplayName(res.data.display_name || null);
        } catch (e) {
            console.error("Erreur lors de la vérification du compte Spotify:", e);
        }
    };

    useEffect((): void => {
        fetchSpotifyStatus();
    }, []);

    useEffect((): void => {
        const spotifyParam: string | null = searchParams.get("spotify");
        if (!spotifyParam) return;

        if (spotifyParam === "connected") {
            toast.success(t("spotify_link_success", "Compte Spotify lié avec succès !"));
            fetchSpotifyStatus();
        } else if (spotifyParam === "error") {
            toast.error(t("spotify_link_error", "Échec de la liaison avec Spotify."));
        }

        setActiveTab("Connections");
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("spotify");
        setSearchParams(nextParams, {replace: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleConnectSpotify = (): void => {
        const token: string | null = localStorage.getItem("token") || localStorage.getItem("userToken");
        if (!token) {
            toast.error(t("must_be_logged_in", "Vous devez être connecté."));
            return;
        }
        const apiUrl: string = import.meta.env.VITE_API_URL;
        window.location.href = `${apiUrl}/api/spotify/connect?token=${encodeURIComponent(token)}`;
    };

    const handleDisconnectSpotify = async (): Promise<void> => {
        const ok: boolean = await confirm({
            title: t("spotify_unlink_title", "Délier Spotify"),
            message: t("spotify_unlink_confirm", "Voulez-vous vraiment délier votre compte Spotify ?"),
            confirmText: t("spotify_unlink_confirm_btn", "Délier"),
            danger: true,
        });
        if (!ok) return;

        try {
            setLoadingSpotify(true);
            await apiClient.delete("/api/spotify/disconnect");
            setSpotifyConnected(false);
            setSpotifyDisplayName(null);
            toast.success(t("spotify_unlink_success", "Compte Spotify délié."));
        } catch (err) {
            console.error(err);
            toast.error(t("spotify_unlink_error", "Erreur lors de la déliaison."));
        } finally {
            setLoadingSpotify(false);
        }
    };

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

    const TABS: {id: TabType; label: string; icon: React.ReactNode}[] = [
        {id: "Profile", label: t("tab_profile"), icon: <User size={18}/>},
        {id: "Privacy", label: t("tab_security"), icon: <Shield size={18}/>},
        {id: "Connections", label: t("tab_connections", "Connexions"), icon: <Link2 size={18}/>},
        {id: "Data", label: t("tab_data"), icon: <Database size={18}/>},
    ];

    return (
        <div
            className="min-h-screen bg-[#13131A] dark:bg-slate-50 text-slate-200 dark:text-gray-900 p-6 md:p-10 font-sans transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                        <SettingsIcon size={22} className="text-white"/>
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-gray-900"
                            style={{fontFamily: "'Orbitron', sans-serif"}}>
                            {t("settings_title")}
                        </h1>
                        <p className="text-slate-400 dark:text-gray-600 text-sm mt-0.5">{t("settings_subtitle")}</p>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                    {/* Navigation Onglets */}
                    <nav
                        className="flex md:flex-col gap-1.5 w-full md:w-56 flex-shrink-0 overflow-x-auto md:overflow-visible pb-1 md:pb-0 md:sticky md:top-10">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 md:flex-shrink md:whitespace-normal border ${
                                    activeTab === tab.id
                                        ? "bg-blue-600/10 border-blue-500/40 text-blue-400 dark:bg-blue-50 dark:border-blue-300 dark:text-blue-600"
                                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5 dark:hover:text-gray-900 dark:hover:bg-gray-100"
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>

                    <main
                        className="flex-1 w-full bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl p-6 md:p-8 shadow-xl transition-colors min-h-125">

                        {/* --- ONGLET : PROFIL --- */}
                        {activeTab === "Profile" && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <section className="flex flex-col items-center sm:flex-row gap-6 pb-6 border-b border-slate-800 dark:border-gray-100">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative group w-24 h-24 rounded-full bg-slate-800 ring-4 ring-blue-500/20 border-2 border-blue-500 flex items-center justify-center overflow-hidden cursor-pointer shadow-lg flex-shrink-0"
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
                                    <div className="text-center sm:text-left">
                                        <p className="font-bold text-white dark:text-gray-900">{pseudo || username || "—"}</p>
                                        <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                                            {t("avatar_hint", "Clique sur l'avatar pour changer ta photo de profil.")}
                                        </p>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*"
                                           onChange={handleImageUpload}/>
                                </section>

                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400 mb-4">
                                        {t("settings_section_info", "Informations générales")}
                                    </h3>
                                    <div className="grid gap-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Champ Username */}
                                            <div>
                                                <label
                                                    className="flex justify-between items-center gap-2 text-xs font-bold text-slate-400 mb-2 uppercase">
                                                    <span className="flex items-center gap-1.5"><AtSign size={12}/> {t("label_username")}</span>
                                                    <span
                                                        className="text-slate-500 text-[11px] font-normal">{username.length}/{USERNAME_MAX}</span>
                                                </label>
                                                <input
                                                    name="username"
                                                    value={username}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.value.length <= USERNAME_MAX && setUsername(e.target.value)}
                                                    className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 text-white dark:text-gray-900 transition-colors"
                                                />
                                                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5">
                                                    {t("username_hint", "Identifiant unique (@) utilisé pour vous retrouver.")}
                                                </p>
                                            </div>

                                            {/* Champ Pseudo (nom d'affichage, non unique) */}
                                            <div>
                                                <label
                                                    className="flex justify-between items-center gap-2 text-xs font-bold text-slate-400 mb-2 uppercase">
                                                    <span className="flex items-center gap-1.5"><User size={12}/> {t("label_pseudo")}</span>
                                                    <span
                                                        className="text-slate-500 text-[11px] font-normal">{pseudo.length}/{PSEUDO_MAX}</span>
                                                </label>
                                                <input
                                                    name="pseudo"
                                                    value={pseudo}
                                                    placeholder={t("pseudo_placeholder", "Votre nom d'affichage")}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.value.length <= PSEUDO_MAX && setPseudo(e.target.value)}
                                                    className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 text-white dark:text-gray-900 placeholder:text-slate-600 transition-colors"
                                                />
                                                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5">
                                                    {t("pseudo_hint", "Nom affiché sur votre profil (peut être identique à d'autres).")}
                                                </p>
                                            </div>

                                            {/* Champ Favorite Band avec suggestions */}
                                            <div className="relative">
                                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2 uppercase">
                                                    <Music size={12}/> {t("label_favorite_band")}
                                                </label>
                                                <input
                                                    name="favoriteBand"
                                                    value={favoriteBand}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => searchArtists(e.target.value)}
                                                    placeholder={t("favorite_band_placeholder", "Rechercher un artiste...")}
                                                    className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 text-white dark:text-gray-900 transition-colors"
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
                                                className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 resize-none text-white dark:text-gray-900 transition-colors"
                                            />
                                        </div>
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
                                            className="flex items-center justify-center min-w-35 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={18}/> : t("btn_save")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- ONGLET : SÉCURITÉ --- */}
                        {activeTab === "Privacy" && (
                            <div className="space-y-6 animate-in fade-in duration-300 max-w-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <Shield size={18} className="text-blue-400"/>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white dark:text-gray-900">{t("security_title")}</h3>
                                        <p className="text-xs text-slate-400 dark:text-gray-500">
                                            {t("security_subtitle", "Choisis un mot de passe que tu n'utilises nulle part ailleurs.")}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="password"
                                        placeholder={t("old_password_placeholder")}
                                        value={oldPassword}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
                                        className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 text-white dark:text-gray-900 transition-colors"
                                    />
                                    <input
                                        type="password"
                                        placeholder={t("new_password_placeholder")}
                                        value={newPassword}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                        className="w-full bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 text-white dark:text-gray-900 transition-colors"
                                    />
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={loading}
                                        className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18}/> : t("btn_update_password")}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- ONGLET : CONNEXIONS --- */}
                        {activeTab === "Connections" && (
                            <div className="space-y-6 animate-in fade-in duration-300 max-w-xl">
                                <div>
                                    <h3 className="text-lg font-bold text-white dark:text-gray-900">
                                        {t("connections_title", "Comptes liés")}
                                    </h3>
                                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                                        {t("connections_subtitle", "Connecte des services externes pour enrichir ton expérience Melodia.")}
                                    </p>
                                </div>

                                <div
                                    className="flex items-center justify-between gap-4 bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-2xl px-5 py-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                            <Music2 size={22} className="text-emerald-500"/>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white dark:text-gray-900">Spotify</p>
                                            <p className="text-xs text-slate-400 dark:text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${spotifyConnected ? "bg-emerald-500" : "bg-slate-600"}`}/>
                                                <span className="truncate">
                                                    {spotifyConnected
                                                        ? t("spotify_connected_as", "Connecté en tant que {{name}}", {name: spotifyDisplayName || "—"})
                                                        : t("spotify_not_connected", "Non connecté")}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {spotifyConnected ? (
                                        <button
                                            onClick={handleDisconnectSpotify}
                                            disabled={loadingSpotify}
                                            className="flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex-shrink-0"
                                        >
                                            {loadingSpotify ? <Loader2 className="animate-spin" size={16}/> :
                                                <Unlink size={16}/>}
                                            {t("btn_unlink", "Délier")}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleConnectSpotify}
                                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
                                        >
                                            <Link2 size={16}/>
                                            {t("btn_link", "Lier")}
                                        </button>
                                    )}
                                </div>

                                <div
                                    className="flex items-center gap-4 bg-transparent border border-dashed border-slate-800 dark:border-gray-200 rounded-2xl px-5 py-4 opacity-60">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 dark:bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Sparkles size={20} className="text-slate-500"/>
                                    </div>
                                    <p className="text-sm text-slate-400 dark:text-gray-500">
                                        {t("more_integrations_soon", "D'autres intégrations arriveront bientôt.")}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* --- ONGLET : DONNÉES --- */}
                        {activeTab === "Data" && (
                            <div className="space-y-4 animate-in fade-in duration-300 max-w-xl">
                                <h3 className="text-lg font-bold text-white dark:text-gray-900">{t("data_title")}</h3>

                                <div
                                    className="flex items-center justify-between gap-4 bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-2xl px-5 py-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-11 h-11 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                            <Download size={18} className="text-blue-400"/>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white dark:text-gray-900">{t("btn_export_data")}</p>
                                            <p className="text-xs text-slate-400 dark:text-gray-500">
                                                {t("export_data_desc", "Télécharge une copie de tes données Melodia.")}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        className="flex items-center gap-2 bg-slate-800 dark:bg-gray-200 hover:bg-slate-700 dark:hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-bold text-white dark:text-gray-900 transition-all flex-shrink-0">
                                        <ExternalLink size={16}/> {t("btn_export_data")}
                                    </button>
                                </div>

                                <div
                                    className="flex items-center justify-between gap-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl px-5 py-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-11 h-11 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle size={18} className="text-rose-500"/>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-rose-400">{t("danger_zone", "Zone de danger")}</p>
                                            <p className="text-xs text-slate-400 dark:text-gray-500">
                                                {t("danger_zone_desc", "Cette action est irréversible.")}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        className="flex items-center gap-2 border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-shrink-0">
                                        <Trash2 size={16}/> {t("btn_delete_account")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Settings;