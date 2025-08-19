FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json .npmrc ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# ---- Serve Static Files ----
FROM node:18-alpine
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/out ./out

EXPOSE 3000
CMD ["serve", "-s", "out", "-l", "3000"]
