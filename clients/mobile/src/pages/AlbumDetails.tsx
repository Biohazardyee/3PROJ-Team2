import React, { useState } from 'react';
import {StyleSheet,Text,View,Image,ScrollView,TouchableOpacity,Dimensions, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from "@/src/components/Header"; 
import StatCard from "@/src/components/StatCard"; 
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';

const ALBUMS = [
    { id: "1",
        title: "D&P à vie",
        artist: "Jul",
        rating: '4.8',
        year : '2025',
        genre : 'Rap',
        cover: "https://lh3.googleusercontent.com/WoVLp__R9eynW29Ptfy8RO_H8ZSEegNeuGSPO4m4wmjkdVMou7u_3Fn52rNOfAEbjI4EO74tFnqPwwH81g=w544-h544-l90-rj",
    },
    { id: "2",
        title: "Destin",
        artist: "Ninho",
        rating: '4.5',
        year : '2019',
        genre : 'Rap',
        cover: "https://lh3.googleusercontent.com/d839QAhSoC58LRIEOZXApz5FIlNKtExVa_AHfQ8wGRI24OU3jmDhBBJIi2sFE-hSLJHRLp0h25di4hXg=w544-h544-l90-rj",
    },
    { id: "3",
        title: "BDLM",
        artist: "Tiakola",
        rating: '4.6',
        year : '2024',
        genre : 'Rap',
        cover: "https://lh3.googleusercontent.com/wWRHoBaUQ4cLSIOgtfNLcQFGMHzN_ahh7Bu0vqN6zF3YRrdzUoHhIaBFaRAiQ4uYJ9sHq0IyUj6oKUvAdQ=w544-h544-l90-rj",
    },
    { id: "4",
        title: "Maestro",
        artist: "Lartiste",
        rating: '5',
        year : '2016',
        genre : 'Rap',
        cover: "https://lh3.googleusercontent.com/Aku7dOqopdBsl_Qaqc2ClW4ZU4tlIaaiMaV1wqiYw4mUVj2FYMX3kRfBYA3OyHqyOV6IlmxDtX5U9pXN=w544-h544-l90-rj"
    },
];

const { width } = Dimensions.get('window');

const PLAYLISTS = [
  { id: '1', title: 'Favoris du moment' },
  { id: '2', title: 'Sport & Motivation' },
  { id: '3', title: 'Découvertes Hebdo' },
];

type TabType = 'Reviews' | 'Similar';

const AlbumDetails = () => {

  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('Reviews');
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);

  const album = ALBUMS.find(a => a.id === id) || ALBUMS[0];
  const router = useRouter();

  const handleAddToPlaylist = (playlistName: string) => {
    Alert.alert("Succès", `L'album "${album.title}" a été ajouté à "${playlistName}"`);
    setShowPlaylistSelector(false); 
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Cover*/}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: album.cover}} 
            style={styles.coverImage}
          />
        </View>

        {/*Titre*/}
        <View style={styles.paddingContent}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: '#ec4899' }]}>
              <Text style={styles.badgeText}>{album.genre}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#1e1e2d' }]}>
              <Text style={styles.badgeText}>{album.year}</Text>
            </View>
          </View>

          <Text style={styles.albumTitle}>{album.title}</Text>
          <Text style={styles.artistName}>{album.artist}</Text>

          {/* Notes */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={24} color="#ec4899" />
            <Text style={styles.ratingValue}>{album.rating}</Text>
            <Text style={styles.ratingCount}>(1247 notes)</Text>
          </View>

          {/* Info */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="musical-notes-outline" size={18} color="#94a3b8" />
              <Text style={styles.statText}>12 musiques</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color="#94a3b8" />
              <Text style={styles.statText}>52:34</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
              <Text style={styles.statText}>{album.year}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.labelPrefix}>Label: <Text style={styles.statText}>Neon Records</Text></Text>
            </View>
          </View>

          {/* Boutons stats */}
          <View style={styles.actionButtons}>
            <View style={styles.grid}>
                <StatCard
                    title="Écoutés"
                    icon="check-circle-outline"
                    color="#00ffa3"
                    showCheckbox={true} 
                    initialChecked={false}
                />
                <StatCard
                    title="À écouter plus tard"
                    icon="playlist-music"
                    color="#4747ff"
                    showCheckbox={true} 
                    initialChecked={false} 
                />
                <StatCard
                    title="Favoris"
                    icon="star"
                    color="#fbbf24"
                    showCheckbox={true} 
                    initialChecked={false}
               />
                <StatCard
                    title="Je n'aime pas"
                    icon="close-circle-outline"
                    color="#f43f5e"
                    showCheckbox={true} 
                    initialChecked={false}
                />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => setShowPlaylistSelector(!showPlaylistSelector)} >
              <Text style={styles.primaryButtonText}>
                {showPlaylistSelector ? "Annuler" : "Ajouter à une playlist"}
              </Text>
            </TouchableOpacity>

            {showPlaylistSelector && (
              <View style={styles.playlistSelector}>
                <Text style={styles.playlistSubtitle}>Choisir une playlist :</Text>
                {PLAYLISTS.map((playlist) => (
                  <TouchableOpacity 
                    key={playlist.id} 
                    style={styles.playlistItem}
                    onPress={() => handleAddToPlaylist(playlist.title)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#ec4899" />
                    <Text style={styles.playlistItemText}>{playlist.title}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity 
                  style={[styles.playlistItem, { borderBottomWidth: 0 }]}
                  onPress={() => router.push('/createplaylist') } 
                >
                  <Ionicons name="create-outline" size={20} color="#94a3b8" />
                  <Text style={[styles.playlistItemText, { color: '#94a3b8' }]}>
                    Nouvelle playlist...
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.secondaryButton}
              onPress={() => router.push({
                  pathname: '/writereview', 
                  params: { id: album.id, title: album.title, artist: album.artist, cover: album.cover }
                })}>
              <Text style={styles.secondaryButtonText}>Donner votre avis</Text>
            </TouchableOpacity>
          </View>

          {/* Section About */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>A propos</Text>
            <Text style={styles.aboutText}>
              Desctription de l'album
            </Text>
          </View>
        </View>

        {/* Filtres */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Reviews' && styles.activeTab]} 
            onPress={() => setActiveTab('Reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'Reviews' && styles.activeTabText]}>Avis</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tab} 
            onPress={() => setActiveTab('Similar')}
          >
            <Text style={styles.tabText}>Albums similaires</Text>
          </TouchableOpacity>
        </View>

        {/* Avis*/}
        <View style={styles.tabContent}>
          {activeTab === 'Reviews' && (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerAvatar}><Text style={styles.avatarText}>AL</Text></View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.reviewerName}>@alexdj</Text>
                  <Text style={styles.reviewDate}>2 weeks ago</Text>
                </View>
                <View style={styles.starsSmall}>
                  {[1, 2, 3, 4, 5].map(s => <Ionicons key={s} name="star" size={14} color="#ec4899" />)}
                </View>
              </View>
              <Text style={styles.reviewTitle}>A Techno Masterpiece</Text>
              <Text style={styles.reviewBody}>
                An absolute masterpiece of modern techno. The production quality is outstanding...
              </Text>
              <View style={styles.reviewFooter}>
                <Ionicons name="thumbs-up-outline" size={18} color="#94a3b8" />
                <Text style={styles.footerText}>42</Text>
                <Ionicons name="chatbubble-outline" size={18} color="#94a3b8" style={{ marginLeft: 15 }} />
                <Text style={styles.footerText}>8</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, backgroundColor: '#0f111a'
 },
  scrollContent: { 
    paddingBottom: 40 
},
  imageContainer: {
     padding: 20, alignItems: 'center' 
},
  coverImage: { 
    width: width - 40, 
    height: width - 40,
     borderRadius: 20
},
  paddingContent: { 
    paddingHorizontal: 20 
},
  badgeRow: { flexDirection: 'row',
     gap: 10,
      marginTop: 10
},
  badge: { paddingHorizontal: 12,
     paddingVertical: 4,
      borderRadius: 6
},
  badgeText: { color: 'white',
     fontWeight: 'bold',
      fontSize: 12 
},
  albumTitle: { 
    color: 'white',
     fontSize: 28,
      fontWeight: 'bold',
       marginTop: 15
},
  artistName: { color: '#94a3b8',
     fontSize: 18,
      marginTop: 4 
},
  ratingRow: { 
    flexDirection: 'row',
     alignItems: 'center',
     marginTop: 15,
      gap: 8 
},
  ratingValue: { 
    color: 'white',
    fontSize: 24, 
    fontWeight: 'bold' 
},
  ratingCount: { 
    color: '#64748b', 
    fontSize: 14 },
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: 20, 
    gap: 15 
},
  statItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8
},
  statText: { 
    color: 'white', 
    fontSize: 14 },
  labelPrefix: { 
    color: '#94a3b8' 
},
  actionButtons: { 
    marginTop: 25, 
    gap: 12 
},
grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },

  primaryButton: { 
    backgroundColor: '#c61ebd', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center'
},
  primaryButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
},
playlistSelector: {
    backgroundColor: '#1a1d29',
    borderRadius: 16,
    padding: 15,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#2d2d3f',
},
playlistSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
},
playlistItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#2d2d3f',
  gap: 10,
},
playlistItemText: {
  color: 'white',
  fontSize: 16,
},

secondaryButton: { 
  backgroundColor: '#3b82f6', 
  padding: 15, 
  borderRadius: 12, 
  alignItems: 'center'
},
secondaryButtonText: { 
  color: 'white', 
  fontWeight: 'bold', 
  fontSize: 16 
},
aboutSection: { 
  marginTop: 30
},
sectionTitle: { 
  color: 'white', 
  fontSize: 20, 
  fontWeight: 'bold', 
  marginBottom: 10 
},
aboutText: { 
  color: '#94a3b8', 
  fontSize: 16, 
  lineHeight: 24 
},
tabsContainer: { 
  flexDirection: 'row', 
  backgroundColor: '#1a1d29', 
  margin: 20, 
  padding: 5, 
  borderRadius: 12 
},
tab: { 
  flex: 1, 
  paddingVertical: 10, 
  alignItems: 'center', 
  borderRadius: 8 
},
activeTab: { 
  backgroundColor: '#2d2d3f'
},
tabText: { 
  color: '#64748b', 
  fontWeight: 'bold'
},
activeTabText: { 
  color: 'white'
},
tabContent: { 
  paddingHorizontal: 20
},
reviewCard: { 
  backgroundColor: '#1a1d29',
    padding: 15,
    borderRadius: 16, 
    borderLeftWidth: 1, 
    borderColor: '#2d2d3f'
},
reviewHeader: { 
  flexDirection: 'row', 
  alignItems: 'center' 
},
reviewerAvatar: { 
  width: 32, 
  height: 32, 
  borderRadius: 16, 
  backgroundColor: '#2563eb', 
  justifyContent: 'center', 
  alignItems: 'center'
},
avatarText: { 
  color: 'white', 
  fontSize: 12, 
  fontWeight: 'bold'
},
reviewerName: { 
  color: 'white', 
  fontWeight: 'bold'
},
reviewDate: { 
  color: '#64748b',
  fontSize: 12
},
starsSmall: { 
  flexDirection: 'row'
},
reviewTitle: { 
  color: 'white', 
  fontSize: 16, 
  fontWeight: 'bold', 
  marginTop: 15
},
reviewBody: { 
  color: '#94a3b8', 
  marginTop: 8, 
  lineHeight: 22 
},
reviewFooter: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  marginTop: 15 
},
footerText: { 
  color: '#94a3b8', 
  marginLeft: 5, 
  fontSize: 14 }
});

export default AlbumDetails;