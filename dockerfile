# Etapa 1: Build
FROM node:18-bullseye-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copiamos el resto del código y el .env.production
COPY . .
COPY .env.production .env.production

RUN npm run build

# Etapa 2: Runtime
FROM node:18-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./ 
COPY --from=builder /app/node_modules ./node_modules 
COPY --from=builder /app/.next ./.next 
COPY --from=builder /app/public ./public 
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000
CMD ["npm", "start"]
