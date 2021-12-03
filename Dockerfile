FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Install required apk-packages & delete cache
RUN apk update && apk add tcpdump && rm -rf /var/cache/apk/*

# Bundle app source
COPY ./src/ .

CMD ["npm", "run", "start"]