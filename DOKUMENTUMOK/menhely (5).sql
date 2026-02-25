-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2026. Feb 25. 09:20
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
  `felhasznalo_id` int(11) NOT NULL,
  `datum` date NOT NULL,
  `osszeg` decimal(10,2) DEFAULT NULL,
  `targy` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `fajtak`
--

CREATE TABLE `fajtak` (
  `fajta_id` int(11) NOT NULL,
  `nev` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `fajtak`
--

INSERT INTO `fajtak` (`fajta_id`, `nev`) VALUES
(10, 'labrador'),
(11, 'németjuhász'),
(12, 'Yorkshire terrier'),
(13, 'Pumi'),
(14, 'Keverék'),
(15, 'Német juhászkutya'),
(16, 'Amerikai staffordshire terrier'),
(17, 'Német dog'),
(18, 'Amerikai bulldog'),
(19, 'Shar pei'),
(20, 'Erdélyi kopó'),
(21, 'Staffordshire bullterrier'),
(22, 'Shiba Inu'),
(23, 'Kuvasz'),
(24, 'Berni pásztorkutya'),
(25, 'Ónémet juhászkutya'),
(26, 'Rövidszőrű magyar vizsla'),
(27, 'Boxer'),
(28, 'Ír terrier');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `felhasznalo_id` int(11) NOT NULL,
  `felhasznalonev` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `jelszo` varchar(255) NOT NULL,
  `szerepkor` enum('admin','dolgozo','onkentes') DEFAULT 'dolgozo',
  `kep_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `felhasznalok`
--

INSERT INTO `felhasznalok` (`felhasznalo_id`, `felhasznalonev`, `email`, `jelszo`, `szerepkor`, `kep_url`) VALUES
(4, 'admin', 'kirajok69@gmail.com', '$2b$10$9GG0WDAxbltus6R3cIXIrOJ97R8CHAx07cb8f8s69OVQRIcdch4he', 'admin', '/img/profilok/profile-1768392893743.jpg'),
(6, 'Ricsi', 'szentpalirichard9@gmail.com', '$2b$10$fnFMju1gdT7UXayvse7J.OgEBhpRCaL4H8rSHB7CQfax0wCSPle2K', 'onkentes', '/img/profilok/profile-1769678038133.png'),
(8, 'Ács Norbert', 'norbiasz62@gmail.com', '$2b$10$eJN1/piiuGfClDZphDJij.5rXTLfj0VZGIItAB4EVZSYkfDYIHF8W', 'onkentes', NULL);

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
  `kep_url` varchar(255) DEFAULT NULL,
  `leiras` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `kutyak`
--

INSERT INTO `kutyak` (`kutya_id`, `nev`, `eletkor`, `nem`, `erkezes_datum`, `fajta_id`, `kep_url`, `leiras`) VALUES
(19, 'Samu', 2, 'kan', NULL, 14, '/img/kutyak/1768985879170-6951690eba32ec486a447c9a_kutya-orokbefogadas-samu-20251109-124750.jpeg', 'Samu a hevesi gyepmesteri telepről érkezett...'),
(21, 'Günther', 6, 'kan', NULL, 16, '/img/kutyak/1768986296446-GuÌˆnter.avif', 'Készüljetek, mert itt jön GÜNTER...'),
(23, 'Róka', 7, 'kan', NULL, 15, '/img/kutyak/1768986514275-Roka.avif', 'Nagyon okos, figyelmes kutyus...'),
(24, 'Cortez', 6, 'kan', NULL, 18, '/img/kutyak/1768986734499-Cortez.avif', 'Cortez egy rendkívül barátságos, emberközpontú...'),
(25, 'Bendzsó', 11, 'kan', NULL, 14, '/img/kutyak/1768986884461-Bendzso.avif', 'Bendzsó egy éber és mozgékony...'),
(26, 'Lüsy', 2, 'szuka', NULL, 15, '/img/kutyak/1768986986913-LÃ¼sy.avif', 'Aktív, játékos, de még az új dolgoktól...'),
(27, 'Dáma', 6, 'szuka', NULL, 14, '/img/kutyak/1768987081982-Dama.avif', 'Közepes testű, teljes oltási sorral...'),
(28, 'Anubis', 4, 'kan', NULL, 19, '/img/kutyak/1768987201202-Anubis.avif', 'Testvérét már örökbe fogadták...'),
(29, 'Lara', 12, 'szuka', NULL, 20, '/img/kutyak/1768987376524-Lara.avif', 'Igazi szeretetbomba, aki rajong az emberekért...'),
(31, 'Simon', 6, 'kan', NULL, 16, '/img/kutyak/1768987581431-Simon.avif', 'Okos, étellel jól motiválható...'),
(32, 'Ava', 7, 'szuka', NULL, 15, '/img/kutyak/1768987745953-Ava.avif', 'Ava útja nehezen indult: mély szorongással...'),
(33, 'Joya', 1, 'szuka', NULL, 14, '/img/kutyak/1768987844185-jOYA.avif', 'Ez a figyelemreméltó, értelmes tekintetű...'),
(34, 'Shiva', 6, 'szuka', NULL, 16, '/img/kutyak/1768987996823-Shiva.avif', 'Atletikus alkatú egy igazi energiabomba...'),
(35, 'Nala', 8, 'szuka', NULL, 16, '/img/kutyak/1768988110550-Nala.avif', 'Ez a rendkívül stabil, izmos felépítésű...'),
(36, 'Babóca', 1, 'szuka', NULL, 16, '/img/kutyak/1768988350489-Baboca.avif', 'Idővel elkezdett bízni a gondozóiban...'),
(37, 'Némo', 3, 'kan', NULL, 14, '/img/kutyak/1768988474567-Nemo.avif', 'Akiket megismer, azokhoz bújik...'),
(38, 'Franciska', 4, 'szuka', NULL, 22, '/img/kutyak/1768988604407-Franciska.avif', 'Ez a rendkívül elegáns megjelenésű...'),
(39, 'Keksz', 2, 'kan', NULL, 16, '/img/kutyak/1768988769076-Keksz.avif', 'Keksz egy rendkívül stabil...'),
(40, 'Mazsola', 8, 'kan', NULL, 14, '/img/kutyak/1768988914395-Mazsola.jpeg', 'Mazsola egy igazán különleges kis egyéniség...'),
(41, 'Stella', 2, 'szuka', NULL, 14, '/img/kutyak/1768989008696-679e9a75b5807f3414a2a19c_Stella3-p-1080.jpg', 'Ivartalanított, kis-közepes termetű...'),
(42, 'Károly', 6, 'kan', NULL, 15, '/img/kutyak/1768989768700-Karcsin.jpg', 'Napokban került a telepre egy szomorú szemű...');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `orokbefogadasok`
--

CREATE TABLE `orokbefogadasok` (
  `id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `kutya_id` int(11) NOT NULL,
  `telefonszam` varchar(20) DEFAULT NULL,
  `iranyitoszam` varchar(10) DEFAULT NULL,
  `varos` varchar(100) DEFAULT NULL,
  `utca_hazszam` varchar(255) DEFAULT NULL,
  `lakas_tipus` varchar(50) DEFAULT NULL,
  `ingatlan_tipus` varchar(50) DEFAULT NULL,
  `kert` varchar(10) DEFAULT NULL,
  `kutya_tapasztalat` varchar(10) DEFAULT NULL,
  `allatok` text DEFAULT NULL,
  `csalad_tagok` int(11) DEFAULT NULL,
  `statusz` enum('folyamatban','elfogadva','elutasitva') DEFAULT 'folyamatban',
  `letrehozva` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `orokbefogadasok`
--

INSERT INTO `orokbefogadasok` (`id`, `felhasznalo_id`, `kutya_id`, `telefonszam`, `iranyitoszam`, `varos`, `utca_hazszam`, `lakas_tipus`, `ingatlan_tipus`, `kert`, `kutya_tapasztalat`, `allatok`, `csalad_tagok`, `statusz`, `letrehozva`) VALUES
(1, 8, 42, '06202020200', '1056', 'Budapest', 'király utca 61', 'panel', 'sajat', 'nincs', 'igen', NULL, NULL, 'folyamatban', '2026-02-23 11:19:32'),
(2, 8, 42, '06202020200', '1056', 'Budapest', 'király utca 61', 'panel', 'sajat', 'van', 'igen', NULL, NULL, 'folyamatban', '2026-02-25 07:31:29');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `orvosi_vizsgalatok`
--

CREATE TABLE `orvosi_vizsgalatok` (
  `vizsgalat_id` int(11) NOT NULL,
  `kutya_id` int(11) NOT NULL,
  `vizsgalat_datum` date NOT NULL,
  `oltast_kapott` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `adomanyok`
--
ALTER TABLE `adomanyok`
  ADD PRIMARY KEY (`adomany_id`),
  ADD KEY `fk_adomany_user` (`felhasznalo_id`);

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
  ADD UNIQUE KEY `felhasznalonev` (`felhasznalonev`);

--
-- A tábla indexei `kutyak`
--
ALTER TABLE `kutyak`
  ADD PRIMARY KEY (`kutya_id`),
  ADD KEY `fk_kutyak_fajtak` (`fajta_id`);

--
-- A tábla indexei `orokbefogadasok`
--
ALTER TABLE `orokbefogadasok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orokbef_user` (`felhasznalo_id`),
  ADD KEY `fk_orokbef_kutya` (`kutya_id`);

--
-- A tábla indexei `orvosi_vizsgalatok`
--
ALTER TABLE `orvosi_vizsgalatok`
  ADD PRIMARY KEY (`vizsgalat_id`),
  ADD KEY `fk_vizsgalat_kutya` (`kutya_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `adomanyok`
--
ALTER TABLE `adomanyok`
  MODIFY `adomany_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `fajtak`
--
ALTER TABLE `fajtak`
  MODIFY `fajta_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `felhasznalo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT a táblához `kutyak`
--
ALTER TABLE `kutyak`
  MODIFY `kutya_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT a táblához `orokbefogadasok`
--
ALTER TABLE `orokbefogadasok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `orvosi_vizsgalatok`
--
ALTER TABLE `orvosi_vizsgalatok`
  MODIFY `vizsgalat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `adomanyok`
--
ALTER TABLE `adomanyok`
  ADD CONSTRAINT `fk_adomany_user` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`felhasznalo_id`);

--
-- Megkötések a táblához `kutyak`
--
ALTER TABLE `kutyak`
  ADD CONSTRAINT `fk_kutyak_fajtak` FOREIGN KEY (`fajta_id`) REFERENCES `fajtak` (`fajta_id`);

--
-- Megkötések a táblához `orokbefogadasok`
--
ALTER TABLE `orokbefogadasok`
  ADD CONSTRAINT `fk_orokbef_kutya` FOREIGN KEY (`kutya_id`) REFERENCES `kutyak` (`kutya_id`),
  ADD CONSTRAINT `fk_orokbef_user` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`felhasznalo_id`);

--
-- Megkötések a táblához `orvosi_vizsgalatok`
--
ALTER TABLE `orvosi_vizsgalatok`
  ADD CONSTRAINT `fk_vizsgalat_kutya` FOREIGN KEY (`kutya_id`) REFERENCES `kutyak` (`kutya_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
