FROM node:12-alpine

WORKDIR /app/api

COPY api/package.json api/yarn.lock /app/

RUN yarn install --production && \
  adduser -S nodejs && \
  chown -R nodejs /app && \
  chown -R nodejs /home/nodejs

USER nodejs

COPY lib /app/lib
COPY _shared /app/_shared
COPY api /app/api

CMD ["node", "/app/api"]
