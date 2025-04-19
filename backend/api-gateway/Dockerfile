# Use Node.js base image
FROM node:18-slim

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose service port (change per service if needed)
# Before Port = 8082
EXPOSE 8080    
# For auth-service
# or EXPOSE 5001  # For user-service
# or EXPOSE 8082  # For api-gateway

# Start the app
CMD ["npm", "start"]
