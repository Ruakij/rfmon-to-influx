#ifndef F7CFE6A7_34BF_4E04_94CF_DB8374980631
#define F7CFE6A7_34BF_4E04_94CF_DB8374980631

#include <vector>
#include <string>
#include <sstream>

std::vector<std::string> split(const std::string& s, char delimiter)
{
   std::vector<std::string> tokens;
   std::string token;
   std::istringstream tokenStream(s);
   while (std::getline(tokenStream, token, delimiter))
   {
      tokens.push_back(token);
   }
   return tokens;
}

#endif /* F7CFE6A7_34BF_4E04_94CF_DB8374980631 */
