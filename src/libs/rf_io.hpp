#pragma once

#include <cstdint>
#include <format>
#include <optional>
#include <cstring>

enum class RfIO_MessageType : std::uint8_t {
    NONE     = 0,
    DEBUG    = 1,
    NORMAL   = 2,
    INFO     = 3,
    QUESTION = 4,
    PROCESS  = 5,
    WARNING  = 6,
    ERROR    = 7,
    CONTEXT  = 8,
    INDENT   = 9
};

enum class RfIO_PromptType : std::uint8_t {
    NONE     = 0,
    BOOLEAN  = 1,
    RANGE    = 2,
    NORMAL   = 3
};

constexpr const char* const RFIO_MESSAGE_TYPE_PREFIXES[10] = {
    "", "[d] ", ">>> ", "[i] ", "[?] ", "[/] ", " ** ", "[!] ", " :  ", "    "
};

constexpr const char* const RFIO_PROMPT_TYPE_SIGNS[4] = {
    "", "[{}/{}] ", "[{}-{}] ", "> "
};

namespace rf_io {
    namespace in {
        bool _is_confirmed() noexcept;

        std::string get_line(const std::optional<bool> require_confirmation = false) noexcept;
        std::string select_option(const char* options[], const std::optional<bool> require_confirmation = false) noexcept;
        char keypress(const std::optional<bool> require_confirmation = false) noexcept;
    }

    namespace out {
        template<RfIO_MessageType message_type>
        constexpr const char* _get_prefix(void) noexcept {
            return RFIO_MESSAGE_TYPE_PREFIXES[static_cast<std::size_t>(message_type)];
        }

        template<RfIO_PromptType prompt_type>
        constexpr const char* _get_prompt_sign(void) noexcept {
            return RFIO_PROMPT_TYPE_SIGNS[static_cast<std::size_t>(prompt_type)];
        }

        template<RfIO_MessageType message_type, typename... RfIO_FormatArgs>
        void print(const char* message, const RfIO_FormatArgs... args) noexcept {
            constexpr const char* prefix = _get_prefix<message_type>();
            std::printf("%s", std::format("{}", prefix).c_str());

            if constexpr (sizeof...(RfIO_FormatArgs) == 0)
                std::printf("%s", message);
            else {;
                std::printf("%s", std::vformat(message, std::make_format_args(args...)).c_str());
            }

            std::fflush(stdout);
        }

        template<RfIO_PromptType prompt_type, typename... RfIO_FormatArgs>
        void prompt(const char* message, const RfIO_FormatArgs... args) noexcept {
            constexpr const char* prompt_sign = _get_prompt_sign<prompt_type>();

            const std::size_t message_length = std::strlen(message);
            std::string formatted_message;
            if (message[std::max(static_cast<std::size_t>(0), message_length - 1)] == '\n')
                formatted_message = std::format("{}    {}", message, prompt_sign);
            else
                formatted_message = std::format("{}\n    {}", message, prompt_sign);

            rf_io::out::print<RfIO_MessageType::QUESTION>(formatted_message.c_str(), args...);
            std::fflush(stdout);
        }
    }
}