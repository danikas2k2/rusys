FROM node:22-alpine
WORKDIR /app
COPY ../dist ./
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]
