import React, {useState, useEffect, useCallback, useRef} from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Image,
    Alert,
    FlatList,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import {useRouter, useFocusEffect, Router} from "expo-router";
import Header from "@/src/components/Header";
import apiClient from "../api/client";
import * as SecureStore from "expo-secure-store";
import {jwtDecode} from "jwt-decode";
import {AuthGuardWrapper} from "../components/AuthGuardMapper";
import {getValidSource} from "@/helpers/helpers";
import {useTheme} from "../context/ThemeContext";

type Filter = "Review" | "Abonnement" | "Tendances";

interface FeedCache {
    Review: any[];
    Abonnement: any[];
    Tendances: any[];
}

interface PageCache {
    Review: number;
    Abonnement: number;
    Tendances: number;
}

interface HasMoreCache {
    Review: boolean;
    Abonnement: boolean;
    Tendances: boolean;
}

const ITEMS_PER_PAGE: number = 10;

function timeAgo(dateStr: string | undefined, t: (key: string, opts?: any) => string): string {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("time_just_now");
    if (mins < 60) return t("time_mins_ago", {count: mins});
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("time_hours_ago", {count: hours});
    const days = Math.floor(hours / 24);
    if (days < 30) return t("time_days_ago", {count: days});
    return t("time_months_ago", {count: Math.floor(days / 30)});
}

