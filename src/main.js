"use strict";
const logger = require("./helper/logger.js")("main");

const { requireEnvVars } = require("./helper/env.js");
const { exit } = require("process");
const { exec } = require("./helper/exec.js");

const { InfluxDB } = require('@influxdata/influxdb-client');
const InfluxChecks = require('./helper/influx-checks.js');

const { RegexBlockStream } = require("./streamHandler/RegexBlockStream.js");
const { PacketStreamFactory } = require("./streamHandler/PacketStreamFactory.js");
const { PacketInfluxPointFactory } = require("./streamHandler/PacketInfluxPointFactory.js");
const { InfluxPointWriter } = require("./streamHandler/InfluxPointWriter.js");

/// Setup ENVs
const env = process.env;
// Defaults
{
  env.LOGLEVEL            ??= "INFO";
  env.WIFI_INTERFACE      ??= "wlan0";
}
// Required vars
let errorMsg = requireEnvVars([
  "INFLUX_URL", "INFLUX_TOKEN",
  "INFLUX_ORG", "INFLUX_BUCKET"
]);
if(errorMsg){
  logger.fatal(errorMsg);
  exit(1);
}

(async function() {
  logger.info("Setup Influx..");
  const influxDb = new InfluxDB({url: env.INFLUX_URL, token: env.INFLUX_TOKEN});

  await InfluxChecks.checkHealth(influxDb)
    .then((res) => {return InfluxChecks.checkBucket(influxDb, {
      org: env.INFLUX_ORG,
      name: env.INFLUX_BUCKET
    })})
    .then((res) => {return InfluxChecks.checkWriteApi(influxDb, {
      org: env.INFLUX_ORG,
      bucket: env.INFLUX_BUCKET
    })})
    .catch((err) => {
      if(err) {
        logger.error("Error whilst checking influx:");
        logger.error(err);
      }
      logger.fatal("Setup influx failed!");
      exit(1);
    });

  logger.info("Influx ok");

  logger.info("Starting tcpdump..");
  const TCPDUMP_BASECMD = "tcpdump -vvv -e -n -X -s0 -i"
  let cmd = `sudo ${TCPDUMP_BASECMD} ${env.WIFI_INTERFACE}`;

  let proc = exec(cmd);
  logger.debug("Creating & Attaching streams..");
  proc.stdout
    .setEncoding("utf8")
    .pipe(new RegexBlockStream(/^\d{2}:\d{2}:\d{2}.\d{6}.*(\n( {4,8}|\t\t?).*)+\n/gm))
    .pipe(new PacketStreamFactory())
    .pipe(new PacketInfluxPointFactory())
    .pipe(new InfluxPointWriter(influxDb, env.INFLUX_ORG, env.INFLUX_BUCKET));

  logger.debug("Attaching error-logger..");
  proc.stderr.setEncoding("utf8").on("data", (data) => {
    logger.error(data);
  });

  logger.debug("Attaching exit-handler..");
  proc.on("exit", (code) => {
    logger.info(`tcpdump exited code: ${code}`);
    if (code) {
      logger.fatal(`tcpdump exited with non-zero code: ${code}`);
      exit(1);
    }
    logger.info("Shutdown");
    exit(0);
  });

  logger.info("Startup complete");
})();
