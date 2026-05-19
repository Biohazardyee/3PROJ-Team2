import axios, {AxiosInstance, InternalAxiosRequestConfig} from "axios";

const apiClient: AxiosInstance = axios.create({
    baseURL: "http://localhost:3000/",
    timeout: 10000,
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;