import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type StatCardProps = {
  title: string;
  count: string;
  icon: string;
  color: string;
  progress: number;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon, color, progress, onPress }) => {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.8 : 1 } 
      ]} 
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Icon name={icon} size={20} color={color} />
        <Text style={styles.cardCount}>{count}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.progressBarBg}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${progress}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#2A2A38', 
    width: '48%', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardCount: { 
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff' 
  },
  cardTitle: { 
    color: '#8e8e93', 
    marginTop: 10,
    fontSize: 13
  },
  progressBarBg: { 
    height: 4, 
    backgroundColor: '#1C1C28', 
    borderRadius: 2, 
    marginTop: 10 
  },
  progressBarFill: { 
    height: 4, 
    borderRadius: 2 
  },
});

export default StatCard;