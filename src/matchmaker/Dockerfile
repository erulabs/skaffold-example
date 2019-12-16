FROM node:12-alpine

WORKDIR /app

COPY matchmaker/package.json matchmaker/yarn.lock ./

RUN yarn install --production && \
  adduser -S nodejs && \
  chown -R nodejs /app && \
  chown -R nodejs /home/nodejs

USER nodejs

COPY lib /app/lib
COPY matchmaker/ /app/

CMD ["node", "/app"]
