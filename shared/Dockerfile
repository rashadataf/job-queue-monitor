FROM node:22-alpine

WORKDIR /usr/src/app/shared

COPY package.json tsconfig*.json ./

RUN yarn install

CMD ["yarn", "dev"]