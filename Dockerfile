# ==========================================
# Multi-Stage Production Dockerfile for ZenSpace
# Lightweight, Secure & Optimized (~25 MB)
# ==========================================

# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy sources and build production bundle
COPY . .
RUN npm run build

# 2. Production Stage (Nginx Alpine)
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Clean default files
RUN rm -rf ./*

# Copy built assets and custom nginx configuration
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
