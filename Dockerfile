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

# Create persistent directories and set ownership to node user
RUN mkdir -p /roms /bgm /data /app/dist /app/public && \
    chown -R node:node /roms /bgm /data /app

# Install only production dependencies
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

# Copy server, server helpers, and built static frontend from builder stage
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/server.js ./server.js
COPY --chown=node:node --from=builder /app/src/server ./src/server
COPY --chown=node:node --from=builder /app/public ./public

USER node

# Default volume mount points for ROMs, BGM, and persistent SQLite/JSON metadata
VOLUME ["/roms", "/bgm", "/data"]

EXPOSE 3000

CMD ["node", "server.js"]
