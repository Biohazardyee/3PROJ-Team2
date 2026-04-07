import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type StatCardProps = {
  title: string;
  count?: string;
  icon: string;
  color: string;
  showCheckbox?: boolean;
  initialChecked?: boolean;
  onPress?: (checked: boolean) => void;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  icon,
  color,
  showCheckbox = false,
  initialChecked = false,
  onPress,
}) => {
  const [checked, setChecked] = useState(initialChecked);

  const handlePress = () => {
    const newCheckedStatus = !checked;
    setChecked(newCheckedStatus);
    if (onPress) {
      onPress(newCheckedStatus);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        checked && showCheckbox
          ? { borderColor: color, borderWidth: 1 }
          : { borderColor: "#2a2a35", borderWidth: 1 },
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={handlePress}
    >
      {showCheckbox && (
        <View style={styles.checkboxContainer}>
          <Icon
            name={checked ? "checkbox-marked" : "checkbox-blank-outline"}
            size={22}
            color={checked ? color : "#8e8e93"}
          />
        </View>
      )}
      <View style={styles.cardHeader}>
        <Icon name={icon} size={20} color={color} />
        <Text style={styles.cardCount}>{count}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2A2A38",
    width: "48%",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  checkboxContainer: {
    position: "absolute",
    top: 12,
    left: 120,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardCount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  cardTitle: {
    color: "#8e8e93",
    marginTop: 10,
    fontSize: 13,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "#1C1C28",
    borderRadius: 2,
    marginTop: 10,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
});

export default StatCard;
