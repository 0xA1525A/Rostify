#include <filesystem>
#include <fstream>
#include <string>

#include "rf_fs.hpp"

namespace rf_fs {
    std::string read(const std::filesystem::path& path) noexcept {
        if (!rf_fs::info::is_file(path))
            return RFFS_INVALID_FILE_CONTENT;

        std::ifstream file(path, std::ios::binary);
        if (!file.is_open())
            return RFFS_INVALID_FILE_CONTENT;

        file.seekg(0, std::ios::end);
        if (!file)
            return RFFS_INVALID_FILE_CONTENT;

        const std::ifstream::pos_type pos_end = file.tellg();
        if (pos_end < 0)
            return RFFS_INVALID_FILE_CONTENT;

        const std::size_t file_size = static_cast<std::size_t>(pos_end);
        if (file_size == 0)
            return std::string{};

        std::string file_content(file_size, '\0');
        file_content.resize(file_size);

        file.seekg(0, std::ios::beg);
        if (!file)
            return RFFS_INVALID_FILE_CONTENT;

        const std::streamsize file_stream_size = static_cast<std::streamsize>(file_size);

        file.read(file_content.data(), file_stream_size);
        if (file.gcount() != file_stream_size)
            return RFFS_INVALID_FILE_CONTENT;

        return file_content;
    }

    bool write(const std::filesystem::path& path, const std::string_view data) noexcept {
        if (!rf_fs::info::is_file(path))
            return false;

        std::ofstream file(path, std::ios::out | std::ios::binary | std::ios::trunc);
        if (!file.is_open())
            return false;

        file.write(data.data(), static_cast<std::streamsize>(data.size()));
        if (!file.good())
            return false;

        file.flush();
        return true;
    }

    bool append(const std::filesystem::path& path, const std::string_view data) noexcept {
        if (!rf_fs::info::is_file(path))
            return false;

        std::ofstream file(path, std::ios::out | std::ios::binary | std::ios::app);
        if (!file.is_open())
            return false;

        file.write(data.data(), static_cast<std::streamsize>(data.size()));
        if (!file.good())
            return false;

        file.flush();
        return true;
    }

    bool move(const std::filesystem::path& path_old, const std::filesystem::path& path_new) noexcept {
        if (!rf_fs::info::is_file(path_old) || rf_fs::info::is_file(path_new))
            return false;

        std::error_code error_code;
        std::filesystem::rename(path_old, path_new, error_code);

        return !static_cast<bool>(error_code);
    }

    bool copy(const std::filesystem::path& path_from, const std::filesystem::path& path_to) noexcept {
        if (!rf_fs::info::is_file(path_from) || rf_fs::info::is_file(path_to))
            return false;

        std::error_code error_code;
        std::filesystem::copy_file(path_from, path_to, std::filesystem::copy_options::none, error_code);

        return !static_cast<bool>(error_code);
    }

    namespace info {
        bool is_exists(const std::filesystem::path& path) noexcept {
            std::error_code error_code;

            return std::filesystem::exists(path, error_code);
        }

        bool is_file(const std::filesystem::path& path) noexcept {
            std::error_code error_code;

            return rf_fs::info::is_exists(path) && std::filesystem::is_regular_file(path, error_code);
        }

        bool is_directory(const std::filesystem::path& path) noexcept {
            std::error_code error_code;

            return rf_fs::info::is_exists(path) && std::filesystem::is_directory(path, error_code);
        }
    }

    namespace create {
        bool file(const std::filesystem::path& path) noexcept {
            if (rf_fs::info::is_file(path))
                return false;

            std::ofstream file(path, std::ios::out | std::ios::binary);
            if (!file.is_open())
                return false;

            file.close();
            return true;
        }

        bool directory(const std::filesystem::path& path) noexcept {
            if (rf_fs::info::is_directory(path))
                return false;

            std::error_code error_code;
            std::filesystem::create_directory(path, error_code);

            return !static_cast<bool>(error_code);
        }
    }

    namespace remove {
        bool _soft_remove(const std::filesystem::path& path) noexcept {
            std::error_code error_code;

            if (!std::filesystem::remove(path, error_code))
                return false;

            return !static_cast<bool>(error_code);
        }

        bool file(const std::filesystem::path& path) noexcept {
            if (!rf_fs::info::is_file(path))
                return false;

            return _soft_remove(path);
        }

        bool directory(const std::filesystem::path& path) noexcept {
            if (!rf_fs::info::is_directory(path))
                return false;

            return _soft_remove(path);
        }
    }
}