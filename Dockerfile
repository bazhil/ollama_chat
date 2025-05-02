# 1. Use an official Node.js runtime as a parent image
FROM node:20-slim AS base

# Set working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Use --frozen-lockfile for deterministic installs
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# --- Development ---
FROM base AS dev
WORKDIR /app
COPY --chown=node:node . .
# Expose the port the app runs on (adjust if your dev port is different)
EXPOSE 9002
# Set the default command to run the development server
# Using `npm run dev` which is defined in package.json
CMD ["npm", "run", "dev"]


# --- Build ---
# Reuse the base image with dependencies installed
FROM base AS build
WORKDIR /app
# Copy the rest of the application code
COPY . .
# Build the Next.js application
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi


# --- Production ---
FROM node:20-slim AS production
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Set up a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the build stage
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Change ownership of the working directory
USER nextjs

# Expose the port the app runs on (default is 3000 for `next start`)
EXPOSE 3000

# Set the default command to start the production server
CMD ["node", "server.js"]
