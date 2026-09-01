import { useState, useEffect } from 'react'
import { 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, Typography, IconButton, TextField, Box
} from '@mui/material'
import { getCategories } from '../../services/petService'
import { createCategory, updateCategory, deleteCategory } from '../../services/adminService'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

const AdminCategoriesTable = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State for creating new
  const [newName, setNewName] = useState('')
  
  // State for editing
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await getCategories()
      if (res.success) {
        setCategories(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    
    try {
      const res = await createCategory(newName)
      if (res.success) {
        setNewName('')
        fetchCategories()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
  }

  const handleUpdate = async (id) => {
    if (!editName.trim()) return
    
    try {
      const res = await updateCategory(id, editName)
      if (res.success) {
        setEditId(null)
        fetchCategories()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?')) {
      try {
        const res = await deleteCategory(id)
        if (res.success) {
          fetchCategories()
        }
      } catch (error) {
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาด ไม่สามารถลบได้')
      }
    }
  }

  if (loading) return <Typography>กำลังโหลด...</Typography>

  return (
    <Box>
      {/* Create New Category Form */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เพิ่มหมวดหมู่ใหม่</Typography>
        <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="ชื่อหมวดหมู่ เช่น นก, ปลา"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={!newName.trim()}>
            เพิ่ม
          </Button>
        </Box>
      </Paper>

      {/* Categories Table */}
      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell width={80}>ID</TableCell>
              <TableCell>ชื่อหมวดหมู่</TableCell>
              <TableCell align="right">จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.id}</TableCell>
                <TableCell>
                  {editId === cat.id ? (
                    <TextField 
                      size="small" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      autoFocus
                    />
                  ) : (
                    cat.name
                  )}
                </TableCell>
                <TableCell align="right">
                  {editId === cat.id ? (
                    <>
                      <IconButton color="success" onClick={() => handleUpdate(cat.id)}>
                        <SaveIcon />
                      </IconButton>
                      <IconButton color="default" onClick={() => setEditId(null)}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton color="primary" onClick={() => { setEditId(cat.id); setEditName(cat.name); }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(cat.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">ไม่มีข้อมูลหมวดหมู่</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default AdminCategoriesTable
