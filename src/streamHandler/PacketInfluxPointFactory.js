const logger = require.main.require("./helper/logger.js")("PacketStreamFactory");
const { Transform } = require("stream");
const {Point} = require("@influxdata/influxdb-client");

/** Keys to always use as tags */
const TAG_LIST = [
    "srcMac",
    "dstMac",
    "bssid",
    "frequency",
    "flags",
    "packetType",
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
    ["HandshakeStage", "handshakeStage"],
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
            if(packet[objKey] == null) return;

            let point = new Point(measurement);     // Create point
            
            // Set tags
            TAG_LIST.filter(tag => Object.keys(packet).includes(tag))   // Filter tags available on object
                .filter(tag => packet[tag] != null)                         // Filter tags not falsy on object
                .forEach(tag => {
                    tagObjectRecursively(point, tag, packet[tag]);
                });

            point.setField("value", packet[objKey]);        // Set field

            this.push(point);     // Push point into stream
        });
        
        next();     // Get next packet
    }
}

function tagObjectRecursively(point, tag, field, suffix = ""){
    if(typeof(field) == "object"){
        // TODO: Convert boolean-arrays like "packet.flags" to key: value
        Object.entries(field).map(([key, value]) => {
            tagObjectRecursively(point, tag, value, `_${key}${suffix}`);
        });
    }
    else point.tag(tag+suffix, field);
}

/** Mapping for type -> field-method */
const POINT_FIELD_TYPE = new Map([
    ["boolean",   function(key, value){ return this.booleanField(key, value); }],
    ["number",    function(key, value){ return this.intField(key, value); }],
    ["string",    function(key, value){ return this.stringField(key, value); }],
]);
Point.prototype.setField = function(key, value){
    let setField = POINT_FIELD_TYPE.get(typeof value);
    return setField.apply(this, [key, value]);
};

// Specify exports
module.exports = {
    PacketInfluxPointFactory
};