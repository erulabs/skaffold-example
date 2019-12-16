FROM node:12-alpine

WORKDIR /app

COPY api/package.json api/yarn.lock /app/

RUN yarn install --production && \
  adduser -S nodejs && \
  chown -R nodejs /app && \
  chown -R nodejs /home/nodejs

USER nodejs

COPY lib /app/lib
COPY api/ /app/

CMD ["node", "/app"]
