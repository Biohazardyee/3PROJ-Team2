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
    user_image?: string;
    text: string;
    parent_user?: string;
    created_at?: string;
}

export interface ReviewComment {
    id: string | number;
    user: string;
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

// ─── Component ─────────────────────────────────────────────────────────────────

const FeedCard: React.FC<FeedCardProps> = ({
                                               item,
                                               onLike,
                                               onNavigateToAlbum,
                                               onNavigateToProfile,
                                               likingId,
                                               currentUserId,
                                           }) => {
    const {t} = useTranslation();
    const displayRating: number = item.userReviewRating ?? item.globalRating ?? item.rating ?? 0;
    const isReview: boolean = item.type === "review";
    const isNew: boolean = item.type === "new_album" || item.type === "recommendation";
    const isLiking: boolean = likingId === item.id;

    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState<ReviewComment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsFetched, setCommentsFetched] = useState(false);

    const [commentInput, setCommentInput] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [activeReplyId, setActiveReplyId] = useState<string | number | null>(null);
    const [replyInputs, setReplyInputs] = useState<{ [key: string | number]: string }>({});
    const [expandedReplies, setExpandedReplies] = useState<(string | number)[]>([]);
    const [submittingReply, setSubmittingReply] = useState<string | number | null>(null);

    // Charger et transformer la liste plate en arbre
    const fetchComments = useCallback(async () => {
        if (!item.review_id || commentsFetched) return;
        setCommentsLoading(true);
        try {
            const response = await apiClient.get(`/review-comments/review/${item.review_id}`);
            const raw = response.data?.comments || response.data || [];

            // 1. Identifier parents et enfants grâce au parent_id
            const parentComments = raw.filter((c: any) => !c.parent_id);
            const childComments = raw.filter((c: any) => c.parent_id);

            // 2. Construire la hiérarchie
            setComments(
                parentComments.map((p: any) => ({
                    id: p.id,
                    user: p.user?.username || p.user_name || "Anonyme",
                    user_image: p.user?.profile_picture,
                    text: p.content || p.text || "",
                    created_at: p.created_at,
                    replies: childComments
                        .filter((child: any) => child.parent_id === p.id)
                        .map((r: any) => ({
                            id: r.id,
                            user: r.user?.username || r.user_name || "Anonyme",
                            user_image: r.user?.profile_picture,
                            text: r.content || r.text || "",
                            created_at: r.created_at,
                            parent_user: p.user?.username || p.user_name || "Anonyme",
                        })),
                }))
            );
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

    const handleSubmitComment = async () => {
        const text = commentInput.trim();
        if (!text || !currentUserId || !item.review_id) return;
        setSubmittingComment(true);

        const tempComment: ReviewComment = {
            id: `temp-${Date.now()}`,
            user: "Moi",
            text,
            created_at: new Date().toISOString(),
            replies: [],
        };
        setComments((prev) => [...prev, tempComment]);
        setCommentInput("");

        try {
            const response = await apiClient.post("/review-comments", {
                review_id: item.review_id,
                user_id: currentUserId,
                content: text,
            });
            const saved = response.data?.comment || response.data;
            setComments((prev) =>
                prev.map((c) =>
                    c.id === tempComment.id
                        ? {
                            id: saved.id,
                            user: saved.user?.username || "Moi",
                            user_image: saved.user?.profile_picture,
                            text: saved.content || text,
                            created_at: saved.created_at || tempComment.created_at,
                            replies: [],
                        }
                        : c
                )
            );
        } catch {
            setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
            setCommentInput(text);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleSubmitReply = async (commentId: string | number) => {
        const text = (replyInputs[commentId] || "").trim();
        if (!text || !currentUserId) return;
        setSubmittingReply(commentId);

        const parentUser = comments.find(c => c.id === commentId)?.user || "Anonyme";
        const tempReply: ReviewReply = {
            id: `temp-reply-${Date.now()}`,
            user: "Moi",
            text,
            parent_user: parentUser,
            created_at: new Date().toISOString()
        };

        setComments((prev) =>
            prev.map((c) =>
                c.id === commentId ? {...c, replies: [...c.replies, tempReply]} : c
            )
        );

        setReplyInputs((prev) => ({...prev, [commentId]: ""}));
        setActiveReplyId(null);
        if (!expandedReplies.includes(commentId)) {
            setExpandedReplies((prev) => [...prev, commentId]);
        }

        try {
            const response = await apiClient.post("/review-comments", {
                review_id: item.review_id,
                user_id: currentUserId,
                content: text,
                parent_id: commentId,
            });
            const saved = response.data?.comment || response.data;
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId
                        ? {
                            ...c,
                            replies: c.replies.map((r) =>
                                r.id === tempReply.id
                                    ? {
                                        id: saved.id,
                                        user: saved.user?.username || "Moi",
                                        text: saved.content || text,
                                        parent_user: parentUser,
                                        created_at: saved.created_at || tempReply.created_at
                                    }
                                    : r
                            ),
                        }
                        : c
                )
            );
        } catch {
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId ? {...c, replies: c.replies.filter((r) => r.id !== tempReply.id)} : c
                )
            );
        } finally {
            setSubmittingReply(null);
        }
    };

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
                                <Loader2 size={14} className="animate-spin"/> Chargement...
                            </div>
                        ) : comments.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400 text-sm py-2">Aucun commentaire pour le
                                moment.</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex flex-col relative">

