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
    Unknown: 'Unknown'
}

class Packet{
    timestampMicros;

    srcMac;
    dstMac;
    bssid;

    signal;
    frequency;
    dataRate;

    packetType;
}

// Extensions of Packet
class PacketWithSSID extends Packet{
    ssid;
}

class BeaconPacket extends PacketWithSSID{}
class ProbeRequestPacket extends PacketWithSSID{}
class ProbeResponsePacket extends PacketWithSSID{}


// Specify exports
module.exports = {
    PacketType,
    Packet,
    PacketWithSSID,
    BeaconPacket,
    ProbeRequestPacket,
    ProbeResponsePacket
};
