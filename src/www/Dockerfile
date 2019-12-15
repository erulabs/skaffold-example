FROM gcr.io/seandonmooy-1292/tacticsonline-base:dirty

WORKDIR /www

COPY www/package.json www/yarn.lock ./

RUN apk add nginx && \
  yarn install && \
  adduser -S nodejs && \
  chown -R nodejs /www && \
  chown -R nodejs /home/nodejs
