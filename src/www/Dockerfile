FROM node:12-alpine

WORKDIR /app

COPY www/package.json www/yarn.lock ./

RUN yarn install && \
  adduser -S nodejs && \
  chown -R nodejs /app && \
  chown -R nodejs /home/nodejs

USER nodejs

COPY lib /app/lib
COPY www/ /app/

RUN yarn build

CMD ["node", "/app"]

FROM nginx:alpine

COPY --from=0 /app/build /app/

CMD ["nginx", "-g", "daemon off"]
