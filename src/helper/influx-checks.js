const logger = require("./helper/logger.js")("influx-checks");

const Influx = require('@influxdata/influxdb-client-apis');


function checkHealth(influxDb){
    return new Promise((resolve, reject) => {
        new Influx.HealthAPI(influxDb)    // Check influx health
            .getHealth()
            .catch((err) => {
                logger.fatal("Could not communicate with Influx:");
                logger.fatal(`Error [${err.code}]:`, err.message);
                reject(err);
            })
            .then((res) => {
                logger.debug("Server healthy.", "Version: ", res.version);
                resolve(res);
            });
    });
}


// Specify exports
module.exports = {
    checkHealth,
};