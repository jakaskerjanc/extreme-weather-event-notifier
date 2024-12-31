ARG NODE_VERSION=20.16.0

FROM node:${NODE_VERSION}-alpine AS build

RUN mkdir /app
WORKDIR /app

COPY package.json /app/
RUN npm install

COPY . /app
RUN npm run build

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

COPY --from=build /app .

CMD ["node", "dist/index.js"]