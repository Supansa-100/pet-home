import { useState, useEffect } from 'react'
import { Container, Box, Typography, TextField, Button, Alert, Paper, Grid } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const ProfilePage = () => {
  const { user, setUser } = useAuth()
  const [profileData, setProfileData] = useState({ full_name: '', phone: '', avatar_url: '' })
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' })
  
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || ''
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileMessage({ type: '', text: '' })
    try {
      const res = await api.put('/auth/profile', profileData)
      if (res.data.success) {
        setProfileMessage({ type: 'success', text: 'บันทึกข้อมูลโปรไฟล์สำเร็จ' })
        setUser({ ...user, ...profileData })
      }
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.response?.data?.message || 'เกิดข้อผิดพลาด' })
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordMessage({ type: '', text: '' })

    if (passwordData.new_password !== passwordData.confirm_password) {
      return setPasswordMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' })
    }

    try {
      const res = await api.put('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      if (res.data.success) {
        setPasswordMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ' })
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'เกิดข้อผิดพลาด' })
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          จัดการโปรไฟล์
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>ข้อมูลส่วนตัว</Typography>
              {profileMessage.text && <Alert severity={profileMessage.type} sx={{ mb: 2 }}>{profileMessage.text}</Alert>}
              <Box component="form" onSubmit={handleProfileSubmit}>
                <TextField fullWidth label="อีเมล (เปลี่ยนไม่ได้)" value={user?.email || ''} margin="normal" disabled />
                <TextField fullWidth label="ระดับผู้ใช้งาน" value={user?.role || ''} margin="normal" disabled />
                <TextField fullWidth label="ชื่อ-นามสกุล" name="full_name" value={profileData.full_name} onChange={handleProfileChange} margin="normal" required />
                <TextField fullWidth label="เบอร์โทรศัพท์" name="phone" value={profileData.phone} onChange={handleProfileChange} margin="normal" />
                <TextField fullWidth label="รูปโปรไฟล์ (URL)" name="avatar_url" value={profileData.avatar_url} onChange={handleProfileChange} margin="normal" placeholder="https://..." />
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>บันทึกข้อมูล</Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>เปลี่ยนรหัสผ่าน</Typography>
              {passwordMessage.text && <Alert severity={passwordMessage.type} sx={{ mb: 2 }}>{passwordMessage.text}</Alert>}
              <Box component="form" onSubmit={handlePasswordSubmit}>
                <TextField fullWidth label="รหัสผ่านปัจจุบัน" name="current_password" type="password" value={passwordData.current_password} onChange={handlePasswordChange} margin="normal" required />
                <TextField fullWidth label="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)" name="new_password" type="password" value={passwordData.new_password} onChange={handlePasswordChange} margin="normal" required />
                <TextField fullWidth label="ยืนยันรหัสผ่านใหม่" name="confirm_password" type="password" value={passwordData.confirm_password} onChange={handlePasswordChange} margin="normal" required />
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>เปลี่ยนรหัสผ่าน</Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default ProfilePage
