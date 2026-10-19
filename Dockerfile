# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json .npmrc ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/emulator/package.json ./packages/emulator/
COPY packages/gateway/package.json ./packages/gateway/
COPY packages/generator/package.json ./packages/generator/
RUN npm ci

FROM deps AS build
COPY . .
# URL'ы для браузера на хосте (не имена docker-сервисов)
ARG VITE_API_URL=http://localhost:5050
ARG VITE_SOCKET_URL=http://localhost:5050
ENV VITE_API_URL=$VITE_API_URL \
    VITE_SOCKET_URL=$VITE_SOCKET_URL
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json /app/.npmrc ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps ./apps
COPY --from=build /app/packages ./packages
COPY --from=build /app/turbo.json ./turbo.json

FROM nginx:1.27-alpine AS web
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
