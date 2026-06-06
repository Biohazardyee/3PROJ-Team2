import React, {useState, useCallback} from "react";
import {
    Sparkles,
    Star,
    Heart,
    MessageCircle,
    Music,
    PenLine,
    CheckCircle2,
    Loader2,
    Send,
    Trash
} from "lucide-react";
import {useTranslation} from "react-i18next";
import apiClient from "../api/client";


export interface ReviewReply {
    id: string | number;
    user: string;
    user_id?: string | number;
    user_image?: string;
    text: string;
    parent_id?: string | number | null;
    parent_user?: string;
    created_at?: string;
}

export interface ReviewComment {
    id: string | number;
    user: string;
    user_id?: string | number;
    user_image?: string;
    text: string;
    created_at?: string;
    replies: ReviewReply[];
}

export interface FeedItem {
    id: string;
    type: "review" | "new_album" | "recommendation";
    user_id?: string;
    user_name?: string;
    user_image?: string;
    album?: string;
    artist?: string;
    cover?: string;
    rating?: number;
    content?: string;
    title?: string;
    likes_count?: number;
    comments_count?: number;
    isLiked?: boolean;
    hasReviewed?: boolean;
    userReviewRating?: number | null;
    globalRating?: number;
    review_id?: string;
    media_id?: string;
    api_id?: string;
    created_at?: string;
}

interface FeedCardProps {
    item: FeedItem;
    onLike: (id: string) => void;
    onNavigateToAlbum: (item: FeedItem) => void;
    onNavigateToProfile: (userId: string) => void;
    likingId: string | null;
    currentUserId: string | null;
    currentUserRole?: "BASIC" | "ADMIN";
}


function timeAgo(dateStr?: string): string {
    if (!dateStr) return "";
    const diff: number = Date.now() - new Date(dateStr).getTime();
    const mins: number = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours: number = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days: number = Math.floor(hours / 24);
    if (days < 30) return `Il y a ${days}j`;
    return `Il y a ${Math.floor(days / 30)} mois`;
}

function getInitials(name?: string): string {
    if (!name) return "??";
    return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(name?: string): string {
    const colors: string[] = [
        "bg-indigo-900/60 text-indigo-300",
        "bg-violet-900/60 text-violet-300",
        "bg-cyan-900/60 text-cyan-300",
        "bg-emerald-900/60 text-emerald-300",
        "bg-amber-900/60 text-amber-300",
        "bg-rose-900/60 text-rose-300",
    ];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
}

const StarRating: React.FC<{ rating: number }> = ({rating}) => (
    <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={16}
                className={i < rating ? "text-[#FF1E56] fill-[#FF1E56]" : "text-gray-600 dark:text-gray-300"}
            />
        ))}
    </div>
);

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Profondeur max affichée visuellement (0 = racine, 1 = réponse, 2 = réponse à la réponse)
const MAX_DEPTH = 2;

/** Renvoie la classe d'indentation selon la profondeur. */
function depthClass(depth: number): string {
    if (depth === 1) return "ml-6";
    if (depth >= 2) return "ml-12";
    return "";
}

/** Renvoie la classe de bordure colorée selon la profondeur. */
function depthBorderClass(depth: number): string {
    if (depth === 1) return "border-l-[3px] border-l-[#3b82f6]";
    if (depth >= 2) return "border-l-[3px] border-l-[#a855f7]";
    return "";
}

// ─── Component ─────────────────────────────────────────────────────────────────

