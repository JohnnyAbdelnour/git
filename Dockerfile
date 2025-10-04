# --- STAGE 1: Build ---
# This stage installs all dependencies (including dev) and builds the TypeScript code.
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Generate Prisma Client to ensure it's available for the build
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build


# --- STAGE 2: Production ---
# This stage creates the final, lean production image.
FROM node:20-slim

WORKDIR /app

# Create a non-root user to run the application for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy only the necessary production dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy the compiled JavaScript code from the builder stage
COPY --from=builder /app/dist ./dist

# Copy Prisma schema for runtime access
COPY prisma ./prisma

# The `data` and `uploads` directories should be mounted as volumes,
# so we create them here and set permissions.
RUN mkdir -p data uploads publish && chown -R appuser:nodejs data uploads publish
VOLUME ["/app/data", "/app/uploads", "/app/publish"]

# Switch to the non-root user
USER appuser

# Expose the application port
EXPOSE 8080

# The command to run the application
CMD ["node", "dist/src/index.js"]