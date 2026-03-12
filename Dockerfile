# STAGE 1: Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# STAGE 2: Production Stage
FROM node:20-alpine
WORKDIR /app

# Only copy the essential files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app . 

# Set environment to production
ENV NODE_ENV=production

EXPOSE 3000

# Use 'node' instead of 'nodemon' for production
CMD ["node", "server.js"]