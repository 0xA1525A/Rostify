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

int main(void) {
    // initialise...
    rf_io::out::print<RfIO_MessageType::PROCESS>("INTITIALISING ROSTIFY...\n");
    rf_io::out::print<RfIO_MessageType::NONE>(rf_fs::info::is_directory("src/libs/rf_fs") ? "YES" : "NO");

    // program loop...

    // terminating...
}