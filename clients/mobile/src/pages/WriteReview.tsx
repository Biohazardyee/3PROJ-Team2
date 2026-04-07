import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/src/components/Header";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import apiClient from "../api/client";

const WriteReview = () => {
  const router = useRouter();

  const { id, title, artist, cover } = useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (rating === 0 || reviewTitle.trim() === "" || review.trim() === "") {
      Alert.alert(
        "Oups !",
        "Merci de remplir tous les champs et de donner une note.",
      );
      return;
    }


    if (!id) {
      Alert.alert(
        "Erreur",
        "Impossible de récupérer l'identifiant de l'album.",
      );
      return;
    }

    setLoading(true);

    try {
      const userId = await SecureStore.getItemAsync("userId");

      const payload = {
        user_id: userId,
        media_id: id as string, 
        rating: rating,
        title: reviewTitle.trim(),
        content: review.trim(),
      };


      if (!userId) {
        Alert.alert("Erreur", "Session expirée. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      await apiClient.post("/reviews", payload);

    
      Alert.alert("Succès", "Votre avis a été publié avec succès !", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Erreur publication review:", error);

      const errorMessage =
        error.response?.data?.message || "Une erreur est survenue.";
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rendu des étoiles de notation
   */
  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setRating(index)}
            disabled={loading}
          >
            <Ionicons
              name={index <= rating ? "star" : "star-outline"}
              size={32}
              color={index <= rating ? "#e24ada" : "#444"}
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <Header />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Titre de la page */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Écrire votre avis</Text>
            <Text style={styles.subtitle}>Partage ton avis sur cet album</Text>
          </View>
        </View>

        {/* Carte de l'Album sélectionné */}
        <View style={styles.albumCard}>
          <Image
            source={{
              uri: (cover as string) || "https://via.placeholder.com/80",
            }}
            style={styles.albumArt}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.albumName} numberOfLines={1}>
              {title || "Album Inconnu"}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {artist || "Artiste Inconnu"}
            </Text>
          </View>
        </View>

        {/* Section du Formulaire */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Ta note *</Text>
          {renderStars()}

          <Text style={styles.label}>Titre de l'avis *</Text>
          <TextInput
            style={styles.input}
            placeholder="Un titre pour ton avis..."
            placeholderTextColor="#666"
            value={reviewTitle}
            onChangeText={setReviewTitle}
            maxLength={100}
            editable={!loading}
          />
          <Text style={styles.charCount}>
            {reviewTitle.length} / 100 caractères
          </Text>

          <Text style={styles.label}>Ton avis *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Partage tes réflexions détaillées sur cet album..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={6}
            value={review}
            onChangeText={setReview}
            editable={!loading}
          />
        </View>

        {/* Boutons d'Action */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.publishButton, loading && { opacity: 0.7 }]}
            onPress={handlePublish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="save-outline"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.publishText}>Publier l'avis</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f111a",
  },
  container: {
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#8e8e93",
    fontSize: 14,
    marginTop: 4,
  },
  albumCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 25,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  albumName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  artistName: {
    color: "#4A90E2",
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 30,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 20,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 8,
    padding: 15,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  charCount: {
    color: "#666",
    fontSize: 12,
    marginTop: 5,
    textAlign: "left",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  publishButton: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 150,
    justifyContent: "center",
  },
  publishText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default WriteReview;
