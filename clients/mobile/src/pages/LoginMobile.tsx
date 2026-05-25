import { Router, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import { ButtonMobile } from "../components/ButtonMobile";
import { InputMobile } from "../components/InputMobile";
import * as AuthSession from "expo-auth-session";
import Ionicons from "react-native-vector-icons/Ionicons";
import apiClient from "../api/client";
import { WebBrowserAuthSessionResult } from "expo-web-browser";

const LoginMobile: React.FC = () => {
  const router: Router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthLogin: (
    provider: "discord" | "google",
  ) => Promise<void> = async (
    provider: "google" | "discord",
  ): Promise<void> => {
    try {
      const redirectUri: string = AuthSession.makeRedirectUri({
        scheme: "projetsupcontentmobile",
        preferLocalhost: false,
      });

      const authUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/oauth/auth/${provider}?platform=mobile&redirect_uri=${encodeURIComponent(redirectUri)}`;

      const result: WebBrowserAuthSessionResult =
        await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === "success" && result.url) {
        const urlParts: string[] = result.url.split("token=");
        if (urlParts.length > 1) {
          const token: string = urlParts[1].split("&")[0];

          await SecureStore.setItemAsync("userToken", token);
          const decoded: any = jwtDecode(token);
          const userId = decoded.id;

          if (userId) {
            await SecureStore.setItemAsync("userId", String(userId));
          }

          router.replace("/");
        }
      }
    } catch (error) {
      console.log("DEBUG: Erreur complète", error); 
      Alert.alert("ERREUR CRITIQUE", JSON.stringify(error));
      setIsLoading(false);

    //   Alert.alert("Erreur", "La connexion a échoué.");
    }
  };

  const handleLogin: () => Promise<void> = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post("/users/login", {
        email,
        password,
      });

      const token = response.data.token;
      await SecureStore.setItemAsync("userToken", token);

      try {
        const decoded: any = jwtDecode(token);
        // Selon ton backend, l'id est souvent dans 'sub' ou 'id'
        const userId = decoded.id || decoded.sub;

        if (userId) {
          await SecureStore.setItemAsync("userId", String(userId));
        }
      } catch (decodeError) {
        console.error("Erreur décodage token:", decodeError);
      }
      Alert.alert("Succès", "Connexion réussie !");
      router.replace("/");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Identifiants incorrects";
      Alert.alert("Erreur", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.title}>Connectez-vous !</Text>
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
          label="Mot de passe"
          placeholder="••••••••"
          icon="lock-closed-outline"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.forgot}>Mot de passe oublié ?</Text>
        <ButtonMobile
          title="Se connecter"
          onPress={handleLogin}
          disabled={isLoading}
        />

        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.sepText}>OU</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialMedia}>
          <ButtonMobile
            variant="social"
            onPress={() => handleOAuthLogin("google")}
          >
            <Ionicons name="logo-google" size={24} color="#FFF" />
          </ButtonMobile>

          <ButtonMobile
            variant="social"
            onPress={() => handleOAuthLogin("discord")}
            style={{ marginHorizontal: 10 }}
          >
            <Ionicons name="logo-discord" size={24} color="#FFF" />
          </ButtonMobile>

          <ButtonMobile variant="social">
            <Ionicons name="logo-facebook" size={24} color="#FFF" />
          </ButtonMobile>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            Pas encore de compte ? <Text style={styles.link}>S'inscrire</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C28",
  },

  scroll: {
    padding: 25,
    marginTop: 30,
  },

  header: {
    alignItems: "center",
  },

  logoImage: {
    width: 80,
    height: 80,
  },

  title: {
    color: "#FFF",
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    color: "#888",
    fontSize: 16,
    marginTop: 5,
    marginBottom: 30,
  },

  forgot: {
    color: "#3b82f6",
    textAlign: "right",
    marginBottom: 25,
  },

  footer: {
    alignItems: "center",
    marginTop: 20,
  },

  footerText: {
    color: "#888",
    marginBottom: 20,
  },

  link: {
    color: "#3b82f6",
    fontWeight: "bold",
  },

  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },

  sepText: {
    color: "#555",
    marginHorizontal: 10,
    fontSize: 12,
  },

  socialMedia: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default LoginMobile;
