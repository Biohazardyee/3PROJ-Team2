import React, { useState, useEffect, useCallback } from "react";
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
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

import Header from "@/src/components/Header";
import ReportButton from "../components/reports/ReportButton";
import StatCard from "@/src/components/StatCard";
import { AuthReviewButton } from "../components/AuthReviewButton";
import apiClient from "../api/client";
import { getValidSource } from "@/helpers/helpers";

const { width } = Dimensions.get("window");

type TabType = "Reviews" | "Similar";

const AlbumDetails = () => {
  const { id, mbid, artist, album, cover } = useLocalSearchParams();
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
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [userReview, setUserReview] = useState<any | null>(null);
  const [deletingReview, setDeletingReview] = useState(false);
  const [reportTarget, setReportTarget] = useState<any | null>(null);
  const [reportReason, setReportReason] = useState("");

  const mediaId = id || albumData?.id || albumData?.mediaId;

  useEffect(() => {
    const initUser = async () => {
      try {
        const token: string | null =
          await SecureStore.getItemAsync("userToken");
        if (token) {
          const decoded: any = jwtDecode(token);
          setCurrentUserId(decoded.id);
        }
      } catch (err) {
        console.error("Erreur décodage token:", err);
      }
    };
    initUser();
    fetchAlbumDetails();
  }, [id, mbid]);


  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (currentUserId && albumData?.db_id) {
        try {
          const res = await apiClient.get(
            `/medias/status/${currentUserId}/${albumData.db_id}`,
          );
          if (res.data.mediaStatus) {
            setUserStatus(res.data.mediaStatus.status);
          }
        } catch (err) {
          setUserStatus(null);
        }
      }
    };
    fetchCurrentStatus();
  }, [currentUserId, albumData?.db_id]);

  useFocusEffect(
    useCallback(() => {
      fetchReviews();

      if (activeTab === "Similar" && similarAlbums.length === 0) {
        fetchSimilar();
      }
    }, [activeTab, artist, album, mediaId, currentUserId]),
  );

  const fetchUserPlaylists = async () => {
    if (!currentUserId || !mediaId) {
      return;
    }

    try {
      setLoadingPlaylists(true);
      const res = await apiClient.get(`/playlists/user/${currentUserId}`);
      const playlists = res.data.playlists || [];
      setUserPlaylists(playlists);

      const alreadyIn = playlists
        .filter((pl: any) => {
          return pl.items?.some((item: any) => {
            const match: boolean = String(item.media_id) === String(mediaId);
            if (match) return match;
          });
        })
        .map((pl: any) => pl.id);

      setSelectedPlaylists(alreadyIn);
    } catch (err) {
      console.error("Erreur chargement playlists:", err);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  useEffect(() => {
    if (currentUserId && mediaId) {
      fetchUserPlaylists();
    }
  }, [currentUserId, mediaId]);

  useEffect(() => {
    if (showPlaylistSelector) fetchUserPlaylists();
  }, [showPlaylistSelector]);

  const handleAddToPlaylists = async () => {
    if (!mediaId) return;

    try {
      const res = await apiClient.get(`/playlists/user/${currentUserId}`);
      const initialPlaylists = res.data.playlists || [];
      const initiallySelected = initialPlaylists
        .filter((pl: any) =>
          pl.items?.some(
            (item: any): boolean => String(item.media_id) === String(mediaId),
          ),
        )
        .map((pl: any) => pl.id);

      const toAdd: string[] = selectedPlaylists.filter(
        (id: any): boolean => !initiallySelected.includes(id),
      );
      const toRemove = initiallySelected.filter(
        (id: any): boolean => !selectedPlaylists.includes(id),
      );

      const promises = [
        ...toAdd.map((id: any) =>
          apiClient.post("/playlist-items", {
            playlist_id: id,
            media_id: mediaId,
          }),
        ),
        ...toRemove.map((id: any) =>
          apiClient.delete(`/playlist-items/remove`, {
            data: { playlist_id: id, media_id: mediaId },
          }),
        ),
      ];

      await Promise.all(promises);

      Alert.alert("Succès", "Vos playlists ont été mises à jour.");
      setShowPlaylistSelector(false);
      fetchUserPlaylists(); 
    } catch (err: any) {
      Alert.alert("Erreur", "Impossible de mettre à jour les playlists.");
    }
  };

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
        } catch (err) {}
      }

      if (!finalData && artist && album) {
        const res = await apiClient.get("/api/albums/info", {
          params: { artist, album, mbid },
        });
        finalData = res.data.albumInfo;

        const cleanArtist: string = String(artist).trim();
        const cleanAlbum: string = String(album).trim();
        const fallbackId = `album:${cleanArtist}:${cleanAlbum}`;

        try {
          const syncRes = await apiClient.post("/medias/sync-search", {
            albums: [
              {
                api_id: mbid || fallbackId,
                name: cleanAlbum,
                artist: cleanArtist,
                cover: cover,
                mbid: mbid || null,
              },
            ],
          });

          if (syncRes.data.medias?.length > 0) {
            finalData.db_id = syncRes.data.medias[0].id;
          }
        } catch (syncErr) {
          console.warn("Échec sync en détails", syncErr);
        }
      }
      setAlbumData(finalData);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les détails.");
    } finally {
      setLoading(false);
    }
  };

  const mediaIdInDB = albumData?.db_id || (id?.includes("-") ? id : null);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);

      const res = await apiClient.get("/reviews");

      const allReviews = res.data.reviews || [];

      const targetArtist: string = String(artist || "")
        .toLowerCase()
        .trim();

      const targetAlbum: string = String(album || "")
        .toLowerCase()
        .trim();

      const filtered = allReviews.filter((rev: any): boolean => {
        const content = rev.media?.content;

        if (!content) return false;

        const revArtist: string = String(
          content.album?.artist || content.artist || "",
        )
          .toLowerCase()
          .trim();

        const revAlbum: string = String(
          content.album?.name || content.name || "",
        )
          .toLowerCase()
          .trim();

        return revArtist === targetArtist && revAlbum === targetAlbum;
      });

      setReviews(filtered);

      const ownReview = filtered.find(
        (rev: any): boolean => rev.user_id === currentUserId,
      );

      setUserReview(ownReview || null);
    } catch (err) {
      console.error("Erreur avis:", err);
    } finally {
      setLoadingReviews(false);
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
      console.error("Erreur similaires:", err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    Alert.alert(
      "Supprimer l'avis",
      "Voulez-vous vraiment supprimer votre avis ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingReview(true);

              await apiClient.delete(`/reviews/${reviewId}`);

              setReviews((prev) => prev.filter((rev) => rev.id !== reviewId));

              setUserReview(null);

              Alert.alert("Succès", "Votre avis a été supprimé.");
            } catch (error) {
              console.error("Erreur suppression review:", error);

              Alert.alert("Erreur", "Impossible de supprimer l'avis.");
            } finally {
              setDeletingReview(false);
            }
          },
        },
      ],
    );
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!currentUserId) return Alert.alert("Connexion requise", "...");

    if (!mediaIdInDB) {
      return Alert.alert(
        "Patience",
        "Le média est en cours de synchronisation avec la base de données.",
      );
    }

    const previousStatus: string | null = userStatus;
    const isDeselecting: boolean = userStatus === newStatus;

    try {
      setUserStatus(isDeselecting ? null : newStatus);
      if (isDeselecting) {
        await apiClient.delete(
          `/medias/status/${currentUserId}/${mediaIdInDB}`,
        );
      } else {
        await apiClient.post(`/medias/status`, {
          user_id: currentUserId,
          media_id: mediaIdInDB,
          status: newStatus,
        });
      }
    } catch (error: any) {
      setUserStatus(previousStatus);
      console.error("Erreur status:", error.response?.data);
      Alert.alert("Erreur", "La mise à jour a échoué.");
    }
  };

  const handleToggleLike = async (reviewId: string) => {
    if (!currentUserId)
      return Alert.alert(
        "Connexion requise",
        "L'action est réservée aux membres.",
      );

    const updatedReviews: any[] = reviews.map((rev) => {
      if (rev.id === reviewId) {
        const isLiked = rev.likes?.some(
          (l: any): boolean => l.user_id === currentUserId,
        );

        return {
          ...rev,
          likes: isLiked
            ? rev.likes.filter((l: any): boolean => l.user_id !== currentUserId)
            : [...(rev.likes || []), { user_id: currentUserId }],
        };
      }
      return rev;
    });
    setReviews(updatedReviews);

    try {
      await apiClient.post(`/reviews/likes/toggle`, {
        review_id: reviewId,
        user_id: currentUserId,
      });
    } catch (error) {
      fetchReviews();
    }
  };

  const handleOpenReport = (review: any) => {
    setReportTarget(review);
    setReportReason("");
  };

  const averageRating: number =
    reviews.length > 0
      ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
      : 0;

  if (loading || !albumData)
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cover Section */}
        <View style={styles.imageContainer}>
          <Image source={getValidSource(cover)} style={styles.coverImage} />
        </View>

        <View style={styles.paddingContent}>
          {/* Tags */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgeRow}
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

          <Text style={styles.albumTitle}>
            {albumData.album?.name || albumData.name}
          </Text>
          <Text style={styles.artistName}>
            {albumData.album?.artist || albumData.artist}
          </Text>

          {/* Rating */}
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

          {/* Actions Grid */}
          <View style={styles.actionButtons}>
            <View style={styles.grid}>
              <StatCard
                title="Écouté"
                icon="check-circle-outline"
                color="#00ffa3"
                checked={userStatus === "listened"}
                onPress={() => handleStatusChange("listened")}
              />
              <StatCard
                title="Plus tard"
                icon="playlist-music"
                color="#4747ff"
                checked={userStatus === "later"}
                onPress={() => handleStatusChange("later")}
              />
              <StatCard
                title="Favori"
                icon="star"
                color="#fbbf24"
                checked={userStatus === "favorite"}
                onPress={() => handleStatusChange("favorite")}
              />
              <StatCard
                title="Dislike"
                icon="close-circle-outline"
                color="#f43f5e"
                checked={userStatus === "disliked"}
                onPress={() => handleStatusChange("disliked")}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowPlaylistSelector(true)}
            >
              <Text style={styles.primaryButtonText}>
                Ajouter à une playlist
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bio Section */}
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

        {/* Tabs Menu */}
        <View style={styles.tabsContainer}>
          {(["Reviews", "Similar"] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === "Reviews" ? "Avis" : "Similaires"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "Reviews" ? (
            <View style={{ paddingBottom: 20 }}>
              <View style={{ alignItems: "center", marginVertical: 15 }}>
                <AuthReviewButton
                  isLoggedIn={!!currentUserId}
                  onPress={() => {
                    if (userReview) {
                      return Alert.alert(
                        "Avis déjà publié",
                        "Vous avez déjà publié un avis pour cet album.",
                      );
                    }

                    if (!mediaId)
                      return Alert.alert(
                        "Patience",
                        "L'album se synchronise...",
                      );

                    router.push({
                      pathname: "/writereview",
                      params: {
                        id: mediaId,
                        title: albumData.album?.name || albumData.name,
                        artist: albumData.album?.artist || albumData.artist,
                        cover: cover,
                      },
                    });
                  }}
                />
              </View>

              {loadingReviews ? (
                <ActivityIndicator color="#ec4899" />
              ) : reviews.length > 0 ? (
                reviews.map((rev) => {
                  return (
                    <View key={rev.id} style={styles.reviewCard}>
                      {/* HEADER */}
                      <View style={styles.reviewHeader}>
                        <View style={styles.userInfo}>
                          <Ionicons
                            name="person-circle"
                            size={24}
                            color="#94a3b8"
                          />

                          <TouchableOpacity
                            disabled={!rev.user?.id}
                            onPress={() => {
                              const userId = rev.user_id;

                              if (!userId) return;

                              router.push({
                                pathname: "/profile",
                                params: { id: userId },
                              });
                            }}
                          >
                            <Text style={styles.reviewerName}>
                              {rev.user?.username || "Anonyme"}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* STARS */}
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

                      {/* CONTENT */}
                      <Text style={styles.reviewTitleText}>{rev.title}</Text>
                      <Text style={styles.reviewContentText}>
                        {rev.content}
                      </Text>

                      {/* FOOTER */}
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
                              {rev._count?.comments ?? 0}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {rev.user_id === currentUserId && (
                          <View style={styles.ownerActions}>
                            <TouchableOpacity
                              style={styles.ownerActionBtn}
                              onPress={() =>
                                router.push({
                                  pathname: "/writereview",
                                  params: {
                                    reviewId: rev.id,
                                    editMode: "true",
                                    id: mediaId,
                                    title:
                                      albumData.album?.name || albumData.name,
                                    artist:
                                      albumData.album?.artist ||
                                      albumData.artist,
                                    cover: cover,
                                  },
                                })
                              }
                            >
                              <Ionicons
                                name="create-outline"
                                size={18}
                                color="#94a3b8"
                              />
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.ownerActionBtn}
                              disabled={deletingReview}
                              onPress={() => handleDeleteReview(rev.id)}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color="#f43f5e"
                              />
                            </TouchableOpacity>
                          </View>
                        )}

                        {rev.user_id !== currentUserId && (
                          <ReportButton
                            userId={currentUserId}
                            targetId={rev.id}
                            type="review"
                          />
                        )}

                        <Text style={styles.reviewDate}>
                          {new Date(rev.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>
                  Soyez le premier à donner votre avis !
                </Text>
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
                          cover: item.image?.[3]?.["#text"] || item.cover,
                        },
                      })
                    }
                  >
                    <Image
                      source={getValidSource(
                        item.image?.[2]?.["#text"] || item.cover,
                      )}
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

      {/* MODAL PLAYLIST */}
      <Modal
        visible={showPlaylistSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPlaylistSelector(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPlaylistSelector(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter à une playlist</Text>
              <TouchableOpacity onPress={() => setShowPlaylistSelector(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {loadingPlaylists ? (
              <ActivityIndicator color="#ec4899" style={{ margin: 20 }} />
            ) : (
              <ScrollView style={styles.modalScroll}>
                {userPlaylists.map((pl) => {
                  const isSelected = selectedPlaylists.includes(pl.id);
                  return (
                    <TouchableOpacity
                      key={pl.id}
                      style={[
                        styles.playlistItem,
                        isSelected && styles.playlistItemActive,
                      ]}
                      onPress={() =>
                        setSelectedPlaylists((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== pl.id)
                            : [...prev, pl.id],
                        )
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxActive,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.playlistItemText,
                          isSelected && styles.whiteText,
                        ]}
                      >
                        {pl.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={styles.createPlaylistBtn}
                  onPress={() => {
                    setShowPlaylistSelector(false);
                    router.push("/createplaylist");
                  }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#00ffa3"
                  />
                  <Text style={styles.createPlaylistText}>
                    Créer une playlist
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {selectedPlaylists.length > 0 && (
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleAddToPlaylists}
              >
                <Text style={styles.confirmBtnText}>
                  Confirmer ({selectedPlaylists.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f111a" },
  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 60 },
  imageContainer: { padding: 20, alignItems: "center" },
  coverImage: { width: width - 40, height: width - 40, borderRadius: 20 },
  paddingContent: { paddingHorizontal: 20 },
  badgeRow: { marginTop: 15, flexDirection: "row" },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2d2d3f",
    marginRight: 8,
  },
  badgeText: { color: "white", fontWeight: "bold", fontSize: 11 },
  albumTitle: {
    color: "white",
    fontSize: 26,
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
  starsRow: { flexDirection: "row", gap: 2 },
  ratingValue: { color: "white", fontSize: 22, fontWeight: "bold" },
  ratingCount: { color: "#64748b", fontSize: 14 },
  actionButtons: { marginTop: 25, gap: 12 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#ec4899",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  aboutSection: { marginTop: 30 },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  aboutText: { color: "#94a3b8", fontSize: 15, lineHeight: 22 },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#1a1d29",
    margin: 20,
    padding: 5,
    borderRadius: 12,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#2d2d3f" },
  tabText: { color: "#64748b", fontWeight: "bold" },
  activeTabText: { color: "white" },
  tabContent: { paddingHorizontal: 20 },
  emptyText: { color: "#64748b", textAlign: "center", marginTop: 20 },
  reviewCard: {
    backgroundColor: "#1a1d29",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2d2d3f",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  reviewerName: { color: "#ec4899", fontWeight: "bold" },
  reviewTitleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  reviewContentText: { color: "#94a3b8", fontSize: 14 },
  reviewFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2d2d3f",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reviewActionsLeft: { flexDirection: "row", gap: 20 },
  actionIconBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionCountText: { color: "#94a3b8" },
  reviewDate: { color: "#475569", fontSize: 11 },
  similarGrid: { paddingVertical: 10 },
  similarCard: { width: 130, marginRight: 15 },
  similarCover: {
    width: 130,
    height: 130,
    borderRadius: 12,
    backgroundColor: "#1e1e2d",
  },
  similarTitle: {
    color: "white",
    fontWeight: "bold",
    marginTop: 8,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1d29",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  modalScroll: { marginBottom: 10 },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#242838",
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  playlistItemActive: {
    backgroundColor: "rgba(236, 72, 153, 0.1)",
    borderColor: "#ec4899",
    borderWidth: 1,
  },
  playlistItemText: { color: "#94a3b8", fontSize: 15 },
  whiteText: { color: "white", fontWeight: "600" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: "#ec4899", borderColor: "#ec4899" },
  confirmBtn: {
    backgroundColor: "#ec4899",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  confirmBtnText: { color: "white", fontWeight: "bold" },
  createPlaylistBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 10,
    marginTop: 5,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 12,
    justifyContent: "center",
  },
  createPlaylistText: { color: "#00ffa3", fontWeight: "600" },
  ownerActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  ownerActionBtn: {
    padding: 4,
  },
});

export default AlbumDetails;
