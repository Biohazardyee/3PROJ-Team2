import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type AlbumCardProps = {
  id: string | number;
  title: string;
  artist: string;
  rating: string;
  genre?: string;
  cover: string;
};

const AlbumCard: React.FC<AlbumCardProps> = ({
  id,
  title,
  artist,
  rating,
  cover,
}) => {
  const router = useRouter();

  // Conversion de la note en nombre (car elle vient de ton Float Prisma)
  const numericRating =
    typeof rating === "string" ? parseFloat(rating) : rating;

  return (
    <TouchableOpacity
      style={styles.albumCard}
      onPress={() =>
        router.push({
          pathname: "/albumdetails",
          params: { id, artist, album: title },
        })
      }
    >
      <View>
        <Image source={{ uri: cover }} style={styles.albumCover} />
      </View>

      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {artist}
        </Text>

        <View style={styles.albumFooter}>
          <View style={styles.starsRow}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={12}
                // Logique : si numericRating est 3.5, les étoiles 0, 1, 2 sont pleines
                color={
                  i < Math.floor(numericRating || 0) ? "#ec4899" : "#374151"
                }
              />
            ))}
            {numericRating > 0 && (
              <Text style={styles.ratingText}>{numericRating.toFixed(1)}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  albumCard: {
    width: "48%",
    backgroundColor: "#1c1c27",
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2a2a35",
  },
  albumCover: {
    width: "100%",
    height: 150,
  },
  genreBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ec4899",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genreText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  albumInfo: {
    padding: 12,
  },
  albumTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  artistName: {
    color: "#94a3b8",
    fontSize: 14,
  },
  albumFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 5,
  },
  ratingText: {
    color: "#ec4899",
    fontSize: 11,
    fontWeight: "bold",
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});

export default AlbumCard;
