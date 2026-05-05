import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

// Components
import AlbumCard from "@/src/components/AlbumCard";
import Header from "@/src/components/Header";
import { AuthGuardWrapper } from "../components/AuthGuardMapper";
import apiClient from "../api/client";
import { getValidSource } from "@/helpers/helpers";

const formatReviewItem = (item: any, username: string) => {
  const content = item.media?.content;
  const isLastFm = !!content?.album;

  return {
    id: item.id,
    review_id: item.id,
    media_id: item.media_id,
    user_name: username,
    album: isLastFm ? content.album.name : content?.name,
    artist: isLastFm ? content.album.artist : content?.artist,
    cover: isLastFm
      ? content.album.image?.find((img: any) => img.size === "extralarge")?.[
          "#text"
        ] || content.album.image?.[0]?.["#text"]
      : content?.cover,
    rating: item.rating,
    content: item.content,
    likes_count: item._count?.likes || 0,
    comments_count: item._count?.comments || 0,
    isLiked: item.likes && item.likes.length > 0,
  };
};

const ProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const externalUserIdRaw = params.id;

  const externalUserId = Array.isArray(externalUserIdRaw)
    ? externalUserIdRaw[0]
    : externalUserIdRaw;

  // States Généraux
  const [activeTab, setActiveTab] = useState("Favorite Albums");
  const [userProfil, setUserProfil] = useState<any>(null);
  const [userConnected, setUserConnected] = useState<string>("");
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [favoriteReviews, setFavoriteReviews] = useState<any[]>([]);
  const [followCounts, setFollowCounts] = useState({
    followers: 0,
    following: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // States pour l'Activité
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activityOffset, setActivityOffset] = useState(0);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const isInteracting = useRef(false);

  const tabs = ["Favorite Albums", "Playlists", "Recent Activity"];

  useEffect(() => {
    loadData();
  }, [externalUserId]);

  useEffect(() => {
    if (
      activeTab === "Recent Activity" &&
      recentActivity.length === 0 &&
      userProfil?.id
    ) {
      fetchRecentActivity(0, userProfil.id);
    }
  }, [activeTab, userProfil?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) return;
      const decoded: any = jwtDecode(token);
      const currentUserId = String(decoded.id);
      setUserConnected(currentUserId);

      const targetId = externalUserId ? String(externalUserId) : currentUserId;
      const ownProfile = targetId === currentUserId;
      setIsOwnProfile(ownProfile);

      // On lance tout en parallèle pour interroger la DB à chaque chargement
      await Promise.all([
        fetchProfile(targetId),
        fetchPlaylists(targetId),
        fetchFavoriteAlbums(targetId),
        fetchFollowCounts(targetId), // Récupère les nombres réels followers/following
        !ownProfile && checkFollowStatus(targetId, currentUserId),
      ]);
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const response = await apiClient.get(`/users/public/${userId}`);
      const userData = response.data.user || response.data;
      setUserProfil(userData);
    } catch (error: any) {
      console.error("❌ Erreur Profil :", error.response?.status);
    }
  };

  const checkFollowStatus = async (
    targetUserId: string,
    currentUserId: string,
  ) => {
    try {
      const response = await apiClient.get(
        `/follows/following/${currentUserId}`,
      );
      const followingList = response.data.data || [];

      const alreadyFollowing = followingList.some(
        (item: any) => String(item.follow_user_id) === String(targetUserId),
      );

      setIsFollowing(alreadyFollowing);
    } catch (error: any) {
      console.error("❌ Erreur Statut Follow :", error.response?.status);
    }
  };

  const fetchFollowCounts = async (userId: string) => {
    try {
      const [resFollowers, resFollowing] = await Promise.all([
        apiClient.get(`/follows/followers/${userId}`),
        apiClient.get(`/follows/following/${userId}`),
      ]);

      const followersCount =
        resFollowers.data.count ?? (resFollowers.data.data?.length || 0);
      const followingCount =
        resFollowing.data.count ?? (resFollowing.data.data?.length || 0);

      setFollowCounts({
        followers: followersCount,
        following: followingCount,
      });
    } catch (error: any) {
      console.error("❌ Erreur Follow Counts :", error.response?.status);
    }
  };

  const handleFollowToggle = async () => {
    if (!userProfil?.id || !userConnected || isInteracting.current) return;
    isInteracting.current = true;

    const previousStatus = isFollowing;
    const previousFollowers = followCounts.followers;

    setIsFollowing(!previousStatus);
    setFollowCounts((prev) => ({
      ...prev,
      followers: previousStatus
        ? Math.max(0, prev.followers - 1)
        : prev.followers + 1,
    }));

    try {
      if (previousStatus) {
        await apiClient.delete(`/follows/`, {
          data: {
            user_id: userConnected,
            follow_user_id: userProfil.id,
          },
        });
      } else {
        await apiClient.post(`/follows/`, {
          user_id: userConnected,
          follow_user_id: userProfil.id,
        });
      }

      fetchFollowCounts(userProfil.id);
    } catch (error) {
      console.error("Erreur Follow/Unfollow:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le follow."); // Rollback UI en cas d'erreur
      setIsFollowing(previousStatus);
      setFollowCounts((prev) => ({ ...prev, followers: previousFollowers }));
    } finally {
      isInteracting.current = false;
    }
  };

  const fetchPlaylists = async (userId: string) => {
    try {
      const response = await apiClient.get(`/playlists/user/${userId}`);
      setPlaylists(
        response.data.playlists || response.data.data || response.data || [],
      );
    } catch (error: any) {
      console.error("❌ Erreur Playlists :", error.response?.status);
    }
  };

  const fetchFavoriteAlbums = async (userId: string) => {
    try {
      const response = await apiClient.get(`/reviews/user/${userId}/top`);
      const rawData = response.data.data || [];

      // Normalisation des données
      const normalizedData = rawData.map((item: any) => {
        const content = item.media?.content;

        // Si le format est celui de Last.fm (avec la clé .album)
        if (content?.album) {
          return {
            ...item,
            media: {
              ...item.media,
              content: {
                name: content.album.name,
                artist: content.album.artist,
                // On cherche l'image 'extralarge' dans le tableau d'images
                cover:
                  content.album.image?.find(
                    (img: any) => img.size === "extralarge",
                  )?.["#text"] || content.album.image?.[0]?.["#text"],
              },
            },
          };
        }
        // Sinon on garde le format déjà propre
        return item;
      });

      setFavoriteReviews(normalizedData);
    } catch (error: any) {
      console.error("❌ Erreur Favorite Albums :", error.response?.status);
    }
  };

  const fetchRecentActivity = async (offset: number, userId: string) => {
    if (loadingMore || (!hasMoreActivity && offset !== 0)) return;
    setLoadingMore(true);

    try {
      const response = await apiClient.get(`/reviews/user/${userId}/activity`, {
        params: { limit: 10, offset: offset },
      });

      // Utilisation de la fonction de formatage
      const newItems = (response.data.data || []).map((review: any) =>
        formatReviewItem(review, userProfil?.username || "User"),
      );

      if (offset === 0) setRecentActivity(newItems);
      else setRecentActivity((prev) => [...prev, ...newItems]);

      setHasMoreActivity(newItems.length === 10);
      setActivityOffset(offset + newItems.length);
    } catch (error: any) {
      console.error("❌ Erreur Activité :", error.response?.status);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLike = async (id: string) => {
    if (!userConnected || isInteracting.current) return;
    isInteracting.current = true;
    const itemIndex = recentActivity.findIndex((f) => f.id === id);
    if (itemIndex === -1) {
      isInteracting.current = false;
      return;
    }
    const item = recentActivity[itemIndex];
    const currentlyLiked = !!item.isLiked;
    const updatedActivity = [...recentActivity];
    updatedActivity[itemIndex] = {
      ...item,
      isLiked: !currentlyLiked,
      likes_count: currentlyLiked
        ? Math.max(0, item.likes_count - 1)
        : item.likes_count + 1,
    };
    setRecentActivity(updatedActivity);
    try {
      const response = await apiClient.post(`/reviews/likes/toggle`, {
        review_id: item.review_id,
        user_id: userConnected,
      });
      const finalActivity = [...updatedActivity];
      finalActivity[itemIndex].isLiked = response.data.isLiked;
      finalActivity[itemIndex].likes_count = response.data.likes_count;
      setRecentActivity(finalActivity);
    } catch (error) {
      setRecentActivity(recentActivity);
    } finally {
      isInteracting.current = false;
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 100 &&
      activeTab === "Recent Activity" &&
      hasMoreActivity &&
      !loadingMore &&
      userProfil?.id
    ) {
      fetchRecentActivity(activityOffset, userProfil.id);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <AuthGuardWrapper>
      <View style={styles.container}>
        <Header />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View>
            <Image
              source={{
                uri: "https://img.freepik.com/free-vector/gradient-music-notes-background_23-2151320190.jpg?w=740",
              }}
              style={styles.banner}
            />
            <View style={styles.profilePicOuter}>
              <View style={styles.profilePicInner}>
                {userProfil?.profile_picture ? (
                  <Image
                    source={{ uri: userProfil.profile_picture }}
                    style={styles.fullImage}
                  />
                ) : (
                  <Text style={styles.profileLetter}>
                    {userProfil?.username?.substring(0, 2).toUpperCase()}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.contentPadding}>
            <Text style={styles.userName}>{userProfil?.username}</Text>
            <Text style={styles.handle}>
              @{userProfil?.username?.toLowerCase()}
            </Text>

            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>{followCounts.followers}</Text>
                <Text style={styles.statLabel}> Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>{followCounts.following}</Text>
                <Text style={styles.statLabel}> Following</Text>
              </TouchableOpacity>
            </View>

            {isOwnProfile ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push("/settings")}
              >
                <Ionicons name="settings-outline" size={18} color="#fff" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.editButton,
                  isFollowing ? styles.followingButton : styles.followButton,
                ]}
                onPress={handleFollowToggle}
              >
                <Ionicons
                  name={
                    isFollowing
                      ? "checkmark-circle-outline"
                      : "person-add-outline"
                  }
                  size={18}
                  color="#fff"
                />
                <Text style={styles.editButtonText}>
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.bio}>
              {userProfil?.biography || "No biography yet."}
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tabItem,
                    activeTab === tab && styles.tabItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.tabTextActive,
                    ]}
                  >
                    {tab === "Playlists"
                      ? `Playlists (${playlists.length})`
                      : tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.sectionPadding}>
            {activeTab === "Favorite Albums" && (
              <View style={styles.albumGrid}>
                {favoriteReviews.map((item) => (
                  <View key={item.id} style={styles.cardWrapper}>
                    <AlbumCard
                      id={item.media_id}
                      title={item.media?.content?.name}
                      artist={item.media?.content?.artist}
                      rating={item.rating.toString()}
                      cover={item.media?.content?.cover}
                    />
                  </View>
                ))}
              </View>
            )}

            {activeTab === "Playlists" && (
              <View style={styles.playlistList}>
                {playlists.map((playlist) => (
                  <TouchableOpacity
                    key={playlist.id}
                    style={styles.playlistItem}
                    onPress={() =>
                      router.push({
                        pathname: "/playlistdetails",
                        params: { id: playlist.id, title: playlist.name },
                      })
                    }
                  >
                    <View style={styles.playlistIconBox}>
                      {playlist.image_url ? (
                        <Image
                          source={{
                            uri: playlist.image_url.startsWith("data")
                              ? playlist.image_url
                              : `data:image/jpeg;base64,${playlist.image_url}`,
                          }}
                          style={styles.playlistImage}
                        />
                      ) : (
                        <Ionicons
                          name="musical-notes-outline"
                          size={24}
                          color="#4A90E2"
                        />
                      )}
                    </View>
                    <Text style={styles.playlistName}>{playlist.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === "Recent Activity" && (
              <View style={styles.postsList}>
                {recentActivity.map((item) => (
                  <View key={item.id} style={styles.card}>
                    {/* Header : User + Action */}
                    <Text style={styles.cardUserName}>
                      {item.user_name}{" "}
                      <Text style={styles.actionText}>a évalué un album</Text>
                    </Text>

                    {/* Aperçu Album (Cliquable) */}
                    <TouchableOpacity
                      style={styles.activityAlbumBox}
                      onPress={() => {
                        console.log(
                          "DEBUG - Navigation vers Album, ID:",
                          item.media_id,
                        );
                        if (!item.media_id) {
                          console.error(
                            "ERREUR : Aucun media_id trouvé dans cet item !",
                            item,
                          );
                          return;
                        }
                        router.push({
                          pathname: "/albumdetails",
                          params: {
                            id: item.media_id,
                            album: item.album, 
                            artist: item.artist, 
                            cover: item.cover
                          },
                        });
                      }}
                    >
                      <Image
                        source={{ uri: item.cover }}
                        style={styles.activityAlbumImage}
                      />
                      <View style={styles.activityAlbumInfo}>
                        <Text
                          style={styles.activityAlbumTitle}
                          numberOfLines={1}
                        >
                          {item.album}
                        </Text>
                        <Text style={styles.activityAlbumArtist}>
                          {item.artist}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Review Content */}
                    <Text style={styles.postContent}>{item.content}</Text>

                    {/* Footer : Like */}
                    <TouchableOpacity
                      onPress={() => handleLike(item.id)}
                      style={styles.likeContainer}
                    >
                      <Ionicons
                        name={item.isLiked ? "heart" : "heart-outline"}
                        size={20}
                        color={item.isLiked ? "#ec4899" : "#9ca3af"}
                      />
                      <Text style={styles.likesCount}>{item.likes_count}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </AuthGuardWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1e" },
  loaderContainer: {
    flex: 1,
    backgroundColor: "#0f0f1e",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: { paddingBottom: 100 },
  banner: { width: "100%", height: 160 },
  profilePicOuter: {
    marginTop: -55,
    marginLeft: 20,
    borderWidth: 4,
    borderColor: "#0f0f1e",
    borderRadius: 60,
    width: 110,
    height: 110,
    overflow: "hidden",
    backgroundColor: "#0f0f1e",
  },
  activityAlbumBox: {
    flexDirection: "row",
    backgroundColor: "#2a2a40",
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  activityAlbumImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  activityAlbumInfo: {
    marginLeft: 12,
    flex: 1,
  },
  activityAlbumTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  activityAlbumArtist: {
    color: "#9ca3af",
    fontSize: 12,
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  likesCount: {
    color: "#9ca3af",
    marginLeft: 6,
    fontSize: 12,
  },
  profilePicInner: {
    flex: 1,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: { width: "100%", height: "100%" },
  profileLetter: { color: "white", fontSize: 36, fontWeight: "bold" },
  contentPadding: { paddingHorizontal: 20, paddingTop: 10 },
  userName: { color: "white", fontSize: 26, fontWeight: "800" },
  handle: { color: "#888", fontSize: 16, marginBottom: 10 },
  statsRow: { flexDirection: "row", marginBottom: 15, gap: 20 },
  statItem: { flexDirection: "row", alignItems: "baseline" },
  statNumber: { color: "white", fontSize: 16, fontWeight: "bold" },
  statLabel: { color: "#888", fontSize: 14 },
  editButton: {
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 15,
  },
  followButton: { backgroundColor: "#4A90E2", borderColor: "#4A90E2" },
  followingButton: { backgroundColor: "transparent", borderColor: "#2a2a40" },
  editButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 15,
  },
  bio: { color: "#ccc", lineHeight: 22, fontSize: 15, marginBottom: 10 },
  tabContainer: {
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c2e",
  },
  tabItem: { paddingVertical: 15, paddingHorizontal: 15 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: "#4A90E2" },
  tabText: { color: "#888", fontSize: 15, fontWeight: "600" },
  tabTextActive: { color: "white" },
  sectionPadding: { paddingHorizontal: 20, paddingTop: 20 },
  albumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: { width: "48%", marginBottom: 15 },
  playlistList: { gap: 12 },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c2e",
    padding: 12,
    borderRadius: 12,
    gap: 15,
  },
  playlistIconBox: {
    width: 55,
    height: 55,
    backgroundColor: "#2a2a40",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  playlistImage: { width: "100%", height: "100%" },
  playlistName: { color: "white", fontSize: 16, fontWeight: "600" },
  postsList: { gap: 16 },
  card: { backgroundColor: "#1f2937", borderRadius: 16, padding: 16 },
  cardUserName: { color: "white", fontWeight: "600" },
  actionText: { fontWeight: "normal", color: "#9ca3af" },
  postContent: { color: "#d1d5db", fontSize: 14, marginVertical: 8 },
});

export default ProfileScreen;
