import { useState } from 'react'
import { Container, Box, Typography, TextField, Button, Alert, Paper, CircularProgress } from '@mui/material'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import BackButton from '../components/ui/BackButton'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      return setError('รหัสผ่านไม่ตรงกัน')
    }
    if (password.length < 8) {
      return setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/reset-password', { token, new_password: password })
      if (response.data.success) {
        setSuccess(response.data.message)
        setTimeout(() => navigate('/login'), 2500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  // เข้ามาหน้านี้โดยไม่มี token แปลว่าไม่ได้มาจากลิงก์ในอีเมล
  if (!token) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 5, mb: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              ไม่พบรหัสยืนยันในลิงก์ กรุณาเปิดลิงก์จากอีเมลที่ระบบส่งให้อีกครั้ง
            </Alert>
            <Button fullWidth variant="contained" component={Link} to="/forgot-password">
              ขอลิงก์ใหม่
            </Button>
          </Paper>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, mb: 8 }}>
        <BackButton fallbackPath="/login" label="กลับไปหน้าเข้าสู่ระบบ" />
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
            ตั้งรหัสผ่านใหม่
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
              type="password"
              margin="normal"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || Boolean(success)}
            />
            <TextField
              fullWidth
              label="ยืนยันรหัสผ่านใหม่"
              type="password"
              margin="normal"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || Boolean(success)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading || Boolean(success)}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default ResetPasswordPage
