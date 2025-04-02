# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install SQLite dependencies (if needed for sqlite3 native bindings)
RUN apk add --no-cache sqlite

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Build the Next.js app
RUN npm run build

# Create database directory and set permissions
RUN mkdir -p /data/database && chown node:node /app/database

# Switch to non-root user for security
USER node

# Expose the Next.js port
EXPOSE 3000

# Define the database directory as a volume (optional, see note below)
VOLUME /data/database

# Start the app
CMD ["npm", "start"]