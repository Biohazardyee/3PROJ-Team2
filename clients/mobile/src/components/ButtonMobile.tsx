import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'social';
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}


export const ButtonMobile: React.FC<ButtonProps> = ({ title, children, variant = 'primary', onPress, style, disabled }) => (
  <TouchableOpacity 
    activeOpacity={0.8} 
    style={[styles.base, variant === 'primary' ? styles.primary : styles.social, style]} 
    onPress={onPress}
    disabled={disabled}
  >
    {title ? <Text style={styles.text}>{title}</Text> : children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  base: { borderRadius: 15, justifyContent: 'center', alignItems: 'center', height: 55 },
  primary: { backgroundColor: '#3b82f6', width: '100%' },
  social: { backgroundColor: '#1c1c27', borderWidth: 1, borderColor: '#333', flex: 1 },
  text: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});