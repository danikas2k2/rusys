FROM node:26-alpine

WORKDIR /app

ARG APP_VERSION

COPY dist/standalone ./
COPY dist/static ./.next/static
COPY public ./public

LABEL app.version=${APP_VERSION}

EXPOSE 3000

CMD ["node", "server.js"]
