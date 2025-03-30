import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Найдем элемент root или создадим его, если он не существует
const rootElement = document.getElementById('root') || document.createElement('div');

// Если элемент был создан, добавим его в документ
if (!document.getElementById('root')) {
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
}

// Теперь безопасно монтируем приложение
ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)