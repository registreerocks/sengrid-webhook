FROM node:current-alpine
WORKDIR /app
COPY ./src ./src
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
RUN yarn install --production ---frozen-lockfile
EXPOSE 3000
CMD [ "npm", "start" ]