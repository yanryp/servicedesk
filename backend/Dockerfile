# BSG Helpdesk Backend Dockerfile

# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S helpdesk -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=helpdesk:nodejs /app/dist ./dist
COPY --from=builder --chown=helpdesk:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=helpdesk:nodejs /app/prisma ./prisma
COPY --from=builder --chown=helpdesk:nodejs /app/package*.json ./

# Create uploads and logs directories
RUN mkdir -p uploads logs && chown -R helpdesk:nodejs uploads logs

# Switch to non-root user
USER helpdesk

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["node", "dist/index.js"]