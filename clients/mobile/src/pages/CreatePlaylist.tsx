import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useRouter,
  useLocalSearchParams,
  Router,
  UnknownOutputParams,
} from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import apiClient from "../api/client";
import * as FileSystem from "expo-file-system/legacy";

const CreatePlaylist = () => {
  const router: Router = useRouter();
  const params: UnknownOutputParams = useLocalSearchParams();

  const [name, setName] = useState((params.title as string) || "");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = params.isEditing === "true";
  const isPublicParam = params.is_public === "true";

  const [isPublic, setIsPublic] = useState<boolean>(isPublicParam);


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!isEditing || !params.id) return;

      try {
        const res = await apiClient.get(`/playlists/${params.id}`);
        const playlist = res.data.playlist;

        setName(playlist.name);
        setIsPublic(playlist.is_public);
        setImage(playlist.image_url || null);
      } catch (e) {
        console.error(e);
      }
    };

    loadPlaylist();
  }, []);

  useEffect(() => {
    if (params.is_public !== undefined) {
      setIsPublic(params.is_public === "true");
    }
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);

      const token: string | null = await SecureStore.getItemAsync("userToken");
      if (!token) {
        Alert.alert("Erreur", "Session expirée.");
        return;
      }
      const decoded: any = jwtDecode(token);
      const userId = decoded.id;

      let base64Image = undefined;

      if (image) {
        if (image.startsWith("data:image")) {
          base64Image = image;
        } else {
          const base64Raw: string = await FileSystem.readAsStringAsync(image, {
            encoding: FileSystem.EncodingType.Base64,
          });

          base64Image = `data:image/jpeg;base64,${base64Raw}`;
        }
      }

      const playlistData = {
        name: name.trim(),
        user_id: userId,
        is_public: isPublic,
        image_url: base64Image,
      };

      if (isEditing) {
        const updateData: any = {
          name: name.trim(),
          is_public: isPublic,
        };

        if (base64Image) {
          updateData.image_url = base64Image;
        }
        await apiClient.put(`/playlists/${params.id}`, updateData);
        Alert.alert("Succès", "Playlist mise à jour !");
      } else {
        await apiClient.post("/playlists", playlistData);
        Alert.alert("Succès", "Playlist créée !");
      }

      router.replace("/library");
    } catch (e: any) {
      console.error("Erreur sauvegarde playlist:", e);
      Alert.alert(
        "Erreur",
        e.response?.data?.message || "Impossible d'enregistrer la playlist.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Modifier la playlist" : "Nouvelle playlist"}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={40} color="#888" />
              <Text style={styles.imageText}>Ajouter une cover</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nom de la playlist"
          placeholderTextColor="#555"
          value={name}
          onChangeText={setName}
          autoFocus={!isEditing}
        />

        <TouchableOpacity
          style={styles.switchRow}
          onPress={() => setIsPublic((prev) => !prev)}
        >
          <Text style={styles.switchText}>
            {isPublic ? "Playlist publique" : "Playlist privée"}
          </Text>

          <Ionicons
            name={isPublic ? "eye" : "eye-off"}
            size={22}
            color={isPublic ? "#6C5CE7" : "#555"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, (!name || loading) && styles.btnDisabled]}
          onPress={handleSave}
          disabled={!name || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>
              {isEditing ? "ENREGISTRER LES MODIFS" : "CRÉER LA PLAYLIST"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111115" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#1a1a24",
    borderRadius: 12,
    marginBottom: 30,
  },

  switchText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  imageBox: {
    width: 200,
    height: 200,
    backgroundColor: "#2A2A38",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  previewImage: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center" },
  imageText: { color: "#888", marginTop: 10 },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#6C5CE7",
    color: "white",
    fontSize: 22,
    textAlign: "center",
    paddingVertical: 10,
    marginBottom: 50,
  },
  btn: {
    backgroundColor: "#6C5CE7",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 200,
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: "#444" },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default CreatePlaylist;
