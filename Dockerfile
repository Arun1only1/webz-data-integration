# Stage 1: Build the application
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Install Nest CLI globally
RUN npm install -g @nestjs/cli

# Expose the application port
EXPOSE 8080

# Start the application in development mode
CMD ["npm", "run", "start:dev"]