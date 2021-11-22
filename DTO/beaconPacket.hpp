#ifndef FDDB997A_BCD3_4056_BFEA_9FF6A548DACF
#define FDDB997A_BCD3_4056_BFEA_9FF6A548DACF

#include "./packet.hpp"
#include <string>

class BeaconPacket : public Packet{
public:
    BeaconPacket()
    {}
    BeaconPacket(const Packet &packet)
        : Packet(packet)
    {}

    std::string ssid;
};

#endif /* FDDB997A_BCD3_4056_BFEA_9FF6A548DACF */
