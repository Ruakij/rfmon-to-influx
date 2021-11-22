#ifndef C251BA62_6D80_4033_86B6_61F184E6F250
#define C251BA62_6D80_4033_86B6_61F184E6F250

#include <string>
#include "textPacketHandler.hpp"

using namespace std::string_literals;

std::string buffer = "";
void bufHandler(char *buf){
    // When first char of buf has text (no space), we got a new packet
    if(buf[0] != ' '){
        // Submit the just-read text-packet
        textPacketHandler(buffer);
        buffer = buf;
    }else{
        // Append part-packet
        buffer += "\n"s + buf;
    }
}

#endif /* C251BA62_6D80_4033_86B6_61F184E6F250 */
