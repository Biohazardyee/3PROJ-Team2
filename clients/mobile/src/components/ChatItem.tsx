import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const ChatItem = ({
  id,
  name,
  msg,
  time,
  unread,
  initials,
  isSystem,
  onPress,
  image,
}: any) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [image]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.chatItem, unread > 0 && styles.chatItemUnread]}
      onPress={onPress}
    >
      {/* Conteneur Avatar */}
      <View
        style={[
          styles.avatarCircle,
          isSystem ? styles.avatarSystem : styles.avatarUser,
          unread > 0 && styles.avatarUnreadBorder,
        ]}
      >
        {/* On affiche l'image seulement si elle existe ET qu'il n'y a pas d'erreur */}
        {image && !hasError ? (
          <Image
            source={image}
            style={styles.avatarImage}
            resizeMode="cover"
            resizeMethod="resize" 
            onError={() => setHasError(true)} 
          />
        ) : (
          <Text style={styles.avatarText}>{initials}</Text>
        )}
        <View style={styles.onlineStatus} />
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>

        <View style={styles.chatFooter}>
          <Text
            style={[styles.lastMsg, unread > 0 && styles.lastMsgUnread]}
            numberOfLines={1}
          >
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
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#16172b",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  chatItemUnread: {
    backgroundColor: "#1c1e3a",
    borderColor: "rgba(76, 201, 240, 0.3)",
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    position: "relative",
    overflow: "hidden",
  },
  avatarImage: {
    width: 60,
    height: 60,
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
  chatInfo: { flex: 1 },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  userName: { color: "#ffffff", fontWeight: "700", fontSize: 17 },
  timeText: { color: "#666abc", fontSize: 12, fontWeight: "500" },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMsg: { color: "#8a8db0", fontSize: 14, flex: 1, marginRight: 10 },
  lastMsgUnread: { color: "#fff", fontWeight: "600" },
  unreadBadge: {
    backgroundColor: "#4cc9f0",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: { color: "#000", fontSize: 11, fontWeight: "900" },
});

export default ChatItem;
