-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2026. Feb 25. 10:35
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
(61, 'Boldizsár', 3, 'kan', NULL, 14, '/img/kutyak/1772011909064-large.avif', 'Most az Alapítvány gondozásában \"éhezik\". Gazikereső. Utcai tartózkodása során több csirkét levadászott, így melléjük nem ajánljuk.\r\nÉrdeklődni privát üzenetben lehet.\r\nKalandos és kusza történetének tisztázása nem kevés időt és energiát vett el önkénteseinktől...\r\n2025. szeptember 9.\r\nSegítségkérés érkezett egy utcán levő kutyáról Mezőkövesden. CHIP nincs, telefon átmeneti elhelyezés kéréséhez a gyepmesternek majd aljegyző úrnak. S.O.S. megoldás egy 150x150 cm-es ketrec az Alapítványnál.\r\nTények, amiket valahogy a bejelentő \"elfelejtett\":\r\n- egy szomszéd utcában lakó bízta rá a kutyát (amit nem sokkal előtte fogadott be) míg külföldön dolgozik. 50 eurót kapott az ellátására.\r\nÖnkéntesünk kapott egy kulcscsomót a tulaj unokájától, hogy megjavítsa a kerítést, és legyen helye a kutyának.\r\nMásnap feljelentéssel fenyegetőzött a tulaj, mert a rokon a ház kulcsát is átadta. Vigyük vissza a kulcsot és a kutyát...\r\n2025. november 16.\r\nA kutya újra az utcán...\r\nA tulaj követelte vigyük vissza a kutyát, mert \"legutóbb sem adtunk neki enni\"... aztán mégsem kellett már neki, nem tudja ellátni.\r\nEzidő alatt állatorvos nem látta, CHIP--et nem kapott ez a barátságos kanocska.');

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
-- A tábla adatainak kiíratása `orvosi_vizsgalatok`
--

INSERT INTO `orvosi_vizsgalatok` (`vizsgalat_id`, `kutya_id`, `vizsgalat_datum`, `oltast_kapott`) VALUES
(14, 61, '2026-01-10', 1);

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
  MODIFY `kutya_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT a táblához `orokbefogadasok`
--
ALTER TABLE `orokbefogadasok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `orvosi_vizsgalatok`
--
ALTER TABLE `orvosi_vizsgalatok`
  MODIFY `vizsgalat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
