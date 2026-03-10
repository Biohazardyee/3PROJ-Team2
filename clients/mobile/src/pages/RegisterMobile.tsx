import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Alert} from 'react-native';
import { ButtonMobile } from '../components/ButtonMobile';
import { InputMobile } from '../components/InputMobile';
import { Ionicons } from "@expo/vector-icons";

const RegisterMobile: React.FC = () => {
  const router = useRouter();

  // State pour les champs du formulaire
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async () => {
    // Vérification basique
    if (!email || !username || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('http://192.168.0.24:3000/users/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email: email,
        username: username,
        password: password,
        }),
      });

      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue lors de la création du compte.");
      }

      Alert.alert('Succès', 'Votre compte a bien été créé !');
      router.push('/onboarding'); 
    } 
    catch (error: any) {
      Alert.alert('Erreur', error.message);
    } 
    finally {
      setIsLoading(false);
    }
  };

  return (
  
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          {/* Logo */}
          <Image 
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage} 
          />
          <Text style={styles.title}>Créer votre compte</Text>
          <Text style={styles.subtitle}>Rejoignez la communauté musicale</Text>
        </View>

        <InputMobile
          label="E-mail"
          placeholder="votre@email.com"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <InputMobile 
          label="Nom d'utilisateur" 
          placeholder="fan" 
          icon="person-circle-outline" 
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <InputMobile 
          label="Mot de passe" 
          placeholder="••••••••" 
          icon="lock-closed-outline" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />

        <ButtonMobile 
          title={isLoading ? "Création en cours..." : "Créer le compte"}
          style={{ marginTop: 10 }} 
          onPress={handleRegister}
          disabled={isLoading}
        />

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
  logoImage : {
      width: 80,
      height: 80,   
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