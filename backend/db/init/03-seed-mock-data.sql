-- =============================================================
-- MOCK DATA FOR UI DEVELOPMENT
-- =============================================================

USE pethome_db;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- 1. สร้าง Users เพิ่มเติม (พาสเวิร์ดคือ password123 ทุกคน)
-- ==========================================
INSERT IGNORE INTO users (id, email, password_hash, full_name, phone, role, avatar_url) VALUES 
(2, 'poster1@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'สมชาย ใจดี (ผู้หาบ้าน)', '0812345678', 'poster', 'https://i.pravatar.cc/150?u=poster1'),
(3, 'poster2@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'สมหญิง รักสัตว์ (ผู้หาบ้าน)', '0823456789', 'poster', 'https://i.pravatar.cc/150?u=poster2'),
(4, 'adopter1@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'ก้องเกียรติ พร้อมเลี้ยง (ผู้รับเลี้ยง)', '0834567890', 'adopter', 'https://i.pravatar.cc/150?u=adopter1'),
(5, 'adopter2@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'มาลี ใจบุญ (ผู้รับเลี้ยง)', '0845678901', 'adopter', 'https://i.pravatar.cc/150?u=adopter2');

-- ==========================================
-- 2. สร้าง Pet Listings
-- Category: 1=สุนัข, 2=แมว, 3=กระต่าย, 4=นก, 5=ปลา, 6=อื่นๆ
-- ==========================================
INSERT IGNORE INTO pet_listings (id, user_id, category_id, name, breed, age_years, age_months, gender, size, color, description, health_info, conditions, location, status) VALUES 
(1, 2, 1, 'น้องโบ้', 'โกลเด้น รีทรีฟเวอร์', 2, 0, 'male', 'large', 'น้ำตาลทอง', 'น้องโบ้เป็นหมาใจดี ขี้เล่น ชอบวิ่งเก็บลูกบอลมากครับ เข้ากับเด็กๆ ได้ดี', 'ฉีดวัคซีนครบแล้ว แข็งแรงดี', 'บ้านมีรั้วมิดชิด มีเวลาพาไปเดินเล่น', 'กรุงเทพมหานคร', 'available'),
(2, 2, 2, 'ส้มจี๊ด', 'แมวไทย (ส้ม)', 0, 8, 'female', 'medium', 'ส้ม', 'น้องส้มจี๊ดขี้อ้อนมาก ชอบมานอนตัก กินเก่งสุดๆ', 'ทำหมันแล้ว หยดยาเห็บหมัดเรียบร้อย', 'เลี้ยงระบบปิดเท่านั้น', 'นนทบุรี', 'available'),
(3, 3, 1, 'เฉาก๊วย', 'ปอมเมอเรเนียน', 1, 2, 'male', 'small', 'ดำ', 'น้องไซส์ทีคัพ น่ารักมาก เห่าน้อย ติดเจ้าของ', 'สุขภาพแข็งแรง แต่แพ้ไก่', 'มีความรู้เรื่องการดูแลสุนัขพันธุ์เล็ก', 'เชียงใหม่', 'adopted'),
(4, 3, 3, 'ปุกปุย', 'กระต่ายหูตก (Holland Lop)', 1, 0, 'female', 'small', 'ขาว-เทา', 'กระต่ายน้อยน่ารัก กินหญ้าทิโมธีเก่งมาก ไม่กัดสายไฟ', 'แข็งแรง ถ่ายพยาธิแล้ว', 'เลี้ยงในบ้าน มีพื้นที่ให้วิ่งเล่น', 'กรุงเทพมหานคร', 'adopted');

-- ==========================================
-- 3. สร้าง Pet Images
-- ==========================================
INSERT IGNORE INTO pet_images (id, listing_id, image_url, is_primary) VALUES 
(1, 1, 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80', 1),
(2, 1, 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80', 0),
(3, 2, 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=600&q=80', 1),
(4, 2, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80', 0),
(5, 3, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80', 1),
(6, 4, 'https://images.unsplash.com/photo-1585110396000-c9fd4e4e5030?auto=format&fit=crop&w=600&q=80', 1);

-- ==========================================
-- 4. สร้าง Adoption Requests
-- ==========================================
INSERT IGNORE INTO adoption_requests (id, listing_id, adopter_id, message, status) VALUES 
(1, 1, 4, 'สวัสดีครับ ผมสนใจรับเลี้ยงน้องโบ้ครับ ที่บ้านมีสวนกว้างขวางและมีเวลาดูแลแน่นอนครับ', 'pending'),
(2, 3, 5, 'อยากรับน้องเฉาก๊วยมาอยู่เป็นเพื่อนครับ เคยเลี้ยงปอมมาก่อน เข้าใจนิสัยพันธุ์นี้ดีครับ', 'approved'),
(3, 4, 4, 'สนใจรับเลี้ยงกระต่ายครับ', 'approved');

-- ==========================================
-- 5. สร้าง Chat Rooms
-- ==========================================
INSERT IGNORE INTO chat_rooms (id, listing_id, poster_id, adopter_id) VALUES 
(1, 1, 2, 4),
(2, 3, 3, 5);

-- ==========================================
-- 6. สร้าง Chat Messages
-- ==========================================
INSERT IGNORE INTO chat_messages (id, room_id, sender_id, message, is_read) VALUES 
(1, 1, 4, 'สวัสดีครับ น้องโบ้ยังอยู่ไหมครับ?', 1),
(2, 1, 2, 'ยังอยู่ครับผม สนใจเข้ามาดูตัวน้องก่อนไหมครับ?', 1),
(3, 1, 4, 'สะดวกเป็นวันเสาร์นี้ช่วงบ่ายไหมครับ?', 0),
(4, 2, 5, 'สวัสดีค่ะ น้องเฉาก๊วยกินอาหารยี่ห้ออะไรอยู่คะ?', 1),
(5, 2, 3, 'ตอนนี้น้องกิน Royal Canin สำหรับพันธุ์เล็กค่ะ', 0);

-- ==========================================
-- 7. สร้าง Notifications
-- ==========================================
INSERT IGNORE INTO notifications (id, user_id, type, reference_id, message, is_read) VALUES 
(1, 2, 'new_request', 1, 'มีคำขออุปการะใหม่สำหรับ "น้องโบ้" จาก ก้องเกียรติ', 0),
(2, 4, 'request_approved', 2, 'คำขออุปการะ "น้องเฉาก๊วย" ของคุณได้รับการอนุมัติแล้ว!', 1),
(3, 2, 'new_message', 1, 'คุณมีข้อความใหม่จาก ก้องเกียรติ', 0);

SET FOREIGN_KEY_CHECKS = 1;
