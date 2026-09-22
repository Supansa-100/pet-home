FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code and database initialization files
COPY src ./src
COPY db ./db

# Use non-root user for security
USER node

# Render automatically sets PORT environment variable, default 5001
EXPOSE 5001

CMD ["node", "src/server.js"]
