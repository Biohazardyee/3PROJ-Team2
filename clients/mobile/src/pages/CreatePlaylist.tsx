import React, { useState } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import apiClient from "../api/client";
// On utilise l'API stable pour éviter l'erreur FileReader/Blob
import * as FileSystem from "expo-file-system/legacy";

const CreatePlaylist = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [name, setName] = useState((params.title as string) || "");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = params.isEditing === "true";

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

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        Alert.alert("Erreur", "Session expirée.");
        return;
      }
      const decoded: any = jwtDecode(token);
      const userId = decoded.id;

      let base64Image = undefined;

      if (image) {
        // Lecture stable du fichier en base64
        const base64Raw = await FileSystem.readAsStringAsync(image, {
          encoding: "base64",
        });

        // On rajoute manuellement le préfixe pour ton backend
        base64Image = `data:image/jpeg;base64,${base64Raw}`;
      }

      const playlistData = {
        name: name.trim(),
        user_id: userId,
        is_public: true,
        image_url: base64Image,
      };

      if (isEditing) {
        const updateData = {
          name: name.trim(),
          image_url: base64Image,
          is_public: true,
        };
        await apiClient.put(`/playlists/${params.id}`, updateData);
        Alert.alert("Succès", "Playlist mise à jour !");
      } else {
        console.log("Envoi au serveur, base64 présent ?", !!base64Image);
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
