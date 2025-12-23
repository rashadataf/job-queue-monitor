# Multi-stage Dockerfile for React/Vite UI (with ../shared support)

FROM node:22-alpine AS base
WORKDIR /usr/src/app

ARG APP_PORT=5173
ENV APP_PORT=$APP_PORT

# Copy only manifests first (better layer caching)
COPY ui/package.json ui/yarn.lock ./ui/
COPY shared/package.json ./shared/
COPY shared/tsconfig*.json ./shared/
COPY shared/src ./shared/src

# Install shared deps (no lockfile in shared/)
WORKDIR /usr/src/app/shared
RUN yarn install

# Install ui deps (has yarn.lock)
WORKDIR /usr/src/app/ui
RUN yarn install --frozen-lockfile

# Copy full sources
WORKDIR /usr/src/app
COPY ui ./ui
COPY shared ./shared

# Development stage: build+watch shared, run Vite
FROM base AS development
ENV NODE_ENV=development
EXPOSE $APP_PORT
WORKDIR /usr/src/app/ui
CMD ["sh", "-c", "cd /usr/src/app/shared && yarn build && yarn dev & cd /usr/src/app/ui && yarn dev --host 0.0.0.0 --port $APP_PORT"]

# Build stage
FROM base AS build
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN cd /usr/src/app/shared && yarn build
RUN cd /usr/src/app/ui && yarn build

# Production stage: serve static files with Nginx
FROM nginx:1.27-alpine AS production
COPY --from=build /usr/src/app/ui/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]