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
import UserAvatar from "./UserAvatar.tsx";
import {AxiosResponse} from "axios";


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

function timeAgo(dateStr?: string, t?: any): string {
    if (!dateStr) return "";
    const diff: number = Date.now() - new Date(dateStr).getTime();
    const mins: number = Math.floor(diff / 60000);

    if (mins < 1) return t ? t("time_just_now") : "À l'instant";
    if (mins < 60) return t ? t("time_mins_ago", { count: mins }) : `Il y a ${mins} min`;

    const hours: number = Math.floor(mins / 60);
    if (hours < 24) return t ? t("time_hours_ago", { count: hours }) : `Il y a ${hours}h`;

    const days: number = Math.floor(hours / 24);
    if (days < 30) return t ? t("time_days_ago", { count: days }) : `Il y a ${days}j`;

    return t ? t("time_months_ago", { count: Math.floor(days / 30) }) : `Il y a ${Math.floor(days / 30)} mois`;
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

const MAX_DEPTH = 2;

function depthClass(depth: number): string {
    if (depth === 1) return "ml-6";
    if (depth >= 2) return "ml-12";
    return "";
}

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

    const fetchComments = useCallback(async (): Promise<void> => {
        if (!item.review_id || commentsFetched) return;
        setCommentsLoading(true);
        try {
            const response: AxiosResponse = await apiClient.get(`/review-comments/review/${item.review_id}`);
            const raw: any[] = response.data?.comments || response.data || [];

            const normalized: ReviewReply[] = raw
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((c: any) => ({
                    id: c.id,
                    user: c.user?.username || c.user_name || t("anonymous"),
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
    }, [item.review_id, commentsFetched, t]);

    const handleToggleComments = () => {
        const next = !commentsOpen;
        setCommentsOpen(next);
        if (next && !commentsFetched) fetchComments();
    };

    const canDelete = (commentUserId?: string | number): boolean => {
        if (isAdmin) return true;
        if (!currentUserId || !commentUserId) return false;
        return String(commentUserId) === String(currentUserId);
    };

    const handleSubmitComment = async (): Promise<void> => {
        const text: string = commentInput.trim();
        if (!text || !currentUserId || !item.review_id) return;
        setSubmittingComment(true);

        const tempId: string = `temp-${Date.now()}`;
        const tempComment: ReviewReply = {
            id: tempId,
            user: t("me"),
            user_id: currentUserId,
            text,
            parent_id: null,
            created_at: new Date().toISOString(),
        };
        setAllComments((prev: ReviewReply[]) => [...prev, tempComment]);
        setCommentInput("");

        try {
            const response: AxiosResponse = await apiClient.post("/review-comments", {
                review_id: item.review_id,
                user_id: currentUserId,
                content: text,
            });
            const saved = response.data?.reviewComment || response.data;

            setAllComments((prev: ReviewReply[]) =>
                prev.map((c: ReviewReply) =>
                    c.id === tempId
                        ? {
                            id: saved.id || tempId,
                            user: saved.user?.username || t("me"),
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
            setAllComments((prev: ReviewReply[]) => prev.filter((c: ReviewReply): boolean => c.id !== tempId));
            setCommentInput(text);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleSubmitReply = async (parentId: string | number): Promise<void> => {
        const text: string = (replyInputs[parentId] || "").trim();
        if (!text || !currentUserId || !item.review_id) return;
        setSubmittingReply(parentId);

        const tempId: string = `temp-reply-${Date.now()}`;
        const tempReply: ReviewReply = {
            id: tempId,
            user: t("me"),
            user_id: currentUserId,
            text,
            parent_id: parentId,
            created_at: new Date().toISOString(),
        };
        setAllComments((prev: ReviewReply[]) => [...prev, tempReply]);
        setReplyInputs((prev) => ({...prev, [parentId]: ""}));
        setActiveReplyId(null);
        if (!expandedParents.includes(parentId)) {
            setExpandedParents((prev: (string | number)[]) => [...prev, parentId]);
        }

        try {
            const response: AxiosResponse = await apiClient.post("/review-comments", {
                review_id: item.review_id,
                user_id: currentUserId,
                content: text,
                parent_id: parentId,
            });

            const saved = response.data?.reviewComment || response.data;
            setAllComments((prev: ReviewReply[]) =>
                prev.map((c: ReviewReply) =>
                    c.id === tempId
                        ? {
                            id: saved.id || tempId,
                            user: saved.user?.username || t("me"),
                            user_id: saved.user?.id || currentUserId,
                            text: saved.content || text,
                            parent_id: parentId,
                            created_at: saved.created_at || tempReply.created_at,
                        }
                        : c
                )
            );
        } catch {
            setAllComments((prev: ReviewReply[]) => prev.filter((c: ReviewReply): boolean => c.id !== tempId));
        } finally {
            setSubmittingReply(null);
        }
    };

    const handleDelete = async (commentId: string | number): Promise<void> => {
        setDeletingId(commentId);
        try {
            await apiClient.delete(`/review-comments/${commentId}`);
            const collectDescendants = (id: string | number, comments: ReviewReply[]): (string | number)[] => {
                const children: ReviewReply[] = comments.filter((c: ReviewReply): boolean => c.parent_id === id);
                return [id, ...children.flatMap((child: ReviewReply) => collectDescendants(child.id, comments))];
            };
            const toRemove: Set<string | number> = new Set(collectDescendants(commentId, allComments));
            setAllComments((prev: ReviewReply[]) => prev.filter((c: ReviewReply) => !toRemove.has(c.id)));
        } catch {
        } finally {
            setDeletingId(null);
        }
    };

    const rootComments: ReviewReply[] = allComments.filter((c: ReviewReply) => !c.parent_id);
    const directReplies = (parentId: string | number) =>
        allComments.filter((c: ReviewReply): boolean => c.parent_id === parentId);
    const allDescendants = (parentId: string | number, visited: Set<string | number> = new Set<string | number>()): ReviewReply[] => {
        if (visited.has(parentId)) return [];
        visited.add(parentId);
        const direct: ReviewReply[] = directReplies(parentId);
        return direct.flatMap((r: ReviewReply) => [r, ...allDescendants(r.id, visited)]);
    };

    const renderComment = (comment: ReviewReply, depth: number = 0): React.ReactNode => {
        const children: ReviewReply[] = directReplies(comment.id);
        const isExpanded: boolean = expandedParents.includes(comment.id);
        const isReplying: boolean = activeReplyId === comment.id;
        const totalDescendants: number = allDescendants(comment.id).length;
        const isDeleting: boolean = deletingId === comment.id;
        const parentComment: ReviewReply | null | undefined = comment.parent_id
            ? allComments.find((c: ReviewReply): boolean => c.id === comment.parent_id)
            : null;
        const replyTargetId: string | number = depth >= MAX_DEPTH && parentComment
            ? parentComment.id
            : comment.id;

        return (
            <div key={String(comment.id)} className={depth > 0 ? depthClass(depth) : undefined}>
                <div className={depth > 0 ? "border-l-2 border-[#2A2A38] dark:border-gray-300 pl-4" : undefined}>

                    <div
                        className={`flex gap-3 bg-[#13131A] dark:bg-gray-50 p-4 rounded-xl border border-gray-800/50 dark:border-gray-200 transition-colors ${depth > 0 ? depthBorderClass(depth) : ""}`}
                    >
                        {/* Avatar avec fallback dynamique sur UserAvatar si la photo n'est pas déjà chargée */}
                        {comment.user_image ? (
                            <div className={`rounded-full bg-[#2A2A38] dark:bg-slate-200 flex items-center justify-center font-bold text-blue-400 shrink-0 overflow-hidden ${depth === 0 ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs"}`}>
                                <img src={comment.user_image} alt={comment.user} className="w-full h-full object-cover"/>
                            </div>
                        ) : (
                            <UserAvatar
                                userId={comment.user_id ? String(comment.user_id) : undefined}
                                username={comment.user}
                                sizeClass={depth === 0 ? "w-10 h-10 text-sm font-bold" : "w-8 h-8 text-xs font-bold"}
                            />
                        )}

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

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => setActiveReplyId(isReplying ? null : comment.id)}
                                        className="text-xs text-[#3b82f6] hover:text-blue-400 font-medium transition-colors"
                                    >
                                        {t("reply")}
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
                                                ? t("delete_admin")
                                                : t("delete")
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

                    {activeReplyId === comment.id && (
                        <div className="mt-2 mb-2 flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder={t("reply_to_user", { user: comment.user })}
                                    value={replyInputs[comment.id] || ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyInputs((prev) => ({...prev, [comment.id]: e.target.value}))}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => {
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
                                {t("cancel_btn")}
                            </button>
                        </div>
                    )}

                    {children.length > 0 && (
                        <div className="mt-2 mb-1">
                            <button
                                onClick={() =>
                                    setExpandedParents((prev) =>
                                        prev.includes(comment.id)
                                            ? prev.filter((id: string | number): boolean => id !== comment.id)
                                            : [...prev, comment.id]
                                    )
                                }
                                className="text-xs text-[#3b82f6] hover:text-blue-400 font-medium transition-colors"
                            >
                                {isExpanded
                                    ? t("hide_replies")
                                    : t("view_replies_count", { count: totalDescendants })
                                }
                            </button>
                        </div>
                    )}

                    {isExpanded && children.length > 0 && depth < MAX_DEPTH && (
                        <div className="mt-2 space-y-3 animate-in fade-in duration-200">
                            {children.map((child: ReviewReply) => renderComment(child, depth + 1))}
                        </div>
                    )}

                    {isExpanded && children.length > 0 && depth >= MAX_DEPTH && (
                        <div className="mt-2 space-y-3 animate-in fade-in duration-200">
                            {children.map((child: ReviewReply) => renderComment(child, MAX_DEPTH))}
                        </div>
                    )}
                </div>
            </div>
        );
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
                            {item.user_name || t("recommendation")}
                            <span className="text-gray-400 dark:text-gray-500 font-normal text-sm ml-1">
                                {isReview ? t("wrote_review") : t("new_album")}
                            </span>
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {isNew ? t("suggestion") : timeAgo(item.created_at, t)}
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
                            <span className="text-[9px] font-bold text-[#FF1E56] tracking-wider">{t("your_rating")}</span>
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
                        {item.hasReviewed ? t("already_rated") : t("write_review")}
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
                                <Loader2 size={14} className="animate-spin"/> {t("loading")}
                            </div>
                        ) : rootComments.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400 text-sm py-2">
                                {t("no_comments")}
                            </p>
                        ) : (
                            rootComments.map((comment) => renderComment(comment, 0))
                        )}
                    </div>

                    {/* INPUT PRINCIPAL : Utilisation complète de UserAvatar */}
                    <div className="flex items-center gap-3 mt-4">
                        <UserAvatar
                            userId={currentUserId || undefined}
                            username={t("me")}
                            sizeClass="w-10 h-10 text-sm font-bold"
                        />
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder={t("comment_placeholder")}
                                value={commentInput}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentInput(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSubmitComment()}
                                className="w-full bg-[#13131A] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-full py-3 pl-4 pr-12 text-sm text-white dark:text-gray-900 focus:outline-none transition-colors shadow-inner"
                            />
                            <button
                                onClick={handleSubmitComment}
                                disabled={submittingComment}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF1E56] transition-colors p-1"
                            >
                                {submittingComment ?
                                    <Loader2 size={18} className="animate-spin"/> :
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