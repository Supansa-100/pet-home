import { useState, useEffect } from 'react'
import { Container, Typography, Box, Button, Grid, Paper, Stack } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom'
import PetsIcon from '@mui/icons-material/Pets'
import ListAltIcon from '@mui/icons-material/ListAlt'
import StarIcon from '@mui/icons-material/Star'
import PetGrid from '../components/pet/PetGrid'
import { getPets } from '../services/petService'

const HomePage = () => {
  const navigate = useNavigate()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestPets = async () => {
      try {
        const res = await getPets({ limit: 4, status: 'available' })
        if (res.success) {
          setPets(res.data)
        }
      } catch (error) {
        console.error('Error fetching pets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestPets()
  }, [])

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8, flexGrow: 1 }}>
        {/* Hero Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 6 }}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              height: { xs: 300, md: 450 },
              width: '100%',
              boxShadow: '0 10px 30px rgba(79, 209, 197, 0.15)',
            }}
          >
            <Box
              component="img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkDGVO8ndvq2vvPiJzdZKvmmBZHZ7asIdP2kn1YlBpzQBsU-cpMW3MbH6GsbhE4qX2JQ2QILcvK0H4obDrq90k5j82lAew9kvroGYXtHRg61fs0zf_vIJi4oxv-D4Za1YIOkliD6PsjeeJ5dVQ0BZnPWRNEXbqR-McGbiRSqzg0dTd4yIhtPLt0ANaFnOUM3YC1_nNwM2tUaEjwLmGiyw7UaNqnoyXRT2mee32Pjsp5icCxWOr2m3lLZhpADfUIBHaALHWJ__H9lQZ"
              alt="Golden retriever puppy and fluffy orange kitten"
              sx={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                position: 'absolute',
                inset: 0,
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                zIndex: 10,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                p: { xs: 3, md: 5 },
                zIndex: 20,
                color: 'white',
              }}
            >
              <Typography variant="h3" component="h1" fontWeight={700} sx={{ mb: 1, fontSize: { xs: '2rem', md: '3rem' } }}>
                ตามหาเพื่อนซี้คนใหม่ของคุณ
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { md: '1.2rem' } }}>
                เชื่อมต่อเจ้าของที่เปี่ยมด้วยความเมตตากับบ้านที่แสนอบอุ่น
              </Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={() => navigate('/listings')}
              sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
            >
              หาบ้านให้น้อง
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              size="large"
              onClick={() => navigate('/listings/create')}
              sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2, borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}
            >
              ลงประกาศหาบ้าน
            </Button>
          </Stack>
        </Box>

        {/* Success Metrics */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.default', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <PetsIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" color="primary" fontWeight={700}>1,000+</Typography>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>สัตว์เลี้ยงที่ได้บ้านแล้ว</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.default', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <ListAltIcon color="secondary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" color="primary" fontWeight={700}>500+</Typography>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>ประกาศที่กำลังเปิดอยู่</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.default', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <StarIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" color="primary" fontWeight={700}>4.9/5</Typography>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>คะแนนจากผู้ใช้</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* New Arrivals Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" color="primary" fontWeight={700} sx={{ mb: 4 }}>
            เพื่อนตัวน้อยมาใหม่
          </Typography>
          
          <PetGrid pets={pets} loading={loading} />
          
          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Button variant="outlined" color="primary" size="large" onClick={() => navigate('/listings')} sx={{ px: 6, borderRadius: 8 }}>
              ดูทั้งหมด
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.default', py: 6, borderTop: '1px solid', borderColor: 'divider', mt: 'auto', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" color="primary" fontWeight={800} gutterBottom>
            PET-HOME
          </Typography>
          <Stack direction="column" spacing={1} sx={{ mb: 4 }}>
            <Link to="/listings" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body1" sx={{ '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }}>หาน้องๆ ไปเลี้ยง</Typography>
            </Link>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body1" sx={{ '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }}>เรื่องราวความสำเร็จ</Typography>
            </Link>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body1" sx={{ '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }}>เกี่ยวกับเรา</Typography>
            </Link>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body1" sx={{ '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }}>ติดต่อเรา</Typography>
            </Link>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            © 2024 PET-HOME. สงวนลิขสิทธิ์.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage
