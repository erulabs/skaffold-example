FROM node:12-alpine

WORKDIR /worker

COPY worker/package.json worker/yarn.lock ./

RUN yarn install --production && \
  adduser -S nodejs && \
  chown -R nodejs /worker && \
  chown -R nodejs /home/nodejs
