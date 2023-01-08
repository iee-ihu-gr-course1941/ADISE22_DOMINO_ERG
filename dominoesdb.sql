-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Εξυπηρετητής: 127.0.0.1
-- Χρόνος δημιουργίας: 08 Ιαν 2023 στις 01:34:02
-- Έκδοση διακομιστή: 10.4.27-MariaDB
-- Έκδοση PHP: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Βάση δεδομένων: `dominoesdb`
--

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `board`
--

DROP TABLE IF EXISTS `board`;
CREATE TABLE `board` (
  `Domino` int(11) NOT NULL,
  `Gid` int(11) NOT NULL,
  `Turn` int(11) NOT NULL DEFAULT 1,
  `Neighbor` int(11) DEFAULT NULL,
  `status` enum('H','T') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `dominoes`
--

DROP TABLE IF EXISTS `dominoes`;
CREATE TABLE `dominoes` (
  `Did` int(11) NOT NULL,
  `H` int(1) NOT NULL CHECK (`H` >= 0 and `H` < 7),
  `T` int(1) NOT NULL CHECK (`T` >= 0 and `T` < 7)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Άδειασμα δεδομένων του πίνακα `dominoes`
--

INSERT INTO `dominoes` (`Did`, `H`, `T`) VALUES
(1, 0, 0),
(2, 1, 0),
(3, 1, 1),
(4, 2, 0),
(5, 2, 1),
(6, 2, 2),
(7, 3, 0),
(8, 3, 1),
(9, 3, 2),
(10, 3, 3),
(11, 4, 0),
(12, 4, 1),
(13, 4, 2),
(14, 4, 3),
(15, 4, 4),
(16, 5, 0),
(17, 5, 1),
(18, 5, 2),
(19, 5, 3),
(20, 5, 4),
(21, 5, 5),
(22, 6, 0),
(23, 6, 1),
(24, 6, 2),
(25, 6, 3),
(26, 6, 4),
(27, 6, 5),
(28, 6, 6);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `games`
--

DROP TABLE IF EXISTS `games`;
CREATE TABLE `games` (
  `Gid` int(11) NOT NULL,
  `Pid` varchar(20) NOT NULL,
  `Score` int(11) NOT NULL DEFAULT 0,
  `Turn` enum('1','2','3','4') NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `game_status`
--

DROP TABLE IF EXISTS `game_status`;
CREATE TABLE `game_status` (
  `Gid` int(11) NOT NULL,
  `g_status` enum('not active','initialized','creating board','started','ended','aborded') NOT NULL DEFAULT 'initialized',
  `turn` varchar(20) DEFAULT NULL,
  `result` varchar(20) DEFAULT NULL,
  `last_change` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `move1` int(1) DEFAULT NULL,
  `move2` int(1) DEFAULT NULL,
  `pNum` enum('2','3','4') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `hands`
--

DROP TABLE IF EXISTS `hands`;
CREATE TABLE `hands` (
  `Domino` int(11) NOT NULL,
  `Pid` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `players`
--

DROP TABLE IF EXISTS `players`;
CREATE TABLE `players` (
  `Name` varchar(20) NOT NULL CHECK (`Name` regexp '^[[:alnum:]]+$'),
  `PW` text NOT NULL,
  `W` int(11) DEFAULT 0,
  `L` int(11) DEFAULT 0,
  `token` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Ευρετήρια για άχρηστους πίνακες
--

--
-- Ευρετήρια για πίνακα `board`
--
ALTER TABLE `board`
  ADD PRIMARY KEY (`Gid`,`Domino`) USING BTREE,
  ADD UNIQUE KEY `Gid` (`Gid`,`Turn`),
  ADD KEY `Domino` (`Domino`),
  ADD KEY `Neighbor` (`Neighbor`);

--
-- Ευρετήρια για πίνακα `dominoes`
--
ALTER TABLE `dominoes`
  ADD PRIMARY KEY (`Did`),
  ADD UNIQUE KEY `H` (`H`,`T`);

--
-- Ευρετήρια για πίνακα `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`Gid`,`Pid`),
  ADD UNIQUE KEY `Pid` (`Pid`),
  ADD UNIQUE KEY `Gid` (`Gid`,`Turn`);

--
-- Ευρετήρια για πίνακα `game_status`
--
ALTER TABLE `game_status`
  ADD PRIMARY KEY (`Gid`),
  ADD KEY `game_status_ibfk_1` (`turn`),
  ADD KEY `game_status_ibfk_2` (`result`),
  ADD KEY `move1` (`move1`),
  ADD KEY `move2` (`move2`);

--
-- Ευρετήρια για πίνακα `hands`
--
ALTER TABLE `hands`
  ADD UNIQUE KEY `Pid_2` (`Pid`,`Domino`),
  ADD KEY `hands_ibfk_1` (`Domino`);

--
-- Ευρετήρια για πίνακα `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`Name`);

--
-- AUTO_INCREMENT για άχρηστους πίνακες
--

--
-- AUTO_INCREMENT για πίνακα `dominoes`
--
ALTER TABLE `dominoes`
  MODIFY `Did` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT για πίνακα `games`
--
ALTER TABLE `games`
  MODIFY `Gid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=220;

--
-- Περιορισμοί για άχρηστους πίνακες
--

--
-- Περιορισμοί για πίνακα `board`
--
ALTER TABLE `board`
  ADD CONSTRAINT `board_ibfk_1` FOREIGN KEY (`Domino`) REFERENCES `dominoes` (`Did`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `board_ibfk_2` FOREIGN KEY (`Gid`) REFERENCES `games` (`Gid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `board_ibfk_3` FOREIGN KEY (`Neighbor`) REFERENCES `dominoes` (`Did`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Περιορισμοί για πίνακα `games`
--
ALTER TABLE `games`
  ADD CONSTRAINT `games_ibfk_1` FOREIGN KEY (`Pid`) REFERENCES `players` (`Name`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Περιορισμοί για πίνακα `game_status`
--
ALTER TABLE `game_status`
  ADD CONSTRAINT `game_status_ibfk_1` FOREIGN KEY (`turn`) REFERENCES `players` (`Name`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `game_status_ibfk_2` FOREIGN KEY (`result`) REFERENCES `players` (`Name`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `game_status_ibfk_3` FOREIGN KEY (`move1`) REFERENCES `dominoes` (`H`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `game_status_ibfk_4` FOREIGN KEY (`move2`) REFERENCES `dominoes` (`H`);

--
-- Περιορισμοί για πίνακα `hands`
--
ALTER TABLE `hands`
  ADD CONSTRAINT `hands_ibfk_1` FOREIGN KEY (`Domino`) REFERENCES `dominoes` (`Did`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hands_ibfk_2` FOREIGN KEY (`Pid`) REFERENCES `games` (`Pid`) ON DELETE CASCADE ON UPDATE CASCADE;

DELIMITER $$
--
-- Συμβάντα
--
DROP EVENT IF EXISTS `inactivity`$$
CREATE DEFINER=`root`@`localhost` EVENT `inactivity` ON SCHEDULE EVERY 20 SECOND STARTS '2022-12-29 23:59:30' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    UPDATE game_status 
    SET g_status='aborded' 
    WHERE g_status='started' 
    	AND DATE_ADD(last_change, INTERVAL 40 second) < NOW();
	DELETE
    FROM games
    WHERE Gid IN (SELECT Gid
                  FROM game_status
                  WHERE (g_status='ended' OR g_status='aborded')
                  	AND DATE_ADD(last_change, INTERVAL 19 second) < NOW());
   	DELETE 
    FROM game_status 
    WHERE (g_status='ended' OR g_status='aborded')
    	AND DATE_ADD(last_change, INTERVAL 19 second) < NOW();
END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
