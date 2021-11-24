const log4js = require("log4js");

/// Setup logger
const logger = log4js.getLogger("main");
logger.level = process.env.logLevel ?? "INFO";


