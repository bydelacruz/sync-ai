# Use node image
FROM node:20-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Run Vite with --host so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
