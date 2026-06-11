import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 60000,
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

      setTimeout(() => {
        try {
          router.replace("/login");
        } catch (navError) {
          console.error("Échec de la redirection automatique 401:", navError);
        }
      }, 0);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
