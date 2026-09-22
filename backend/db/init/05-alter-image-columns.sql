-- =============================================================
-- 05-alter-image-columns.sql: ขยายขนาดคอลัมน์เก็บรูปภาพแบบ Base64
-- =============================================================

ALTER TABLE pet_images MODIFY COLUMN image_url LONGTEXT NOT NULL;
ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT NULL;
