const logger = require.main.require("./helper/logger.js")("PacketStreamFactory");
const { Transform } = require('stream');
const { DateTime } = require("luxon");
const { PacketType, Packet, PacketWithSSID, BeaconPacket, ProbeRequestPacket, ProbeResponsePacket } = require.main.require('./dto/Packet.js');

const PACKET_TYPE_MAP = {
    "Beacon":           PacketType.Beacon,
    "Probe Request":    PacketType.ProbeRequest,
    "Probe Response":   PacketType.ProbeResponse,
    "Data":             PacketType.Data,
    "More Data":        PacketType.MoreData,
    "Request-To-Send":  PacketType.RequestToSend,
    "Clear-To-Send":    PacketType.ClearToSend,
    "Acknowledgment":   PacketType.Acknowledgment,
    "BA":               PacketType.BlockAcknowledgment
};
const PACKET_TYPES_REGEX = Object.keys(PACKET_TYPE_MAP).join('|');

/**
 * Read data from text-blocks and convert them to Packet
 */
class PacketStreamFactory extends Transform{
    matcher;
    withholdLastBlock;
    matchAllOnFlush;

    constructor(){
        super({
            readableObjectMode: true,
            writableObjectMode: true
        });
    }

    _transform(chunk, encoding, next){
        let packet = new Packet();

        const lines = chunk.split('\n');
        const header = lines.splice(0, 1)[0];       // Grab first line, 'lines' is now the payload
        this._handleHeader(packet, header);
        this._handlePayload(packet, lines);
        
        logger.debug(packet);

        this.read();
        next(null, packet);     // Get next chunk
    }

    _handleHeader(packet, data){
        // Convert time to epoch-micros         Unfortunately luxon doesnt use micros, but millis as smallest time-unit requiring some "hacks"
        packet.timestampMicros = DateTime.fromISO(data.slice(0, 12)).toSeconds() + data.slice(12, 15)/1000000;

        packet.dataRate = Number(data.match(/(^| )([0-9]+(\.[0-9]+)?) Mb\/s($| )/i)[2]);
        packet.frequency = Number(data.match(/(^| )([0-9]{4}) MHz($| )/i)[2]);

        let signalStrMatch = data.match(/(^| )(-[0-9]{2})dBm Signal($| )/i);
        if(signalStrMatch) packet.signal = Number(signalStrMatch[2]);
        else packet.signal = -100;

        let packetTypeStrMatch = data.match(new RegExp(`(^|.{80} )(${PACKET_TYPES_REGEX})($| )`, 'i'));
        let packetTypeStr;
        if(packetTypeStrMatch) {
            packetTypeStr = packetTypeStrMatch[2];
            packet.packetType = PACKET_TYPE_MAP[packetTypeStr];
        }
        else
            packet.packetType = PacketType.Unknown;
        
        let srcMacMatch = data.match(/(^| )(SA|TA):(.{17})($| )/i);
        if(srcMacMatch) packet.srcMac = srcMacMatch[3];

        let dstMacMatch = data.match(/(^| )(DA|RA):(.{17})($| )/i);
        if(dstMacMatch) packet.dstMac = dstMacMatch[3];
        
        let bssidMatch = data.match(/(^| )BSSID:(.{17})($| )/i)
        if(bssidMatch) packet.bssid = bssidMatch[2];

        // Cover special cases with more data
        switch(packet.packetType){
            case PacketType.Beacon:
            case PacketType.ProbeRequest:
            case PacketType.ProbeResponse:
                packet = Object.assign(new PacketWithSSID(), packet);   // Create new, more specific, packet and copy old data over
                packet.ssid = data.match(new RegExp(`(^| )${packetTypeStr} `+'\\'+`((.{0,32})`+'\\'+`)($| )`, 'i'))[2];
                break;
        }
    }

    _handlePayload(packet, data){
        
    }
}

// Specify exports
module.exports = {
    PacketStreamFactory
};