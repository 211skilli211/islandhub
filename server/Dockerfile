# Server Dockerfile - Production
FROM node:20-alpine

WORKDIR /app

# Install all dependencies (including dev for build)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --spider -q http://localhost:5001/health || exit 1

# Start application
CMD ["node", "dist/index.js"]
