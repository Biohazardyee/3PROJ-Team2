import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ButtonMobile } from '../components/ButtonMobile';
import { InputMobile } from '../components/InputMobile';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";

const RegisterMobile: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
        <LinearGradient
          colors={['#6366f1', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
         >
          <Ionicons
              name="musical-notes-outline"
              size={35}
              color="white"
           />
        </LinearGradient>
          <Text style={styles.title}>Créer votre compte</Text>
          <Text style={styles.subtitle}>Rejoignez la communauté musicale</Text>
        </View>

        <InputMobile label="E-mail" placeholder="votre@email.com" icon="mail-outline" />
        <InputMobile label="Nom d'utilisateur" placeholder="fan" icon="person-circle-outline" />
        <InputMobile label="Mot de passe" placeholder="••••••••" icon="lock-closed-outline" secureTextEntry />

        <ButtonMobile title="Créer le compte" style={{ marginTop: 10 }} onPress={() => router.push('/onboarding' as any)} />

        <View style={styles.separator}>
          <View style={styles.line} /><Text style={styles.sepText}>OU</Text><View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
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

        <TouchableOpacity onPress={() => router.push('/login')} style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ? <Text style={styles.link}>Se connecter</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C28'
  },

  scroll: {
    padding: 25
  },

  header: {
    alignItems: 'center',
    marginBottom: 30
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },

  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold'
  },

  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 5
  },

  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#333'
  },

  sepText: {
    color: '#555',
    marginHorizontal: 10,
    fontSize: 12
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  footer: {
    marginTop: 30,
    alignItems: 'center'
  },

  footerText: {
    color: '#888'
  },

  link: {
    color: '#3b82f6',
    fontWeight: 'bold'
  }

});

export default RegisterMobile;