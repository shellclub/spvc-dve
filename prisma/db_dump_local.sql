-- MySQL dump 10.13  Distrib 9.6.0, for macos15.7 (arm64)
--
-- Host: localhost    Database: db_dvt_prod
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `companies_name_key` (`name`),
  UNIQUE KEY `companies_userId_key` (`userId`),
  CONSTRAINT `companies_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `depname` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `departments_depname_key` (`depname`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (4,'แผนกวิชาการบัญชี','2026-05-17 13:16:43.541','2026-05-17 13:16:43.541'),(5,'แผนกวิชาการเลขานุการ','2026-05-17 13:16:43.547','2026-05-17 13:16:43.547'),(6,'แผนกวิชาการตลาด','2026-05-17 13:16:43.548','2026-05-17 13:16:43.548'),(7,'แผนกวิชาคอมพิวเตอร์ธุรกิจและเทคโนโลยีธุรกิจดิจิทัล','2026-05-17 13:16:43.549','2026-05-17 13:16:43.549'),(8,'แผนกวิชาคอมพิวเตอร์โปรแกรมเมอร์','2026-05-17 13:16:43.551','2026-05-17 13:16:43.551'),(9,'แผนกวิชาคอมพิวเตอร์กราฟิก','2026-05-17 13:16:43.551','2026-05-17 13:16:43.551'),(10,'แผนกวิชาการออกแบบ','2026-05-17 13:16:43.552','2026-05-17 13:16:43.552'),(11,'แผนกวิชาการโรงแรม','2026-05-17 13:16:43.554','2026-05-17 13:16:43.554'),(12,'แผนกวิชาการท่องเที่ยว','2026-05-17 13:16:43.555','2026-05-17 13:16:43.555'),(13,'แผนกวิชาอาหารและโภชนาการ','2026-05-17 13:16:43.555','2026-05-17 13:16:43.555'),(14,'แผนกวิชาผ้าและสื่อสิ่งทอ','2026-05-17 13:16:43.556','2026-05-17 13:16:43.556'),(15,'แผนกวิชาคหกรรม','2026-05-17 13:16:43.557','2026-05-17 13:16:43.557'),(16,'แผนกวิชาธุรกิจค้าปลีก','2026-05-17 13:16:43.558','2026-05-17 13:16:43.558');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `education_levels`
--

DROP TABLE IF EXISTS `education_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education_levels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `education_levels_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education_levels`
--

