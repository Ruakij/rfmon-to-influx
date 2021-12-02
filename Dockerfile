FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

RUN apk update
RUN apk add tcpdump

# Bundle app source
COPY ./src/ .

CMD ["npm", "run", "start"]