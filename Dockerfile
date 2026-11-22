# --- build the React client ---
FROM node:20-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# --- production image: Express serves the API and the built client ---
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./
COPY --from=client /app/client/dist /app/client/dist
RUN mkdir -p uploads && chown -R node:node /app
USER node
EXPOSE 5000
CMD ["node", "src/index.js"]
