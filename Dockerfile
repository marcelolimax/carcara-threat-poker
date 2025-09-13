# Stage 1: Build frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS build-backend
WORKDIR /app
COPY types.ts ./server/
COPY server/ ./server/
WORKDIR /app/server
RUN npm install
RUN npm run build

# Stage 3: Final image
FROM nginx:stable-alpine

# Install nodejs
RUN apk --no-cache add nodejs

# Copy frontend build
COPY --from=build-frontend /app/dist /usr/share/nginx/html

# Copy backend build
RUN mkdir -p /var/www/backend
COPY --from=build-backend /app/server/dist /var/www/backend/dist
COPY --from=build-backend /app/server/node_modules /var/www/backend/node_modules

# Copy nginx config and startup script
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose port for Cloud Run
EXPOSE 8080

# Start server
CMD ["/start.sh"]
