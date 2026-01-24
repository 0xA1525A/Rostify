#pragma once

#include <cstdint>

enum class RfIO_MessageType : std::uint8_t {
    DEBUG    = 0,
    STANDARD = 1,
    INFO     = 2,
    PROCESS  = 3,
    WARNING  = 4,
    ERROR    = 5,
    CONTEXT  = 6
};

constexpr const char* const RFIO_MESSAGE_TYPE_PREFIXES[8] = {
    "[d]", ">>>", "[i]", "[/]", " **", "[!]", " : ", "   "
};

namespace rf_io {
    namespace in {
        
    }

    namespace out {
        template<RfIO_MessageType message_type>
        constexpr const char* _get_prefix(void) noexcept {
            return RFIO_MESSAGE_TYPE_PREFIXES[static_cast<std::size_t>(message_type)];
        }

        template<RfIO_MessageType message_type, typename... RfIO_FormatArgs>
        void print(const char* message, const RfIO_FormatArgs... args) noexcept {
            constexpr const char* prefix = _get_prefix<message_type>();
            std::printf("%s ", prefix);
            
            if constexpr (sizeof...(RfIO_FormatArgs) == 0) [[likely]]
                std::printf("%s", message);
            else [[unlikely]]
                std::printf(message, args...);

            std::fflush(stdout);
        }
    }
}