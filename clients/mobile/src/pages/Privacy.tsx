import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, ScrollView } from 'react-native';
import BackButton from '../components/BackButton';
import { useTheme } from '../context/ThemeContext';

const Privacy = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Confidentialité</Text>
        <View style={{ width: 45 }} /> 
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Collecte des données</Text>
          <Text style={[styles.paragraph, { color: theme.subText }]}>
            Toutes vos playlists et préférences sont stockées localement sur votre appareil. Nous ne collectons, ne vendons et ne partageons aucune de vos données musicales personnelles avec des tiers.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>2. Utilisation de l'application</Text>
          <Text style={[styles.paragraph, { color: theme.subText }]}>
            Les permissions demandées par l'application (comme l'accès au stockage ou au partage) servent uniquement à vous permettre d'exporter vos propres données de sauvegarde.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>3. Sécurité</Text>
          <Text style={[styles.paragraph, { color: theme.subText }]}>
            Puisque vos données ne quittent pas votre téléphone, leur sécurité dépend de la sécurité globale de votre appareil (code PIN, Face ID, etc.).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  content: { flex: 1, padding: 20 },
  card: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 40,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  paragraph: { fontSize: 15, lineHeight: 24 }
});

export default Privacy;