FROM node:12-alpine

WORKDIR /www

COPY www/package.json www/yarn.lock ./

RUN apk add nginx && \
  yarn install && \
  adduser -S nodejs && \
  chown -R nodejs /www && \
  chown -R nodejs /home/nodejs
