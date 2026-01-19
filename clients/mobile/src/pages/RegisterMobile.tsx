import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ButtonMobile } from '../components/ButtonMobile';
import { InputMobile } from '../components/InputMobile';

const RegisterMobile: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.logoBadge}><Text style={styles.logoText}>♪</Text></View>
          <Text style={styles.title}>Créer votre compte</Text>
          <Text style={styles.subtitle}>Rejoignez la communauté musicale</Text>
        </View>

        <InputMobile label="E-mail" placeholder="votre@email.com" icon="email-outline" />
        <InputMobile label="Nom d'utilisateur" placeholder="mélomane" icon="account-outline" />
        <InputMobile label="Mot de passe" placeholder="••••••••" icon="lock-outline" secureTextEntry />

        <ButtonMobile title="Créer le compte" style={{ marginTop: 10 }} />

        <View style={styles.separator}>
          <View style={styles.line} /><Text style={styles.sepText}>OU</Text><View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          <ButtonMobile variant="social"><Icon name="google" size={24} color="#FFF" /></ButtonMobile>
          <ButtonMobile variant="social" style={{ marginHorizontal: 10 }}><Icon name="github" size={24} color="#FFF" /></ButtonMobile>
          <ButtonMobile variant="social"><Icon name="facebook" size={24} color="#FFF" /></ButtonMobile>
        </View>

        <TouchableOpacity onPress={() => router.push('/login')} style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ? <Text style={styles.link}>Se connecter</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#13131a' },
  scroll: { padding: 25 },
  header: { alignItems: 'center', marginBottom: 30 },
  logoBadge: { width: 60, height: 60, backgroundColor: '#a855f7', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  logoText: { fontSize: 30, color: '#FFF' },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 14, marginTop: 5 },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: '#333' },
  sepText: { color: '#555', marginHorizontal: 10, fontSize: 12 },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between' },
  footer: { marginTop: 30, alignItems: 'center' },
  footerText: { color: '#888' },
  link: { color: '#3b82f6', fontWeight: 'bold' }
});

export default RegisterMobile;