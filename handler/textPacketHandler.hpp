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
#include "../helper/vector-stats.hpp"
#include <unordered_map>

const std::unordered_map<std::string, PacketType> PACKET_TYPE_MAP({
    {"Beacon", PacketType::Beacon},
    {"Probe Request", PacketType::ProbeRequest},
    {"Probe Response", PacketType::ProbeResponse},
    {"Data", PacketType::Data},
    {"Request-To-Send", PacketType::RequestToSend},
    {"Clear-To-Send", PacketType::ClearToSend},
    {"Acknowledgment", PacketType::Acknowledgment},
    {"BA", PacketType::BlockAcknowledgment}
});

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
    // SA and DA are src- and dst-Addresses
    // BSSID is the used bssid
    // TA and RA are transmitter- and receiver-address  which are used exclusively for RTS and CTS in tcpdump
    //  BEWARE: SA, DA, BSSID, TA and RA can be used together, but tcpdump doesnt display all of them!
    //           DA might also not be a valid MAC-address, but Broadcast or an encoded IPv4/6 Multicast-address
    int saIndex = findContains(headerData, "SA:", 1);
    std::string sAddr = (saIndex != -1) ? headerData[saIndex].substr("SA:"s.length()) : "";

    int daIndex = findContains(headerData, "DA:", 1);
    std::string dAddr = (daIndex != -1) ? headerData[daIndex].substr("DA:"s.length()) : "";

    int bssidIndex = findContains(headerData, "BSSID:", 1);
    std::string bssidAddr = (bssidIndex != -1) ? headerData[bssidIndex].substr("BSSID:"s.length()) : "";

    int taIndex = findContains(headerData, "TA:", 1);
    std::string tAddr = (taIndex != -1) ? headerData[taIndex].substr("TA:"s.length()) : "";

    int raIndex = findContains(headerData, "RA:", 1);
    std::string rAddr = (raIndex != -1) ? headerData[raIndex].substr("RA:"s.length()) : "";

    // Depending of when which address-fields are actually set, choose which ones to use
    if(sAddr == "" && tAddr != "") sAddr = tAddr;
    if(dAddr == "" && rAddr != "") dAddr = rAddr;

    // Set addresses to packet
    packet.srcMac = sAddr;
    packet.dstMac = dAddr;
    packet.bssid = bssidAddr;

    // Identify type of packet
    //  -> comes right after the addresses
    int typeIndex = max(std::vector({saIndex, daIndex, bssidIndex, taIndex, raIndex}))+1;
    PacketType type = PacketType::Unknown;
    if(typeIndex == headerData.size()) type = PacketType::NoData;
    else {
        std::string textType = headerData[typeIndex];

        // Check for incomplete types
        if(textType == "Probe"){
            textType += " "+ headerData[typeIndex+1];
        }

        // If type is in map, use map-value, otherwise keep default
        if(PACKET_TYPE_MAP.find(textType) != PACKET_TYPE_MAP.end())
            type = PACKET_TYPE_MAP[textType];
    }

    // 
}

#endif /* EE781A91_6D07_47AC_B3C4_F99E29F3731F */
