ARG NODE_VERSION=20.16.0

FROM node:${NODE_VERSION}-alpine AS build

ARG FIREBASE_PRIVATE_KEY_ID
ARG FIREBASE_PRIVATE_KEY
ARG FIREBASE_CLIENT_EMAIL
ARG FIREBASE_CLIENT_ID
ARG FIREBASE_CLIENT_X509_CERT_URL

RUN mkdir /app
WORKDIR /app

COPY package.json /app/
RUN npm install

COPY . /app
RUN --mount=type=secret,id=FIREBASE_PRIVATE_KEY_ID,env=FIREBASE_PRIVATE_KEY_ID \
    --mount=type=secret,id=FIREBASE_PRIVATE_KEY,env=FIREBASE_PRIVATE_KEY \
    --mount=type=secret,id=FIREBASE_CLIENT_EMAIL,env=FIREBASE_CLIENT_EMAIL \
    --mount=type=secret,id=FIREBASE_CLIENT_ID,env=FIREBASE_CLIENT_ID \
    --mount=type=secret,id=FIREBASE_CLIENT_X509_CERT_URL,env=FIREBASE_CLIENT_X509_CERT_URL \
    npm run build

FROM node:${NODE_VERSION}-alpine

EXPOSE 3001

WORKDIR /app

COPY --from=build /app .

CMD ["node", "dist/index.js"]