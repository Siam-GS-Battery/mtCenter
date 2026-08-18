# syntax=docker/dockerfile:1

# ---------- Stage 1: build frontend ----------
FROM node:22-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_URL=""
RUN npx vite build

# ---------- Stage 2: build backend ----------
FROM node:22-slim AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ---------- Stage 3: production runtime ----------
FROM node:22-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 4000

CMD ["node", "dist/index.js"]
