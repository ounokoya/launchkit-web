# LaunchKit web (production): SvelteKit built with adapter-node, served by server.js (security headers on every
# response). Build context: the root of this repository.   docker build -t launchkit-web .
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/server.js ./
EXPOSE 3000
USER 1000 # node, numeric so that Kubernetes can check runAsNonRoot
CMD ["node", "server.js"]
