import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Header from "@/src/components/Header";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import apiClient from "../api/client";
import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";

import ChatItem from "../components/ChatItem";

const SOCKET_URL = Constants.expoConfig?.extra?.apiUrl || "";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  user1: { username: string; role: string; profile_picture?: string | null };
  user2: { username: string; role: string; profile_picture?: string | null };
  messages: Message[];
  _count?: {
    messages: number;
  };
}

const Conversations = () => {
  const navigation = useNavigation<any>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const activeConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const token: string | null =
          await SecureStore.getItemAsync("userToken");
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

  const fetchConversations = async () => {
    if (!currentUserId) return;
    try {
      const response = await apiClient.get(
        `/conversations/user/${currentUserId}`,
      );
      setConversations(response.data.conversations || []);
    } catch (error: any) {
      console.error("Erreur Fetch Conversations:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      activeConversationIdRef.current = null;
      if (currentUserId) {
        fetchConversations();
      }
    }, [currentUserId]),
  );

  useEffect(() => {
    if (!currentUserId) return;

    const setupSocket = async () => {
      const token: string | null = await SecureStore.getItemAsync("userToken");
      if (!token) return;

      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
      });

      socketRef.current.on(
        "update_conversation_list",
        (newMessage: Message) => {
          setConversations((prev: Conversation[]): Conversation[] => {
            const convIndex: number = prev.findIndex(
              (c: Conversation): boolean => c.id === newMessage.conversation_id,
            );
            if (convIndex === -1) return prev;

            const newConvs = [...prev];

            const isCurrentlyReading =
              activeConversationIdRef.current === newMessage.conversation_id;
            const currentUnreadCount =
              newConvs[convIndex]._count?.messages || 0;

            newConvs[convIndex] = {
              ...newConvs[convIndex],
              messages: [newMessage],
              _count: {
                messages: isCurrentlyReading ? 0 : currentUnreadCount + 1,
              },
            };

            return newConvs.sort((a, b) => {
              const dateA = a.messages[0]
                ? new Date(a.messages[0].created_at).getTime()
                : 0;
              const dateB = b.messages[0]
                ? new Date(b.messages[0].created_at).getTime()
                : 0;
              return dateB - dateA;
            });
          });
        },
      );

      socketRef.current.on("conversation_marked_read", ({ conversationId }) => {
        setConversations((prev: Conversation[]): Conversation[] =>
          prev.map(
            (c: Conversation): Conversation =>
              c.id === conversationId ? { ...c, _count: { messages: 0 } } : c,
          ),
        );
      });
    };

    setupSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUserId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, [currentUserId]);

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#4cc9f0" />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4cc9f0"
          />
        }
      >
        <View style={styles.titleWrapper}>
          <Text style={styles.glitchTitleSub}>Messages</Text>
        </View>

        <TextInput
          placeholder="Rechercher..."
          placeholderTextColor="#666"
          style={styles.searchInput}
        />

        <View style={styles.chatList}>
          {conversations.map((conv: any) => {
            const otherUser =
              conv.user1_id === currentUserId ? conv.user2 : conv.user1;
            if (!otherUser) return null;

            const lastMsg =
              conv.messages && conv.messages.length > 0
                ? conv.messages[0]
                : null;
            const lastMsgDate: Date | null = lastMsg
              ? new Date(lastMsg.created_at)
              : null;

            const formattedTime: string =
              lastMsgDate && !isNaN(lastMsgDate.getTime())
                ? lastMsgDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

            return (
              <ChatItem
                key={conv.id}
                id={conv.id}
                name={otherUser.username}
                msg={lastMsg?.content || "Commencez la discussion..."}
                time={formattedTime}
                unread={conv._count?.messages || 0}
                initials={otherUser.username.substring(0, 2).toUpperCase()}
                isSystem={otherUser.role === "ADMIN"}
                onPress={async () => {
                  activeConversationIdRef.current = conv.id;

                  setConversations((prev: Conversation[]): Conversation[] =>
                    prev.map(
                      (c: Conversation): Conversation =>
                        c.id === conv.id
                          ? { ...c, _count: { messages: 0 } }
                          : c,
                    ),
                  );

                  try {
                    await apiClient.patch(`/conversations/${conv.id}/read`);
                  } catch (e) {
                    console.log("Erreur de marquage de lecture en BD :", e);
                  }

                  navigation.navigate("detailsConversations", {
                    conversationId: conv.id,
                    userName: otherUser.username,
                  });
                }}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b0c14",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  titleWrapper: {
    marginVertical: 30,
    paddingLeft: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#4cc9f0",
  },
  glitchTitleSub: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  searchInput: {
    backgroundColor: "#16172b",
    borderRadius: 20,
    padding: 18,
    color: "#fff",
    fontSize: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#2d2e4a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  chatList: { gap: 14 },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    position: "relative",
  },
  avatarUser: {
    backgroundColor: "#2d2e4a",
  },
  avatarSystem: {
    backgroundColor: "#f72585",
  },
  avatarUnreadBorder: {
    borderWidth: 2,
    borderColor: "#4cc9f0",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  onlineStatus: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4ade80",
    borderWidth: 2,
    borderColor: "#16172b",
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  userName: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  timeText: {
    color: "#666abc",
    fontSize: 12,
    fontWeight: "500",
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMsg: {
    color: "#8a8db0",
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  lastMsgUnread: {
    color: "#fff",
    fontWeight: "600",
  },

  // --- BADGE ---
  unreadBadge: {
    backgroundColor: "#4cc9f0",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    shadowColor: "#4cc9f0",
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  unreadText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "900",
  },
});

export default Conversations;
