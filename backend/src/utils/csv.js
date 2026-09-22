// แปลงข้อมูลเป็นไฟล์ CSV สำหรับให้ Admin ดาวน์โหลดไปวิเคราะห์ต่อ

// ครอบค่าด้วยเครื่องหมายคำพูดเมื่อมีอักขระที่ทำให้คอลัมน์เพี้ยน
const escapeCell = (value) => {
  if (value === null || value === undefined) return ''

  const text = value instanceof Date
    ? value.toISOString().slice(0, 19).replace('T', ' ')
    : String(value)

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/**
 * สร้างสตริง CSV จากรายการข้อมูล
 * @param {Array<{key: string, label: string}>} columns - คอลัมน์ที่ต้องการ พร้อมหัวตารางภาษาไทย
 * @param {Array<Object>} rows - ข้อมูลแต่ละแถว
 */
function toCSV(columns, rows) {
  const header = columns.map((column) => escapeCell(column.label)).join(',')
  const body = rows.map((row) =>
    columns.map((column) => escapeCell(row[column.key])).join(',')
  )
  return [header, ...body].join('\r\n')
}

/**
 * ส่งไฟล์ CSV กลับไปให้เบราว์เซอร์ดาวน์โหลด
 * ใส่ BOM (﻿) นำหน้าเสมอ ไม่งั้น Excel บน Windows จะอ่านภาษาไทยเป็นอักษรต่างดาว
 */
function sendCSV(res, filename, columns, rows) {
  const csv = '﻿' + toCSV(columns, rows)

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send(csv)
}

module.exports = { toCSV, sendCSV }
