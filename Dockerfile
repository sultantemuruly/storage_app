FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm rebuild @tailwindcss/oxide --update-binary
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]