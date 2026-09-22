import { useState, useEffect, useCallback } from 'react'
import { Container, Typography, Box, Pagination, Grid, FormControl, Select, MenuItem } from '@mui/material'
import PetGrid from '../components/pet/PetGrid'
import PetFilterSidebar from '../components/pet/PetFilterSidebar'
import EmptyState from '../components/ui/EmptyState'
import BackButton from '../components/ui/BackButton'
import { getPets } from '../services/petService'

const ListingsPage = () => {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    gender: '',
    size: '',
    location: '',
    sort: 'newest'
  })

  // สร้างฟังก์ชัน fetch เพื่อให้เรียกใช้ได้ทั้งจาก useEffect และเมื่อกดค้นหา
  const fetchPets = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = { 
        page, 
        limit: 12, 
        status: 'available',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      }
      
      const res = await getPets(queryParams)
      if (res.success) {
        setPets(res.data)
        setTotalPages(res.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchPets()
  }, [page]) // ถอด filters ออกจาก dependency เพื่อไม่ให้มันเสิร์ชทันทีที่พิมพ์ ให้รอกดปุ่ม

  const handleSearch = () => {
    if (page !== 1) {
      setPage(1) // ถ้าอยู่หน้าอื่น ให้กลับไปหน้าแรก (useEffect จะ trigger fetchPets เอง)
    } else {
      fetchPets() // ถ้าอยู่หน้าแรกอยู่แล้ว ให้ fetch ใหม่ได้เลย
    }
  }

  // หากมีการ Clear filters หรือเปลี่ยน Sort ให้ดึงข้อมูลใหม่
  useEffect(() => {
    const isFiltersEmpty = Object.values(filters).every(x => x === '' || x === 'newest')
    if (isFiltersEmpty) {
      handleSearch()
    }
  }, [filters])

  // Trigger search when sort changes
  useEffect(() => {
    handleSearch()
  }, [filters.sort])

  const handlePageChange = (event, value) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <BackButton fallbackPath="/" label="กลับสู่หน้าหลัก" />
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          หาบ้านให้สัตว์เลี้ยง
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ดูรายการสัตว์เลี้ยงที่กำลังรอคอยบ้านใหม่ที่อบอุ่น
        </Typography>
      </Box>

      {/* Layout แยก Sidebar และ Content */}
      <Grid container spacing={4}>
        {/* Sidebar ฝั่งซ้าย */}
        <Grid item xs={12} md={3}>
          <PetFilterSidebar 
            filters={filters} 
            setFilters={setFilters} 
            onSearch={handleSearch} 
          />
        </Grid>

        {/* Content ฝั่งขวา */}
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">สัตว์เลี้ยงที่รอคุณอยู่</Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filters.sort || 'newest'}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
              >
                <MenuItem value="newest">ใหม่ล่าสุด</MenuItem>
                <MenuItem value="oldest">เก่าที่สุด</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <PetGrid pets={pets} loading={loading} />

          {totalPages > 1 && (
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
              />
            </Box>
          )}
          {!loading && pets.length === 0 && (
            <EmptyState 
              icon="search"
              title="ไม่พบสัตว์เลี้ยง" 
              description="ลองเปลี่ยนเงื่อนไขการค้นหาดูอีกครั้ง หรือล้างตัวกรองทั้งหมด"
            />
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export default ListingsPage
