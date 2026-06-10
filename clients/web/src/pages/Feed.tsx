import React, {useState, useEffect, useRef, useCallback} from "react";
import {
    Sparkles,
    Users,
    TrendingUp,
    Search,
    Music,
    RefreshCw,
    ChevronDown,
    Loader2,
} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import apiClient from "../api/client";
import {jwtDecode} from "jwt-decode";
import FeedCard, {FeedItem} from "../components/FeedCard";


type TabType = "all" | "following" | "trending";

interface FeedsCache {
    all: FeedItem[];
    following: FeedItem[];
    trending: FeedItem[];
}

interface PagesCache {
    all: number;
    following: number;
    trending: number;
}

interface HasMoreCache {
    all: boolean;
    following: boolean;
    trending: boolean;
}

const ITEMS_PER_PAGE = 10;


function getCurrentUserId(): string | null {
    try {
        const token = localStorage.getItem("token") || localStorage.getItem("userToken");
        if (!token) return null;
        const decoded: any = jwtDecode(token);
        return decoded.id ?? null;
    } catch {
        return null;
    }
}


const SkeletonCard: React.FC = () => (
    <div
        className="bg-[#1C1C28] dark:bg-white rounded-xl p-6 border border-gray-800 dark:border-gray-200 animate-pulse">
        <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-gray-800 dark:bg-gray-200"/>
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-800 dark:bg-gray-200 rounded w-1/3"/>
                <div className="h-2 bg-gray-800 dark:bg-gray-200 rounded w-1/4"/>
            </div>
        </div>
        <div className="flex gap-4 bg-[#13131A] dark:bg-gray-50 p-4 rounded-xl mb-5">
            <div className="w-20 h-20 rounded-md bg-gray-800 dark:bg-gray-200"/>
            <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-800 dark:bg-gray-200 rounded w-2/3"/>
                <div className="h-3 bg-gray-800 dark:bg-gray-200 rounded w-1/2"/>
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-gray-800 dark:bg-gray-200 rounded"/>
            <div className="h-3 bg-gray-800 dark:bg-gray-200 rounded w-5/6"/>
        </div>
    </div>
);

const EmptyState: React.FC<{ tab: TabType }> = ({tab}) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
            className="w-16 h-16 rounded-2xl bg-[#1C1C28] dark:bg-white border border-gray-800 dark:border-gray-200 flex items-center justify-center mb-4">
            {tab === "following" ? (
                <Users size={28} className="text-gray-600"/>
            ) : tab === "trending" ? (
                <TrendingUp size={28} className="text-gray-600"/>
            ) : (
                <Music size={28} className="text-gray-600"/>
            )}
        </div>
        <p className="text-gray-400 dark:text-gray-600 font-semibold mb-1">
            {tab === "following"
                ? "Aucune activité de tes abonnements"
                : tab === "trending"
                    ? "Aucune découverte disponible"
                    : "Aucune review pour le moment"}
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
            {tab === "following"
                ? "Abonne-toi à des utilisateurs pour voir leur activité"
                : "Reviens plus tard !"}
        </p>
    </div>
);