const FeedCard: React.FC<FeedCardProps> = ({
                                               item,
                                               onLike,
                                               onNavigateToAlbum,
                                               onNavigateToProfile,
                                               likingId,
                                               currentUserId,
                                               currentUserRole = "BASIC",
                                           }) => {
    const {t} = useTranslation();
    const displayRating: number = item.userReviewRating ?? item.globalRating ?? item.rating ?? 0;
    const isReview: boolean = item.type === "review";
    const isNew: boolean = item.type === "new_album" || item.type === "recommendation";
    const isLiking: boolean = likingId === item.id;
    const isAdmin: boolean = currentUserRole === "ADMIN";

    const [commentsOpen, setCommentsOpen] = useState(false);
    // On stocke maintenant un tableau PLAT de tous les commentaires (parents + enfants)
    const [allComments, setAllComments] = useState<ReviewReply[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsFetched, setCommentsFetched] = useState(false);

    const [commentInput, setCommentInput] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [activeReplyId, setActiveReplyId] = useState<string | number | null>(null);
    const [replyInputs, setReplyInputs] = useState<{ [key: string | number]: string }>({});
    const [expandedParents, setExpandedParents] = useState<(string | number)[]>([]);
    const [submittingReply, setSubmittingReply] = useState<string | number | null>(null);
    const [deletingId, setDeletingId] = useState<string | number | null>(null);

    // ─── Chargement : on garde la liste PLATE avec parent_id ──────────────────
    const fetchComments = useCallback(async () => {
        if (!item.review_id || commentsFetched) return;
        setCommentsLoading(true);
        try {
            const response = await apiClient.get(`/review-comments/review/${item.review_id}`);
            const raw: any[] = response.data?.comments || response.data || [];

            // On conserve tous les commentaires à plat, en normalisant les champs
            const normalized: ReviewReply[] = raw
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((c: any) => ({
                    id: c.id,
                    user: c.user?.username || c.user_name || "Anonyme",
                    user_id: c.user?.id || c.user_id || c.userId,
                    user_image: c.user?.profile_picture,
                    text: c.content || c.text || "",
                    parent_id: c.parent_id ?? null,
                    created_at: c.created_at,
                }));

            setAllComments(normalized);
            setCommentsFetched(true);
        } catch {
            setCommentsFetched(true);
        } finally {
            setCommentsLoading(false);
        }
    }, [item.review_id, commentsFetched]);

    const handleToggleComments = () => {
        const next = !commentsOpen;
        setCommentsOpen(next);
        if (next && !commentsFetched) fetchComments();
    };

    // ─── Helpers de permission ─────────────────────────────────────────────────

    const canDelete = (commentUserId?: string | number): boolean => {
        if (isAdmin) return true;
        if (!currentUserId || !commentUserId) return false;
        return String(commentUserId) === String(currentUserId);
    };

    // ─── Soumission d'un commentaire racine ────────────────────────────────────

    const handleSubmitComment = async () => {
        const text = commentInput.trim();
        if (!text || !currentUserId || !item.review_id) return;
        setSubmittingComment(true);

        const tempId = `temp-${Date.now()}`;
        const tempComment: ReviewReply = {
            id: tempId,
            user: "Moi",
            user_id: currentUserId,
            text,
            parent_id: null,
            created_at: new Date().toISOString(),
        };
        setAllComments((prev) => [...prev, tempComment]);
        setCommentInput("");

        try {
            const response = await apiClient.post("/review-comments", {
                review_id: item.review_id,
                user_id: currentUserId,
                content: text,
            });
            const saved = response.data?.reviewComment || response.data;

            setAllComments((prev) =>
                prev.map((c) =>
                    c.id === tempId
                        ? {
                            id: saved.id || tempId,
                            user: saved.user?.username || "Moi",
                            user_id: saved.user?.id || currentUserId,
                            user_image: saved.user?.profile_picture,
                            text: saved.content || text,
                            parent_id: null,
                            created_at: saved.created_at || tempComment.created_at,
                        }
                        : c
                )
            );
        } catch {
            setAllComments((prev) => prev.filter((c) => c.id !== tempId));
            setCommentInput(text);
        } finally {
            setSubmittingComment(false);
        }
    };


    const handleSubmitReply = async (parentId: string | number) => {
        const text = (replyInputs[parentId] || "").trim();
        if (!text || !currentUserId || !item.review_id) return;
        setSubmittingReply(parentId);

        const tempId = `temp-reply-${Date.now()}`;
        const tempReply: ReviewReply = {
            id: tempId,
            user: "Moi",
            user_id: currentUserId,
            text,
            parent_id: parentId,
            created_at: new Date().toISOString(),
        };

        setAllComments((prev) => [...prev, tempReply]);
        setReplyInputs((prev) => ({...prev, [parentId]: ""}));
        setActiveReplyId(null);

        if (!expandedParents.includes(parentId)) {
            setExpandedParents((prev) => [...prev, parentId]);
        }

        try {
            const response = await apiClient.post("/review-comments", {
                review_id: item.review_id,
                user_id: currentUserId,
                content: text,
                parent_id: parentId,
            });

            const saved = response.data?.reviewComment || response.data;

            setAllComments((prev) =>
                prev.map((c) =>
                    c.id === tempId
                        ? {
                            id: saved.id || tempId,
                            user: saved.user?.username || "Moi",
                            user_id: saved.user?.id || currentUserId,
                            text: saved.content || text,
                            parent_id: parentId,
                            created_at: saved.created_at || tempReply.created_at,
                        }
                        : c
                )
            );
        } catch {
            setAllComments((prev) => prev.filter((c) => c.id !== tempId));
        } finally {
            setSubmittingReply(null);
        }
    };

    // ─── Suppression ──────────────────────────────────────────────────────────

    const handleDelete = async (commentId: string | number) => {
        setDeletingId(commentId);
        try {
            await apiClient.delete(`/review-comments/${commentId}`);
            // Supprimer le commentaire ET tous ses descendants
            const collectDescendants = (id: string | number, comments: ReviewReply[]): (string | number)[] => {
                const children = comments.filter((c) => c.parent_id === id);
                return [id, ...children.flatMap((child) => collectDescendants(child.id, comments))];
            };
            const toRemove = new Set(collectDescendants(commentId, allComments));
            setAllComments((prev) => prev.filter((c) => !toRemove.has(c.id)));
        } catch {
            // Erreur silencieuse — on pourrait afficher un toast ici
        } finally {
            setDeletingId(null);
        }
    };

    // ─── Dérivations ──────────────────────────────────────────────────────────

    // Commentaires racines (sans parent)
    const rootComments = allComments.filter((c) => !c.parent_id);

    // Enfants directs d'un parent donné
    const directReplies = (parentId: string | number) =>
        allComments.filter((c) => c.parent_id === parentId);

    // Tous les descendants d'un parent (pour compter) — avec garde-fou anti-boucle
    const allDescendants = (parentId: string | number, visited = new Set<string | number>()): ReviewReply[] => {
        if (visited.has(parentId)) return [];
        visited.add(parentId);
        const direct = directReplies(parentId);
        return direct.flatMap((r) => [r, ...allDescendants(r.id, visited)]);
    };

    // ─── Rendu d'un commentaire (récursif, max MAX_DEPTH niveaux) ────────────────

    const renderComment = (comment: ReviewReply, depth: number = 0): React.ReactNode => {
        const children = directReplies(comment.id);
        const isExpanded = expandedParents.includes(comment.id);
        const isReplying = activeReplyId === comment.id;
        const totalDescendants = allDescendants(comment.id).length;
        const isDeleting = deletingId === comment.id;
        // Mention @parent : uniquement si ce commentaire est une réponse
        const parentComment = comment.parent_id
            ? allComments.find((c) => c.id === comment.parent_id)
            : null;

        // Au niveau max (depth 2), "Répondre" cible le commentaire de niveau 1 (direct enfant de la racine)
        // pour que la nouvelle réponse s'insère dans ce fil sans créer un 4e niveau
        const replyTargetId = depth >= MAX_DEPTH && parentComment
            ? parentComment.id   // on répond au niveau 1, pas au niveau 2
            : comment.id;

        return (
            <div key={String(comment.id)} className={depth > 0 ? depthClass(depth) : undefined}>
                <div className={depth > 0 ? "border-l-2 border-[#2A2A38] dark:border-gray-300 pl-4" : undefined}>

                    {/* ── Bulle du commentaire ── */}
                    <div
                        className={`flex gap-3 bg-[#13131A] dark:bg-gray-50 p-4 rounded-xl border border-gray-800/50 dark:border-gray-200 transition-colors ${depth > 0 ? depthBorderClass(depth) : ""}`}
                    >
                        {/* Avatar */}
                        <div
                            className={`rounded-full bg-[#2A2A38] dark:bg-slate-200 flex items-center justify-center font-bold text-blue-400 shrink-0 overflow-hidden ${depth === 0 ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs"}`}
                        >
                            {comment.user_image
                                ? <img src={comment.user_image} alt={comment.user} className="w-full h-full object-cover"/>
                                : getInitials(comment.user)
                            }
                        </div>

                        {/* Corps */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1 gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-white dark:text-gray-900 text-sm">
                                        {comment.user}
                                    </span>
                                    {parentComment && (
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1C1C28] dark:bg-blue-50 text-[#3b82f6] font-medium border border-[#3b82f6]/20">
                                            @{parentComment.user}
                                        </span>
                                    )}
                                    <span className="text-gray-500 text-xs">
                                        {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ""}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => setActiveReplyId(isReplying ? null : comment.id)}
                                        className="text-xs text-[#3b82f6] hover:text-blue-400 font-medium transition-colors"
                                    >
                                        Répondre
                                    </button>

                                    {canDelete(comment.user_id) && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            disabled={isDeleting}
                                            className="flex items-center gap-1 text-[11px] text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444]/10 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                        >
                                            {isDeleting
                                                ? <Loader2 size={11} className="animate-spin"/>
                                                : <Trash size={11}/>
                                            }
                                            {isAdmin && String(comment.user_id) !== String(currentUserId)
                                                ? "Suppr. (admin)"
                                                : "Supprimer"
                                            }
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-300 dark:text-gray-600 text-sm mt-1 leading-relaxed">
                                {comment.text}
                            </p>
                        </div>
                    </div>

                    {/* ── Input de réponse (affiché sous ce commentaire si actif) ── */}
                    {activeReplyId === comment.id && (
                        <div className="mt-2 mb-2 flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder={`Répondre à ${comment.user}…`}
                                    value={replyInputs[comment.id] || ""}
                                    onChange={(e) => setReplyInputs((prev) => ({...prev, [comment.id]: e.target.value}))}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSubmitReply(replyTargetId);
                                    }}
                                    className="w-full bg-[#13131A] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm text-white dark:text-gray-900 focus:outline-none transition-colors"
                                />
                                <button
                                    onClick={() => handleSubmitReply(replyTargetId)}
                                    disabled={submittingReply === comment.id}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF1E56] transition-colors p-1"
                                >
                                    {submittingReply === comment.id
                                        ? <Loader2 size={16} className="animate-spin"/>
                                        : <Send size={16}/>
                                    }
                                </button>
                            </div>
                            <button
                                onClick={() => setActiveReplyId(null)}
                                className="text-xs text-gray-500 hover:text-white dark:hover:text-gray-900 shrink-0"
                            >
                                {t("cancel_btn", "Annuler")}
                            </button>
                        </div>
                    )}

                    {/* ── Bouton toggle réponses (seulement s'il y a des enfants) ── */}
                    {children.length > 0 && (
                        <div className="mt-2 mb-1">
                            <button
                                onClick={() =>
                                    setExpandedParents((prev) =>
                                        prev.includes(comment.id)
                                            ? prev.filter((id) => id !== comment.id)
                                            : [...prev, comment.id]
                                    )
                                }
                                className="text-xs text-[#3b82f6] hover:text-blue-400 font-medium transition-colors"
                            >
                                {isExpanded
                                    ? "Masquer les réponses"
                                    : `Voir les réponses (${totalDescendants})`
                                }
                            </button>
                        </div>
                    )}

                    {/* ── Réponses récursives (bloquées à MAX_DEPTH) ── */}
                    {isExpanded && children.length > 0 && depth < MAX_DEPTH && (
                        <div className="mt-2 space-y-3 animate-in fade-in duration-200">
                            {children.map((child) => renderComment(child, depth + 1))}
                        </div>
                    )}

                    {/* ── Au niveau max : réponses affichées à plat sans indentation sup ── */}
                    {isExpanded && children.length > 0 && depth >= MAX_DEPTH && (
                        <div className="mt-2 space-y-3 animate-in fade-in duration-200">
                            {children.map((child) => renderComment(child, MAX_DEPTH))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ─── Rendu principal ──────────────────────────────────────────────────────

    return (
        <div
            className="bg-[#1C1C28] dark:bg-white rounded-xl p-6 border border-gray-800 dark:border-gray-200 shadow-sm transition-colors">
            {/* Header Profil */}
            <div className="flex items-center justify-between mb-5">
                <button
                    onClick={() => item.user_id && onNavigateToProfile(item.user_id)}
                    className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                >
                    {item.user_image ? (
                        <img src={item.user_image} alt={item.user_name}
                             className="w-12 h-12 rounded-full object-cover"/>
                    ) : (
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isNew ? "bg-pink-900/50 text-pink-300 dark:bg-pink-100 dark:text-pink-600" : getAvatarColor(item.user_name)}`}>
                            {isNew ? <Sparkles size={18}/> : getInitials(item.user_name)}
                        </div>
                    )}
                    <div className="text-left">
                        <p className="text-white dark:text-gray-900 font-bold">
                            {item.user_name || "Recommandation"}
                            <span className="text-gray-400 dark:text-gray-500 font-normal text-sm ml-1">
                                {isReview ? "a écrit une review" : "· Nouvel album"}
                            </span>
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {isNew ? "SUGGESTION" : timeAgo(item.created_at)}
                        </p>
                    </div>
                </button>

                {isReview && item.rating != null && (
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#13131A] dark:bg-gray-50 rounded-lg border border-gray-800 dark:border-gray-200">
                        <Star size={13} className="text-[#FF1E56] fill-[#FF1E56]"/>
                        <span className="text-white dark:text-gray-900 text-sm font-bold">{item.rating}/5</span>
                    </div>
                )}
            </div>

            {/* Clic vers l'Album */}
            <button
                onClick={() => onNavigateToAlbum(item)}
                className="w-full text-left flex items-center gap-5 bg-[#13131A] dark:bg-gray-50 p-4 rounded-xl border border-gray-800/50 dark:border-gray-200 hover:border-gray-700 dark:hover:border-gray-300 transition-all mb-5 pr-8"
            >
                {item.cover ? (
                    <img src={item.cover} alt={item.album}
                         className="w-20 h-20 rounded-md object-cover shadow-md shrink-0"/>
                ) : (
                    <div
                        className="w-20 h-20 rounded-md bg-[#2a2e3f] dark:bg-gray-200 flex items-center justify-center shrink-0">
                        <Music size={28} className="text-gray-600"/>
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-lg text-white dark:text-gray-900 mb-1">{item.album}</h3>
                    <p className="text-gray-400 dark:text-gray-600 text-sm mb-2">{item.artist}</p>
                    <div className="flex items-center gap-2">
                        <StarRating rating={displayRating}/>
                        {item.hasReviewed && (
                            <span className="text-[9px] font-bold text-[#FF1E56] tracking-wider">VOTRE NOTE</span>
                        )}
                    </div>
                </div>
            </button>

            {/* Contenu (Texte Review) */}
            {isReview && item.content && (
                <p className="text-gray-200 dark:text-gray-700 leading-relaxed text-[15px] mb-6">{item.content}</p>
            )}

            <div className="h-px w-full bg-gray-800 dark:bg-gray-200 mb-4"/>

            {/* Footer / Actions */}
            <div className="flex items-center gap-6">
                {isReview ? (
                    <>
                        <button
                            onClick={() => onLike(item.id)}
                            disabled={isLiking}
                            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${item.isLiked ? "text-[#FF1E56]" : "text-gray-400 dark:text-gray-500 hover:text-[#FF1E56]"}`}
                        >
                            {isLiking ? <Loader2 size={18} className="animate-spin"/> :
                                <Heart size={18} className={item.isLiked ? "fill-[#FF1E56]" : ""}/>}
                            {item.likes_count ?? 0}
                        </button>

                        <button
                            onClick={handleToggleComments}
                            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${commentsOpen ? "text-white dark:text-gray-900" : "text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900"}`}
                        >
                            <MessageCircle size={18}/>
                            {item.comments_count ?? 0}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => onNavigateToAlbum(item)}
                        className={`flex items-center gap-2 text-sm font-semibold transition-colors ${item.hasReviewed ? "text-emerald-400" : "text-[#FF1E56] hover:text-[#ff4d77]"}`}
                    >
                        {item.hasReviewed ? <CheckCircle2 size={18}/> : <PenLine size={18}/>}
                        {item.hasReviewed ? "Déjà noté" : "Écrire une review"}
                    </button>
                )}
            </div>

            {/* Section des Commentaires */}
            {commentsOpen && (
                <div
                    className="mt-6 pt-4 border-t border-gray-800/50 dark:border-gray-200 animate-in fade-in duration-200">
                    <div className="space-y-4 mb-4">
                        {commentsLoading ? (
                            <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                                <Loader2 size={14} className="animate-spin"/> Chargement…
                            </div>
                        ) : rootComments.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400 text-sm py-2">
                                Aucun commentaire pour le moment.
                            </p>
                        ) : (
                            rootComments.map((comment) => renderComment(comment, 0))
                        )}
                    </div>

                    {/* INPUT PRINCIPAL */}
                    <div className="flex items-center gap-3 mt-4">
                        <div
                            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {getInitials(undefined)}
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder={t("comment_placeholder", "Écrire un commentaire…")}
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                                className="w-full bg-[#13131A] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-full py-3 pl-4 pr-12 text-sm text-white dark:text-gray-900 focus:outline-none transition-colors shadow-inner"
                            />
                            <button
                                onClick={handleSubmitComment}
                                disabled={submittingComment}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF1E56] transition-colors p-1"
                            >
                                {submittingComment ? <Loader2 size={18} className="animate-spin"/> :
                                    <Send size={18}/>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedCard;