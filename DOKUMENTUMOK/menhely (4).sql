-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2026. Jan 21. 11:39
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
(22, 'Shiba Inu');

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
  `dolgozo_id` int(11) DEFAULT NULL,
  `kep_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `felhasznalok`
--

INSERT INTO `felhasznalok` (`felhasznalo_id`, `felhasznalonev`, `email`, `jelszo`, `szerepkor`, `dolgozo_id`, `kep_url`) VALUES
(4, 'admin', 'kirajok69@gmail.com', '$2b$10$9GG0WDAxbltus6R3cIXIrOJ97R8CHAx07cb8f8s69OVQRIcdch4he', 'admin', NULL, '/img/profilok/profile-1768392893743.jpg'),
(5, 'Norbi', 'acsnor055@hengersor.hu', '$2b$10$8T9HW.rA6/7ihwdWAUm2lun2yxUp9.Yr05IkMdnvtb/okJaCQxhs6', 'onkentes', NULL, NULL);

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
(19, 'Samu', 2, 'kan', NULL, 14, 'http://localhost:3000/img/kutyak/1768985879170-6951690eba32ec486a447c9a_kutya-orokbefogadas-samu-20251109-124750.jpeg', 'Samu a hevesi gyepmesteri telepről érkezett. Előélete nem ismert, nem tudjuk befogták vagy leadott kutya. Samu rossz állapotban, soványan jött hozzánk, jelenleg a feltuningolása folyik, amit nagyon szívesen vesz, hisze imádja a hasát. Kedves, barátságos kutya. Egyenlőre egyedül van, így fajtársaihoz való viszonyát nem ismerjük.'),
(21, 'Günther', 6, 'kan', NULL, 16, 'http://localhost:3000/img/kutyak/1768986296446-GuÌnter.avif', 'Készüljetek, mert itt jön GÜNTER – a folyamatosan boldog antidepresszáns-kutyus!\r\n\r\nGünterke egy nem túl nagy, nem túl kicsi, hanem pont tökéletes méretű boldogságbomba, aki úgy tud vigyorogni, hogy az szinte körbeéri az egész fejecskéjét!\r\n\r\nŐ egy cuki, kedves, energiával teli kisfiú, de ami még a mozgékonyságánál is nagyobb benne: az a SZERETET!\r\n\r\nEz a kis szépség imád sétálni, emberekkel lenni, játszani, bohóckodni  és odabújni  – tényleg, olyan, mintha egy egész doboz antidepresszáns lenne kutyatestben.\r\n\r\nMellette szomorkodni? Kizárt!\r\n\r\nŐ az a fajta társ, aki mindig ott lenne melletted egy mosolyért, egy ölelésért  vagy egy jó kis játékért .\r\n\r\nÉs bár Günter más kutyákkal nem jön ki, az embereket imádja, nyitott, tanítható, és egyedüli kutyaként boldogan megosztaná veled a kanapét… meg az életet!'),
(23, 'Róka', 7, 'kan', NULL, 15, 'http://localhost:3000/img/kutyak/1768986514275-Roka.avif', 'Egyelőre karantén idejét tölti,majd ívartalanítás után cuccolhat új otthonába. Amit tudunk, hogy a kenelben nem érzi jól magát, ennek hangot is ad.\r\nNagyon okos, figyelmes kutyus. Németjuhász jelleget mutat mind színében, mind viselkedésében, ami nem lehet probléma egy hozzáértő gazdi felügyelete mellett. Kedves, bújós teremtés azután, ha kiszaladgálta magát. Imádja a gyerekeket is.'),
(24, 'Cortez', 6, 'kan', NULL, 18, 'http://localhost:3000/img/kutyak/1768986734499-Cortez.avif', 'Cortez egy rendkívül barátságos, emberközpontú, közepes testű kutyus, aki hűséges és bújós társad lesz a mindennapokban. Bár az embereket rajongásig szereti, más állatokkal nem jön ki jól, ezért kizárólag egyedüli kedvencnek költözhet. Mérsékelt mozgásigénye miatt egy kiadós séta után már szívesen pihen a gazdi mellett, ráadásul már ivartalanítva, oltva és chipezve várja az új otthonát.'),
(25, 'Bendzsó', 11, 'kan', NULL, 14, 'http://localhost:3000/img/kutyak/1768986884461-Bendzso.avif', 'Bendzsó egy éber és mozgékony, nagyobb termetű fiatalember, aki hosszabb szőre miatt – különösen szépen nyírva – elegáns, briardos küllemével mindenkit levesz a lábáról. Barátságos természetű, kifejezetten imád sétálni, és a lánykutyákkal is jól kijön. Aktív és figyelmes jelleme miatt elsősorban kertes házba, egy gondoskodó gazdi mellé ajánljuk, aki értékeli vidám és élettel teli társaságát. Bár még ivaros, kedvessége és közvetlensége azonnal rabul ejti az ember szívét.'),
(26, 'Lüsy', 2, 'szuka', NULL, 15, 'http://localhost:3000/img/kutyak/1768986986913-LÃ¼sy.avif', 'Aktív, játékos, de még az új dolgoktól gyakran fél...Fokozatosan meg kell ismernie a környezetében lévő, számára újdonságokat.\r\n\r\nGyorsan barátkozik, nagyon igényli a szeretetet és az ember aktív jelenlétét. Okos, gyorsan tanul \r\n\r\nLüsy eddigi élete tele volt megpróbáltatásokkal, az utolsópillanatban menekült meg, nem sok hiányzott ahhoz, hogy éhen haljon \r\n\r\nLüsy jelenleg még szívféreg fertőzés miatt kezelés alatt áll, az új családjának ezt folytatni kell szoros együttműködésben az alapítvánnyal.\r\nTovábbi információ a kezeléssel és az örökbefogadással kapcsolatban üzenetben kérhető \r\nLüsyvel az alapítvány székhelyén, Monoron lehet személyesen ismerkedni előzetes egyeztetés után.'),
(27, 'Dáma', 6, 'szuka', NULL, 14, 'http://localhost:3000/img/kutyak/1768987081982-Dama.avif', 'Közepes testű, teljes oltási sorral, chippel rendelkezik, szívféreg kezelése folyik, így csupán az ivartalanítás van hátra, hogy költözhessen máris az álomgazdikhoz, akik kárpótolják majd a millió és egy szörnyűségért, amit át kellett élnie. Mert ez a szépkislány minden szeretetmorzsát trilliószorosan adna vissza - csak kaphasson végre egy esélyt!\r\n\r\nNem túrabajnok, de kényelmes és nyugis sétákra bármikor kapható!\r\n\r\n‍'),
(28, 'Anubis', 4, 'kan', NULL, 19, 'http://localhost:3000/img/kutyak/1768987201202-Anubis.avif', 'Testvérét már örökbe fogadták és ő is vágyik végre a szabad életre!\r\n\r\nEgy nagyon szép kutya igazi temperamentumos, férfias megjelenéssel.\r\n\r\nSzukákkal szoktatható, de jó lenne ha Anubis egyedüli kutyaként megkapná a leendő családja figyelmét.'),
(29, 'Lara', 12, 'szuka', NULL, 20, 'http://localhost:3000/img/kutyak/1768987376524-Lara.avif', 'Igazi szeretetbomba, aki rajong az emberekért és a gyerekekért is. Lételeme a játék: imád labdázni, és folyton keresi a lehetőséget egy kis közös bolondozásra vagy bújásra.\r\n\r\nOkos és tanulékony, így tanítása igazi élmény. Nagy mozgásigényű, imád túrázni és minden percet élvez, amikor foglalkoznak vele. Jelenleg napi kétszer étkezik, és egy olyan aktív gazdit vár, aki értékeli hűségét és partner lesz a nagy kalandokban.'),
(31, 'Simon', 6, 'kan', NULL, 16, 'http://localhost:3000/img/kutyak/1768987581431-Simon.avif', ' Okos, étellel jól motiválható. Simon séta alatt nagyon érdeklődő, ilyenkor jobban érdekli őt a külvilág, mint az ember, de a határozottsággal visszaterelhető a figyelme az emberre. Játékokat, főleg a botokat nagyon kedveli, játék közben kicsit kizökken a bezártság okozta rosszkedvből.'),
(32, 'Ava', 7, 'szuka', NULL, 15, 'http://localhost:3000/img/kutyak/1768987745953-Ava.avif', 'Ava útja nehezen indult: mély szorongással és bizalmatlansággal érkezett közénk, kezdetben minden érintéstől rettegett. Azonban a türelmes gondoskodás csodát tett, és mára egy élettel teli, 6 éves, ivartalanított és oltott kutyussá vált. Imádja a hosszú kirándulásokat, szépen sétál pórázon, és igazi vízimádó hírében áll. Bár a hirtelen zajoktól még néha megriad, az emberekkel kíváncsi, a kutyatársaival pedig kifejezetten barátságos. Ava szobatiszta és játékos, de egy kicsit még olyan, mint egy nagytestű kölyök, akinek szüksége van a türelmes irányításra. Olyan megértő gazdit keresünk számára, aki mellett végleg elfelejtheti a múlt árnyait, és aki értékeli azt a végtelen hűséget, amit ez a különleges kislány nyújtani tud.'),
(33, 'Joya', 1, 'szuka', NULL, 14, 'http://localhost:3000/img/kutyak/1768987844185-jOYA.avif', 'Ez a figyelemreméltó, értelmes tekintetű kutyus egy igazi hűséges társ, aki intelligenciájával és éberségével azonnal leveszi a lábáról a gazdijelölteket. Sportos testalkata és magabiztos kiállása mögött egy rendkívül ragaszkodó lélek lakozik, aki imádja a nagy, tartalmas sétákat és a közös tanulást. Jellemző rá a feladattudat és a gazdihoz való szoros kötődés, így kiváló partner lehet egy aktív életmódot élő család számára. Olyan otthont keresünk neki, ahol értékelik tanulékonyságát, és ahol őrizheti a kertet vagy kísérheti a gazdát a mindennapi kalandok során.'),
(34, 'Shiva', 6, 'szuka', NULL, 16, 'http://localhost:3000/img/kutyak/1768987996823-Shiva.avif', 'Atletikus alkatú egy igazi energiabomba, aki minden mozdulatával életörömöt sugároz. Rendkívül embercentrikus és ragaszkodó, számára a gazdi közelsége a világ közepét jelenti. Sportos testalkatából adódóan imádja az aktív programokat, a nagy közös játékokat és a természetben való kalandozást. Intelligens és figyelmes társ, aki hűségesen oltalmazza szeretteit, miközben végtelen kedvességgel várja a simogatást. Olyan otthont keresünk számára, ahol kiélheti nagy mozgásigényét, és ahol családtagként, rengeteg közös élményben lehet része.'),
(35, 'Nala', 8, 'szuka', NULL, 16, 'http://localhost:3000/img/kutyak/1768988110550-Nala.avif', 'Ez a rendkívül stabil, izmos felépítésű kutyus igazi atléta, akinek minden mozdulatából erő és magabiztosság árad. Robusztus megjelenése ellenére a szíve aranyból van: híresen emberközpontú, rajong a figyelemért, és legszívesebben minden percét a gazdája közelében töltené. Értelmes, figyelmes természete miatt remekül tanítható, és nagyon igényli a közös feladatokat, játékokat. Energikus és lelkes társ, aki egyaránt alkalmas nagy sétákra és otthoni bújásra, hiszen számára a legfontosabb a családhoz való hűséges ragaszkodás.'),
(36, 'Babóca', 1, 'szuka', NULL, 16, 'http://localhost:3000/img/kutyak/1768988350489-Baboca.avif', 'Idővel elkezdett bízni a gondozóiban és nyitni feléjük. Azóta pedig olyan, mint egy óriás bébi. Néha még összerezzen a külvilág zajaitól. De aztán csak bohókásan játszik tovább. Mindenkit felborít a nagy termetével, amivel természetesen nincs tisztában. Ezen okból kis gyerekek mellé nem javasolnánk. Kutyákkal jól kijön, játékos, és szívesen ajánljuk olyan családba, ahol van egy magabiztosabb kutya, aki segíthet neki tovább oldódni és még bátrabbá válni.'),
(37, 'Némo', 3, 'kan', NULL, 14, 'http://localhost:3000/img/kutyak/1768988474567-Nemo.avif', 'Akiket megismer, azokhoz bújik, nyomul, követeli a figyelmet. Ő egy olyan kutya, akinek a bizalmát el kell nyerni, ez nem két perc, de ha egyszer megtörténik, játékos és hűséges társsá válik, akivel együtt lehet kergetőzni, játszani, tanulni. Igazi energiabomba! Bizonyos helyzetekben azonban feszülté válik, ezért kizárólag tapasztalt, erőskezű gazdának javasoljuk. Pórázon jelenleg nagyon húz, mert minden is érdekli, és nehéz megtartani a figyelmét. Jutalomfalattal motiválható, aránylag gyorsan tanul. Kutyákkal jól kijön, meglepően türelmes, például simán hagyja, hogy ráugorjanak, puszit adjanak neki, zaklassák, főleg a kölyökkutyák.'),
(38, 'Franciska', 4, 'szuka', NULL, 22, 'http://localhost:3000/img/kutyak/1768988604407-Franciska.avif', 'Ez a rendkívül elegáns megjelenésű, büszke tartású kutyus igazi egyéniség, aki méltóságteljes nyugalmával és intelligenciájával azonnal lenyűgözi a környezetét. Jellegzetes, dús, vöröses bundája és mindig éber tekintete mögött egy független, de hűséges lélek lakozik. Nem tolakodó, inkább megfontolt és tiszta kutyus, aki értékeli a kiszámíthatóságot és a minőségi közös időtöltést a gazdájával. Olyan otthont keresünk számára, ahol partnerként tekintenek rá, és biztosítják neki azt a szellemi és fizikai elfoglaltságot, amire szüksége van. Kompakt mérete és fegyelmezett viselkedése miatt hűséges kísérője lesz egy tudatos gazdinak.'),
(39, 'Keksz', 2, 'kan', NULL, 16, 'http://localhost:3000/img/kutyak/1768988769076-Keksz.avif', 'Keksz egy rendkívül stabil, izmos felépítésű kutyus, aki igazi atléta; minden mozdulatából erő és magabiztosság árad. Robusztus és megnyerő megjelenése ellenére a szíve tiszta arany: híresen emberközpontú, rajong a figyelemért, és legszívesebben minden percét a gazdája közvetlen közelében töltené.\r\n\r\nÉrtelmes, figyelmes természete miatt remekül tanítható, és nagyon igényli a közös feladatokat, a tartalmas játékokat. Energikus és lelkes társ, aki egyaránt partner a nagy, aktív sétákban és az otthoni békés bújásban, hiszen számára a legfontosabb a családhoz való hűséges ragaszkodás.'),
(40, 'Mazsola', 8, 'kan', NULL, 14, 'http://localhost:3000/img/kutyak/1768988914395-Mazsola.jpeg', 'Mazsola egy igazán különleges kis egyéniség, akinek minden mozdulata életörömöt és kíváncsiságot sugároz. Kompakt mérete ellenére meglepően sportos és mozgékony, így tökéletes társ lehet mind a városi sétákban, mind a könnyedebb kirándulásokban. Éber és értelmes tekintete elárulja, hogy mindenre figyel, és nagyon igényli az ember közelségét.\r\n\r\nTermészete egyszerre vidám és ragaszkodó: imádja a figyelmet, és hálás minden kedves szóért vagy simogatásért. Kiváló választás lehet olyan gazdinak, aki egy barátságos, könnyen kezelhető, mégis karakteres társat keres maga mellé, aki hűségesen követi őt bárhová.'),
(41, 'Stella', 2, 'szuka', NULL, 14, 'http://localhost:3000/img/kutyak/1768989008696-679e9a75b5807f3414a2a19c_Stella3-p-1080.jpg', 'Ivartalanított, kis-közepes termetű,  terrier-jellegű kislány. Igazi családi kedvencnek való, persze, azért tudja hallatni a hangját. Hanyatt fekve kéri a pocaksimit. Kinti-benti kutyusnak szeretnénk ajánlani, nagy sétákkal.'),
(42, 'Károly', 6, 'kan', NULL, 15, 'http://localhost:3000/img/kutyak/1768989768700-Karcsin.jpg', 'Napokban került a telepre egy a szomorú szemű, de nagyon kedves németjuhász fajtajellegű kutyus. Az ő történetet sem tudjuk, utcán kóborolt napokig a városban, mielőtt bekerült.');

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
-- A tábla indexei `kutyak`
--
ALTER TABLE `kutyak`
  ADD PRIMARY KEY (`kutya_id`),
  ADD KEY `fajta_id` (`fajta_id`);

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
  MODIFY `fajta_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `felhasznalo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `kutyak`
--
ALTER TABLE `kutyak`
  MODIFY `kutya_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

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
  ADD CONSTRAINT `kutyak_ibfk_1` FOREIGN KEY (`fajta_id`) REFERENCES `fajtak` (`fajta_id`);

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
