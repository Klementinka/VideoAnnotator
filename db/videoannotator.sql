-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 27, 2025 at 10:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `videoannotator`
--

-- --------------------------------------------------------

--
-- Table structure for table `subtitles`
--

CREATE TABLE `subtitles` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `drive_id` varchar(100) NOT NULL,
  `video_id` int(100) NOT NULL,
  `format` enum('SRT','SUB','HTML','XML','JSON') NOT NULL,
  `subtitle_name` varchar(255) NOT NULL,
  `language` varchar(20) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subtitles`
--

INSERT INTO `subtitles` ( `drive_id`, `video_id`, `format`, `subtitle_name`, `language`, `created_on`, `updated_on`) VALUES
( '1cWHltNXyOrAPHEoI4BE_AvmnTZabES22', 1, 'SRT', 'subtitles (1).srt', NULL, '2025-01-27 22:18:40', '2025-01-27 22:18:40');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(100) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `drive_id` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` ( `username`, `email`, `password`, `drive_id`) VALUES
('admin', 'admin@gmail.com', '$2y$10$ABpgODssTYU38OcUGnDWgueu92XW2dXSXPj2XH5nTA88uV0J2bSRe', 0), -- password: admin1
( 'milen123', 'milen@abv.bg', '$2y$10$konTBTE1ROVBqyIUmA101.vOcL7z/KEc654Q6.mnubC5.5ua2sHxy', 0); -- password: milenparola

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` int(100) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `drive_id` varchar(100) NOT NULL,
  `owner_id` int(100) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_private` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `videos`
--

INSERT INTO `videos` ( `name`, `drive_id`, `owner_id`, `created_on`, `updated_on`, `is_private`) VALUES
( 'dosi hbd', '1vcwdviw66B5D2GsaleMfDYdGql4ztxbG', 1, '2025-01-26 14:54:10', '2025-01-26 14:54:10', 0),
( 'video 2', '1qY3mUv9v16yd5qXOBoX4TfD3No2zoRmH', 2, '2025-01-26 14:54:10', '2025-01-26 14:54:10', 0),
( 'rubik cube', '1kf5M-VTsqZlDtwycbG68AEs27f6ehegN', 1, '2025-01-26 14:54:10', '2025-01-26 14:54:10', 0),
( 'sea', '1KHPf3x7uSfPnBXaJx3bH8x7E4AopI5qi', 1, '2025-01-26 14:54:10', '2025-01-26 14:54:10', 0);


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
