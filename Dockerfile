# ---- Dependencies ----
# The dependencies are plain JavaScript, so they are installed on the build
# platform and a multi-arch build needs no emulation for this stage.
FROM --platform=$BUILDPLATFORM node:26-alpine AS dependencies

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev


# ---- Release ----
# Alpine's own nodejs package, as the official node images have no linux/arm/v7
# variant. tcpdump captures the packets.
FROM alpine:3.24 AS release

WORKDIR /usr/src/app

RUN apk add --no-cache nodejs tcpdump

COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY package.json ./
COPY ./src/ .

CMD ["node", "main.js"]
