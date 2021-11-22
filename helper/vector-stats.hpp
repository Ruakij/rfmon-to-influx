#ifndef C437A277_1F23_496D_9B69_A21D771ECA91
#define C437A277_1F23_496D_9B69_A21D771ECA91

#include <vector>
#include <limits.h>

int max(std::vector<int> vec){
    int max = INT_MIN;
    for(int i=0; i<vec.size(); ++i){
        if(vec[i] > max) max = vec[i];
    }
    return max;
}

#endif /* C437A277_1F23_496D_9B69_A21D771ECA91 */
