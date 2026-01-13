# Multi-stage Dockerfile for production-optimized build

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build application
ARG VITE_BLINK_PROJECT_ID
ARG VITE_BLINK_PUBLISHABLE_KEY
ARG VITE_SENTRY_DSN
ENV VITE_BLINK_PROJECT_ID=$VITE_BLINK_PROJECT_ID
ENV VITE_BLINK_PUBLISHABLE_KEY=$VITE_BLINK_PUBLISHABLE_KEY
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Install security updates
RUN apk upgrade --no-cache

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Create health endpoint
RUN echo '<!DOCTYPE html><html><head><title>Health</title></head><body>OK</body></html>' > /usr/share/nginx/html/health

# Expose port
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
