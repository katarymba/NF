import { API_BASE_URL } from '../services/api';

export async function validateApiEndpoints() {
    const endpoints = [
        '/api/products',
        '/api/stocks',
        '/api/warehouses',
        '/api/categories',
        '/api/supplies',
        '/api/stock-movements'
    ];

    console.log('Validating API endpoints...');

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            console.log(`${endpoint}: ${response.status} ${response.ok ? '✓' : '✗'}`);
        } catch (error) {
            console.error(`Error checking ${endpoint}:`, error);
        }
    }
}