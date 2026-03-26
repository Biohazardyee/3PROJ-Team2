import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { ButtonMobile } from "../components/ButtonMobile";
import { InputMobile } from "../components/InputMobile";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../api/client";

WebBrowser.maybeCompleteAuthSession();

const RegisterMobile: React.FC = () => {
  const router = useRouter();

  // State pour les champs du formulaire
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [favorite_band, setfavorite_band] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const searchTimeout = React.useRef<any>(null);

  const handleOAuth = async (provider: "google" | "discord") => {
    try {
      // 1. On génère l'URI de redirection (sera exp:// en dev et projetsupcontentmobile:// en prod)
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "projetsupcontentmobile",
      });

      console.log("🔗 L'app attend ce retour :", redirectUri);

      // 2. On envoie cette URI au backend dans l'URL
      // On ajoute &redirect_uri=... à la fin
      const authUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/oauth/auth/${provider}?platform=mobile&redirect_uri=${encodeURIComponent(redirectUri)}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
      );

      if (result.type === "success" && result.url) {
        // Ton code actuel pour extraire le token est très bien
        const url = new URL(result.url.replace("#", "?"));
        const token = url.searchParams.get("token");

        if (token) {
          console.log("✅ Token récupéré !");
          router.replace("/onboarding");
        }
      }
    } catch (error) {
      console.error("Erreur OAuth:", error);
      Alert.alert("Erreur", "La connexion a échoué.");
    }
  };

  const searchArtists = async (text: string) => {
    setfavorite_band(text);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.length > 2) {
      searchTimeout.current = setTimeout(async () => {
        try {
          const response = await apiClient.get(`/api/search?query=${text}`);
          const data = response.data;

          const albums = data.searchResults?.results?.albummatches?.album || [];

          const artistNames: string[] = albums.map((item: any) => item.artist);
          const uniqueArtists = [...new Set(artistNames)];

          const sortedArtists = uniqueArtists
            .map((name) => ({ name }))
            .sort((a, b) => {
              const aStartsWith = a.name
                .toLowerCase()
                .startsWith(text.toLowerCase());
              const bStartsWith = b.name
                .toLowerCase()
                .startsWith(text.toLowerCase());

              if (aStartsWith && !bStartsWith) return -1;
              if (!aStartsWith && bStartsWith) return 1;
              return a.name.localeCompare(b.name);
            })
            .slice(0, 8);

          setSuggestions(sortedArtists);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Erreur recherche:", error);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !username || !password || !favorite_band) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    setIsLoading(true);

    try {
      await apiClient.post("/users/signin", {
        email,
        username,
        password,
        favorite_band,
      });

      Alert.alert("Succès", "Votre compte a bien été créé !");
      router.push("/onboarding");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la création du compte.";
      Alert.alert("Erreur", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          {/* Logo */}
          <Image
            source={require("@/assets/images/logo.png")}
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
        <View style={{ zIndex: 1000 }}>
          <InputMobile
            label="Artiste préféré"
            placeholder="Ex: Daft Punk, Angèle..."
            icon="musical-note-outline"
            value={favorite_band}
            onChangeText={searchArtists}
            onFocus={() => favorite_band.length > 2 && setShowSuggestions(true)}
          />

          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ScrollView
                style={{ maxHeight: 200 }}
                keyboardShouldPersistTaps="handled"
              >
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setfavorite_band(item.name);
                      setShowSuggestions(false);
                    }}
                  >
                    <Text style={styles.suggestionText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <ButtonMobile
          title={isLoading ? "Création en cours..." : "Créer le compte"}
          style={{ marginTop: 10 }}
          onPress={handleRegister}
          disabled={isLoading}
        />

        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.sepText}>OU</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          <ButtonMobile variant="social" onPress={() => handleOAuth("google")}>
            <Ionicons name="logo-google" size={24} color="#FFF" />
          </ButtonMobile>

          <ButtonMobile
            variant="social"
            onPress={() => handleOAuth("discord")}
            style={{ marginHorizontal: 10 }}
          >
            <Ionicons name="logo-discord" size={24} color="#FFF" />
          </ButtonMobile>

          <ButtonMobile variant="social">
            <Ionicons name="logo-facebook" size={24} color="#FFF" />
          </ButtonMobile>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            Déjà un compte ? <Text style={styles.link}>Se connecter</Text>
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
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#888",
    fontSize: 14,
    marginTop: 5,
  },
  suggestionsContainer: {
    backgroundColor: "#2D2D3F",
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#3b82f6",
    overflow: "hidden",
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  suggestionText: {
    color: "#FFF",
    fontSize: 14,
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

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footer: {
    marginTop: 30,
    alignItems: "center",
  },

  footerText: {
    color: "#888",
  },

  link: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
});

export default RegisterMobile;
