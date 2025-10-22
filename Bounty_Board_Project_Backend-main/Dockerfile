# Dockerfile
FROM node:18-alpine

WORKDIR /app
RUN mkdir -p uploads/{bounties,avatars}

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "start:prod"]
