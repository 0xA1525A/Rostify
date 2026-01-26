#include <iostream>
#include <filesystem>
#include <cstdlib>
#include <csignal>
#include <unistd.h>
#include <cstring>
#include <string>
#include <vector>

#include "argon2.h"
#include "libs/rf_io.hpp"
#include "libs/rf_fs.hpp"

int main(/*int argc, char* argv[]*/ void) {
    rf_io::out::prompt<RfIO_PromptType::NORMAL>("test?");
}