-- =============================================================
-- 06-seed-20-posters.sql
-- Seed 20 Demo Poster Accounts & Pet Listings
-- Password for all accounts: password123 ($2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m)
-- =============================================================

USE pethome_db;
SET NAMES utf8mb4;

INSERT IGNORE INTO users (email, password_hash, full_name, phone, role, avatar_url) VALUES
('demo.poster01@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'ธนภัทร ใจการุณ', '081-112-2334', 'poster', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'),
('demo.poster02@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'พิมลดา บุญรอด', '082-223-3445', 'poster', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'),
('demo.poster03@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'กัญญาภัค พิทักษ์สัตว์', '083-334-4556', 'poster', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'),
('demo.poster04@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'อภิสิทธิ์ เมตตาสัตว์', '084-445-5667', 'poster', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
('demo.poster05@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'ณัฐวุฒิ ปลื้มจิตต์', '085-556-6778', 'poster', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'),
('demo.poster06@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'ชญาภา ศรีสวัสดิ์', '086-667-7889', 'poster', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'),
('demo.poster07@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'วรเมธ เกียรติเมธี', '087-778-8990', 'poster', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'),
('demo.poster08@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'ศศิธร พูนสวัสดิ์', '088-889-9001', 'poster', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
('demo.poster09@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'ธนาคาร สุขเกษม', '089-990-0112', 'poster', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'),
('demo.poster10@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'กัญญารัตน์ มณีรัตน์', '081-234-5001', 'poster', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'),
('demo.poster11@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'ธีรศักดิ์ ใจดีบริสุทธิ์', '082-345-6002', 'poster', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'),
('demo.poster12@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'มินตรา ดิลกคุณ', '083-456-7003', 'poster', 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&q=80'),
('demo.poster13@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'กิตติพงษ์ สัจจาภรณ์', '084-567-8004', 'poster', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80'),
('demo.poster14@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'สุพรรษา เจริญพร', '085-678-9005', 'poster', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'),
('demo.poster15@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'ปวริศ อัศวรักษ์', '086-789-0006', 'poster', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80'),
('demo.poster16@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'รัตนพร เลิศสิริ', '087-890-1007', 'poster', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80'),
('demo.poster17@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'ชานนท์ สันติพงษ์', '088-901-2008', 'poster', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80'),
('demo.poster18@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'ดวงกมล รักษ์สัตว์จร', '089-012-3009', 'poster', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80'),
('demo.poster19@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'พิชญะ พรหมพิมาน', '081-345-6110', 'poster', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80'),
('demo.poster20@pethome.com', '$2a$12$XYvuMPgBpgyWMiIvuMipBewZerY2EfambxoEJ2s9JnVWtgLRnxQ.m', 'นภัสสร รุ่งเรืองพัฒนา', '082-456-7111', 'poster', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80');
