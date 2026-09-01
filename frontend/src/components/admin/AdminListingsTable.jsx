import { useState, useEffect } from 'react'
import { 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, Typography, Chip, Box, IconButton
} from '@mui/material'
import { getAllListings } from '../../services/adminService'
import { deletePet } from '../../services/petService'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useNavigate } from 'react-router-dom'

const AdminListingsTable = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const res = await getAllListings()
      if (res.success) {
        setListings(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch listings', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบประกาศนี้? (ซ่อนประกาศจากระบบ)')) {
      try {
        const res = await deletePet(id)
        if (res.success) {
          setListings(listings.map(l => l.id === id ? { ...l, is_hidden: 1, status: 'closed' } : l))
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบประกาศ')
      }
    }
  }

  if (loading) return <Typography>กำลังโหลด...</Typography>

  return (
    <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.50' }}>
            <TableCell>ID / ชื่อ</TableCell>
            <TableCell>ประเภท</TableCell>
            <TableCell>เจ้าของ</TableCell>
            <TableCell>สถานะ</TableCell>
            <TableCell align="right">จัดการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listings.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                <Typography variant="caption" color="text.secondary">ID: {item.id} • {item.breed || 'ไม่ระบุพันธุ์'}</Typography>
              </TableCell>
              <TableCell>{item.category_name}</TableCell>
              <TableCell>
                <Typography variant="body2">{item.owner_name}</Typography>
                <Typography variant="caption" color="text.secondary">{item.owner_email}</Typography>
              </TableCell>
              <TableCell>
                {item.is_hidden ? (
                  <Chip label="ถูกลบ/ซ่อน" size="small" color="error" variant="outlined" />
                ) : (
                  <Chip 
                    label={item.status} 
                    size="small" 
                    color={
                      item.status === 'available' ? 'success' : 
                      item.status === 'pending' ? 'warning' : 'default'
                    } 
                  />
                )}
              </TableCell>
              <TableCell align="right">
                <IconButton 
                  color="info" 
                  onClick={() => navigate(`/listings/${item.id}`)}
                  title="ดูประกาศ"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton 
                  color="error" 
                  onClick={() => handleDelete(item.id)}
                  disabled={!!item.is_hidden}
                  title="ลบ/ซ่อนประกาศ"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AdminListingsTable
