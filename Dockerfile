FROM alpine:latest
MAINTAINER Chance Hudson

RUN apk add --update nodejs-npm

COPY . /src
WORKDIR /src

RUN npm ci --only=prod

CMD ["npm", "start"]
