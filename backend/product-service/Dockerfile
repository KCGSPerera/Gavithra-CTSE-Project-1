# # Base image
FROM node:18-slim

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app files
COPY . .

# Expose port
EXPOSE 5000

# Start the service
CMD ["node", "server.js"]
