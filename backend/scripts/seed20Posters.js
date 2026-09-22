const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function seed20Posters() {
  console.log('🌱 Starting to seed 20 demo poster accounts & pet listings...');

  // Hash password for all demo accounts: 'password123'
  const passwordHash = await bcrypt.hash('password123', 12);

  const demoPosters = [
    {
      email: 'demo.poster01@pethome.com',
      full_name: 'ธนภัทร ใจการุณ',
      phone: '081-112-2334',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 1, // สุนัข
        name: 'น้องมิลค์',
        breed: 'เวลช์ คอร์กี้ (Pembroke Welsh Corgi)',
        age_years: 1,
        age_months: 4,
        gender: 'male',
        size: 'medium',
        color: 'ส้ม-ขาว',
        location: 'นนทบุรี (บางใหญ่)',
        description: 'น้องมิลค์ คอร์กี้ขาสั้นก้นดุ๊กดิ๊ก นิสัยร่าเริง ขี้เล่น เข้ากับทุกคนได้ดี ขับถ่ายเป็นที่เป็นทางบนแผ่นรอง',
        health_info: 'ฉีดวัคซีนรวมครบ 3 เข็ม มีสมุดวัคซีน ถ่ายพยาธิและหยดยากันเห็บหมัดสม่ำเสมอ ทำหมันแล้ว',
        conditions: 'ขอรับผู้ที่พร้อมดูแลเรื่องอาหารและพาออกกำลังกายเบาๆ มีพื้นที่ในบ้านระบบปิด',
        image: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster02@pethome.com',
      full_name: 'พิมลดา บุญรอด',
      phone: '082-223-3445',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 2, // แมว
        name: 'น้องกะทิ',
        breed: 'แมวขาวมณี (ตาฟ้า)',
        age_years: 0,
        age_months: 8,
        gender: 'female',
        size: 'small',
        color: 'ขาวล้วน',
        location: 'กรุงเทพมหานคร (จตุจักร)',
        description: 'กะทิ แมวน้อยขนขาวปุย ตาฟ้าน้ำทะเล ขี้อ้อนมาก ชอบปีนมานอนซบตักเวลาทำงาน ใช้กระบะทรายเป็น 100%',
        health_info: 'ตรวจลิวคีเมียและเอดส์แมวแล้วผลเป็นลบ ฉีดวัคซีนไข้หัดหวัดแมวครบเรียบร้อย',
        conditions: 'เลี้ยงระบบปิดเท่านั้น มีมุ้งลวดหรือตะแกรงกันตก พร้อมอัพเดทความเป็นอยู่ช่วงแรก',
        image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster03@pethome.com',
      full_name: 'กัญญาภัค พิทักษ์สัตว์',
      phone: '083-334-4556',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 1, // สุนัข
        name: 'บราวนี่',
        breed: 'บีเกิ้ล (Beagle)',
        age_years: 2,
        age_months: 0,
        gender: 'male',
        size: 'medium',
        color: 'ไตรคัลเลอร์ (สามสี)',
        location: 'สมุทรปราการ (บางนา-ตราด)',
        description: 'บราวนี่บีเกิ้ลหูตูบ จมูกไว นิสัยเป็นมิตร ไม่ดุ ชอบวิ่งเล่นในสนามหญ้า กินเก่งมาก',
        health_info: 'สุขภาพสมบูรณ์ ฉีดวัคซีนพิษสุนัขบ้าและวัคซีนรวมประจำปีครบ ทำหมันเรียบร้อย',
        conditions: 'บ้านมีรั้วมิดชิดเพื่อป้องกันการวิ่งตามกลิ่น มีเวลาพาเดินเล่นวันละ 30 นาที',
        image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster04@pethome.com',
      full_name: 'อภิสิทธิ์ เมตตาสัตว์',
      phone: '084-445-5667',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 2, // แมว
        name: 'มะลิ',
        breed: 'แมวไทยสามสีมงคล',
        age_years: 1,
        age_months: 0,
        gender: 'female',
        size: 'medium',
        color: 'สามสี (ขาว ดำ ส้ม)',
        location: 'ปทุมธานี (รังสิต)',
        description: 'น้องมะลิ นิสัยสุภาพ เรียบร้อย ไม่ส่งเสียงร้องกวนใจ ขนสั้นดูแลง่าย ชอบนอนดูนกริมหน้าต่าง',
        health_info: 'ทำหมันแล้ว วัคซีนครบ ไร้โรคติดต่อ สุขภาพฟันสะอาด',
        conditions: 'ยินดีให้คำปรึกษาตลอดการเลี้ยงดู ขอผู้ที่รักจริงและไม่ทอดทิ้งน้อง',
        image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster05@pethome.com',
      full_name: 'ณัฐวุฒิ ปลื้มจิตต์',
      phone: '085-556-6778',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 1, // สุนัข
        name: 'ชาโคล',
        breed: 'ลาบราดอร์ รีทรีฟเวอร์ (สีดำ)',
        age_years: 2,
        age_months: 6,
        gender: 'male',
        size: 'large',
        color: 'ดำขลับ',
        location: 'ชลบุรี (ศรีราชา)',
        description: 'ชาโคล สุนัขตัวใหญ่ใจดี ฉลาดมาก รู้คำสั่งพื้นฐาน (นั่ง คอย ขอมือ หมอบ) ชอบเล่นน้ำและว่ายน้ำเป็นชีวิตจิตใจ',
        health_info: 'ตรวจข้อสะโพกปกติ วัคซีนประจำปีครบ ได้รับยากันพยาธิหนอนหัวใจทุกเดือน',
        conditions: 'บ้านมีพื้นที่บริเวณ มีรั้วรอบขอบชิด รับผิดชอบค่าวัคซีนต่อปีได้',
        image: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster06@pethome.com',
      full_name: 'ชญาภา ศรีสวัสดิ์',
      phone: '086-667-7889',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 1, // สุนัข
        name: 'โมจิ',
        breed: 'ชิบะ อินุ (Shiba Inu)',
        age_years: 1,
        age_months: 2,
        gender: 'female',
        size: 'medium',
        color: 'แดง-ขาว (Red Fawn)',
        location: 'กรุงเทพมหานคร (บางนา)',
        description: 'โมจิ หน้ายิ้ม แก้มแน่นฟู รักความสะอาด ชอบสำรวจ มีโลกส่วนตัวบ้างแต่ชอบอ้อนเวลาหิว',
        health_info: 'ตรวจสุขภาพประจำปีเรียบร้อย ไม่เป็นโรคผิวหนัง ฉีดวัคซีนครบ',
        conditions: 'มีความเข้าใจในธรรมชาติของสุนัขสายพันธุ์ชิบะ อินุ มีความใจเย็นและฝึกด้วยความรัก',
        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster07@pethome.com',
      full_name: 'วรเมธ เกียรติเมธี',
      phone: '087-778-8990',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 1, // สุนัข
        name: 'ลัคกี้',
        breed: 'ไซบีเรียน ฮัสกี้ (Siberian Husky)',
        age_years: 3,
        age_months: 0,
        gender: 'male',
        size: 'large',
        color: 'เทา-ขาว ตาสีฟ้า',
        location: 'เชียงใหม่ (หางดง)',
        description: 'ลัคกี้ ฮัสกี้ตาสองสี พลังงานล้นเหลือ อารมณ์ดี ชอบพูดชอบบ่น เข้ากับสุนัขตัวอื่นได้ง่าย ไม่ก้าวร้าว',
        health_info: 'ร่างกายแข็งแรงมาก ทำหมันเรียบร้อย ตรวจเลือดตรวจสุขภาพสม่ำเสมอ',
        conditions: 'บ้านมีแอร์หรืออากาศถ่ายเทสะดวก รั้วสูงไม่ต่ำกว่า 1.8 เมตร เพราะน้องชอบกระโดดสำรวจ',
        image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster08@pethome.com',
      full_name: 'ศศิธร พูนสวัสดิ์',
      phone: '088-889-9001',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 2, // แมว
        name: 'อั่งเปา',
        breed: 'บริติช ช็อตแฮร์ (British Shorthair)',
        age_years: 0,
        age_months: 9,
        gender: 'male',
        size: 'medium',
        color: 'บลู (สีเทา)',
        location: 'นครราชสีมา (เมือง)',
        description: 'อั่งเปา หน้ากลม แก้มฟู ขนแน่นนุ่มเหมือนตุ๊กตาหมี นิสัยสุขุม นิ่งๆ ไม่ทำลายข้าวของ รักความสงบ',
        health_info: 'ตรวจคัดกรองพันธุกรรม PKD และ HCM ปกติ ฉีดวัคซีนครบ 3 เข็ม',
        conditions: 'เลี้ยงในบ้านคอนโดหรือบ้านเดี่ยว เลี้ยงระบบปิด 100%',
        image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster09@pethome.com',
      full_name: 'ธนาคาร สุขเกษม',
      phone: '089-990-0112',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 1, // สุนัข
        name: 'นำโชค',
        breed: 'ไทยหลังอาน ผสม',
        age_years: 2,
        age_months: 0,
        gender: 'male',
        size: 'large',
        color: 'น้ำตาลแดง (แดงเม็ดมะขาม)',
        location: 'ขอนแก่น (เมือง)',
        description: 'นำโชค สุนัขไทยซื่อสัตย์ กตัญญูและรักเจ้าของสุดหัวใจ เฝ้าบ้านเก่งมาก ฉลาด ไม่เห่าพร่ำเพรื่อ',
        health_info: 'ฉีดวัคซีนพิษสุนัขบ้าประจำปีแล้ว ร่างกายกำยำ แข็งแรง ทนโรค',
        conditions: 'บ้านมีรั้วมิดชิด เลี้ยงด้วยความเมตตา ไม่ผูกล่ามตลอดเวลา',
        image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster10@pethome.com',
      full_name: 'กัญญารัตน์ มณีรัตน์',
      phone: '081-234-5001',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 2, // แมว
        name: 'ถุงเงิน',
        breed: 'สก็อตติช โฟลด์ (Scottish Fold)',
        age_years: 1,
        age_months: 6,
        gender: 'female',
        size: 'small',
        color: 'ขาว-ส้ม ลายแท็บบี้',
        location: 'กรุงเทพมหานคร (ลาดพร้าว)',
        description: 'ถุงเงิน หูพับกลมน่ารัก ตาโตแป๋ว ชอบนอนหงายท้องให้อ้อนเกาพุง เสียงร้องเบามาก เรียบร้อยน่ารัก',
        health_info: 'ทำหมันแล้ว ดูแลกระดูกและข้อต่อด้วยอาหารสูตรพิเศษ สุขภาพแข็งแรงดีเยี่ยม',
        conditions: 'พร้อมดูแลอาหารเกรดพรีเมียมและพาตรวจสุขภาพตามกำหนด',
        image: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster11@pethome.com',
      full_name: 'ธีรศักดิ์ ใจดีบริสุทธิ์',
      phone: '082-345-6002',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 3, // กระต่าย
        name: 'มิลค์กี้',
        breed: 'เนเธอร์แลนด์ ดวอฟ (Netherland Dwarf)',
        age_years: 0,
        age_months: 7,
        gender: 'female',
        size: 'small',
        color: 'ขาวปลอด ตาดำ',
        location: 'ภูเก็ต (กะทู้)',
        description: 'มิลค์กี้ ตัวจิ๋ว หูสั้น กระโดดดุ๊กดิ๊กน่ารักมาก กินหญ้าเก่ง ขับถ่ายในถาดทรายกระต่ายได้เรียบร้อย',
        health_info: 'ฟันสบปกติ ไม่ยาวเกิน ไม่เคยมีประวัติท้องอืด ถ่ายพยาธิเรียบร้อย',
        conditions: 'เลี้ยงในห้องแอร์หรือที่อากาศไม่ร้อนจัด ให้หญ้าทิโมธีเป็นอาหารหลัก',
        image: 'https://images.unsplash.com/photo-1585110396000-c9fd4e4e5030?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster12@pethome.com',
      full_name: 'มินตรา ดิลกคุณ',
      phone: '083-456-7003',
      avatar_url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 1, // สุนัข
        name: 'ท็อฟฟี่',
        breed: 'พุดเดิ้ล ทอย (Poodle Toy)',
        age_years: 3,
        age_months: 0,
        gender: 'female',
        size: 'small',
        color: 'แอปริคอต (น้ำตาลอ่อน)',
        location: 'สงขลา (หาดใหญ่)',
        description: 'ท็อฟฟี่ พุดเดิ้ลขนหยิกนุ่ม ขนไม่ร่วง ไม่ผลัดขน เหมาะกับคนเป็นภูมิแพ้ ฉลาดแสนรู้และติดเจ้าของ',
        health_info: 'ขูดหินปูนและตรวจเลือดประจำปีแล้ว วัคซีนครบถ้วน',
        conditions: 'มีเวลาแปรงขนและพาน้องไปตัดแต่งขนทุก 2 เดือน อยู่ในบ้านร่วมกับครอบครัว',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster13@pethome.com',
      full_name: 'กิตติพงษ์ สัจจาภรณ์',
      phone: '084-567-8004',
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 2, // แมว
        name: 'ข้าวปั้น',
        breed: 'เปอร์เซีย ผสม ชินชิล่า',
        age_years: 1,
        age_months: 0,
        gender: 'male',
        size: 'medium',
        color: 'ขาว-เงิน (Silver Chinchilla)',
        location: 'กรุงเทพมหานคร (ดินแดง)',
        description: 'ข้าวปั้น หน้าหวาน ขนยาวฟู ตาโตสีเขียวมรกต ใจเย็น ไม่ดุ ไม่กางเล็บใส่คน อุ้มง่าย',
        health_info: 'เช็ดตาและแปรงขนทุกวัน ฉีดวัคซีนรวมแมวเรียบร้อย ทำหมันแล้ว',
        conditions: 'ขอคนที่พร้อมแปรงขนทุกวัน เลี้ยงระบบปิดในห้องแอร์หรืออากาศเย็น',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster14@pethome.com',
      full_name: 'สุพรรษา เจริญพร',
      phone: '085-678-9005',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 1, // สุนัข
        name: 'ซูโม่',
        breed: 'เฟรนช์ บูลด็อก (French Bulldog)',
        age_years: 2,
        age_months: 0,
        gender: 'male',
        size: 'small',
        color: 'ลายเสือ (Brindle)',
        location: 'ระยอง (เมือง)',
        description: 'ซูโม่ ตัวตัน หน้าย่น ตลก ขี้เล่น ชอบนอนกรนเบาๆ เดินเตาะแตะตามตลอดเวลา เข้ากับเด็กและคนแก่ได้ดีเยี่ยม',
        health_info: 'ระบบทางเดินหายใจปกติ ผิวหนังสะอาด ไม่มีประวัติภูมิแพ้ วัคซีนครบ',
        conditions: 'ระวังเรื่องฮีทสโตรก ไม่ให้อยู่ในที่ร้อนจัด มีแอร์หรือพัดลมดูแล',
        image: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster15@pethome.com',
      full_name: 'ปวริศ อัศวรักษ์',
      phone: '086-789-0006',
      avatar_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 1, // สุนัข
        name: 'กาแฟ',
        breed: 'ชิสุ (Shih Tzu)',
        age_years: 4,
        age_months: 0,
        gender: 'male',
        size: 'small',
        color: 'ขาว-น้ำตาลช็อกโกแลต',
        location: 'พระนครศรีอยุธยา (เมือง)',
        description: 'กาแฟ ตัวเล็กน่ารัก ขี้ประจบ เจ้าของเดิมย้ายไปต่างประเทศจำเป็นต้องหาบ้านใหม่ที่อบอุ่น ขับถ่ายนอกบ้านเป็นเวลา',
        health_info: 'ทำหมันแล้ว สุขภาพแข็งแรง ไม่มีโรคประจำตัว ตรวจสุขภาพทุกปี',
        conditions: 'ขอรับผู้ที่อยู่บ้านหรือมีเวลาให้น้อง ไม่ปล่อยให้อยู่ลำพังทั้งวัน',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster16@pethome.com',
      full_name: 'รัตนพร เลิศสิริ',
      phone: '087-890-1007',
      avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 2, // แมว
        name: 'ปุยฝ้าย',
        breed: 'แมวไทย สีสวาด (โคราช)',
        age_years: 0,
        age_months: 6,
        gender: 'female',
        size: 'small',
        color: 'เทาดอกเลา (Blue/Silver)',
        location: 'กรุงเทพมหานคร (พระราม 9)',
        description: 'ปุยฝ้าย แมวโคราชโบราณ ขนสีดอกเลาเงางาม ตาเขียวเหลือง ฉลาด ขี้เล่นมาก ร่าเริงตลอดวัน',
        health_info: 'ฉีดวัคซีนไข้หัด หวัดแมว พิษสุนัขบ้าเข็มแรกแล้ว ถ่ายพยาธิเรียบร้อย',
        conditions: 'ขอผู้ที่พร้อมทำหมันเมื่อน้องอายุถึงเกณฑ์ (ประมาณ 8 เดือน) และเลี้ยงระบบปิด',
        image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster17@pethome.com',
      full_name: 'ชานนท์ สันติพงษ์',
      phone: '088-901-2008',
      avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 1, // สุนัข
        name: 'บิ๊กเบิ้ม',
        breed: 'สุนัขพันธุ์ทาง ผสมบางแก้ว',
        age_years: 1,
        age_months: 8,
        gender: 'male',
        size: 'large',
        color: 'ขาว-น้ำตาล ลายแต้มแว่นตา',
        location: 'นครปฐม (กำแพงแสน)',
        description: 'บิ๊กเบิ้ม เป็นหมาหน้าตาหล่อ ฉลาด รักบ้านและรักครอบครัวมาก ไม่ดุกับคนในบ้าน เป็นมิตรเมื่อแนะนำให้รู้จัก',
        health_info: 'ฉีดวัคซีนครบทุกปี ถ่ายพยาธิสม่ำเสมอ แข็งแรงมาก ไม่เคยป่วย',
        conditions: 'มีรั้วรอบขอบชิด มีพื้นที่วิ่งเล่น มีเวลาเล่นด้วย',
        image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster18@pethome.com',
      full_name: 'ดวงกมล รักษ์สัตว์จร',
      phone: '089-012-3009',
      avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 4, // นก
        name: 'เจ้าสัว',
        breed: 'นกคอกคาเทล (Cockatiel)',
        age_years: 1,
        age_months: 2,
        gender: 'male',
        size: 'small',
        color: 'เทา แก้มส้ม หงอนเหลือง',
        location: 'สมุทรสาคร (กระทุ่มแบน)',
        description: 'เจ้าสัว นกแก้วคอกคาเทลเชื่องมาก ผิวปากเป็นเพลงได้ เกาะไหล่เกาะมือได้ ไม่จิก ร้องทักทายตอนเช้า',
        health_info: 'ขนสมบูรณ์ ปีกสวย ตรวจสุขภาพนกจากสัตวแพทย์เฉพาะทางแล้ว',
        conditions: 'มีกรงขนาดใหญ่ ปลอดภัยจากสัตว์นักล่า เช่น แมว/หนู ให้อาหารธัญพืชและผักผลไม้สด',
        image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster19@pethome.com',
      full_name: 'พิชญะ พรหมพิมาน',
      phone: '081-345-6110',
      avatar_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 3, // กระต่าย
        name: 'พุดดิ้ง',
        breed: 'ฮอลแลนด์ ลอป (Holland Lop)',
        age_years: 1,
        age_months: 0,
        gender: 'female',
        size: 'small',
        color: 'ส้ม ทอร์ทอยส์ (Tortoise)',
        location: 'กรุงเทพมหานคร (สาทร)',
        description: 'พุดดิ้ง กระต่ายหูตกหน้ากลม นิสัยนิ่ง เรียบร้อย ชอบให้นวดหัว ขนแน่นนุ่มมาก',
        health_info: 'สุขภาพดีเยี่ยม ถ่ายพยาธิแล้ว กินหญ้าเก่ง ดื่มน้ำจากขวดได้ดี',
        conditions: 'เลี้ยงในที่ร่ม อากาศไม่ร้อน พร้อมส่งต่อกรงและอุปกรณ์บางส่วนให้ผู้รับเลี้ยง',
        image: 'https://images.unsplash.com/photo-1535241749838-299277b6305f?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      email: 'demo.poster20@pethome.com',
      full_name: 'นภัสสร รุ่งเรืองพัฒนา',
      phone: '082-456-7111',
      avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
      pet: {
        category_id: 1, // สุนัข
        name: 'มีบุญ',
        breed: 'สุนัขไทย ผสมบอร์เดอร์ คอลลี่',
        age_years: 1,
        age_months: 5,
        gender: 'female',
        size: 'medium',
        color: 'ขาว-ดำ',
        location: 'เชียงราย (เมือง)',
        description: 'มีบุญ น้องหมานิสัยอ่อนโยน ตาแป๋ว มีแววตาฉลาดมาก เข้ากับเด็กได้ดี ช่วยดูแลคนในบ้านและฝึกง่าย',
        health_info: 'ทำหมันและฉีดวัคซีนครบถ้วน ถ่ายพยาธิหัวใจทุกเดือน สุขภาพแข็งแรงมาก',
        conditions: 'ต้องการครอบครัวที่อบอุ่นและมีเวลาพาน้องออกกำลังกาย',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80'
      }
    }
  ];

  let insertedCount = 0;
  for (const poster of demoPosters) {
    // 1. ตรวจสอบหรือสร้าง User
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [poster.email]);
    let userId;
    if (existing.length > 0) {
      userId = existing[0].id;
      console.log(`ℹ️ User ${poster.email} already exists (ID: ${userId})`);
    } else {
      const [userRes] = await pool.query(
        'INSERT INTO users (email, password_hash, full_name, phone, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
        [poster.email, passwordHash, poster.full_name, poster.phone, 'poster', poster.avatar_url]
      );
      userId = userRes.insertId;
      console.log(`✅ Created User: ${poster.email} (ID: ${userId}, Name: ${poster.full_name})`);
    }

    // 2. สร้าง Pet Listing สำหรับ User นี้
    const [existingPet] = await pool.query('SELECT id FROM pet_listings WHERE user_id = ? AND name = ?', [userId, poster.pet.name]);
    if (existingPet.length === 0) {
      const p = poster.pet;
      const [petRes] = await pool.query(
        `INSERT INTO pet_listings 
          (user_id, category_id, name, breed, age_years, age_months, gender, size, color, location, description, health_info, conditions, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
        [userId, p.category_id, p.name, p.breed, p.age_years, p.age_months, p.gender, p.size, p.color, p.location, p.description, p.health_info, p.conditions]
      );
      const listingId = petRes.insertId;

      // 3. เพิ่ม Pet Image
      await pool.query(
        'INSERT INTO pet_images (listing_id, image_url, is_primary) VALUES (?, ?, 1)',
        [listingId, p.image]
      );

      console.log(`   🐾 Added Pet: "${p.name}" (${p.breed}) ID: ${listingId}`);
      insertedCount++;
    } else {
      console.log(`   🐾 Pet "${poster.pet.name}" already exists for User ID ${userId}`);
    }
  }

  console.log(`\n🎉 Successfully finished seeding! Total 20 Poster accounts active. New pets added: ${insertedCount}`);
  process.exit(0);
}

seed20Posters().catch((err) => {
  console.error('❌ Error seeding posters:', err);
  process.exit(1);
});
