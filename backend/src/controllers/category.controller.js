const { pool } = require('../config/db')

exports.getCategories = async (req, res, next) => {
  try {
    const [categories] = await pool.query('SELECT * FROM pet_categories ORDER BY id ASC')
    res.json({ success: true, data: categories })
  } catch (error) {
    next(error)
  }
}

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อหมวดหมู่' })
    
    const [result] = await pool.query('INSERT INTO pet_categories (name) VALUES (?)', [name])
    res.status(201).json({ success: true, message: 'สร้างหมวดหมู่สำเร็จ', id: result.insertId })
  } catch (error) {
    next(error)
  }
}

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อหมวดหมู่' })

    await pool.query('UPDATE pet_categories SET name = ? WHERE id = ?', [name, id])
    res.json({ success: true, message: 'อัปเดตหมวดหมู่สำเร็จ' })
  } catch (error) {
    next(error)
  }
}

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    // เช็คก่อนว่ามีสัตว์เลี้ยงใช้หมวดหมู่นี้อยู่ไหม
    const [pets] = await pool.query('SELECT COUNT(*) as count FROM pet_listings WHERE category_id = ?', [id])
    if (pets[0].count > 0) {
      return res.status(400).json({ success: false, message: 'ไม่สามารถลบได้ เนื่องจากมีประกาศในหมวดหมู่นี้' })
    }

    await pool.query('DELETE FROM pet_categories WHERE id = ?', [id])
    res.json({ success: true, message: 'ลบหมวดหมู่สำเร็จ' })
  } catch (error) {
    next(error)
  }
}
