FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VUE_APP_* variables are injected by Railway at build time
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve@14.2.4

COPY --from=build /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