const Feed: React.FC = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();

    const currentUserId = getCurrentUserId();

    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [feedsCache, setFeedsCache] = useState<FeedsCache>({all: [], following: [], trending: []});
    const [pagesCache, setPagesCache] = useState<PagesCache>({all: 0, following: 0, trending: 0});
    const [hasMoreCache, setHasMoreCache] = useState<HasMoreCache>({all: true, following: true, trending: true});

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [likingId, setLikingId] = useState<string | null>(null);

    const observerTarget = useRef<HTMLDivElement>(null);
    const activeTabRef = useRef<TabType>(activeTab);
    activeTabRef.current = activeTab;


    const fetchFeed = useCallback(
        async (targetTab: TabType, currentOffset: number, isLoadMore = false) => {
            try {
                if (!isLoadMore) setIsLoading(true);
                else setIsLoadingMore(true);

                const queryParams = `limit=${ITEMS_PER_PAGE}&offset=${currentOffset}`;
                let endpoint = "";

                switch (targetTab) {
                    case "all":
                        endpoint = `/activities/feed/global?${currentUserId ? `current_user_id=${currentUserId}&` : ""}${queryParams}`;
                        break;
                    case "following":
                        if (!currentUserId) {
                            setIsLoading(false);
                            return;
                        }
                        endpoint = `/activities/feed/friends/${currentUserId}?${queryParams}`;
                        break;
                    case "trending":
                        if (!currentUserId) {
                            setIsLoading(false);
                            return;
                        }
                        endpoint = `/activities/feed/discovery/${currentUserId}?${queryParams}`;
                        break;
                }

                const response = await apiClient.get(endpoint);
                const items: FeedItem[] = response.data?.feed || [];

                setFeedsCache((prev) => ({
                    ...prev,
                    [targetTab]: isLoadMore ? [...prev[targetTab], ...items] : items,
                }));
                setHasMoreCache((prev) => ({...prev, [targetTab]: items.length === ITEMS_PER_PAGE}));
                setPagesCache((prev) => ({
                    ...prev,
                    [targetTab]: isLoadMore ? currentOffset + ITEMS_PER_PAGE : ITEMS_PER_PAGE,
                }));
            } catch (error) {
                console.error(`Erreur feed (${targetTab}):`, error);
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
                setIsLoadingMore(false);
            }
        },
        [currentUserId]
    );

    useEffect(() => {
        if (feedsCache[activeTab].length === 0) fetchFeed(activeTab, 0, false);
        else setIsLoading(false);
    }, [activeTab, fetchFeed]);

    useEffect(() => {
        fetchFeed("all", 0, false);
    }, [fetchFeed]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore && hasMoreCache[activeTabRef.current]) {
                    fetchFeed(activeTabRef.current, pagesCache[activeTabRef.current], true);
                }
            },
            {threshold: 0.5}
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [fetchFeed, isLoadingMore, hasMoreCache, pagesCache]);

    // ── Like ───────────────────────────────────────────────────────────────────

    const handleLike = useCallback(
        async (id: string) => {
            if (!currentUserId || likingId) return;
            const currentItems = feedsCache[activeTabRef.current];
            const idx = currentItems.findIndex((f) => f.id === id);
            if (idx === -1) return;

            const item = currentItems[idx];
            if (item.type !== "review") return;
            const wasLiked = !!item.isLiked;
            setLikingId(id);

            setFeedsCache((prev) => {
                const updated = [...prev[activeTabRef.current]];
                updated[idx] = {
                    ...updated[idx],
                    isLiked: !wasLiked,
                    likes_count: wasLiked ? Math.max(0, (item.likes_count ?? 1) - 1) : (item.likes_count ?? 0) + 1,
                };
                return {...prev, [activeTabRef.current]: updated};
            });

            try {
                const response = await apiClient.post("/reviews/likes/toggle", {
                    review_id: item.review_id || item.id,
                    user_id: currentUserId,
                });
                const {isLiked, likes_count} = response.data;
                setFeedsCache((prev) => {
                    const updated = [...prev[activeTabRef.current]];
                    const freshIdx = updated.findIndex((f) => f.id === id);
                    if (freshIdx !== -1) updated[freshIdx] = {...updated[freshIdx], isLiked, likes_count};
                    return {...prev, [activeTabRef.current]: updated};
                });
            } catch {
                setFeedsCache((prev) => {
                    const updated = [...prev[activeTabRef.current]];
                    const freshIdx = updated.findIndex((f) => f.id === id);
                    if (freshIdx !== -1) updated[freshIdx] = {
                        ...updated[freshIdx],
                        isLiked: wasLiked,
                        likes_count: item.likes_count
                    };
                    return {...prev, [activeTabRef.current]: updated};
                });
            } finally {
                setLikingId(null);
            }
        },
        [currentUserId, feedsCache, likingId]
    );

    // ── Navigation ─────────────────────────────────────────────────────────────

    const handleNavigateToAlbum = (item: FeedItem) => {
        console.log("Clic sur item :", item);

        const albumId = item.media_id || item.api_id || item.id;

        if (!albumId) {
            console.error("Impossible de naviguer : aucun ID trouvé dans l'item", item);
            return;
        }

        const params = new URLSearchParams({
            artist: item.artist || "",
            album: item.album || "",
            cover: item.cover || "",
            mbid: item.api_id || "",
        }).toString();

        navigate(`/album/${albumId}?${params}`);
    };

    const handleNavigateToProfile = (userId: string) => {
        navigate(`/profil/${userId}`);
    };

    // ── Filter ─────────────────────────────────────────────────────────────────

    const displayedItems = (feedsCache[activeTab] || []).filter((item) => {
        if (!item) return false;
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
            item.album?.toLowerCase().includes(q) ||
            item.artist?.toLowerCase().includes(q) ||
            item.user_name?.toLowerCase().includes(q) ||
            item.content?.toLowerCase().includes(q)
        );
    });

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div
            className="p-8 max-w-[2048px] mx-auto w-full font-sans min-h-screen bg-transparent dark:bg-slate-50 text-white dark:text-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2 text-white dark:text-gray-900">
                        {t("feed_title", "Votre fil")}
                    </h1>
                    <p className="text-gray-400 dark:text-gray-600 text-lg">
                        {t("feed_subtitle", "Restez informé(e) des tendances musicales de la communauté.")}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setIsRefreshing(true);
                        fetchFeed(activeTab, 0, false);
                    }}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C1C28] dark:bg-white border border-gray-800 dark:border-gray-200 text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 hover:border-gray-700 transition-all text-sm disabled:opacity-50"
                >
                    <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""}/>
                    {t("refresh")}
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-8 max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-500"/>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("search_feed_placeholder", "Rechercher un utilisateur, un album...")}
                    className="w-full bg-[#1C1C28] dark:bg-white text-white dark:text-gray-900 text-sm rounded-xl py-3.5 pl-11 pr-4 border border-gray-800 dark:border-gray-200 outline-none transition-all shadow-lg"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#FF1E56] transition-colors text-sm"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div
                className="flex bg-[#1C1C28] dark:bg-white rounded-xl p-1 mb-8 border border-gray-800 dark:border-gray-200 shadow-sm max-w-lg">
                {([
                    {key: "all", label: t("tab_activities", "Activités"), icon: Sparkles},
                    {key: "following", label: t("tab_following", "Suivis"), icon: Users},
                    {key: "trending", label: t("tab_discovery", "Découverte"), icon: TrendingUp},
                ] as const).map(({key, label, icon: Icon}) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
                            activeTab === key
                                ? "bg-[#2A2A38] dark:bg-gray-100 text-white dark:text-gray-900 shadow"
                                : "text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900"
                        }`}
                    >
                        <Icon size={18}/>
                        {label}
                    </button>
                ))}
            </div>

            {/* Feed List */}
            <div className="space-y-6 pb-10">
                {isLoading && feedsCache[activeTab].length === 0 ? (
                    [...Array(3)].map((_, i) => <SkeletonCard key={i}/>)
                ) : displayedItems.length === 0 ? (
                    searchQuery ? (
                        <div className="text-center py-12">
                            <Search size={48} className="mx-auto text-gray-500 dark:text-gray-400 mb-4 opacity-50"/>
                            <p className="text-gray-400 dark:text-gray-600 text-lg">
                                {t("no_post_found", "Aucun résultat pour")} &quot;{searchQuery}&quot;
                            </p>
                        </div>
                    ) : (
                        <EmptyState tab={activeTab}/>
                    )
                ) : (
                    <>
                        {displayedItems.map((item) => (
                            <FeedCard
                                key={item.id}
                                item={item}
                                onLike={handleLike}
                                onNavigateToAlbum={handleNavigateToAlbum}
                                onNavigateToProfile={handleNavigateToProfile}
                                likingId={likingId}
                                currentUserId={currentUserId}
                            />
                        ))}

                        <div ref={observerTarget} className="h-4"/>

                        {isLoadingMore && (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 size={24} className="text-[#FF1E56] animate-spin"/>
                            </div>
                        )}

                        {!hasMoreCache[activeTab] && displayedItems.length > 0 && (
                            <div className="text-center py-8">
                                <div
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C1C28] dark:bg-white border border-gray-800 dark:border-gray-200">
                                    <ChevronDown size={14} className="text-gray-600"/>
                                    <span
                                        className="text-gray-600 dark:text-gray-400 text-xs font-semibold tracking-wide">FIN DU FIL</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Feed;