LOCK TABLES `education_levels` WRITE;
/*!40000 ALTER TABLE `education_levels` DISABLE KEYS */;
INSERT INTO `education_levels` VALUES (1,'ปวช.','2026-04-28 09:44:42.733'),(2,'ปวส.','2026-04-28 09:44:42.733');
/*!40000 ALTER TABLE `education_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internship_report`
--

DROP TABLE IF EXISTS `internship_report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internship_report` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reportDate` datetime(3) NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `internship_report_studentId_fkey` (`studentId`),
  CONSTRAINT `internship_report_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internship_report`
--

LOCK TABLES `internship_report` WRITE;
/*!40000 ALTER TABLE `internship_report` DISABLE KEYS */;
/*!40000 ALTER TABLE `internship_report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inturnship`
--

DROP TABLE IF EXISTS `inturnship`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inturnship` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `selectedDays` json NOT NULL,
  `dayperweeks` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `inturnship_studentId_key` (`studentId`),
  CONSTRAINT `inturnship_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inturnship`
--

LOCK TABLES `inturnship` WRITE;
/*!40000 ALTER TABLE `inturnship` DISABLE KEYS */;
/*!40000 ALTER TABLE `inturnship` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logins`
--

DROP TABLE IF EXISTS `logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `is_first_login` tinyint(1) NOT NULL DEFAULT '1',
  `skip_password_change` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `logins_username_key` (`username`),
  UNIQUE KEY `logins_userId_key` (`userId`),
  CONSTRAINT `logins_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=182 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logins`
--

LOCK TABLES `logins` WRITE;
/*!40000 ALTER TABLE `logins` DISABLE KEYS */;
INSERT INTO `logins` VALUES (28,'Admin','$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG',1,0,NULL),(29,'board01','$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG',2,0,NULL),(46,'board02','$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG',19,0,NULL),(47,'board03','$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG',20,0,NULL),(48,'board04','$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG',21,0,NULL),(49,'board05','$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG',22,0,NULL),(51,'67202110001','$2b$10$xCsuBxVcxVSOjMk8bjWWkekrfd8AXcPJpjJYHohq/NnGO7aLq3bCC',24,1,NULL),(52,'67202110002','$2b$10$kbI5tP.6IIjkbePm9N6Oa.ySSJWG54ZD0Z.T8yW1NlvwgpfoXItva',25,1,NULL),(53,'67202110003','$2b$10$eU3Ko3TJATaL7yAJaqipDuhVpIcG0HBtsKBEl.A36cUgWjJ9ABBHe',26,1,NULL),(54,'67202110004','$2b$10$dliSJWiigUwKGU4TWDoAkebg4sUAgBuO3S.y9YkC2QYKbo6JExIlG',27,1,NULL),(55,'67202110005','$2b$10$JYM3RDGd8TgNLKBt8MH69eZ.2.f.ItCKHCQv3jnSXeXNmL4YYpTCS',28,1,NULL),(56,'67202110007','$2b$10$NA85VU8GLjowbEIsJ4X7JeYAmg1.XD1uTaRdDuBpenb.nLfOp/X2W',29,1,NULL),(57,'67202110008','$2b$10$OetU9Rwjvk.Fg/eEIflaoOY86EmOsU3fjJrhTS0DF2fd/NEO5TvYi',30,1,NULL),(58,'67202110009','$2b$10$zTB3R249bQuhSVez.7x3NuU/bWi6iB1oIv6GHA78XkVlRFSP0aAY.',31,1,NULL),(59,'67202110010','$2b$10$Yj/H2BDnmIBWupBdEb9Sm.e.jILWpKfSO6RfjaWLlBBQn0eYoDFJK',32,1,NULL),(60,'67202110011','$2b$10$aXPetDjqzkbJV5yO6T8BP.2aSh488z/EnYE563MLJyGshh16AwBci',33,1,NULL),(61,'67202110014','$2b$10$2mO9T4hnam2MN0r2cgRs.eXdg8xF775i8CdoRq9fNCF90j7xQbzw.',34,1,NULL),(62,'67202110016','$2b$10$myviA9TtoYwGPfiJfKJZfeD8bU/nic7BROGoE6api/asPxnqCxGVG',35,1,NULL),(63,'67202110017','$2b$10$caCbJkW2RC07emlfLV7WgecMRLoHgVFrNK.SnbIhsjAL9KXlskS5a',36,1,NULL),(64,'67202110020','$2b$10$Wjt5jScvM/PVbEuhOSo9wOssN.Ce9/2TMbZ28VMVx5VGc9Fem1Dli',37,1,NULL),(65,'67202110021','$2b$10$S6mOq.DLmVgC85l38p3GUuGearpHDRYKfEhNH8xv4ai8XIwnefa/e',38,1,NULL),(66,'67202110023','$2b$10$4/fr3INpjFfobkvuEg5Vgum0XEwPrmz9Q9EmBprYTz7PE4DDycqmi',39,1,NULL),(67,'67202110025','$2b$10$05B7NVvfFGW3UDy/yl54AOIyQUy9qxbjx.9VzYElwzjDQyzEcUYk2',40,1,NULL),(68,'67202110026','$2b$10$J96nAoxXw4t4oEbPpd9ri.Ns7nmL1cYH59c.giKZBsNsT7dhoQ6/y',41,1,NULL),(69,'67202110027','$2b$10$Eb7LHS0rxw8T2tM49DMXGeFD/sPQb7oKO8Sz.PGA567o6mwjdy0De',42,1,NULL),(70,'67202110028','$2b$10$671lCEtCULatf/na2.pC7.93yQVqfzOb6ZLl3WJmZl.G7UiHGkDo2',43,1,NULL),(71,'67202110029','$2b$10$427fDx8Na/eLKSV2mfwsce6u0VqM4jGygncvo8vxy5cUxx3LXAgAW',44,1,NULL),(72,'67202110030','$2b$10$NyJuyktf6RPoo3Y/LQhEZOPjXpuWb6ox01GbKZvmiVHYT3Lvy69Xi',45,1,NULL),(73,'67202110031','$2b$10$3q/NPsuHLCF9JW5GUgaJ7OSCsIvs3QP2xWOrUfh7Tf3v9zGzg76Va',46,1,NULL),(74,'67202110032','$2b$10$wMnqRZY.RW0Z0Ju1MH.Ac.8n0pWheSq0ec7IMirrxyeGHdr71gGfO',47,1,NULL),(75,'67202110034','$2b$10$bmD60l.p9wrsXCaTHW92nehQtzf2nnMy0qKlfv8pPVC5cTFy.pDZO',48,1,NULL),(76,'67202110035','$2b$10$BKwd487bxVQoWV9JrrjF9ezBbyMJ487sD2yFxEReMr/ro4i3D6hzO',49,1,NULL),(77,'67202110037','$2b$10$VaWIYdZSQBeahby7ZtFmwecHWDT3OTS9AIq.h7FiZ3OpPHzw3wdxG',50,1,NULL),(78,'67202110040','$2b$10$ZGgHo5OfQryk.nDKN7rvWOk80TedZLybCtNa.kAwYGEhtj4Uhb7VS',51,1,NULL),(79,'68319100016','$2b$10$VtXCZW3xH30fAzF6B/K/1.CErrkBCjQavXtiiWF3NRwMpPCNA5aT.',52,1,'2026-05-24 22:24:50.099'),(80,'68319100017','$2b$10$Wz9JdUTR8VC4DfNY3WcvO.00XiO9dZGA4UAS9Bh0sizbuPrJ6Iujm',53,1,NULL),(81,'68319100018','$2b$10$SEzHdmmD.24uR0U7zZXJs.DcuZ6GNZ0BlRrVg2VmUW3E4tGNOWqDa',54,1,NULL),(82,'68319100019','$2b$10$3NcbQd3km/SqEjDaFD5BNOQYxtmKvpeussqFlbBLf1o1BSmwDBLCm',55,1,NULL),(83,'68319100020','$2b$10$vpQPdCfsZXpN01Ihqz1VpuI.LdIo5LJJMDgTEv5mk6esF3GYFE3EK',56,1,NULL),(84,'68319100021','$2b$10$EFfGBPXBL74EVWUMgUzBMOoLgMGAD5K2qtKW/e136wai17s./frgi',57,1,NULL),(85,'68319100022','$2b$10$Hz52eXJ2a5vObThAL4kRTObdVKJgAq/5fZT32f.uPctyDYh/XkfSq',58,1,NULL),(86,'68319100023','$2b$10$IVeLgGeqXecNfsII5I7rCeQyxv5xvZ7cyKcJa6dTqqMz5XZJgeVJO',59,1,NULL),(87,'68319100024','$2b$10$c1XdfPehOnlcN3KRStNhbOI3XLhCTCdNA0e52WbAKpNdFJAgxhpxm',60,1,NULL),(88,'68319100025','$2b$10$gMpgvrJKVCgkYyrxthezk.Baqt6UWAEsuZ5CqnEgXv1N8iIbU.mX2',61,1,NULL),(89,'68319100026','$2b$10$acXreGxbV6H/CipFDoRDL.r5.w0p4VqrE0797fXZkM2VLlu4lSmeG',62,1,NULL),(90,'68319100027','$2b$10$k3itzMOIqmGIo/4cu/f5lOkEruq4hmCpOdHpYPNDQpMQGvFF0aNm6',63,1,NULL),(91,'68319100028','$2b$10$X4Yx8r8nRFWchyiJedDJoeNtLfkbZ9upVzpvFKowyYKqfeGabwgfq',64,1,NULL),(92,'68319100029','$2b$10$9onZmvNuhkO3SquUx7eyCeCi/OFk3d3KPffBhlChc4PlFby5yZ0u6',65,1,NULL),(93,'68319100030','$2b$10$OmkavZMrfsyIiLb8Vi1ooehTabiKKTVKE/TqncJq9q3l8oQ/W6o/a',66,1,NULL),(94,'68319100031','$2b$10$MgFhNc/RnNc/PrknpZ36benu/BBAOWMCq6osDu0WlRS2rRON0Rhza',67,1,NULL),(95,'68319100032','$2b$10$Ukf3M6O/QkuDDSlZntSFwu43MmMai2.iPOCNSwjEnsVJeK8N9FaWa',68,1,NULL),(96,'68319100033','$2b$10$6jTST79fYeGgpPRtdCOBJunAQVhMh2x4eVWpF0YksNaNrGjS1l6B.',69,1,NULL),(97,'68319100034','$2b$10$qxrKZey2VDYq.xhTUzFOf.PbNMjtNryEWvw3m3lFTAimZNIKq7wEO',70,1,NULL),(98,'68302110001','$2b$10$oT9I5qnjpT8DUXoDy3UZS.ARHWPAqtQ2gJHOyi5VZ/JlP6nF1Tsna',71,1,NULL),(99,'68302110002','$2b$10$MOIvjzlNxO89XHBAXpdmyeQSAPookT3B9ocEFRRfr1AtAMSOs6e/W',72,1,NULL),(100,'68302110003','$2b$10$MoJCs7Nay8k/3TCP2jVGvepHbuugBaSW8fVpfAma8n9S4TMQA0XC2',73,1,NULL),(101,'68302110004','$2b$10$rVSKYUGr7u.m33fRewh2NOQ4Sdd20.FTTkuiUieLcGP1H9Gn64EGS',74,1,NULL),(102,'68302110005','$2b$10$KMZDiLU1lUO4Zv1XNijDReT8lffSRN3yCgQpzBEfjolDnxMs10ESW',75,1,NULL),(103,'68302110006','$2b$10$bvi2cZOy4wqFZysoNIcWIePm9VC1EpJpyA1dlAf/TrhW2f5olN4IS',76,1,NULL),(104,'68302110007','$2b$10$FXF9JGEv3Vf9MOYcYNVdGeB8pW9A80ww.hw1s.wkwtZXmUwie0HOS',77,1,NULL),(105,'68302110008','$2b$10$grnfBjWOiFPmO.U9j57A/OtRcy27OE6brtZjc3uJIXkMGn4ToE.ou',78,1,NULL),(106,'68302110009','$2b$10$miZLzifWZFtW0UkAYKZLbeFxk5x63esFqX9UALzOG9H6jtfDyauJ2',79,1,NULL),(107,'68302110010','$2b$10$NuOjO8goAGEk59QXcWRjFOv4d3qKeuhvtQHAJUULuFNuH8M.swu.W',80,1,NULL),(108,'68302110011','$2b$10$HDRympeSXzsJKrj0sGz7ZuVLkiuVYKfCRkVAQRK478.q6wIn6rG5m',81,1,NULL),(109,'68302110012','$2b$10$uZcQ2HwpJbtSsk6/AUKK/.FfmhJnf3bFOhMztc8QUYVJnAmPVKFSm',82,1,NULL),(110,'68302110013','$2b$10$0KjCxKnINhAX8KJ0um/c3uZlyXlX6wcqEjaKsJvQb1qBA4EN2xpdu',83,1,NULL),(111,'68302110014','$2b$10$eutdoadVNMaVZu05l0RnNOuI1GhYyGdJELGPSpZ9dHewkfgb6Icxa',84,1,NULL),(112,'68302110015','$2b$10$pAt3K35XNMVLLOjNpS.BNeXUPRYoRpwnj1K67d9jtfQ0b2jyMENnu',85,1,NULL),(113,'68302110016','$2b$10$HO3DdMP37LQ2hEuLt.gtF.dLHRdNLxTpGLlFC3HEx4E8ob0ef4ccK',86,1,NULL),(114,'68302110017','$2b$10$KW6b6uhZ6CxG4sx0TQWpqee/F/D8RrGABv44iJlOLBUET7sNPz/pW',87,1,NULL),(115,'68302110018','$2b$10$RDJmz5AkNY6K.fsdDBInzetAlV0UXUBySM7byg4XQ.foD7uQDHdfy',88,1,NULL),(116,'68302110020','$2b$10$avm5M4TmOhMyL29IHf2YjejFTGFbIGc2d5tghk1li96EIKckUHSy6',89,1,NULL),(117,'68302110022','$2b$10$eZhDikzeVF/VZS7wVJLkPekqmtreYgehcLD66PFMyulYsvnfsgZPO',90,1,NULL),(118,'68302110023','$2b$10$ynR23Yf533UI2pu6sF4t9ebmsW5SyxhKyWslhZteq9K84Nuo7Rtj2',91,1,NULL),(119,'68302110024','$2b$10$e8QKms83A3r68x.xoKP0UezWbVQlRsY/EhfpeRWBWSMSkFosnghHq',92,1,NULL),(120,'68302020001','$2b$10$e7olA19jola92AZwAUQsfOdBVTfFSZAlEq8NwjvtwbvgxFgeMKkXS',93,1,NULL),(121,'68302020002','$2b$10$6rQthTW.0nucq1lU0oD.XeD5GOiiIlOqoE8.IZE54PzFhpNouOMnq',94,1,NULL),(122,'68302020003','$2b$10$.Dlug45ei8/rB46eHWWEmOeNcEkiYH1/gtHklt3KfSta6zNCyJaXm',95,1,NULL),(123,'68302020005','$2b$10$Bnk7AAQtWlAH8nEq1.ZF/uBUDAhhUesW7ZVUHfKFrO5H9UjH6lA5a',96,1,NULL),(124,'68302020006','$2b$10$tNezXvEBPdYeTliq3A0GaOBsi/pF8EiCDhXQ0N8dmISBvs4GtuEO.',97,1,NULL),(125,'68302020008','$2b$10$Qd6o/DHWvlCjbjBF.2gCcObk60SYRlIGhwpKzokQCgD7chuMq4Dq2',98,1,NULL),(126,'68302020009','$2b$10$mJ80XS6.0.h/aZFcojxm9eiC34wX.3H.38daTxbbW/YeRkRa5Ge7q',99,1,NULL),(127,'68302020010','$2b$10$YK/KN/H0dyY20Jj3m3SHYOWP/72LQduf6qUYXD648ONpehgTM6RsG',100,1,NULL),(128,'68302020011','$2b$10$PizgMGf28VISeXDRDckkKuH97Ohu.52DtZ2b57Pzl8m9aOczQJ0t.',101,1,NULL),(129,'68302020012','$2b$10$FZmZBncxmxshykdzvDeWL.jOX82R1phVZC96nzo01KWl8PsABGdIG',102,1,NULL),(130,'68302020013','$2b$10$N1rGB7vT8X52NQbHAr1FN.22wxJvTkqhjLVNeIoreqjrzUEFFxD7q',103,1,NULL),(131,'68302020014','$2b$10$vZR9VSLA9yqDBZBl6CxMA./hB8cwJnZfb177rnuBknd6w3p8TolUu',104,1,NULL),(132,'68302020015','$2b$10$mrk5i6n/KEYTvqug.A.dBOqzaOkZBbQR73Af7rBvlErzDMich0eVy',105,1,NULL),(133,'68302020017','$2b$10$qUcxo7t7dU4L.5MVmJpZiujxuO/sZpjQ.yht0IyufxS1o0VyI.LpS',106,1,NULL),(134,'68302020018','$2b$10$Yh0sklDbYknHfGU0ldRBF.tCqNLoqdAwVLkBAxJFDWdORy4XVRytG',107,1,NULL),(135,'68302020019','$2b$10$1gLqNgBMAjSo9iAIbZ0ov.uOmja/Ie0bdpZhMV0n9uDGD5sCuZGY.',108,1,NULL),(136,'68302020021','$2b$10$odyHUig1P5xuXEKgjYqMTOkjeG5sl9sso7HaDUveWjF60GUOj0Eo.',109,1,NULL),(137,'68302020022','$2b$10$gbQ8h7.DRj38WNeqJgpKYOK15dIzq8/4AwJ6MUf01kPCf2x6j8TEi',110,1,NULL),(138,'68302020023','$2b$10$fd..gWgY28GwRL/QqIFEGO0MDTxJHejqCPs1yj2ryHVZ65noS6qkK',111,1,NULL),(139,'68302020024','$2b$10$sfvZqoJ1ZOMQwxG98.blzOStuUQDS064eyTQUxC.sTfuOrNcIyz/u',112,1,NULL),(140,'68302020025','$2b$10$zjVHOhqn7jJb5oLJG.f32.fhcV6UTDjeMKl0ZByU4pOsBj8ar0bQi',113,1,NULL),(141,'68302020026','$2b$10$7uNUj4UyjsfDMGxCoceYy.UjlXTkjhYNCR.bK59TLpk75fJMlY5s6',114,1,NULL),(142,'68302020027','$2b$10$d6UiZbO1PrmKhpZjvK8lzu5cspJ5yvXxczURQqdCU1trHPd3456Y2',115,1,NULL),(143,'68302020029','$2b$10$XPrAlUwTvB5/p1wpxvFOe.S.lqHF/Hhsn0vfiDpvj9gYGux2alIhm',116,1,NULL),(144,'68302020030','$2b$10$vwjD2lnwWg6nNjGIdKrUSuqZXot0czbgWfspZbwC1JM6fyQ34LPoW',117,1,NULL),(145,'68307020001','$2b$10$1RY/8PAz2UkMwk7aZd2JgOQFM6LxveIPIwLTl.gcEjUJNRbRTK3LO',118,1,NULL),(146,'68307020002','$2b$10$oprcmyANNiCFlCe7f8Zaa.AGRYM6ItQ4eyZ9jkbj/lAGzhxmWNI/O',119,1,NULL),(147,'68307010002','$2b$10$OpBZNd58zDF62M0kuDFXzeXeBHDvLFoxTOyLU4tKZobT9NlQ6Eiiu',120,1,NULL),(148,'68307010003','$2b$10$1huqcZnTLT7ZCEEJXw3fKu2zyh7/Dxl6okGjTTtaLQ49qb555dgpm',121,1,NULL),(149,'68307010004','$2b$10$MhLnEi45GY8vfIUWcdYICeWHbdadleoCn6ADSCON.jrfzIbSLxDEi',122,1,NULL),(150,'68307010006','$2b$10$ejBSp1f.Pfovi2eRZvaF2.DPYZTDLhMX3IkpVJ45AQflLv1QvNBmi',123,1,NULL),(151,'68307010007','$2b$10$G4dVJOn4sgmexN4FtU/Lt.beRIgTdBC7x8WvafHsYk63gzkn5T6G.',124,1,NULL),(152,'68307010008','$2b$10$XjiKp2Tg0V51AxQedgpF5OetVoeQ8HPcWE1NJPiN3L4FBeQ9CI9ia',125,1,NULL),(153,'68307010009','$2b$10$Wd6ECxZVQTd.uinIbaS5ZufeG5cGXJMkc2lPnFjWv3Ewhgn5xE0je',126,1,NULL),(154,'68315040001','$2b$10$uhrHFVqE7xDaSCmXFKqbduOwBYYYWnKRqz1dyPz1Te.I/S0beWDRC',127,1,NULL),(155,'68315040002','$2b$10$W2ynkyWJ5LXFJiTPyhM01uXB.IL2KduF/gZ/Xzf.zGNuxuRo61/VC',128,1,NULL),(156,'68315040003','$2b$10$41BZKLjpdn/u4NrdfkWrL.pYzvJQaYBkiq00G1oGLB31qaKLZch46',129,1,NULL),(157,'68315040004','$2b$10$qgo/rb71vvsG10rnzd2/de.szNbOeVLDNNkooFl0pitEDlaR3wXOe',130,1,NULL),(158,'68315040005','$2b$10$D.VV/5yobXc1NOBjYAr6tOcoQmvv4pGNIpIlP3AqG5EohLjH2daiS',131,1,NULL),(159,'68315040006','$2b$10$zx3.Xdw9FOSCeNFSblFw6OTvfCFPf8M2plbQgEteB8yYvukxcVuhq',132,1,NULL),(160,'68315040007','$2b$10$UQO5751dJxbFqc1GStCZs.YHD7Weorg9XxhfHF4HOofpMAPrzQ3VS',133,1,NULL),(161,'68315040008','$2b$10$i5GzumwbeRkkzg3Zvu0eoejfF1J5fJw4EndenxaB7LTMXSMC2IcKi',134,1,NULL),(162,'68315040009','$2b$10$cLFtyKugRHyNIY2qDLkEVOxG8oAfNKnlYvJzC.uGopGMKo8CI0T6S',135,1,NULL),(163,'68315040010','$2b$10$eHVQ2f15uxIxr/VTI5i/X.FabmgfSu1/b14ZxAYxcjv7At4.gx/q.',136,1,NULL),(164,'68315040011','$2b$10$gZsHbDzDqnwpGIXLG9svSus2oGWQhtW8lvTS7z4RfN87cyk3I0t7m',137,1,NULL),(165,'68315040012','$2b$10$E94WV882r.G/ucAV4XvSqePEVeX3FCBLYR5om/nT8IQf.lbiJSowG',138,1,NULL),(166,'68315040013','$2b$10$h34b.ZHx8jiU9vXxPw6eXeJV1Ye4DWYPcDgYfcgbJHzidrJOQTH9C',139,1,NULL),(167,'68315040014','$2b$10$YtwQRtNj4W4QZCXBeFPx9.RH6XdH5U8UM7MLkwFMYJGg7saoo8Abq',140,1,NULL),(168,'68315040015','$2b$10$sN3KLw3G2a3oECG4Y/BU..I8cgyBdq29gSbxaAKXw.wNonVwQorsm',141,1,NULL),(169,'68315040016','$2b$10$L3LAmWnvqci/8OZKHgtY3O2vnMZO5AvNLgpk6QilcDbTQcqDml.lm',142,1,NULL),(170,'68315040017','$2b$10$ltcZQSchmzDor0IZ2y1k3uMrvtZQvXYwFdgqNnkH0MNmvFw64zVQ2',143,1,NULL),(171,'68315040018','$2b$10$BYN.xme/3qZUG9XNTtRhHe79.CgALuxWH.nd.6fMK/hMRE2yEFTia',144,1,NULL),(172,'68315040019','$2b$10$i7nbyIzuuLStzy4ehIuZ8.g2.G05d/UxJMwYFxzDEDJ8N6YcSoapK',145,1,NULL),(173,'68315040020','$2b$10$J2v1U8e4rO.uOnAQmEf1XeSOJeALJMb20TNHSBjSV86Cky09UNt2W',146,1,NULL),(174,'68315040021','$2b$10$QYT40pzR9CH2JYMSTk.p8OTGqPp7fh4JRgLh84TsQUSSILK1c90Ni',147,1,NULL),(175,'68315040022','$2b$10$62Y5AxpNyAIiLmneOsIfwOfgBmnZOg/gvgYQTxGIbJwqdXw9L93eK',148,1,NULL),(176,'68315040023','$2b$10$HCugfLWQtzgwtNNVLpkOr.CYpvNkkxEr8HkabMxVJ6aWc5n./R6oG',149,1,NULL),(177,'68315040024','$2b$10$XjMSoPI49KP4hHYy8wPkOODO0UPOZ4XhPaxm7s2UL6zuDZa1zuBwi',150,1,NULL),(178,'68315040025','$2b$10$RM.x59K.VkGyp7hoOASfeevMHJGxbMPsnrhNR7X0NZqjMYeHx0CV.',151,1,NULL),(179,'68315040026','$2b$10$HpYJlhSfAZFRAVjN3SKCgOV1DRuGWHrpzR3nrRNjow33KKzVdIvue',152,1,NULL),(180,'68315040027','$2b$10$tPOUF.FIB7eJ9bGT4.YBj.wO9mgvGyrag.NfGVdEcBhTtNTjP2z9K',153,1,NULL),(181,'68315040028','$2b$10$WJb7UBX81PL4TMQjG27XYOEPq1s90xTYddH.t/8M0FZW1LLmc2uby',154,1,NULL);
/*!40000 ALTER TABLE `logins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `major`
--

DROP TABLE IF EXISTS `major`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `major` (
  `id` int NOT NULL AUTO_INCREMENT,
  `major_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` int NOT NULL,
  `create_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `major_major_name_key` (`major_name`),
  KEY `major_departmentId_fkey` (`departmentId`),
  CONSTRAINT `major_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `major`
--

LOCK TABLES `major` WRITE;
/*!40000 ALTER TABLE `major` DISABLE KEYS */;
/*!40000 ALTER TABLE `major` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_companies`
--

DROP TABLE IF EXISTS `student_companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_companies` (
  `studentId` int NOT NULL,
  `companyId` int NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`studentId`,`companyId`),
  KEY `student_companies_companyId_fkey` (`companyId`),
  CONSTRAINT `student_companies_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_companies_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_companies`
--

LOCK TABLES `student_companies` WRITE;
/*!40000 ALTER TABLE `student_companies` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `educationLevel` int NOT NULL,
  `major_id` int DEFAULT NULL,
  `academicYear` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  `term` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` int DEFAULT NULL,
  `gradeLevel` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `curriculum` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `students_studentId_key` (`studentId`),
  UNIQUE KEY `students_userId_key` (`userId`),
  KEY `students_educationLevel_fkey` (`educationLevel`),
  KEY `students_major_id_fkey` (`major_id`),
  KEY `students_departmentId_fkey` (`departmentId`),
  CONSTRAINT `students_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `students_educationLevel_fkey` FOREIGN KEY (`educationLevel`) REFERENCES `education_levels` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `students_major_id_fkey` FOREIGN KEY (`major_id`) REFERENCES `major` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `students_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (20,'67202110001',24,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(21,'67202110002',25,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(22,'67202110003',26,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(23,'67202110004',27,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(24,'67202110005',28,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(25,'67202110007',29,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(26,'67202110008',30,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(27,'67202110009',31,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(28,'67202110010',32,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(29,'67202110011',33,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(30,'67202110014',34,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(31,'67202110016',35,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(32,'67202110017',36,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(33,'67202110020',37,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(34,'67202110021',38,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(35,'67202110023',39,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(36,'67202110025',40,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(37,'67202110026',41,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(38,'67202110027',42,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(39,'67202110028',43,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(40,'67202110029',44,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(41,'67202110030',45,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(42,'67202110031',46,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(43,'67202110032',47,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(44,'67202110034',48,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(45,'67202110035',49,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(46,'67202110037',50,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(47,'67202110040',51,1,NULL,'2568',1,'1','0',16,'ปวช.2','ทวิภาคี'),(48,'68319100016',52,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(49,'68319100017',53,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(50,'68319100018',54,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(51,'68319100019',55,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(52,'68319100020',56,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(53,'68319100021',57,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(54,'68319100022',58,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(55,'68319100023',59,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(56,'68319100024',60,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(57,'68319100025',61,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(58,'68319100026',62,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(59,'68319100027',63,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(60,'68319100028',64,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(61,'68319100029',65,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(62,'68319100030',66,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(63,'68319100031',67,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(64,'68319100032',68,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(65,'68319100033',69,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(66,'68319100034',70,2,NULL,'2568',1,'1','2',7,'ปวส.1','ทวิภาคี'),(67,'68302110001',71,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(68,'68302110002',72,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(69,'68302110003',73,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(70,'68302110004',74,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(71,'68302110005',75,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(72,'68302110006',76,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(73,'68302110007',77,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(74,'68302110008',78,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(75,'68302110009',79,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(76,'68302110010',80,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(77,'68302110011',81,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(78,'68302110012',82,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(79,'68302110013',83,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(80,'68302110014',84,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(81,'68302110015',85,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(82,'68302110016',86,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(83,'68302110017',87,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(84,'68302110018',88,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(85,'68302110020',89,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(86,'68302110022',90,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(87,'68302110023',91,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(88,'68302110024',92,2,NULL,'2568',1,'1','1',16,'ปวส.1','ทวิภาคี'),(89,'68302020001',93,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(90,'68302020002',94,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(91,'68302020003',95,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(92,'68302020005',96,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(93,'68302020006',97,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(94,'68302020008',98,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(95,'68302020009',99,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(96,'68302020010',100,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(97,'68302020011',101,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(98,'68302020012',102,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(99,'68302020013',103,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(100,'68302020014',104,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(101,'68302020015',105,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(102,'68302020017',106,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(103,'68302020018',107,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(104,'68302020019',108,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(105,'68302020021',109,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(106,'68302020022',110,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(107,'68302020023',111,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(108,'68302020024',112,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(109,'68302020025',113,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(110,'68302020026',114,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(111,'68302020027',115,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(112,'68302020029',116,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(113,'68302020030',117,2,NULL,'2568',1,'1','1',6,'ปวส.1','ทวิภาคี'),(114,'68307020001',118,2,NULL,'2568',1,'1','1',12,'ปวส.1','ทวิภาคี'),(115,'68307020002',119,2,NULL,'2568',1,'1','1',12,'ปวส.1','ทวิภาคี'),(116,'68307010002',120,2,NULL,'2568',1,'1','1',11,'ปวส.1','ทวิภาคี'),(117,'68307010003',121,2,NULL,'2568',1,'1','1',11,'ปวส.1','ทวิภาคี'),(118,'68307010004',122,2,NULL,'2568',1,'1','1',11,'ปวส.1','ทวิภาคี'),(119,'68307010006',123,2,NULL,'2568',1,'1','1',11,'ปวส.1','ทวิภาคี'),(120,'68307010007',124,2,NULL,'2568',1,'1','1',11,'ปวส.1','ทวิภาคี'),(121,'68307010008',125,2,NULL,'2568',1,'1','1',11,'ปวส.1','ทวิภาคี'),(122,'68307010009',126,2,NULL,'2568',1,'1','1',11,'ปวส.1','ทวิภาคี'),(123,'68315040001',127,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(124,'68315040002',128,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(125,'68315040003',129,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(126,'68315040004',130,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(127,'68315040005',131,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(128,'68315040006',132,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(129,'68315040007',133,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(130,'68315040008',134,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(131,'68315040009',135,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(132,'68315040010',136,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(133,'68315040011',137,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(134,'68315040012',138,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(135,'68315040013',139,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(136,'68315040014',140,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(137,'68315040015',141,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(138,'68315040016',142,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(139,'68315040017',143,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(140,'68315040018',144,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(141,'68315040019',145,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(142,'68315040020',146,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(143,'68315040021',147,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(144,'68315040022',148,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(145,'68315040023',149,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(146,'68315040024',150,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(147,'68315040025',151,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(148,'68315040026',152,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(149,'68315040027',153,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี'),(150,'68315040028',154,2,NULL,'2568',1,'1','1',13,'ปวส.1','ทวิภาคี');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supervisions`
--

DROP TABLE IF EXISTS `supervisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supervisions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `companyId` int NOT NULL,
  `teacherId` int NOT NULL,
  `supervisionDate` datetime(3) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `type` enum('ON_SITE','ONLINE','PHONE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ON_SITE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `supervisions_studentId_companyId_fkey` (`studentId`,`companyId`),
  KEY `supervisions_teacherId_fkey` (`teacherId`),
  CONSTRAINT `supervisions_studentId_companyId_fkey` FOREIGN KEY (`studentId`, `companyId`) REFERENCES `student_companies` (`studentId`, `companyId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `supervisions_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supervisions`
--

LOCK TABLES `supervisions` WRITE;
/*!40000 ALTER TABLE `supervisions` DISABLE KEYS */;
/*!40000 ALTER TABLE `supervisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Teacher`
--

DROP TABLE IF EXISTS `Teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Teacher` (
  `id` int NOT NULL AUTO_INCREMENT,
  `departmentId` int DEFAULT NULL,
  `majorId` int DEFAULT NULL,
  `room` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `educationId` int DEFAULT NULL,
  `term` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `years` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grade` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Teacher_userId_key` (`userId`),
  KEY `Teacher_departmentId_fkey` (`departmentId`),
  KEY `Teacher_majorId_fkey` (`majorId`),
  KEY `Teacher_educationId_fkey` (`educationId`),
  CONSTRAINT `Teacher_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Teacher_educationId_fkey` FOREIGN KEY (`educationId`) REFERENCES `education_levels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Teacher_majorId_fkey` FOREIGN KEY (`majorId`) REFERENCES `major` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Teacher_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Teacher`
--

LOCK TABLES `Teacher` WRITE;
/*!40000 ALTER TABLE `Teacher` DISABLE KEYS */;
/*!40000 ALTER TABLE `Teacher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_classrooms`
--

DROP TABLE IF EXISTS `teacher_classrooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_classrooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacherId` int NOT NULL,
  `studentId` int NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `teacher_classrooms_teacherId_studentId_key` (`teacherId`,`studentId`),
  KEY `teacher_classrooms_studentId_fkey` (`studentId`),
  CONSTRAINT `teacher_classrooms_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `teacher_classrooms_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_classrooms`
--

LOCK TABLES `teacher_classrooms` WRITE;
/*!40000 ALTER TABLE `teacher_classrooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_classrooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prefix` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstname` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `citizenId` varchar(13) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` int NOT NULL DEFAULT '7',
  `sex` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `birthday` datetime(3) DEFAULT NULL,
  `user_img` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_citizenId_key` (`citizenId`),
  UNIQUE KEY `users_phone_key` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'Admin','ระบบ','1103702589654','0987654321',1,1,'2026-04-28 09:44:42.735','1985-06-15 00:00:00.000',NULL),(2,NULL,'ทรงวุฒิ','เรือนไทย','1100700200001','0891111111',2,1,'2026-04-28 09:44:42.735','1970-03-20 00:00:00.000',NULL),(19,NULL,'ศุภชัย','นนท์ธีระวิชยา','1100700200019','0892222201',2,1,'2026-04-28 10:49:55.427','1972-05-10 00:00:00.000',NULL),(20,NULL,'กนกวรรณ','ส่งสมบูรณ์','1100700200020','0892222202',2,0,'2026-04-28 10:49:55.432','1975-08-22 00:00:00.000',NULL),(21,NULL,'สุรเชษฐ์','แก้วปาน','1100700200021','0892222203',2,1,'2026-04-28 10:49:55.435','1973-11-15 00:00:00.000',NULL),(22,NULL,'เจนศักดิ์','แสงคำเฉลียง','1100700200022','0892222204',2,1,'2026-04-28 10:49:55.441','1974-02-28 00:00:00.000',NULL),(24,'นางสาว','สิรามล','กลัดเพ็ชร','1729900804319','0900527016',7,2,'2026-05-17 13:34:39.026','2008-11-04 17:00:00.000',NULL),(25,'นางสาว','ธัญชนก','ศรีนาค','1159900538517','0979611663',7,2,'2026-05-17 13:34:39.086','2009-07-12 17:00:00.000',NULL),(26,'นางสาว','ณัฐชยา','คล้ายเข็ม','1729900814659','0903129133',7,2,'2026-05-17 13:34:39.138','2009-02-28 17:00:00.000',NULL),(27,'นางสาว','กนกขวัญ','ธานี','1729900792493','0942766495',7,2,'2026-05-17 13:34:39.188','2008-07-06 17:00:00.000',NULL),(28,'นางสาว','ชลธิชา','เจตุนา','1101501403670','0917145637',7,2,'2026-05-17 13:34:39.240','2008-11-08 17:00:00.000',NULL),(29,'นางสาว','วรรณนิษา','ทองถนอม','1729900790466','0916427593',7,2,'2026-05-17 13:34:39.290','2008-06-12 17:00:00.000',NULL),(30,'นางสาว','กัญญารัตน์','พุทธรัตน์','1104400059330','0954403144',7,2,'2026-05-17 13:34:39.342','2009-04-12 17:00:00.000',NULL),(31,'นางสาว','ฑิฆัมพร','ด่านเกลี้ยกล่อม','1729900790776','0997559134',7,2,'2026-05-17 13:34:39.392','2008-06-17 17:00:00.000',NULL),(32,'นาย','ธนภัทร','เขียวเซ็น','1729900803517','0951888095',7,1,'2026-05-17 13:34:39.443','2008-10-29 17:00:00.000',NULL),(33,'นาย','ทีระโชติ','โพธิ์ไพจิตร์','1729900817101','0924982646',7,1,'2026-05-17 13:34:39.495','2009-03-27 17:00:00.000',NULL),(34,'นางสาว','ณัฏฐณิชา','วงษ์คำจันทร์','1729900811820','0913136239',7,2,'2026-05-17 13:34:39.547','2009-01-26 17:00:00.000',NULL),(35,'นาย','สงกรานต์','คล้ายสุวรรณ','1729900818522','0917457463',7,1,'2026-05-17 13:34:39.597','2009-04-12 17:00:00.000',NULL),(36,'นางสาว','กมลวรรณ','แดงดี','1720900355605','0977188370',7,2,'2026-05-17 13:34:39.648','2008-11-21 17:00:00.000',NULL),(37,'นาย','ชัยสิทธิ์','สร้อยชมภู','1729900787520','0974546627',7,1,'2026-05-17 13:34:39.700','2008-05-06 17:00:00.000',NULL),(38,'นางสาว','ชลธิชา','ท้าวลา','1729900796324','0906476800',7,2,'2026-05-17 13:34:39.751','2008-08-12 17:00:00.000',NULL),(39,'นางสาว','นิศาชล','เปรมเจริญ','1729900824123','0930761443',7,2,'2026-05-17 13:34:39.802','2009-06-12 17:00:00.000',NULL),(40,'นางสาว','อฐิติยา','บุญประเสริฐ','1149600176431','0923946301',7,2,'2026-05-17 13:34:39.854','2007-10-03 17:00:00.000',NULL),(41,'นางสาว','พัชรา','สัมณะ','1720401223754','0915322701',7,2,'2026-05-17 13:34:39.905','2008-12-16 17:00:00.000',NULL),(42,'นาย','กิตติธัช','ประทุนทรัพย์','1729900807971','0926103786',7,1,'2026-05-17 13:34:39.955','2008-12-11 17:00:00.000',NULL),(43,'นางสาว','รุ่งจิรา','รุดเครือ','1729900804360','0942291868',7,2,'2026-05-17 13:34:40.006','2008-11-05 17:00:00.000',NULL),(44,'นางสาว','สุทัตตา','พ่อค้า','1729800393911','0940013185',7,2,'2026-05-17 13:34:40.057','2008-11-28 17:00:00.000',NULL),(45,'นางสาว','ณัฐชยา','วิเศษพันธ์','1729900810220','0944798510',7,2,'2026-05-17 13:34:40.110','2009-01-06 17:00:00.000',NULL),(46,'นาย','พีรพล','ปานจันทร์','1729900818221','0995125685',7,1,'2026-05-17 13:34:40.161','2009-04-10 17:00:00.000',NULL),(47,'นางสาว','ศิริทรัพย์','พรพิทักษ์','1318600043617','0976278069',7,2,'2026-05-17 13:34:40.212','2008-05-25 17:00:00.000',NULL),(48,'นางสาว','กิตติพร','พงษ์สุวรรณ','1729900789271','0901670816',7,2,'2026-05-17 13:34:40.263','2008-05-26 17:00:00.000',NULL),(49,'นาย','ทศพร','รื่นเริง','1720501198620','0918630610',7,1,'2026-05-17 13:34:40.313','2008-10-05 17:00:00.000',NULL),(50,'นาย','วรเชษฐ์','ดีมี','1729900821574','0996575413',7,1,'2026-05-17 13:34:40.364','2009-05-15 17:00:00.000',NULL),(51,'นาย','นพดล','พวงจินดา','1720401220739','0992115702',7,1,'2026-05-17 13:34:40.416','2007-10-29 17:00:00.000',NULL),(52,'นาย','อชิตพล','สุทธิ','1729900750618','0924798728',7,1,'2026-05-17 13:34:40.470','2007-03-31 17:00:00.000',NULL),(53,'นางสาว','กุลจิรา','สูงปานเขา','1100201903684','0973720400',7,2,'2026-05-17 13:34:40.521','2007-02-21 17:00:00.000',NULL),(54,'นาย','ประยุทธ','ลมูลจิตร','1720900326125','0966675080',7,1,'2026-05-17 13:34:40.573','2006-02-01 17:00:00.000',NULL),(55,'นาย','ธนโชติ','สุภาถิน','1729900731508','0942576759',7,1,'2026-05-17 13:34:40.625','2006-09-08 17:00:00.000',NULL),(56,'นางสาว','ทิพรัตน์','อินทร์ปาน','1729800350375','0999299016',7,2,'2026-05-17 13:34:40.675','2006-06-30 17:00:00.000',NULL),(57,'นางสาว','สุภาพร','ม่วงคำ','1729900730277','0942583048',7,2,'2026-05-17 13:34:40.727','2006-08-30 17:00:00.000',NULL),(58,'นาย','ชุติพนธ์','พวงดอกไม้','1139400031286','0908035964',7,1,'2026-05-17 13:34:40.778','2006-11-27 17:00:00.000',NULL),(59,'นางสาว','ปภาพินท์','พงษ์สุพรรณ','1219901096886','0943482388',7,2,'2026-05-17 13:34:40.830','2006-10-02 17:00:00.000',NULL),(60,'นางสาว','ธารารัตน์','พร้อมพิมพ์','1560301429018','0945157647',7,2,'2026-05-17 13:34:40.880','2006-01-13 17:00:00.000',NULL),(61,'นางสาว','ปาลิตา','บัวเพ็ชร','1809902391878','0953248460',7,2,'2026-05-17 13:34:40.931','2006-08-13 17:00:00.000',NULL),(62,'นางสาว','ปวริศา','เอมสมบูรณ์','1729900739797','0909228681',7,2,'2026-05-17 13:34:40.982','2006-11-27 17:00:00.000',NULL),(63,'นางสาว','อรพรรณ','สาททอง','1720900333628','0904456014',7,2,'2026-05-17 13:34:41.033','2006-10-30 17:00:00.000',NULL),(64,'นาย','จารุวัฒน์','สามงามหลู','1729900728671','0952469725',7,1,'2026-05-17 13:34:41.084','2006-08-15 17:00:00.000',NULL),(65,'นางสาว','ภัทราวดี','ผู้ชงแก้ว','1720401216855','0996715336',7,2,'2026-05-17 13:34:41.135','2006-07-31 17:00:00.000',NULL),(66,'นางสาว','วรรรา','ทองสุข','1729900652535','0914526418',7,2,'2026-05-17 13:34:41.187','2004-04-30 17:00:00.000',NULL),(67,'นางสาว','อารียา','เภาวงษ์','1129901835035','0990173723',7,2,'2026-05-17 13:34:41.238','2004-03-27 17:00:00.000',NULL),(68,'นางสาว','จุฬาลักษณ์','ยิ้มแย้ม','1179900491405','0972579556',7,2,'2026-05-17 13:34:41.289','2006-11-02 17:00:00.000',NULL),(69,'นาย','ศตพรรษ','วงค์เครือสอน','1729400005956','0926005186',7,1,'2026-05-17 13:34:41.340','2006-09-24 17:00:00.000',NULL),(70,'นางสาว','ชลพรรษ','กิตติโก','1729900737107','0906715415',7,2,'2026-05-17 13:34:41.392','2006-10-30 17:00:00.000',NULL),(71,'นางสาว','อมรรัตน์','ชมภูนุช','1729900738227','0992715975',7,2,'2026-05-17 13:34:41.446','2006-11-11 17:00:00.000',NULL),(72,'นางสาว','กัญญ์วรา','ม่วงศรี','1729800355849','0982922305',7,2,'2026-05-17 13:34:41.498','2006-10-25 17:00:00.000',NULL),(73,'นางสาว','วรรณษา','เซี่ยงลี้','1149600159928','0951371416',7,2,'2026-05-17 13:34:41.558','2006-08-21 17:00:00.000',NULL),(74,'นางสาว','นริสรา','ชัยชนะ','1729900750057','0959407601',7,2,'2026-05-17 13:34:41.610','2007-03-23 17:00:00.000',NULL),(75,'นางสาว','วริศรา','เดือนฉาย','1729900756896','0939856737',7,2,'2026-05-17 13:34:41.662','2007-06-08 17:00:00.000',NULL),(76,'นางสาว','วราภรณ์','แซ่ลิ้ม','1729900748745','0982711782',7,2,'2026-05-17 13:34:41.712','2007-03-07 17:00:00.000',NULL),(77,'นางสาว','คัทรียา','แก้วมิ่ง','1749800412648','0936390327',7,2,'2026-05-17 13:34:41.764','2006-09-05 17:00:00.000',NULL),(78,'นางสาว','สุกัญญา','จันทรัตน์','1729900735716','0994579964',7,2,'2026-05-17 13:34:41.817','2006-10-20 17:00:00.000',NULL),(79,'นางสาว','พรพิมล','หงษ์ทอง','1729900747293','0911462148',7,2,'2026-05-17 13:34:41.869','2007-02-21 17:00:00.000',NULL),(80,'นางสาว','ณัฐณิชา','อุปถัมภ์','1208300038422','0956301885',7,2,'2026-05-17 13:34:41.922','2006-10-12 17:00:00.000',NULL),(81,'นางสาว','ลลิดา','พยัฆวงค์','1720401218777','0906141954',7,2,'2026-05-17 13:34:41.974','2007-03-31 17:00:00.000',NULL),(82,'นางสาว','ปนัดดา','คงพะเนา','1749700137441','0933695564',7,2,'2026-05-17 13:34:42.025','2006-07-16 17:00:00.000',NULL),(83,'นางสาว','ปรัชญ์ณัฐฎา','มาลารัตน์','1729900738481','0987912806',7,2,'2026-05-17 13:34:42.076','2006-11-15 17:00:00.000',NULL),(84,'นางสาว','พุทธิดา','นิลเกษม','1729900730994','0930924319',7,2,'2026-05-17 13:34:42.128','2006-09-05 17:00:00.000',NULL),(85,'นางสาว','วริศา','กลำพบุตร','1729900732831','0928229390',7,2,'2026-05-17 13:34:42.179','2006-09-19 17:00:00.000',NULL),(86,'นางสาว','ลักษิกา','ก้อนทองดี','1729900748061','0910418428',7,2,'2026-05-17 13:34:42.231','2007-02-27 17:00:00.000',NULL),(87,'นางสาว','สิริวิมล','ด้วงละไม้','1729900728027','0900009194',7,2,'2026-05-17 13:34:42.282','2006-08-02 17:00:00.000',NULL),(88,'นางสาว','สุพพัตรา','สมสวย','1729900732369','0996836573',7,2,'2026-05-17 13:34:42.332','2006-09-15 17:00:00.000',NULL),(89,'นางสาว','กรพินธุ์','ตู้แก้ว','1199600434635','0956682969',7,2,'2026-05-17 13:34:42.382','2006-12-30 17:00:00.000',NULL),(90,'นางสาว','พิมพ์มาดา','ขันทองดี','1729800357264','0970309195',7,2,'2026-05-17 13:34:42.433','2006-11-23 17:00:00.000',NULL),(91,'นางสาว','จันทิมา','นิจลม','1710400112584','0941919854',7,2,'2026-05-17 13:34:42.483','2006-12-31 17:00:00.000',NULL),(92,'นางสาว','ปาริฉัตต์','ดำรงค์ภักดี','1729800351797','0954610089',7,2,'2026-05-17 13:34:42.534','2006-07-31 17:00:00.000',NULL),(93,'นาย','ธนวัฒน์','คล้ายสุบรรณ','1729800351827','0947322721',7,1,'2026-05-17 13:34:42.588','2006-08-05 17:00:00.000',NULL),(94,'นางสาว','ณฐพร','คงวิเชียร','1729900730811','0959695666',7,2,'2026-05-17 13:34:42.639','2006-09-03 17:00:00.000',NULL),(95,'นางสาว','สุธิมา','โฉมตระการ','1729900730617','0989318466',7,2,'2026-05-17 13:34:42.690','2006-09-01 17:00:00.000',NULL),(96,'นางสาว','ณัฐธิดา','พวงศิลป์','1104000189431','0924053350',7,2,'2026-05-17 13:34:42.741','2007-05-07 17:00:00.000',NULL),(97,'นางสาว','ปฐมาวดี','ดีลี','1729900746793','0928995115',7,2,'2026-05-17 13:34:42.791','2007-02-14 17:00:00.000',NULL),(98,'นางสาว','วิภาวดี','กลิ่นประทุม','1729800344839','0932978119',7,2,'2026-05-17 13:34:42.842','2006-02-27 17:00:00.000',NULL),(99,'นางสาว','สุภนิชา','เฉกแสงทอง','1720501189591','0987857270',7,2,'2026-05-17 13:34:42.893','2006-05-29 17:00:00.000',NULL),(100,'นาย','ธีรภัทร์','รอดจิตต์สวัสดิ์','1730601289899','0962057556',7,1,'2026-05-17 13:34:42.944','2006-09-13 17:00:00.000',NULL),(101,'นางสาว','โชติรส','กาบแก้ว','1730201457140','0901587396',7,2,'2026-05-17 13:34:42.995','2007-04-06 17:00:00.000',NULL),(102,'นางสาว','ฆนรส','ถินมานัด','1119600119594','0932321665',7,2,'2026-05-17 13:34:43.046','2006-06-11 17:00:00.000',NULL),(103,'นางสาว','มุกฎา','พุทธไชย','1729900753137','0952070484',7,2,'2026-05-17 13:34:43.097','2007-04-25 17:00:00.000',NULL),(104,'นางสาว','ธนพร','บุญหมั่น','1105000003711','0969813840',7,2,'2026-05-17 13:34:43.147','2006-10-01 17:00:00.000',NULL),(105,'นางสาว','สุวนันท์','ทับแสง','1729900741198','0946862283',7,2,'2026-05-17 13:34:43.201','2006-12-15 17:00:00.000',NULL),(106,'นางสาว','สุดารัตน์','แสงบุญ','1729900727608','0959569899',7,2,'2026-05-17 13:34:43.254','2006-07-31 17:00:00.000',NULL),(107,'นาย','บดินทร์','เจริญทรัพย์','1729900727373','0960139923',7,1,'2026-05-17 13:34:43.308','2006-08-02 17:00:00.000',NULL),(108,'นาย','วรพัทธ์','ฉัตรธีรธราพงษ์','1719900703172','0959840924',7,1,'2026-05-17 13:34:43.361','2005-12-02 17:00:00.000',NULL),(109,'นาย','ภานุวัฒน์','เอกสมบัติ','1729900737387','0924377611',7,1,'2026-05-17 13:34:43.413','2006-11-04 17:00:00.000',NULL),(110,'นางสาว','อรยา','พันธุ์สมบูรณ์','1729800331192','0975355582',7,2,'2026-05-17 13:34:43.465','2005-05-05 17:00:00.000',NULL),(111,'นางสาว','พัชรพร','แก้วเกิดเถื่อน','1729800328680','0915521131',7,2,'2026-05-17 13:34:43.515','2005-03-18 17:00:00.000',NULL),(112,'นาย','ผดุงเกียรติ','จำปาเงิน','1729900586362','0980064799',7,1,'2026-05-17 13:34:43.566','2002-07-03 17:00:00.000',NULL),(113,'นาย','ธนชิต','อมรภูวดล','1729900612215','0990127921',7,1,'2026-05-17 13:34:43.616','2003-05-22 17:00:00.000',NULL),(114,'นาย','สุพัฒน์','แผนสมบูรณ์','1729900726954','0927089004',7,1,'2026-05-17 13:34:43.667','2006-07-27 17:00:00.000',NULL),(115,'นาย','อานนท์','หรีมฉ่ำ','1729900736488','0967140627',7,1,'2026-05-17 13:34:43.717','2006-10-26 17:00:00.000',NULL),(116,'นาย','สาธร','หนองบอน','1720501182944','0996151329',7,1,'2026-05-17 13:34:43.768','2004-08-19 17:00:00.000',NULL),(117,'นาย','สิทธิชัย','จุ้ยแตง','1729900664347','0939345863',7,1,'2026-05-17 13:34:43.819','2004-09-06 17:00:00.000',NULL),(118,'นาย','ดนัยณัฐ','มณีวรรณ','1199901141599','0926896784',7,1,'2026-05-17 13:34:43.871','2007-03-19 17:00:00.000',NULL),(119,'นาย','วสิษฐ์พล','นุชปั้น','1729100051944','0923728312',7,1,'2026-05-17 13:34:43.921','2005-07-06 17:00:00.000',NULL),(120,'นางสาว','ญารินดา','เอี่ยมอินทร์','1729900735040','0940964425',7,2,'2026-05-17 13:34:43.974','2006-10-11 17:00:00.000',NULL),(121,'นางสาว','กชกร','ศรีบุญเพ็ง','1729900747111','0910882035',7,2,'2026-05-17 13:34:44.025','2007-02-18 17:00:00.000',NULL),(122,'นางสาว','วาสนา','การภักดี','1729100071457','0933584143',7,2,'2026-05-17 13:34:44.076','2007-05-11 17:00:00.000',NULL),(123,'นางสาว','สุนิตา','สีขาว','1729900731800','0981976743',7,2,'2026-05-17 13:34:44.127','2006-09-08 17:00:00.000',NULL),(124,'นาย','ศรัณยู','แตงหวาน','1720501188250','0902938503',7,1,'2026-05-17 13:34:44.177','2005-12-14 17:00:00.000',NULL),(125,'นางสาว','อารีรัตน์','โพธิเปี้ยศรี','1729900745967','0976796449',7,2,'2026-05-17 13:34:44.228','2007-02-03 17:00:00.000',NULL),(126,'นางสาว','นวนันท์','ร่มโพธิ์เย็น','1729900720778','0967913763',7,2,'2026-05-17 13:34:44.278','2006-05-20 17:00:00.000',NULL),(127,'นาย','ฐณะวัฒน์','แสนลาน','1729900725010','0976430948',7,1,'2026-05-17 13:34:44.331','2006-07-04 17:00:00.000',NULL),(128,'นางสาว','วรัญญา','ช้างมูล','1729900740744','0924558702',7,2,'2026-05-17 13:34:44.382','2006-12-08 17:00:00.000',NULL),(129,'นาย','นำโชค','แสงจันทร์','1729900687789','0939211173',7,1,'2026-05-17 13:34:44.432','2005-05-25 17:00:00.000',NULL),(130,'นาย','นิธิกร','ขำอรุณ','1729900717122','0937245178',7,1,'2026-05-17 13:34:44.483','2006-04-11 17:00:00.000',NULL),(131,'นาย','วงศกร','สร้อยสังวาลย์','1729900753927','0945754078',7,1,'2026-05-17 13:34:44.534','2007-05-06 17:00:00.000',NULL),(132,'นาย','สิรวิชญ์','แก่นเชื้อชัย','1729900754087','0906700411',7,1,'2026-05-17 13:34:44.584','2007-05-09 17:00:00.000',NULL),(133,'นางสาว','พลอยชมภู','พวงทอง','1729900724013','0974100397',7,2,'2026-05-17 13:34:44.635','2006-06-25 17:00:00.000',NULL),(134,'นาย','พงษ์นวัฒน์','ครุฑวิไล','1729900697148','0980786483',7,1,'2026-05-17 13:34:44.686','2005-09-02 17:00:00.000',NULL),(135,'นาย','เทพพิทักษ์','ช้อยเชื้อดี','1729900687231','0908031730',7,1,'2026-05-17 13:34:44.736','2005-05-18 17:00:00.000',NULL),(136,'นาย','ธีร์จุฑา','หมอรอดครุฑ','1729900731761','0909597274',7,1,'2026-05-17 13:34:44.787','2006-09-11 17:00:00.000',NULL),(137,'นางสาว','ธารารัตน์','โพธิผล','1729900726971','0921434333',7,2,'2026-05-17 13:34:44.838','2006-07-28 17:00:00.000',NULL),(138,'นาย','เก่งกานต์','ขุมทรัพย์','1200901467754','0956525024',7,1,'2026-05-17 13:34:44.888','2007-05-09 17:00:00.000',NULL),(139,'นาย','สุพจน์','ทับโชติ','1729900730986','0904423685',7,1,'2026-05-17 13:34:44.939','2006-09-06 17:00:00.000',NULL),(140,'นางสาว','นิศาชล','มากเทพวงษ์','1729100063365','0942146741',7,2,'2026-05-17 13:34:44.989','2006-08-11 17:00:00.000',NULL),(141,'นางสาว','พนิดา','เสกสุวงศ์','1729900751410','0930576839',7,2,'2026-05-17 13:34:45.040','2007-04-10 17:00:00.000',NULL),(142,'นาย','รัฐวิชญ์','แสงอุไรประเสริฐ','1729800345134','0925681869',7,1,'2026-05-17 13:34:45.091','2006-03-04 17:00:00.000',NULL),(143,'นาย','พชร','ชาวกงจักร์','1729900725915','0987964522',7,1,'2026-05-17 13:34:45.141','2006-07-12 17:00:00.000',NULL),(144,'นาย','เอกภาพ','มะชรา','1729900729481','0907495530',7,1,'2026-05-17 13:34:45.192','2006-08-23 17:00:00.000',NULL),(145,'นางสาว','ภัณฑิรา','จูประเสริฐ','1200901432373','0993260492',7,2,'2026-05-17 13:34:45.242','2006-05-08 17:00:00.000',NULL),(146,'นางสาว','นัฐวรรณ','นิสังกาศ','1729900581034','0955982606',7,2,'2026-05-17 13:34:45.292','2002-05-06 17:00:00.000',NULL),(147,'นาย','วุฒิพงษ์','แจ่มจอมทอง','1729900727390','0920731274',7,1,'2026-05-17 13:34:45.346','2006-08-02 17:00:00.000',NULL),(148,'นาย','ธนธร','โพธิ์สร้อย','1129902006687','0986500947',7,1,'2026-05-17 13:34:45.397','2006-12-24 17:00:00.000',NULL),(149,'นางสาว','บัณฑิตา','พรมศร','1729900747889','0937476595',7,2,'2026-05-17 13:34:45.448','2007-02-26 17:00:00.000',NULL),(150,'นางสาว','จุฑารัตน์','ชิดปราง','1729100068731','0994664769',7,2,'2026-05-17 13:34:45.499','2007-02-10 17:00:00.000',NULL),(151,'นาย','เด็ดเดี่ยว','อยู่ศรี','1729900738987','0967026615',7,1,'2026-05-17 13:34:45.549','2006-11-20 17:00:00.000',NULL),(152,'นาย','สรัสกร','หวังสุวรรณ','1729900688092','0972909953',7,1,'2026-05-17 13:34:45.600','2005-05-27 17:00:00.000',NULL),(153,'นางสาว','ญดาวรรณ','เมฆดี','1729900723084','0991829489',7,2,'2026-05-17 13:34:45.651','2006-06-15 17:00:00.000',NULL),(154,'นางสาว','นิชา','จันทร์อิ่ม','1620301187498','0954435442',7,2,'2026-05-17 13:34:45.701','2006-01-03 17:00:00.000',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'db_dvt_prod'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-18  5:41:03
