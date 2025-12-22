# Multi-stage Dockerfile for NestJS API

# Base image: install dependencies and copy source
FROM node:22-alpine AS base
WORKDIR /usr/src/app

ARG APP_PORT=3000
ENV NODE_ENV=development
ENV APP_PORT=$APP_PORT

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Development stage: runs the NestJS dev server with hot reload
FROM base AS development
ENV NODE_ENV=development
EXPOSE $APP_PORT
CMD ["yarn", "start:dev"]

# Build stage: build the NestJS app
FROM base AS build
ENV NODE_ENV=production
RUN yarn build

# Production stage: run the compiled app with only production dependencies
FROM node:22-alpine AS production
WORKDIR /usr/src/app

ARG APP_PORT=3000
ENV NODE_ENV=production
ENV APP_PORT=$APP_PORT

# Copy package metadata and install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

# Copy built artifacts from the build stage
COPY --from=build /usr/src/app/dist ./dist

EXPOSE $APP_PORT
CMD ["yarn", "start:prod"]
