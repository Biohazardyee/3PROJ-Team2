import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import apiClient from '../api/client';
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

const DetailsConversations = () => {
  const { conversationId, userName } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (token) {
          const decoded: any = jwtDecode(token);
          setCurrentUserId(decoded.id);
        }
      } catch (e) {
        console.error("Erreur token:", e);
      }
    };
    getUserId();
  }, []);

  const fetchMessages = async () => {
    if (!conversationId) return;
    try {
      const response = await apiClient.get(`/messages/conversation/${conversationId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Erreur fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId && currentUserId) fetchMessages();
  }, [conversationId, currentUserId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !currentUserId) return;
    const messageData = {
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    };

    try {
      const response = await apiClient.post('/messages/add', messageData);
      setMessages((prev) => [response.data.message, ...prev]);
      setNewMessage('');
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error("Erreur envoi:", error);
    }
  };

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMine = item.sender_id === currentUserId;
    // Vérifie si le message suivant est du même auteur pour coller les bulles
    const isLastInGroup = index === 0 || messages[index - 1].sender_id !== item.sender_id;

    return (
      <View style={[
        styles.messageRow, 
        isMine ? styles.myMessageRow : styles.theirMessageRow,
        { marginBottom: isLastInGroup ? 15 : 4 }
      ]}>
        <View style={[
          styles.bubble, 
          isMine ? styles.myBubble : styles.theirBubble,
          isLastInGroup ? (isMine ? styles.myLast : styles.theirLast) : null
        ]}>
          <Text style={[styles.messageText, isMine ? styles.myText : styles.theirText]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, isMine ? styles.myTime : styles.theirTime]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
      >
        {/* HEADER ÉPURÉ */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={26} color="#4cc9f0" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
             <View style={styles.headerAvatar}>
                <Text style={styles.avatarText}>{(userName as string)?.substring(0,1).toUpperCase()}</Text>
             </View>
             <Text style={styles.headerTitle} numberOfLines={1}>{userName}</Text>
          </View>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="call-outline" size={22} color="#666abc" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingArea}><ActivityIndicator color="#4cc9f0" /></View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            inverted
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* ZONE DE SAISIE STYLE "CAPSULE" */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="add" size={24} color="#666abc" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor="#55577e"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            
            <TouchableOpacity 
              style={[styles.sendButton, !newMessage.trim() && styles.sendDisabled]} 
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons name="arrow-up" size={22} color={newMessage.trim() ? "#000" : "#333"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0c14' },
  loadingArea: { flex: 1, justifyContent: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#1e1f33',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2d2e4a', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  iconButton: { padding: 8 },

  // List
  listContent: { paddingHorizontal: 12, paddingBottom: 10 },
  messageRow: { flexDirection: 'row', width: '100%' },
  myMessageRow: { justifyContent: 'flex-end' },
  theirMessageRow: { justifyContent: 'flex-start' },

  // Bulles
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  myBubble: { backgroundColor: '#4361ee' },
  theirBubble: { backgroundColor: '#1e1f33' },
  
  // Effet de pointe sur le dernier message du groupe
  myLast: { borderBottomRightRadius: 2 },
  theirLast: { borderBottomLeftRadius: 2 },

  messageText: { fontSize: 15, lineHeight: 21 },
  myText: { color: '#fff' },
  theirText: { color: '#eee' },
  
  timeText: { fontSize: 9, marginTop: 2, opacity: 0.6 },
  myTime: { color: '#fff', alignSelf: 'flex-end' },
  theirTime: { color: '#8a8db0', alignSelf: 'flex-start' },

  // Input
  inputWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0b0c14',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16172b',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2d2e4a',
  },
  attachButton: { padding: 6 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#4cc9f0',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: { backgroundColor: '#2d2e4a' }
});

export default DetailsConversations;