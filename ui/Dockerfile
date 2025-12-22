# Multi-stage Dockerfile for React/Vite UI

# Base image: install dependencies and copy source
FROM node:22-alpine AS base
WORKDIR /usr/src/app

ARG APP_PORT=5173
ENV NODE_ENV=development
ENV APP_PORT=$APP_PORT

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# Development stage: Vite dev server
FROM base AS development
ENV NODE_ENV=development
EXPOSE $APP_PORT
CMD ["sh", "-c", "yarn dev --host 0.0.0.0 --port $APP_PORT"]

# Build stage: generate static assets
FROM base AS build
ENV NODE_ENV=production
RUN yarn build

# Production stage: serve static files with Nginx
FROM nginx:1.27-alpine AS production

# Copy built assets from the build stage
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
