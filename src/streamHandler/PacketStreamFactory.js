const logger = require.main.require("./helper/logger.js")("PacketStreamFactory");
const { Transform } = require('stream');
const { DateTime } = require("luxon");
const { PacketType, Packet, PacketWithSSID, BeaconPacket, ProbeRequestPacket, ProbeResponsePacket, AuthenticationPacket, AuthenticationType, AssociationResponsePacket, DisassociationPacket, HandshakePacket, HandshakeStage } = require.main.require('./dto/Packet.js');

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
    "Assoc Request":    PacketType.AssociationRequest,
    "Assoc Response":   PacketType.AssociationResponse,
    "Disassociation:":  PacketType.Disassociation,
    "EAPOL":            PacketType.Handshake,
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
        packet = this._handleHeader(packet, header);
        packet = this._handlePayload(packet, lines);
        
        logger.debug(packet);

        next(null, packet);     // Get next chunk
    }

    _handleHeader(packet, data){
        // Convert time to epoch-micros         Unfortunately luxon doesnt use micros, but millis as smallest time-unit requiring some "hacks"
        packet.timestampMicros = DateTime.fromISO(data.slice(0, 12)).toSeconds() + data.slice(12, 15)/1000000;

        packet.isRetry = data.match(/(?<=^|\s)Retry(?=$|\s)/i)? true: false;

        packet.dataRate = Number(data.match(/(?<=^|\s)[0-9]+(\.[0-9]+)?(?=\sMb\/?s($|\s))/i)?.[0]) || null;
        packet.frequency = Number(data.match(/(?<=^|\s)[0-9]{4}(?=\sMHz($|\s))/i)?.[0]) || null;

        packet.durationMicros = Number(data.match(/(?<=^|\s)[0-9]{1,4}(?=us($|\s))/i)?.[0]) || null;

        packet.signal = Number(data.match(/(?<=^|\s)-[0-9]{2,3}(?=dBm\sSignal($|\s))/i)?.[0]) || null;

        let packetTypeStr = data.match(new RegExp('(?<=^|\\s)('+ PACKET_TYPES_REGEX +')(?=$|\\s)', 'i'))?.[0];
        packet.packetType = packetTypeStr? PACKET_TYPE_MAP[packetTypeStr]: PacketType.Unknown;
        
        packet.srcMac = data.match(/(?<=(^|\s)(SA|TA):).{17}(?=$|\s)/i)?.[0] ?? null;

        packet.dstMac = data.match(/(?<=(^|\s)(DA|RA):).{17}(?=$|\s)/i)?.[0] ?? null;
        
        packet.bssid = data.match(/(?<=(^|\s)BSSID:).{17}(?=$|\s)/i)?.[0] ?? null;

        // Cover special cases with more data
        let newPacket;
        switch(packet.packetType){
            case PacketType.Beacon:
            case PacketType.ProbeRequest:
            case PacketType.ProbeResponse:
            case PacketType.AssociationRequest:
                newPacket = new PacketWithSSID();
                newPacket.ssid = data.match(new RegExp('(?<=(^|\\s)'+ packetTypeStr +'\\s\\().{0,32}(?=\\)($|\\s))', 'i'))?.[0] ?? null;
                break;
            
            case PacketType.Authentication:
                newPacket = new AuthenticationPacket();
                newPacket.authenticationType = AUTHENTICATION_TYPE_MAP[data.match(/(?<=(^|\s)Authentication\s).{3,}(?=\:(\s|$))/i)[0]] ?? AuthenticationType.Unknown;
                break;

            case PacketType.AssociationResponse:
                newPacket = new AssociationResponsePacket();
                newPacket.associationIsSuccessful = data.match(/(?<=(^|\s)Assoc\sResponse\s.{0,30})Successful(?=\s|$)/img) ? true : false;
                break;

            case PacketType.Disassociation:
                newPacket = new DisassociationPacket();
                newPacket.disassociationReason = data.match(/(?<=(^|\s)Disassociation:\s).*?(?=\sBSS|$)/img)?.[0] ?? null;
                break;
        }
        if(newPacket) packet = Object.assign(newPacket, packet);   // Use new, more specific, packet and copy old data over

        return packet;
    }

    _handlePayload(packet, data){
        // Get payload-Hex-Data. If there is no data: empty
        packet.payloadData = data.join('').match(/(?<=\s)([A-F0-9]{1,4}(?!(\.|x)))/igm)?.join('') ?? '';

        return packet;
    }
}

// Specify exports
module.exports = {
    PacketStreamFactory
};