import { useState } from 'react'
import { Container, Box, Typography, TextField, Button, Alert, Paper, CircularProgress } from '@mui/material'
import { Link } from 'react-router-dom'
import api from '../services/api'
import BackButton from '../components/ui/BackButton'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await api.post('/auth/forgot-password', { email })
      if (response.data.success) {
        setMessage(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, mb: 8 }}>
        <BackButton fallbackPath="/login" label="กลับไปหน้าเข้าสู่ระบบ" />
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
            ลืมรหัสผ่าน
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            กรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="อีเมล"
              name="email"
              type="email"
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'กำลังส่ง...' : 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}
            </Button>
            <Typography align="center">
              จำรหัสผ่านได้แล้ว? <Link to="/login" style={{ color: '#FF6B35' }}>เข้าสู่ระบบ</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default ForgotPasswordPage
