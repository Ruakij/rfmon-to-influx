const log4js = require("log4js");
const { requireEnvVars } = require("./helper/env.js");
const { exit } = require("process");

/// Setup logger
const logger = log4js.getLogger("main");
logger.level = process.env.LOGLEVEL ?? "INFO";

/// Setup ENVs
const env = process.env;
// Defaults
{
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

