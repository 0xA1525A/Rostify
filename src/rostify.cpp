#include <iostream>
#include <fstream>

#include <cstdlib>
#include <csignal>
#include <unistd.h>
#include <cstring>
#include <string>
#include <vector>

#include "argon2.h"
#include "libs/rf_io.hpp"

int main(void) {
    rf_io::out::print<RfIO_PrintMethod::INFO>("HELLO WORLD!\n");
    rf_io::out::print<RfIO_PrintMethod::CONTEXT>("Yahoo!\n");
}