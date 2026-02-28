import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../components/BackButton';

type Album = {
  id: string;
  title: string;
  artist: string;
  cover: string;
}

const PlaylistDetails = () => {
  const { id, title } = useLocalSearchParams();
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);

  const loadPlaylistContent = async () => {
    try {
      const savedContent = await AsyncStorage.getItem(`playlist_content_${id}`);
      if (savedContent) {
        setAlbums(JSON.parse(savedContent));
      }
    } catch (e) { 
      console.error("Erreur de chargement", e); 
    }
  };

  useEffect(() => { 
    loadPlaylistContent(); 
  }, [id]);

  const removeAlbum = (albumId: string) => {
    Alert.alert("Retirer l'album", "Voulez-vous supprimer cet album de la playlist ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
          const newAlbums = albums.filter(a => a.id !== albumId);
          setAlbums(newAlbums);
          await AsyncStorage.setItem(`playlist_content_${id}`, JSON.stringify(newAlbums));
          
          const saved = await AsyncStorage.getItem('user_playlists');
          if (saved) {
            const playlists = JSON.parse(saved);
            const updated = playlists.map((p: any) => p.id === id ? { ...p, count: newAlbums.length } : p);
            await AsyncStorage.setItem('user_playlists', JSON.stringify(updated));
          }
      }}
    ]);
  };

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <View style={styles.albumRow}>
      <Image source={{ uri: item.cover }} style={styles.albumCover} />
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.albumArtist}>{item.artist}</Text>
      </View>
      <TouchableOpacity onPress={() => removeAlbum(item.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={26} color="#FF4D4D" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 45 }} /> 
      </View>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={renderAlbumItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={50} color="#333" />
            <Text style={styles.emptyText}>Cette playlist est vide</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C28' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 25 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 15,
    backgroundColor: '#1C1C28',
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 22, 
    fontWeight: 'bold', 
    flex: 1, 
    textAlign: 'center' 
  },
  listContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  albumRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#2A2A38', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15,
  },
  albumCover: { 
    width: 90, 
    height: 90, 
    borderRadius: 10, 
    backgroundColor: '#333' 
  },
  albumInfo: { 
    flex: 1, 
    marginLeft: 15 
  },
  albumTitle: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  albumArtist: { 
    color: '#AAA', 
    fontSize: 15 
  },
  deleteBtn: { 
    padding: 5 
  },
  emptyContainer: { 
    marginTop: 150, 
    alignItems: 'center' 
  },
  emptyText: { 
    color: '#555', 
    fontSize: 18, 
    marginTop: 10 
  }
});

export default PlaylistDetails;