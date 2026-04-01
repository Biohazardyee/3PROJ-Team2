import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/src/components/Header";
import StatCard from "@/src/components/StatCard";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import apiClient from "../api/client";
import { ReviewWithMediaDto } from "../../../../backend/types/reviews/review.dto.js";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { AuthReviewButton } from "../components/AuthReviewButton";

const { width } = Dimensions.get("window");

type TabType = "Reviews" | "Similar";

const AlbumDetails = () => {
  const { id, mbid, artist, album } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [albumData, setAlbumData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("Reviews");
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [similarAlbums, setSimilarAlbums] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Récupérer l'ID utilisateur au montage
  useEffect(() => {
    const getUserId = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        const decoded: any = jwtDecode(token);
        setCurrentUserId(decoded.id);
      }
    };
    getUserId();
    fetchAlbumDetails();
  }, [id, mbid, artist, album]);

  useFocusEffect(
    useCallback(() => {
      if (albumData || (artist && album)) {
        fetchReviews();
        if (activeTab === "Similar" && similarAlbums.length === 0) {
          fetchSimilar();
        }
      }
    }, [activeTab, albumData, artist, album]),
  );

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await apiClient.get("/reviews");
      const allReviews = res.data.reviews || [];

      const targetArtist = String(artist || "")
        .toLowerCase()
        .trim();
      const targetAlbum = String(album || "")
        .toLowerCase()
        .trim();

      const filtered = allReviews.filter((rev: any) => {
        const content = rev.media?.content;
        if (!content) return false;
        const revArtist = String(content.album?.artist || content.artist || "")
          .toLowerCase()
          .trim();
        const revAlbum = String(content.album?.name || content.name || "")
          .toLowerCase()
          .trim();
        return revArtist === targetArtist && revAlbum === targetAlbum;
      });

      setReviews(filtered);
    } catch (err) {
      console.error("Erreur avis:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchAlbumDetails = async () => {
    try {
      setLoading(true);
      let finalAlbumData = null;

      if (id) {
        try {
          const res = await apiClient.get(`/medias/${id}`);
          if (res.data.media?.content) {
            finalAlbumData = res.data.media.content;
          }
        } catch (err: any) {
          if (err.response?.status !== 404) {
            console.error("Erreur DB Media:", err);
          }
        }
      }

      if (!finalAlbumData && artist && album) {
        console.log("🔍 Media non trouvé en DB, récupération via Last.fm...");
        const res = await apiClient.get("/api/albums/info", {
          params: { artist, album, mbid },
        });

        finalAlbumData = res.data.albumInfo;
      }

      setAlbumData(finalAlbumData);
    } catch (error) {
      console.error("Détails fetch error global:", error);
      Alert.alert("Erreur", "Impossible de charger les détails de l'album.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilar = async () => {
    try {
      setLoadingSimilar(true);
      const res = await apiClient.get("/api/albums/similar", {
        params: {
          artist: artist || albumData?.artist,
          album: album || albumData?.name,
        },
      });
      setSimilarAlbums(res.data.similarAlbums || []);
    } catch (err) {
      console.error("Erreur similar albums:", err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleToggleLike = async (reviewId: string) => {
    if (!currentUserId) {
      Alert.alert(
        "Connexion requise",
        "Tu dois être connecté pour liker un avis.",
      );
      return;
    }

    const reviewIndex = reviews.findIndex((r) => r.id === reviewId);
    if (reviewIndex === -1) return;

    const review = reviews[reviewIndex];
    const isLiked = review.likes?.some((l: any) => l.user_id === currentUserId);

    const updatedReviews = [...reviews];
    if (isLiked) {
      updatedReviews[reviewIndex].likes = review.likes.filter(
        (l: any) => l.user_id !== currentUserId,
      );
    } else {
      updatedReviews[reviewIndex].likes = [
        ...(review.likes || []),
        { user_id: currentUserId },
      ];
    }
    setReviews(updatedReviews);

    try {
      await apiClient.post(`/reviews/likes/toggle`, {
        review_id: reviewId,
        user_id: currentUserId,
      });
    } catch (error) {
      console.error("Erreur toggle like:", error);
      fetchReviews();
      Alert.alert("Erreur", "L'action n'a pas pu être enregistrée.");
    }
  };

  const getCoverImage = (item: any) => {
    if (!item) return "https://via.placeholder.com/300";

    const target = item.album ? item.album : item;

    if (Array.isArray(target.image)) {
      const extralarge = target.image.find((i: any) => i.size === "extralarge");
      return (
        extralarge?.["#text"] ||
        target.image[target.image.length - 1]?.["#text"]
      );
    }
    return "https://via.placeholder.com/300";
  };

  const handleWriteReview = () => {
    const mediaId = id || albumData?.id || albumData?.mediaId;

    if (!mediaId) {
      Alert.alert(
        "Action impossible",
        "Cet album n'est pas encore synchronisé. Reviens dans un instant.",
      );
      return;
    }

    router.push({
      pathname: "/writereview",
      params: {
        id: mediaId,
        title: albumData.album?.name || albumData.name,
        artist: albumData.album?.artist || albumData.artist,
        cover: getCoverImage(albumData),
      },
    });
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
      : 0;

  if (loading)
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  if (!albumData)
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "white" }}>Album introuvable.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getCoverImage(albumData) }}
            style={styles.coverImage}
          />
        </View>

        <View style={styles.paddingContent}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgeRow}
            contentContainerStyle={styles.badgeScrollContent}
          >
            {albumData.album?.tags?.tag?.map((t: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.badge,
                  { backgroundColor: i === 0 ? "#ec4899" : "#1e1e2d" },
                ]}
              >
                <Text style={styles.badgeText}>{t.name.toUpperCase()}</Text>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.albumTitle}>{albumData.album?.name}</Text>
          <Text style={styles.artistName}>{albumData.album?.artist}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name={
                    s <= Math.round(averageRating) ? "star" : "star-outline"
                  }
                  size={20}
                  color="#fbbf24"
                />
              ))}
            </View>
            <Text style={styles.ratingValue}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({reviews.length} avis)</Text>
          </View>

          <View style={styles.actionButtons}>
            <View style={styles.grid}>
              <StatCard
                title="Écouté"
                icon="check-circle-outline"
                color="#00ffa3"
                showCheckbox
              />
              <StatCard
                title="Plus tard"
                icon="playlist-music"
                color="#4747ff"
                showCheckbox
              />
              <StatCard
                title="Favori"
                icon="star"
                color="#fbbf24"
                showCheckbox
              />
              <StatCard
                title="Dislike"
                icon="close-circle-outline"
                color="#f43f5e"
                showCheckbox
              />
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowPlaylistSelector(!showPlaylistSelector)}
            >
              <Text style={styles.primaryButtonText}>
                {showPlaylistSelector ? "Annuler" : "Ajouter à une playlist"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.aboutText}>
              {albumData.album?.wiki?.summary
                ? albumData.album.wiki.summary
                    .replace(/<[^>]*>?/gm, "")
                    .split(" <a href")[0]
                : "Aucune biographie disponible."}
            </Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Reviews" && styles.activeTab]}
            onPress={() => setActiveTab("Reviews")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Reviews" && styles.activeTabText,
              ]}
            >
              Avis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Similar" && styles.activeTab]}
            onPress={() => setActiveTab("Similar")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Similar" && styles.activeTabText,
              ]}
            >
              Similaires
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === "Reviews" ? (
            <View style={{ paddingBottom: 20 }}>
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <AuthReviewButton
                  isLoggedIn={!!currentUserId}
                  onPress={() => {
                    const mediaId = id || albumData?.id || albumData?.mediaId;
                    if (!mediaId) {
                      Alert.alert(
                        "Action impossible",
                        "Cet album n'est pas encore synchronisé.",
                      );
                      return;
                    }
                    router.push({
                      pathname: "/writereview",
                      params: {
                        id: mediaId,
                        title: albumData.album?.name || albumData.name,
                        artist: albumData.album?.artist || albumData.artist,
                        cover: getCoverImage(albumData),
                      },
                    });
                  }}
                />
              </View>
              
              {loadingReviews ? (
                <ActivityIndicator color="#ec4899" />
              ) : reviews.length > 0 ? (
                reviews.map((rev) => (
                  <View key={rev.id} style={styles.reviewCard}>
                    {/* ... reste du contenu de la carte inchangé ... */}
                    <View style={styles.reviewHeader}>
                      <View style={styles.userInfo}>
                        <Ionicons
                          name="person-circle"
                          size={24}
                          color="#94a3b8"
                        />
                        <Text style={styles.reviewerName}>
                          {rev.user?.username || "Anonyme"}
                        </Text>
                      </View>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= rev.rating ? "star" : "star-outline"}
                            size={14}
                            color="#fbbf24"
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewTitleText}>{rev.title}</Text>
                    <Text style={styles.reviewContentText}>{rev.content}</Text>
                    <View style={styles.reviewFooter}>
                      <View style={styles.reviewActionsLeft}>
                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={() => handleToggleLike(rev.id)}
                        >
                          <Ionicons
                            name={
                              rev.likes?.some(
                                (l: any) => l.user_id === currentUserId,
                              )
                                ? "heart"
                                : "heart-outline"
                            }
                            size={18}
                            color={
                              rev.likes?.some(
                                (l: any) => l.user_id === currentUserId,
                              )
                                ? "#ec4899"
                                : "#94a3b8"
                            }
                          />
                          <Text style={styles.actionCountText}>
                            {rev.likes?.length || 0}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={() =>
                            router.push(`/review/${rev.id}/comments`)
                          }
                        >
                          <Ionicons
                            name="chatbubble-outline"
                            size={18}
                            color="#94a3b8"
                          />
                          <Text style={styles.actionCountText}>
                            {rev._count?.comments ?? rev.comments_count ?? 0}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.reviewDate}>
                        {new Date(rev.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Aucun avis. Soyez le premier !
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.similarGrid}
            >
              {loadingSimilar ? (
                <ActivityIndicator color="#ec4899" />
              ) : (
                similarAlbums.map((item: any, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.similarCard}
                    onPress={() =>
                      router.push({
                        pathname: "/albumdetails",
                        params: {
                          artist: item.artist.name || item.artist,
                          album: item.name,
                        },
                      })
                    }
                  >
                    <Image
                      source={{ uri: getCoverImage(item) }}
                      style={styles.similarCover}
                    />
                    <Text numberOfLines={1} style={styles.similarTitle}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f111a",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    padding: 20,
    alignItems: "center",
  },
  coverImage: {
    width: width - 40,
    height: width - 40,
    borderRadius: 20,
  },
  paddingContent: {
    paddingHorizontal: 20,
  },
  badgeRow: {
    marginTop: 15,
    flexDirection: "row", // Indispensable pour horizontal
    // On retire le "gap" ici car ScrollView horizontale gère mal le gap sur certains Android
  },
  badgeScrollContent: {
    paddingRight: 20, // Pour que le dernier tag ne colle pas au bord
    gap: 10, // Espacement entre les tags
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2d2d3f",
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  albumTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 15,
  },
  artistName: { color: "#94a3b8", fontSize: 18, marginTop: 4 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    gap: 8,
  },
  ratingValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  ratingCount: {
    color: "#64748b",
    fontSize: 14,
  },
  actionButtons: {
    marginTop: 25,
    gap: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  primaryButton: {
    backgroundColor: "#c61ebd",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  playlistSelector: {
    backgroundColor: "#1a1d29",
    borderRadius: 16,
    padding: 15,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#2d2d3f",
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2d2d3f",
    gap: 10,
  },
  playlistItemText: {
    color: "white",
    fontSize: 16,
  },
  aboutSection: {
    marginTop: 30,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  aboutText: {
    color: "#94a3b8",
    fontSize: 16,
    lineHeight: 24,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#1a1d29",
    margin: 20,
    padding: 5,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#2d2d3f",
  },
  tabText: {
    color: "#64748b",
    fontWeight: "bold",
  },
  activeTabText: {
    color: "white",
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#64748b",
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
  },
  reviewMiniBtn: {
    marginTop: 20,
    backgroundColor: "#1e1e2d",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ec4899",
  },
  reviewMiniBtnText: {
    color: "#ec4899",
    fontWeight: "bold",
    fontSize: 14,
  },
  footerText: { color: "#94a3b8", marginLeft: 5, fontSize: 14 },

  similarGrid: {
    paddingVertical: 10,
  },
  similarCard: {
    width: 140,
    marginRight: 15,
  },
  similarCover: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#1e1e2d",
  },
  similarTitle: {
    color: "white",
    fontWeight: "bold",
    marginTop: 8,
    fontSize: 14,
  },
  similarArtist: {
    color: "#94a3b8",
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: "#1a1d29",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2d2d3f",
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewerName: {
    color: "#ec4899",
    fontWeight: "bold",
    fontSize: 14,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewTitleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },
  reviewContentText: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
  },
  reviewFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2d2d3f",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewActionsLeft: {
    flexDirection: "row",
    gap: 15,
  },
  actionIconBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCountText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  reviewDate: {
    color: "#475569",
    fontSize: 11,
  },
});

export default AlbumDetails;
