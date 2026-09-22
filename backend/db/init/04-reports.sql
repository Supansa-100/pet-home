-- =============================================================
-- PET-HOME Database Report Schema
-- =============================================================

CREATE TABLE IF NOT EXISTS pet_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  reporter_id INT NOT NULL,
  reason ENUM('spam', 'inappropriate', 'scam', 'abuse', 'duplicate', 'other') NOT NULL,
  details TEXT,
  status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES pet_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);
