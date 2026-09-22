import { useState } from 'react'
import { Container, Box, Typography, TextField, Button, Alert, Paper } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import BackButton from '../components/ui/BackButton'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      return setError('รหัสผ่านไม่ตรงกัน')
    }

    try {
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone
      })

      if (response.data.success) {
        setSuccess('สมัครสมาชิกสำเร็จ! กำลังพาไปหน้าเข้าสู่ระบบ...')
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, mb: 8 }}>
        <BackButton fallbackPath="/" label="กลับสู่หน้าหลัก" />
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
            สมัครสมาชิก
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="ชื่อ-นามสกุล" name="full_name" margin="normal" required
              value={formData.full_name} onChange={handleChange}
            />
            <TextField
              fullWidth label="อีเมล" name="email" type="email" margin="normal" required
              value={formData.email} onChange={handleChange}
            />
            <TextField
              fullWidth label="เบอร์โทรศัพท์ (ถ้ามี)" name="phone" margin="normal"
              value={formData.phone} onChange={handleChange}
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              บัญชีเดียวใช้ได้ทั้งลงประกาศหาบ้านให้สัตว์เลี้ยง และส่งคำขอรับอุปการะ
            </Alert>
            <TextField
              fullWidth label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)" name="password" type="password" margin="normal" required
              value={formData.password} onChange={handleChange}
            />
            <TextField
              fullWidth label="ยืนยันรหัสผ่าน" name="confirmPassword" type="password" margin="normal" required
              value={formData.confirmPassword} onChange={handleChange}
            />
            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.5 }}>
              ลงทะเบียน
            </Button>
            <Typography align="center">
              มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color: '#FF6B35' }}>เข้าสู่ระบบ</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default RegisterPage
