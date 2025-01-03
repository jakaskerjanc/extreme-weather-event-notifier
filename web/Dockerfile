ARG NODE_VERSION=20.16.0

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /home/node/web

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-alpine

RUN addgroup --gid 3000 --system somegroup \
    && adduser  --uid 2000 --system --ingroup somegroup someuser
USER 2000:3000

EXPOSE 3000

RUN mkdir /home/someuser/web/
WORKDIR /home/someuser/web

COPY --from=build /home/node/web/.output ./.output

CMD ["node",".output/server/index.mjs"]
