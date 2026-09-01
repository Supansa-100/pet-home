import { useState, useEffect } from 'react'
import { Box, TextField, Button, Grid, MenuItem, Typography, Paper, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ImageUploader from './ImageUploader'
import { createPet, updatePet, getCategories } from '../../services/petService'
import { useToast } from '../../contexts/ToastContext'

const PetForm = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate()
  const showToast = useToast()
  const [categories, setCategories] = useState([])
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [deletedImages, setDeletedImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    breed: '',
    age_years: 0,
    age_months: 0,
    gender: 'unknown',
    size: 'medium',
    color: '',
    description: '',
    health_info: '',
    conditions: '',
    location: ''
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories()
        if (res.success) {
          setCategories(res.data)
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }
    fetchCategories()

    if (initialData) {
      setFormData({
        category_id: initialData.category_id || '',
        name: initialData.name || '',
        breed: initialData.breed || '',
        age_years: initialData.age_years || 0,
        age_months: initialData.age_months || 0,
        gender: initialData.gender || 'unknown',
        size: initialData.size || 'medium',
        color: initialData.color || '',
        description: initialData.description || '',
        health_info: initialData.health_info || '',
        conditions: initialData.conditions || '',
        location: initialData.location || ''
      })
      if (initialData.images && Array.isArray(initialData.images)) {
        setExistingImages(initialData.images)
      }
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key])
      })
      
      images.forEach(image => {
        data.append('images', image)
      })

      deletedImages.forEach(id => {
        data.append('deleted_images', id)
      })

      if (isEdit) {
        await updatePet(initialData.id, data)
        showToast('อัปเดตข้อมูลสำเร็จ')
        navigate(`/listings/${initialData.id}`)
      } else {
        const res = await createPet(data)
        if (res.success) {
          showToast('ลงประกาศสำเร็จ')
          navigate(`/listings/${res.listing_id}`)
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
      showToast('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h1" fontWeight={600} gutterBottom sx={{ mb: 4 }}>
        {isEdit ? 'แก้ไขประกาศ' : 'สร้างประกาศหาบ้าน'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          {isEdit && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              คุณสามารถอัปโหลดรูปภาพใหม่เพิ่มเติมได้ หรือลบรูปลบเดิมได้
            </Typography>
          )}
          <ImageUploader 
            images={images} 
            setImages={setImages}
            existingImages={existingImages}
            onRemoveExisting={(id) => {
              setExistingImages(prev => prev.filter(img => img.id !== id))
              setDeletedImages(prev => [...prev, id])
            }}
            maxImages={5} 
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              select
              label="ชนิดสัตว์เลี้ยง"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="ชื่อสัตว์เลี้ยง"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="สายพันธุ์"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="สี"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              type="number"
              label="อายุ (ปี)"
              name="age_years"
              value={formData.age_years}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              type="number"
              label="อายุ (เดือน)"
              name="age_months"
              value={formData.age_months}
              onChange={handleChange}
              inputProps={{ min: 0, max: 11 }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="เพศ"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <MenuItem value="male">ตัวผู้</MenuItem>
              <MenuItem value="female">ตัวเมีย</MenuItem>
              <MenuItem value="unknown">ไม่ระบุ</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="ขนาด"
              name="size"
              value={formData.size}
              onChange={handleChange}
            >
              <MenuItem value="small">เล็ก</MenuItem>
              <MenuItem value="medium">กลาง</MenuItem>
              <MenuItem value="large">ใหญ่</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="จังหวัด / พื้นที่"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="เช่น กรุงเทพฯ, เชียงใหม่"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="รายละเอียด / นิสัย"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="ข้อมูลสุขภาพ / ประวัติวัคซีน"
              name="health_info"
              value={formData.health_info}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="เงื่อนไขการรับเลี้ยง"
              name="conditions"
              value={formData.conditions}
              onChange={handleChange}
              placeholder="เช่น ต้องเลี้ยงระบบปิด, ต้องส่งอัปเดตทุกเดือน"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
            ยกเลิก
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !formData.category_id || !formData.name}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {isEdit ? 'บันทึกการแก้ไข' : 'ลงประกาศ'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default PetForm
