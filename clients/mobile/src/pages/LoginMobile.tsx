import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ButtonMobile } from '../components/ButtonMobile';
import { InputMobile } from '../components/InputMobile';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LoginMobile: React.FC = () => {
  const router = useRouter();

  return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <LinearGradient
                colors={['#6366f1', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoBadge}
            >
              <Ionicons
                  name="musical-notes-outline"
                  size={35}
                  color="white"
              />
            </LinearGradient>
            <Text style={styles.title}>Connectez-vous !</Text>
          </View>

        <InputMobile label="E-mail" placeholder="votre@email.com" icon="mail-outline" />
        <InputMobile label="Mot de passe" placeholder="••••••••" icon="lock-closed-outline" secureTextEntry />
        
        <Text style={styles.forgot}>Mot de passe oublié ?</Text>
        <ButtonMobile title="Se connecter" />

        <View style={styles.separator}>
          <View style={styles.line} /><Text style={styles.sepText}>OU</Text><View style={styles.line} />
        </View>

        <View style={styles.socialMedia}>
          <ButtonMobile variant="social">
            <Ionicons name="logo-google" size={24} color="#FFF" />
          </ButtonMobile>

          <ButtonMobile variant="social" style={{ marginHorizontal: 10 }}>
            <Ionicons name="logo-github" size={24} color="#FFF" />
          </ButtonMobile>

          <ButtonMobile variant="social">
            <Ionicons name="logo-facebook" size={24} color="#FFF" />
          </ButtonMobile>
        </View>

        <TouchableOpacity onPress={() => router.push('/register')} style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? <Text style={styles.link}>S'inscrire</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>


  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#13131a', justifyContent: 'center' },
  scroll: { padding: 25 },
  header: { alignItems: 'center' },
  logoBadge: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 16, marginTop: 5, marginBottom: 30 },
  forgot: { color: '#3b82f6', textAlign: 'right', marginBottom: 25 },
  footer: { alignItems: 'center' },
  footerText: { color: '#888' },
  link: { color: '#3b82f6', fontWeight: 'bold' },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: '#333' },
  sepText: { color: '#555', marginHorizontal: 10, fontSize: 12 },
  socialMedia: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default LoginMobile;