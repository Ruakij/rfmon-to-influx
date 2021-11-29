FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

RUN apt-get update
RUN apt-get -y install \
    tcpdump

# Bundle app source
COPY ./src/ .

CMD ["npm", "run", "start"]