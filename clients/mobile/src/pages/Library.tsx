import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from "@/src/components/Header";
import PlaylistCard from "@/src/components/PlaylistCard"; 
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Playlist = {
  id: string;
  title: string;
  count: number;
  image: string;
  isCreate?: boolean; 
}

const { width } = Dimensions.get('window');

const Library: React.FC = () => {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const loadPlaylists = async () => {
    try {
      const savedData = await AsyncStorage.getItem('user_playlists');
      if (savedData) {
        setPlaylists(JSON.parse(savedData));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadPlaylists, 1000); 
    return () => clearInterval(interval);
  }, []);

  const dataWithCreate = [
    ...playlists, 
    { id: 'create-button-id', isCreate: true } as Playlist
  ];

  const renderItem = ({ item }: { item: Playlist }) => {
    if (item.isCreate) {
      return (
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.createCard}
            onPress={() => router.push('/createplaylist')}
          >
            <Ionicons name="add" size={40} color="#ffffff" />
            <Text style={styles.createLabelInner}>Créer une playlist</Text>
          </TouchableOpacity>
          <Text style={[styles.ghostText, { marginTop: 10 }]}> </Text>
          <Text style={styles.ghostText}> </Text>
        </View>
      );
    }

    return (
      <PlaylistCard 
        title={item.title} 
        count={item.count} 
        image={item.image}
        onPress={() => console.log(`Ouvrir playlist ${item.id}`)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header />
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
            <Text style={styles.subtitle}>Créez vos propres listes personnalisées</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1C1C28' 
  },
  headerTextContainer: { 
    paddingHorizontal: 10, 
    marginTop: 20, 
    marginBottom: 25 
  },
  title: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: 'bold' 
  },
  subtitle: { 
    color: '#888', 
    fontSize: 16, 
    marginTop: 5 
  },
  listContainer: { 
    paddingHorizontal: 8, 
    paddingBottom: 100 
  },
  card: { 
    flex: 1, 
    margin: 8, 
    marginBottom: 20, 
    maxWidth: (width / 2) - 24 
  },
  createCard: {
    backgroundColor: '#2A2A38',
    width: '100%',
    aspectRatio: 1, 
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  createLabelInner: { 
    color: '#ffffff', 
    fontSize: 12, 
    fontWeight: '500', 
    marginTop: 5, 
    textAlign: 'center' 
  },
  ghostText: { 
    fontSize: 14 
  } 
});

export default Library;