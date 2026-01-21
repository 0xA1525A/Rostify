#pragma once

#include <cstdint>

enum class RfIO_PrintMethod : std::uint8_t {
    DEBUG    = 0,
    STANDARD = 1,
    INFO     = 2,
    WARNING  = 3,
    ERROR    = 4,
    CONTEXT  = 5
};

namespace rf_io {
    namespace in {
        
    }

    namespace out {
        template<RfIO_PrintMethod method, typename... RfIO_FormatArgs>
        void print(const char* message, const RfIO_FormatArgs... args) noexcept {
            constexpr const char* prefix =
                method == RfIO_PrintMethod::DEBUG    ? "[d]" :
                method == RfIO_PrintMethod::STANDARD ? ">>>" :
                method == RfIO_PrintMethod::INFO     ? "(i)" :
                method == RfIO_PrintMethod::WARNING  ? " **" :
                method == RfIO_PrintMethod::ERROR    ? "[!]" :
                method == RfIO_PrintMethod::CONTEXT  ? " : " : "   ";

            std::printf("%s ", prefix);
            
            if constexpr (sizeof...(RfIO_FormatArgs) == 0) [[likely]] {
                std::printf("%s", message);
            }
            else [[unlikely]] {
                std::printf(message, args...);
            }

            std::fflush(stdout);
        }
    }
}