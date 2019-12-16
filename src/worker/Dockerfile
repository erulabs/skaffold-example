FROM node:12-alpine

WORKDIR /app

COPY worker/package.json worker/yarn.lock ./

RUN yarn install --production && \
  adduser -S nodejs && \
  chown -R nodejs /app && \
  chown -R nodejs /home/nodejs

USER nodejs

COPY lib /app/lib
COPY worker/ /app/

CMD ["node", "/app"]
