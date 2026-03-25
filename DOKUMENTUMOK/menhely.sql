-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2026. Már 25. 10:04
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
(28, 'Ír terrier'),
(29, 'Tacskó (Rövidszőrű)'),
(30, 'Labrador Retriever'),
(31, 'Francia bulldog'),
(32, 'Border Collie'),
(33, 'Beagle'),
(34, 'Golden Retriever'),
(35, 'Rottweiler'),
(36, 'Mopsz'),
(37, 'Sibériai husky'),
(38, 'Spániel (Amerikai cocker)'),
(39, 'Ausztrál juhászkutya'),
(40, 'Shih-tzu'),
(41, 'Dobermann'),
(42, 'Csivava (Rövid szőrű)');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `felhasznalo_id` int(11) NOT NULL,
  `felhasznalonev` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `jelszo` varchar(255) NOT NULL,
  `szerepkor` enum('admin','dolgozo','felhasznalo') DEFAULT 'dolgozo',
  `kep_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `felhasznalok`
--

INSERT INTO `felhasznalok` (`felhasznalo_id`, `felhasznalonev`, `email`, `jelszo`, `szerepkor`, `kep_url`) VALUES
(4, 'admin', 'kirajok69@gmail.com', '$2b$10$9GG0WDAxbltus6R3cIXIrOJ97R8CHAx07cb8f8s69OVQRIcdch4he', 'admin', '/img/profilok/profile-1768392893743.jpg'),
(6, 'Ricsi', 'szentpalirichard9@gmail.com', '$2b$10$fnFMju1gdT7UXayvse7J.OgEBhpRCaL4H8rSHB7CQfax0wCSPle2K', 'felhasznalo', '/img/profilok/profile-1769678038133.png'),
(8, 'Ács Norbert', 'norbiasz62@gmail.com', '$2b$10$eJN1/piiuGfClDZphDJij.5rXTLfj0VZGIItAB4EVZSYkfDYIHF8W', 'felhasznalo', NULL);

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
(61, 'Boldizsár', 3, 'kan', NULL, 14, '/img/kutyak/1772011909064-large.avif', 'Most az Alapítvány gondozásában \"éhezik\". Gazikereső. Utcai tartózkodása során több csirkét levadászott, így melléjük nem ajánljuk.\r\nÉrdeklődni privát üzenetben lehet.\r\nKalandos és kusza történetének tisztázása nem kevés időt és energiát vett el önkénteseinktől...\r\n2025. szeptember 9.\r\nSegítségkérés érkezett egy utcán levő kutyáról Mezőkövesden. CHIP nincs, telefon átmeneti elhelyezés kéréséhez a gyepmesternek majd aljegyző úrnak. S.O.S. megoldás egy 150x150 cm-es ketrec az Alapítványnál.\r\nTények, amiket valahogy a bejelentő \"elfelejtett\":\r\n- egy szomszéd utcában lakó bízta rá a kutyát (amit nem sokkal előtte fogadott be) míg külföldön dolgozik. 50 eurót kapott az ellátására.\r\nÖnkéntesünk kapott egy kulcscsomót a tulaj unokájától, hogy megjavítsa a kerítést, és legyen helye a kutyának.\r\nMásnap feljelentéssel fenyegetőzött a tulaj, mert a rokon a ház kulcsát is átadta. Vigyük vissza a kulcsot és a kutyát...\r\n2025. november 16.\r\nA kutya újra az utcán...\r\nA tulaj követelte vigyük vissza a kutyát, mert \"legutóbb sem adtunk neki enni\"... aztán mégsem kellett már neki, nem tudja ellátni.\r\nEzidő alatt állatorvos nem látta, CHIP--et nem kapott ez a barátságos kanocska.'),
(63, 'Dante', 2, 'kan', NULL, 14, '/img/kutyak/1772014783139-large (2).avif', '- Dante, 2 év körüli ivartalan kan, kistestű keverék\r\n- Nagyon kedves, bújos, játékos kutyus, más kutyákkal is jól kijön, de a saját dolgait, ennivalóját megvédi 🙈\r\n-Közepes energiaszint\r\n-Nagyon puha bunda 😍'),
(64, 'Buksi', 6, 'kan', NULL, 14, '/img/kutyak/1772014939228-large (1).avif', 'Buksi, kb 5-6 év körüli kan tacskó keverék. Nagyon hosszú ideig kint élt a határban, sok hónap volt, mire be tudtuk fogni, ezért szeliditeni kellett. Mára egy bújós, végtelenül ragaszkodó, kedves kutyus lett. Más kutyákat az utcán szerzett rossz tapasztalatai miatt nem szeret, de nagyobb gyerekek mellé is ajánljuk, bár az lenne az igazi neki, ha egyke kutya lenne, valaki szeme fénye. Chipezett, többszörösen oltott, külső-belső parazitamentesitese havonta történik.'),
(66, 'Bobby', 2, 'kan', NULL, 14, '/img/kutyak/1772015227555-large (3).avif', 'Ismerjétek meg Bobbyt — a kutyust, aki egy különleges testbe zárt kedves lélek.\r\nBobby fiatal kutyaként Üllőről került a gyáli ebtelepre 2024 májusában, ahonnan 2025 augusztus végén tudtuk őt kihozni. Több mint 1 évet töltött bent!\r\nElőéletéről nincs információnk. Különleges testfelépítése igen mókás, mert a 22 kg-os súlya egy alacsony tacskó hosszúságú testből és egy hatalmas fejből áll\r\nEmberrel teljesen barátságos, tele van energiával és szeretne végre szabadságot, sétákat, játékot. Jutifalattal motiválható. A séta a mindene — kezdetben nagyon izgatott, erőteljesen húz, de hosszú pórázon szépen lassan nyugodtabbá válik.\r\nKicsit akaratos, valószínű régen sokat játszott kötélhúzást. Kisebb gyermek mellé nem ajánljuk, macskákkal a viszonyát nem ismerjük.\r\nMás kutyákkal valószínűleg nincs gond, de mivel még tanuljuk nála az alapokat, barátkoztatást csak fokozatosan vállaljuk.\r\nBobbynak olyan gazdára van szüksége, aki nem tart egy energikus kutyussal való foglalkozástól, sok szabadideje van, és kész egy türelmes, következetes nevelésre. A legjobb lenne neki egy nagy, biztonságos kert sok játékkal és foglalkozással, családias körülmények között, részben benti tartással.\r\nFontos egészségügyi információ:\r\nBobby a hatósági állatorvos szerint kb. 2024 elején született, bár felnőttként került 2024 májusában az ebtelepre. Szóval valószínű, hogy kb 2023-ban született inkább.\r\nSzívféreg tesztje negatív lett. Kombinált és veszettség oltással rendelkezik, ivartalanítva van.\r\nHa szeretnél örökbefogadója lenni ennek a szuper kutyusnak, bemutatkozó levelet a bundasbarat@gmail.com e-mail címre várjuk, vagy keress minket telefonon hétfőtől péntekig 15:30-18:30 ig, illetve szombaton a 06702056552-es számon. Ha nem vesszük fel, írj nekünk SMS-t, és visszahívunk!\r\nTulajdonságok:\r\n- erős, aktív,\r\n- akaratos,\r\n- jó házőrző\r\nÖrökbefogadása:\r\n- Kinti-benti tartás mellett,\r\n- Oltási könyvvel,\r\n- Chippel,\r\n- Ivartalanítva,\r\n- Minimum 2 látogatás után,\r\n- Örökbefogadási szerződés aláírásával lehetséges.'),
(67, 'Dolce', 1, 'szuka', NULL, 30, '/img/kutyak/1772015347759-large (4).avif', 'Gazdit keres Dolce 🩷\r\nDolce egy fekete ragyogó tündér! ♥️♥️ Imádnivaló kutya. Végtelenül kedves,bájos és hálás. Egyáltalán nem tolakodó,nem ugrál és teljesen szófogadó.\r\nMindene a szeretet. Kedvessége tényleg határtalan. Soha egy rossz mozdulata sincs, nem harapdál,nem karmol.\r\nGyönyörű szép ébenfekete extra selymes bundája van. Olyan mint egy plüss fóka. 🥹\r\nJelenleg 4 hónap körüli és várhatóan közepes termetű lesz. Más kutyákkal tökéletes a viszonya.\r\nJátékokat nagyon szereti, főleg a plüss és húzgálós fajtákat.\r\nKönnyen tanul. Jutalomfalattal és simogatással is nagyon jól motiválható. Lesi az embere minden kívánságát.\r\nTöbbször oltva, chippelve és élősködő mentesen keresi új gazdáját!\r\nHa beleszerettél Dolce kutyusba, kérlek írj nekünk üzenetet!♥️'),
(68, 'Bella', 2, 'szuka', NULL, 30, '/img/kutyak/1772016735555-Yellow_Labrador_Retriever_2.jpg', 'Bodzát egy vidéki család adta le, mert külföldre költöztek. Nagyon barátságos, gyerekekkel és más kutyákkal is jól kijön. Imád labdázni és hosszú sétákat tenni a természetben. Gyorsan tanul és nagyon emberközpontú.'),
(69, 'Morzsa', 2, 'kan', NULL, 31, '/img/kutyak/1772016834399-Francia-bulldog-fajtaleiras.jpg', 'Morzsát rossz tartási körülmények közül mentették. Eleinte félénk volt, de sok törődés után nyitott és játékos lett. Szereti a rövid sétákat és a kanapén való pihenést. Lakásban tartásra ideális.'),
(70, 'Csillag', 5, 'szuka', NULL, 32, '/img/kutyak/1772016898938-Border_Collie_dog.jpg', 'Csillag egy aktív, energikus kutya, akit gazdája időhiány miatt adott le. Rendkívül intelligens és imád dolgozni, tanulni. Agilityre vagy sportos gazdi mellé tökéletes választás. Nagyon hűséges és figyelmes.'),
(71, 'Rex', 4, 'kan', NULL, 15, '/img/kutyak/1772016983763-nemet-juhasz.jpg', 'Rexet egy gyártelep mellől mentették. Kiváló őrző-védő ösztönnel rendelkezik, de a családjához rendkívül ragaszkodó. Fegyelmezett, okos és szeret feladatokat kapni.'),
(72, 'Lili', 1, 'szuka', NULL, 29, '/img/kutyak/1772017030671-torpe-tacsko.jpg', 'Lili fiatal, kíváncsi és tele van energiával. Egy idős hölgyé volt, aki már nem tudta ellátni. Nagyon ragaszkodó, szeret ölben ülni, de a kertben is szívesen szaladgál.'),
(73, 'Zserbó', 6, 'kan', NULL, 33, '/img/kutyak/1772017116160-beagle-hound-dog.jpg', 'Zserbót egy vadász adta le, mert már nem tudta aktívan használni. Rendkívül jó szimatú, imád felfedezni és hosszú sétákon részt venni. Lakásban is nyugodt, ha eleget mozoghat. Gyerekbarát és más kutyákkal is jól kijön.'),
(74, 'Bella', 4, 'szuka', NULL, 34, '/img/kutyak/1772017232572-golden-retriever-im-grass.jpg', 'Bella egy szeretetteljes családi kutya volt, de allergia miatt új otthont keres. Nagyon türelmes, imádja a gyerekeket és könnyen tanítható. Szívesen úszik és apportírozik, igazi társ minden kiránduláson.'),
(75, 'Árnyék', 7, 'kan', NULL, 14, '/img/kutyak/1772017285554-14.jpg', 'Árnyékot az utcáról mentették be, eleinte bizalmatlan volt az emberekkel. Hosszabb idő és türelem után azonban megnyílt, és kiderült, hogy rendkívül hűséges és hálás kutya. Nyugodt természetű, csendesebb háztartásba ajánlott.'),
(76, 'Mázli', 2, 'szuka', NULL, 12, '/img/kutyak/1772017374683-sitesdefaultfilesstylessquare_medium_440x440public2022-09Yorkshire20Terrier.jpg', 'Mázli apró termetű, de nagy egyéniség. Gazdája költözés miatt nem tudta tovább tartani. Nagyon ragaszkodó, szereti a figyelmet és az ölben ülést, de játékos is. Lakásba ideális társ.'),
(77, 'Bruno', 7, 'kan', NULL, 35, '/img/kutyak/1772017461611-sitesdefaultfilesstylessquare_medium_440x440public2022-09Rottweiler.jpg', 'Brunót felelős, tapasztalt gazdának ajánljuk. Jól nevelt, engedelmes és nagyon védi a családját. Megfelelő foglalkozás mellett kiegyensúlyozott, nyugodt kutya. Más állatokkal fokozatos összeszoktatást igényel.'),
(78, 'Pötyi', 3, 'szuka', NULL, 36, '/img/kutyak/1772017515046-sitesdefaultfilesstylessquare_medium_440x440public2022-08Pug1.jpg', 'Pötyi vidám, játékos és nagyon emberközpontú kutya. Előző gazdája időhiány miatt mondott le róla. Szeret rövid sétákat tenni és utána hosszasan pihenni. Gyerekek mellé is ajánlott.'),
(79, 'Füge', 8, 'szuka', NULL, 29, '/img/kutyak/1772017572238-rÃ¶vidszÅrÅ± tacskÃ³.jpg', 'Füge idős gazdája halála után került hozzánk. Nyugodt, csendes kutya, aki szereti a békés környezetet. Rövidebb séták is elegendőek számára. Nagyon hálás és ragaszkodó természetű.'),
(80, 'Thor', 3, 'kan', NULL, 37, '/img/kutyak/1772018033895-Sziberiai-husky-fajtaleiras.jpg', 'Thor aktív, energikus és imád futni. Lakásban nem ajánlott, inkább kerttel rendelkező, sportos gazdi mellé való. Okos, de önálló természetű, így következetes nevelést igényel.'),
(81, 'Szofi', 1, 'szuka', NULL, 38, '/img/kutyak/1772018082308-Angol-cocker-spaniel-reszletes-fajtaleiras.jpg', 'Szofi fiatal, barátságos és nagyon tanulékony. Egy nem tervezett alomból származik, így új, szerető családot keres. Szeret játszani, kirándulni és az emberek közelében lenni.'),
(82, 'Max', 9, 'kan', NULL, 17, '/img/kutyak/1772018152198-NÃ©met-Dog-768x512.jpg', 'Max egy idősödő, de méltóságteljes óriás. Gazdája egészségügyi okok miatt nem tudja tovább gondozni. Nyugodt, kiegyensúlyozott természetű, szereti a kényelmes fekhelyet és a rövidebb sétákat. Tapasztalt gazdának ajánlott.'),
(83, 'Nala', 2, 'szuka', NULL, 39, '/img/kutyak/1772018215560-images (1).jpg', 'Nalát egy tanyáról mentették, ahol nem kapott elegendő foglalkozást. Rendkívül intelligens és energikus kutya, aki imád tanulni és feladatokat megoldani. Agilityre vagy sportos életmódot élő gazdi mellé ideális választás. Gyorsan kötődik, nagyon hűséges és figyelmes.'),
(84, 'Bogyó', 5, 'kan', NULL, 40, '/img/kutyak/1772018272068-sss.jpg', 'Bogyó egy kedves, nyugodt természetű kiskutya, akit gazdája családi okok miatt adott le. Szereti a kényelmet és az emberek közelségét, igazi öleb típus. Rendszeres szőrápolást igényel, de cserébe nagyon ragaszkodó és szeretetteljes társ.'),
(85, 'Zeusz', 4, 'kan', NULL, 41, '/img/kutyak/1772018325257-dobermann-pinscher-im-grass.jpg', 'Zeusz korábban családi házban élt, de költözés miatt került be. Határozott, intelligens és jól képezhető kutya. Tapasztalt gazdának ajánlott, aki tud vele következetesen foglalkozni. Megfelelő neveléssel rendkívül hűséges és kiegyensúlyozott társ válik belőle.'),
(86, 'Mimi', 1, 'szuka', NULL, 42, '/img/kutyak/1772018421405-Chihuahuasmoothcoat.jpg', 'Mimi apró termetű, de bátor és élénk személyiség. Fiatal gazdája külföldre költözött, ezért keres új családot. Szereti, ha ölben lehet, de játékos és kíváncsi is. Lakásban tartásra ideális, szoros kötődést alakít ki gazdájával.'),
(87, 'Rocky', 6, 'kan', NULL, 16, '/img/kutyak/1772018476112-jaj(1).jpg', 'Rockyt rossz körülmények közül mentették ki, de rengeteget fejlődött azóta. Eleinte bizalmatlan volt, ma már kiegyensúlyozott és figyelmes kutya. Szereti a hosszú sétákat és a közös játékot. Tapasztalt, felelős gazdát keres, aki következetes és szeretetteljes nevelést biztosít számára.');

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
  `statusz` enum('folyamatban','elbiralt','interju','elfogadva','elutasitva') DEFAULT 'folyamatban',
  `letrehozva` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `orokbefogadasok`
--

INSERT INTO `orokbefogadasok` (`id`, `felhasznalo_id`, `kutya_id`, `telefonszam`, `iranyitoszam`, `varos`, `utca_hazszam`, `lakas_tipus`, `ingatlan_tipus`, `kert`, `kutya_tapasztalat`, `statusz`, `letrehozva`) VALUES
(3, 8, 61, '06202222222', '1108', 'Budapest', 'Kiraly utca 61', 'panel', 'sajat', 'nincs', 'igen', 'folyamatban', '2026-02-25 09:55:54');

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
(14, 61, '2026-01-10', 1),
(16, 63, '2025-12-12', 1),
(17, 64, '2025-11-20', 1),
(19, 66, '2026-01-12', 1),
(20, 68, '2025-02-10', 1),
(21, 69, '2023-01-24', 1),
(22, 70, '2025-02-05', 0),
(23, 71, '2025-01-12', 1),
(24, 72, '2026-02-10', 1),
(25, 73, '2025-03-22', 1),
(26, 74, '2019-02-22', 1),
(27, 75, '2023-01-22', 1),
(28, 76, '2025-02-18', 1),
(29, 77, '2018-03-03', 1),
(30, 78, '2025-02-09', 1),
(31, 79, '2025-01-30', 1),
(32, 80, '2025-02-16', 1),
(33, 81, '2025-02-22', 1),
(34, 82, '2025-02-04', 1),
(35, 83, '2025-02-11', 1),
(36, 84, '2025-02-06', 1),
(37, 85, '2025-02-13', 1),
(38, 86, '2025-02-01', 1),
(39, 87, '2025-02-08', 1);

--
-- Indexek a kiírt táblákhoz
--

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
-- AUTO_INCREMENT a táblához `fajtak`
--
ALTER TABLE `fajtak`
  MODIFY `fajta_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `felhasznalo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT a táblához `kutyak`
--
ALTER TABLE `kutyak`
  MODIFY `kutya_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT a táblához `orokbefogadasok`
--
ALTER TABLE `orokbefogadasok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `orvosi_vizsgalatok`
--
ALTER TABLE `orvosi_vizsgalatok`
  MODIFY `vizsgalat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- Megkötések a kiírt táblákhoz
--

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
