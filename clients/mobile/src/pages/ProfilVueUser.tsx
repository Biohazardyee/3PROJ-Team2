import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  StatusBar 
} from 'react-native';
import {useRouter} from "expo-router";
import { Ionicons } from '@expo/vector-icons'; 

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('Favorite Albums');
  const router = useRouter();
  // Données pour les onglets
  const tabs = ['Favorite Albums', 'Custom Lists (3)', 'Recent Activity', 'Statistics'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- SECTION BANNIÈRE --- */}
        <View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop' }} 
            style={styles.banner} 
          />
          <View style={styles.profilePicContainer}>
            <View style={styles.profilePic}>
              <Text style={styles.profileLetter}>MU</Text>
            </View>
          </View>
        </View>

        {/* --- INFOS UTILISATEUR --- */}
        <View style={styles.contentPadding}>
          <Text style={styles.userName}>Music Lover</Text>
          <Text style={styles.handle}>@musiclover</Text>

          <TouchableOpacity style={styles.editButton}  onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={18} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <Text style={styles.bio}>
            Passionate about electronic music and discovering new sounds. Always hunting for the next great album. 🎧 ✨
          </Text>

          {/* Métadonnées */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#888" />
              <Text style={styles.metaText}>Paris, France</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="link-outline" size={14} color="#4A90E2" />
              <Text style={styles.linkText}>musiclover.com</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#888" />
              <Text style={styles.metaText}>Joined January 2023</Text>
            </View>
          </View>

          {/* Statistiques */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>1247 <Text style={styles.statLabel}>Followers</Text></Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>342 <Text style={styles.statLabel}>Following</Text></Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>138 <Text style={styles.statLabel}>Albums</Text></Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- NAVIGATION PAR ONGLETS --- */}
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScroll}>
            {tabs.map((tab) => (
              <TouchableOpacity 
                key={tab} 
                onPress={() => setActiveTab(tab)}
                style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- ZONE DE CONTENU (Exemple) --- */}
        <View style={styles.albumSection}>
          {activeTab === 'Favorite Albums' ? (
             <View style={styles.placeholderCard}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop' }} 
                  style={styles.albumImage}
                />
                <View style={styles.albumBadge}>
                  <Text style={styles.badgeText}>Techno</Text>
                </View>
             </View>
          ) : (
            <Text style={styles.emptyText}>No content in {activeTab} yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* --- BOUTON FLOTTANT (FAB) --- */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1e' },
  
  // Header / Banner
  banner: { width: '100%', height: 160 },
  profilePicContainer: {
    marginTop: -55,
    marginLeft: 20,
    borderWidth: 4,
    borderColor: '#0f0f1e',
    borderRadius: 60,
    width: 110,
    height: 110,
    overflow: 'hidden',
  },
  profilePic: {
    backgroundColor: '#4A90E2',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileLetter: { color: 'white', fontSize: 36, fontWeight: 'bold' },

  // Infos
  contentPadding: { paddingHorizontal: 20, paddingTop: 10 },
  userName: { color: 'white', fontSize: 26, fontWeight: '800', letterSpacing: 0.5 },
  handle: { color: '#888', fontSize: 16, marginBottom: 15 },
  
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#1c1c2e',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a40',
  },
  editButtonText: { color: 'white', marginLeft: 8, fontWeight: '600', fontSize: 15 },
  
  bio: { color: '#ccc', marginTop: 18, lineHeight: 22, fontSize: 15 },
  
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15, columnGap: 15, rowGap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#888', fontSize: 13 },
  linkText: { color: '#4A90E2', fontSize: 13, fontWeight: '500' },
  
  statsRow: { flexDirection: 'row', marginTop: 25, gap: 25 },
  statItem: { paddingBottom: 10 },
  statNumber: { color: 'white', fontWeight: 'bold', fontSize: 17 },
  statLabel: { color: '#888', fontWeight: '400', fontSize: 15 },

  // Tabs Navigation
  tabContainer: { marginTop: 10, borderBottomWidth: 1, borderBottomColor: '#1c1c2e' },
  tabBarScroll: { paddingHorizontal: 10 },
  tabItem: { paddingVertical: 15, paddingHorizontal: 15, marginRight: 10 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: '#4A90E2' },
  tabText: { color: '#888', fontSize: 15, fontWeight: '600' },
  tabTextActive: { color: 'white' },

  // Content Area
  albumSection: { padding: 20, alignItems: 'center' },
  placeholderCard: { width: '100%', height: 250, borderRadius: 20, overflow: 'hidden', backgroundColor: '#1c1c2e' },
  albumImage: { width: '100%', height: '100%', opacity: 0.6 },
  albumBadge: { position: 'absolute', top: 15, right: 15, backgroundColor: '#E91E63', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  emptyText: { color: '#555', marginTop: 40, fontStyle: 'italic' },

  // FAB (Floating Action Button)
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4A90E2',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Pour Android
    shadowColor: '#4A90E2', // Pour iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  }
});

export default ProfileScreen;