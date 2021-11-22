#ifndef C42FA9F6_8CF3_453F_8FA0_918E543DCD59
#define C42FA9F6_8CF3_453F_8FA0_918E543DCD59

#include <string>

enum PacketType {
    Beacon,
    ProbeRequest,
    ProbeResponse,
    Data,
    RequestToSend,
    ClearToSend,
    Acknowledgment,
    BlockAcknowledgment,
    NoData,
    Unknown
};
const std::array<const char*, 10> PACKET_TYPE_NAMES({{
    "Beacon",
    "Probe Request",
    "Probe Response",
    "Data",
    "Request to send",
    "Clear to send",
    "Acknowledgment",
    "BlockAcknowledgment",
    "NoData",
    "Unknown"
}});

struct Packet {
    uint64_t timestampMicros;

    std::string srcMac;
    std::string dstMac;
    std::string bssid;

    unsigned int payloadSize;
    
    char signal;
    unsigned int frequency;
    unsigned char dataRate;

    PacketType type;
};

#endif /* C42FA9F6_8CF3_453F_8FA0_918E543DCD59 */
