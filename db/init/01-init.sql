-- =============================================================
-- PET-HOME Database Init Script
-- charset: utf8mb4 (รองรับภาษาไทยและ Emoji)
-- =============================================================

CREATE DATABASE IF NOT EXISTS pethome_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pethome_db;

-- ตั้งค่า charset สำหรับ session นี้
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =============================================================
-- TABLES
-- =============================================================

-- 1. ตาราง users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('poster', 'adopter', 'admin') DEFAULT 'adopter',
  avatar_url VARCHAR(500),
  is_banned TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. ตาราง pet_categories
CREATE TABLE IF NOT EXISTS pet_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตาราง pet_listings
CREATE TABLE IF NOT EXISTS pet_listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(255),
  age_years INT,
  age_months INT,
  gender ENUM('male', 'female', 'unknown'),
  size ENUM('small', 'medium', 'large'),
  color VARCHAR(100),
  description TEXT,
  health_info TEXT,
  conditions TEXT,
  location VARCHAR(255),
  status ENUM('available', 'pending', 'adopted', 'closed') DEFAULT 'available',
  is_hidden TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES pet_categories(id)
);

-- 4. ตาราง pet_images
CREATE TABLE IF NOT EXISTS pet_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES pet_listings(id) ON DELETE CASCADE
);

-- 5. ตาราง adoption_requests
CREATE TABLE IF NOT EXISTS adoption_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  adopter_id INT NOT NULL,
  message TEXT,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES pet_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (adopter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. ตาราง chat_rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  poster_id INT NOT NULL,
  adopter_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES pet_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (poster_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (adopter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. ตาราง chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================
-- SEED DATA
-- =============================================================

-- หมวดหมู่สัตว์เลี้ยงพื้นฐาน
INSERT INTO pet_categories (name) VALUES 
('สุนัข'),
('แมว'),
('กระต่าย'),
('นก'),
('ปลา'),
('อื่นๆ');

-- บัญชี Admin เริ่มต้น 
-- รหัสผ่านคือ: password123 (ถูกแฮชไว้)
INSERT INTO users (email, password_hash, full_name, role) VALUES 
('admin@pethome.com', '$2a$12$Ay7uihTOaQVtrMviuywEWOAN3ffFClOVKvXuv1.va46yY3gcKDNGS', 'System Admin', 'admin');
