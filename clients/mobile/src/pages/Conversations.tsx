import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from "@/src/components/Header";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import apiClient from '../api/client';

const Conversations = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const fetchConversations = async () => {
        // Sécurité : ne pas lancer l'appel si on n'a pas encore l'ID
        if (!currentUserId) return; 

        try {
            const response = await apiClient.get(`/conversations/user/${currentUserId}`);
            const data = response.data; 
            setConversations(data.conversations || []);
        } catch (error) {
            console.error("Erreur fetch conversations:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const getUserId = async () => {
            try {
                const token = await SecureStore.getItemAsync("userToken");
                if (token) {
                    const decoded: any = jwtDecode(token);
                    setCurrentUserId(decoded.id);
                }
            } catch (err) {
                console.error("Erreur token:", err);
                setLoading(false);
            }
        };
        getUserId();
    }, []);

    useEffect(() => {
        if (currentUserId) {
            fetchConversations();
        }
    }, [currentUserId]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchConversations();
    }, [currentUserId]); // Ajout de la dépendance

    if (loading) {
        return (
            <View style={[styles.safeArea, {justifyContent: 'center'}]}>
                <ActivityIndicator size="large" color="#4cc9f0" />
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <Header />
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4cc9f0" />}
            >
                <View style={styles.titleWrapper}>
                    <Text style={styles.glitchTitleSub}>Messages</Text>
                </View>

                <TextInput placeholder="Rechercher..." placeholderTextColor="#666" style={styles.searchInput} />

                <View style={styles.chatList}>
                    {conversations.map((conv: any) => {
                        // Déterminer qui est l'autre personne
                        const otherUser = conv.user1_id === currentUserId ? conv.user2 : conv.user1;
                        
                        // Sécurité : si otherUser est null, on n'affiche rien
                        if (!otherUser) return null;

                        const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
                        
                        return (
                            <ChatItem 
                                key={conv.id}
                                id={conv.id}
                                name={otherUser.username}
                                msg={lastMsg?.content || "Commencez la discussion..."}
                                time={lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                                unread={conv._count?.messages || 0}
                                initials={otherUser.username.substring(0, 2).toUpperCase()}
                                isSystem={otherUser.role === 'ADMIN'}
                            />
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

const ChatItem = ({ id, name, msg, time, unread, initials, isSystem }: any) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.chatItem, unread > 0 && styles.chatItemUnread]}
      // MODIFICATION ICI : On utilise le nom exact de ton fichier
      onPress={() => navigation.navigate('detailsConversations', { 
        conversationId: id, 
        userName: name 
      })}
    >
      <View style={[
        styles.avatarCircle,
        isSystem ? styles.avatarSystem : styles.avatarUser,
        unread > 0 && styles.avatarUnreadBorder
      ]}>
        <Text style={styles.avatarText}>{initials}</Text>
        <View style={styles.onlineStatus} />
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName} numberOfLines={1}>{name}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>

        <View style={styles.chatFooter}>
          <Text style={[styles.lastMsg, unread > 0 && styles.lastMsgUnread]} numberOfLines={1}>
            {msg}
          </Text>
          
          {unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0c14', // Encore plus sombre pour faire ressortir le bleu
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  titleWrapper: {
    marginVertical: 30,
    paddingLeft: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4cc9f0',
  },
  glitchTitleSub: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  searchInput: {
    backgroundColor: '#16172b',
    borderRadius: 20,
    padding: 18,
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#2d2e4a',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  chatList: { gap: 14 },

  // --- ITEM DE CHAT ---
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16172b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chatItemUnread: {
    backgroundColor: '#1c1e3a',
    borderColor: 'rgba(76, 201, 240, 0.3)',
  },

  // --- AVATAR ---
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  avatarUser: {
    backgroundColor: '#2d2e4a',
  },
  avatarSystem: {
    backgroundColor: '#f72585', // Rose néon pour l'admin
  },
  avatarUnreadBorder: {
    borderWidth: 2,
    borderColor: '#4cc9f0',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4ade80', // Vert flash
    borderWidth: 2,
    borderColor: '#16172b',
  },

  // --- CONTENU TEXTE ---
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  timeText: {
    color: '#666abc',
    fontSize: 12,
    fontWeight: '500',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsg: {
    color: '#8a8db0',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  lastMsgUnread: {
    color: '#fff',
    fontWeight: '600',
  },

  // --- BADGE ---
  unreadBadge: {
    backgroundColor: '#4cc9f0',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowColor: '#4cc9f0',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  unreadText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
  },
});

export default Conversations;