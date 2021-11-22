#ifndef C251BA62_6D80_4033_86B6_61F184E6F250
#define C251BA62_6D80_4033_86B6_61F184E6F250

#include <string>
#include "textPacketHandler.hpp"

using namespace std::string_literals;

std::vector<std::string> buffer;
void bufHandler(char *buf){
    // When first char of buf has text (no tab), we got a new packet
    if(buf[0] != '\t'){
        // Submit the just-read text-packet
        if(buffer.size() != 0) textPacketHandler(buffer);
        buffer = std::vector<std::string>();
    }

    // Append part-packet
    buffer.push_back(buf);
}

#endif /* C251BA62_6D80_4033_86B6_61F184E6F250 */
