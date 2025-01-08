-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 05, 2025 at 04:47 PM
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
  `id` int(11) NOT NULL,
  `drive_id` varchar(100) NOT NULL,
  `video_drive_id` varchar(100) NOT NULL,
  `format` enum('SRT','SUB','HTML','XML','JSON') NOT NULL,
  `language` varchar(20) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subtitles`
--

INSERT INTO `subtitles` (`drive_id`, `video_drive_id`, `format`, `language`, `created_on`, `updated_on`) VALUES
('1yN0gfEE_f5GduoWpX3q7d4HXqBFZcDWL', '1M0aWsRUBKxhDcloZu2RU1CSzzR7kBeqc', 'SRT', 'English', '2025-01-05 15:46:15', '2025-01-05 15:47:07');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(100) NOT NULL,
  `username` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(20) NOT NULL,
  `videos` int(100),
  FOREIGN KEY (`videos`) REFERENCES `videos`(`id`)
  `drive_id` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`username`, `email`, `password`, `drive_id`) VALUES
( 'radkoPiratko', 'karata', 'karaoivwnniw', 0),
( 'gergana-pile-shareno', 'gergana.yordanovaa03@gmail.com', 'gericyrk', 0),
( 'KaloyanTs25', 'kaloyants25@gmail.com', 'kalacyrk', 0);

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` int(100) NOT NULL,
  `name` varchar(100) NOT NULL DEFAULT id,
  `drive_id` varchar(100) NOT NULL,
  `owner_id` int(100) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `private` boolean NOT NULL DEFAULT false
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `videos`
--

INSERT INTO `videos` (`id`, `drive_id`, `owner_id`, `created_on`, `updated_on`) VALUES
( 'this_is_hardcoded_invalid_id', 1010101011, '2025-01-02 12:33:12', '2025-01-02 12:33:12'),
( '1M0aWsRUBKxhDcloZu2RU1CSzzR7kBeqc', 3, '2025-01-05 15:21:54', '2025-01-05 15:21:54'),
( '1i0Bh9xPx7m1F_hDPxhOu01H5P9VIUKm3', 2, '2025-01-05 15:35:50', '2025-01-05 15:35:50'),
( '1M7_QzcS4ZF_HWcqH6j_9oyXo-SFoarXf', 3, '2025-01-05 15:36:14', '2025-01-05 15:36:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `subtitles`
--
ALTER TABLE `subtitles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `videos`
--
ALTER TABLE `videos`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