const Feed = () => {
    const {t} = useTranslation();
    const router: Router = useRouter();
    const {theme, isDarkMode} = useTheme();
    const [activeFilter, setActiveFilter] = useState<Filter>("Review");
    const [searchQuery, setSearchQuery] = useState("");

    const [feedsCache, setFeedsCache] = useState<FeedCache>({
        Review: [],
        Abonnement: [],
        Tendances: [],
    });

    const [pagesCache, setPagesCache] = useState<PageCache>({
        Review: 0,
        Abonnement: 0,
        Tendances: 0,
    });

    const [hasMoreCache, setHasMoreCache] = useState<HasMoreCache>({
        Review: true,
        Abonnement: true,
        Tendances: true,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const isFirstRender = useRef(true);
    const isInteracting = useRef(false);
    const activeFilterRef = useRef<Filter>(activeFilter);

    useEffect((): void => {
        const getUserId: () => Promise<void> = async (): Promise<void> => {
            try {
                const token: string | null =
                    await SecureStore.getItemAsync("userToken");
                if (token) {
                    const decoded: any = jwtDecode(token);
                    setCurrentUserId(decoded.id);
                }
            } catch (err) {
                console.error("Erreur token:", err);
            }
        };
        getUserId();
    }, []);

    useEffect((): void => {
        activeFilterRef.current = activeFilter;
        if (feedsCache[activeFilter].length === 0) {
            fetchFeed(activeFilter, 0, false);
        } else {
            setIsLoading(false);
        }
    }, [activeFilter]);

    useFocusEffect(
        useCallback((): void => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            onRefresh();
        }, [activeFilter]),
    );

    const fetchFeed = async (
        targetFilter: Filter,
        currentOffset: number,
        isLoadMoreAction: boolean = false,
    ): Promise<void> => {
        if (isInteracting.current) return;

        try {
            if (!isLoadMoreAction && !isRefreshing) {
                setIsLoading(true);
            } else if (isLoadMoreAction) {
                setIsLoadingMore(true);
            }

            const token: string | null = await SecureStore.getItemAsync("userToken");
            if (!token) return;

            const decoded: any = jwtDecode(token);
            const userId: any = decoded.id;

            let endpoint: string = "";
            const queryParams: string = `limit=${ITEMS_PER_PAGE}&offset=${currentOffset}`;

            switch (targetFilter) {
                case "Review":
                    endpoint = `/activities/feed/global?current_user_id=${userId}&${queryParams}`;
                    break;
                case "Abonnement":
                    endpoint = `/activities/feed/friends/${userId}?current_user_id=${userId}&${queryParams}`;
                    break;
                case "Tendances":
                    endpoint = `/activities/feed/discovery/${userId}?current_user_id=${userId}&${queryParams}`;
                    break;
            }

            const response = await apiClient.get(endpoint);
            const items: any[] = response.data?.feed || response.data || [];

            setFeedsCache((prev: FeedCache) => ({
                ...prev,
                [targetFilter]: isLoadMoreAction
                    ? [...prev[targetFilter], ...items]
                    : items,
            }));

            setHasMoreCache((prev: HasMoreCache) => ({
                ...prev,
                [targetFilter]: items.length === ITEMS_PER_PAGE,
            }));

            if (isLoadMoreAction) {
                setPagesCache((prev: PageCache) => ({
                    ...prev,
                    [targetFilter]: currentOffset + ITEMS_PER_PAGE,
                }));
            } else {
                setPagesCache((prev: PageCache) => ({
                    ...prev,
                    [targetFilter]: ITEMS_PER_PAGE,
                }));
            }
        } catch (error) {
            console.error(`Erreur récupération feed (${targetFilter}):`, error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    const handleLike: (id: string) => Promise<void> = async (id: string): Promise<void> => {
        if (!currentUserId) {
            Alert.alert(t("auth_required"), t("feed_like_login_required"));
            return;
        }

        if (isInteracting.current) return;
        isInteracting.current = true;

        const currentFeedItems: any[] = feedsCache[activeFilter];
        const itemIndex: number = currentFeedItems.findIndex((f): boolean => f.id === id);
        if (itemIndex === -1) {
            isInteracting.current = false;
            return;
        }

        const item = currentFeedItems[itemIndex];
        if (item.type !== "review") {
            isInteracting.current = false;
            return;
        }

        const currentlyLiked: boolean = !!item.isLiked;
        const updatedItems: any[] = [...currentFeedItems];
        const targetItem = {...updatedItems[itemIndex]};

        targetItem.isLiked = !currentlyLiked;
        targetItem.likes_count = currentlyLiked
            ? Math.max(0, (targetItem.likes_count || 1) - 1)
            : (targetItem.likes_count || 0) + 1;

        updatedItems[itemIndex] = targetItem;

        setFeedsCache((prev: FeedCache) => ({...prev, [activeFilter]: updatedItems}));

        try {
            const response = await apiClient.post(`/reviews/likes/toggle`, {
                review_id: item.review_id || item.id,
                user_id: currentUserId,
            });

            const {isLiked, likes_count} = response.data;
            const finalItems: any[] = [...updatedItems];
            finalItems[itemIndex] = {
                ...finalItems[itemIndex],
                isLiked,
                likes_count,
            };

            setFeedsCache((prev: FeedCache) => ({...prev, [activeFilter]: finalItems}));
        } catch (error) {
            console.error("Erreur toggle like:", error);
            await fetchFeed(activeFilter, 0, false);
            Alert.alert(t("error"), t("feed_like_update_error"));
        } finally {
            isInteracting.current = false;
        }
    };

    const onRefresh: () => void = (): void => {
        setIsRefreshing(true);
        fetchFeed(activeFilter, 0, false);
    };

    const loadMoreData: () => void = (): void => {
        if (isLoadingMore || !hasMoreCache[activeFilter]) return;
        const nextOffset: number = pagesCache[activeFilter];
        fetchFeed(activeFilter, nextOffset, true);
    };

    const filteredItems: any[] = (feedsCache[activeFilter] || []).filter((item): boolean | undefined => {
        if (!item) return false;
        const searchLower: string = (searchQuery || "").toLowerCase().trim();
        if (searchLower === "") return true;
        return (
            item.album?.toLowerCase().includes(searchLower) ||
            item.artist?.toLowerCase().includes(searchLower) ||
            item.user_name?.toLowerCase().includes(searchLower)
        );
    });

    const renderItem = ({item}: { item: any; index: number }) => {
        const liked: boolean = !!item.isLiked;
        const displayRating: number =
            item.userReviewRating ?? item.globalRating ?? item.rating ?? 0;

        return (
            <View style={[styles.card, {backgroundColor: theme.surface, borderColor: theme.border}]}>
                <View style={styles.userRow}>
                    <TouchableOpacity
                        style={styles.userInfoClickable}
                        onPress={(): void =>
                            router.push({
                                pathname: "/profile",
                                params: {id: item.user_id},
                            })
                        }
                    >
                        {item.user_image ? (
                            <Image source={{uri: item.user_image}} style={styles.avatar}/>
                        ) : (
                            <View
                                style={[
                                    styles.avatar,
                                    {
                                        backgroundColor:
                                            item.type === "review" ? "#2563eb" : "#ec4899",
                                    },
                                ]}
                            >
                                <Text style={styles.avatarText}>
                                    {item.user_name
                                        ? item.user_name.substring(0, 2).toUpperCase()
                                        : "AI"}
                                </Text>
                            </View>
                        )}
                        <View>
                            <Text style={[styles.userName, {color: theme.text}]}>
                                {(item.user_name || t("recommendation_label")) + " "}
                                <Text style={[styles.actionText, {color: theme.placeholder}]}>
                                    {item.type === "review"
                                        ? t("action_wrote_review")
                                        : t("action_new_album")}
                                </Text>
                            </Text>
                            <Text style={[styles.timeText, {color: theme.placeholder}]}>
                                {item.type === "recommendation" ? t("feed_ai_suggestion") : timeAgo(item.created_at, t)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={(): void =>
                        router.push({
                            pathname: "/albumdetails",
                            params: {
                                id: item.api_id || item.media_id || "",
                                artist: item.artist,
                                album: item.album,
                                cover: item.cover,
                            },
                        })
                    }
                >
                    <View style={[styles.albumRow, {backgroundColor: theme.inputBg}]}>
                        {item.cover ? (
                            <Image
                                source={getValidSource(item.cover)}
                                style={styles.albumCover}
                            />
                        ) : (
                            <View style={[styles.albumCover, styles.albumCoverPlaceholder, {backgroundColor: theme.card}]}>
                                <Ionicons name="musical-notes" size={30} color={theme.placeholder}/>
                            </View>
                        )}
                        <View style={styles.albumDetails}>
                            <Text style={[styles.albumTitle, {color: theme.text}]} numberOfLines={1}>
                                {item.album}
                            </Text>
                            <Text style={[styles.artistName, {color: theme.subText}]}>{item.artist}</Text>
                            <View style={styles.starsRow}>
                                {[...Array(5)].map((_, i: number) => (
                                    <Ionicons
                                        key={i}
                                        name="star"
                                        size={14}
                                        color={i < displayRating ? "#ec4899" : theme.separator}
                                    />
                                ))}
                                {item.hasReviewed && (
                                    <Text style={styles.userRatingBadge}>{t("badge_your_rating")}</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {item.type === "review" && item.content && (
                        <View style={styles.reviewBody}>
                            {item.title && (
                                <Text style={[styles.reviewTitle, {color: theme.text}]}>{item.title}</Text>
                            )}
                            <Text style={[styles.postContent, {color: theme.subText}]} numberOfLines={3}>
                                {item.content}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.cardFooter}>
                    {item.type === "review" ? (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, {backgroundColor: theme.card}]}
                                onPress={(): Promise<void> => handleLike(item.id)}
                            >
                                <Ionicons
                                    name={liked ? "heart" : "heart-outline"}
                                    size={20}
                                    color={liked ? "#ec4899" : theme.subText}
                                />
                                <Text
                                    style={[styles.actionCount, {color: theme.subText}, liked && {color: "#ec4899"}]}
                                >
                                    {item.likes_count || 0}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, {backgroundColor: theme.card}]}
                                onPress={(): void =>
                                    router.push(`/review/${item.review_id}/comments`)
                                }
                            >
                                <Ionicons name="chatbubble-outline" size={18} color={theme.subText}/>
                                <Text style={[styles.actionCount, {color: theme.subText}]}>
                                    {item.comments_count || 0}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.writeReviewBtn,
                                item.hasReviewed && styles.alreadyReviewedBtn,
                            ]}
                            onPress={(): void =>
                                router.push({
                                    pathname: "/albumdetails",
                                    params: {
                                        id: item.api_id || item.media_id,
                                        artist: item.artist,
                                        album: item.album,
                                        cover: typeof item.cover === "string" ? item.cover : "",
                                    },
                                })
                            }
                        >
                            <Ionicons
                                name={item.hasReviewed ? "checkmark-circle" : "create-outline"}
                                size={18}
                                color={item.hasReviewed ? "#10b981" : "#ec4899"}
                            />
                            <Text
                                style={[
                                    styles.actionCount,
                                    {color: item.hasReviewed ? "#10b981" : "#ec4899"},
                                ]}
                            >
                                {item.hasReviewed ? t("already_reviewed") : t("write_review")}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoadingMore) return <View style={{height: 20}}/>;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#ec4899"/>
            </View>
        );
    };

    if (isLoading && feedsCache[activeFilter].length === 0) {
        return (
            <View style={[styles.container, styles.center, {backgroundColor: theme.background}]}>
                <ActivityIndicator size="large" color="#ec4899"/>
            </View>
        );
    }

    return (
        <AuthGuardWrapper>
            <View style={[styles.container, {backgroundColor: theme.background}]}>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"}/>
                <Header/>

                <FlatList
                    data={filteredItems}
                    keyExtractor={(item, index: number): string =>
                        item.id ? `${item.id}-${index}` : `feed-${index}`
                    }
                    renderItem={renderItem}
                    onEndReached={loadMoreData}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    ListHeaderComponent={
                        <>
                            <View style={styles.headerSection}>
                                <Text style={[styles.title, {color: theme.text}]}>{t("feed_title")}</Text>
                                <Text style={[styles.subtitle, {color: theme.subText}]}>
                                    {t("feed_subtitle")}
                                </Text>
                            </View>

                            <View style={[styles.searchContainer, {backgroundColor: theme.surface, borderColor: theme.border}]}>
                                <Ionicons
                                    name="search"
                                    size={20}
                                    color={theme.placeholder}
                                    style={styles.searchIcon}
                                />
                                <TextInput
                                    style={[styles.searchInput, {color: theme.text}]}
                                    placeholder={t("search_feed_placeholder")}
                                    placeholderTextColor={theme.placeholder}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>

                            <View style={[styles.filterTabs, {backgroundColor: theme.surface, borderColor: theme.border}]}>
                                <FilterButton
                                    label={t("tab_activities")}
                                    active={activeFilter === "Review"}
                                    icon="grid-outline"
                                    onPress={(): void => setActiveFilter("Review")}
                                />
                                <FilterButton
                                    label={t("tab_following")}
                                    active={activeFilter === "Abonnement"}
                                    icon="people-outline"
                                    onPress={(): void => setActiveFilter("Abonnement")}
                                />
                                <FilterButton
                                    label={t("tab_discovery")}
                                    active={activeFilter === "Tendances"}
                                    icon="sparkles-outline"
                                    onPress={(): void => setActiveFilter("Tendances")}
                                />
                            </View>
                        </>
                    }
                />
            </View>
        </AuthGuardWrapper>
    );
};

const FilterButton = ({label, active, onPress, icon}: any) => {
    const {theme} = useTheme();
    return (
        <TouchableOpacity
            style={[styles.filterBtn, active && [styles.filterBtnActive, {backgroundColor: theme.card}]]}
            onPress={onPress}
        >
            <Ionicons name={icon} size={16} color={active ? theme.text : theme.placeholder}/>
            <Text style={[styles.filterBtnText, {color: theme.placeholder}, active && {color: theme.text}]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1},
    center: {justifyContent: "center", alignItems: "center"},
    scrollContent: {paddingBottom: 40},
    headerSection: {paddingHorizontal: 20, paddingTop: 10, marginBottom: 5},
    title: {fontSize: 28, fontWeight: "bold"},
    subtitle: {fontSize: 14, marginTop: 4},
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginVertical: 15,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    searchIcon: {marginRight: 10},
    searchInput: {flex: 1, height: 45, fontSize: 15},
    filterTabs: {
        flexDirection: "row",
        marginHorizontal: 20,
        padding: 5,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 1,
    },
    filterBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    filterBtnActive: {},
    filterBtnText: {fontSize: 12, fontWeight: "600"},
    filterBtnTextActive: {},
    card: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        marginHorizontal: 20,
        borderWidth: 1,
    },
    userRow: {flexDirection: "row", alignItems: "center", marginBottom: 12},
    userInfoClickable: {flexDirection: "row", alignItems: "center", gap: 10},
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {color: "#fff", fontWeight: "bold", fontSize: 12},
    userName: {fontWeight: "bold", fontSize: 13},
    actionText: {fontWeight: "400"},
    timeText: {fontSize: 9, fontWeight: "bold", marginTop: 2},
    albumRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
        padding: 10,
        borderRadius: 12,
    },
    albumCover: {width: 70, height: 70, borderRadius: 8},
    albumCoverPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
    },
    albumDetails: {flex: 1, justifyContent: "center"},
    albumTitle: {fontSize: 16, fontWeight: "bold"},
    artistName: {fontSize: 13, marginBottom: 4},
    starsRow: {flexDirection: "row", alignItems: "center", gap: 4},
    reviewBody: {marginVertical: 8, paddingHorizontal: 4},
    reviewTitle: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 4,
    },
    postContent: {fontSize: 13, lineHeight: 18},
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 4,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    writeReviewBtn: {
        backgroundColor: "#ec489915",
        borderColor: "#ec489930",
        borderWidth: 1,
    },
    alreadyReviewedBtn: {
        backgroundColor: "#10b98110",
        borderColor: "#10b98130",
    },
    actionCount: {fontSize: 13, fontWeight: "600"},
    userRatingBadge: {
        color: "#ec4899",
        fontSize: 8,
        fontWeight: "bold",
        marginLeft: 4,
    },
    footerLoader: {
        verticalAlign: "middle",
        paddingVertical: 15,
        alignItems: "center",
    },
});

export default Feed;
