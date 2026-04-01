import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/src/components/Header";
import { StatusBar } from "expo-status-bar";
import AlbumCard from "@/src/components/AlbumCard";
import apiClient from "../api/client";

const SORT_OPTIONS = [
  { label: "Titre A-Z", value: "az" },
  { label: "Mieux notés", value: "rated" },
  { label: "Plus récents", value: "recent" },
];

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<"artist" | "album">("artist");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    Keyboard.dismiss();

    try {
      let url = "";
      if (searchMode === "artist") {
        url = `/api/artists/info/top-albums?artist=${encodeURIComponent(searchQuery)}`;
      } else {
        url = `/api/search?query=${encodeURIComponent(searchQuery)}`;
      }

      const response = await apiClient.get(url);
      let rawData = [];
      if (searchMode === "artist") {
        rawData = response.data?.topAlbums?.topalbums?.album || [];
      } else {
        rawData =
          response.data?.searchResults?.results?.albummatches?.album || [];
      }

      if (Array.isArray(rawData)) {
        const fetchedAlbums = rawData.map((a: any) => {
          const artistName =
            typeof a.artist === "string"
              ? a.artist
              : a.artist?.name || "Inconnu";

          const apiId = a.mbid || `album:${artistName}:${a.name}`;

          return {
            id: apiId,
            album: a.name,
            artist: artistName,
            cover:
              a.image?.find((img: any) => img.size === "extralarge")?.[
                "#text"
              ] || a.image?.[2]?.["#text"],
            rating: 0,
            mbid: a.mbid || null,
          };
        });

        try {
          const syncResponse = await apiClient.post("/medias/sync-search", {
            albums: fetchedAlbums.map((album) => ({
              api_id: album.id,
              name: album.album,
              artist: album.artist,
              cover: album.cover,
              mbid: album.mbid,
            })),
          });

          const syncedAlbums = syncResponse.data.medias || [];

          if (syncedAlbums.length > 0) {
            const mappedAlbums = syncedAlbums.map((syncedAlbum: any) => ({
              id: syncedAlbum.api_id || syncedAlbum.id,
              album: syncedAlbum.name || syncedAlbum.album,
              artist: syncedAlbum.artist,
              cover: syncedAlbum.cover,
              rating: syncedAlbum.rating || 0,
              mbid: syncedAlbum.mbid || null,
            }));

            const uniqueAlbumsMap = new Map<string, any>();

            mappedAlbums.forEach((album: any) => {
              if (!uniqueAlbumsMap.has(album.id)) {
                uniqueAlbumsMap.set(album.id, album);
              }
            });

            const finalAlbums = Array.from(uniqueAlbumsMap.values());

            setAlbums(finalAlbums);
            applySort(finalAlbums, selectedSort.value);
          } else {
            setAlbums(fetchedAlbums);
            applySort(fetchedAlbums, selectedSort.value);
          }
        } catch (err: any) {
          console.warn(
            "⚠️ Sync échoué, affichage des résultats sans notes:",
            err.response?.status,
            err.response?.data?.message || err.message,
          );

          setAlbums(fetchedAlbums);
          applySort(fetchedAlbums, selectedSort.value);
        }
      }
    } catch (error: any) {
      console.error("❌ Erreur recherche:", error.message);
      Alert.alert("Erreur", "Impossible de récupérer les résultats.");
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const applySort = (data: any[], sortValue: string) => {
    let sorted = [...data];
    if (sortValue === "az") {
      sorted.sort((a, b) => (a.album || "").localeCompare(b.album || ""));
    } else if (sortValue === "rated") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    setAlbums(sorted);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1C1C28" translucent={false} />
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Explorer</Text>
          <Text style={styles.subtitle}>
            Trouvez un artiste ou un album spécifique
          </Text>
        </View>

        <View style={styles.filterCard}>
          {/* Sélecteur de Mode (Tabs) */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, searchMode === "artist" && styles.activeTab]}
              onPress={() => setSearchMode("artist")}
            >
              <Text
                style={[
                  styles.tabText,
                  searchMode === "artist" && styles.activeTabText,
                ]}
              >
                Artiste
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, searchMode === "album" && styles.activeTab]}
              onPress={() => setSearchMode("album")}
            >
              <Text
                style={[
                  styles.tabText,
                  searchMode === "album" && styles.activeTabText,
                ]}
              >
                Album
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Rechercher</Text>
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#888"
              style={{ marginRight: 10 }}
            />
            <TextInput
              placeholder={
                searchMode === "artist"
                  ? "Ex: Linkin Park, Jul..."
                  : "Ex: Meteora, Discovery..."
              }
              placeholderTextColor="#888"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>

          <Text style={styles.label}>Trier par</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setIsSortOpen(!isSortOpen)}
          >
            <Text style={styles.dropdownText}>{selectedSort.label}</Text>
            <Ionicons
              name={isSortOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#888"
            />
          </TouchableOpacity>

          {isSortOpen && (
            <View style={styles.dropdownMenu}>
              {SORT_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.menuItem}
                  onPress={() => {
                    setSelectedSort(item);
                    applySort(albums, item.value);
                    setIsSortOpen(false);
                  }}
                >
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  {selectedSort.value === item.value && (
                    <Ionicons name="checkmark" size={18} color="#4f46e5" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons
                  name="search"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.searchButtonText}>Lancer la recherche</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.resultsText}>
          {albums.length > 0 ? `${albums.length} résultats` : "Aucun résultat"}
        </Text>

        <View style={styles.grid}>
          {albums.map((item) => (
            <AlbumCard
              key={item.id}
              id={item.id}
              title={item.album}
              artist={item.artist}
              cover={item.cover}
              rating={String(item.rating || 0)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1C1C28" },
  scroll: { padding: 20, paddingTop: 10 },
  headerTextContainer: { marginBottom: 25 },
  title: { color: "white", fontSize: 32, fontWeight: "bold" },
  subtitle: { color: "#888", fontSize: 16, marginTop: 5 },
  filterCard: {
    backgroundColor: "#252532",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2a2a35",
  },

  // Styles pour les Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1a1a24",
    borderRadius: 10,
    padding: 4,
    marginBottom: 15,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#4f46e5" },
  tabText: { color: "#888", fontWeight: "bold" },
  activeTabText: { color: "white" },

  label: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A38",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: "#333",
  },
  searchInput: { color: "white", flex: 1 },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2A2A38",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 10,
  },
  dropdownText: { color: "white" },
  dropdownMenu: {
    backgroundColor: "#2A2A38",
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  menuItemText: { color: "#ccc", fontSize: 14 },
  searchButton: {
    flexDirection: "row",
    backgroundColor: "#4f46e5",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  searchButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  resultsText: { color: "#888", marginVertical: 20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default Home;
