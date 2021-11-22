#ifndef C251BA62_6D80_4033_86B6_61F184E6F250
#define C251BA62_6D80_4033_86B6_61F184E6F250

#include <future>
#include <string>
#include "textPacketHandler.hpp"

using namespace std::string_literals;

std::vector<std::string> buffer;
void bufHandler(const char *buf){
    // When first char of buf has text (no tab), we got a new packet
    if(buf[0] != '\t'){
        // Submit the just-read text-packet in a new thread
        if(buffer.size() != 0) {
            (void)std::async(std::launch::async, textPacketHandler, buffer);
        }
        buffer = {std::string(buf)};
    }
    else
        buffer.push_back(std::string(buf));     // Append part-packet
}

#endif /* C251BA62_6D80_4033_86B6_61F184E6F250 */
