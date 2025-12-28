# -----------------------------------------------------
# Base stage: install dependencies only
# -----------------------------------------------------
FROM node:22-alpine AS base

WORKDIR /usr/src/app

ARG APP_PORT=5173
ENV APP_PORT=$APP_PORT

# Copy dependency manifests only (layer cache friendly)
COPY ui/package.json ui/yarn.lock ./ui/
COPY shared/package.json ./shared/

# Install shared dependencies
WORKDIR /usr/src/app/shared
RUN yarn install --frozen-lockfile || yarn install

# Install UI dependencies
WORKDIR /usr/src/app/ui
RUN yarn install --frozen-lockfile

# -----------------------------------------------------
# Development stage (bind mounts provide source code)
# -----------------------------------------------------
FROM base AS development

ENV NODE_ENV=development
EXPOSE $APP_PORT

# IMPORTANT:
# - No COPY ui/ or shared/
# - shared is built by the shared-dev container
# - Vite consumes shared/dist via bind mount

WORKDIR /usr/src/app/ui
CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "5173"]

# -----------------------------------------------------
# Build stage (production compilation)
# -----------------------------------------------------
FROM base AS build

ENV NODE_ENV=production

# Copy full sources for build only
WORKDIR /usr/src/app
COPY ui ./ui
COPY shared ./shared

# Build shared first, then UI
RUN cd /usr/src/app/shared && yarn build
RUN cd /usr/src/app/ui && yarn build

# -----------------------------------------------------
# Production runtime stage (Nginx)
# -----------------------------------------------------
FROM nginx:1.27-alpine AS production

# Copy custom nginx config with caching headers
COPY ui/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /usr/src/app/ui/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
