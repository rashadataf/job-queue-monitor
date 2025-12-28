# Multi-stage Dockerfile for NestJS API
# -----------------------------------------------------
# Base stage: install dependencies only
# -----------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /usr/src/app

ARG APP_PORT=3000
ENV APP_PORT=$APP_PORT

# Copy dependency manifests only (max layer cache)
COPY api/package.json api/yarn.lock ./api/
COPY shared/package.json ./shared/

# Install shared dependencies
WORKDIR /usr/src/app/shared
RUN yarn install --frozen-lockfile || yarn install

# Install api dependencies
WORKDIR /usr/src/app/api
RUN yarn install --frozen-lockfile

# -----------------------------------------------------
# Development stage (bind mounts provide source code)
# -----------------------------------------------------
FROM base AS development

ENV NODE_ENV=development
EXPOSE $APP_PORT

# IMPORTANT:
# - No COPY of api/ or shared/
# - Source code comes from bind mounts
# - shared is built via external watch process

WORKDIR /usr/src/app/api
CMD ["yarn", "start:dev"]

# -----------------------------------------------------
# Build stage (production compilation)
# -----------------------------------------------------
FROM base AS build

ENV NODE_ENV=production

# Copy full sources for build only
WORKDIR /usr/src/app
COPY api ./api
COPY shared ./shared

# Build shared first (api depends on it)
RUN cd /usr/src/app/shared && yarn build
RUN cd /usr/src/app/api && yarn build

# -----------------------------------------------------
# Production runtime stage
# -----------------------------------------------------
FROM node:22-alpine AS production

WORKDIR /usr/src/app

ARG APP_PORT=3000
ENV NODE_ENV=production
ENV APP_PORT=$APP_PORT

# Copy only what is needed at runtime
COPY api/package.json api/yarn.lock ./api/
COPY shared/package.json ./shared/

WORKDIR /usr/src/app/api
RUN yarn install --frozen-lockfile --production=true

COPY --from=build /usr/src/app/api/dist ./dist

WORKDIR /usr/src/app/shared
RUN yarn install --production=true

COPY --from=build /usr/src/app/shared/dist ./dist

EXPOSE $APP_PORT
CMD ["yarn", "start:prod"]
