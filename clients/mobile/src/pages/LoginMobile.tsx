import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ButtonMobile } from '../components/ButtonMobile';
import { InputMobile } from '../components/InputMobile';

const LoginMobile: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 25 }}>
        <Text style={styles.title}>Bon retour !</Text>
        <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>

        <InputMobile label="E-mail" placeholder="votre@email.com" icon="email-outline" />
        <InputMobile label="Mot de passe" placeholder="••••••••" icon="lock-outline" secureTextEntry />
        
        <Text style={styles.forgot}>Mot de passe oublié ?</Text>
        <ButtonMobile title="Se connecter" />

        <TouchableOpacity onPress={() => router.push('/')} style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? <Text style={styles.link}>S'inscrire</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#13131a', justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 16, marginTop: 5, marginBottom: 30 },
  forgot: { color: '#3b82f6', textAlign: 'right', marginBottom: 25 },
  footer: { marginTop: 30, alignItems: 'center' },
  footerText: { color: '#888' },
  link: { color: '#3b82f6', fontWeight: 'bold' }
});

export default LoginMobile;