-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2025. Nov 03. 10:09
-- Kiszolgáló verziója: 10.4.28-MariaDB
-- PHP verzió: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `menhely`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `adomanyok`
--

CREATE TABLE `adomanyok` (
  `adomany_id` int(11) NOT NULL,
  `orokbefogado_id` int(11) DEFAULT NULL,
  `datum` date NOT NULL,
  `osszeg` decimal(10,2) DEFAULT NULL,
  `targy` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `dolgozok`
--

CREATE TABLE `dolgozok` (
  `dolgozo_id` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `beosztas` varchar(50) DEFAULT NULL,
  `telefonszam` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `fajtak`
--

CREATE TABLE `fajtak` (
  `fajta_id` int(11) NOT NULL,
  `nev` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `felhasznalo_id` int(11) NOT NULL,
  `felhasznalonev` varchar(50) NOT NULL,
  `jelszo` varchar(255) NOT NULL,
  `szerepkor` enum('admin','dolgozo','onkentes') DEFAULT 'dolgozo',
  `dolgozo_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kennelek`
--

CREATE TABLE `kennelek` (
  `kennel_id` int(11) NOT NULL,
  `hely` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kutyak`
--

CREATE TABLE `kutyak` (
  `kutya_id` int(11) NOT NULL,
  `nev` varchar(50) NOT NULL,
  `eletkor` int(11) DEFAULT NULL,
  `nem` enum('kan','szuka') DEFAULT NULL,
  `erkezes_datum` date DEFAULT NULL,
  `fajta_id` int(11) DEFAULT NULL,
  `kennel_id` int(11) DEFAULT NULL,
  `kep_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `orokbefogadasok`
--

CREATE TABLE `orokbefogadasok` (
  `orokbefogadas_id` int(11) NOT NULL,
  `kutya_id` int(11) DEFAULT NULL,
  `orokbefogado_id` int(11) DEFAULT NULL,
  `datum` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `orokbefogadok`
--

CREATE TABLE `orokbefogadok` (
  `orokbefogado_id` int(11) NOT NULL,
  `teljes_nev` varchar(100) NOT NULL,
  `telefonszam` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `orvosi_vizsgalatok`
--

CREATE TABLE `orvosi_vizsgalatok` (
  `vizsgalat_id` int(11) NOT NULL,
  `kutya_id` int(11) NOT NULL,
  `datum` date NOT NULL,
  `kezeles` varchar(200) DEFAULT NULL,
  `allatorvos` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `adomanyok`
--
ALTER TABLE `adomanyok`
  ADD PRIMARY KEY (`adomany_id`),
  ADD KEY `orokbefogado_id` (`orokbefogado_id`);

--
-- A tábla indexei `dolgozok`
--
ALTER TABLE `dolgozok`
  ADD PRIMARY KEY (`dolgozo_id`);

--
-- A tábla indexei `fajtak`
--
ALTER TABLE `fajtak`
  ADD PRIMARY KEY (`fajta_id`);

--
-- A tábla indexei `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD PRIMARY KEY (`felhasznalo_id`),
  ADD UNIQUE KEY `felhasznalonev` (`felhasznalonev`),
  ADD KEY `dolgozo_id` (`dolgozo_id`);

--
-- A tábla indexei `kennelek`
--
ALTER TABLE `kennelek`
  ADD PRIMARY KEY (`kennel_id`);

--
-- A tábla indexei `kutyak`
--
ALTER TABLE `kutyak`
  ADD PRIMARY KEY (`kutya_id`),
  ADD KEY `fajta_id` (`fajta_id`),
  ADD KEY `kennel_id` (`kennel_id`);

--
-- A tábla indexei `orokbefogadasok`
--
ALTER TABLE `orokbefogadasok`
  ADD PRIMARY KEY (`orokbefogadas_id`),
  ADD KEY `kutya_id` (`kutya_id`),
  ADD KEY `orokbefogado_id` (`orokbefogado_id`);

--
-- A tábla indexei `orokbefogadok`
--
ALTER TABLE `orokbefogadok`
  ADD PRIMARY KEY (`orokbefogado_id`);

--
-- A tábla indexei `orvosi_vizsgalatok`
--
ALTER TABLE `orvosi_vizsgalatok`
  ADD PRIMARY KEY (`vizsgalat_id`),
  ADD KEY `kutya_id` (`kutya_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `adomanyok`
--
ALTER TABLE `adomanyok`
  MODIFY `adomany_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `dolgozok`
--
ALTER TABLE `dolgozok`
  MODIFY `dolgozo_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `fajtak`
--
ALTER TABLE `fajtak`
  MODIFY `fajta_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `felhasznalo_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `kennelek`
--
ALTER TABLE `kennelek`
  MODIFY `kennel_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `kutyak`
--
ALTER TABLE `kutyak`
  MODIFY `kutya_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT a táblához `orokbefogadasok`
--
ALTER TABLE `orokbefogadasok`
  MODIFY `orokbefogadas_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `orokbefogadok`
--
ALTER TABLE `orokbefogadok`
  MODIFY `orokbefogado_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `orvosi_vizsgalatok`
--
ALTER TABLE `orvosi_vizsgalatok`
  MODIFY `vizsgalat_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `adomanyok`
--
ALTER TABLE `adomanyok`
  ADD CONSTRAINT `adomanyok_ibfk_1` FOREIGN KEY (`orokbefogado_id`) REFERENCES `orokbefogadok` (`orokbefogado_id`);

--
-- Megkötések a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD CONSTRAINT `felhasznalok_ibfk_1` FOREIGN KEY (`dolgozo_id`) REFERENCES `dolgozok` (`dolgozo_id`);

--
-- Megkötések a táblához `kutyak`
--
ALTER TABLE `kutyak`
  ADD CONSTRAINT `kutyak_ibfk_1` FOREIGN KEY (`fajta_id`) REFERENCES `fajtak` (`fajta_id`),
  ADD CONSTRAINT `kutyak_ibfk_2` FOREIGN KEY (`kennel_id`) REFERENCES `kennelek` (`kennel_id`);

--
-- Megkötések a táblához `orokbefogadasok`
--
ALTER TABLE `orokbefogadasok`
  ADD CONSTRAINT `orokbefogadasok_ibfk_1` FOREIGN KEY (`kutya_id`) REFERENCES `kutyak` (`kutya_id`),
  ADD CONSTRAINT `orokbefogadasok_ibfk_2` FOREIGN KEY (`orokbefogado_id`) REFERENCES `orokbefogadok` (`orokbefogado_id`);

--
-- Megkötések a táblához `orvosi_vizsgalatok`
--
ALTER TABLE `orvosi_vizsgalatok`
  ADD CONSTRAINT `orvosi_vizsgalatok_ibfk_1` FOREIGN KEY (`kutya_id`) REFERENCES `kutyak` (`kutya_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
