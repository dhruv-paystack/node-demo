FROM node:lts-alpine

RUN mkdir /app
WORKDIR /app

COPY yarn.lock package.json /app/

RUN yarn install --prod

COPY app.js .

EXPOSE 3000

ARG APP_VERSION=''

ENV APP_VERSION ${APP_VERSION}

CMD ["node", "app.js"]
