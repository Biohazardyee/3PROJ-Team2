import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../../src/api/client";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  user: { username: string; id: string };
  likes_count: number;
  isLiked: boolean;
}

interface Review {
  id: string;
  content: string;
  created_at: string;
  user: { username: string; id: string };
  rating?: number;
  likes_count: number;
  isLiked: boolean;
}

export default function CommentsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [review, setReview] = useState<Review | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Gestion de l'affichage de l'input
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const fetchData = async () => {
    try {
      const [reviewRes, commentsRes] = await Promise.all([
        apiClient.get(`/reviews/${id}`),
        apiClient.get(`/review-comments/review/${id}`),
      ]);

      const reviewData = reviewRes.data.review || reviewRes.data;
      setReview(reviewData);

      setComments(commentsRes.data.comments || []);
    } catch (err) {
      console.error("Erreur fetch thread:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const orderedComments = useMemo(() => {
    const parents = comments.filter((c) => !c.parent_id);
    const result: Comment[] = [];
    parents.forEach((parent) => {
      result.push(parent);
      const replies = comments.filter((c) => c.parent_id === parent.id);
      result.push(...replies);
    });
    return result;
  }, [comments]);

  // --- ACTIONS ---

  const handleReplyToReview = () => {
    setReplyTo(null);
    setEditingComment(null);
    setNewComment("");
    setIsInputVisible(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment);
    setReplyTo(null);
    setNewComment(comment.content);
    setIsInputVisible(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      if (editingComment) {
        await apiClient.put(`/review-comments/${editingComment.id}`, {
          content: newComment,
        });
      } else {
        await apiClient.post(`/review-comments`, {
          review_id: id,
          content: newComment,
          parent_id: replyTo ? replyTo.id : null,
        });
      }

      setNewComment("");
      setReplyTo(null);
      setEditingComment(null);
      setIsInputVisible(false);

      const commentsRes = await apiClient.get(`/review-comments/review/${id}`);
      setComments(commentsRes.data.comments || []);
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'enregistrer votre message.");
    } finally {
      setSending(false);
    }
  };

  const handleToggleLikeReview = async () => {
    if (!review) return;

    // Sauvegarde de l'état actuel en cas d'erreur
    const previousState = { ...review };

    // Mise à jour locale immédiate (UI réactive)
    setReview({
      ...review,
      isLiked: !review.isLiked,
      likes_count: review.isLiked
        ? review.likes_count - 1
        : review.likes_count + 1,
    });

    try {
      const response = await apiClient.post(`/reviews/likes/toggle`, {
        review_id: review.id,
      });

    
      const { isLiked, likes_count } = response.data;
      setReview((prev) => (prev ? { ...prev, isLiked, likes_count } : null));
    } catch (error) {
      console.error("Erreur lors du like de la review", error);
      setReview(previousState);
      Alert.alert("Erreur", "Impossible de mettre à jour le like.");
    }
  };

  const handleToggleLike = async (commentId: string) => {
    try {
      const response = await apiClient.post(
        `/review-comments/${commentId}/toggle-like`,
      );
      const { isLiked, likes_count } = response.data;
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, isLiked, likes_count } : c,
        ),
      );
    } catch (error) {
      console.error("Erreur lors du like", error);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert("Supprimer", "Voulez-vous supprimer ce commentaire ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/review-comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
          } catch (err) {
            console.error(err);
          }
        },
      },
    ]);
  };

  // --- RENDU ---

  const renderHeader = () => {
    if (!review) return null;
    return (
      <View style={styles.originalReviewContainer}>
        <View style={styles.commentHeader}>
          <Text style={styles.originalUsername}>@{review.user?.username}</Text>
          <Text style={styles.date}>
            {new Date(review.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.originalContent}>{review.content}</Text>

        <View style={styles.commentActions}>
          <TouchableOpacity
            onPress={handleToggleLikeReview}
            style={styles.actionBtn}
          >
            <Ionicons
              name={review.isLiked ? "heart" : "heart-outline"}
              size={20}
              color={review.isLiked ? "#ec4899" : "#64748b"}
            />
            <Text
              style={[
                styles.actionLabel,
                review.isLiked && { color: "#ec4899" },
              ]}
            >
              {review.likes_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReplyToReview}
            style={styles.actionBtn}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#64748b" />
            <Text style={styles.actionLabel}>Répondre à la review</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />
        <Text style={styles.repliesCount}>{comments.length} Réponse(s)</Text>
      </View>
    );
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isReply = item.parent_id !== null;
    return (
      <View style={[styles.commentCard, isReply && styles.replyCard]}>
        {isReply && <View style={styles.threadLine} />}
        <View style={{ flex: 1 }}>
          <View style={styles.commentHeader}>
            <Text style={styles.username}>@{item.user?.username}</Text>
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity
              onPress={() => handleToggleLike(item.id)}
              style={styles.actionBtn}
            >
              <Ionicons
                name={item.isLiked ? "heart" : "heart-outline"}
                size={16}
                color={item.isLiked ? "#ec4899" : "#64748b"}
              />
              <Text
                style={[
                  styles.actionLabel,
                  item.isLiked && { color: "#ec4899" },
                ]}
              >
                {item.likes_count}
              </Text>
            </TouchableOpacity>

            {!isReply && (
              <TouchableOpacity
                onPress={() => {
                  setReplyTo(item);
                  setEditingComment(null);
                  setNewComment("");
                  setIsInputVisible(true);
                  setTimeout(() => inputRef.current?.focus(), 100);
                }}
                style={styles.actionBtn}
              >
                <Text style={styles.actionLabel}>Répondre</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => startEditing(item)}
              style={styles.actionBtn}
            >
              <Text style={styles.actionLabel}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDeleteComment(item.id)}
              style={styles.actionBtn}
            >
              <Ionicons name="trash-outline" size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ec4899" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={orderedComments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        renderItem={renderComment}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Soyez le premier à répondre !</Text>
        }
      />

      {isInputVisible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          style={styles.absoluteInputWrapper}
        >
          <View style={styles.replyHint}>
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>
              {editingComment
                ? "Modification de votre message"
                : replyTo
                  ? `Réponse à @${replyTo.user.username}`
                  : "Réponse au message de base"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsInputVisible(false);
                setReplyTo(null);
                setEditingComment(null);
                setNewComment("");
              }}
            >
              <Ionicons name="close-circle" size={22} color="#ec4899" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Écrivez votre message..."
              placeholderTextColor="#64748b"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, !newComment.trim() && { opacity: 0.5 }]}
              onPress={handlePostComment}
              disabled={sending || !newComment.trim()}
            >
              {sending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons
                  name={editingComment ? "checkmark" : "send"}
                  size={20}
                  color="white"
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f111a" },
  center: {
    flex: 1,
    backgroundColor: "#0f111a",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e2d",
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  listContent: { padding: 20, paddingBottom: 100 },
  originalReviewContainer: {
    backgroundColor: "#1a1d29",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: "#ec4899",
  },
  originalUsername: { color: "white", fontWeight: "bold", fontSize: 16 },
  originalContent: {
    color: "#e2e8f0",
    fontSize: 16,
    marginTop: 8,
    lineHeight: 22,
  },
  separator: { height: 1, backgroundColor: "#2d2d3f", marginVertical: 15 },
  repliesCount: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  commentCard: {
    backgroundColor: "#11131f",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e1e2d",
    flexDirection: "row",
  },
  replyCard: {
    marginLeft: 40,
    backgroundColor: "#0d0e17",
    borderColor: "#161826",
  },
  threadLine: {
    position: "absolute",
    left: -20,
    top: -15,
    bottom: "50%",
    width: 2,
    backgroundColor: "#2d2d3f",
    borderBottomLeftRadius: 10,
    borderLeftWidth: 2,
    borderColor: "#2d2d3f",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  username: { color: "#ec4899", fontWeight: "bold", fontSize: 13 },
  date: { color: "#475569", fontSize: 11 },
  commentText: { color: "#94a3b8", lineHeight: 20, fontSize: 14 },
  commentActions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 15,
    alignItems: "center",
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionLabel: { color: "#64748b", fontSize: 12, fontWeight: "600" },
  absoluteInputWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1d29",
    borderTopWidth: 1,
    borderTopColor: "#ec4899",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    paddingBottom: Platform.OS === "ios" ? 35 : 15,
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "white",
    backgroundColor: "#0f111a",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#ec4899",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  replyHint: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1e1e2d",
  },
  emptyText: { color: "#64748b", textAlign: "center", marginTop: 20 },
});
