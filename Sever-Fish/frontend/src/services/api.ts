// Sever-Fish/frontend/src/services/api.ts
export const API_BASE_URL = 'http://localhost:8080/sever-ryba';

const API_ENDPOINTS = {
    auth: `${API_BASE_URL}/auth`,
    api: `${API_BASE_URL}/api`,
};

/**
 * Логин пользователя. Возвращает JWT токен.
 */
export async function login(username: string, password: string): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_ENDPOINTS.auth}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Ошибка авторизации');
    }
    const data = await response.json();
    return data.access_token;
}

/**
 * Регистрация нового пользователя (только для админа).
 */
export async function registerUser(
    user: { username: string; email: string; password: string },
    token: string
): Promise<any> {
    const response = await fetch(`${API_ENDPOINTS.auth}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(user),
    });

    if (!response.ok) {
        throw new Error('Ошибка регистрации пользователя');
    }
    return await response.json();
}

/**
 * Публичная регистрация пользователя
 */
export async function registerPublicUser(userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
}): Promise<any> {
    // Отладочная информация
    console.log("Регистрируем пользователя:", {
        username: userData.username,
        email: userData.email
    });

    try {
        // Отправляем запрос напрямую на бэкенд
        const response = await fetch("http://localhost:8000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: userData.username,
                email: userData.email,
                password: userData.password,
                password_confirm: userData.password_confirm,
                // Добавляем пустые поля, которые могут ожидаться сервером
                phone: "",
                full_name: userData.username
            }),
        });

        console.log('Статус ответа:', response.status);
        const responseText = await response.text();
        console.log('Текст ответа:', responseText);

        if (!response.ok) {
            let errorMessage = "Ошибка при регистрации";
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.detail || errorMessage;
            } catch (e) {
                errorMessage = responseText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            data = { message: "Пользователь успешно зарегистрирован" };
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Вход пользователя через телефон
 */
export async function loginWithPhone(phone: string, password: string): Promise<any> {
    console.log("Вход с телефоном:", phone);
    
    try {
        // Прямое подключение к бэкенду
        const response = await fetch("http://localhost:8000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                phone: phone,
                password: password
            }),
        });

        const responseText = await response.text();
        console.log('Ответ при входе:', responseText);

        if (!response.ok) {
            let errorMessage = "Ошибка при входе";
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.detail || errorMessage;
            } catch (e) {
                errorMessage = responseText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const data = JSON.parse(responseText);
        return { success: true, data };
    } catch (error) {
        console.error('Ошибка при входе:', error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Получение информации о текущем пользователе.
 */
export async function getCurrentUser(token: string): Promise<any> {
    const response = await fetch(`${API_ENDPOINTS.auth}/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения информации о пользователе');
    }
    return await response.json();
}

/**
 * Получение списка товаров (с возможностью фильтрации по категории).
 */
export async function getProducts(url: string = '/products'): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}${url}`);
    if (!response.ok) {
        throw new Error('Ошибка получения товаров');
    }
    return await response.json();
}

/**
 * Получение списка категорий.
 */
export async function getCategories(): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}/categories`);
    if (!response.ok) {
        throw new Error('Ошибка получения категорий');
    }
    return await response.json();
}

/**
 * Получение списка заказов для текущего пользователя.
 */
export async function getOrders(token: string): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения заказов');
    }
    return await response.json();
}

/**
 * Получение списка платежей для текущего пользователя.
 */
export async function getPayments(token: string): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}/payments`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения платежей');
    }
    return await response.json();
}

/**
 * Получение списка доставок для текущего пользователя.
 */
export async function getShipments(token: string): Promise<any[]> {
    const response = await fetch(`${API_ENDPOINTS.api}/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Ошибка получения доставок');
    }
    return await response.json();
}