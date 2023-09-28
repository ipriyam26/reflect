# Use Node.js
FROM node:20-alpine

# Working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy pnpm-lock.yaml and package.json for installing dependencies
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install

# Copy local code to the container image.
COPY . ./

ENV VITE_API_URL=http://backend:8000
# Build the application
RUN pnpm run build
EXPOSE 5000
# Run a simple http server to serve the application
CMD ["npx", "serve", "-s", "build", "-l", "5000"]
