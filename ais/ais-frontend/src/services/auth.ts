// Ключи для локального хранилища
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Функции для работы с токеном
export const setAuthToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// Функции для работы с пользователем
export const setUserData = (userData: any) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const getUserData = () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
};

// Проверка авторизации
export const isAuthenticated = (): boolean => {
    return !!getAuthToken();
};