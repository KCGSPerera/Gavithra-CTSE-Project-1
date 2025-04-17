# Base image
FROM node:18-slim

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app files
COPY . .

# Expose the port used by Order Service
EXPOSE 5004

# Start the Order Service
CMD ["node", "server.js"]
