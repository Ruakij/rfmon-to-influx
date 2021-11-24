const logger = require.main.require("./helper/logger.js")("PacketStreamFactory");
const { Transform } = require('stream');
const { DateTime } = require("luxon");
const { PacketType, Packet, PacketWithSSID, BeaconPacket, ProbeRequestPacket, ProbeResponsePacket, AuthenticationPacket, AuthenticationType, AssociationResponsePacket, DisassociationPacket, HandshakePacket, HandshakeStage } = require.main.require('./dto/Packet.js');
const hexConv = require.main.require("./helper/hexConverter.js");

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
                newPacket.associationIsSuccessful = data.match(/(?<=(^|\s)Assoc\sResponse\s.{0,30})Successful(?=\s|$)/i) ? true : false;
                break;

            case PacketType.Disassociation:
                newPacket = new DisassociationPacket();
                newPacket.disassociationReason = data.match(/(?<=(^|\s)Disassociation:\s).*$/i)?.[0] ?? null;
                break;
        }
        if(newPacket) packet = Object.assign(newPacket, packet);   // Use new, more specific, packet and copy old data over

        return packet;
    }

    _handlePayload(packet, data){
        data = data.join('');

        // Get payload-Hex-Data. If there is no data: empty
        packet.payloadData = hexConv.hexToBytes(data.match(/(?<=\s)([A-F0-9]{1,4}(?!(\.|x)))/igm)?.join('') ?? '');

        // Cover special cases with more data
        let newPacket;
        switch(packet.packetType){
            case PacketType.Handshake:
                newPacket = new HandshakePacket();

                // Read key-information
                let keyInfoRaw = (packet.payloadData[0x5]<<0x8) + packet.payloadData[0x6];
                let keyInfo = {
                    "KeyDescriptorVersion": keyInfoRaw>>0 & 0b111,
                    "KeyType":  keyInfoRaw>>3 & 0b1,
                    "KeyIndex": keyInfoRaw>>4 & 0b11,
                    "Install":  keyInfoRaw>>6 & 0b1,
                    "KeyACK":   keyInfoRaw>>7 & 0b1,
                    "KeyMIC":   keyInfoRaw>>8 & 0b1,
                    "Secure":   keyInfoRaw>>9 & 0b1,
                    "Error":    keyInfoRaw>>10 & 0b1,
                    "Request":  keyInfoRaw>>11 & 0b1,
                    "EncryptedKeyData": keyInfoRaw>>12 & 0b1,
                    "SMKMessage":       keyInfoRaw>>13 & 0b1,
                };

                newPacket.handshakeStage =  (!keyInfo.Install &&  keyInfo.KeyACK && !keyInfo.KeyMIC && !keyInfo.Secure)? HandshakeStage[1] :
                                            (!keyInfo.Install && !keyInfo.KeyACK &&  keyInfo.KeyMIC && !keyInfo.Secure)? HandshakeStage[2] :
                                            ( keyInfo.Install &&  keyInfo.KeyACK &&  keyInfo.KeyMIC &&  keyInfo.Secure)? HandshakeStage[3] :
                                            (!keyInfo.Install && !keyInfo.KeyACK &&  keyInfo.KeyMIC &&  keyInfo.Secure)? HandshakeStage[4] :
                                            null;
                break;
        }
        if(newPacket) packet = Object.assign(newPacket, packet);

        return packet;
    }
}

// Specify exports
module.exports = {
    PacketStreamFactory
};