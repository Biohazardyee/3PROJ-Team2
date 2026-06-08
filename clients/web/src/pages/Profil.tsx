import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Settings,
  Camera,
  UserPlus,
  UserCheck,
  Heart,
  Flag,
  Music,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import apiClient from "../api/client";
import { AlbumCard } from "../components/AlbumCard";

const formatReviewItem = (
  item: any,
  username: string,
  currentUserId?: string,
) => {
  const content = item.media?.content;
  const isLastFm: boolean = !!content?.album;

  // 1. On part de ce que donne le backend (vrai ou faux)
  let userHasLiked = !!item.isLiked;

  // 2. Si le backend dit false mais qu'on a un currentUserId et des likes disponibles
  if (!userHasLiked && currentUserId) {
    // On gère le cas où les likes sont sur l'item ou imbriqués dans item.review
    const likesArray = item.likes || item.review?.likes;

    if (Array.isArray(likesArray)) {
      userHasLiked = likesArray.some((like: any) => {
        // Cas A : Le tableau contient directement des chaînes de caractères (ex: ["id1", "id2"])
        if (typeof like === "string" || typeof like === "number") {
          return String(like) === String(currentUserId);
        }
        // Cas B : Le tableau contient des objets (ex: { user_id: "id1" } ou { userId: "id1" })
        return (
          String(like?.user_id || "") === String(currentUserId) ||
          String(like?.userId || "") === String(currentUserId) ||
          String(like?.id || "") === String(currentUserId)
        );
      });
    }
  }

  return {
    id: item.id,
    review_id: item.review_id || item.id,
    media_id: item.media_id,
    // Affiche le nom de l'auteur de la review s'il est présent, sinon fallback sur le username du profil
    user_name: item.user?.username || username,
    album: isLastFm ? content.album.name : content?.name,
    artist: isLastFm ? content.album.artist : content?.artist,
    cover: isLastFm
      ? content.album.image?.find((img: any) => img.size === "extralarge")?.[
          "#text"
        ] || content.album.image?.[0]?.["#text"]
      : content?.cover,
    rating: item.rating,
    content: item.content,
    likes_count: item.likes_count ?? item._count?.likes ?? 0,
    comments_count: item.comments_count ?? item._count?.comments ?? 0,
    isLiked: userHasLiked, // On applique notre résultat calculé
  };
};

