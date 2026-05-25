import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000, 
});

apiClient.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const token: string | null = await SecureStore.getItemAsync("userToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error): Promise<never> => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("userToken");
      router.replace("/login"); 
    }

    let errorMessage = "Erreur inconnue";

    if (error.response) {
      // Le serveur a répondu avec un code hors 2xx
      errorMessage = `Serveur: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      // La requête a été faite mais aucune réponse reçue (problème réseau/CORS)
      errorMessage = "Aucune réponse du serveur (Réseau/CORS ?)";
    } else {
      // Erreur de configuration
      errorMessage = error.message;
    }

    import('react-native').then(({ Alert }) => {
      Alert.alert("DEBUG API", errorMessage);
    });

    return Promise.reject(error);
  },
);

export default apiClient;
