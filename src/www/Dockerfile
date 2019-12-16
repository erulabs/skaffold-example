# build environment
FROM node:12-alpine as build
WORKDIR /app/www

ENV PATH /app/node_modules/.bin:$PATH
COPY www/package.json /app/www/package.json
COPY www/yarn.lock /app/www/yarn.lock
RUN yarn install
RUN npm config set unsafe-perm true #https://stackoverflow.com/questions/52196518/could-not-get-uid-gid-when-building-node-docker
RUN npm install react-scripts -g --silent
COPY www/src /app/www/src
COPY www/public /app/www/public
COPY lib /app/lib
RUN npm run build

# production environment
FROM nginx:alpine
COPY --from=build /app/www/build /app/www/build
COPY www/nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
