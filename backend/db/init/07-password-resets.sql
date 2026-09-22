-- =============================================================
-- 07-password-resets.sql: ตารางเก็บ Token สำหรับรีเซ็ตรหัสผ่าน
-- เก็บเฉพาะค่า hash ของ token ไม่เก็บตัวจริง เพื่อว่าถ้าฐานข้อมูลรั่ว
-- ผู้ที่ได้ข้อมูลไปจะนำ token ไปใช้รีเซ็ตรหัสผ่านต่อไม่ได้
-- =============================================================

USE pethome_db;

CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_password_resets_token (token_hash)
)
