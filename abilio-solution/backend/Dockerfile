FROM node:24-alpine AS admin_builder

WORKDIR /admin
COPY abilio-solution/admin/package*.json ./
RUN npm ci
COPY abilio-solution/admin/ ./
ENV VITE_BASE=/dashboard/
RUN npm run build

FROM node:24-alpine AS backend_builder

WORKDIR /backend
COPY abilio-solution/backend/package*.json ./
RUN npm ci
COPY abilio-solution/backend/ ./
RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
COPY abilio-solution/backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend_builder /backend/dist ./dist
COPY --from=admin_builder /admin/dist ./dist/admin-ui

COPY abilio-solution/backend/entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
