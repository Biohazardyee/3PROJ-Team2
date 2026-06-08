import React, {useEffect, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    FaCheckCircle,
    FaChevronDown,
    FaChevronLeft,
    FaHeadphones,
    FaPaperPlane,
    FaPlus,
    FaStar,
    FaTimesCircle,
} from "react-icons/fa";
import { Edit3, Heart, Loader2, MessageCircle, Trash2, Flag } from "lucide-react";
import apiClient from "../api/client";
import {jwtDecode} from "jwt-decode";
import UserAvatar from "../components/UserAvatar";
type TabType = "Commentaires" | "Albums";

const AlbumDetails: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {t} = useTranslation();

    // Extraction des query parameters passés depuis la page Home
    const urlArtist = searchParams.get("artist") || "";
    const urlAlbum = searchParams.get("album") || "";
    const urlCover = searchParams.get("cover") || "";
    const urlMbid = searchParams.get("mbid") || "";

    // Options de statut adaptées au Web
// Ces IDs DOIVENT correspondre aux valeurs de votre enum MediaStatus dans le backend
    const STATUT_OPTIONS = [
        {
            id: "listened",
            label: t("status_listened"),
            icon: <FaCheckCircle/>,
            color: "text-emerald-400",
        },
        {
            id: "later",
            label: t("status_later"),
            icon: <FaHeadphones/>,
            color: "text-blue-500",
        },
        {
            id: "favorite",
            label: t("status_favorite"),
            icon: <FaStar/>,
            color: "text-amber-400",
        },
        {
            id: "disliked",
            label: t("status_disliked"),
            icon: <FaTimesCircle/>,
            color: "text-rose-500",
        },
    ];

    const [loading, setLoading] = useState(true);
    const [albumData, setAlbumData] = useState<any>(null);

    const [likedCommentIds, setLikedCommentIds] = useState<Set<string | number>>(new Set());
    const [activeNestedReplyId, setActiveNestedReplyId] = useState<number | string | null>(null);

    const [commentsList, setCommentsList] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const [activeTab, setActiveTab] = useState<TabType>("Commentaires");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [commentTitle, setCommentTitle] = useState("");
    const [commentText, setCommentText] = useState("");

    const [userStatus, setUserStatus] = useState<string | null>(null);
    const activeOption = STATUT_OPTIONS.find((opt) => opt.id === userStatus);

    const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);

    const [similarAlbums, setSimilarAlbums] = useState<any[]>([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState<
        number | string | null
    >(null);
    const [editTitle, setEditTitle] = useState("");
    const [editText, setEditText] = useState("");
    const [editRating, setEditRating] = useState(0);
    const [editHoverRating, setEditHoverRating] = useState(0);

    const [activeReplyId, setActiveReplyId] = useState<number | string | null>(
        null,
    );
    const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
    const [expandedReplies, setExpandedReplies] = useState<any[]>([]);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportingReviewId, setReportingReviewId] = useState<string | number | null>(null);
    const [reportReason, setReportReason] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);

    const token = localStorage.getItem("token");
    let currentUserId: string | null = null;
    if (token) {
        try {
            const tokenDecoded: any = jwtDecode(token);
            currentUserId =
                tokenDecoded.id || tokenDecoded.sub || tokenDecoded.userId;
        } catch (e) {
            console.error("Erreur lors du décodage du token", e);
        }
    }

    const mediaIdInDB = albumData?.db_id || (id?.includes("-") ? id : null);

    useEffect(() => {
        const fetchUserStatus = async () => {
            if (!currentUserId || !mediaIdInDB) return;

            try {

                const res = await apiClient.get(`/medias/status/${currentUserId}/${mediaIdInDB}`);

                // Votre service retourne "none" si aucun statut n'est trouvé
                const status = res.data.mediaStatus?.status;

                if (status && status !== "none") {
                    setUserStatus(status);
                } else {
                    setUserStatus(null);
                }
            } catch (error) {
                console.log("Aucun statut trouvé pour ce média, démarrage à null.");
                setUserStatus(null);
            }
        };

        fetchUserStatus();
    }, [currentUserId, mediaIdInDB]);

    const fetchUserPlaylists = async () => {
        if (!currentUserId) return;
        setLoadingPlaylists(true);
        try {
            const res = await apiClient.get(`/playlists/user/${currentUserId}`);
            // Assurez-vous d'adapter selon la structure de votre réponse API
            setUserPlaylists(res.data.playlists || res.data || []);
        } catch (err) {
            console.error("Erreur chargement playlists:", err);
        } finally {
            setLoadingPlaylists(false);
        }
    };

    useEffect(() => {
        if (isPlaylistModalOpen) {
            fetchUserPlaylists();
        }
    }, [isPlaylistModalOpen]);

    const handleSendReport = async () => {
        if (!reportReason.trim() || !currentUserId) return;

        setIsSubmittingReport(true);
        try {
            const payload: any = {
                reporter_id: currentUserId,
                reason: reportReason,
                reason_type: reportingCommentId ? 'comment' : 'review',
            };

            if (reportingCommentId) {
                payload.comment_id = reportingCommentId;
            } else if (reportingReviewId) {
                payload.review_id = reportingReviewId;
            }

            await apiClient.post('/reports', payload);

            alert(t("report_success", "Signalement envoyé avec succès."));

            setIsReportModalOpen(false);
            setReportReason("");
            setReportingReviewId(null);
            setReportingCommentId(null);
        } catch (error) {
            console.error("Erreur lors de l'envoi du signalement:", error);
            alert(t("report_error", "Impossible d'envoyer le signalement."));
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        if (!mediaIdInDB) return;

        try {
            await apiClient.post("/playlist-items", {
                playlist_id: playlistId,
                media_id: mediaIdInDB,
            });

            alert("Ajouté à la playlist avec succès !");
            setIsPlaylistModalOpen(false);
        } catch (err: any) {
            console.error("Erreur lors de l'ajout:", err);
            alert("Impossible d'ajouter à la playlist.");
        }
    };
    const isMyComment = (comment: any) => {
        if (!currentUserId || !comment) return false;

        const cUserId =
            comment.user_id ||
            comment.userId ||
            comment.user?.id ||
            comment.user?._id;

        if (!cUserId) return false;

        return String(cUserId).toLowerCase() === String(currentUserId).toLowerCase();
    };

    const hasAlreadyReviewed = commentsList.some((comment) =>
        isMyComment(comment),
    );


    useEffect(() => {
        const fetchAlbumData = async () => {
            setLoading(true);
            let finalData = null;

            const isLocalId = id && id.includes("-") && !id.startsWith("reco-");

            if (isLocalId) {
                try {
                    const res = await apiClient.get(`/medias/${id}`);
                    const media = res.data.media || res.data;
                    if (media) {
                        finalData = {
                            name: media.name,
                            artist: media.artist,
                            cover: media.cover,
                            rating: media.rating ?? 0,
                            mbid: media.mbid,
                            db_id: media.id,
                        };
                    }
                } catch (err) {
                    console.log("Média non trouvé en DB locale, passage à l'API externe...");
                }
            }
            if (!finalData && urlArtist && urlAlbum) {
                try {
                    const res = await apiClient.get("/api/albums/info", {
                        params: {artist: urlArtist, album: urlAlbum, mbid: urlMbid},
                    });
                    const externalInfo = res.data.albumInfo || {};
                    const imageUrl = urlCover || externalInfo.image?.[3]?.["#text"] || "";

                    finalData = {
                        name: externalInfo.name || urlAlbum,
                        artist: externalInfo.artist || urlArtist,
                        cover: imageUrl,
                        mbid: urlMbid || externalInfo.mbid || null,
                        rating: 0,
                        db_id: null,
                    };

                    try {
                        const syncRes = await apiClient.post("/medias/sync-search", {
                            albums: [{
                                api_id: urlMbid || `album:${urlArtist.trim()}:${urlAlbum.trim()}`,
                                name: urlAlbum.trim(),
                                artist: urlArtist.trim(),
                                cover: finalData.cover,
                                mbid: finalData.mbid,
                            }],
                        });

                        const synced = syncRes.data.medias || syncRes.data;
                        const syncedMedia = Array.isArray(synced) ? synced[0] : synced;

                        if (syncedMedia) {
                            finalData.db_id = syncedMedia.id;
                            finalData.rating = syncedMedia.rating ?? 0;
                        }
                    } catch (syncErr) {
                        console.warn("Échec de la synchronisation", syncErr);
                    }
                } catch (err) {
                    console.error("Erreur API externe :", err);
                }
            }


            setAlbumData(finalData);


            if (currentUserId && finalData?.db_id) {
                try {
                    const statusRes = await apiClient.get(`/medias/status/${currentUserId}/${finalData.db_id}`);
                    const status = statusRes.data.mediaStatus?.status;
                    setUserStatus(status && status !== "none" ? status : null);
                } catch (err) {
                    console.log("Aucun statut trouvé, démarrage à null.");
                    setUserStatus(null);
                }
            }

            setLoading(false);
        };
        if (id || (urlArtist && urlAlbum)) {
            fetchAlbumData();
        }
    }, [id, urlArtist, urlAlbum, urlMbid, urlCover, currentUserId]);
    const fetchSimilar = async () => {
        if (!urlArtist || !urlAlbum) return;

        setLoadingSimilar(true);
        try {
            const res = await apiClient.get("/api/albums/similar", {
                params: {
                    artist: urlArtist,
                    album: urlAlbum
                },
            });
            setSimilarAlbums(res.data.similarAlbums || []);
        } catch (err) {
            console.error("Erreur chargement similaires:", err);
        } finally {
            setLoadingSimilar(false);
        }
    };

    useEffect(() => {
        fetchSimilar();
    }, [urlArtist, urlAlbum]);


    const handleStatusChange = async (newStatus: string) => {
        if (!currentUserId || !mediaIdInDB) return;

        const previousStatus = userStatus;
        const isDeselecting = userStatus === newStatus;

        // 1. Mise à jour optimiste de l'UI
        setUserStatus(isDeselecting ? null : newStatus);

        try {
            if (isDeselecting) {
                // Suppression
                await apiClient.delete(`/media/status/${currentUserId}/${mediaIdInDB}`);
            } else {
                // 2. Tentative de POST (Création)
                try {
                    await apiClient.post(`/medias/status`, {
                        user_id: currentUserId,
                        media_id: mediaIdInDB,
                        status: newStatus,
                    });
                } catch (err: any) {
                    // 3. SI le POST échoue avec une erreur 400 (Already exists), on tente le PUT
                    if (err.response?.status === 400) {
                        await apiClient.put(`/medias/status/${currentUserId}/${mediaIdInDB}`, {
                            status: newStatus
                        });
                    } else {
                        throw err; // C'est une autre erreur, on la laisse remonter
                    }
                }
            }
        } catch (error: any) {
            // Rollback en cas d'échec total
            setUserStatus(previousStatus);
            console.error("Erreur critique lors du changement de statut:", error);
            alert("Impossible de mettre à jour le statut.");
        }
    };

    const fetchReviews = async () => {
        try {
            setLoadingReviews(true);
            const res = await apiClient.get("/reviews");
            const allReviews = res.data.reviews || res.data || [];

            const targetArtist = String(urlArtist || albumData?.artist || "").toLowerCase().trim();
            const targetAlbum = String(urlAlbum || albumData?.name || "").toLowerCase().trim();

            const filtered = allReviews.filter((rev: any) => {
                const media = rev.media;
                if (!media) return false;
                const revArtist = String(media.content?.artist || media.artist || "").toLowerCase().trim();
                const revAlbum = String(media.content?.name || media.name || "").toLowerCase().trim();
                return revArtist === targetArtist && revAlbum === targetAlbum;
            });

            const reviewsWithComments = await Promise.all(
                filtered.map(async (rev: any) => {
                    try {
                        const commentsRes = await apiClient.get(`/review-comments/review/${rev.id}`);
                        const allComments = commentsRes.data.comments || commentsRes.data || [];

                        const sorted = [...allComments].sort(
                            (a: any, b: any) =>
                                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        );

                        return {...rev, reviewComments: sorted};
                    } catch {
                        return {...rev, reviewComments: []};
                    }
                })
            );

            setCommentsList(reviewsWithComments);

            if (currentUserId) {
                const liked = new Set<string | number>();
                reviewsWithComments.forEach((rev: any) => {
                    const hasLiked = rev.likes?.some(
                        (like: any) =>
                            String(like.user_id || like.userId || like.user?.id) === String(currentUserId)
                    );
                    if (hasLiked) liked.add(rev.id);
                });
                setLikedCommentIds(liked);
            }
        } catch (err) {
            console.error("Erreur récupération des avis:", err);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (albumData) {
            fetchReviews();
        }
    }, [albumData]);

    if (loading) {
        return (
            <div
                className="min-h-screen bg-[#0f111a] dark:bg-slate-50 flex items-center justify-center text-white dark:text-gray-900">
                <Loader2 className="animate-spin text-pink-500" size={48}/>
            </div>
        );
    }

    if (!albumData) {
        return (
            <div
                className="min-h-screen bg-[#0f111a] dark:bg-slate-50 flex items-center justify-center text-white dark:text-gray-900">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">{t("album_not_found")}</h1>
                    <button
                        onClick={() => navigate("/home")}
                        className="bg-blue-600 px-6 py-2 rounded-lg text-white"
                    >
                        {t("back")}
                    </button>
                </div>
            </div>
        );
    }

    const isFormInvalid =
        userRating === 0 || commentTitle.trim() === "" || commentText.trim() === "";
    const isEditInvalid =
        editRating === 0 || editTitle.trim() === "" || editText.trim() === "";

    const submitMainComment = async () => {
        if (isFormInvalid || hasAlreadyReviewed) return;
        if (!mediaIdInDB) return;

        if (!currentUserId) {
            alert("Vous devez être connecté pour publier un avis.");
            navigate("/login");
            return;
        }

        try {
            await apiClient.post("/reviews", {
                user_id: currentUserId,
                media_id: mediaIdInDB,
                title: commentTitle.trim(),
                content: commentText.trim(),
                rating: userRating,
            });
            setCommentTitle("");
            setCommentText("");
            setUserRating(0);
            fetchReviews();
        } catch (err) {
            console.error("Erreur lors de la publication de l'avis:", err);
        }
    };

    const startEditing = (comment: any) => {
        setEditingCommentId(comment.id);
        setEditTitle(comment.title || "");
        setEditText(comment.content || comment.text);
        setEditRating(comment.rating);
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditTitle("");
        setEditText("");
        setEditRating(0);
    };

    const saveEdit = async (commentId: number | string) => {
        if (isEditInvalid) return;
        try {
            await apiClient.put(`/reviews/${commentId}`, {
                title: editTitle.trim(),
                content: editText.trim(),
                rating: editRating,
            });
            cancelEditing();
            fetchReviews();
        } catch (err) {
            console.error("Erreur lors de la modification de l'avis:", err);
            alert("Impossible de modifier l'avis.");
        }
    };

    const deleteComment = async (commentId: number | string) => {
        if (
            window.confirm(
                t("delete_confirm") || "Voulez-vous vraiment supprimer cet avis ?",
            )
        ) {
            try {
                await apiClient.delete(`/reviews/${commentId}`);
                fetchReviews();
            } catch (err) {
                console.error("Erreur lors de la suppression de l'avis:", err);
                alert("Impossible de supprimer cet avis.");
            }
        }
    };

    const deleteReply = async (replyId: number | string) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;
        try {
            await apiClient.delete(`/review-comments/${replyId}`);
            fetchReviews();
        } catch (err) {
            console.error("Erreur lors de la suppression du commentaire:", err);
            alert("Impossible de supprimer ce commentaire.");
        }
    };

    const handleToggleLike = async (commentId: number | string) => {
        setLikedCommentIds((prev) => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
            } else {
                next.add(commentId);
            }
            return next;
        });

        try {
            await apiClient.post(`/reviews/likes/toggle`, {review_id: commentId});
            fetchReviews(); // Sync avec la vraie donnée serveur
        } catch (err) {
            console.error("Erreur lors de l'action sur le like:", err);
            setLikedCommentIds((prev) => {
                const next = new Set(prev);
                if (next.has(commentId)) {
                    next.delete(commentId);
                } else {
                    next.add(commentId);
                }
                return next;
            });
        }
    };

    const toggleReplies = (commentId: number | string) => {
        setExpandedReplies((prev) =>
            prev.includes(commentId)
                ? prev.filter((uid) => uid !== commentId)
                : [...prev, commentId],
        );
    };

    const submitReply = async (reviewId: number | string, parentCommentId?: number | string) => {
        const key = parentCommentId ?? reviewId;
        const text = replyInputs[String(key)];
        if (!text || !text.trim()) return;

        const tempId = `temp-${Date.now()}`;
        const tempReply = {
            id: tempId,
            content: text.trim(),
            user_id: currentUserId,
            parent_id: parentCommentId && parentCommentId !== reviewId ? parentCommentId : null,
            created_at: new Date().toISOString(),
            user: { username: "Moi", id: currentUserId }
        };

        setCommentsList((prev) =>
            prev.map((review) => {
                if (review.id === reviewId) {
                    return {
                        ...review,
                        reviewComments: [...(review.reviewComments || []), tempReply]
                    };
                }
                return review;
            })
        );

        setReplyInputs((prev) => ({ ...prev, [String(key)]: "" }));
        setActiveReplyId(null);
        setActiveNestedReplyId(null);
        setExpandedReplies((prev) => (prev.includes(reviewId) ? prev : [...prev, reviewId]));

        try {
            const response = await apiClient.post(`/review-comments`, {
                review_id: reviewId,
                ...(parentCommentId && parentCommentId !== reviewId ? { parent_id: parentCommentId } : {}),
                content: text.trim(),
            });

            const saved = response.data?.reviewComment || response.data;

            setCommentsList((prev) =>
                prev.map((review) => {
                    if (review.id === reviewId) {
                        return {
                            ...review,
                            reviewComments: review.reviewComments.map((c: any) =>
                                c.id === tempId
                                    ? { ...c, id: saved.id || tempId, created_at: saved.created_at || c.created_at }
                                    : c
                            )
                        };
                    }
                    return review;
                })
            );
        } catch (err) {
            console.error("Erreur lors de l'envoi de la réponse:", err);
            alert("Impossible d'envoyer la réponse.");
            fetchReviews();
        }
    };

    const organizeComments = (comments: any[]) => {
        if (!comments) return [];

        const roots = comments
            .filter((c) => !c.parent_id)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        const replies = comments.filter((c) => c.parent_id);
        const result: any[] = [];

        // Fonction récursive pour insérer les enfants directement sous leur parent
        const traverse = (parent: any) => {
            result.push(parent);
            const children = replies
                .filter((c) => String(c.parent_id) === String(parent.id))
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            children.forEach((child) => traverse(child));
        };

        roots.forEach((root) => traverse(root));

        const processedIds = new Set(result.map((c) => String(c.id)));
        comments.forEach((c) => {
            if (!processedIds.has(String(c.id))) {
                result.push(c);
            }
        });

        return result;
    };

    const getReplyDepth = (reply: any, allComments: any[]): number => {
        if (!reply.parent_id) return 0;
        const parent = allComments.find((c: any) => c.id === reply.parent_id);
        if (!parent) return 1;
        return Math.min(getReplyDepth(parent, allComments) + 1, 2); // max 2 crans
    };

    return (
        <div
            className="min-h-screen bg-[#0f111a] dark:bg-slate-50 text-white dark:text-gray-900 font-sans pb-20 transition-colors duration-300">
            {isPlaylistModalOpen && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsPlaylistModalOpen(false)}
                    ></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="bg-[#1a1b26] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">{t("add_to_playlist")}</h3>

                            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
                                {loadingPlaylists ? (
                                    <div className="flex justify-center py-4"><Loader2 className="animate-spin"/></div>
                                ) : userPlaylists.length > 0 ? (
                                    userPlaylists.map((pl) => (
                                        <button
                                            key={pl.id}
                                            onClick={() => handleAddToPlaylist(pl.id)}
                                            className="w-full text-left p-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors border border-gray-700 dark:border-gray-200"
                                        >
                                            <span className="font-bold text-white dark:text-gray-900">{pl.name}</span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        {t("no_playlist")}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={() =>
                                        navigate("/create-playlist", {
                                            state: {
                                                returnTo: `/album/${id}`,
                                                albumToAdd: albumData,
                                            },
                                        })
                                    }
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    <FaPlus size={14}/> {t("create_playlist")}
                                </button>
                                <button
                                    onClick={() => setIsPlaylistModalOpen(false)}
                                    className="w-full py-3 text-gray-400 font-bold"
                                >
                                    {t("cancel")}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <main className="max-w-6xl mx-auto px-6 pt-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-gray-900 mb-8 group"
                >
                    <FaChevronLeft className="group-hover:-translate-x-1 transition-transform"/>{" "}
                    {t("back")}
                </button>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Cover */}
                    <div className="w-full md:w-80 shrink-0">
                        <div className="sticky top-24">
                            <img
                                src={albumData?.cover || "url_vers_une_image_par_defaut.jpg"}
                                alt={albumData?.name}
                                className="w-full aspect-square rounded-2xl shadow-2xl border border-gray-800 dark:border-gray-200 object-cover"
                            />
                        </div>
                    </div>

                    {/* Infos */}
                    <div className="flex-1 flex flex-col gap-8">
                        <section>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 italic uppercase">
                                {albumData?.name}
                            </h1>
                            <h2 className="text-2xl text-blue-400 dark:text-blue-600 font-medium">
                                {albumData?.artist}
                            </h2>
                        </section>

                        <div className="flex items-center gap-3">
                            <FaStar className="text-[#FF1E56] text-2xl"/>
                            <span className="text-3xl font-bold">
                            {albumData?.rating !== undefined
                                ? Number(albumData.rating).toFixed(1)
                                : "0.0"}
                          </span>
                            <span className="text-gray-500 font-medium">
                            {t("fan_rating")}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            <button
                                onClick={() => setIsPlaylistModalOpen(true)}
                                className="bg-[#1a1b26] dark:bg-white border border-gray-700 dark:border-gray-200 p-4 rounded-xl text-white dark:text-gray-900"
                            >
                                <FaPlus/>
                            </button>

                            <div className="relative">
                                {/* --- BOUTON DÉCLENCHEUR --- */}
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="bg-[#1a1b26] dark:bg-white border border-gray-700 dark:border-gray-200 px-5 py-3.5 rounded-xl text-white dark:text-gray-900 flex items-center gap-4 min-w-[220px] justify-between shadow-lg"
                                >
                                    <span className="text-sm font-bold tracking-wide uppercase flex items-center gap-2">
                                        {activeOption ? (
                                            <>
                                                <span className={activeOption.color}>{activeOption.icon}</span>
                                                {activeOption.label}
                                            </>
                                        ) : (
                                            <span>{t("select_status", "Statut")}</span>
                                        )}
                                    </span>
                                    <FaChevronDown
                                        className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                                        size={12}
                                    />
                                </button>

                                {/* --- LISTE DES OPTIONS --- */}
                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40"
                                             onClick={() => setIsDropdownOpen(false)}></div>
                                        <div
                                            className="absolute top-full left-0 mt-2 w-full bg-[#1a1b26] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50">
                                            {STATUT_OPTIONS.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => {
                                                        handleStatusChange(option.id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-800 dark:hover:bg-gray-100 text-left border-b border-gray-800 dark:border-gray-200 last:border-0 ${
                                                        userStatus === option.id ? 'bg-gray-800/50 dark:bg-gray-100' : ''
                                                    }`}
                                                >
                                                    <span className={`${option.color}`}>{option.icon}</span>
                                                    <span
                                                        className="text-sm font-bold text-gray-200 dark:text-gray-700 uppercase">
                            {option.label}
                        </span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <section>
                            <h3 className="text-xl font-bold mb-4 border-b border-gray-800 dark:border-gray-200 pb-2 w-fit">
                                {t("description_title")}
                            </h3>
                            <p className="text-gray-400 dark:text-gray-600 leading-relaxed max-w-2xl">
                                {albumData?.wiki?.summary
                                    ? albumData.wiki.summary
                                        .replace(/<[^>]*>?/gm, "")
                                        .split(" <a href")[0]
                                    : "Aucune biographie disponible."}
                            </p>
                        </section>

                        <div className="mt-4">
                            <div
                                className="flex gap-2 mb-8 bg-[#1a1b26] dark:bg-white p-1.5 rounded-xl w-fit border border-gray-800 dark:border-gray-200 shadow-sm">
                                {[t("tab_comments"), t("tab_similar")].map((tabLabel, idx) => {
                                    const isCommentsTab = idx === 0;
                                    const isTabActive = isCommentsTab
                                        ? activeTab === "Commentaires"
                                        : activeTab === "Albums";
                                    return (
                                        <button
                                            key={tabLabel}
                                            onClick={() =>
                                                setActiveTab(isCommentsTab ? "Commentaires" : "Albums")
                                            }
                                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${isTabActive ? "bg-gray-700 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md" : "text-gray-400 dark:text-gray-500"}`}
                                        >
                                            {isCommentsTab
                                                ? `${t("tab_comments")} (${commentsList.length})`
                                                : tabLabel}
                                        </button>
                                    );
                                })}
                            </div>

                            {activeTab === "Commentaires" ? (
                                <>
                                    {!hasAlreadyReviewed ? (
                                        <div
                                            className="mb-10 bg-[#1a1b26] dark:bg-white p-6 rounded-2xl border border-gray-800 dark:border-gray-200 shadow-sm">
                                            <h4 className="text-lg font-bold mb-6 italic">
                                                {t("write_comment")}
                                            </h4>
                                            <div className="flex flex-col gap-5">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-400 dark:text-gray-500 mr-2 font-medium">
                                                        {t("rating")} * :
                                                    </p>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <FaStar
                                                                key={star}
                                                                className={`cursor-pointer transition-colors ${(hoverRating || userRating) >= star ? "text-[#FF1E56]" : "text-gray-700 dark:text-gray-300"}`}
                                                                size={20}
                                                                onMouseEnter={() => setHoverRating(star)}
                                                                onMouseLeave={() => setHoverRating(0)}
                                                                onClick={() => setUserRating(star)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold mb-2">
                                                        {t("title_label")} *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={commentTitle}
                                                        onChange={(e) => setCommentTitle(e.target.value)}
                                                        placeholder={t("placeholder_title")}
                                                        className="w-full bg-[#161b2c] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-xl p-4 text-sm focus:outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold mb-2">
                                                        {t("comment_label")} *
                                                    </label>
                                                    <textarea
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder={t("placeholder_comment")}
                                                        className="w-full bg-[#161b2c] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-xl p-4 text-sm focus:outline-none min-h-[100px] resize-none"
                                                    />
                                                </div>

                                                <div className="flex justify-end mt-2">
                                                    <button
                                                        onClick={submitMainComment}
                                                        disabled={isFormInvalid}
                                                        className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${isFormInvalid ? "bg-gray-600 opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
                                                    >
                                                        <FaPaperPlane size={12}/> {t("publish_btn")}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="mb-10 bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl text-center text-sm text-blue-400 font-semibold shadow-inner">
                                            💡 Vous avez déjà publié un avis pour cet album. Vous
                                            pouvez l'éditer ou le supprimer directement sur votre
                                            commentaire ci-dessous.
                                        </div>
                                    )}

                                    {/* Liste dynamique des avis */}
                                    {loadingReviews ? (
                                        <div className="flex justify-center py-6">
                                            <Loader2
                                                className="animate-spin text-pink-500"
                                                size={32}
                                            />
                                        </div>
                                    ) : commentsList.length > 0 ? (
                                        <div className="space-y-6">
                                            {commentsList.map((comment) => (
                                                <div
                                                    key={comment.id}
                                                    className="bg-[#161b2c] dark:bg-white p-8 rounded-2xl border border-gray-800/50 dark:border-gray-200 relative"
                                                >
                                                    {editingCommentId === comment.id ? (
                                                        <div className="flex flex-col gap-5">
                                                            <h4 className="text-lg font-bold italic">
                                                                {t("edit_comment")}
                                                            </h4>
                                                            <div className="flex gap-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <FaStar
                                                                        key={star}
                                                                        size={20}
                                                                        className={`cursor-pointer ${(editHoverRating || editRating) >= star ? "text-[#FF1E56]" : "text-gray-700"}`}
                                                                        onMouseEnter={() =>
                                                                            setEditHoverRating(star)
                                                                        }
                                                                        onMouseLeave={() => setEditHoverRating(0)}
                                                                        onClick={() => setEditRating(star)}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={editTitle}
                                                                onChange={(e) => setEditTitle(e.target.value)}
                                                                className="w-full bg-[#1a1b26] dark:bg-gray-50 border p-4 text-sm rounded-xl focus:outline-none"
                                                            />
                                                            <textarea
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                className="w-full bg-[#1a1b26] dark:bg-gray-50 border p-4 text-sm rounded-xl min-h-[100px] resize-none focus:outline-none"
                                                            />
                                                            <div className="flex justify-end gap-3">
                                                                <button
                                                                    onClick={cancelEditing}
                                                                    className="px-4 py-2 text-sm font-bold text-gray-400"
                                                                >
                                                                    {t("cancel")}
                                                                </button>
                                                                <button
                                                                    onClick={() => saveEdit(comment.id)}
                                                                    disabled={isEditInvalid}
                                                                    className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg"
                                                                >
                                                                    {t("save")}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Actions directes */}
                                                            <div className="absolute top-6 right-6 flex items-center gap-2">
                                                                {isMyComment(comment) ? (
                                                                    <>
                                                                        {/* Bouton Modifier */}
                                                                        <button
                                                                            onClick={() => startEditing(comment)}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-blue-400 bg-slate-800/40 hover:bg-blue-500/10 rounded-lg transition-all border border-slate-700/50 hover:border-blue-500/20"
                                                                        >
                                                                            <Edit3 size={13}/>
                                                                            <span>{t("modify")}</span>
                                                                        </button>

                                                                        {/* Bouton Supprimer */}
                                                                        <button
                                                                            onClick={() => deleteComment(comment.id)}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-500 bg-slate-800/40 hover:bg-rose-500/10 rounded-lg transition-all border border-slate-700/50 hover:border-rose-500/20"
                                                                        >
                                                                            <Trash2 size={13}/>
                                                                            <span>{t("delete")}</span>
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    /* Bouton de signalement pour les avis des autres */
                                                                    <button
                                                                        onClick={() => {
                                                                            setReportingReviewId(comment.id);
                                                                            setIsReportModalOpen(true);
                                                                        }}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-500 bg-slate-800/40 hover:bg-rose-500/10 rounded-lg transition-all border border-slate-700/50 hover:border-rose-500/20"
                                                                        title={t("report_review", "Signaler cet avis")}
                                                                    >
                                                                        <Flag size={13}/>
                                                                        <span>{t("report", "Signaler")}</span>
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="flex justify-between items-start mb-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div
                                                                        onClick={() => comment.user?.id && navigate(`/profil/${comment.user.id}`)}
                                                                        className="cursor-pointer transition-transform hover:scale-105"
                                                                    >
                                                                        <UserAvatar
                                                                            userId={comment.user?.id || comment.user_id}
                                                                            username={comment.user?.username}
                                                                            sizeClass="w-10 h-10 text-sm"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        {/* On aligne le nom et les étoiles sur la même ligne */}
                                                                        <div className="flex items-center gap-3">
                                                                            <h4
                                                                                onClick={() => comment.user?.id && navigate(`/profil/${comment.user.id}`)}
                                                                                className="font-bold text-gray-100 dark:text-gray-900 hover:underline cursor-pointer"
                                                                            >
                                                                                {comment.user?.username || "Anonyme"}
                                                                            </h4>

                                                                            {/* Les étoiles migrent ici, plus aucun risque de collision ! */}
                                                                            <div
                                                                                className="flex text-[#FF1E56] gap-0.5">
                                                                                {[...Array(5)].map((_, i) => (
                                                                                    <FaStar
                                                                                        key={i}
                                                                                        size={14}
                                                                                        className={i < comment.rating ? "text-[#FF1E56]" : "text-gray-700"}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 font-medium">
                                                                            {new Date(comment.created_at || Date.now()).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {comment.title && (
                                                                <h5 className="text-lg font-bold mb-3 italic tracking-wide uppercase">
                                                                    {comment.title}
                                                                </h5>
                                                            )}
                                                            <p className="text-gray-400 dark:text-gray-600 text-sm leading-relaxed mb-6 italic">
                                                                {comment.content || comment.text}
                                                            </p>

                                                            <div
                                                                className="flex gap-6 text-gray-500 text-sm items-center">
                                                                <button
                                                                    onClick={() => handleToggleLike(comment.id)}
                                                                    className="flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Heart
                                                                        size={14}
                                                                        className={
                                                                            likedCommentIds.has(comment.id)
                                                                                ? "text-[#FF1E56] fill-[#FF1E56]"
                                                                                : "text-gray-500"
                                                                        }
                                                                    />
                                                                    {comment.likes?.length || 0}
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        setActiveReplyId(activeReplyId === comment.id ? null : comment.id)
                                                                    }
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <MessageCircle size={14}/>
                                                                    {comment.reviewComments?.length || 0} {t("reply")}
                                                                </button>

                                                                {comment.reviewComments?.length > 0 && (
                                                                    <button
                                                                        onClick={() => toggleReplies(comment.id)}
                                                                        className="text-xs text-blue-500 ml-auto"
                                                                    >
                                                                        {expandedReplies.includes(comment.id)
                                                                            ? t("hide_replies")
                                                                            : t("show_replies", {count: comment.reviewComments.length})}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Champ de saisie interactif pour les réponses */}
                                                            {/* Input réponse — réponse directe à la review, pas à un commentaire */}
                                                            {activeReplyId === comment.id && (
                                                                <div className="mt-4 pt-4 border-t border-gray-800/50 dark:border-gray-200">
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="text"
                                                                            autoFocus
                                                                            placeholder={t("reply_to", { user: comment.user?.username || "Anonyme" })}
                                                                            value={replyInputs[String(comment.id)] || ""}
                                                                            onChange={(e) =>
                                                                                setReplyInputs({ ...replyInputs, [String(comment.id)]: e.target.value })
                                                                            }
                                                                            onKeyDown={(e) => e.key === "Enter" && submitReply(comment.id)}
                                                                            className="flex-1 bg-[#1a1b26] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 p-2.5 text-sm rounded-xl focus:outline-none focus:border-blue-500"
                                                                        />
                                                                        <button
                                                                            onClick={() => submitReply(comment.id)}
                                                                            className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shrink-0"
                                                                        >
                                                                            <FaPaperPlane size={13} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setActiveReplyId(null)}
                                                                            className="text-sm font-semibold text-gray-500 hover:text-gray-300 px-2 transition-colors"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Réponses */}
                                                            {expandedReplies.includes(comment.id) && comment.reviewComments && (
                                                                <div className="mt-4 border-l-2 border-gray-700 dark:border-gray-300 ml-2 pl-4 flex flex-col gap-2">
                                                                    {/* MODIFICATION ICI : On englobe avec organizeComments */}
                                                                    {organizeComments(comment.reviewComments).map((reply: any) => {
                                                                        const depth = getReplyDepth(reply, comment.reviewComments);
                                                                        const isNested = depth > 0;
                                                                        const parentComment = isNested
                                                                            ? comment.reviewComments.find((c: any) => c.id === reply.parent_id)
                                                                            : null;

                                                                        return (
                                                                            <div key={reply.id}>
                                                                                {/* ✅ Indentation si réponse imbriquée */}
                                                                                <div
                                                                                    className={depth === 1 ? "ml-6" : depth === 2 ? "ml-12" : ""}>
                                                                                    <div
                                                                                        className={`
                                                                        bg-[#1a1b26] dark:bg-white rounded-xl p-3 text-sm
                                                                        flex justify-between items-start gap-3
                                                                        border border-gray-800/60 dark:border-gray-200
                                                                        ${depth === 1 ? "border-l-2 border-l-blue-500" : ""}
                                                                        ${depth === 2 ? "border-l-2 border-l-purple-500" : ""}
                                                                      `}
                                                                                    >
                                                                                        <div
                                                                                            className="flex items-start gap-2 min-w-0">
                                                                                            {/* Mini avatar */}
                                                                                            <UserAvatar
                                                                                                userId={reply.user?.id || reply.user_id}
                                                                                                username={reply.user?.username}
                                                                                                sizeClass="w-7 h-7 text-[10px]"
                                                                                            />
                                                                                            <div className="min-w-0">
                                                                                                <div
                                                                                                    className="flex items-center gap-2 flex-wrap mb-1">
                                                                                    <span
                                                                                        className="font-bold text-blue-400 text-xs">
                                                                                      {reply.user?.username || "Anonyme"}
                                                                                    </span>
                                                                                                    {/* ✅ Mention @parent si réponse imbriquée */}
                                                                                                    {parentComment && (
                                                                                                        <span
                                                                                                            className="text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">
                                                                                        @{parentComment.user?.username || "Anonyme"}
                                                                                      </span>
                                                                                                    )}
                                                                                                    <span
                                                                                                        className="text-gray-600 dark:text-gray-400 text-[11px]">
                                                                                  {new Date(reply.created_at || Date.now()).toLocaleDateString()}
                                                                                </span>
                                                                                                </div>
                                                                                                <p className="text-gray-300 dark:text-gray-600 leading-snug">
                                                                                                    {reply.content}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div
                                                                                            className="flex items-center gap-2 shrink-0 mt-0.5">
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    setActiveNestedReplyId(
                                                                                                        activeNestedReplyId === reply.id ? null : reply.id
                                                                                                    )
                                                                                                }
                                                                                                className="text-xs text-blue-500 hover:text-blue-400"
                                                                                            >
                                                                                                {t("reply")}
                                                                                            </button>

                                                                                            {/* ✅ Si c'est mon commentaire : Supprimer, sinon : Signaler */}
                                                                                            {isMyComment(reply) ? (
                                                                                                <button
                                                                                                    onClick={() => deleteReply(reply.id)}
                                                                                                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 px-2 py-1 rounded-lg transition-colors border border-rose-500/20"
                                                                                                >
                                                                                                    <Trash2 size={11}/>
                                                                                                    {t("delete") || "Supprimer"}
                                                                                                </button>
                                                                                            ) : (
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setReportingCommentId(reply.id);
                                                                                                        setReportingReviewId(null);
                                                                                                        setIsReportModalOpen(true);
                                                                                                    }}
                                                                                                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-500 transition-colors"
                                                                                                    title={t("report_comment", "Signaler ce commentaire")}
                                                                                                >
                                                                                                    <Flag size={11}/>
                                                                                                    <span>{t("report", "Signaler")}</span>
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Input réponse imbriquée */}
                                                                                    {activeNestedReplyId === reply.id && (
                                                                                        <div className={`mt-2 ${depth === 1 ? "ml-[3.75rem]" : depth === 2 ? "ml-[5.25rem]" : "ml-9"}`}>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    autoFocus
                                                                                                    placeholder={`Répondre à ${reply.user?.username || "Anonyme"}...`}
                                                                                                    value={replyInputs[String(reply.id)] || ""}
                                                                                                    onChange={(e) =>
                                                                                                        setReplyInputs({ ...replyInputs, [String(reply.id)]: e.target.value })
                                                                                                    }
                                                                                                    onKeyDown={(e) => {
                                                                                                        if (e.key === "Enter") {
                                                                                                            submitReply(comment.id, reply.id);
                                                                                                        }
                                                                                                    }}
                                                                                                    className="flex-1 bg-[#161b2c] dark:bg-gray-50 border border-gray-700 dark:border-gray-300 p-2 text-sm rounded-xl focus:outline-none focus:border-blue-500"
                                                                                                />
                                                                                                <button
                                                                                                    onClick={() => submitReply(comment.id, reply.id)}
                                                                                                    className="flex items-center justify-center w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shrink-0"
                                                                                                >
                                                                                                    <FaPaperPlane size={11} />
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => setActiveNestedReplyId(null)}
                                                                                                    className="text-xs font-semibold text-gray-500 hover:text-gray-300 px-2 transition-colors"
                                                                                                >
                                                                                                    Cancel
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            Soyez le premier à donner votre avis !
                                        </div>
                                    )}
                                </>
                            ) : activeTab === "Albums" && (
                                <div className="mt-6">
                                    {loadingSimilar ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="animate-spin text-[#FF1E56]" size={32}/>
                                        </div>
                                    ) : similarAlbums.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {similarAlbums.map((item: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => {
                                                        const artistName = item.artist?.name || item.artist || "";
                                                        const albumName = item.name || "";
                                                        const coverUrl = item.image?.[3]?.["#text"] || item.image?.[2]?.["#text"] || "";
                                                        const albumId = item.mbid || item.api_id || item.media_id || `album:${artistName}:${albumName}`;
                                                        const params = new URLSearchParams({
                                                            artist: artistName,
                                                            album: albumName,
                                                            cover: coverUrl,
                                                            mbid: item.mbid || "",
                                                        }).toString();

                                                        navigate(`/album/${albumId}?${params}`);
                                                    }}
                                                >
                                                    <img
                                                        src={item.image?.[3]?.["#text"]}
                                                        alt={item.name}
                                                        className="w-full aspect-square object-cover rounded-lg"
                                                    />
                                                    <p className="text-sm mt-2 font-medium text-white truncate">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {item.artist.name}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            {t("no_similar", "Aucun album similaire trouvé.")}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Modal de Signalement */}
                {isReportModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-[#1a1b26] dark:bg-white w-full max-w-md rounded-2xl border border-gray-800 dark:border-gray-200 shadow-2xl overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-3 text-rose-500 mb-4">
                                    <Flag size={24} />
                                    <h3 className="text-xl font-bold">{t("report_title", "Signaler un contenu")}</h3>
                                </div>

                                <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                                    {t("report_instruction", "Veuillez expliquer pourquoi vous signalez cet avis. Un administrateur l'examinera sous peu.")}
                                </p>

                                <textarea
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder={t("report_placeholder", "Raison du signalement (ex: propos injurieux, spam...)")}
                                    className="w-full bg-[#161b2c] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-xl p-4 text-sm text-white dark:text-gray-900 focus:outline-none focus:border-rose-500 min-h-[120px] resize-none"
                                    autoFocus
                                />

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setIsReportModalOpen(false);
                                            setReportReason("");
                                        }}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                                    >
                                        {t("cancel")}
                                    </button>
                                    <button
                                        onClick={handleSendReport}
                                        disabled={isSubmittingReport || !reportReason.trim()}
                                        className="flex-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-rose-600 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingReport ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            t("confirm_report", "Envoyer le signalement")
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AlbumDetails;
