import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Définition des types pour les props du composant
interface PlaylistCardProps {
  title: string;
  count: number;
  image: string;
  onPress?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ title, count, image, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.cardImage} />
      <Text style={styles.cardTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.cardCount}>
        {count} titres
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { 
    flex: 1, 
    margin: 8,
    marginBottom: 20,
    maxWidth: (width / 2) - 24
  },
  cardImage: { 
    width: '100%', 
    aspectRatio: 1, 
    borderRadius: 12,
    backgroundColor: '#2A2A38' 
  },
  cardTitle: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14,
    marginTop: 10 
  },
  cardCount: { 
    color: '#666', 
    fontSize: 12,
    marginTop: 2
  },
});

export default PlaylistCard;