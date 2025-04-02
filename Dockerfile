FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache sqlite
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 3000
VOLUME /app/data
CMD ["npm", "start"]