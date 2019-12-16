FROM node:12-alpine

WORKDIR /app

COPY gameserver/package.json /app/package.json
COPY gameserver/yarn.lock /app/yarn.lock

RUN yarn install --production

COPY gameserver/ /app/gameserver
COPY lib/ /app/lib
COPY _shared/ /app/_shared

RUN adduser -S nodejs && \
    chown -R nodejs /app && \
    chown -R nodejs /home/nodejs

USER nodejs

CMD ["node", "/app/gameserver"]
