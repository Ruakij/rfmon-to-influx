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
#include "../helper/find.hpp"

void textPacketHandler(std::vector<std::string> textPacket){
    /// Here we have to parse the packet
    // Create empty packet
    Packet packet;

    const std::string textHeader = textPacket[0];

    const std::vector<std::string> headerData = split(textHeader, ' ');

    std::string textTimestamp = headerData[0];
    uint64_t timestamp = convertStringToTimestampMicros(textTimestamp);

    // Find remaining data based on keys in/around fields
    int linkSpeedIndex = findIs(headerData, "Mb/s", 1, 1);
    packet.dataRate = std::stoi(headerData[linkSpeedIndex]);

    int frequencyIndex = findIs(headerData, "MHz", 1, 1);
    packet.frequency = std::stoi(headerData[frequencyIndex]);

    int signalIndex = findIs(headerData, "signal", 1, 1);
    std::string signalText = headerData[signalIndex].substr(0, 3);
    packet.signal = std::stoi(signalText);

    // Addresses seem complicated at first, but just have many fields which might be available.
}

#endif /* EE781A91_6D07_47AC_B3C4_F99E29F3731F */
