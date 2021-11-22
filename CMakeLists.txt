cmake_minimum_required(VERSION 3.0.0)
project(rfmon-to-influx VERSION 0.1.0)

include(CTest)
enable_testing()

add_executable(rfmon-to-influx main.cpp)

target_link_libraries(rfmon-to-influx pthread)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
