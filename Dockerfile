# 1. Use Node image
FROM node:18

# 2. Set working dir
WORKDIR /app

# 3. Copy everything
COPY . .

# 4. Install dependencies
RUN npm install

# 5. Build frontend (Vite) and server (TypeScript)
RUN npm run build

# 6. Expose port
EXPOSE 3000

# 7. Start server
CMD ["npm", "start"]
