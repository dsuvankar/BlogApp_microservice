# Step 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Run stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# Install only production dependencies
RUN npm install --omit=dev
EXPOSE 5003
# Note: Change EXPOSE port to match the service (5000, 5001, or 5002)
CMD ["node", "dist/server.js"]