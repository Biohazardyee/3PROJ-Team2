import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type StatCardProps = {
  title: string;
  count?: string;
  icon: string;
  color: string;
  checked?: boolean; 
  onPress?: () => void; 
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  count, 
  icon, 
  color, 
  checked = false, 
  onPress 
}) => {

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.card,
        checked ? { borderColor: color, borderWidth: 1 } : { borderColor: '#2a2a35', borderWidth: 1 },
        { opacity: pressed ? 0.8 : 1 } 
      ]} 
      onPress={onPress}
    >
      <View style={styles.checkboxContainer}>
        <Icon 
          name={checked ? "checkbox-marked" : "checkbox-blank-outline"} 
          size={22} 
          color={checked ? color : "#8e8e93"} 
        />
      </View>

      <View style={styles.cardHeader}>
        <Icon name={icon} size={20} color={color} />
        {count && <Text style={styles.cardCount}>{count}</Text>}
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#2A2A38', 
    width: '48%', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15,
    minHeight: 90 
  },
  checkboxContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
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
    fontSize: 13,
    fontWeight: '600'
  },
});

export default StatCard;