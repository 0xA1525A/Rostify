#include <filesystem>
#include <string>

#include "rf_fs.hpp"

namespace rf_fs {
    std::string read(const std::filesystem::path& path) noexcept;
    bool        write(const std::filesystem::path& path, const std::string_view data) noexcept;
    bool        append(const std::filesystem::path& path, const std::string_view data) noexcept;

    namespace info {
        bool is_exists(const std::filesystem::path& path) noexcept {
            std::error_code error_code;

            return std::filesystem::exists(path, error_code);
        }

        bool is_file(const std::filesystem::path& path) noexcept {
            std::error_code error_code;

            return std::filesystem::is_regular_file(path, error_code);
        }

        bool is_directory(const std::filesystem::path& path) noexcept {
            std::error_code error_code;

            return std::filesystem::is_directory(path, error_code);
        }

        bool is_readable(const std::filesystem::path& path) noexcept;
        bool is_writable(const std::filesystem::path& path) noexcept;
        bool is_executable(const std::filesystem::path& path) noexcept;
    }

    namespace create {
        bool file(const std::filesystem::path& path) noexcept;
        bool directory(const std::filesystem::path& path) noexcept;
    }

    namespace destroy {
        bool file(const std::filesystem::path& path) noexcept;
        bool directory(const std::filesystem::path& path) noexcept;
    }
}