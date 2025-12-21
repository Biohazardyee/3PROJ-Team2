# =======================
#        BUILDER
# =======================
FROM node:20-alpine AS builder

WORKDIR /app

# Installer les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copier Prisma schema et générer le client dans "generated"
COPY prisma ./prisma
RUN npx prisma generate

# Copier le reste du code
COPY . .

# Build TypeScript (après génération du client)
RUN npm run build

# =======================
#       PRODUCTION
# =======================
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Copier node_modules, dist, prisma et generated
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/bin/www.js"]
