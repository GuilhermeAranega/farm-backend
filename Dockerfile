FROM node:20.6

WORKDIR /app

COPY package.json /app

RUN npm install && npm cache clean --force

COPY . /app

EXPOSE 3333

CMD ["npm", "run", "dev"]   