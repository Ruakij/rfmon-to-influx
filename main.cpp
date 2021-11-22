#include <stdio.h>
#include <string>
#include "./helper/exec.hpp"
#include "./handler/bufHandler.hpp"

const std::string tcpdump_baseCmd = "tcpdump -vvv -e -n -X -s0 -i ";

int main(int argc, char *args[]){

    std::string tcpdump_cmd;
    if(argc == 2){
        tcpdump_cmd = tcpdump_baseCmd + args[1];
    } else {
        fprintf(stderr, "Missing interface\n");
        exit(1);
    }
    
    int exitCode = exec(tcpdump_cmd.c_str(), &bufHandler);

    if(exitCode){
        fprintf(stderr, "\ntcpdump exited with non-zero ExitCode: %d\n Something went wrong! Check tcpdump-output for more information.\n", exitCode);
        exit(1);
    }

    return 0;
}
