#ifndef EFFCCB40_3639_4BD4_9649_302F05987909
#define EFFCCB40_3639_4BD4_9649_302F05987909

#include <future>
#include <string.h>
#include "bufHandler.hpp"

void asyncHandler(char *buf){
        // Create a copy of buf for our thread
        char bufCopy[265];
        strcpy(buf, bufCopy);

        // \/ Surpress unused warning
        (void)std::async(std::launch::async, bufHandler, bufCopy);
    }
#endif /* EFFCCB40_3639_4BD4_9649_302F05987909 */
