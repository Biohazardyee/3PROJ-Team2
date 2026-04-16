import React, {useState, useEffect, useCallback, useRef} from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Image,
    Alert,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter, useFocusEffect} from "expo-router";
import Header from "@/src/components/Header";
import apiClient from "../api/client";
import * as SecureStore from "expo-secure-store";
import {jwtDecode} from "jwt-decode";
import {AuthGuardWrapper} from "../components/AuthGuardMapper";
import {getValidSource} from "@/helpers/helpers";

type Filter = "Review" | "Abonnement" | "Tendances";

const Feed = () => {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<Filter>("Review");
    const [searchQuery, setSearchQuery] = useState("");
    const [feedItems, setFeedItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const isFirstRender = useRef(true);
    const isInteracting = useRef(false);

    // Récupération de l'ID de l'utilisateur actuel au montage
    useEffect(() => {
        const getUserId = async () => {
            try {
                const token = await SecureStore.getItemAsync("userToken");
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

    const fetchFeed = async (showLoader = true) => {
        if (isInteracting.current) return;

        try {
            if (showLoader && feedItems.length === 0) setIsLoading(true);

            const token = await SecureStore.getItemAsync("userToken");
            if (!token) return;

            const decoded: any = jwtDecode(token);
            const userId = decoded.id;

            let endpoint = "";
            switch (activeFilter) {
                case "Review":
                    endpoint = `/activities/feed/global?current_user_id=${userId}`;
                    break;
                case "Abonnement":
                    endpoint = `/activities/feed/friends/${userId}?current_user_id=${userId}`;
                    break;
                case "Tendances":
                    endpoint = `/activities/feed/discovery/${userId}?current_user_id=${userId}`;
                    break;
            }

            const response = await apiClient.get(endpoint);
            const items = response.data?.feed || response.data || [];
            setFeedItems(items);
        } catch (error) {
            console.error("Erreur récupération feed:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Chargement initial et au changement de filtre
    useEffect(() => {
        fetchFeed(true);
    }, [activeFilter]);

    // Rafraîchissement quand l'écran revient au premier plan
    useFocusEffect(
        useCallback(() => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            fetchFeed(false);
        }, [activeFilter])
    );

    const handleLike = async (id: string) => {
        if (!currentUserId) {
            Alert.alert("Connexion requise", "Tu dois être connecté pour liker.");
            return;
        }

        if (isInteracting.current) return;
        isInteracting.current = true;

        const itemIndex = feedItems.findIndex((f) => f.id === id);
        if (itemIndex === -1) {
            isInteracting.current = false;
            return;
        }

        const item = feedItems[itemIndex];
        if (item.type !== "review") {
            isInteracting.current = false;
            return;
        }

        const currentlyLiked = !!item.isLiked;
        const updatedFeed = [...feedItems];
        const targetItem = {...updatedFeed[itemIndex]};

        targetItem.isLiked = !currentlyLiked;
        targetItem.likes_count = currentlyLiked
            ? Math.max(0, (targetItem.likes_count || 1) - 1)
            : (targetItem.likes_count || 0) + 1;

        updatedFeed[itemIndex] = targetItem;
        setFeedItems(updatedFeed);

        try {
            const response = await apiClient.post(`/reviews/likes/toggle`, {
                review_id: item.review_id || item.id,
                user_id: currentUserId,
            });

            const {isLiked, likes_count} = response.data;
            const finalFeed = [...updatedFeed];
            finalFeed[itemIndex] = {...finalFeed[itemIndex], isLiked, likes_count};
            setFeedItems(finalFeed);
        } catch (error) {
            console.error("Erreur toggle like:", error);
            fetchFeed(false);
            Alert.alert("Erreur", "Impossible de mettre à jour le like.");
        } finally {
            isInteracting.current = false;
        }
    };

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchFeed(false);
    };

    const filteredItems = feedItems.filter((item) => {
        if (!item) return false;
        const searchLower = (searchQuery || "").toLowerCase().trim();
        if (searchLower === "") return true;
        return (
            item.album?.toLowerCase().includes(searchLower) ||
            item.artist?.toLowerCase().includes(searchLower) ||
            item.user_name?.toLowerCase().includes(searchLower)
        );
    });

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#ec4899"/>
            </View>
        );
    }

    return (
        <AuthGuardWrapper>
            <View style={styles.container}>
                <StatusBar barStyle="light-content"/>
                <Header/>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor="#ec4899"
                        />
                    }
                >
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Votre fil</Text>
                        <Text style={styles.subtitle}>Découvrez de nouvelles pépites !</Text>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon}/>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher un album..."
                            placeholderTextColor="#6b7280"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <View style={styles.filterTabs}>
                        <FilterButton
                            label="Reviews"
                            active={activeFilter === "Review"}
                            icon="grid-outline"
                            onPress={() => setActiveFilter("Review")}
                        />
                        <FilterButton
                            label="Amis"
                            active={activeFilter === "Abonnement"}
                            icon="people-outline"
                            onPress={() => setActiveFilter("Abonnement")}
                        />
                        <FilterButton
                            label="Découverte"
                            active={activeFilter === "Tendances"}
                            icon="sparkles-outline"
                            onPress={() => setActiveFilter("Tendances")}
                        />
                    </View>

                    <View style={styles.postsList}>
                        {filteredItems.map((item, index) => {
                            const liked = !!item.isLiked;
                            const displayRating = item.userReviewRating ?? item.globalRating ?? item.rating ?? 0;

                            return (
                                <View key={item.id || `feed-${index}`} style={styles.card}>
                                    <View style={styles.userRow}>
                                        {/* AVATAR ET NOM CLIQUABLES POUR ALLER SUR LE PROFIL */}
                                        <TouchableOpacity
                                            style={styles.userInfoClickable}
                                            onPress={() =>
                                                router.push({
                                                    pathname: "/profile",
                                                    params: {id: item.user_id},
                                                })
                                            }
                                        >
                                            <View
                                                style={[
                                                    styles.avatar,
                                                    {backgroundColor: item.type === "review" ? "#2563eb" : "#ec4899"},
                                                ]}
                                            >
                                                <Text style={styles.avatarText}>
                                                    {item.user_name ? item.user_name.substring(0, 2).toUpperCase() : "AI"}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={styles.userName}>
                                                    {item.user_name || "Recommandation"}
                                                    <Text style={styles.actionText}>
                                                        {item.type === "review" ? " a écrit une review" : " Nouvel album"}
                                                    </Text>
                                                </Text>
                                                <Text style={styles.timeText}>
                                                    {item.type === "recommendation" ? "SUGGESTION IA" : "RÉCENT"}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() =>
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
                                        <View style={styles.albumRow}>
                                            {item.cover ? (
                                                <Image source={getValidSource(item.cover)} style={styles.albumCover}/>
                                            ) : (
                                                <View style={[styles.albumCover, styles.albumCoverPlaceholder]}>
                                                    <Ionicons name="musical-notes" size={30} color="#4b5563"/>
                                                </View>
                                            )}
                                            <View style={styles.albumDetails}>
                                                <Text style={styles.albumTitle} numberOfLines={1}>{item.album}</Text>
                                                <Text style={styles.artistName}>{item.artist}</Text>
                                                <View style={styles.starsRow}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Ionicons
                                                            key={i}
                                                            name="star"
                                                            size={14}
                                                            color={i < displayRating ? "#ec4899" : "#374151"}
                                                        />
                                                    ))}
                                                    {item.hasReviewed &&
                                                        <Text style={styles.userRatingBadge}>VOTRE NOTE</Text>}
                                                </View>
                                            </View>
                                        </View>

                                        {item.type === "review" && item.content && (
                                            <View style={styles.reviewBody}>
                                                {item.title && <Text style={styles.reviewTitle}>{item.title}</Text>}
                                                <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.cardFooter}>
                                        {item.type === "review" ? (
                                            <>
                                                <TouchableOpacity style={styles.actionButton}
                                                                  onPress={() => handleLike(item.id)}>
                                                    <Ionicons
                                                        name={liked ? "heart" : "heart-outline"}
                                                        size={20}
                                                        color={liked ? "#ec4899" : "#9ca3af"}
                                                    />
                                                    <Text style={[styles.actionCount, liked && {color: "#ec4899"}]}>
                                                        {item.likes_count || 0}
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={styles.actionButton}
                                                    onPress={() => router.push(`/review/${item.review_id}/comments`)}
                                                >
                                                    <Ionicons name="chatbubble-outline" size={18} color="#9ca3af"/>
                                                    <Text style={styles.actionCount}>{item.comments_count || 0}</Text>
                                                </TouchableOpacity>
                                            </>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.actionButton, styles.writeReviewBtn, item.hasReviewed && styles.alreadyReviewedBtn]}
                                                onPress={() =>
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
                                                    style={[styles.actionCount, {color: item.hasReviewed ? "#10b981" : "#ec4899"}]}>
                                                    {item.hasReviewed ? "Déjà noté" : "Écrire une review"}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity style={[styles.actionButton, {marginLeft: "auto"}]}>
                                            <Ionicons name="bookmark-outline" size={18} color="#9ca3af"/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        </AuthGuardWrapper>
    );
};

const FilterButton = ({label, active, onPress, icon}: any) => (
    <TouchableOpacity style={[styles.filterBtn, active && styles.filterBtnActive]} onPress={onPress}>
        <Ionicons name={icon} size={16} color={active ? "#fff" : "#6b7280"}/>
        <Text style={[styles.filterBtnText, active && styles.filterBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: "#1C1C28"},
    center: {justifyContent: "center", alignItems: "center"},
    scrollContent: {paddingBottom: 40},
    headerSection: {paddingHorizontal: 20, paddingTop: 10, marginBottom: 5},
    title: {fontSize: 28, fontWeight: "bold", color: "#fff"},
    subtitle: {color: "#9ca3af", fontSize: 14, marginTop: 4},
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1d29",
        marginHorizontal: 20,
        marginVertical: 15,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#1f2937",
    },
    searchIcon: {marginRight: 10},
    searchInput: {flex: 1, height: 45, color: "#fff", fontSize: 15},
    filterTabs: {
        flexDirection: "row",
        backgroundColor: "#1a1d29",
        marginHorizontal: 20,
        padding: 5,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#1f2937",
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
    filterBtnActive: {backgroundColor: "#2a2e3f"},
    filterBtnText: {color: "#6b7280", fontSize: 12, fontWeight: "600"},
    filterBtnTextActive: {color: "#fff"},
    postsList: {paddingHorizontal: 20},
    card: {
        backgroundColor: "#1a1d29",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#1f2937",
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    userInfoClickable: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {color: "#fff", fontWeight: "bold", fontSize: 12},
    userName: {color: "#fff", fontWeight: "bold", fontSize: 13},
    actionText: {fontWeight: "400", color: "#6b7280"},
    timeText: {color: "#4b5563", fontSize: 9, fontWeight: "bold", marginTop: 2},
    albumRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
        backgroundColor: "#141721",
        padding: 10,
        borderRadius: 12,
    },
    albumCover: {width: 70, height: 70, borderRadius: 8},
    albumCoverPlaceholder: {
        backgroundColor: "#2a2e3f",
        justifyContent: "center",
        alignItems: "center",
    },
    albumDetails: {flex: 1, justifyContent: "center"},
    albumTitle: {color: "#fff", fontSize: 16, fontWeight: "bold"},
    artistName: {color: "#9ca3af", fontSize: 13, marginBottom: 4},
    starsRow: {flexDirection: "row", alignItems: "center", gap: 4},
    reviewBody: {marginVertical: 8, paddingHorizontal: 4},
    reviewTitle: {color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 4},
    postContent: {color: "#9ca3af", fontSize: 13, lineHeight: 18},
    cardFooter: {flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4},
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: "#1e212e",
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
    actionCount: {color: "#9ca3af", fontSize: 13, fontWeight: "600"},
    userRatingBadge: {color: "#ec4899", fontSize: 8, fontWeight: "bold", marginLeft: 4},
});

export default Feed;