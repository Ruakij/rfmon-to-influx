const log4js = require("log4js");


function setup(category = "unknown"){
    const logger = log4js.getLogger(category);
    logger.level = process.env.LOGLEVEL ?? "INFO";
    return logger;
}

// Specify exports
module.exports = setup;