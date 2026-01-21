#!/bin/sh

g++ -o ./app/rostify \
    -std=c++23 \
    -O2 \
    -fno-plt \
    -Wall \
    -Wextra \
    -Wpedantic \
    -Werror \
    -Wshadow \
    -Wconversion \
    -Wsign-conversion \
    -Wnull-dereference \
    -Wdouble-promotion \
    -Wformat=2 \
    -Wcast-qual \
    -Wcast-align \
    -Wold-style-cast \
    -Wlogical-op \
    -Wduplicated-cond \
    -Wduplicated-branches \
    -Wundef \
    -fno-common \
    -fstack-protector-strong \
    -D_FORTIFY_SOURCE=3 \
    -fPIE \
    -pie \
    -Wl,-z,relro \
    -Wl,-z,now \
    -Wl,-z,noexecstack \
    -fvisibility=hidden \
    ./src/rf_io.cpp \
    ./src/rostify.cpp