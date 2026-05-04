import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {router} from "expo-router";

const apiClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 10000,
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
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync("userToken");
            router.replace("/login"); // mieux que push
        }
        return Promise.reject(error);
    }
);

export default apiClient;