const multer = require('multer')
const fs = require('fs')
const path = require('path')
const config = require('../config/env')

let storage;

// ตรวจสอบว่ามีการตั้งค่า Cloudinary หรือไม่
if (
  config.cloudinary && 
  config.cloudinary.cloudName && 
  config.cloudinary.cloudName !== 'your_cloud_name'
) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary')
  const cloudinary = require('cloudinary').v2
  
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  })

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'pethome_pets',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
  })
  console.log('Using Cloudinary for uploads')
} else {
  // Local storage fallback
  const uploadDir = path.join(__dirname, '../../uploads')
  if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  })
  console.log('Using Local Disk Storage for uploads')
}

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

module.exports = upload
