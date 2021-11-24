const PacketType = {
    Beacon: 'Beacon',
    ProbeRequest: 'ProbeRequest',
    ProbeResponse: 'ProbeResponse',
    Data: 'Data',
    MoreData: 'MoreData',
    RequestToSend: 'RequestToSend',
    ClearToSend: 'ClearToSend',
    Acknowledgment: 'Acknowledgment',
    BlockAcknowledgment: 'BlockAcknowledgment',
    NoData: 'NoData',
    Authentication: 'Authentication',
    AssociationRequest: 'AssociationRequest',
    AssociationResponse: 'AssociationResponse',
    Disassociation: 'Disassociation',
    Unknown: 'Unknown'
}

class Packet{
    timestampMicros;
    isRetry;

    srcMac;
    dstMac;
    bssid;

    signal;
    frequency;
    dataRate;

    payloadData;
    get payloadSize(){
        return payloadData.length/2;
    }

    packetType;
}

// Extensions of Packet
class PacketWithSSID extends Packet{
    ssid;
}

class BeaconPacket extends PacketWithSSID{}
class ProbeRequestPacket extends PacketWithSSID{}
class ProbeResponsePacket extends PacketWithSSID{}

const AuthenticationType = {
    OpenSystem_1: 'OpenSystem_1',
    OpenSystem_2: 'OpenSystem_2',
    Unknown: 'Unknown',
}
class AuthenticationPacket extends Packet{
    authenticationType;
}

class AssociationRequestPacket extends PacketWithSSID{}
class AssociationResponsePacket extends Packet{
    associationIsSuccessful;
}

class DisassociationPacket extends Packet{
    disassociationReason;
}

// Specify exports
module.exports = {
    PacketType,
    Packet,
    PacketWithSSID,
    BeaconPacket,
    ProbeRequestPacket,
    ProbeResponsePacket,
    AuthenticationType,
    AuthenticationPacket,
    AssociationRequestPacket,
    AssociationResponsePacket,
};
