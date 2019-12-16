FROM node:12-alpine

WORKDIR /app

COPY api/package.json api/yarn.lock ./

RUN yarn install --production

COPY api/ /app/api
COPY lib/ /app/lib
COPY _shared/ /app/_shared

RUN adduser -S nodejs && \
    chown -R nodejs /app && \
    chown -R nodejs /home/nodejs

USER nodejs

CMD ["node", "/app/api"]
