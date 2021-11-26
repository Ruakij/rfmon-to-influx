const logger = require.main.require("./helper/logger.js")("InfluxPointWriter");
const { Writable } = require('stream');
const {InfluxDB, Point, HttpError} = require('@influxdata/influxdb-client')

/**
 * Get points and write them into influx
 */
class InfluxPointWriter extends Writable{
    /**
     * 
     * @param {InfluxDB} influxDb InfluxDb
     * @param {string} org Organization to use
     * @param {string} bucket Bucket to use
     * @param {Partial<WriteOptions>} options Options for WriteApi
     */
    constructor(influxDb, org, bucket, options){
        super({
            objectMode: true
        });
        this._api = influxDb.getWriteApi(org, bucket, 'us', options);
    }

    _write(point, encoding, next){
        this._api.writePoint(point);
        next();
    }

    _flush(next){
        this._api.flush(true)
            .catch((err) => { next(new Error(`WriteApi rejected promise for flush: ${err}`)); })
            .then(next);
    }
}

// Specify exports
module.exports = {
    InfluxPointWriter
};