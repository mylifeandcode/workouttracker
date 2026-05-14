### Stage 1 - Build
FROM node:22-alpine AS build
USER root
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN npm install -g @angular/cli
COPY . .
RUN npm run build

### Stage 2 - Serve with nginx
FROM nginx:stable-alpine
VOLUME /var/cache/nginx
COPY --from=build /app/dist/workout-tracker/browser /usr/share/nginx/html