# ========= BUILD =========
FROM node:20-alpine AS build
WORKDIR /

# Copia manifests primeiro (melhor cache)
COPY package.json ./
COPY package-lock.json* ./
COPY yarn.lock* ./

# Instala dependências + corrige conflito AJV (webpack/schema-utils)
RUN corepack enable \
  && if [ -f yarn.lock ]; then \
       yarn install --frozen-lockfile; \
       yarn add -D ajv@8.12.0 ajv-keywords@5.1.0; \
     else \
       npm install --legacy-peer-deps; \
       npm install --legacy-peer-deps -D ajv@8.12.0 ajv-keywords@5.1.0; \
     fi

# Copia o resto do código
COPY . .

# Build args (CRA precisa de REACT_APP_* no build)
ARG REACT_APP_BACKEND_URL
# Normaliza removendo "/" no final para evitar //api
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL%/}

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
