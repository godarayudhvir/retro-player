# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV ROMS_DIR=/roms
ENV BGM_DIR=/bgm
ENV DATA_DIR=/data
ENV INCLUDE_DEMO_ROMS=true
ENV INCLUDE_DEMO_BGM=true
ENV AUTO_SEED_DEMOS=false

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server and built static frontend from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/public ./public

# Default volume mount points for ROMs, BGM, and persistent SQLite/JSON metadata
VOLUME ["/roms", "/bgm", "/data"]

EXPOSE 3000

CMD ["node", "server.js"]
