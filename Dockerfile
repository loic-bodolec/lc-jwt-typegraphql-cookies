FROM node:alpine AS deps

WORKDIR /app
COPY package.json package.json
RUN npm i

FROM node:alpine AS serve

WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY src src
CMD npm run serve

FROM node:alpine AS build

WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY src src
RUN npm run build

FROM node:alpine AS main

WORKDIR /app
COPY --from=build /app/build build
COPY package.json package.json
RUN npm i --only=production
CMD node build/index.js