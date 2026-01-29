FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json nest-cli.json prisma.config.ts ./
COPY apps ./apps
COPY libs ./libs
COPY proto ./proto

RUN npm install
RUN npx prisma generate --schema apps/catalog-service/prisma/schema.prisma
RUN npm run build:catalog

FROM node:20-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /usr/src/app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/proto ./proto
COPY --from=builder /usr/src/app/apps/catalog-service/prisma ./prisma

CMD ["node", "dist/apps/catalog-service/main.js"]
