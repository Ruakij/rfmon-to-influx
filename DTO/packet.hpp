#ifndef C42FA9F6_8CF3_453F_8FA0_918E543DCD59
#define C42FA9F6_8CF3_453F_8FA0_918E543DCD59

#include <string>

struct Packet {
    uint64_t timestampMicros;

    std::string srcMac;
    std::string dstMac;

    unsigned int payloadSize;
    
    char signal;
    unsigned int frequency;
    unsigned char dataRate;

    std::string type;
};

#endif /* C42FA9F6_8CF3_453F_8FA0_918E543DCD59 */
