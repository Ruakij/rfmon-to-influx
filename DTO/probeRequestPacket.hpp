#ifndef CD2BF199_8153_4F10_A85C_50883FAD66A8
#define CD2BF199_8153_4F10_A85C_50883FAD66A8

#include "./packet.hpp"
#include <string>

class ProbeRequestPacket : Packet{
    std::string requestSSID;
};

#endif /* CD2BF199_8153_4F10_A85C_50883FAD66A8 */
