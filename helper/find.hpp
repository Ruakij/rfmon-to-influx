#ifndef B6A9DEE0_30C6_4492_AB96_87D9C5C10E8B
#define B6A9DEE0_30C6_4492_AB96_87D9C5C10E8B

#include <string>
#include <vector>

void prepare(const int &size, int &start, const int &offset, int &end){
    // Set missing fields
    if(!end) end = size;

    // Edit start/end according to offset
    if(offset < 0)
        start += offset;
    else if(offset > 0)
        end -= offset;
}

int findContains(const std::vector<std::string> &data, const std::string &strContains, int start = 0, int offset = 0, int end = 0){
    prepare(data.size(), start, offset, end);

    for(int i=start; i<data.size()-offset; ++i){
        if(!data[i+offset].find(strContains))
            return i;
    }
    return -1;
}

int findIs(const std::vector<std::string> &data, const std::string &strIs, int start = 0, int offset = 0, int end = 0){
    prepare(data.size(), start, offset, end);

    for(int i=start; i<data.size()-offset; ++i){
        if(data[i+offset] == strIs)
            return i;
    }
    return -1;
}

#endif /* B6A9DEE0_30C6_4492_AB96_87D9C5C10E8B */
