import React, {useState, useEffect, useRef} from "react";
import {
    Calendar,
    Settings,
    Camera,
    UserPlus,
    UserCheck,
    Heart,
    Flag,
    Music,
    Plus,
    Coins,
    Sparkles,
    X,
    Image as ImageIcon,
    ArrowLeft,
    MoreVertical,
    Star,
    MessageSquare,
    ChevronRight,
} from "lucide-react";
import {NavigateFunction, useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {jwtDecode} from "jwt-decode";
import {toast} from "react-toastify";
import apiClient from "../api/client";
import {useConfirm} from "../context/ConfirmContext";
import AvatarBorder, {isValidBorder} from "../components/AvatarBorder";
import {AlbumCard} from "../components/AlbumCard";
import {AxiosResponse} from "axios";

const formatReviewItem = (
    item: any,
    username: string,
    currentUserId?: string,
) => {
    const content = item.media?.content;
    const isLastFm: boolean = !!content?.album;

    let userHasLiked: boolean = !!item.isLiked || !!item.review?.isLiked;

    if (!userHasLiked && currentUserId) {
        const likesArray = item.likes || item.review?.likes;

        if (Array.isArray(likesArray)) {
            userHasLiked = likesArray.some((like: any): boolean => {
                if (typeof like === "string" || typeof like === "number") {
                    return String(like) === String(currentUserId);
                }
                return String(like?.user_id || "") === String(currentUserId);
            });
        }
    }

    return {
        id: item.id,
        review_id: item.review_id || item.id,
        media_id: item.media_id,
        user_name: item.user?.pseudo || item.user?.username || username,
        album: isLastFm ? content.album.name : content?.name,
        artist: isLastFm ? content.album.artist : content?.artist,
        cover: isLastFm
            ? content.album.image?.find((img: any): boolean => img.size === "extralarge")?.[
            "#text"
            ] || content.album.image?.[0]?.["#text"]
            : content?.cover,
        rating: item.rating,
        content: item.content,
        likes_count: item.likes_count ?? item._count?.likes ?? 0,
        comments_count: item.comments_count ?? item._count?.comments ?? 0,
        isLiked: userHasLiked,
    };
};

const getRatingColors = (rating: number) => {
    if (rating >= 4.5) return { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-500", border: "border-emerald-500/20", fill: "#10b981" };
    if (rating >= 3.5) return { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-500", border: "border-blue-500/20", fill: "#3b82f6" };
    if (rating >= 2.5) return { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-500", border: "border-amber-500/20", fill: "#f59e0b" };
    if (rating >= 1.5) return { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-500", border: "border-orange-500/20", fill: "#f97316" };
    return { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-500", border: "border-rose-500/20", fill: "#f43f5e" };
};

const Profil: React.FC = () => {
    const navigate: NavigateFunction = useNavigate();
    const {id: externalUserId} = useParams<{ id: string }>();
    const {t} = useTranslation(); // <-- Utilisation de t()
    const confirm = useConfirm();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const isInteracting = useRef(false);

    const [activeTab, setActiveTab] = useState("favorites");
    const [userProfil, setUserProfil] = useState<any>(null);
    const [userConnected, setUserConnected] = useState<string>("");
    const [showCosmetics, setShowCosmetics] = useState<boolean>(false);
    const [cosmeticNames, setCosmeticNames] = useState<Record<string, string>>({});
    const [equipping, setEquipping] = useState<string | null>(null);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [favoriteReviews, setFavoriteReviews] = useState<any[]>([]);
    const [followCounts, setFollowCounts] = useState({
        followers: 0,
        following: 0,
    });
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [activityOffset, setActivityOffset] = useState(0);
    const [hasMoreActivity, setHasMoreActivity] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);

    useEffect((): void => {
        loadData();
    }, [externalUserId]);

    useEffect((): () => void => {
        const handleProfileUpdate: () => void = (): void => {
            loadData();
        };

        window.addEventListener("profileUpdated", handleProfileUpdate);
        return () =>
            window.removeEventListener("profileUpdated", handleProfileUpdate);
    }, [userConnected]);

    useEffect((): void => {
        if (
            activeTab === "activity" &&
            recentActivity.length === 0 &&
            userProfil?.id
        ) {
            const token: string | null = localStorage.getItem("token");
            if (token && !userConnected) return;

            fetchRecentActivity(0, userProfil.id);
        }
    }, [activeTab, userProfil?.id, userConnected]);

    const loadData: () => Promise<void> = async (): Promise<void> => {
        setLoading(true);

        setRecentActivity([]);
        setActivityOffset(0);
        setHasMoreActivity(true);

        try {
            const token: string | null = localStorage.getItem("token");
            if (!token) return;
            const decoded: any = jwtDecode(token);
            const currentUserId: string = String(decoded.id);
            setUserConnected(currentUserId);

            const targetId: string = externalUserId ? String(externalUserId) : currentUserId;
            const ownProfile: boolean = targetId === currentUserId;
            setIsOwnProfile(ownProfile);

            const promises: Promise<any>[] = [
                fetchProfile(targetId),
                fetchPlaylists(targetId, ownProfile),
                fetchFavoriteAlbums(targetId),
                fetchFollowCounts(targetId),
            ];

            if (!ownProfile) {
                promises.push(checkFollowStatus(targetId, currentUserId));
            }

            await Promise.all(promises);
        } catch (error) {
            console.error("Erreur chargement profil web:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async (userId: string): Promise<void> => {
        try {
            const response: AxiosResponse<any, any> = await apiClient.get(`/users/public/${userId}`);
            const userData = response.data.user || response.data;
            setUserProfil(userData);
        } catch (error: any) {
            console.error("❌ Erreur Profil :", error.response?.status);
        }
    };

    const checkFollowStatus = async (
        targetUserId: string,
        currentUserId: string,
    ): Promise<void> => {
        try {
            const response: AxiosResponse<any, any> = await apiClient.get(
                `/follows/following/${currentUserId}`,
            );
            const followingList = response.data.data || [];
            const alreadyFollowing = followingList.some(
                (item: any): boolean => String(item.follow_user_id) === String(targetUserId),
            );
            setIsFollowing(alreadyFollowing);
        } catch (error: any) {
            console.error("❌ Erreur Statut Follow :", error.response?.status);
        }
    };

    const fetchFollowCounts = async (userId: string): Promise<void> => {
        try {
            const [resFollowers, resFollowing] = await Promise.all([
                apiClient.get(`/follows/followers/${userId}`),
                apiClient.get(`/follows/following/${userId}`),
            ]);
            const followersCount = resFollowers.data.count ?? (resFollowers.data.data?.length || 0);
            const fontlowingCount = resFollowing.data.count ?? (resFollowing.data.data?.length || 0);

            setFollowCounts({
                followers: followersCount,
                following: fontlowingCount,
            });
        } catch (error: any) {
            console.error("❌ Erreur Follow Counts :", error.response?.status);
        }
    };

    const handleFollowToggle = async (): Promise<void> => {
        if (!userProfil?.id || !userConnected || isInteracting.current) return;
        isInteracting.current = true;

        const previousStatus: boolean = isFollowing;
        const previousFollowers: number = followCounts.followers;

        setIsFollowing(!previousStatus);
        setFollowCounts((prev) => ({
            ...prev,
            followers: previousStatus
                ? Math.max(0, prev.followers - 1)
                : prev.followers + 1,
        }));

        try {
            if (previousStatus) {
                await apiClient.delete(`/follows/`, {
                    data: {user_id: userConnected, follow_user_id: userProfil.id},
                });
            } else {
                await apiClient.post(`/follows/`, {
                    user_id: userConnected,
                    follow_user_id: userProfil.id,
                });
            }
            await fetchFollowCounts(userProfil.id);
        } catch (error) {
            console.error("Erreur Follow/Unfollow:", error);
            toast.error(t("alert_follow_error")); // <-- Traduit
            setIsFollowing(previousStatus);
            setFollowCounts((prev) => ({...prev, followers: previousFollowers}));
        } finally {
            isInteracting.current = false;
        }
    };

    const fetchPlaylists = async (
        userId: string,
        ownProfile: boolean,
    ): Promise<void> => {
        try {
            const response: AxiosResponse<any, any> = await apiClient.get(`/playlists/user/${userId}`);
            const allPlaylists = response.data.playlists || [];
            const filtered = ownProfile
                ? allPlaylists
                : allPlaylists.filter((p: any): boolean => p.is_public === true);
            setPlaylists(filtered);
        } catch (error: any) {
            console.error("❌ Erreur Playlists :", error.response?.status);
        }
    };

    const fetchPlaylistDetails: (id: string) => Promise<void> = async (id: string): Promise<void> => {
        try {
            const res: AxiosResponse<any, any> = await apiClient.get(`/playlists/${id}`);
            setSelectedPlaylist(res.data.playlist);
        } catch (error) {
            console.error("Erreur chargement détails playlist:", error);
            toast.error(t("alert_playlist_load_error")); // <-- Traduit
        }
    };

    const removeItem = async (
        e: React.MouseEvent,
        playlistItemId: string,
        mediaTitle: string,
    ): Promise<void> => {
        e.stopPropagation();
        const ok = await confirm({
            title: t("remove_item_title", "Retirer de la playlist"),
            message: t("confirm_remove_item", {title: mediaTitle}),
            confirmText: t("remove", "Retirer"),
            danger: true,
        });
        if (!ok) return;
        try {
            await apiClient.delete(`/playlist-items/${playlistItemId}`);
            setSelectedPlaylist((prev: any) => ({
                ...prev,
                items: prev.items.filter((i: any): boolean => i.id !== playlistItemId),
            }));
            toast.success(t("item_removed_success", "Élément retiré."));
        } catch (error) {
            console.error("Erreur suppression:", error);
            toast.error(t("alert_item_remove_error")); // <-- Traduit
        }
    };

    const openCosmetics = async (): Promise<void> => {
        setShowCosmetics(true);
        try {
            const res = await apiClient.get("/users/cosmetics/catalog");
            const map: Record<string, string> = {};
            (res.data.catalog || []).forEach((c: any) => {
                map[c.id] = c.name;
            });
            setCosmeticNames(map);
        } catch (e) {
            console.error("Erreur chargement catalogue cosmétiques:", e);
        }
    };

    const equipBorder = async (cosmeticId: string | null): Promise<void> => {
        setEquipping(cosmeticId || "none");
        try {
            const res = await apiClient.post("/users/cosmetics/equip", {
                cosmetic_id: cosmeticId,
            });
            setUserProfil((prev: any) => ({
                ...prev,
                equipped_avatar_border: res.data.equipped_avatar_border,
            }));
            window.dispatchEvent(new Event("profileUpdated"));
            toast.success(
                cosmeticId
                    ? t("cosmetic_equipped", "Contour équipé !")
                    : t("cosmetic_unequipped", "Contour retiré."),
            );
        } catch (e: any) {
            toast.error(e.response?.data?.message || t("cosmetic_equip_error", "Action impossible."));
        } finally {
            setEquipping(null);
        }
    };

    const handleProfilePictureClick = (): void => {
        if (isOwnProfile && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file: File | undefined = e.target.files?.[0];
        if (!file) return;

        const reader: FileReader = new FileReader();
        reader.onloadend = (): void => {
            const base64Result: string = reader.result as string;
            const base64Image: string = base64Result.split(",")[1];
            uploadProfilePicture(base64Image, base64Result);
        };
        reader.readAsDataURL(file);
    };

    const uploadProfilePicture = async (
        base64Image: string,
        localUri: string,
    ): Promise<void> => {
        try {
            setUserProfil((prev: any) => ({...prev, profile_picture: localUri}));

            await apiClient.put(`/users/${userConnected}`, {
                profile_picture: base64Image,
            });

            const user = JSON.parse(localStorage.getItem("user") || "{}");
            user.profile_picture = localUri;
            localStorage.setItem("user", JSON.stringify(user));

            window.dispatchEvent(new Event("profileUpdated"));
            toast.success(t("alert_pfp_success")); // <-- Traduit
        } catch (error) {
            console.error("Erreur upload image:", error);
            toast.error(t("alert_pfp_error")); // <-- Traduit
            await fetchProfile(userConnected);
        }
    };

    const handleBannerClick = (): void => {
        if (isOwnProfile && bannerInputRef.current) {
            bannerInputRef.current.click();
        }
    };

    const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file: File | undefined = e.target.files?.[0];
        if (!file) return;

        const reader: FileReader = new FileReader();
        reader.onloadend = (): void => {
            const base64Result: string = reader.result as string;
            const base64Image: string = base64Result.split(",")[1];
            uploadBanner(base64Image, base64Result);
        };
        reader.readAsDataURL(file);
    };

    const uploadBanner = async (
        base64Image: string,
        localUri: string,
    ): Promise<void> => {
        try {
            setUserProfil((prev: any) => ({...prev, banner: localUri}));

            await apiClient.put(`/users/${userConnected}`, {
                banner: base64Image,
            });

            toast.success(t("alert_banner_success"));
        } catch (error) {
            console.error("Erreur upload bannière:", error);
            toast.error(t("alert_banner_error"));
            await fetchProfile(userConnected);
        }
    };

    const fetchFavoriteAlbums = async (userId: string): Promise<void> => {
        try {
            const response: AxiosResponse<any, any> = await apiClient.get(`/reviews/user/${userId}/top`);
            const rawData = response.data.data || [];

            const normalizedData = rawData.map((item: any): any => {
                const content = item.media?.content;
                if (content?.album) {
                    return {
                        ...item,
                        media: {
                            ...item.media,
                            content: {
                                name: content.album.name,
                                artist: content.album.artist,
                                cover:
                                    content.album.image?.find(
                                        (img: any): boolean => img.size === "extralarge",
                                    )?.["#text"] || content.album.image?.[0]?.["#text"],
                            },
                        },
                    };
                }
                return item;
            });
            setFavoriteReviews(normalizedData);
        } catch (error: any) {
            console.error("❌ Erreur Favorite Albums :", error.response?.status);
        }
    };

    const fetchRecentActivity = async (offset: number, userId: string): Promise<void> => {
        if (loadingMore || (!hasMoreActivity && offset !== 0)) return;
        setLoadingMore(true);

        try {
            const response: AxiosResponse<any, any> = await apiClient.get(`/reviews/user/${userId}/activity`, {
                params: {
                    limit: 10,
                    offset: offset,
                    currentUserId: userConnected,
                },
            });

            const newItems = (response.data.data || []).map((review: any) =>
                formatReviewItem(review, userProfil?.pseudo || userProfil?.username || "User", userConnected),
            );

            if (offset === 0) setRecentActivity(newItems);
            else setRecentActivity((prev: any[]) => [...prev, ...newItems]);

            setHasMoreActivity(newItems.length === 10);
            setActivityOffset(offset + newItems.length);
        } catch (error: any) {
            console.error("❌ Erreur Activité :", error.response?.status);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleLike = async (id: string): Promise<void> => {
        if (!userConnected || isInteracting.current) return;
        isInteracting.current = true;

        setRecentActivity((prevActivity: any[]) => {
            return prevActivity.map((item): any => {
                if (item.id === id) {
                    const currentlyLiked: boolean = !!item.isLiked;
                    return {
                        ...item,
                        isLiked: !currentlyLiked,
                        likes_count: currentlyLiked
                            ? Math.max(0, item.likes_count - 1)
                            : item.likes_count + 1,
                    };
                }
                return item;
            });
        });

        const targetItem = recentActivity.find((f): boolean => f.id === id);
        if (!targetItem) {
            isInteracting.current = false;
            return;
        }

        try {
            const response: AxiosResponse<any, any> = await apiClient.post(`/reviews/likes/toggle`, {
                review_id: targetItem.review_id,
                user_id: userConnected,
            });

            setRecentActivity((prevActivity: any[]) =>
                prevActivity.map((item: any) =>
                    item.id === id
                        ? {
                            ...item,
                            isLiked: response.data.isLiked,
                            likes_count: response.data.likes_count,
                        }
                        : item,
                ),
            );
        } catch (error) {
            setRecentActivity(recentActivity);
        } finally {
            isInteracting.current = false;
        }
    };

    const submitReport = async (): Promise<void> => {
        if (!reportReason.trim()) {
            toast.error(t("report_alert_empty")); // <-- Traduit
            return;
        }

        setIsSubmittingReport(true);

        try {
            await apiClient.post(`/reports/profile`, {
                reporter_id: userConnected,
                profile_id: userProfil?.id,
                reason: reportReason,
                reason_type: "profile",
            });
            toast.success(t("report_alert_success")); // <-- Traduit
            setIsReportModalOpen(false);
            setReportReason("");
        } catch (error) {
            console.error("Erreur lors du signalement:", error);
            toast.error(t("report_alert_error")); // <-- Traduit
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const formatPlaylistImage = (imgUrl: string): string => {
        if (!imgUrl) return "";
        if (imgUrl.startsWith("data") || imgUrl.startsWith("http")) {
            return imgUrl;
        }
        return `data:image/jpeg;base64,${imgUrl}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#13131A] dark:bg-slate-50 flex items-center justify-center transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const tabs = [
        {id: "favorites", label: t("tab_favorite_albums")},
        {id: "playlists", label: `${t("tab_playlists")} (${playlists.length})`},
        {id: "activity", label: t("tab_recent_activity")},
    ];

    return (
        <div
            className="min-h-screen bg-[#13131A] text-slate-200 dark:bg-slate-50 dark:text-gray-900 font-sans transition-colors duration-300">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            <input
                type="file"
                ref={bannerInputRef}
                onChange={handleBannerFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Header */}
            <div className="relative">
                <div
                    onClick={handleBannerClick}
                    className={`h-56 md:h-72 lg:h-80 w-full bg-cover bg-center relative group ${isOwnProfile ? "cursor-pointer" : ""}`}
                    style={{
                        backgroundImage: `url('${
                            userProfil?.banner
                                ? (userProfil.banner.startsWith("data") || userProfil.banner.startsWith("http")
                                    ? userProfil.banner
                                    : `data:image/jpeg;base64,${userProfil.banner}`)
                                : "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1600"
                        }')`,
                    }}
                >
                    {/* Léger dégradé en bas seulement (pas de flou) pour détacher l'avatar — la bannière reste nette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
                    {isOwnProfile && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-black/30 transition-all">
                            <div className="flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm">
                                <ImageIcon size={16}/>
                                {t("change_banner")}
                            </div>
                        </div>
                    )}
                </div>

                {/* Zone des infos du profil */}
                <div className="max-w-6xl mx-auto px-6">
                    <div className="relative -mt-12 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                            <AvatarBorder borderId={userProfil?.equipped_avatar_border} className="z-10">
                            <div
                                onClick={handleProfilePictureClick}
                                className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-[#0f1117] dark:border-slate-50 flex items-center justify-center text-white text-4xl font-bold shadow-xl z-10 transition-colors relative overflow-hidden group ${isOwnProfile ? "cursor-pointer" : ""}`}
                            >
                                {userProfil?.profile_picture &&
                                typeof userProfil.profile_picture === "string" ? (
                                    <img
                                        src={
                                            userProfil.profile_picture.startsWith("data") ||
                                            userProfil.profile_picture.startsWith("http")
                                                ? userProfil.profile_picture
                                                : `data:image/jpeg;base64,${userProfil.profile_picture}`
                                        }
                                        alt="Profil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                                        {(userProfil?.pseudo || userProfil?.username)?.substring(0, 2).toUpperCase()}
                                    </div>
                                )}

                                {isOwnProfile && (
                                    <div
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Camera size={24} className="text-white"/>
                                    </div>
                                )}
                            </div>
                            </AvatarBorder>

                            <div className="pb-2">
                                <h1
                                    className="text-4xl font-bold text-white dark:text-gray-900 tracking-tight"
                                    style={{fontFamily: "'Orbitron', sans-serif"}}
                                >
                                    {userProfil?.pseudo || userProfil?.username}
                                </h1>
                                <p className="text-slate-400 dark:text-gray-600 font-medium">
                                    @{userProfil?.username?.toLowerCase()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-end mb-2">
                            {isOwnProfile ? (
                                <>
                                    <button
                                        onClick={openCosmetics}
                                        className="flex items-center gap-2 bg-purple-600/90 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                                    >
                                        <Sparkles size={16}/>
                                        {t("cosmetics", "Cosmétiques")}
                                    </button>
                                    <button
                                        onClick={() => navigate("/settings")}
                                        className="flex items-center gap-2 bg-slate-800/80 dark:bg-white hover:bg-slate-700 dark:hover:bg-gray-100 text-slate-100 dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-slate-700 dark:border-gray-200 shadow-sm"
                                    >
                                        <Settings size={16}/>
                                        {t("profile_edit_btn")}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleFollowToggle}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border shadow-sm ${
                                            isFollowing
                                                ? "bg-transparent border-slate-700 dark:border-gray-300 text-slate-300 dark:text-gray-700 hover:bg-slate-800/40"
                                                : "bg-blue-600 border-blue-600 text-white hover:bg-blue-500"
                                        }`}
                                    >
                                        {isFollowing ? (
                                            <UserCheck size={16}/>
                                        ) : (
                                            <UserPlus size={16}/>
                                        )}
                                        {isFollowing ? "Following" : "Follow"}
                                    </button>

                                    <button
                                        onClick={() => setIsReportModalOpen(true)}
                                        className="p-2.5 bg-slate-800/80 dark:bg-white border border-slate-700 dark:border-gray-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-500/50 dark:hover:text-red-600 dark:hover:border-red-500/50 transition-all shadow-sm"
                                        title={t("report_title")}
                                    >
                                        <Flag size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Biographie & Méta-données */}
                    <div className="max-w-2xl space-y-4">
                        <p className="text-slate-200 dark:text-gray-700 leading-relaxed text-lg whitespace-pre-wrap break-words">
                            {userProfil?.biography || t("profile_no_bio")}
                        </p>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400 dark:text-gray-500 text-sm">
                            {userProfil?.favorite_band && (
                                <div className="flex items-center gap-1.5">
                                    <Music size={16} className="text-blue-400 dark:text-blue-500 shrink-0"/>
                                    <span className="text-slate-300 dark:text-gray-600">
                                        <span className="text-slate-500 dark:text-gray-400">{t("label_favorite_band")} : </span>
                                        {userProfil.favorite_band}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Calendar
                                    size={16}
                                    className="text-slate-500 dark:text-gray-400"
                                />
                                {t("profile_member_since")}{" "}
                                {userProfil?.created_at
                                    ? (() => {
                                        const date: Date = new Date(userProfil.created_at);
                                        const day: string = String(date.getDate()).padStart(2, "0");
                                        const month: string = String(date.getMonth() + 1).padStart(
                                            2,
                                            "0",
                                        );
                                        const year: number = date.getFullYear();
                                        return `${day}/${month}/${year}`;
                                    })()
                                    : ""}
                            </div>
                        </div>
                        <div className="flex gap-8 pt-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-white dark:text-gray-900 font-bold text-lg">
                                  {followCounts.followers}
                                </span>
                                <span className="text-slate-500 dark:text-gray-500 text-sm">
                                  {t("profile_followers")}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-white dark:text-gray-900 font-bold text-lg">
                                  {followCounts.following}
                                </span>
                                <span className="text-slate-500 dark:text-gray-500 text-sm">
                                  {t("profile_following")}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-white dark:text-gray-900 font-bold text-lg">
                                  {favoriteReviews.length}
                                </span>
                                <span className="text-slate-500 dark:text-gray-500 text-sm">
                                  {t("profile_albums")}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Navigation des Onglets cachée si on regarde le détail d'une playlist */}
            {!selectedPlaylist && (
                <div className="max-w-6xl mx-auto px-6 mt-12">
                    <div
                        className="bg-slate-900/50 dark:bg-white border border-slate-800 dark:border-gray-200 p-1 rounded-xl flex items-center justify-between shadow-inner transition-colors">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                                    activeTab === tab.id
                                        ? "bg-slate-800 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md"
                                        : "text-slate-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 hover:bg-slate-800/40 dark:hover:bg-gray-50"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <main className="max-w-6xl mx-auto px-6 py-10">
                {selectedPlaylist ? (
                    <div className="space-y-8 animate-fadeIn">
                        <button
                            onClick={() => setSelectedPlaylist(null)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-900 transition-colors mb-4"
                        >
                            <ArrowLeft size={20}/> {t("back") || "Retour"}
                        </button>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div
                                className="w-48 h-48 md:w-56 md:h-56 bg-slate-900 dark:bg-gray-100 rounded-2xl overflow-hidden shadow-2xl shrink-0">
                                {selectedPlaylist.image_url ? (
                                    <img
                                        src={formatPlaylistImage(selectedPlaylist.image_url)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center text-slate-600 dark:text-gray-400">
                                        {t("no_cover") || "Sans couverture"}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-4 mt-2">
                                <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-gray-900 tracking-tight">
                                    {selectedPlaylist.name}
                                </h1>
                                <p className="text-slate-500 dark:text-gray-500 font-medium">
                                    {selectedPlaylist.items?.length || 0} Albums
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-800 dark:border-gray-200">
                            <h2 className="text-2xl font-bold mb-6 text-white dark:text-gray-900">
                                Albums
                            </h2>
                            {selectedPlaylist.items && selectedPlaylist.items.length > 0 ? (
                                <div
                                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10">
                                    {selectedPlaylist.items.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-3 group cursor-pointer relative"
                                            onClick={() => navigate(`/album/${item.media_id}`)}
                                        >
                                            {isOwnProfile && (
                                                <button
                                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                                                        removeItem(e, item.id, item.media?.title || "Album")
                                                    }
                                                    className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-rose-500/80 backdrop-blur-md p-1.5 rounded-lg text-white transition-colors"
                                                >
                                                    <MoreVertical size={16}/>
                                                </button>
                                            )}

                                            <div
                                                className="aspect-square bg-slate-900 dark:bg-gray-100 rounded-2xl overflow-hidden shadow-lg relative border border-transparent dark:border-gray-200 group-hover:border-slate-700 dark:group-hover:border-gray-300 transition-colors">
                                                <img
                                                    src={item.media?.cover || item.image}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {item.media?.rating > 0 && (
                                                    <div
                                                        className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                                                        <span className="text-yellow-400">★</span>
                                                        <span className="text-white text-xs font-bold">
                                                          {item.media.rating}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-1">
                                                <h4 className="font-bold text-white dark:text-gray-900 text-lg truncate">
                                                    {item.media?.title || item.title}
                                                </h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 font-medium py-12">
                                    {t("empty_playlist")}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {activeTab === "favorites" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {favoriteReviews.map((item) => (
                                    <AlbumCard
                                        key={item.id}
                                        id={item.media_id}
                                        title={item.media?.content?.name}
                                        artist={item.media?.content?.artist}
                                        rating={item.rating}
                                        genre={item.media?.content?.genre || ""}
                                        cover={item.media?.content?.cover}
                                    />
                                ))}
                            </div>
                        )}

                        {activeTab === "playlists" && (
                            <div className="space-y-4 w-full">
                                {isOwnProfile && (
                                    <button
                                        onClick={() => navigate("/create-playlist")}
                                        className="w-full flex items-center gap-5 bg-[#1a1d26] dark:bg-white border border-dashed border-slate-600 dark:border-gray-300 p-5 rounded-2xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-[#1e2230] dark:hover:bg-gray-50 transition-all group"
                                    >
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-800/60 dark:bg-gray-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-700 dark:border-gray-200 group-hover:border-blue-500/50 transition-colors">
                                            <Plus size={28} className="text-slate-400 dark:text-gray-400 group-hover:text-blue-400 dark:group-hover:text-blue-500 group-hover:scale-110 transition-all"/>
                                        </div>
                                        <span className="text-slate-400 dark:text-gray-500 font-semibold text-lg group-hover:text-blue-400 dark:group-hover:text-blue-500 transition-colors">
                                            {t("create_playlist_card")}
                                        </span>
                                    </button>
                                )}
                                {playlists.map((playlist) => {
                                    // Récupère dynamiquement le nombre de titres selon ce que renvoie ton API
                                    const tracksCount = playlist.items?.length ?? playlist._count?.items ?? playlist.items_count ?? 0;

                                    return (
                                        <div
                                            key={playlist.id}
                                            onClick={() => fetchPlaylistDetails(playlist.id)}
                                            className="flex items-center gap-5 bg-[#1a1d26] dark:bg-white border border-slate-800/80 dark:border-gray-200 p-5 rounded-2xl cursor-pointer hover:border-slate-700/50 dark:hover:border-gray-300 transition-all shadow-md group"
                                        >
                                            {/* Pochette de la Playlist */}
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-800 dark:bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-md relative border border-slate-800/50 dark:border-gray-200">
                                                {playlist.image_url ? (
                                                    <img
                                                        src={formatPlaylistImage(playlist.image_url)}
                                                        alt={playlist.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <Music size={32} className="text-blue-500 group-hover:scale-110 transition-transform duration-300"/>
                                                )}
                                            </div>

                                            {/* Informations textuelles */}
                                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <h4 className="text-white dark:text-gray-900 font-bold text-lg md:text-xl truncate group-hover:text-blue-400 dark:group-hover:text-blue-600 transition-colors">
                                                        {playlist.name}
                                                    </h4>
                                                    <p className="text-sm text-slate-400 dark:text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
                                                        <Music size={14} className="text-slate-500" />
                                                        <span>
                                                            {tracksCount} {tracksCount > 1 ? t("track_plural") : t("track_singular")}
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Badges de Statut & Indicateur d'action */}
                                                <div className="flex items-center gap-4 self-start sm:self-center">
                                                    {String(playlist.is_public) === "false" ? (
                                                        <span className="bg-amber-500/10 text-amber-500 dark:text-amber-600 border border-amber-500/20 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                                                            {t("status_private")}
                                                        </span>
                                                    ) : (
                                                        <span className="bg-emerald-500/10 text-emerald-500 dark:text-emerald-600 border border-emerald-500/20 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                                                            {t("status_public")}
                                                        </span>
                                                    )}
                                                    <ChevronRight
                                                        size={20}
                                                        className="text-slate-500 dark:text-gray-400 group-hover:text-white dark:group-hover:text-gray-900 group-hover:translate-x-1 transition-all hidden sm:block"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {playlists.length === 0 && (
                                    <p className="text-slate-500 font-medium py-12 text-center">
                                        {t("empty_playlists_list")}
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === "activity" && (
                            <div className="space-y-4 w-full">
                                {recentActivity.map((item) => {
                                    const ratingColors = getRatingColors(item.rating);

                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-[#1a1d26] dark:bg-white border border-slate-800/80 dark:border-gray-200 p-6 rounded-2xl shadow-md flex gap-5 md:gap-6 transition-all hover:border-slate-700/50 group"
                                        >
                                            <div
                                                onClick={() => navigate(`/album/${item.media_id}`)}
                                                className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-xl overflow-hidden shrink-0 shadow-lg cursor-pointer relative border border-slate-800/60 dark:border-gray-100"
                                            >
                                                <img
                                                    src={item.cover}
                                                    alt={item.album}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Music size={20} className="text-white opacity-80" />
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                                <div>
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <div className="text-sm md:text-base min-w-0">
                                                            <span className="font-bold text-white dark:text-gray-900 truncate block sm:inline">
                                                                {item.user_name}
                                                            </span>
                                                            <span className="text-slate-400 dark:text-gray-500 sm:ml-1.5 text-xs sm:text-sm">
                                                                {t("activity_rated")}
                                                            </span>
                                                            <span
                                                                onClick={() => navigate(`/album/${item.media_id}`)}
                                                                className="font-semibold text-indigo-400 dark:text-indigo-600 hover:underline sm:ml-1.5 cursor-pointer truncate block sm:inline"
                                                            >
                                                                {item.album}
                                                            </span>
                                                            <span className="text-slate-500 dark:text-gray-400 text-xs md:text-sm block sm:ml-1.5 sm:inline">
                                                                {t("activity_by")} {item.artist}
                                                            </span>
                                                        </div>

                                                        {/* Badge de Note dynamique */}
                                                        {item.rating > 0 && (
                                                            <div className={`flex items-center gap-1 ${ratingColors.bg} ${ratingColors.text} px-3 py-1 rounded-full text-xs md:text-sm font-bold border ${ratingColors.border} shrink-0 shadow-sm`}>
                                                                <Star size={14} fill={ratingColors.fill} className={ratingColors.text} />
                                                                <span>{item.rating}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {item.content && (
                                                        <div className="relative bg-slate-900/40 dark:bg-gray-50 p-4 rounded-xl border border-slate-800/40 dark:border-gray-100/80 my-2">
                                                            <p className="text-slate-300 dark:text-gray-600 text-sm md:text-base leading-relaxed italic">
                                                                "{item.content}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-5 mt-2 pt-2 border-t border-slate-800/40 dark:border-gray-100/60">
                                                    <button
                                                        onClick={() => handleLike(item.id)}
                                                        className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold transition-colors ${
                                                            item.isLiked
                                                                ? "text-pink-500"
                                                                : "text-slate-400 hover:text-pink-500 dark:text-gray-500 dark:hover:text-pink-600"
                                                        }`}
                                                    >
                                                        <Heart
                                                            size={15}
                                                            fill={item.isLiked ? "#ec4899" : "none"}
                                                            className={item.isLiked ? "text-pink-500" : ""}
                                                        />
                                                        <span>{item.likes_count} {item.likes_count > 1 ? t("like_plural") : t("like_singular")}</span>
                                                    </button>

                                                    <div className="flex items-center gap-1.5 text-xs md:text-sm text-slate-500 dark:text-gray-400 font-medium">
                                                        <MessageSquare size={15} />
                                                        <span>{item.comments_count} {item.comments_count > 1 ? t("comment_plural") : t("comment_singular")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {hasMoreActivity && (
                                    <div className="text-center pt-4">
                                        <button
                                            onClick={() =>
                                                fetchRecentActivity(activityOffset, userProfil.id)
                                            }
                                            disabled={loadingMore}
                                            className="text-sm font-bold text-blue-500 dark:text-blue-600 hover:underline disabled:opacity-50"
                                        >
                                            {loadingMore ? t("loading") : t("load_more")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {isReportModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                        <div
                            className="bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 p-6 rounded-xl shadow-2xl w-full max-w-md">
                            <h3 className="text-xl font-bold text-white dark:text-gray-900 mb-4">
                                {t("report_title")} {userProfil?.username}
                            </h3>

                            <p className="text-sm text-slate-400 dark:text-gray-600 mb-4">
                                {t("report_desc")}
                            </p>

                            <textarea
                                value={reportReason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReportReason(e.target.value)}
                                placeholder={t("report_placeholder")}
                                className="w-full h-32 p-3 bg-slate-900/50 dark:bg-gray-50 border border-slate-700 dark:border-gray-300 rounded-lg text-white dark:text-gray-900 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors resize-none mb-6"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={(): void => {
                                        setIsReportModalOpen(false);
                                        setReportReason("");
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 dark:text-gray-600 hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors"
                                    disabled={isSubmittingReport}
                                >
                                    {t("report_btn_cancel")}
                                </button>
                                <button
                                    onClick={submitReport}
                                    disabled={isSubmittingReport || !reportReason.trim()}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmittingReport ? t("report_btn_sending") : t("report_btn_submit")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modale : gérer les cosmétiques (profil perso) */}
                {showCosmetics && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowCosmetics(false)}
                    >
                        <div
                            className="w-full max-w-lg bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 border-b border-slate-800 dark:border-slate-200">
                                <h2 className="text-lg font-bold text-white dark:text-gray-900 flex items-center gap-2">
                                    <Sparkles size={18} className="text-purple-400"/>
                                    {t("my_cosmetics", "Mes contours")}
                                </h2>
                                <button
                                    onClick={() => setShowCosmetics(false)}
                                    className="p-1.5 rounded-full text-slate-500 hover:text-white dark:hover:text-gray-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                                >
                                    <X size={20}/>
                                </button>
                            </div>

                            <div className="overflow-y-auto p-5">
                                {(() => {
                                    const ownedBorders: string[] = (userProfil?.owned_cosmetics || []).filter((id: string) => isValidBorder(id));
                                    const pic: string | null =
                                        userProfil?.profile_picture && typeof userProfil.profile_picture === "string"
                                            ? (userProfil.profile_picture.startsWith("data") || userProfil.profile_picture.startsWith("http")
                                                ? userProfil.profile_picture
                                                : `data:image/jpeg;base64,${userProfil.profile_picture}`)
                                            : null;
                                    const equipped: string | null = userProfil?.equipped_avatar_border || null;

                                    const PreviewInner = (
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 dark:bg-gray-100 flex items-center justify-center">
                                            {pic ? (
                                                <img src={pic} alt="" className="w-full h-full object-cover"/>
                                            ) : (
                                                <span className="text-sm font-bold text-blue-400">
                                                    {(userProfil?.pseudo || userProfil?.username)?.substring(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    );

                                    if (ownedBorders.length === 0) {
                                        return (
                                            <div className="text-center py-8">
                                                <p className="text-sm text-slate-400 dark:text-gray-500 mb-5">
                                                    {t("no_owned_cosmetics", "Tu n'as pas encore de contour. Visite la boutique pour en débloquer !")}
                                                </p>
                                                <button
                                                    onClick={() => navigate("/shop")}
                                                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                                                >
                                                    <Coins size={16}/>
                                                    {t("go_to_shop", "Aller à la boutique")}
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-5">
                                            {/* Option "Aucun" */}
                                            <button
                                                onClick={() => equipBorder(null)}
                                                disabled={equipping !== null}
                                                className="flex flex-col items-center gap-2 disabled:opacity-50"
                                            >
                                                <div className={`p-1 rounded-full ${!equipped ? "ring-2 ring-purple-500" : ""}`}>
                                                    {PreviewInner}
                                                </div>
                                                <span className={`text-xs ${!equipped ? "text-purple-400 dark:text-purple-500 font-bold" : "text-slate-400 dark:text-gray-500"}`}>
                                                    {t("none", "Aucun")}
                                                </span>
                                            </button>

                                            {/* Contours possédés */}
                                            {ownedBorders.map((id: string) => (
                                                <button
                                                    key={id}
                                                    onClick={() => equipBorder(id)}
                                                    disabled={equipping !== null}
                                                    className="flex flex-col items-center gap-2 disabled:opacity-50"
                                                >
                                                    <div className={`p-1 rounded-full ${equipped === id ? "ring-2 ring-purple-500" : ""}`}>
                                                        <AvatarBorder borderId={id}>
                                                            {PreviewInner}
                                                        </AvatarBorder>
                                                    </div>
                                                    <span className={`text-xs truncate max-w-full ${equipped === id ? "text-purple-400 dark:text-purple-500 font-bold" : "text-slate-400 dark:text-gray-500"}`}>
                                                        {cosmeticNames[id] || id}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profil;