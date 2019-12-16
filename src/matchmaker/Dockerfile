FROM node:12-alpine

WORKDIR /app

COPY matchmaker/package.json /app/package.json
COPY matchmaker/yarn.lock /app/yarn.lock

RUN yarn install --production

COPY matchmaker/ /app/matchmaker
COPY lib/ /app/lib
COPY _shared/ /app/_shared

RUN adduser -S nodejs && \
    chown -R nodejs /app && \
    chown -R nodejs /home/nodejs

USER nodejs

CMD ["node", "/app/matchmaker"]
