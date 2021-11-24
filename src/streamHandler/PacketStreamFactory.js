const logger = require.main.require("./helper/logger.js")("PacketStreamFactory");
const { Transform } = require('stream');
const { DateTime } = require("luxon");
const { PacketType, Packet, PacketWithSSID, BeaconPacket, ProbeRequestPacket, ProbeResponsePacket, AuthenticationPacket, AuthenticationType } = require.main.require('./dto/Packet.js');

const PACKET_TYPE_MAP = {
    "Beacon":           PacketType.Beacon,
    "Probe Request":    PacketType.ProbeRequest,
    "Probe Response":   PacketType.ProbeResponse,
    "Data":             PacketType.Data,
    "More Data":        PacketType.MoreData,
    "Request-To-Send":  PacketType.RequestToSend,
    "Clear-To-Send":    PacketType.ClearToSend,
    "Acknowledgment":   PacketType.Acknowledgment,
    "BA":               PacketType.BlockAcknowledgment,
    "Authentication":   PacketType.Authentication,
};
const PACKET_TYPES_REGEX = Object.keys(PACKET_TYPE_MAP).join('|');

const AUTHENTICATION_TYPE_MAP = {
    "(Open System)-1":  AuthenticationType.OpenSystem_1,
    "(Open System)-2":  AuthenticationType.OpenSystem_2,
}

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

        next(null, packet);     // Get next chunk
    }

    _handleHeader(packet, data){
        // Convert time to epoch-micros         Unfortunately luxon doesnt use micros, but millis as smallest time-unit requiring some "hacks"
        packet.timestampMicros = DateTime.fromISO(data.slice(0, 12)).toSeconds() + data.slice(12, 15)/1000000;

        packet.isRetry = data.match(/(^| )Retry($| )/i)? true: false;

        packet.dataRate = Number(data.match(/(^| )([0-9]+(\.[0-9]+)?) Mb\/s($| )/i)?.[2]) || null;
        packet.frequency = Number(data.match(/(^| )([0-9]{4}) MHz($| )/i)?.[2]) || null;

        packet.signal = Number(data.match(/(^| )(-[0-9]{2})dBm Signal($| )/i)?.[2]) || null;

        let packetTypeStr = data.match(new RegExp(`(^|.{80} )(${PACKET_TYPES_REGEX})($| )`, 'i'))?.[2];
        packet.packetType = packetTypeStr? PACKET_TYPE_MAP[packetTypeStr]: PacketType.Unknown;
        
        packet.srcMac = data.match(/(^| )(SA|TA):(.{17})($| )/i)?.[3] ?? null;

        packet.dstMac = data.match(/(^| )(DA|RA):(.{17})($| )/i)?.[3] ?? null;
        
        packet.bssid = data.match(/(^| )BSSID:(.{17})($| )/i)?.[2] ?? null;

        // Cover special cases with more data
        let newPacket;
        switch(packet.packetType){
            case PacketType.Beacon:
            case PacketType.ProbeRequest:
            case PacketType.ProbeResponse:
                newPacket = new PacketWithSSID();
                newPacket.ssid = data.match(new RegExp(`(^| )${packetTypeStr} `+'\\'+`((.{0,32})`+'\\'+`)($| )`, 'i'))?.[2] ?? null;
                break;
            
            case PacketType.Authentication:
                newPacket = new AuthenticationPacket();
                newPacket.authenticationType = AUTHENTICATION_TYPE_MAP[data.match(/(?<=(^|\s)Authentication\s).{3,}(?=\:(\s|$))/i)[0]] ?? AuthenticationType.Unknown;
                break;
        }
        if(newPacket) packet = Object.assign(new newPacket, packet);   // Use new, more specific, packet and copy old data over
    }

    _handlePayload(packet, data){
        // Get payload-Hex-Data. If there is no data: empty
        packet.payloadData = data.join('').match(/(?<=\s)([A-F0-9]{1,4}(?!(\.|x)))/igm)?.join('') ?? '';
    }
}

// Specify exports
module.exports = {
    PacketStreamFactory
};