import { useState, useEffect } from 'react'
import { 
  Box, Typography, TextField, MenuItem, Button, Paper, 
  Divider, InputAdornment
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import { getCategories, getProvinces } from '../../services/petService'

const PetFilterSidebar = ({ filters, setFilters, onSearch }) => {
  const [categories, setCategories] = useState([])
  const [provinces, setProvinces] = useState([])

  useEffect(() => {
    fetchCategories()
    fetchProvinces()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await getCategories()
      if (res.success) {
        setCategories(res.data)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchProvinces = async () => {
    try {
      const res = await getProvinces()
      if (res.success) {
        setProvinces(res.data)
      }
    } catch (err) {
      console.error('Error fetching provinces:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleClear = () => {
    setFilters({
      keyword: '',
      category: '',
      gender: '',
      size: '',
      location: '',
      sort: 'newest'
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 24 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FilterListIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          ค้นหา & ตัวกรอง
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Keyword Search */}
        <TextField
          fullWidth
          size="small"
          label="ค้นหาชื่อ, รายละเอียด"
          name="keyword"
          value={filters.keyword || ''}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Category */}
        <TextField
          select
          fullWidth
          size="small"
          label="ชนิดสัตว์เลี้ยง"
          name="category"
          value={filters.category || ''}
          onChange={handleChange}
        >
          <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
          {categories.map(cat => (
            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
          ))}
        </TextField>

        {/* Gender */}
        <TextField
          select
          fullWidth
          size="small"
          label="เพศ"
          name="gender"
          value={filters.gender || ''}
          onChange={handleChange}
        >
          <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
          <MenuItem value="male">ตัวผู้</MenuItem>
          <MenuItem value="female">ตัวเมีย</MenuItem>
          <MenuItem value="unknown">ไม่ระบุ</MenuItem>
        </TextField>

        {/* Size */}
        <TextField
          select
          fullWidth
          size="small"
          label="ขนาด"
          name="size"
          value={filters.size || ''}
          onChange={handleChange}
        >
          <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
          <MenuItem value="small">เล็ก</MenuItem>
          <MenuItem value="medium">กลาง</MenuItem>
          <MenuItem value="large">ใหญ่</MenuItem>
        </TextField>

        {/* Location */}
        <TextField
          select
          fullWidth
          size="small"
          label="จังหวัด / พื้นที่"
          name="location"
          value={filters.location || ''}
          onChange={handleChange}
        >
          <MenuItem value="">ทุกจังหวัด</MenuItem>
          {provinces.map((province) => (
            <MenuItem key={province.id} value={province.name}>
              {province.name}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button 
            fullWidth 
            variant="outlined" 
            color="inherit" 
            startIcon={<ClearIcon />}
            onClick={handleClear}
          >
            ล้าง
          </Button>
          <Button 
            fullWidth 
            type="submit"
            variant="contained" 
            color="primary"
          >
            ค้นหา
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default PetFilterSidebar
