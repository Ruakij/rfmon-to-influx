#ifndef B89BC3C5_AD59_4765_AA06_8110111D316F
#define B89BC3C5_AD59_4765_AA06_8110111D316F

#include <cstdio>
#include <stdexcept>

/// @brief Executes given command and optionally sends buffer to handler
/// @param cmd is the command
/// @param handler is the handler(char*)-function
/// @return Return-code form command
int exec(const char* cmd, void (*handler)(const char*) = nullptr){
    const int buf_size = 512;
    char buf[buf_size];

    // Open execution-pipe
    FILE *pipe = popen(cmd, "r");
    
    if (!pipe) {
        throw std::runtime_error("popen() failed!");
    }
    while (fgets(buf, buf_size, pipe) != nullptr) {

        // When a handler is specified, call it
        if(handler != nullptr) (*handler)(buf);
    }

    // Close pipe and read exit-code
    return WEXITSTATUS(pclose(pipe));
}

#endif /* B89BC3C5_AD59_4765_AA06_8110111D316F */
