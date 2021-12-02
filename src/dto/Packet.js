const PacketType = {
    Beacon: "Beacon",
    ProbeRequest: "ProbeRequest",
    ProbeResponse: "ProbeResponse",
    Data: "Data",
    RequestToSend: "RequestToSend",
    ClearToSend: "ClearToSend",
    Acknowledgment: "Acknowledgment",
    BlockAcknowledgment: "BlockAcknowledgment",
    NoData: "NoData",
    Authentication: "Authentication",
    AssociationRequest: "AssociationRequest",
    AssociationResponse: "AssociationResponse",
    Disassociation: "Disassociation",
    Handshake: "Handshake",
    Unknown: "Unknown"
};

const FlagType = {
    MoreFragments: "MoreFragments",
    Retry: "Retry",
    PwrMgt: "PwrMgt",
    MoreData: "MoreData",
    Protected: "Protected",
    Order: "Order"
};

class Packet{
    timestampMicros;

    flags = {};

    srcMac;
    dstMac;
    bssid;

    signal;
    frequency;
    dataRate;

    durationMicros;

    payloadData;
    get payloadSize(){
        return this.payloadData.length;
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
    OpenSystem_1: "OpenSystem_1",
    OpenSystem_2: "OpenSystem_2",
    Unknown: "Unknown",
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


const HandshakeStage = {
    1: "1",
    2: "2",
    3: "3",
    4: "4"
}
class HandshakePacket extends Packet{
    handshakeStage;
}

// Specify exports
module.exports = {
    PacketType,
    FlagType,
    Packet,
    PacketWithSSID,
    BeaconPacket,
    ProbeRequestPacket,
    ProbeResponsePacket,
    AuthenticationType,
    AuthenticationPacket,
    AssociationRequestPacket,
    AssociationResponsePacket,
    DisassociationPacket,
    HandshakeStage,
    HandshakePacket,
};
