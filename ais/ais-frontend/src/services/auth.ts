// Ключи для локального хранилища
export const TOKEN_KEY = 'token'; // Обновлено, чтобы соответствовать App.tsx
export const USER_KEY = 'auth_user';

// Функции для работы с токеном
export const setAuthToken = (token: string) => {
    console.log("Сохраняем токен в localStorage:", token.substring(0, 10) + '...');
    localStorage.setItem(TOKEN_KEY, token);
    // Устанавливаем время сохранения токена для отладки
    localStorage.setItem('token_saved_at', new Date().toISOString());
};

export const getAuthToken = (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("Получаем токен из localStorage:", token ? `${token.substring(0, 10)}...` : "null");
    return token;
};

export const clearAuthToken = () => {
    console.log("Очищаем токен из localStorage");
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
    const token = getAuthToken();
    console.log("Проверка авторизации:", !!token);
    return !!token;
};