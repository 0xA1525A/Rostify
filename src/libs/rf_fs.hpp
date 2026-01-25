#pragma once

#include <filesystem>
#include <string>

constexpr const char* const RFFS_INVALID_FILE_CONTENT = "__RfFS_InvalidFileContent__";

namespace rf_fs {
    std::string read(const std::filesystem::path& path) noexcept;
    bool        write(const std::filesystem::path& path, const std::string_view data) noexcept;
    bool        append(const std::filesystem::path& path, const std::string_view data) noexcept;
    bool        move(const std::filesystem::path& path_old, const std::filesystem::path& path_new) noexcept;
    bool        copy(const std::filesystem::path& path_from, const std::filesystem::path& path_to) noexcept;

    namespace info {
        bool is_exists(const std::filesystem::path& path) noexcept;
        bool is_file(const std::filesystem::path& path) noexcept;
        bool is_directory(const std::filesystem::path& path) noexcept;
    }

    namespace create {
        bool file(const std::filesystem::path& path) noexcept;
        bool directory(const std::filesystem::path& path) noexcept;
    }

    namespace remove {
        bool _soft_remove(const std::filesystem::path& path) noexcept;
        bool file(const std::filesystem::path& path) noexcept;
        bool directory(const std::filesystem::path& path) noexcept;
    }
}