# Multi-stage Dockerfile for NestJS API

# Base image: install dependencies and copy source
FROM node:22-alpine AS base
WORKDIR /usr/src/app

ARG APP_PORT=3000
ENV APP_PORT=$APP_PORT

# Copy only manifests first (better layer caching)
COPY api/package.json api/yarn.lock ./api/
COPY shared/package.json ./shared/
COPY shared/tsconfig*.json ./shared/
COPY shared/src ./shared/src

# Install shared deps (no lockfile in shared/)
WORKDIR /usr/src/app/shared
RUN yarn install

# Install api deps (has yarn.lock)
WORKDIR /usr/src/app/api
RUN yarn install --frozen-lockfile

# Copy full sources
WORKDIR /usr/src/app
COPY api ./api
COPY shared ./shared

# Development stage: build+watch shared, run Nest watch
FROM base AS development
ENV NODE_ENV=development
EXPOSE $APP_PORT
WORKDIR /usr/src/app/api
CMD ["sh", "-c", "cd /usr/src/app/shared && yarn build && yarn dev & cd /usr/src/app/api && yarn start:dev"]

# Build stage
FROM base AS build
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN cd /usr/src/app/shared && yarn build
RUN cd /usr/src/app/api && yarn build

# Production stage
FROM node:22-alpine AS production
WORKDIR /usr/src/app

ARG APP_PORT=3000
ENV NODE_ENV=production
ENV APP_PORT=$APP_PORT

# Copy manifests + shared (needed because api depends on ../shared)
COPY api/package.json api/yarn.lock ./api/
COPY shared ./shared

WORKDIR /usr/src/app/api
RUN yarn install --frozen-lockfile --production=true

COPY --from=build /usr/src/app/api/dist ./dist

EXPOSE $APP_PORT
CMD ["yarn", "start:prod"]
