FROM node:22-alpine
WORKDIR /app
ARG APP_VERSION
COPY dist/ ./
LABEL app.version=${APP_VERSION}
RUN npm install
EXPOSE 3000
EXPOSE 4000
CMD ["node", "server.js"]
