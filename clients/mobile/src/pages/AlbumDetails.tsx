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
import { useLocalSearchParams, useRouter } from "expo-router";
import apiClient from "../api/client";

const { width } = Dimensions.get("window");

const PLAYLISTS = [
  { id: "1", title: "Favoris du moment" },
  { id: "2", title: "Sport & Motivation" },
];

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

  useEffect(() => {
    fetchAlbumDetails();
  }, [id, mbid, artist, album]);

  useEffect(() => {
    if (activeTab === "Similar" && similarAlbums.length === 0 && albumData) {
      fetchSimilar();
    }
  }, [activeTab]);

  const fetchAlbumDetails = async () => {
    try {
      setLoading(true);
      let finalAlbumData = null;

      if (id) {
        const res = await apiClient.get(`/medias/${id}`);
        if (res.data.media && res.data.media.content) {
          finalAlbumData = res.data.media.content.album;
        }
      }

      if (!finalAlbumData && artist && album) {
        const res = await apiClient.get("/api/albums/info", {
          params: { artist, album, mbid },
        });
        finalAlbumData = res.data.albumInfo?.album;
      }

      setAlbumData(finalAlbumData);
    } catch (error) {
      console.error("Détails fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilar = async () => {
    try {
      setLoadingSimilar(true);
      const res = await apiClient.get("/api/albums/similar", {
        params: {
          artist: albumData.artist,
          album: albumData.name,
        },
      });
      // On s'adapte à la structure renvoyée par ton nouveau controller/service
      setSimilarAlbums(res.data.similarAlbums || []);
    } catch (err) {
      console.error("Erreur similar albums:", err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const getCoverImage = (item: any) => {
    if (!item) return "https://via.placeholder.com/300";
    if (Array.isArray(item.image)) {
      const extralarge = item.image.find((i: any) => i.size === "extralarge");
      if (extralarge && extralarge["#text"]) return extralarge["#text"];
      const lastImg = item.image[item.image.length - 1];
      return lastImg["#text"] || "https://via.placeholder.com/300";
    }
    if (typeof item.image === "string") return item.image;
    return "https://via.placeholder.com/300";
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  if (!albumData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "white" }}>Album introuvable.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.reviewMiniBtn}
        >
          <Text style={styles.reviewMiniBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cover */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getCoverImage(albumData) }}
            style={styles.coverImage}
          />
        </View>

        <View style={styles.paddingContent}>
          {/* Tags Scrollables */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeScrollContent}
            style={styles.badgeRow}
          >
            {albumData.tags?.tag?.map((t: any, i: number) => (
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

          <Text style={styles.albumTitle}>{albumData.name}</Text>
          <Text style={styles.artistName}>{albumData.artist}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="people" size={20} color="#ec4899" />
            <Text style={styles.ratingValue}>
              {albumData.listeners
                ? parseInt(albumData.listeners) > 1000
                  ? (parseInt(albumData.listeners) / 1000).toFixed(0) + "k"
                  : albumData.listeners
                : "0"}
            </Text>
            <Text style={styles.ratingCount}>auditeurs sur Last.fm</Text>
          </View>

          {/* Actions */}
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

            {showPlaylistSelector && (
              <View style={styles.playlistSelector}>
                {PLAYLISTS.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.playlistItem}
                    onPress={() => Alert.alert("Ajouté", `Ajouté à ${p.title}`)}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#ec4899"
                    />
                    <Text style={styles.playlistItemText}>{p.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.aboutText}>
              {albumData.wiki?.summary
                ? albumData.wiki.summary
                    .replace(/<[^>]*>?/gm, "")
                    .split(" <a href")[0]
                : "Aucune biographie disponible pour cet album."}
            </Text>
          </View>
        </View>

        {/* Onglets */}
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

        {/* Contenu des Onglets */}
        <View style={styles.tabContent}>
          {activeTab === "Reviews" ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={40} color="#2d2d3f" />
              <Text style={styles.emptyText}>
                Aucun avis pour le moment. Soyez le premier !
              </Text>
              <TouchableOpacity
                style={styles.reviewMiniBtn}
                onPress={() =>
                  router.push({
                    pathname: "/writereview",
                    params: { title: albumData.name, artist: albumData.artist },
                  })
                }
              >
                <Text style={styles.reviewMiniBtnText}>Écrire un avis</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.similarGrid}>
              {loadingSimilar ? (
                <ActivityIndicator color="#ec4899" style={{ marginTop: 20 }} />
              ) : similarAlbums.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {similarAlbums.map((item: any, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.similarCard}
                      onPress={() =>
                        router.push({
                          pathname: "/albumdetails",
                          params: {
                            artist: item.artist.name,
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
                      <Text numberOfLines={1} style={styles.similarArtist}>
                        {typeof item.artist === "string"
                          ? item.artist
                          : item.artist?.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>
                  Aucun album similaire trouvé.
                </Text>
              )}
            </View>
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
  reviewCard: { backgroundColor: "#1a1d29", padding: 15, borderRadius: 16 },
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
});

export default AlbumDetails;
