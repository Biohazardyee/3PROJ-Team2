import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AlbumCard from "@/src/components/AlbumCard";
import Header from "@/src/components/Header";
import { AuthGuardWrapper } from "../components/AuthGuardMapper";

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("Favorite Albums");
  const router = useRouter();
  const tabs = [
    "Favorite Albums",
    "Custom Lists (3)",
    "Recent Activity",
    "Statistics",
  ];

  const ALBUMS = [
    {
      id: "1",
      title: "D&P à vie",
      artist: "Jul",
      rating: "4.8",
      year: "2025",
      genre: "Rap",
      cover:
        "https://lh3.googleusercontent.com/WoVLp__R9eynW29Ptfy8RO_H8ZSEegNeuGSPO4m4wmjkdVMou7u_3Fn52rNOfAEbjI4EO74tFnqPwwH81g=w544-h544-l90-rj",
    },
    {
      id: "2",
      title: "Destin",
      artist: "Ninho",
      rating: "4.5",
      year: "2019",
      genre: "Rap",
      cover:
        "https://lh3.googleusercontent.com/d839QAhSoC58LRIEOZXApz5FIlNKtExVa_AHfQ8wGRI24OU3jmDhBBJIi2sFE-hSLJHRLp0h25di4hXg=w544-h544-l90-rj",
    },
    {
      id: "3",
      title: "BDLM",
      artist: "Tiakola",
      rating: "4.6",
      year: "2024",
      genre: "Rap",
      cover:
        "https://lh3.googleusercontent.com/wWRHoBaUQ4cLSIOgtfNLcQFGMHzN_ahh7Bu0vqN6zF3YRrdzUoHhIaBFaRAiQ4uYJ9sHq0IyUj6oKUvAdQ=w544-h544-l90-rj",
    },
    {
      id: "4",
      title: "Maestro",
      artist: "Lartiste",
      rating: "5",
      year: "2016",
      genre: "Rap",
      cover:
        "https://lh3.googleusercontent.com/Aku7dOqopdBsl_Qaqc2ClW4ZU4tlIaaiMaV1wqiYw4mUVj2FYMX3kRfBYA3OyHqyOV6IlmxDtX5U9pXN=w544-h544-l90-rj",
    },
  ];

  return (
    <AuthGuardWrapper>
      <View style={styles.container}>
        <Header />
        <StatusBar barStyle="light-content" />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Banniere*/}
          <View>
            <Image
              source={{
                uri: "https://img.freepik.com/free-vector/gradient-music-notes-background_23-2151320190.jpg?semt=ais_incoming&w=740&q=80",
              }}
              style={styles.banner}
            />
            <View style={styles.profilePicContainer}>
              <View style={styles.profilePic}>
                <Text style={styles.profileLetter}>MU</Text>
              </View>
            </View>
          </View>

          {/* infos user */}
          <View style={styles.contentPadding}>
            <Text style={styles.userName}>Music Lover</Text>
            <Text style={styles.handle}>@musiclover</Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push("/settings")}
            >
              <Ionicons name="settings-outline" size={18} color="#fff" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <Text style={styles.bio}>
              Passionate about electronic music and discovering new sounds.
              Always hunting for the next great album. 🎧 ✨
            </Text>

            {/* Date */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#888" />
                <Text style={styles.metaText}>Joined January 2023</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>
                  1247 <Text style={styles.statLabel}>Followers</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>
                  342 <Text style={styles.statLabel}>Following</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Onglets */}
          <View style={styles.tabContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabBarScroll}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tabItem,
                    activeTab === tab && styles.tabItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.tabTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Contenu */}
          <View style={styles.albumSection}>
            {activeTab === "Favorite Albums" ? (
              <View style={styles.albumGrid}></View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="construct-outline" size={40} color="#333" />
                <Text style={styles.emptyText}>
                  No content in {activeTab} yet.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </AuthGuardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  banner: {
    width: "100%",
    height: 160,
  },
  profilePicContainer: {
    marginTop: -55,
    marginLeft: 20,
    borderWidth: 4,
    borderColor: "#0f0f1e",
    borderRadius: 60,
    width: 110,
    height: 110,
    overflow: "hidden",
  },
  profilePic: {
    backgroundColor: "#4A90E2",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileLetter: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  userName: {
    color: "white",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  handle: {
    color: "#888",
    fontSize: 16,
    marginBottom: 15,
  },

  editButton: {
    flexDirection: "row",
    backgroundColor: "#1c1c2e",
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a40",
  },
  editButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 15,
  },

  bio: {
    color: "#ccc",
    marginTop: 18,
    lineHeight: 22,
    fontSize: 15,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
    columnGap: 15,
    rowGap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    color: "#888",
    fontSize: 13,
  },

  linkText: {
    color: "#4A90E2",
    fontSize: 13,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 25,
    gap: 25,
  },
  statItem: {
    paddingBottom: 10,
  },
  statNumber: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
  statLabel: {
    color: "#888",
    fontWeight: "400",
    fontSize: 15,
  },

  tabContainer: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c2e",
  },
  tabBarScroll: {
    paddingHorizontal: 10,
  },
  tabItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#4A90E2",
  },
  tabText: {
    color: "#888",
    fontSize: 15,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "white",
  },
  albumSection: {
    paddingHorizontal: 20, // Alignement avec le reste du profil
    paddingTop: 20,
  },
  albumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // C'est ici que le 48% de tes cartes prend tout son sens
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#555",
    marginTop: 10,
    fontStyle: "italic",
    fontSize: 14,
  },
  placeholderCard: {
    width: "100%",
    height: 250,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1c1c2e",
  },
  albumImage: {
    width: "100%",
    height: "100%",
    opacity: 0.6,
  },
  albumBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#E91E63",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  emptyText: {
    color: "#555",
    marginTop: 40,
    fontStyle: "italic",
  },
  scrollContainer: {
    paddingBottom: 120,
  },
});

export default ProfileScreen;
