FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --no-cache make gcc g++ python3 py3-pip
RUN npm install
RUN npm rebuild bcrypt --build-from-source
RUN apk del make gcc g++ python3

COPY . .


EXPOSE 3000


CMD ["npm", "run", "build"]