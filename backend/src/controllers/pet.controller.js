const { pool } = require('../config/db')

// 1. ดึงรายการสัตว์เลี้ยงพร้อม Filter
exports.getPets = async (req, res, next) => {
  try {
    const { keyword, category, breed, location, status, gender, size, sort = 'newest', page = 1, limit = 12 } = req.query
    const offset = (page - 1) * limit
    
    let query = `
      SELECT p.*, c.name as category_name,
             (SELECT image_url FROM pet_images WHERE listing_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
             u.full_name as owner_name, u.avatar_url as owner_avatar
      FROM pet_listings p
      LEFT JOIN pet_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.is_hidden = 0
    `
    const params = []

    if (category) {
      query += ` AND p.category_id = ?`
      params.push(category)
    }
    if (breed) {
      query += ` AND p.breed LIKE ?`
      params.push(`%${breed}%`)
    }
    if (location) {
      query += ` AND p.location LIKE ?`
      params.push(`%${location}%`)
    }
    if (keyword) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`
      params.push(`%${keyword}%`, `%${keyword}%`)
    }
    if (gender) {
      query += ` AND p.gender = ?`
      params.push(gender)
    }
    if (size) {
      query += ` AND p.size = ?`
      params.push(size)
    }
    
    // ค่าเริ่มต้นแสดงเฉพาะ Available ถ้าไม่ได้ขอพิเศษ
    if (status) {
      query += ` AND p.status = ?`
      params.push(status)
    } else {
      query += ` AND p.status = 'available'`
    }

    if (sort === 'oldest') {
      query += ` ORDER BY p.created_at ASC LIMIT ? OFFSET ?`
    } else {
      query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    }
    params.push(parseInt(limit), parseInt(offset))

    const [pets] = await pool.query(query, params)

    // นับจำนวนทั้งหมดสำหรับการทำ Pagination
    let countQuery = `SELECT COUNT(*) as total FROM pet_listings p WHERE p.is_hidden = 0`
    const countParams = []
    if (category) { countQuery += ` AND p.category_id = ?`; countParams.push(category) }
    if (breed) { countQuery += ` AND p.breed LIKE ?`; countParams.push(`%${breed}%`) }
    if (location) { countQuery += ` AND p.location LIKE ?`; countParams.push(`%${location}%`) }
    if (keyword) { 
      countQuery += ` AND (p.name LIKE ? OR p.description LIKE ?)`
      countParams.push(`%${keyword}%`, `%${keyword}%`) 
    }
    if (gender) { countQuery += ` AND p.gender = ?`; countParams.push(gender) }
    if (size) { countQuery += ` AND p.size = ?`; countParams.push(size) }
    if (status) { countQuery += ` AND p.status = ?`; countParams.push(status) } 
    else { countQuery += ` AND p.status = 'available'` }

    const [[{ total }]] = await pool.query(countQuery, countParams)

    res.json({
      success: true,
      data: pets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

// 2. ดึงรายละเอียดสัตว์เลี้ยง 1 ตัว
exports.getPetById = async (req, res, next) => {
  try {
    const { id } = req.params

    const [pets] = await pool.query(`
      SELECT p.*, c.name as category_name, u.full_name as owner_name, u.avatar_url as owner_avatar, u.phone as owner_phone
      FROM pet_listings p
      LEFT JOIN pet_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id])

    if (pets.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลสัตว์เลี้ยง' })
    }

    const pet = pets[0]

    // ดึงรูปภาพทั้งหมดของสัตว์เลี้ยงตัวนี้
    const [images] = await pool.query('SELECT * FROM pet_images WHERE listing_id = ? ORDER BY is_primary DESC', [id])
    pet.images = images

    res.json({ success: true, data: pet })
  } catch (error) {
    next(error)
  }
}

