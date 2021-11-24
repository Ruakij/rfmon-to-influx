const log4js = require("log4js");

const logger = log4js.getLogger("main");
logger.level = process.env.logLevel ?? "INFO";


