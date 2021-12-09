const logger = require.main.require("./helper/logger.js")("InfluxPointToLineProtoStream");
const { Transform } = require("stream");

/**
 * Get points and converts them to Line-protocol
 */
class InfluxPointToLineProtoStream extends Transform{
    constructor(){
        super({
            writableObjectMode: true
        });
    }

    _transform(point, encoding, next){
        next(null, point.toLineProtocol() +"\n");
    }
}

// Specify exports
module.exports = {
    InfluxPointToLineProtoStream
};