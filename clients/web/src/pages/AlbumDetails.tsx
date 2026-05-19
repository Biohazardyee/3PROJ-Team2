import React, {useState, useEffect} from 'react';
import {useParams, useNavigate, useSearchParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {
    FaStar, FaPlus,
    FaChevronLeft, FaPaperPlane, FaChevronDown,
    FaCheckCircle, FaHeadphones, FaTimesCircle
} from "react-icons/fa";
import {Heart, MessageCircle, Trash2, Edit3, Loader2} from 'lucide-react';
import apiClient from "../api/client";
import {jwtDecode} from "jwt-decode";

const AlbumDetails: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {t} = useTranslation();

    // Extraction des query parameters passés depuis la page Home
    const urlArtist = searchParams.get('artist') || '';
    const urlAlbum = searchParams.get('album') || '';
    const urlCover = searchParams.get('cover') || '';
    const urlMbid = searchParams.get('mbid') || '';

    // Options de statut adaptées au Web
    const STATUT_OPTIONS = [
        {id: 'completed', label: t('status_completed'), icon: <FaCheckCircle/>, color: 'text-emerald-400'},
        {id: 'listening', label: t('status_listening'), icon: <FaHeadphones/>, color: 'text-blue-500'},
        {id: 'wishlist', label: t('status_wishlist'), icon: <FaStar/>, color: 'text-amber-400'},
        {id: 'dropped', label: t('status_dropped'), icon: <FaTimesCircle/>, color: 'text-rose-500'},
    ];

    // États de l'album
    const [loading, setLoading] = useState(true);
    const [albumData, setAlbumData] = useState<any>(null);

    // États pour les avis issus de la base de données
    const [commentsList, setCommentsList] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // États locaux de navigation et d'interface
    const [activeTab, setActiveTab] = useState('Commentaires');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(t('change_status'));
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

    // États pour publier un nouvel avis
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [commentTitle, setCommentTitle] = useState("");
    const [commentText, setCommentText] = useState("");

    // États pour modifier un avis existant
    const [editingCommentId, setEditingCommentId] = useState<number | string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editText, setEditText] = useState("");
    const [editRating, setEditRating] = useState(0);
    const [editHoverRating, setEditHoverRating] = useState(0);

    // États pour les réponses secondaires
    const [activeReplyId, setActiveReplyId] = useState<number | string | null>(null);
    const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
    const [expandedReplies, setExpandedReplies] = useState<any[]>([]);

    // Récupérer et décoder le token utilisateur pour identifier la personne connectée au niveau global
    const token = localStorage.getItem('token');
    let currentUserId: string | null = null;
    if (token) {
        try {
            const tokenDecoded: any = jwtDecode(token);
            currentUserId = tokenDecoded.id || tokenDecoded.sub || tokenDecoded.userId;
        } catch (e) {
            console.error("Erreur lors du décodage du token", e);
        }
    }

    // Vérifier si l'un des IDs de l'avis correspond à l'utilisateur connecté
    const isMyComment = (comment: any) => {
        if (!currentUserId) return false;
        const cUserId = comment.user_id || comment.userId || comment.user?.id || comment.user?._id;
        return String(cUserId) === String(currentUserId);
    };

    // Vérifier si l'utilisateur connecté a déjà publié un avis sur cet album
    const hasAlreadyReviewed = commentsList.some(comment => isMyComment(comment));

    // Identifiant unique de la base de données
    const mediaIdInDB = albumData?.db_id || (id?.includes("-") ? id : null);

    // 1. Récupération des détails de l'album et synchronisation
    useEffect(() => {
        const fetchAlbumDetails = async () => {
            try {
                setLoading(true);
                let finalData = null;

                if (id && id.includes("-")) {
                    try {
                        const res = await apiClient.get(`/medias/${id}`);
                        if (res.data.media) {
                            finalData = res.data.media.content;
                            finalData.db_id = res.data.media.id;
                        }
                    } catch (err) {
                        console.log("Média non trouvé en DB, tentative API externe...");
                    }
                }

                if (!finalData && urlArtist && urlAlbum) {
                    const res = await apiClient.get("/api/albums/info", {
                        params: {artist: urlArtist, album: urlAlbum, mbid: urlMbid},
                    });
                    finalData = res.data.albumInfo || {};

                    if (!finalData.name) finalData.name = urlAlbum;
                    if (!finalData.artist) finalData.artist = urlArtist;

                    const fallbackId = `album:${urlArtist.trim()}:${urlAlbum.trim()}`;
                    try {
                        const syncRes = await apiClient.post("/medias/sync-search", {
                            albums: [{
                                api_id: urlMbid || fallbackId,
                                name: urlAlbum.trim(),
                                artist: urlArtist.trim(),
                                cover: urlCover,
                                mbid: urlMbid || null,
                            }],
                        });
                        if (syncRes.data.medias?.length > 0) {
                            finalData.db_id = syncRes.data.medias[0].id;
                        }
                    } catch (syncErr) {
                        console.warn("Échec sync en détails web", syncErr);
                    }
                }
                setAlbumData(finalData);
            } catch (error) {
                console.error("Erreur chargement des détails de l'album:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbumDetails();
    }, [id, urlArtist, urlAlbum, urlMbid, urlCover]);

    // 2. Récupération des avis réels depuis la base de données
    const fetchReviews = async () => {
        try {
            setLoadingReviews(true);
            const res = await apiClient.get("/reviews");
            const allReviews = res.data.reviews || [];

            const targetArtist = String(urlArtist || albumData?.artist || "").toLowerCase().trim();
            const targetAlbum = String(urlAlbum || albumData?.name || "").toLowerCase().trim();

            const filtered = allReviews.filter((rev: any) => {
                const content = rev.media?.content;
                if (!content) return false;
                const revArtist = String(content.album?.artist || content.artist || "").toLowerCase().trim();
                const revAlbum = String(content.album?.name || content.name || "").toLowerCase().trim();
                return revArtist === targetArtist && revAlbum === targetAlbum;
            });
            setCommentsList(filtered);
        } catch (err) {
            console.error("Erreur récupération des avis:", err);
        } finally {
            setLoadingReviews(false);
        }
    };

    // Charger les avis au montage du composant dès que l'album est identifié
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
                    <h1 className="text-3xl font-bold mb-4">{t('album_not_found')}</h1>
                    <button onClick={() => navigate('/home')}
                            className="bg-blue-600 px-6 py-2 rounded-lg text-white">{t('back')}</button>
                </div>
            </div>
        );
    }

    const selectedStatusOption = STATUT_OPTIONS.find(opt => opt.label === currentStatus);
    const isFormInvalid = userRating === 0 || commentTitle.trim() === "" || commentText.trim() === "";
    const isEditInvalid = editRating === 0 || editTitle.trim() === "" || editText.trim() === "";

    // 3. Soumettre un avis vers la base de données (POST /reviews)
    const submitMainComment = async () => {
        if (isFormInvalid || hasAlreadyReviewed) return;
        if (!mediaIdInDB) return;

        if (!currentUserId) {
            alert("Vous devez être connecté pour publier un avis.");
            navigate('/login');
            return;
        }

        try {
            await apiClient.post("/reviews", {
                user_id: currentUserId,
                media_id: mediaIdInDB,
                title: commentTitle.trim(),
                content: commentText.trim(),
                rating: userRating
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

    // 4. Mettre à jour un avis existant (PUT /reviews/:id)
    const saveEdit = async (commentId: number | string) => {
        if (isEditInvalid) return;
        try {
            await apiClient.put(`/reviews/${commentId}`, {
                title: editTitle.trim(),
                content: editText.trim(),
                rating: editRating
            });
            cancelEditing();
            fetchReviews();
        } catch (err) {
            console.error("Erreur lors de la modification de l'avis:", err);
            alert("Impossible de modifier l'avis.");
        }
    };

    // 5. Supprimer un avis (DELETE /reviews/:id)
    const deleteComment = async (commentId: number | string) => {
        if (window.confirm(t('delete_confirm') || "Voulez-vous vraiment supprimer cet avis ?")) {
            try {
                await apiClient.delete(`/reviews/${commentId}`);
                fetchReviews();
            } catch (err) {
                console.error("Erreur lors de la suppression de l'avis:", err);
                alert("Impossible de supprimer cet avis.");
            }
        }
    };

    // 6. Basculer le J'aime d'un avis (POST /reviews/likes/toggle)
    const handleToggleLike = async (commentId: number | string) => {
        try {
            await apiClient.post(`/reviews/likes/toggle`, {
                review_id: commentId
            });
            fetchReviews();
        } catch (err) {
            console.error("Erreur lors de l'action sur le like:", err);
        }
    };

    const toggleReplies = (commentId: number | string) => {
        setExpandedReplies(prev => prev.includes(commentId) ? prev.filter(uid => uid !== commentId) : [...prev, commentId]);
    };

    const submitReply = (commentId: number | string) => {
        const text = replyInputs[commentId];
        if (!text || !text.trim()) return;

        setReplyInputs(prev => ({...prev, [commentId]: ""}));
        setActiveReplyId(null);
    };

    return (
        <div
            className="min-h-screen bg-[#0f111a] dark:bg-slate-50 text-white dark:text-gray-900 font-sans pb-20 transition-colors duration-300">
            {/* Modale d'ajout aux playlists */}
            {isPlaylistModalOpen && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                         onClick={() => setIsPlaylistModalOpen(false)}></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="bg-[#1a1b26] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">{t('add_to_playlist')}</h3>
                            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
                                <p className="text-sm text-gray-500 text-center py-4">{t('no_playlist')}</p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/create-playlist', {
                                        state: {
                                            returnTo: `/album/${id}`,
                                            albumToAdd: albumData
                                        }
                                    })}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    <FaPlus size={14}/> {t('create_playlist')}
                                </button>
                                <button onClick={() => setIsPlaylistModalOpen(false)}
                                        className="w-full py-3 text-gray-400 font-bold">{t('cancel')}</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <main className="max-w-6xl mx-auto px-6 pt-8">
                <button onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-gray-900 mb-8 group">
                    <FaChevronLeft className="group-hover:-translate-x-1 transition-transform"/> {t('back')}
                </button>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Cover */}
                    <div className="w-full md:w-80 shrink-0">
                        <div className="sticky top-24">
                            <img src={urlCover || albumData?.image?.[3]?.["#text"]} alt={albumData?.name}
                                 className="w-full aspect-square rounded-2xl shadow-2xl border border-gray-800 dark:border-gray-200 object-cover"/>
                        </div>
                    </div>

                    {/* Infos */}
                    <div className="flex-1 flex flex-col gap-8">
                        <section>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 italic uppercase">{albumData?.name}</h1>
                            <h2 className="text-2xl text-blue-400 dark:text-blue-600 font-medium">{albumData?.artist}</h2>
                        </section>

                        <div className="flex items-center gap-3">
                            <FaStar className="text-[#FF1E56] text-2xl"/>
                            <span
                                className="text-3xl font-bold">{albumData?.playcount ? (albumData?.listeners / 10000).toFixed(1) : '0.0'}</span>
                            <span className="text-gray-500 font-medium">{t('fan_rating')}</span>
                        </div>

                        {/* Actions et Menu Déroulant */}
                        <div className="flex flex-wrap gap-3 items-center">
                            <button onClick={() => setIsPlaylistModalOpen(true)}
                                    className="bg-[#1a1b26] dark:bg-white border border-gray-700 dark:border-gray-200 p-4 rounded-xl text-white dark:text-gray-900">
                                <FaPlus/>
                            </button>

                            <div className="relative">
                                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="bg-[#1a1b26] dark:bg-white border border-gray-700 dark:border-gray-200 px-5 py-3.5 rounded-xl text-white dark:text-gray-900 flex items-center gap-4 min-w-[220px] justify-between shadow-lg">
                                    <span className="text-sm font-bold tracking-wide uppercase flex items-center gap-2">
                                        {selectedStatusOption && <span
                                            className={selectedStatusOption.color}>{selectedStatusOption.icon}</span>}
                                        {currentStatus}
                                    </span>
                                    <FaChevronDown
                                        className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        size={12}/>
                                </button>

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
                                                        setCurrentStatus(option.label);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-800 dark:hover:bg-gray-100 text-left border-b border-gray-800 dark:border-gray-200 last:border-0"
                                                >
                                                    <span className={`${option.color}`}>{option.icon}</span>
                                                    <span
                                                        className="text-sm font-bold text-gray-200 dark:text-gray-700 uppercase">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <section>
                            <h3 className="text-xl font-bold mb-4 border-b border-gray-800 dark:border-gray-200 pb-2 w-fit">{t('description_title')}</h3>
                            <p className="text-gray-400 dark:text-gray-600 leading-relaxed max-w-2xl">
                                {albumData?.wiki?.summary ? albumData.wiki.summary.replace(/<[^>]*>?/gm, "").split(" <a href")[0] : "Aucune biographie disponible."}
                            </p>
                        </section>

                        {/* Onglets Navigation */}
                        <div className="mt-4">
                            <div
                                className="flex gap-2 mb-8 bg-[#1a1b26] dark:bg-white p-1.5 rounded-xl w-fit border border-gray-800 dark:border-gray-200 shadow-sm">
                                {[t('tab_comments'), t('tab_similar')].map((tabLabel, idx) => {
                                    const isCommentsTab = idx === 0;
                                    const isTabActive = isCommentsTab ? activeTab === 'Commentaires' : activeTab === 'Albums';
                                    return (
                                        <button
                                            key={tabLabel}
                                            onClick={() => setActiveTab(isCommentsTab ? 'Commentaires' : 'Albums')}
                                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${isTabActive ? 'bg-gray-700 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md' : 'text-gray-400 dark:text-gray-500'}`}
                                        >
                                            {isCommentsTab ? `${t('tab_comments')} (${commentsList.length})` : tabLabel}
                                        </button>
                                    );
                                })}
                            </div>

                            {activeTab === 'Commentaires' ? (
                                <>
                                    {/* Formulaire avis conditionnel */}
                                    {!hasAlreadyReviewed ? (
                                        <div
                                            className="mb-10 bg-[#1a1b26] dark:bg-white p-6 rounded-2xl border border-gray-800 dark:border-gray-200 shadow-sm">
                                            <h4 className="text-lg font-bold mb-6 italic">{t('write_comment')}</h4>
                                            <div className="flex flex-col gap-5">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-400 dark:text-gray-500 mr-2 font-medium">{t('rating')} *
                                                        :</p>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <FaStar
                                                                key={star}
                                                                className={`cursor-pointer transition-colors ${(hoverRating || userRating) >= star ? 'text-[#FF1E56]' : 'text-gray-700 dark:text-gray-300'}`}
                                                                size={20}
                                                                onMouseEnter={() => setHoverRating(star)}
                                                                onMouseLeave={() => setHoverRating(0)}
                                                                onClick={() => setUserRating(star)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        className="block text-sm font-bold mb-2">{t('title_label')} *</label>
                                                    <input
                                                        type="text"
                                                        value={commentTitle}
                                                        onChange={(e) => setCommentTitle(e.target.value)}
                                                        placeholder={t('placeholder_title')}
                                                        className="w-full bg-[#161b2c] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-xl p-4 text-sm focus:outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        className="block text-sm font-bold mb-2">{t('comment_label')} *</label>
                                                    <textarea
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder={t('placeholder_comment')}
                                                        className="w-full bg-[#161b2c] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-xl p-4 text-sm focus:outline-none min-h-[100px] resize-none"
                                                    />
                                                </div>

                                                <div className="flex justify-end mt-2">
                                                    <button
                                                        onClick={submitMainComment}
                                                        disabled={isFormInvalid}
                                                        className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${isFormInvalid ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                                                    >
                                                        <FaPaperPlane size={12}/> {t('publish_btn')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="mb-10 bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl text-center text-sm text-blue-400 font-semibold shadow-inner">
                                            💡 Vous avez déjà publié un avis pour cet album. Vous pouvez l'éditer ou le
                                            supprimer directement sur votre commentaire ci-dessous.
                                        </div>
                                    )}

                                    {/* Liste dynamique des avis */}
                                    {loadingReviews ? (
                                        <div className="flex justify-center py-6">
                                            <Loader2 className="animate-spin text-pink-500" size={32}/>
                                        </div>
                                    ) : commentsList.length > 0 ? (
                                        <div className="space-y-6">
                                            {commentsList.map(comment => (
                                                <div key={comment.id}
                                                     className="bg-[#161b2c] dark:bg-white p-8 rounded-2xl border border-gray-800/50 dark:border-gray-200 relative">
                                                    {editingCommentId === comment.id ? (
                                                        <div className="flex flex-col gap-5">
                                                            <h4 className="text-lg font-bold italic">{t('edit_comment')}</h4>
                                                            <div className="flex gap-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <FaStar key={star} size={20}
                                                                            className={`cursor-pointer ${(editHoverRating || editRating) >= star ? 'text-[#FF1E56]' : 'text-gray-700'}`}
                                                                            onMouseEnter={() => setEditHoverRating(star)}
                                                                            onMouseLeave={() => setEditHoverRating(0)}
                                                                            onClick={() => setEditRating(star)}/>
                                                                ))}
                                                            </div>
                                                            <input type="text" value={editTitle}
                                                                   onChange={(e) => setEditTitle(e.target.value)}
                                                                   className="w-full bg-[#1a1b26] dark:bg-gray-50 border p-4 text-sm rounded-xl focus:outline-none"/>
                                                            <textarea value={editText}
                                                                      onChange={(e) => setEditText(e.target.value)}
                                                                      className="w-full bg-[#1a1b26] dark:bg-gray-50 border p-4 text-sm rounded-xl min-h-[100px] resize-none focus:outline-none"/>
                                                            <div className="flex justify-end gap-3">
                                                                <button onClick={cancelEditing}
                                                                        className="px-4 py-2 text-sm font-bold text-gray-400">{t('cancel')}</button>
                                                                <button onClick={() => saveEdit(comment.id)}
                                                                        disabled={isEditInvalid}
                                                                        className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg">{t('save')}</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Actions directes (Modifier / Supprimer) affichées UNIQUEMENT si l'avis appartient à l'utilisateur connecté */}
                                                            {isMyComment(comment) && (
                                                                <div
                                                                    className="absolute top-6 right-6 flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => startEditing(comment)}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700 dark:bg-gray-100 dark:text-gray-700 dark:hover:bg-gray-200 dark:border-gray-300"
                                                                    >
                                                                        <Edit3 size={13}/>
                                                                        {t('modify') || "Modifier"}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteComment(comment.id)}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition-colors border border-rose-500/20"
                                                                    >
                                                                        <Trash2 size={13}/>
                                                                        {t('delete') || "Supprimer"}
                                                                    </button>
                                                                </div>
                                                            )}

                                                            <div className="flex justify-between items-start mb-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div
                                                                        className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 font-bold border text-sm">
                                                                        {(comment.user?.username || "Us").substring(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-100 dark:text-gray-900">{comment.user?.username || "Anonyme"}</h4>
                                                                        <p className="text-xs text-gray-500 font-medium">{new Date(comment.created_at || Date.now()).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                {/* Petit décalage vers la gauche de la note si les boutons d'action de l'auteur sont présents */}
                                                                <div
                                                                    className={`flex text-[#FF1E56] gap-0.5 ${isMyComment(comment) ? 'mr-36' : ''}`}>
                                                                    {[...Array(5)].map((_, i) => <FaStar key={i}
                                                                                                         size={14}
                                                                                                         className={i < comment.rating ? "text-[#FF1E56]" : "text-gray-700"}/>)}
                                                                </div>
                                                            </div>

                                                            {comment.title &&
                                                                <h5 className="text-lg font-bold mb-3 italic tracking-wide uppercase">{comment.title}</h5>}
                                                            <p className="text-gray-400 dark:text-gray-600 text-sm leading-relaxed mb-6 italic">{comment.content || comment.text}</p>

                                                            <div
                                                                className="flex gap-6 text-gray-500 text-sm items-center">
                                                                <button onClick={() => handleToggleLike(comment.id)}
                                                                        className="flex items-center gap-2">
                                                                    <Heart size={14}/> {comment.likes?.length || 0}
                                                                </button>
                                                                <button
                                                                    onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <MessageCircle
                                                                        size={14}/> {comment.replies?.length || 0} {t('reply')}
                                                                </button>
                                                                {comment.replies?.length > 0 && (
                                                                    <button onClick={() => toggleReplies(comment.id)}
                                                                            className="text-xs text-blue-500 ml-auto">
                                                                        {expandedReplies.includes(comment.id) ? t('hide_replies') : t('show_replies', {count: comment.replies.length})}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Champ de saisie interactif pour les réponses */}
                                                            {activeReplyId === comment.id && (
                                                                <div
                                                                    className="mt-4 pt-4 border-t border-gray-800/50 dark:border-gray-200">
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="text"
                                                                            autoFocus
                                                                            placeholder={t('reply_to', {user: comment.user?.username || "Anonyme"})}
                                                                            value={replyInputs[comment.id] || ''}
                                                                            onChange={(e) => setReplyInputs({
                                                                                ...replyInputs,
                                                                                [comment.id]: e.target.value
                                                                            })}
                                                                            onKeyDown={(e) => e.key === 'Enter' && submitReply(comment.id)}
                                                                            className="flex-1 bg-[#1a1b26] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 p-3 text-sm rounded-xl focus:outline-none"
                                                                        />
                                                                        <button
                                                                            onClick={() => submitReply(comment.id)}
                                                                            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
                                                                        >
                                                                            <FaPaperPlane size={14}/>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Rendu des réponses secondaires */}
                                                            {expandedReplies.includes(comment.id) && comment.replies && (
                                                                <div
                                                                    className="mt-4 pl-6 space-y-3 border-l-2 border-gray-800 dark:border-gray-200">
                                                                    {comment.replies.map((reply: any) => (
                                                                        <div key={reply.id}
                                                                             className="bg-[#1a1b26] dark:bg-gray-50 p-4 rounded-xl text-sm">
                                                                            <span
                                                                                className="font-bold text-blue-400 mr-2">{reply.user?.username || reply.user || "Anonyme"}</span>
                                                                            <span
                                                                                className="text-gray-300 dark:text-gray-600">{reply.content || reply.text}</span>
                                                                        </div>
                                                                    ))}
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
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    {t('no_similar')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AlbumDetails;