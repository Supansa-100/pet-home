// 404 Not Found handler
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `ไม่พบ route: ${req.method} ${req.originalUrl}`,
  })
}

module.exports = notFound
