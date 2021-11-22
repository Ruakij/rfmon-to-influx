#ifndef C42FA9F6_8CF3_453F_8FA0_918E543DCD59
#define C42FA9F6_8CF3_453F_8FA0_918E543DCD59

#include <time.h>

struct Packet {
    uint64_t timestampMicros;

    char srcMac[17];
    char dstMac[17];

    unsigned int size;
    
    char signal;
    unsigned int frequency;
    unsigned char linkSpeed;
};

#endif /* C42FA9F6_8CF3_453F_8FA0_918E543DCD59 */
