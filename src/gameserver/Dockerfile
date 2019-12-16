FROM node:12-alpine

WORKDIR /app

COPY gameserver/package.json gameserver/yarn.lock ./

RUN yarn install --production && \
  adduser -S nodejs && \
  chown -R nodejs /app && \
  chown -R nodejs /home/nodejs

USER nodejs

COPY lib /app/lib
COPY gameserver/ /app/

CMD ["node", "/app"]
