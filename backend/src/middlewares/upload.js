const multer = require('multer')

// ใช้ MemoryStorage เพื่อดึง buffer มาแปลงเป็น Base64 ได้ทันที
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WEBP are allowed.'), false)
  }
}

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
})

module.exports = upload
