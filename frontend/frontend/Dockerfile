# ========= BUILD =========
FROM node:20-alpine AS build
WORKDIR /app

# Copia manifests primeiro (melhor cache)
COPY package.json ./
COPY package-lock.json* ./

# Instala dependências
RUN corepack enable \
  && if [ -f yarn.lock ]; then \
       yarn install --frozen-lockfile; \
     else \
       npm install --legacy-peer-deps; \
     fi

# Copia o resto do código
COPY . .

# Build args (CRA precisa de REACT_APP_* no build)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build (CRA+CRACO => /app/build)
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

# ========= RUNTIME =========
FROM nginx:alpine

# SPA fallback + cache estático (você vai criar esse arquivo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
