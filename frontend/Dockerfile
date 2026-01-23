# ========= BUILD =========
FROM node:20-alpine AS build
WORKDIR /app

# Copia manifests (melhor cache)
COPY package.json ./
COPY package-lock.json* ./
COPY yarn.lock* ./

# Instala deps (determinístico)
RUN corepack enable \
  && if [ -f yarn.lock ]; then \
       yarn install --frozen-lockfile; \
     else \
       npm ci --legacy-peer-deps; \
     fi

# Copia o restante do projeto
COPY . .

# Build args (CRA precisa de REACT_APP_* no build)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# (Opcional) evita CI falhar por warnings no build do CRA
# ENV CI=false

# Build
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi


# ========= RUNTIME =========
FROM nginx:alpine

# SPA fallback + cache
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
