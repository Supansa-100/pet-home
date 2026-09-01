// rolesMiddleware
// อนุญาตให้ผ่านถ้า user มี role ตรงกับที่ระบุใน roles array
const checkRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลส่วนนี้',
      })
    }
    next()
  }
}

module.exports = checkRoles
