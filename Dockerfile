FROM node:erbium-alpine

EXPOSE 3000

RUN apk add --no-cache python3

RUN mkdir -p /grapevine/
RUN chown -R node /grapevine/

WORKDIR /grapevine
ADD package.json yarn.lock /grapevine/
RUN yarn install

ENV NODE_ENV="production"

USER node
ADD . /grapevine/

ENTRYPOINT ["yarn"]
