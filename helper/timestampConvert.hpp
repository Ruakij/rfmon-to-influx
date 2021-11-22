#ifndef CC724CA7_8BB8_43B9_8A9A_54BD880A76AA
#define CC724CA7_8BB8_43B9_8A9A_54BD880A76AA

uint64_t convertStringToTimestampMicros(std::string textTimestamp){
    uint64_t timestamp;

    std::tm t = {};
    std::istringstream ssTimestamp = std::istringstream(textTimestamp);
    if (ssTimestamp >> std::get_time(&t, "%H:%M:%S"))
    {
        // Get current time
        std::time_t curT = std::time(0);
        std::tm* curTime = std::localtime(&curT);
        // Set missing fields
        t.tm_mday = curTime->tm_mday;
        t.tm_mon = curTime->tm_mon;
        t.tm_year = curTime->tm_year;
        t.tm_zone = curTime->tm_zone;

        // Convert tm to time
        std::time_t time = std::mktime(&t);

        // Get micros
        int micros = std::stoi(textTimestamp.substr(9, 6));

        // Calculate timestamp epoch in micros
        timestamp = time*1000000 + micros;
        return timestamp;
    }
    else
    {
        throw std::runtime_error("Could not parse time: '"+ textTimestamp +"'");
    }
}

#endif /* CC724CA7_8BB8_43B9_8A9A_54BD880A76AA */
