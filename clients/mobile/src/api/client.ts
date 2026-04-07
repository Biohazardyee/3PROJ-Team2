import {useRouter } from "expo-router";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const router = useRouter();

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("userToken");
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export const getUserFeed = async (userId: string) => {
  const response = await apiClient.get(`/activities/feed/${userId}`);
  return response.data.feed;
};

export const createReview = async (reviewData: {
  user_id: string;
  media_id: string;
  rating: number;
  title: string;
  content: string;
}) => {
  const response = await apiClient.post('/reviews', reviewData);
  return response.data;
};

export default apiClient;