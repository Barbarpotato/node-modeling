FROM node:18-alpine

WORKDIR /app

# Install sqlite for the database
RUN apk add --no-cache sqlite

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the app
RUN npm run build

# Create /app/data directory and make it accessible (read/write for all users)
RUN mkdir -p /app/data && chmod 777 /app/data

# Ensure the database file is writable
RUN chmod 666 /app/data/database.db

# Switch to the 'node' user to run the application
USER node

# Expose port 3000
EXPOSE 3000

# Set the data directory as a volume (optional, for persistent storage)
VOLUME /app/data

# Run the application
CMD ["npm", "start"]
