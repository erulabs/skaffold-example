FROM node:12-alpine

WORKDIR /app/matchmaker

COPY matchmaker/package.json matchmaker/yarn.lock ./

RUN yarn install --production && \
  adduser -S nodejs && \
  chown -R nodejs /app && \
  chown -R nodejs /home/nodejs

USER nodejs

COPY lib /app/lib
COPY _shared /app/_shared
COPY matchmaker /app/matchmaker

CMD ["node", "/app/matchmaker"]
