### Stage 1 - Using node image, copy package files to it, install packages, 
### copy over app files, build, and run test
#FROM node:12.14.1 as node
FROM zenika/alpine-chrome:86-with-node-12 as build
USER root
WORKDIR /app
#ENV PATH /app/node_modules/.bin:$PATH
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci
RUN npm install -g @angular/cli
COPY . .
RUN npm run build -- --prod
RUN npm run test-for-ci

### Stage 2 - Copy app files to nginx image
### This resolved an issue for me: https://forums.docker.com/t/strange-docker-output-or-help-me-please-im-very-noob/100788/2
FROM nginx:alpine
VOLUME /var/cache/nginx
COPY --from=build /app/dist /usr/share/nginx/html