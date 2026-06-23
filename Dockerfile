FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create uploads directory
RUN mkdir -p /tmp/uploads

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Copy frontend dependencies
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build frontend (vite only, skip tsc)
RUN npx vite build

# Back to backend
WORKDIR /app/backend

# Create uploads directory
RUN mkdir -p uploads

# HF Spaces requires port 7860
ENV PORT=7860
EXPOSE 7860

CMD ["npx", "ts-node", "src/index.ts"]
