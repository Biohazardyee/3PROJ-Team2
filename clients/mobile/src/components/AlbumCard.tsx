import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AlbumCardProps = {
  title: string;
  artist: string;
  rating: string;
  year: string;
  genre: string;
  cover: string;
};

const AlbumCard: React.FC<AlbumCardProps> = ({ title, artist, rating, year, genre, cover }) => {
  return (
    <View style={styles.albumCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: cover }} style={styles.albumImage} />
        <View style={styles.genreBadge}>
          <Text style={styles.genreText}>{genre}</Text>
        </View>
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.albumArtist}>{artist}</Text>
        <View style={styles.albumFooter}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color="#ec4899" /> 
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
          <Text style={styles.yearText}>{year}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  albumCard: {
    width: '48%',
    backgroundColor: '#1c1c27',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a35',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative'
  },
  albumImage: {
    height: '100%',
    width: '100%'
  },
  genreBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF006E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genreText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  albumInfo: {
    padding: 12
  },
  albumTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15
  },
  albumArtist: {
    color: '#888',
    fontSize: 12,
    marginTop: 2
  },
  albumFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  yearText: {
    color: '#555',
    fontSize: 12
  }
});

export default AlbumCard;