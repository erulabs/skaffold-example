FROM node:12-alpine

WORKDIR /api

COPY api/package.json api/yarn.lock ./

RUN yarn install --production && \
  adduser -S nodejs && \
  chown -R nodejs /api && \
  chown -R nodejs /home/nodejs
