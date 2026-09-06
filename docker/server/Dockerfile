FROM node:26-alpine

WORKDIR /app

ARG APP_VERSION

COPY dist/server/ ./

LABEL app.version=${APP_VERSION}

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
