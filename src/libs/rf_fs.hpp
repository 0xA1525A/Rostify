#pragma once

#include <filesystem>
#include <string>

namespace rf_fs {
    std::string read(const std::filesystem::path& path) noexcept;
    bool        write(const std::filesystem::path& path, const std::string_view data) noexcept;
    bool        append(const std::filesystem::path& path, const std::string_view data) noexcept;

    namespace info {
        bool is_exists(const std::filesystem::path& path) noexcept;
        bool is_file(const std::filesystem::path& path) noexcept;
        bool is_directory(const std::filesystem::path& path) noexcept;

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