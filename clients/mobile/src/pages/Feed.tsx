import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, StatusBar } 
from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from "@/src/components/Header";

type Filter = 'Tout' | 'Abonnement' | 'Tendances';

type Post = {
  id: number;
  user: string;
  initials: string;
  action: string;
  time: string;
  albumTitle: string;
  artist: string;
  rating: number;
  content?: string;
  likes: number;
  comments: number;
  coverColor: string;
  category: Filter;
}

const Feed = () => {
  const [activeFilter, setActiveFilter] = useState<Filter>('Tout');
  const [searchQuery, setSearchQuery] = useState('');

  // Données d'exemple
  const posts: Post[] = [
    {
      id: 1,
      user: '@alexdj',
      initials: 'AL',
      action: 'wrote a review',
      time: '2 HOURS AGO',
      albumTitle: 'Midnight Pulse',
      artist: 'Neon Dreams',
      rating: 5,
      content: 'An absolute masterpiece of modern techno. The production quality is outstanding and every track flows perfectly into the next.',
      likes: 24,
      comments: 8,
      coverColor: '#1e1b4b',
      category: 'Tendances'
    },
    {
      id: 2,
      user: '@musiclover92',
      initials: 'MU',
      action: 'rated an album',
      time: '5 HOURS AGO',
      albumTitle: 'Electric Soul',
      artist: 'Synth Wave',
      rating: 4,
      likes: 12,
      comments: 3,
      coverColor: '#064e3b',
      category: 'Abonnement'
    }
  ];

  // Logique de filtrage
  const filteredPosts = posts.filter(post => {
    const matchesFilter = activeFilter === 'Tout' || post.category === activeFilter;
    const matchesSearch = post.albumTitle.toLowerCase().includes(searchQuery.toLowerCase()) || post.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Titre et Sous-titre */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Votre fil d'actualités</Text>
          <Text style={styles.subtitle}>Restez informer avec la communauté !</Text>
        </View>

        {/* Barre de Recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Rechercher un utilisateur, artiste..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Boutons de Filtres */}
        <View style={styles.filterTabs}>
          <FilterButton 
            label="Tout" 
            active={activeFilter === 'Tout'} 
            icon="grid-outline" 
            onPress={() => setActiveFilter('Tout')} 
          />
          <FilterButton 
            label="Abonnement" 
            active={activeFilter === 'Abonnement'} 
            icon="people-outline" 
            onPress={() => setActiveFilter('Abonnement')} 
          />
          <FilterButton 
            label="Trending" 
            active={activeFilter === 'Tendances'} 
            icon="trending-up-outline" 
            onPress={() => setActiveFilter('Tendances')} 
          />
        </View>

        {/* Liste des Posts */}
        <View style={styles.postsList}>
          {filteredPosts.map(post => (
            <View key={post.id} style={styles.card}>
              {/* Infos Utilisateur */}
              <View style={styles.userRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{post.initials}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>
                    {post.user} <Text style={styles.actionText}>{post.action}</Text>
                  </Text>
                  <Text style={styles.timeText}>{post.time}</Text>
                </View>
              </View>

              {/* Infos Album */}
              <View style={styles.albumRow}>
                <View style={[styles.albumCover, { backgroundColor: post.coverColor }]} />
                <View style={styles.albumDetails}>
                  <Text style={styles.albumTitle}>{post.albumTitle}</Text>
                  <Text style={styles.artistName}>{post.artist}</Text>
                  <View style={styles.starsRow}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons 
                        key={i} 
                        name="star" 
                        size={16} 
                        color={i < post.rating ? "#ec4899" : "#374151"} 
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Texte du Review */}
              {post.content && (
                <Text style={styles.postContent}>{post.content}</Text>
              )}

              {/* Actions */}
              <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons 
                    name={post.likes > 20 ? "heart" : "heart-outline"} 
                    size={22} 
                    color={post.likes > 20 ? "#ec4899" : "#9ca3af"} 
                  />
                  <Text style={styles.actionCount}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#9ca3af" />
                  <Text style={styles.actionCount}>{post.comments}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Les boutons de filtre 
const FilterButton = ({ label, active, icon, onPress }: any) => (
  <TouchableOpacity 
    style={[styles.filterBtn, active && styles.filterBtnActive]} 
    onPress={onPress}
  >
    <Ionicons name={icon} size={18} color={active ? "#fff" : "#6b7280"} />
    <Text style={[styles.filterBtnText, active && styles.filterBtnTextActive]}>{label}</Text>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C28',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d29',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#fff',
    fontSize: 15,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#1a1d29',
    marginHorizontal: 20,
    padding: 5,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  filterBtnActive: {
    backgroundColor: '#2a2e3f',
  },
  filterBtnText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  postsList: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1a1d29',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionText: {
    fontWeight: '400',
    color: '#6b7280',
  },
  timeText: {
    color: '#4b5563',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  albumRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  albumCover: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  albumDetails: {
    justifyContent: 'center',
  },
  albumTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  postContent: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    paddingBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 25,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    color: '#9ca3af',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Feed;