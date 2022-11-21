# ---- Base ----
FROM alpine:3 AS base

# Create app directory
WORKDIR /usr/src/app

# Copy project file
COPY package.json .

# Install required apk-packages
RUN apk add --no-cache nodejs npm tcpdump


# ---- Dependencies ----
FROM base AS dependencies

# Install app dependencies
RUN npm install --only=production


# ---- Release ----
FROM base AS release

# copy from build image
COPY --from=dependencies /usr/src/app/ ./
# Bundle app source
COPY ./src/ .

CMD ["npm", "run", "start"]
