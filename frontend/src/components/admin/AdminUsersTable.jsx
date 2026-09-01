import { useState, useEffect } from 'react'
import { 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, Typography, Avatar, Box, Chip
} from '@mui/material'
import { getUsers, toggleBan } from '../../services/adminService'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const AdminUsersTable = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await getUsers()
      if (res.success) {
        setUsers(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch users', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBan = async (id, isBanned) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะ ${isBanned ? 'ปลดแบน' : 'แบน'} ผู้ใช้นี้?`)) {
      try {
        const res = await toggleBan(id)
        if (res.success) {
          setUsers(users.map(u => u.id === id ? { ...u, is_banned: res.is_banned } : u))
        }
      } catch (error) {
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาด')
      }
    }
  }

  if (loading) return <Typography>กำลังโหลด...</Typography>

  return (
    <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.50' }}>
            <TableCell>ผู้ใช้</TableCell>
            <TableCell>ติดต่อ</TableCell>
            <TableCell>บทบาท</TableCell>
            <TableCell>สถานะ</TableCell>
            <TableCell align="right">จัดการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={user.avatar_url}>{user.full_name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{user.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary">ID: {user.id}</Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{user.email}</Typography>
                <Typography variant="body2" color="text.secondary">{user.phone || '-'}</Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={user.role} 
                  size="small" 
                  color={user.role === 'admin' ? 'error' : user.role === 'poster' ? 'primary' : 'default'} 
                />
              </TableCell>
              <TableCell>
                {user.is_banned ? (
                  <Chip label="ถูกแบน" color="error" size="small" variant="outlined" />
                ) : (
                  <Chip label="ปกติ" color="success" size="small" variant="outlined" />
                )}
              </TableCell>
              <TableCell align="right">
                {user.role !== 'admin' && (
                  <Button
                    size="small"
                    variant={user.is_banned ? "contained" : "outlined"}
                    color={user.is_banned ? "success" : "error"}
                    startIcon={user.is_banned ? <CheckCircleIcon /> : <BlockIcon />}
                    onClick={() => handleToggleBan(user.id, user.is_banned)}
                  >
                    {user.is_banned ? 'ปลดแบน' : 'แบน'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AdminUsersTable
