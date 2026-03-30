import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import Header from "@/src/components/Header";
import apiClient from "../api/client";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

type Filter = "Tout" | "Abonnement" | "Tendances";

const Feed = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>("Tout");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeed = async (showLoader = true) => {
    try {
      // On ne montre le gros loader que si le feed est vide
      if (showLoader && feedItems.length === 0) setIsLoading(true);

      const token = await SecureStore.getItemAsync("userToken");
      if (!token) return;

      const decoded: any = jwtDecode(token);
      const response = await apiClient.get(`/activities/feed/${decoded.id}`);

      setFeedItems(response.data?.feed || []);
    } catch (error) {
      console.error("Erreur feed:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeed(false); 
    }, []),
  );

  const handleLike = async (id: string) => {
    if (!id) return;

    const item = feedItems.find((f) => f.id === id);
    if (!item || item.type !== "review") return;

    const wasLiked = item.isLiked;
    const previousLikesCount = item.likes_count || 0;

    setFeedItems((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              isLiked: !wasLiked,
              likes_count: wasLiked
                ? Math.max(0, previousLikesCount - 1)
                : previousLikesCount + 1,
            }
          : f,
      ),
    );

    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) throw new Error("No token");

      const decoded: any = jwtDecode(token);
      const userId = decoded.id;
      const targetReviewId = item.review_id || item.id;

      await apiClient.post(`/reviews/likes/toggle`, {
        review_id: targetReviewId,
        user_id: userId,
      });
    } catch (error) {
      console.error("Erreur lors du toggle like:", error);

      setFeedItems((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, isLiked: wasLiked, likes_count: previousLikesCount }
            : f,
        ),
      );
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchFeed();
  };

  const filteredItems = (feedItems || []).filter((item) => {
    if (!item) return false;
    const category =
      item.type === "recommendation" || item.type === "new_album"
        ? "Tendances"
        : "Abonnement";
    const matchesFilter = activeFilter === "Tout" || category === activeFilter;
    const searchLower = (searchQuery || "").toLowerCase();
    return (
      matchesFilter &&
      (item.album?.toLowerCase().includes(searchLower) ||
        item.artist?.toLowerCase().includes(searchLower) ||
        item.user_name?.toLowerCase().includes(searchLower))
    );
  });

  const handlePressAlbum = (item: any) => {
    router.push({
      pathname: "/albumdetails",
      params: { id: item.media_id, artist: item.artist, album: item.album },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />
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

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#6b7280"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un album..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtres */}
        <View style={styles.filterTabs}>
          <FilterButton
            label="Tout"
            active={activeFilter === "Tout"}
            icon="grid-outline"
            onPress={() => setActiveFilter("Tout")}
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
          {filteredItems.map((item, index) => (
            <View key={item.id || index} style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePressAlbum(item)}
              >
                {/* User Row */}
                <View style={styles.userRow}>
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
                  <View>
                    <Text style={styles.userName}>
                      {item.user_name || "Recommandation"}
                      <Text style={styles.actionText}>
                        {item.type === "review"
                          ? " a écrit une review"
                          : item.type === "new_album"
                            ? " Nouvel album"
                            : " pourrait vous plaire"}
                      </Text>
                    </Text>
                    <Text style={styles.timeText}>
                      {item.type === "recommendation"
                        ? "SUGGESTION IA"
                        : "RÉCENT"}
                    </Text>
                  </View>
                </View>

                {/* Album Info */}
                <View style={styles.albumRow}>
                  {item.cover ? (
                    <Image
                      source={{ uri: item.cover }}
                      style={styles.albumCover}
                    />
                  ) : (
                    <View
                      style={[styles.albumCover, styles.albumCoverPlaceholder]}
                    >
                      <Ionicons
                        name="musical-notes"
                        size={30}
                        color="#4b5563"
                      />
                    </View>
                  )}
                  <View style={styles.albumDetails}>
                    <Text style={styles.albumTitle} numberOfLines={1}>
                      {item.album}
                    </Text>
                    <Text style={styles.artistName}>{item.artist}</Text>

                    {/* Zone des notes corrigée */}
                    <View style={styles.starsRow}>
                      {item.type === "review" ? (
                        [...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name="star"
                            size={14}
                            color={
                              i < (item.rating || 0) ? "#ec4899" : "#374151"
                            }
                          />
                        ))
                      ) : (
                        <View style={styles.recoBadgeContainer}>
                          <Ionicons name="star" size={12} color="#f59e0b" />
                          <Text style={styles.recoNoteText}>
                            {item.average_rating > 0
                              ? `${item.average_rating}/5`
                              : "Nouveau"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {item.type === "review" && item.content && (
                  <View style={styles.reviewBody}>
                    {item.title && (
                      <Text style={styles.reviewTitle}>{item.title}</Text>
                    )}
                    <Text style={styles.postContent} numberOfLines={3}>
                      {item.content}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.cardFooter}>
                {item.type === "review" ? (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLike(item.id)}
                    >
                      <Ionicons
                        name={item.isLiked ? "heart" : "heart-outline"}
                        size={20}
                        color={item.isLiked ? "#ec4899" : "#9ca3af"}
                      />
                      <Text
                        style={[
                          styles.actionCount,
                          item.isLiked && { color: "#ec4899" },
                        ]}
                      >
                        {item.likes_count || 0}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        router.push(
                          `/review/${item.review_id || item.id}/comments`,
                        )
                      }
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={18}
                        color="#9ca3af"
                      />
                      <Text style={styles.actionCount}>
                        {item.comments_count || 0}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.writeReviewBtn]}
                    onPress={() => handlePressAlbum(item)}
                  >
                    <Ionicons name="create-outline" size={18} color="#ec4899" />
                    <Text style={[styles.actionCount, { color: "#ec4899" }]}>
                      Écrire une review
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, { marginLeft: "auto" }]}
                >
                  <Ionicons name="bookmark-outline" size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const FilterButton = ({ label, active, onPress, icon }: any) => (
  <TouchableOpacity
    style={[styles.filterBtn, active && styles.filterBtnActive]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={16} color={active ? "#fff" : "#6b7280"} />
    <Text style={[styles.filterBtnText, active && styles.filterBtnTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1C1C28" },
  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 40 },
  headerSection: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 5 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  subtitle: { color: "#9ca3af", fontSize: 14, marginTop: 4 },
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
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, color: "#fff", fontSize: 15 },
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
  filterBtnActive: { backgroundColor: "#2a2e3f" },
  filterBtnText: { color: "#6b7280", fontSize: 12, fontWeight: "600" },
  filterBtnTextActive: { color: "#fff" },
  postsList: { paddingHorizontal: 20 },
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
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  userName: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  actionText: { fontWeight: "400", color: "#6b7280" },
  timeText: { color: "#4b5563", fontSize: 9, fontWeight: "bold", marginTop: 2 },
  albumRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    backgroundColor: "#141721",
    padding: 10,
    borderRadius: 12,
  },
  albumCover: { width: 70, height: 70, borderRadius: 8 },
  albumCoverPlaceholder: {
    backgroundColor: "#2a2e3f",
    justifyContent: "center",
    alignItems: "center",
  },
  albumDetails: { flex: 1, justifyContent: "center" },
  albumTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  artistName: { color: "#9ca3af", fontSize: 13, marginBottom: 4 },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 4 },

  // NOUVEAUX STYLES POUR LES NOTES MOYENNES
  recoBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2e3f",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: "#f59e0b30",
  },
  recoNoteText: { color: "#f59e0b", fontSize: 11, fontWeight: "bold" },

  reviewBody: { marginVertical: 8, paddingHorizontal: 4 },
  reviewTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  postContent: { color: "#9ca3af", fontSize: 13, lineHeight: 18 },
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
    backgroundColor: "#1e212e",
    borderRadius: 20,
  },
  writeReviewBtn: {
    backgroundColor: "#ec489915",
    borderColor: "#ec489930",
    borderWidth: 1,
  },
  actionCount: { color: "#9ca3af", fontSize: 13, fontWeight: "600" },
});

export default Feed;