// 3. สร้างประกาศใหม่
exports.createPet = async (req, res, next) => {
  const connection = await pool.getConnection()
  try {
    const { category_id, name, breed, age_years, age_months, gender, size, color, description, health_info, conditions, location } = req.body
    
    if (!category_id || !name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชนิดสัตว์เลี้ยงและชื่อ' })
    }

    await connection.beginTransaction()

    // 1. Insert ลงตาราง pet_listings
    const [insertResult] = await connection.query(`
      INSERT INTO pet_listings 
      (user_id, category_id, name, breed, age_years, age_months, gender, size, color, description, health_info, conditions, location) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, category_id, name, breed || null, age_years || 0, age_months || 0, gender || 'unknown', size || 'medium', color || null, description || null, health_info || null, conditions || null, location || null])

    const listingId = insertResult.insertId

    // 2. ถ้ามีการอัปโหลดไฟล์ ให้ Insert ลง pet_images
    if (req.files && req.files.length > 0) {
      const imageValues = req.files.map((file, index) => {
        const imageUrl = file.filename ? `/uploads/${file.filename}` : file.path;
        return [
          listingId,
          imageUrl, // Local or Cloudinary URL
          index === 0 ? 1 : 0 // รุปแรกให้เป็นรูปหลัก (primary)
        ]
      })

      await connection.query('INSERT INTO pet_images (listing_id, image_url, is_primary) VALUES ?', [imageValues])
    }

    await connection.commit()

    res.status(201).json({
      success: true,
      message: 'สร้างประกาศหาบ้านสำเร็จ',
      listing_id: listingId
    })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally {
    connection.release()
  }
}

// 4. แก้ไขข้อมูลประกาศ
exports.updatePet = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, breed, age_years, age_months, gender, size, color, description, health_info, conditions, location, deleted_images } = req.body

    // ตรวจสอบสิทธิ์ (ต้องเป็นเจ้าของโพสต์ หรือ Admin)
    const [pets] = await pool.query('SELECT user_id FROM pet_listings WHERE id = ?', [id])
    if (pets.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบประกาศ' })
    
    if (pets[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์แก้ไขประกาศนี้' })
    }

    await pool.query(`
      UPDATE pet_listings 
      SET name = COALESCE(?, name),
          breed = COALESCE(?, breed),
          age_years = COALESCE(?, age_years),
          age_months = COALESCE(?, age_months),
          gender = COALESCE(?, gender),
          size = COALESCE(?, size),
          color = COALESCE(?, color),
          description = COALESCE(?, description),
          health_info = COALESCE(?, health_info),
          conditions = COALESCE(?, conditions),
          location = COALESCE(?, location)
      WHERE id = ?
    `, [name, breed, age_years, age_months, gender, size, color, description, health_info, conditions, location, id])

    // ถ้ามีการอัปโหลดไฟล์เพิ่ม ให้ Insert ลง pet_images
    if (req.files && req.files.length > 0) {
      // เช็คว่ามีรูปเดิมอยู่ไหม
      const [existingImages] = await pool.query('SELECT COUNT(*) as count FROM pet_images WHERE listing_id = ?', [id])
      const hasImages = existingImages[0].count > 0

      const imageValues = req.files.map((file, index) => {
        const imageUrl = file.filename ? `/uploads/${file.filename}` : file.path;
        return [
          id,
          imageUrl, // Local or Cloudinary URL
          (!hasImages && index === 0) ? 1 : 0 // รุปแรกให้เป็นรูปหลัก ถ้ารูปเดิมไม่มีเลย
        ]
      })

      await pool.query('INSERT INTO pet_images (listing_id, image_url, is_primary) VALUES ?', [imageValues])
    }

    // ลบรูปภาพที่ถูกเลือกให้ลบ (ถ้ามี)
    if (deleted_images) {
      const deletedImageIds = Array.isArray(deleted_images) ? deleted_images : [deleted_images];
      if (deletedImageIds.length > 0) {
        await pool.query('DELETE FROM pet_images WHERE id IN (?) AND listing_id = ?', [deletedImageIds, id])
      }
    }

    // อัปเดตรูป primary เผื่อรูปแรกถูกลบไป
    const [checkPrimary] = await pool.query('SELECT id FROM pet_images WHERE listing_id = ? AND is_primary = 1', [id])
    if (checkPrimary.length === 0) {
      // ถ้ารูปหลักหายไป ให้สุ่มเอารูปแรกที่เหลืออยู่ตั้งเป็น primary
      await pool.query('UPDATE pet_images SET is_primary = 1 WHERE listing_id = ? LIMIT 1', [id])
    }

    res.json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ' })
  } catch (error) {
    next(error)
  }
}

// 5. อัปเดตสถานะประกาศ (Available, Pending, Adopted, Closed)
exports.updatePetStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['available', 'pending', 'adopted', 'closed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง' })
    }

    const [pets] = await pool.query('SELECT user_id FROM pet_listings WHERE id = ?', [id])
    if (pets.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบประกาศ' })
    
    if (pets[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์จัดการประกาศนี้' })
    }

    await pool.query('UPDATE pet_listings SET status = ? WHERE id = ?', [status, id])

    res.json({ success: true, message: 'อัปเดตสถานะสำเร็จ' })
  } catch (error) {
    next(error)
  }
}

// 6. ลบประกาศ (Soft Delete โดยซ่อนไว้)
exports.deletePet = async (req, res, next) => {
  try {
    const { id } = req.params

    const [pets] = await pool.query('SELECT user_id FROM pet_listings WHERE id = ?', [id])
    if (pets.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบประกาศ' })
    
    if (pets[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์จัดการประกาศนี้' })
    }

    // Soft delete: set is_hidden = 1, status = 'closed'
    await pool.query('UPDATE pet_listings SET is_hidden = 1, status = ? WHERE id = ?', ['closed', id])

    res.json({ success: true, message: 'ลบประกาศสำเร็จ' })
  } catch (error) {
    next(error)
  }
}

// 7. ดึงประกาศของตัวเอง
exports.getMyPets = async (req, res, next) => {
  try {
    const [pets] = await pool.query(`
      SELECT p.*, c.name as category_name,
             (SELECT image_url FROM pet_images WHERE listing_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM pet_listings p
      LEFT JOIN pet_categories c ON p.category_id = c.id
      WHERE p.user_id = ? AND p.is_hidden = 0
      ORDER BY p.created_at DESC
    `, [req.user.id])
    
    res.json({ success: true, data: pets })
  } catch (error) {
    next(error)
  }
}
