# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Build the NestJS project (creates /dist)
RUN npm run build


# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Copy only what’s needed for production
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3030

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
