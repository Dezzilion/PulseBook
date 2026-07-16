FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3002

CMD ["sh", "-c", "npx prisma db push && npm start"]