FROM node:18-alpine

WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json package-lock.json ./
RUN npm ci

# Не копируем исходный код - он будет подключен через volume
# для поддержки горячей перезагрузки

EXPOSE 5174

# Запускаем в режиме разработки
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]