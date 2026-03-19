import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from "@/src/components/Header";
import { useLocalSearchParams, useRouter } from 'expo-router';

const WriteReview = () => {
  const router = useRouter();
  // Récupération des données 
  const { id, title, artist, cover } = useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [review, setReview] = useState('');

  const handlePublish = () => {
    if (rating === 0 || reviewTitle.trim() === '' || review.trim() === '') {
      Alert.alert("Oups !", "Merci de remplir tous les champs et de donner une note.");
      return;
    }

    Alert.alert("Succès", "Votre avis a été publié avec succès !");
    router.back();
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((index) => (
          <TouchableOpacity key={index} onPress={() => setRating(index)}>
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
        {/* Titre */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Ecrire votre avis</Text>
            <Text style={styles.subtitle}>Partage ton avis sur cet album</Text>
          </View>
        </View>

        {/* Carte de l'Album */}
        <View style={styles.albumCard}>
          <Image 
            source={{ uri: (cover as string) || 'https://via.placeholder.com/80' }} 
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
          />
          <Text style={styles.charCount}>{reviewTitle.length} / 100 caractères</Text>

          <Text style={styles.label}>Ton avis *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Partage tes réflexions détaillées sur cet album..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={6}
            value={review}
            onChangeText={setReview}
          />
        </View>

        {/* Boutons d'Action */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.publishButton}
            onPress={handlePublish}
          >
            <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.publishText}>Publier l'avis</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f111a', 
  },
  container: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#8e8e93',
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 5,
  },
  albumCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 25,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  albumName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  artistName: {
    color: '#4A90E2', 
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 30,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'left',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  publishButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6', 
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
  },
  publishText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WriteReview;