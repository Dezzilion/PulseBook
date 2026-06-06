FROM node:20-alpine

WORKDIR /app

# Спочатку копіюємо тільки package файли (для кешування залежностей)
COPY package*.json ./

# Встановлюємо залежності
RUN npm ci

# Копіюємо весь вихідний код
COPY . .

EXPOSE 3000

# Для розробки використовуємо dev сервер
CMD ["npm", "run", "dev"]