const Profil: React.FC = () => {
  const navigate = useNavigate();
  const { id: externalUserId } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInteracting = useRef(false);

  const [activeTab, setActiveTab] = useState("favorites");
  const [userProfil, setUserProfil] = useState<any>(null);
  const [userConnected, setUserConnected] = useState<string>("");
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

  useEffect(() => {
    loadData();
  }, [externalUserId]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      loadData();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [userConnected]);

  useEffect(() => {
    if (
      activeTab === "activity" &&
      recentActivity.length === 0 &&
      userProfil?.id
    ) {
      fetchRecentActivity(0, userProfil.id);
    }
  }, [activeTab, userProfil?.id, userConnected]);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const decoded: any = jwtDecode(token);
      const currentUserId = String(decoded.id);
      setUserConnected(currentUserId);

      const targetId = externalUserId ? String(externalUserId) : currentUserId;
      const ownProfile = targetId === currentUserId;
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
      const response = await apiClient.get(`/users/public/${userId}`);
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
      const response = await apiClient.get(
        `/follows/following/${currentUserId}`,
      );
      const followingList = response.data.data || [];
      const alreadyFollowing = followingList.some(
        (item: any) => String(item.follow_user_id) === String(targetUserId),
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
      const followersCount =
        resFollowers.data.count ?? (resFollowers.data.data?.length || 0);
      const followingCount =
        resFollowing.data.count ?? (resFollowing.data.data?.length || 0);

      setFollowCounts({ followers: followersCount, following: followingCount });
    } catch (error: any) {
      console.error("❌ Erreur Follow Counts :", error.response?.status);
    }
  };

  const handleFollowToggle = async (): Promise<void> => {
    if (!userProfil?.id || !userConnected || isInteracting.current) return;
    isInteracting.current = true;

    const previousStatus = isFollowing;
    const previousFollowers = followCounts.followers;

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
          data: { user_id: userConnected, follow_user_id: userProfil.id },
        });
      } else {
        await apiClient.post(`/follows/`, {
          user_id: userConnected,
          follow_user_id: userProfil.id,
        });
      }
      fetchFollowCounts(userProfil.id);
    } catch (error) {
      console.error("Erreur Follow/Unfollow:", error);
      alert("Impossible de mettre à jour le follow.");
      setIsFollowing(previousStatus);
      setFollowCounts((prev) => ({ ...prev, followers: previousFollowers }));
    } finally {
      isInteracting.current = false;
    }
  };

  const fetchPlaylists = async (
    userId: string,
    ownProfile: boolean,
  ): Promise<void> => {
    try {
      const response = await apiClient.get(`/playlists/user/${userId}`);
      const allPlaylists = response.data.playlists || [];
      const filtered = ownProfile
        ? allPlaylists
        : allPlaylists.filter((p: any) => p.is_public === true);
      setPlaylists(filtered);
    } catch (error: any) {
      console.error("❌ Erreur Playlists :", error.response?.status);
    }
  };

  const handleProfilePictureClick = (): void => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Result = reader.result as string;
      const base64Image = base64Result.split(",")[1];
      uploadProfilePicture(base64Image, base64Result);
    };
    reader.readAsDataURL(file);
  };

  const uploadProfilePicture = async (
    base64Image: string,
    localUri: string,
  ): Promise<void> => {
    try {
      setUserProfil((prev: any) => ({ ...prev, profile_picture: localUri }));

      await apiClient.put(`/users/${userConnected}`, {
        profile_picture: base64Image,
      });

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.profile_picture = localUri;
      localStorage.setItem("user", JSON.stringify(user));

      window.dispatchEvent(new Event("profileUpdated"));
      alert("Votre photo de profil a été mise à jour !");
    } catch (error) {
      console.error("Erreur upload image:", error);
      alert("Impossible de mettre à jour la photo de profil.");
      fetchProfile(userConnected);
    }
  };

  const fetchFavoriteAlbums = async (userId: string): Promise<void> => {
    try {
      const response = await apiClient.get(`/reviews/user/${userId}/top`);
      const rawData = response.data.data || [];

      const normalizedData = rawData.map((item: any) => {
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
                    (img: any) => img.size === "extralarge",
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

  const fetchRecentActivity = async (offset: number, userId: string) => {
    if (loadingMore || (!hasMoreActivity && offset !== 0)) return;
    setLoadingMore(true);

    try {
      const response = await apiClient.get(`/reviews/user/${userId}/activity`, {
        params: {
          limit: 10,
          offset: offset,
          currentUserId: userConnected,
        },
      });

      const newItems = (response.data.data || []).map((review: any) =>
        formatReviewItem(review, userProfil?.username || "User", userConnected),
      );

      if (offset === 0) setRecentActivity(newItems);
      else setRecentActivity((prev) => [...prev, ...newItems]);

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

    setRecentActivity((prevActivity) => {
      return prevActivity.map((item) => {
        if (item.id === id) {
          const currentlyLiked = !!item.isLiked;
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

    const targetItem = recentActivity.find((f) => f.id === id);
    if (!targetItem) {
      isInteracting.current = false;
      return;
    }

    try {
      const response = await apiClient.post(`/reviews/likes/toggle`, {
        review_id: targetItem.review_id,
        user_id: userConnected,
      });

      setRecentActivity((prevActivity) =>
        prevActivity.map((item) =>
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
      // En cas d'erreur, on remet l'état précédent
      setRecentActivity(recentActivity);
    } finally {
      isInteracting.current = false;
    }
  };

  const submitReport = async (): Promise<void> => {
    if (!reportReason.trim()) {
      alert("Veuillez entrer une raison pour le signalement.");
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
      alert("Utilisateur signalé avec succès.");
      setIsReportModalOpen(false);
      setReportReason("");
    } catch (error) {
      console.error("Erreur lors du signalement:", error);
      alert("Erreur lors du signalement.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Helper pour formater proprement les URLs d'images de playlists
  const formatPlaylistImage = (imgUrl: string) => {
    if (!imgUrl) return "";
    if (imgUrl.startsWith("data") || imgUrl.startsWith("http")) {
      return imgUrl;
    }
    return `data:image/jpeg;base64,${imgUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: "favorites", label: t("tab_favorite_albums") },
    { id: "playlists", label: `${t("tab_playlists")} (${playlists.length})` },
    { id: "activity", label: t("tab_recent_activity") },
  ];

  return (
    /* CORRECTION ICI : Inversion des classes bg/text pour le mode sombre (Inverser si vous vouliez un site clair par défaut) */
    <div className="min-h-screen bg-[#0f1117] text-slate-200 dark:bg-slate-50 dark:text-gray-900 font-sans transition-colors duration-300">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="relative">
        <div className="h-48 md:h-64 w-full bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>

        {/* Zone des infos du profil */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative -mt-12 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
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
                    {userProfil?.username?.substring(0, 2).toUpperCase()}
                  </div>
                )}

                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                )}
              </div>

              <div className="pb-2">
                <h1
                  className="text-4xl font-bold text-white dark:text-gray-900 tracking-tight"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {userProfil?.username}
                </h1>
                <p className="text-slate-400 dark:text-gray-600 font-medium">
                  @{userProfil?.username?.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-end mb-2">
              {isOwnProfile ? (
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-2 bg-slate-800/80 dark:bg-white hover:bg-slate-700 dark:hover:bg-gray-100 text-slate-100 dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-slate-700 dark:border-gray-200 shadow-sm"
                >
                  <Settings size={16} />
                  {t("profile_edit_btn")}
                </button>
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
                      <UserCheck size={16} />
                    ) : (
                      <UserPlus size={16} />
                    )}
                    {isFollowing ? "Following" : "Follow"}
                  </button>

                  <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="p-2 bg-slate-800/80 border border-slate-700 dark:border-gray-200 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      title="Signaler l'utilisateur"
                  >
                    <Flag size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Biographie & Méta-données */}
          <div className="max-w-2xl space-y-4">
            <p className="text-slate-200 dark:text-gray-700 leading-relaxed text-lg">
              {userProfil?.biography || "No biography yet."}
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400 dark:text-gray-500 text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin
                  size={16}
                  className="text-slate-500 dark:text-gray-400"
                />
                {userProfil?.location || t("profile_location")}
              </div>
              <div className="flex items-center gap-1.5">
                <LinkIcon
                  size={16}
                  className="text-slate-500 dark:text-gray-400"
                />
                <a
                  href="#"
                  className="text-blue-400 dark:text-blue-600 hover:underline"
                >
                  {userProfil?.website ||
                    `${userProfil?.username?.toLowerCase()}.com`}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar
                  size={16}
                  className="text-slate-500 dark:text-gray-400"
                />
                {t("profile_member_since")}{" "}
                {userProfil?.created_at
                  ? (() => {
                      const date = new Date(userProfil.created_at);
                      const day = String(date.getDate()).padStart(2, "0");
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0",
                      );
                      const year = date.getFullYear();
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

      {/* Navigation des Onglets */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="bg-slate-900/50 dark:bg-white border border-slate-800 dark:border-gray-200 p-1 rounded-xl flex items-center justify-between shadow-inner transition-colors">
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

      {/* Contenu des Onglets */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Onglet 1 : Albums Favoris */}
        {activeTab === "favorites" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoriteReviews.map((item) => (
              <AlbumCard
                key={item.id}
                id={item.media_id}
                title={item.media?.content?.name}
                artist={item.media?.content?.artist}
                year={item.media?.content?.year || 2024}
                rating={item.rating}
                genre={item.media?.content?.genre || ""}
                cover={item.media?.content?.cover}
              />
            ))}
          </div>
        )}

        {/* Onglet 2 : Playlists */}
        {activeTab === "playlists" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() =>
                  navigate(
                    `/playlistdetails?id=${playlist.id}&title=${encodeURIComponent(playlist.name)}`,
                  )
                }
                className="flex items-center gap-4 bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 p-3 rounded-xl cursor-pointer hover:border-slate-700 dark:hover:border-gray-300 transition-all shadow-sm"
              >
                <div className="w-14 h-14 bg-slate-800 dark:bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {playlist.image_url ? (
                    <img
                      src={formatPlaylistImage(playlist.image_url)} // CORRECTION ICI
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music size={24} className="text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white dark:text-gray-900 font-semibold truncate">
                    {playlist.name}
                  </h4>
                  {String(playlist.is_public) === "false" && (
                    <span className="text-xs text-slate-500 font-medium italic">
                      Privée
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Onglet 3 : Activité Récente */}
        {activeTab === "activity" && (
          <div className="space-y-4 max-w-2xl mx-auto">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 p-4 rounded-xl shadow-sm"
              >
                <div className="text-sm text-slate-300 dark:text-gray-700 mb-2 font-medium">
                  <span className="font-bold text-white dark:text-gray-900">
                    {item.user_name}
                  </span>{" "}
                  a évalué un album
                </div>

                <div
                  onClick={() => navigate(`/album/${item.media_id}`)}
                  className="flex items-center gap-3 bg-slate-900/40 dark:bg-gray-50 border border-slate-800/50 dark:border-gray-100 p-2 rounded-lg cursor-pointer hover:bg-slate-900/80 dark:hover:bg-gray-100 transition-all mb-3"
                >
                  <img
                    src={item.cover}
                    alt={item.album}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white dark:text-gray-900 truncate">
                      {item.album}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-gray-500 truncate">
                      {item.artist}
                    </div>
                  </div>
                </div>

                <p className="text-slate-300 dark:text-gray-600 text-sm mb-3 leading-relaxed">
                  {item.content}
                </p>

                <button
                  onClick={() => handleLike(item.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-pink-500 font-semibold transition-colors"
                >
                  <Heart
                    size={16}
                    fill={item.isLiked ? "#ec4899" : "none"}
                    className={item.isLiked ? "text-pink-500" : ""}
                  />
                  <span>{item.likes_count}</span>
                </button>
              </div>
            ))}

            {hasMoreActivity && (
              <div className="text-center pt-4">
                <button
                  onClick={() =>
                    fetchRecentActivity(activityOffset, userProfil.id)
                  }
                  disabled={loadingMore}
                  className="text-sm font-bold text-blue-500 dark:text-blue-600 hover:underline disabled:opacity-50"
                >
                  {loadingMore ? "Chargement..." : "Voir plus d'activité"}
                </button>
              </div>
            )}
          </div>
        )}
        {/* --- MODAL DE SIGNALEMENT --- */}
        {isReportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
              <div className="bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold text-white dark:text-gray-900 mb-4">
                  Signaler {userProfil?.username}
                </h3>

                <p className="text-sm text-slate-400 dark:text-gray-600 mb-4">
                  Merci de nous indiquer pourquoi vous signalez ce profil. Notre équipe examinera votre demande.
                </p>

                <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Raison du signalement (spam, comportement inapproprié...)"
                    className="w-full h-32 p-3 bg-slate-900/50 dark:bg-gray-50 border border-slate-700 dark:border-gray-300 rounded-lg text-white dark:text-gray-900 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors resize-none mb-6"
                />

                <div className="flex justify-end gap-3">
                  <button
                      onClick={() => {
                        setIsReportModalOpen(false);
                        setReportReason("");
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 dark:text-gray-600 hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors"
                      disabled={isSubmittingReport}
                  >
                    Annuler
                  </button>
                  <button
                      onClick={submitReport}
                      disabled={isSubmittingReport || !reportReason.trim()}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmittingReport ? "Envoi..." : "Envoyer le signalement"}
                  </button>
                </div>
              </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default Profil;
