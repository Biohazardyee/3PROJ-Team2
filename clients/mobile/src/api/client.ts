import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import Constants from "expo-constants";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  Constants.manifest2?.extra?.expoClient?.extra?.apiUrl ||
  "https://doe-rational-bobcat.ngrok-free.app";

console.log("✅ API URL =", API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("userToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("❌ AXIOS ERROR =", error);

    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("userToken");
      router.replace("/login");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
