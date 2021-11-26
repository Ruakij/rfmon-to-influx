const logger = require("./helper/logger.js")("influx-checks");

const Influx = require('@influxdata/influxdb-client-apis');


function checkHealth(influxDb){
    return new Promise((resolve, reject) => {
        new Influx.HealthAPI(influxDb)    // Check influx health
            .getHealth()
            .catch((err) => {
                logger.error("Could not communicate with Influx:");
                logger.error(`Error [${err.code}]:`, err.message);
                reject();
            })
            .then((res) => {
                logger.debug("Server healthy.", "Version: ", res.version);
                resolve(res);
            });
    });
}

function checkBucket(influxDb, options){
    return new Promise((resolve, reject) => {
        new Influx.BucketsAPI(influxDb).getBuckets(options)
            .catch((err) => {       // Weirdly the influx-Api returns 404 for searches of non-existing buckets
                logger.error("Could not get bucket:");
                logger.error(`Error [${err.code}]:`, err.message);
                reject();
            }).then((res) => {      // But an empty list when the bucket exists, but token does not have permission to get details
                logger.debug("Bucket found");
                resolve(res);
                // Now we know the bucket exists and we have some kind of permission.. but we still dont know if we are able to write to it..
            });
    });
}


// Specify exports
module.exports = {
    checkHealth,
    checkBucket,
};