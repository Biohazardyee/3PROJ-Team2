import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/src/components/Header";
import PlaylistCard from "@/src/components/PlaylistCard";
import { useRouter } from "expo-router";
import { AuthGuardWrapper } from "../components/AuthGuardMapper";
import apiClient from "../api/client";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

type Playlist = {
  id: string;
  title: string;
  count: number;
  image: string;
  isCreate?: boolean;
};

const { width } = Dimensions.get("window");

const Library: React.FC = () => {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Récupération des playlists depuis l'API
  const fetchUserPlaylists = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const decoded: any = jwtDecode(token);
      const userId = decoded.id;

      // Utilisation de l'apiClient pour récupérer les données persistantes
      const response = await apiClient.get(`/playlists/user/${userId}`);

      if (response.data && response.data.playlists) {
        const formattedPlaylists: Playlist[] = response.data.playlists.map(
          (p: any) => ({
            id: p.id,
            title: p.name,
            // On utilise le count renvoyé par le backend
            count: p._count?.items ?? 0,
            image: p.image_url
              ? p.image_url
              : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500",
          }),
        );
        setPlaylists(formattedPlaylists);
      }
    } catch (error) {
      console.error("Library Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir à chaque fois que l'écran revient au premier plan
  useFocusEffect(
    useCallback(() => {
      fetchUserPlaylists();
    }, []),
  );

  // 2. Supprimer une playlist (Côté Serveur)
  const deletePlaylist = async (id: string) => {
    try {
      await apiClient.delete(`/playlists/${id}`);
      // Mise à jour de l'interface sans recharger
      setPlaylists((current) => current.filter((p) => p.id !== id));
      Alert.alert("Succès", "Playlist supprimée.");
    } catch (error) {
      console.error("Erreur suppression:", error);
      Alert.alert("Erreur", "La suppression a échoué.");
    }
  };

  // 3. Menu d'options (Modifier / Supprimer)
  const showOptions = (item: Playlist) => {
    Alert.alert(item.title, "Options de la playlist", [
      {
        text: "Modifier",
        onPress: () =>
          router.push({
            pathname: "/createPlaylist",
            params: {
              id: item.id,
              title: item.title,
              isEditing: "true",
            },
          }),
      },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () =>
          Alert.alert("Supprimer", "Confirmer la suppression ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Supprimer", onPress: () => deletePlaylist(item.id) },
          ]),
      },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  // Préparation des données pour la grille (Playlists + Bouton Créer)
  const dataWithCreate = [
    ...playlists,
    { id: "create-button-id", isCreate: true } as Playlist,
  ];

  const renderItem = ({ item }: { item: Playlist }) => {
    if (item.isCreate) {
      return (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.createCard}
            onPress={() => router.push("/createPlaylist")}
          >
            <Ionicons name="add" size={40} color="#ffffff" />
            <Text style={styles.createLabelInner}>Créer une playlist</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <PlaylistCard
          title={item.title}
          count={item.count}
          image={item.image}
          onPress={() =>
            router.push({
              pathname: "/playlistdetails",
              params: { id: item.id, title: item.title },
            })
          }
          onEdit={() => showOptions(item)}
          onDelete={() => deletePlaylist(item.id)}
        />
      </View>
    );
  };

  return (
    <AuthGuardWrapper>
      <View style={styles.container}>
        <Header />

        {loading ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#ec4899" />
          </View>
        ) : (
          <FlatList
            data={dataWithCreate}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            ListHeaderComponent={
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>Mes playlists</Text>
                <Text style={styles.subtitle}>
                  Vos listes de lecture personnalisées
                </Text>
              </View>
            }
          />
        )}
      </View>
    </AuthGuardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C28",
  },
  headerTextContainer: {
    paddingHorizontal: 10,
    marginTop: 20,
    marginBottom: 25,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#888",
    fontSize: 16,
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    margin: 8,
    marginBottom: 20,
    maxWidth: width / 2 - 24,
  },
  createCard: {
    backgroundColor: "#2A2A38",
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  createLabelInner: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 5,
    textAlign: "center",
  },
});

export default Library;
