import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type BackButtonProps = {
  style?: ViewStyle;
}

const BackButton = ({ style }: BackButtonProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={() => router.back()}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={30} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22.5,
  },
});

export default BackButton;