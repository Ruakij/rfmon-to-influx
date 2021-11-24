const logger = require("./helper/logger.js")("main");

const { requireEnvVars } = require("./helper/env.js");
const { exit } = require("process");

/// Setup ENVs
const env = process.env;
// Defaults
{
  env.LOGLEVEL            ??= "INFO";
  env.WIFI_INTERFACE      ??= "wlan0";
  env.WIFI_CHANNEL        ??= [1,6,11];
  env.WIFI_CHANNEL_TIME   ??= 1;
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

