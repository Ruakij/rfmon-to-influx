#ifndef EE781A91_6D07_47AC_B3C4_F99E29F3731F
#define EE781A91_6D07_47AC_B3C4_F99E29F3731F

#include <string>
#include "../DTO/packet.hpp"
#include <vector>
#include <sstream>
#include <locale>
#include <iomanip>

std::vector<std::string> split(const std::string& s, char delimiter)
{
   std::vector<std::string> tokens;
   std::string token;
   std::istringstream tokenStream(s);
   while (std::getline(tokenStream, token, delimiter))
   {
      tokens.push_back(token);
   }
   return tokens;
}

uint64_t convertStringToTimestampMicros(std::string textTimestamp){
    uint64_t timestamp;

    std::tm t = {};
    std::istringstream ssTimestamp = std::istringstream(textTimestamp);
    if (ssTimestamp >> std::get_time(&t, "%H:%M:%S"))
    {
        // Get current time
        std::time_t curT = std::time(0);
        std::tm* curTime = std::localtime(&curT);
        // Set missing fields
        t.tm_mday = curTime->tm_mday;
        t.tm_mon = curTime->tm_mon;
        t.tm_year = curTime->tm_year;
        t.tm_zone = curTime->tm_zone;

        // Convert tm to time
        std::time_t time = std::mktime(&t);

        // Get micros
        int micros = std::stoi(textTimestamp.substr(9, 6));

        // Calculate timestamp epoch in micros
        timestamp = time*1000000 + micros;
        return timestamp;
    }
    else
    {
        throw std::runtime_error("Could not parse time: '"+ textTimestamp +"'");
    }
}

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
