import { useState } from 'react'
import { Container, Box, Typography, TextField, Button, Alert, Paper } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import BackButton from '../components/ui/BackButton'

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await api.post('/auth/login', formData)
      if (response.data.success) {
        login(response.data.token, response.data.user)
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, mb: 6 }}>
        <BackButton fallbackPath="/" label="กลับสู่หน้าหลัก" />
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
            เข้าสู่ระบบ
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="อีเมล"
              name="email"
              type="email"
              margin="normal"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="รหัสผ่าน"
              name="password"
              type="password"
              margin="normal"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.5 }}>
              เข้าสู่ระบบ
            </Button>
            <Typography align="center" sx={{ mb: 1 }}>
              <Link to="/forgot-password" style={{ color: '#FF6B35' }}>ลืมรหัสผ่าน?</Link>
            </Typography>
            <Typography align="center">
              ยังไม่มีบัญชีใช่หรือไม่? <Link to="/register" style={{ color: '#FF6B35' }}>สมัครสมาชิก</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default LoginPage
