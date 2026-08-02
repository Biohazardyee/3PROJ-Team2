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
    ShieldCheck,
    ShieldAlert,
    Smartphone,
    KeyRound,
    X,
} from "lucide-react";
import {NavigateFunction, useNavigate, useSearchParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {jwtDecode} from "jwt-decode";
import {toast} from "react-toastify";
import apiClient from "../api/client";
import {AxiosResponse} from "axios";
import {useConfirm} from "../context/ConfirmContext";
import {toImageDataUri} from "../utils/imageDataUri";
import {resetOwnedThemesCache} from "../useDarkMode";

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

    const [twofaEnabled, setTwofaEnabled] = useState(false);
    const [twofaSetup, setTwofaSetup] = useState<{ secret: string; qrCodeDataUri: string } | null>(null);
    const [twofaConfirmCode, setTwofaConfirmCode] = useState("");
    const [twofaDisableCode, setTwofaDisableCode] = useState("");
    const [showTwofaDisable, setShowTwofaDisable] = useState(false);
    const [twofaLoading, setTwofaLoading] = useState(false);
    const [backupCodesToShow, setBackupCodesToShow] = useState<string[] | null>(null);
    const [showRegenerateInput, setShowRegenerateInput] = useState(false);
    const [regenerateCode, setRegenerateCode] = useState("");
    const [exportLoading, setExportLoading] = useState(false);

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

                const fullRes: AxiosResponse = await apiClient.get(`/users/${decodedId}`);
                setTwofaEnabled(!!fullRes.data.user?.twofa_enabled);
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
    const handleStartTwofaSetup = async (): Promise<void> => {
        try {
            setTwofaLoading(true);
            const res: AxiosResponse = await apiClient.post("/users/2fa/setup");
            setTwofaSetup({ secret: res.data.secret, qrCodeDataUri: res.data.qrCodeDataUri });
        } catch (err: any) {
            toast.error(err.response?.data?.message || t("twofa_setup_error", "Erreur lors de l'activation de la 2FA."));
        } finally {
            setTwofaLoading(false);
        }
    };

    const handleCancelTwofaSetup = (): void => {
        setTwofaSetup(null);
        setTwofaConfirmCode("");
    };

    const handleConfirmTwofa = async (): Promise<void> => {
        if (twofaConfirmCode.length !== 6) return;

        try {
            setTwofaLoading(true);
            const res: AxiosResponse = await apiClient.post("/users/2fa/confirm", { code: twofaConfirmCode });
            setTwofaEnabled(true);
            setTwofaSetup(null);
            setTwofaConfirmCode("");
            setBackupCodesToShow(res.data.backupCodes || null);
            toast.success(t("twofa_enable_success", "Double authentification activée !"));
        } catch (err: any) {
            toast.error(err.response?.data?.message || t("twofa_confirm_error", "Code invalide."));
        } finally {
            setTwofaLoading(false);
        }
    };

    const handleRegenerateBackupCodes = async (): Promise<void> => {
        if (regenerateCode.length !== 6) return;

        try {
            setTwofaLoading(true);
            const res: AxiosResponse = await apiClient.post("/users/2fa/backup-codes/regenerate", { code: regenerateCode });
            setBackupCodesToShow(res.data.backupCodes || null);
            setShowRegenerateInput(false);
            setRegenerateCode("");
            toast.success(t("twofa_backup_regenerate_success", "Nouveaux codes de secours générés."));
        } catch (err: any) {
            toast.error(err.response?.data?.message || t("twofa_confirm_error", "Code invalide."));
        } finally {
            setTwofaLoading(false);
        }
    };

    const handleDownloadBackupCodes = (): void => {
        if (!backupCodesToShow) return;

        const blob = new Blob([backupCodesToShow.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "melodia-2fa-backup-codes.txt";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const handleDisableTwofa = async (): Promise<void> => {
        if (twofaDisableCode.length !== 6) return;

        try {
            setTwofaLoading(true);
            await apiClient.post("/users/2fa/disable", { code: twofaDisableCode });
            setTwofaEnabled(false);
            setShowTwofaDisable(false);
            setTwofaDisableCode("");
            toast.success(t("twofa_disable_success", "Double authentification désactivée."));
        } catch (err: any) {
            toast.error(err.response?.data?.message || t("twofa_disable_error", "Code invalide."));
        } finally {
            setTwofaLoading(false);
        }
    };

    const handleExportData = async (): Promise<void> => {
        try {
            setExportLoading(true);
            const res: AxiosResponse = await apiClient.get("/users/export");

            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `melodia-export-${username || "data"}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || t("export_data_error", "Erreur lors de l'export des données."));
        } finally {
            setExportLoading(false);
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
        resetOwnedThemesCache();
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
                                {backupCodesToShow && (
                                    <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-bold text-amber-400 flex items-center gap-2">
                                                    <KeyRound size={16}/> {t("twofa_backup_codes_title", "Tes codes de secours")}
                                                </h3>
                                                <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                                                    {t("twofa_backup_codes_hint", "Sauvegarde-les dans un endroit sûr : chacun ne fonctionne qu'une seule fois et te permet de te connecter si tu perds l'accès à ton application d'authentification.")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-[#13131A] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl p-4">
                                            {backupCodesToShow.map((c) => (
                                                <span key={c} className="text-slate-200 dark:text-gray-800 select-all">{c}</span>
                                            ))}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={handleDownloadBackupCodes}
                                                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 dark:bg-gray-200 hover:bg-slate-700 dark:hover:bg-gray-300 text-white dark:text-gray-900 px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
                                            >
                                                <Download size={16}/> {t("twofa_backup_codes_download", "Télécharger (.txt)")}
                                            </button>
                                            <button
                                                onClick={() => setBackupCodesToShow(null)}
                                                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-amber-500/20 transition-all"
                                            >
                                                {t("twofa_backup_codes_saved", "Je les ai sauvegardés")}
                                            </button>
                                        </div>
                                    </div>
                                )}

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

                                {/* --- Double authentification (2FA) --- */}
                                <div className="pt-6 border-t border-slate-800 dark:border-gray-100 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${twofaEnabled ? "bg-emerald-500/10" : "bg-slate-800 dark:bg-gray-100"}`}>
                                            {twofaEnabled
                                                ? <ShieldCheck size={18} className="text-emerald-500"/>
                                                : <ShieldAlert size={18} className="text-slate-400"/>}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white dark:text-gray-900">
                                                {t("twofa_title", "Double authentification (2FA)")}
                                            </h3>
                                            <p className="text-xs text-slate-400 dark:text-gray-500">
                                                {twofaEnabled
                                                    ? t("twofa_status_enabled", "Activée — ton compte est protégé par une application d'authentification.")
                                                    : t("twofa_status_disabled", "Désactivée — ajoute une couche de sécurité supplémentaire.")}
                                            </p>
                                        </div>
                                    </div>

                                    {!twofaEnabled && !twofaSetup && (
                                        <button
                                            onClick={handleStartTwofaSetup}
                                            disabled={twofaLoading}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                                        >
                                            {twofaLoading ? <Loader2 className="animate-spin" size={16}/> : <Smartphone size={16}/>}
                                            {t("twofa_enable_btn", "Activer la 2FA")}
                                        </button>
                                    )}

                                    {twofaSetup && (
                                        <div className="bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-2xl p-5 space-y-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm text-slate-300 dark:text-gray-700">
                                                    {t("twofa_scan_hint", "Scanne ce QR code avec ton application d'authentification (Google Authenticator, Authy...), puis entre le code généré.")}
                                                </p>
                                                <button onClick={handleCancelTwofaSetup} className="text-slate-500 hover:text-white dark:hover:text-gray-900 flex-shrink-0" type="button">
                                                    <X size={18}/>
                                                </button>
                                            </div>

                                            <div className="flex justify-center">
                                                <img src={twofaSetup.qrCodeDataUri} alt="QR code 2FA" className="w-44 h-44 rounded-xl border border-slate-800 dark:border-gray-200 bg-white p-2"/>
                                            </div>

                                            <div className="flex items-center gap-2 justify-center text-xs text-slate-500 dark:text-gray-500">
                                                <KeyRound size={14}/>
                                                <code className="select-all">{twofaSetup.secret}</code>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    value={twofaConfirmCode}
                                                    onChange={(e) => setTwofaConfirmCode(e.target.value.replace(/\D/g, ""))}
                                                    placeholder="123456"
                                                    className="flex-1 bg-[#1c1c27] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-center text-xl tracking-[0.4em] font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 text-white dark:text-gray-900 transition-colors"
                                                />
                                                <button
                                                    onClick={handleConfirmTwofa}
                                                    disabled={twofaLoading || twofaConfirmCode.length !== 6}
                                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                                                >
                                                    {twofaLoading ? <Loader2 className="animate-spin" size={18}/> : t("twofa_confirm_btn", "Confirmer")}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {twofaEnabled && (
                                        <div className="space-y-3">
                                            {!showRegenerateInput ? (
                                                <button
                                                    onClick={() => setShowRegenerateInput(true)}
                                                    className="flex items-center gap-2 text-slate-300 dark:text-gray-700 hover:bg-white/5 dark:hover:bg-gray-100 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border border-slate-800 dark:border-gray-200"
                                                >
                                                    <KeyRound size={16}/> {t("twofa_backup_regenerate_btn", "Régénérer mes codes de secours")}
                                                </button>
                                            ) : (
                                                <div className="bg-[#13131A] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-2xl p-5 space-y-3">
                                                    <p className="text-sm text-slate-300 dark:text-gray-700">
                                                        {t("twofa_backup_regenerate_hint", "Entre le code de ton application d'authentification. Tes anciens codes de secours deviendront invalides.")}
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={6}
                                                            value={regenerateCode}
                                                            onChange={(e) => setRegenerateCode(e.target.value.replace(/\D/g, ""))}
                                                            placeholder="123456"
                                                            className="flex-1 bg-[#1c1c27] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-center text-xl tracking-[0.4em] font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 text-white dark:text-gray-900 transition-colors"
                                                        />
                                                        <button
                                                            onClick={handleRegenerateBackupCodes}
                                                            disabled={twofaLoading || regenerateCode.length !== 6}
                                                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                                                        >
                                                            {twofaLoading ? <Loader2 className="animate-spin" size={18}/> : t("twofa_confirm_btn", "Confirmer")}
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => { setShowRegenerateInput(false); setRegenerateCode(""); }}
                                                        className="text-xs text-slate-400 dark:text-gray-500 hover:underline"
                                                        type="button"
                                                    >
                                                        {t("cancel", "Annuler")}
                                                    </button>
                                                </div>
                                            )}

                                            {!showTwofaDisable ? (
                                                <button
                                                    onClick={() => setShowTwofaDisable(true)}
                                                    className="flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
                                                >
                                                    {t("twofa_disable_btn", "Désactiver la 2FA")}
                                                </button>
                                            ) : (
                                                <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 space-y-3">
                                                    <p className="text-sm text-slate-300 dark:text-gray-700">
                                                        {t("twofa_disable_hint", "Entre le code de ton application d'authentification pour confirmer la désactivation.")}
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={6}
                                                            value={twofaDisableCode}
                                                            onChange={(e) => setTwofaDisableCode(e.target.value.replace(/\D/g, ""))}
                                                            placeholder="123456"
                                                            className="flex-1 bg-[#13131A] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-center text-xl tracking-[0.4em] font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 text-white dark:text-gray-900 transition-colors"
                                                        />
                                                        <button
                                                            onClick={handleDisableTwofa}
                                                            disabled={twofaLoading || twofaDisableCode.length !== 6}
                                                            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
                                                        >
                                                            {twofaLoading ? <Loader2 className="animate-spin" size={18}/> : t("twofa_disable_confirm_btn", "Confirmer")}
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => { setShowTwofaDisable(false); setTwofaDisableCode(""); }}
                                                        className="text-xs text-slate-400 dark:text-gray-500 hover:underline"
                                                        type="button"
                                                    >
                                                        {t("cancel", "Annuler")}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                        onClick={handleExportData}
                                        disabled={exportLoading}
                                        className="flex items-center gap-2 bg-slate-800 dark:bg-gray-200 hover:bg-slate-700 dark:hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-bold text-white dark:text-gray-900 transition-all flex-shrink-0 disabled:opacity-50">
                                        {exportLoading ? <Loader2 className="animate-spin" size={16}/> : <ExternalLink size={16}/>}
                                        {t("btn_export_data")}
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