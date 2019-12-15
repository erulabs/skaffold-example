FROM gcr.io/seandonmooy-1292/tacticsonline-base:dirty

WORKDIR /matchmaker

COPY matchmaker/package.json matchmaker/yarn.lock ./

RUN yarn install --production && \
  adduser -S nodejs && \
  chown -R nodejs /matchmaker && \
  chown -R nodejs /home/nodejs
