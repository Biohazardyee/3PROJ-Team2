import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreatePlaylist = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [name, setName] = useState((params.title as string) || '');
  const [image, setImage] = useState<string | null>((params.image as string) || null);

  const isEditing = params.isEditing === 'true';

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const savedData = await AsyncStorage.getItem('user_playlists');
      let playlists = savedData ? JSON.parse(savedData) : [];

      if (isEditing) {
        playlists = playlists.map((p: any) => 
          p.id === params.id 
            ? { ...p, title: name, image: image || p.image } 
            : p
        );
      } else {
      const newPlaylist = {
        id: Date.now().toString(),
        title: name,
        count: 0,
        image: image || 'https://picsum.photos/200',
      };
      playlists.push(newPlaylist);
      }
      await AsyncStorage.setItem('user_playlists', JSON.stringify(playlists));
      router.replace('/library');
    } catch (e) {
      console.error("Erreur lors de la sauvegarde :", e);
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
          style={[styles.btn, !name && styles.btnDisabled]} 
          onPress={handleSave}
          disabled={!name}
        >
          <Text style={styles.btnText}>
            {isEditing ? "ENREGISTRER LES MODIFS" : "CRÉER LA PLAYLIST"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#111115' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20 
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  content: { 
    flex: 1, 
    alignItems: 'center', 
    paddingHorizontal: 30, 
    paddingTop: 20 
  },
  imageBox: { 
    width: 200, 
    height: 200, 
    backgroundColor: '#2A2A38', 
    borderRadius: 12, 
    overflow: 'hidden', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 40 
  },
  previewImage: { 
    width: '100%', 
    height: '100%' 
  },
  imagePlaceholder: { 
    alignItems: 'center'
   },
  imageText: { 
    color: '#888', 
    marginTop: 10 
  },
  input: { 
    width: '100%', 
    borderBottomWidth: 1, 
    borderBottomColor: '#6C5CE7', 
    color: 'white', 
    fontSize: 22, 
    textAlign: 'center', 
    paddingVertical: 10, 
    marginBottom: 50 
  },
  btn: { 
    backgroundColor: '#6C5CE7', 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    borderRadius: 30 
  },
  btnDisabled: { 
    backgroundColor: '#444'
   },
  btnText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});

export default CreatePlaylist;