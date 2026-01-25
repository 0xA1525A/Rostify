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
    std::string file_a_content = rf_fs::read("./src/templates/databases/staff_roles.sql");
    rf_io::out::print<RfIO_MessageType::NONE>(file_a_content.c_str());
    rf_fs::create::file("test");
    rf_fs::write("test", file_a_content);
    rf_fs::append("test", "hi");
    rf_fs::append("test", "\nhello");

}