# Use official Node.js image as base
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application if needed
# RUN npm run build (uncomment if you have a build step)

# Expose the port the app runs on
EXPOSE 5001

# Command to run the application
CMD ["node", "./src/index.js"]