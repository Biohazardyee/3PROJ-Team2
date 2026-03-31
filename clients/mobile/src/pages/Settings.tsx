import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../components/BackButton'; 


type SettingRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  type?: 'link' | 'switch' | 'action';
  value?: boolean;
  onValueChange?: (val: boolean) => void;
  onPress?: () => void;
  danger?: boolean; 
};

const SettingRow = ({ icon, title, subtitle, type = 'link', value, onValueChange, onPress, danger }: SettingRowProps) => (
  <TouchableOpacity 
    style={styles.row} 
    onPress={onPress} 
    disabled={type === 'switch'} 
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, danger && { backgroundColor: 'rgba(255, 77, 77, 0.1)' }]}>
      <Ionicons name={icon} size={22} color={danger ? '#FF4D4D' : '#6C5CE7'} />
    </View>
    
    <View style={styles.rowTextContainer}>
      <Text style={[styles.rowTitle, danger && { color: '#FF4D4D' }]}>{title}</Text>
      {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
    </View>

    {type === 'link' && <Ionicons name="chevron-forward" size={20} color="#555" />}
    {type === 'switch' && (
      <Switch
        trackColor={{ false: '#3e3e3e', true: '#6C5CE7' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
        onValueChange={onValueChange}
        value={value}
      />
    )}
  </TouchableOpacity>
);


const Settings = () => {
  const router = useRouter();
  
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

 
  const handleExportData = () => {
    Alert.alert(
      "Exporter les données",
      "Vos playlists et préférences vont être compilées. Un fichier vous sera envoyé par email.",
      [{ text: "OK", style: "default" }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter de votre compte ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Se déconnecter", 
          style: "destructive", 
          onPress: async () => {
            
            Alert.alert("Succès", "Vous avez été déconnecté avec succès.");
            // router.replace('/login'); // Redirection vers la page de connexion
          } 
        }
      ]
    );
  };

  const notImplemented = (feature: string) => {
    Alert.alert("En cours", `La page ${feature} sera bientôt disponible !`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 45 }} /> 
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* SECTION : PROFIL */}
        <Text style={styles.sectionTitle}>Mon Compte</Text>
        <View style={styles.section}>
          <SettingRow 
            icon="person-outline" 
            title="Modifier le profil" 
            subtitle="Nom, Email, Mot de passe"
            onPress={() => notImplemented("Profil")} 
          />
        </View>

        {/* SECTION : PRÉFÉRENCES */}
        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.section}>
          <SettingRow 
            icon="moon-outline" 
            title="Mode Sombre" 
            type="switch" 
            value={isDarkMode} 
            onValueChange={setIsDarkMode} 
          />
          <SettingRow 
            icon="notifications-outline" 
            title="Notifications" 
            subtitle="Nouveautés et alertes"
            type="switch" 
            value={notifications} 
            onValueChange={setNotifications} 
          />
          <SettingRow 
            icon="language-outline" 
            title="Langue" 
            subtitle="Français"
            onPress={() => notImplemented("Langues")} 
          />
        </View>

        {/* SECTION : DONNÉES & SÉCURITÉ */}
        <Text style={styles.sectionTitle}>Données & Confidentialité</Text>
        <View style={styles.section}>
          <SettingRow 
            icon="shield-checkmark-outline" 
            title="Confidentialité" 
            onPress={() => notImplemented("Confidentialité")} 
          />
          <SettingRow 
            icon="download-outline" 
            title="Exporter mes données" 
            type="action"
            onPress={handleExportData} 
          />
        </View>

        {/* SECTION : DANGER */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <SettingRow 
            icon="log-out-outline" 
            title="Se déconnecter" 
            type="action"
            danger={true}
            onPress={handleLogout} 
          />
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1C1C28' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 25 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 15,
    backgroundColor: '#1C1C28',
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 22, 
    fontWeight: 'bold', 
    flex: 1, 
    textAlign: 'center' 
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 25,
    marginBottom: 10,
    marginLeft: 5,
  },
  section: {
    backgroundColor: '#2A2A38',
    borderRadius: 15,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(108, 92, 231, 0.1)', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  rowSubtitle: {
    color: '#AAA',
    fontSize: 13,
    marginTop: 2,
  },
  versionText: {
    color: '#555',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
    fontSize: 14,
  }
});

export default Settings;