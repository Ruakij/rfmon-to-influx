const logger = require.main.require("./helper/logger.js")("InfluxPointWriter");
const { Writable } = require("stream");
const { WriteApi } = require("@influxdata/influxdb-client");

/**
 * Get points and write them into influx
 */
class InfluxPointWriter extends Writable{
    /**
     * 
     * @param {WriteApi} writeApi WriteAPI from InfluxDB instance
     */
    constructor(writeApi){
        super({
            objectMode: true
        });
        this._api = writeApi;
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