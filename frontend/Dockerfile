# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copia manifests primeiro pra cache
COPY package.json ./
# Se tiver package-lock.json, melhor pra builds reproduzíveis
COPY package-lock.json* ./

RUN npm ci || npm install

# Agora copia o resto
COPY . .

# Build-time env (CRA precisa disso no build)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Gera build/ (CRA)
RUN npm run build

# ---------- run (nginx) ----------
FROM nginx:alpine

# Config de SPA + cache
COPY nginx.conf /etc/nginx/conf.d/default.conf

# CRA build output
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
