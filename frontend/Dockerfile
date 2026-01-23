# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copia manifests primeiro (melhora cache)
COPY package.json ./
COPY yarn.lock* ./
COPY package-lock.json* ./

# Instala dependências (preferindo yarn se existir)
RUN corepack enable \
  && if [ -f yarn.lock ]; then \
       yarn install --frozen-lockfile; \
     else \
       npm install --legacy-peer-deps; \
     fi

# Copia o resto do projeto
COPY . .

# Variável usada pelo CRA (fica “embutida” no build)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build (CRA + craco -> gera /app/build)
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi


# ---------- RUN ----------
FROM nginx:alpine

# Config do nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build do React
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
