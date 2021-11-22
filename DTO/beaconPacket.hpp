#ifndef FDDB997A_BCD3_4056_BFEA_9FF6A548DACF
#define FDDB997A_BCD3_4056_BFEA_9FF6A548DACF

#include "./packet.hpp"
#include <string>

class BeaconPacket : Packet{
public:
    std::string ssid;
};

#endif /* FDDB997A_BCD3_4056_BFEA_9FF6A548DACF */
