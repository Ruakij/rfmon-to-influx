const logger = require.main.require("./helper/logger.js")("PacketStreamFactory");
const { Transform } = require('stream');
const {Point} = require('@influxdata/influxdb-client')

/** Keys to always use as tags */
const TAG_LIST = [
    "srcMac",
    "dstMac",
    "bssid",
    "frequency",
    "flags",
];

/** Measurement-name and corresponding field-key */
const MEASUREMENT_MAP = new Map([
    ["Signal", "signal"],
    ["PayloadSize", "payloadSize"],
    ["DataRate", "dataRate"],
    ["SSID", "ssid"],
    ["AuthenticationType", "authenticationType"],
    ["AssociationSuccess", "associationIsSuccessful"],
    ["DisassociationReason", "disassociationReason"],
]);


/**
 * Get packets and convert them into influx-points
 */
class PacketInfluxPointFactory extends Transform{
    constructor(){
        super({
            readableObjectMode: true,
            writableObjectMode: true
        });
    }

    _transform(packet, encoding, next){
        // Create measurements
        MEASUREMENT_MAP.forEach((objKey, measurement) => {
            if(!Object.keys(packet).includes(objKey)) return;

            let point = new Point(measurement);     // Create point
            
            // Set tags
            TAG_LIST.filter(tag => Object.keys(packet).includes(tag))
                    .forEach(tag => point.tag(tag, packet[tag]));

            point.setField('value', packet[objKey]);        // Set field

            this.push(point);     // Push point into stream
        });
        
        next();     // Get next packet
    }
}


/** Mapping for type -> field-method */
const POINT_FIELD_TYPE = new Map([
    ['boolean',   function(key, value){ return this.booleanField(key, value); }],
    ['number',    function(key, value){ return this.intField(key, value); }],
    ['string',    function(key, value){ return this.stringField(key, value); }],
]);
Point.prototype.setField = function(key, value){
    let setField = POINT_FIELD_TYPE.get(typeof value);
    return setField.apply(this, [key, value]);
}

// Specify exports
module.exports = {
    PacketInfluxPointFactory
};