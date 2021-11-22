#ifndef B199B4B3_BE27_4F0C_8DBE_5E78580AB1A9
#define B199B4B3_BE27_4F0C_8DBE_5E78580AB1A9

#include "./packet.hpp"
#include <string>

class ProbeResponsePacket : public Packet{
public:
    ProbeResponsePacket()
    {}
    ProbeResponsePacket(const Packet &packet)
        : Packet(packet)
    {}

    std::string responseSsid;
};

#endif /* B199B4B3_BE27_4F0C_8DBE_5E78580AB1A9 */
