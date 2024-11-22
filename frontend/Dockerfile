# Use Node.js Alpine as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the application
RUN npm run build

# Expose the port Vite uses for preview
EXPOSE 4173

# Serve the built files in preview mode
CMD ["npm", "run", "preview"]