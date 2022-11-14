FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# remove development dependencies
RUN npm prune --production

# Install required apk-packages & delete cache
RUN apk add --no-cache tcpdump

# Bundle app source
COPY ./src/ .

CMD ["npm", "run", "start"]
