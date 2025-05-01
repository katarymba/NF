import { AxiosRequestConfig } from 'axios';
import { apiClient } from './apiClient';

// Interceptor для добавления токена аутентификации
apiClient.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
