FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server/ ./server/
COPY dist/ ./dist/
COPY .env* ./

EXPOSE 3001

CMD ["node", "server/server.js"]
