# Build stage
FROM node:latest as builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app

# Build the Next.js application
RUN npm run build

# Runtime stage
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy the build output and necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expose the port (Cloud Run requires listening on the PORT environment variable)
ENV PORT 8080
EXPOSE ${PORT}

# Define the command to run your application
CMD ["npm", "start"]

# Define the command to run your application
CMD ["npm", "start"]
