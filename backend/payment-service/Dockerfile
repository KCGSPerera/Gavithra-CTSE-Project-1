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
EXPOSE 5007  

# Start the app
CMD ["npm", "start"]
