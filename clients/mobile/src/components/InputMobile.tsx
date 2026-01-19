import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface InputProps {
  label: string;
  placeholder: string;
  icon: string;
  secureTextEntry?: boolean;
}

export const InputMobile: React.FC<InputProps> = ({ label, placeholder, icon, secureTextEntry }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.wrapper}>
      <Ionicons name={icon} size={20} color="#FFF" />
      <TextInput 
        style={styles.input} 
        placeholder={placeholder} 
        placeholderTextColor="#555"
        secureTextEntry={secureTextEntry}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { color: '#CCC', fontSize: 14, marginBottom: 8, marginLeft: 5 },
  wrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1c1c27', 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    height: 55,
    borderWidth: 1,
    borderColor: '#333'
  },
  input: { flex: 1, color: '#FFF', marginLeft: 10, fontSize: 16 }
});