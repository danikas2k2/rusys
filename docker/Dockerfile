FROM node:26-alpine AS builder

WORKDIR /app

RUN npm install --global pnpm@11.24.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY next.config.ts postcss.config.mjs tsconfig.json ./
COPY scripts/postcss ./scripts/postcss
COPY src ./src
COPY public ./public
RUN pnpm exec next build

FROM node:26-alpine

WORKDIR /app

ARG APP_VERSION

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

LABEL app.version=${APP_VERSION}

EXPOSE 3000

CMD ["node", "server.js"]
