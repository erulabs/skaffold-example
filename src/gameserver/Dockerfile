FROM node:12-alpine

WORKDIR /app/gameserver

COPY gameserver/package.json gameserver/yarn.lock ./

RUN yarn install --production && \
  adduser -S nodejs && \
  chown -R nodejs /app && \
  chown -R nodejs /home/nodejs

USER nodejs

COPY lib /app/lib
COPY _shared /app/_shared
COPY gameserver /app/gameserver

CMD ["node", "/app/gameserver"]
