# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies (include devDependencies for build)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Compile TypeScript -> dist/
RUN npm run build


# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copy compiled app from builder
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3030

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
