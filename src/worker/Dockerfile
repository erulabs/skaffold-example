FROM node:12-alpine

WORKDIR /app

COPY worker/package.json worker/yarn.lock ./

RUN yarn install --production

COPY worker/ /app/worker
COPY lib/ /app/lib
COPY _shared/ /app/_shared

RUN adduser -S nodejs && \
    chown -R nodejs /app && \
    chown -R nodejs /home/nodejs

USER nodejs

CMD ["node", "/app/worker"]
