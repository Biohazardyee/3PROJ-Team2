import React, { useState, useEffect } from "react";
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
import { useRouter } from "expo-router";
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

  const fetchFeed = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) return;

      const decoded: any = jwtDecode(token);
      const userId = decoded.id;

      const response = await apiClient.get(`/activities/feed/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFeedItems(response.data.feed);
    } catch (error) {
      console.error("Erreur lors de la récupération du feed:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchFeed();
  };

  const filteredItems = feedItems.filter((item) => {
    const category =
      item.type === "recommendation" || item.type === "new_album"
        ? "Tendances"
        : "Abonnement";
    const matchesFilter = activeFilter === "Tout" || category === activeFilter;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      item.album?.toLowerCase().includes(searchLower) ||
      item.artist?.toLowerCase().includes(searchLower) ||
      item.user_name?.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  const handlePressAlbum = (item: any) => {
    router.push({
      pathname: "/albumdetails",
      params: {
        id: item.media_id,
        artist: item.artist,
        album: item.album,
      },
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

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#6b7280"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un album, artiste..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

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
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => handlePressAlbum(item)}
            >
              <View style={styles.card}>
                <View style={styles.userRow}>
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: item.type.includes("reco")
                          ? "#ec4899"
                          : "#2563eb",
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
                            ? " Nouvel album pour vous"
                            : " pourrait vous plaire"}
                      </Text>
                    </Text>
                    <Text style={styles.timeText}>
                      {item.type === "recommendation" ? "SUGGESTION" : "RÉCENT"}
                    </Text>
                  </View>
                </View>

                <View style={styles.albumRow}>
                  {item.cover ? (
                    <Image
                      source={{ uri: item.cover }}
                      style={styles.albumCover}
                    />
                  ) : (
                    <View
                      style={[
                        styles.albumCover,
                        {
                          backgroundColor: "#2a2e3f",
                          justifyContent: "center",
                          alignItems: "center",
                        },
                      ]}
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
                    <View style={styles.starsRow}>
                      {item.type === "review" ? (
                        [...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name="star"
                            size={14}
                            color={i < 4 ? "#ec4899" : "#374151"}
                          />
                        ))
                      ) : (
                        <View style={styles.recoBadge}>
                          <Text style={styles.recoBadgeText}>
                            {item.type === "new_album" ? "NEW" : "SIMILAIRE"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {item.content && (
                  <Text style={styles.postContent} numberOfLines={3}>
                    {item.content}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <View style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={20} color="#9ca3af" />
                    <Text style={styles.actionCount}>0</Text>
                  </View>
                  <View style={styles.actionButton}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={18}
                      color="#9ca3af"
                    />
                    <Text style={styles.actionCount}>0</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const FilterButton = ({ label, active, icon, onPress }: any) => (
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
  albumDetails: { flex: 1, justifyContent: "center" },
  albumTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  artistName: { color: "#9ca3af", fontSize: 13, marginBottom: 4 },
  starsRow: { flexDirection: "row", gap: 2 },
  recoBadge: {
    backgroundColor: "#2a2e3f",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recoBadgeText: { color: "#ec4899", fontSize: 9, fontWeight: "bold" },
  postContent: {
    color: "#d1d5db",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: { flexDirection: "row", gap: 20 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionCount: { color: "#9ca3af", fontWeight: "bold", fontSize: 12 },
});

export default Feed;
