FROM node:22-alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY simple-voter.js ./

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

ENV TILE_ID=${TILE_ID}
ENV REQUEST_INTERVAL_MS=${REQUEST_INTERVAL_MS:-2000}
ENV MAX_VOTES_PER_COOKIE=${MAX_VOTES_PER_COOKIE:-10}
ENV COOKIES_FILE=${COOKIES_FILE:-/app/valid_cookies.txt}

EXPOSE 3000

CMD ["node", "simple-voter.js"]
