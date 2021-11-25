const logger = require.main.require("./helper/logger.js")("InfluxPointWriter");
const { Writeable } = require('stream');
const {InfluxDB, Point, HttpError} = require('@influxdata/influxdb-client')

/**
 * Get points and write them into influx
 */
class InfluxPointWriter extends Writeable{
    /**
     * 
     * @param {string} url Influx-Url
     * @param {string} token Auth-token
     * @param {string} org Organization to use
     * @param {string} bucket Bucket to use
     * @param {string} precision Precision to use
     */
    constructor(url, token, org, bucket, precision = 'us'){
        this._api = new InfluxDB({url, token}).getWriteApi(org, bucket, precision);
    }

    _write(point, encoding, next){
        this._api.writePoint(point);
        next();
    }

    _flush(next){
        this._api.flush(true)
            .then(
                next,
                (err) => { next(new Error(`WriteApi rejected promise for flush: ${err}`)); }
            );
    }
}

// Specify exports
module.exports = {
    InfluxPointWriter
};