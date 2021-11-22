#ifndef EE781A91_6D07_47AC_B3C4_F99E29F3731F
#define EE781A91_6D07_47AC_B3C4_F99E29F3731F

#include <string>
#include "../DTO/packet.hpp"
#include <vector>
#include <sstream>
#include <locale>
#include <iomanip>
#include "../helper/split.hpp"
#include "../helper/timestampConvert.hpp"

void textPacketHandler(std::vector<std::string> textPacket){
    /// Here we have to parse the packet
    // Create empty packet
    Packet packet;

    const std::string textHeader = textPacket[0];

    const std::vector<std::string> headerData = split(textHeader, ' ');

    std::string textTimestamp = headerData[0];
    uint64_t timestamp = convertStringToTimestampMicros(textTimestamp);

}

#endif /* EE781A91_6D07_47AC_B3C4_F99E29F3731F */
