





--
-- Dumping data for table `appointments`
--






--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;

CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `medical_history` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `patients`
--


INSERT INTO `patients` VALUES (1,'Alice Brown','alice@example.com','9876543210',28,'Female','123 Main Street','2025-03-02 09:41:36','Diabetes, hypertension'),(2,'Bob Williams','bob@example.com','8765432109',35,'Male','456 Elm Street','2025-03-02 09:41:36','Past surgery for knee replacement'),(3,'Charlie Davis','charlie@example.com','7654321098',42,'Male','789 Pine Avenue','2025-03-02 09:41:36','Asthma and seasonal allergies');



--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('receptionist','doctor','patient') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



--
-- Dumping data for table `users`
--


INSERT INTO `users` VALUES (1,'Receptionist 1','receptionist1@example.com','$2b$10$/hV68pV79K2Ec8A0xZR96eggyjE7lCDD.88Lg3o2.6865if2x50U2','receptionist','2025-03-02 09:40:28'),(2,'Receptionist 2','receptionist2@example.com','$2b$10$UetJliAubpd.1T6bo.iMIug6sXqUqvtCPdjz9p7G0wPjp6oAc3c1C','receptionist','2025-03-02 09:40:28'),(3,'Dr. John Doe','doctor1@example.com','password789','doctor','2025-03-02 09:41:22'),(4,'Dr. Sarah Smith','doctor2@example.com','password987','doctor','2025-03-02 09:41:22');


CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `doctor_id` int DEFAULT NULL,
  `appointment_date` datetime NOT NULL,
  `status` enum('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `appointments` VALUES (1,1,3,'2024-03-05 10:00:00','Scheduled','2025-03-02 09:44:39'),(2,2,4,'2024-03-06 14:30:00','Scheduled','2025-03-02 09:44:39'),(3,3,3,'2024-03-07 09:00:00','Scheduled','2025-03-02 09:44:39');

-- Dump completed on 2025-03-03 19:04:30
