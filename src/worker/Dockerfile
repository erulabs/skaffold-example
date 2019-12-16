FROM node:12-alpine

WORKDIR /app/worker

COPY worker/package.json worker/yarn.lock ./

RUN yarn install --production && \
  adduser -S nodejs && \
  chown -R nodejs /app && \
  chown -R nodejs /home/nodejs

USER nodejs

COPY lib /app/lib
COPY _shared /app/_shared
COPY worker /app/worker

CMD ["node", "/app/worker"]