                                    {/* MESSAGE PRINCIPAL */}
                                    <div
                                        className="flex gap-4 bg-[#13131A] dark:bg-gray-50 p-4 rounded-xl border border-gray-800/50 dark:border-gray-200 transition-colors z-10">
                                        <div
                                            className="w-10 h-10 rounded-full bg-[#2A2A38] dark:bg-slate-200 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0 overflow-hidden">
                                            {comment.user_image ? (
                                                <img src={comment.user_image} alt={comment.user}
                                                     className="w-full h-full object-cover"/>
                                            ) : (
                                                getInitials(comment.user)
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="font-bold text-white dark:text-gray-900 text-sm">{comment.user}</span>
                                                    <span className="text-gray-500 text-xs">
                                                        {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ""}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                                                        className="text-xs text-[#3b82f6] hover:text-blue-400 font-medium transition-colors"
                                                    >
                                                        Répondre
                                                    </button>
                                                    {/* Condition de suppression (à adapter si nécessaire) */}
                                                    <button
                                                        className="flex items-center gap-1 text-[11px] text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444]/10 px-2 py-1 rounded transition-colors">
                                                        <Trash size={12}/> Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">{comment.text}</p>
                                        </div>
                                    </div>

                                    {/* LIGNE D'HÉRITAGE PRINCIPALE & RÉPONSES */}
                                    {expandedReplies.includes(comment.id) && comment.replies.length > 0 && (
                                        <div
                                            className="pl-6 ml-5 border-l-2 border-[#2A2A38] dark:border-gray-300 space-y-3 mt-3 mb-2 animate-in fade-in duration-200">
                                            {comment.replies.map((reply, index) => (
                                                <div key={reply.id}
                                                     className={`flex gap-4 bg-[#13131A] dark:bg-gray-50 p-4 rounded-xl border border-gray-800/50 dark:border-gray-200 border-l-[3px] ${index % 2 === 0 ? "border-l-[#3b82f6]" : "border-l-[#a855f7]"}`}>
                                                    <div
                                                        className="w-8 h-8 rounded-full bg-[#2A2A38] flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 overflow-hidden">
                                                        {reply.user_image ? (
                                                            <img src={reply.user_image} alt={reply.user}
                                                                 className="w-full h-full object-cover"/>
                                                        ) : (
                                                            getInitials(reply.user)
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span
                                                                    className="font-bold text-white dark:text-gray-900 text-sm">{reply.user}</span>
                                                                {reply.parent_user && (
                                                                    <span
                                                                        className="text-[10px] px-2 py-0.5 rounded bg-[#1C1C28] text-[#3b82f6] font-medium border border-[#3b82f6]/20">
                                                                        @{reply.parent_user}
                                                                    </span>
                                                                )}
                                                                <span className="text-gray-500 text-xs">
                                                                    {reply.created_at ? new Date(reply.created_at).toLocaleDateString() : ""}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => setActiveReplyId(comment.id)}
                                                                    className="text-xs text-[#3b82f6] hover:text-blue-400 font-medium transition-colors"
                                                                >
                                                                    Répondre
                                                                </button>
                                                                <button
                                                                    className="flex items-center gap-1 text-[11px] text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444]/10 px-2 py-1 rounded transition-colors">
                                                                    <Trash size={12}/> Supprimer
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">{reply.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* BOUTON MASQUER / AFFICHER LES RÉPONSES */}
                                    {comment.replies.length > 0 && (
                                        <div className="pl-6 ml-5 mt-2 mb-4">
                                            <button
                                                onClick={() => setExpandedReplies((prev) => prev.includes(comment.id) ? prev.filter((id) => id !== comment.id) : [...prev, comment.id])}
                                                className="text-xs text-[#3b82f6] hover:text-blue-400 font-medium transition-colors"
                                            >
                                                {expandedReplies.includes(comment.id)
                                                    ? "Masquer les réponses"
                                                    : `Voir les réponses (${comment.replies.length})`}
                                            </button>
                                        </div>
                                    )}

                                    {/* INPUT POUR RÉPONDRE (Attaché en bas du fil) */}
                                    {activeReplyId === comment.id && (
                                        <div
                                            className="pl-6 ml-5 mt-1 mb-4 flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    placeholder={`Répondre à ${comment.user}…`}
                                                    value={replyInputs[comment.id] || ""}
                                                    onChange={(e) => setReplyInputs((prev) => ({
                                                        ...prev,
                                                        [comment.id]: e.target.value
                                                    }))}
                                                    onKeyDown={(e) => e.key === "Enter" && handleSubmitReply(comment.id)}
                                                    className="w-full bg-[#13131A] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm text-white dark:text-gray-900 focus:outline-none transition-colors"
                                                />
                                                <button
                                                    onClick={() => handleSubmitReply(comment.id)}
                                                    disabled={submittingReply === comment.id}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF1E56] transition-colors p-1"
                                                >
                                                    {submittingReply === comment.id ?
                                                        <Loader2 size={16} className="animate-spin"/> :
                                                        <Send size={16}/>}
                                                </button>
                                            </div>
                                            <button onClick={() => setActiveReplyId(null)}
                                                    className="text-xs text-gray-500 hover:text-white dark:hover:text-gray-900">
                                                {t("cancel_btn", "Annuler")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* INPUT PRINCIPAL DU COMMENTAIRE */}
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
                                {submittingComment ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedCard;