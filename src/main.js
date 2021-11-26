const logger = require("./helper/logger.js")("main");

const { requireEnvVars } = require("./helper/env.js");
const { exit } = require("process");
const { InfluxDB } = require('@influxdata/influxdb-client');

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
    .catch(exit(1))
    .then((res) => {});

})();
