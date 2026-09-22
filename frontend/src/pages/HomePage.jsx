import { useState, useEffect } from 'react'
import { Container, Typography, Box, Button, Grid, Paper, Stack } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom'
import PetsIcon from '@mui/icons-material/Pets'
import ListAltIcon from '@mui/icons-material/ListAlt'
import StarIcon from '@mui/icons-material/Star'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SecurityIcon from '@mui/icons-material/Security'
import ForumIcon from '@mui/icons-material/Forum'
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
    <Box sx={{ width: '100%', overflowX: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      
      {/* ─── Hero Section (Inspired by Mockup) ──────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          background: 'linear-gradient(180deg, #d8e9f5 0%, #b8d7ea 55%, #a4cde5 100%)',
          pt: { xs: 3, sm: 4, md: 5 },
          pb: 0,
          overflow: 'hidden',
          '@keyframes floatBubble': {
            '0%': { transform: 'translateX(-50%) translateY(0)' },
            '50%': { transform: 'translateX(-50%) translateY(-7px)' },
            '100%': { transform: 'translateX(-50%) translateY(0)' }
          }
        }}
      >
        {/* Subtle Watermark Word behind title */}
        <Typography
          sx={{
            position: 'absolute',
            top: { xs: '2%', sm: '2.5%', md: '3%' },
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: { xs: '3.5rem', sm: '5.5rem', md: '7.5rem', lg: '8.5rem' },
            fontWeight: 900,
            color: 'rgba(255, 255, 255, 0.45)',
            letterSpacing: '0.06em',
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 1,
            whiteSpace: 'nowrap'
          }}
        >
          Happiness
        </Typography>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {/* Main Hero Header */}
          <Box sx={{ maxWidth: 800, mx: 'auto', mb: { xs: 1, md: 1.5 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.2rem', sm: '3.2rem', md: '3.8rem' },
                color: '#1a2332',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                mb: 0.8
              }}
            >
              Happiness
            </Typography>
            
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.2rem', sm: '1.6rem', md: '1.9rem' },
                color: '#243447',
                letterSpacing: '-0.01em',
                mb: 1.2
              }}
            >
              is having a pet as a friend.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.92rem', sm: '1rem', md: '1.08rem' },
                color: '#3d5267',
                maxWidth: 620,
                mx: 'auto',
                lineHeight: 1.5,
                mb: 2.2
              }}
            >
              ความสุขที่แท้จริงคือการมีเพื่อนซี้สี่ขาเคียงข้างคุณ ร่วมมอบบ้านที่อบอุ่นและความรักให้สัตว์เลี้ยงที่รอคอย
            </Typography>

            {/* Pill-shaped CTA Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/listings')}
                sx={{
                  borderRadius: '50px',
                  px: { xs: 4, sm: 5 },
                  py: 1.4,
                  fontSize: '1.05rem',
                  fontWeight: 'bold',
                  bgcolor: '#1a2332',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(26, 35, 50, 0.3)',
                  '&:hover': {
                    bgcolor: '#0d131d',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(26, 35, 50, 0.4)'
                  },
                  transition: 'all 0.25s ease'
                }}
              >
                หาบ้านให้สัตว์เลี้ยง
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/listings/create')}
                sx={{
                  borderRadius: '50px',
                  px: { xs: 3.5, sm: 4.5 },
                  py: 1.4,
                  fontSize: '1.05rem',
                  fontWeight: 'bold',
                  borderColor: '#243447',
                  color: '#1a2332',
                  bgcolor: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(6px)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    bgcolor: '#ffffff',
                    borderColor: '#0d131d',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.25s ease'
                }}
              >
                ลงประกาศหาบ้าน
              </Button>
            </Stack>
          </Box>

          {/* Hero Banner with Dogs & Interactive Speech Bubbles */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 1060,
              mx: 'auto',
              mt: { xs: 0, sm: 0.5, md: 1 },
              borderRadius: { xs: '16px 16px 0 0', md: '24px 24px 0 0' },
              overflow: 'hidden'
            }}
          >
            <Box
              component="img"
              src="/hero-pets.jpg"
              alt="Happiness is having a pet as a friend - Adorable dogs row"
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover'
              }}
            />

            {/* Speech Bubble 1 - Chocolate Lab Puppy */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: '60%', sm: '63%', md: '65%' },
                left: '12%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(8px)',
                px: { xs: 1, sm: 1.6 },
                py: { xs: 0.3, sm: 0.6 },
                borderRadius: '20px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                animation: 'floatBubble 3.2s ease-in-out infinite',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateX(-50%) scale(1.1)' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderWidth: '6px 6px 0',
                  borderStyle: 'solid',
                  borderColor: 'rgba(255, 255, 255, 0.96) transparent transparent transparent'
                }
              }}
              onClick={() => navigate('/listings')}
            >
              <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.82rem', md: '0.9rem' }, fontWeight: 800, color: '#1a2332' }}>
                HELLO! 🐾
              </Typography>
            </Box>

            {/* Speech Bubble 2 - Jack Russell */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: '67%', sm: '70%', md: '72%' },
                left: '30%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(8px)',
                px: { xs: 1, sm: 1.6 },
                py: { xs: 0.3, sm: 0.6 },
                borderRadius: '20px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                animation: 'floatBubble 2.8s ease-in-out infinite 0.7s',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateX(-50%) scale(1.1)' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderWidth: '6px 6px 0',
                  borderStyle: 'solid',
                  borderColor: 'rgba(255, 255, 255, 0.96) transparent transparent transparent'
                }
              }}
              onClick={() => navigate('/listings')}
            >
              <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.82rem', md: '0.9rem' }, fontWeight: 800, color: '#1a2332' }}>
                HI! ✨
              </Typography>
            </Box>

            {/* Speech Bubble 3 - English Bulldog */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: '70%', sm: '73%', md: '75%' },
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(8px)',
                px: { xs: 1, sm: 1.6 },
                py: { xs: 0.3, sm: 0.6 },
                borderRadius: '20px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                animation: 'floatBubble 3.5s ease-in-out infinite 0.3s',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateX(-50%) scale(1.1)' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderWidth: '6px 6px 0',
                  borderStyle: 'solid',
                  borderColor: 'rgba(255, 255, 255, 0.96) transparent transparent transparent'
                }
              }}
              onClick={() => navigate('/listings')}
            >
              <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.82rem', md: '0.9rem' }, fontWeight: 800, color: '#1a2332' }}>
                PLAY? 🎾
              </Typography>
            </Box>

            {/* Speech Bubble 4 - Pug */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: '63%', sm: '66%', md: '68%' },
                left: '70%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(8px)',
                px: { xs: 1, sm: 1.6 },
                py: { xs: 0.3, sm: 0.6 },
                borderRadius: '20px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                animation: 'floatBubble 3.1s ease-in-out infinite 1.1s',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateX(-50%) scale(1.1)' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderWidth: '6px 6px 0',
                  borderStyle: 'solid',
                  borderColor: 'rgba(255, 255, 255, 0.96) transparent transparent transparent'
                }
              }}
              onClick={() => navigate('/listings')}
            >
              <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.82rem', md: '0.9rem' }, fontWeight: 800, color: '#1a2332' }}>
                FRIEND? ❤️
              </Typography>
            </Box>

            {/* Speech Bubble 5 - Beagle */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: '64%', sm: '67%', md: '69%' },
                left: '88%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(8px)',
                px: { xs: 1, sm: 1.6 },
                py: { xs: 0.3, sm: 0.6 },
                borderRadius: '20px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                animation: 'floatBubble 3.4s ease-in-out infinite 0.5s',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateX(-50%) scale(1.1)' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderWidth: '6px 6px 0',
                  borderStyle: 'solid',
                  borderColor: 'rgba(255, 255, 255, 0.96) transparent transparent transparent'
                }
              }}
              onClick={() => navigate('/listings')}
            >
              <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.82rem', md: '0.9rem' }, fontWeight: 800, color: '#1a2332' }}>
                WOOF! 🐶
              </Typography>
            </Box>
          </Box>
        </Container>

        {/* ─── Gradient Transition at the intersection of blue and white ──────────── */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: { xs: 55, sm: 75, md: 95 },
            background: 'linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.35) 40%, rgba(248, 250, 252, 0.8) 75%, #f8fafc 100%)',
            pointerEvents: 'none',
            zIndex: 3
          }}
        />
      </Box>

      {/* ─── Main Content Section ─────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ pt: 7, pb: 8, flexGrow: 1 }}>
        
        {/* Success Metrics */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3.5, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2.5, 
                bgcolor: 'white', 
                borderRadius: 3, 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-3px)' }
              }}
            >
              <Box sx={{ bgcolor: '#e0f2fe', p: 1.8, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PetsIcon sx={{ fontSize: 36, color: '#0284c7' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} color="#0f172a">1,000+</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>สัตว์เลี้ยงที่ได้บ้านที่อบอุ่นแล้ว</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3.5, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2.5, 
                bgcolor: 'white', 
                borderRadius: 3, 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-3px)' }
              }}
            >
              <Box sx={{ bgcolor: '#fef3c7', p: 1.8, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ListAltIcon sx={{ fontSize: 36, color: '#d97706' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} color="#0f172a">500+</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>ประกาศหาบ้านที่กำลังเปิดรับ</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3.5, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2.5, 
                bgcolor: 'white', 
                borderRadius: 3, 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-3px)' }
              }}
            >
              <Box sx={{ bgcolor: '#fce7f3', p: 1.8, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StarIcon sx={{ fontSize: 36, color: '#db2777' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} color="#0f172a">4.9/5</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>ความพึงพอใจจากผู้รับอุปการะ</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* New Arrivals Section */}
        <Box sx={{ mb: 9 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h2" fontWeight={800} color="#0f172a" gutterBottom>
                เพื่อนตัวน้อยมาใหม่
              </Typography>
              <Typography variant="body1" color="text.secondary">
                สัตว์เลี้ยงน่ารักที่เพิ่งลงประกาศและกำลังรอคอยเจ้าของใหม่ที่ใจดี
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="primary" 
              size="medium" 
              onClick={() => navigate('/listings')} 
              sx={{ borderRadius: 8, px: 3, fontWeight: 'bold' }}
            >
              ดูทั้งหมด →
            </Button>
          </Box>
          
          <PetGrid pets={pets} loading={loading} />
          
          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={() => navigate('/listings')} 
              sx={{ px: 6, py: 1.4, borderRadius: 8, fontSize: '1rem', fontWeight: 'bold', boxShadow: 3 }}
            >
              ดูสัตว์เลี้ยงทั้งหมดที่รอคุณอยู่
            </Button>
          </Box>
        </Box>

        {/* Why Choose Us Features */}
        <Box sx={{ mb: 6, p: { xs: 3, md: 5 }, bgcolor: 'white', borderRadius: 4, border: '1px solid #e2e8f0' }}>
          <Typography variant="h4" fontWeight={800} textAlign="center" gutterBottom color="#0f172a">
            ทำไมต้องหาบ้านสัตว์เลี้ยงกับ PET-HOME
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 600, mx: 'auto', mb: 5 }}>
            เรามุ่งมั่นสร้างสะพานเชื่อมความรักที่ปลอดภัยและโปร่งใส เพื่ออนาคตที่ดีของทุกชีวิต
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <SecurityIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                ปลอดภัยและเชื่อถือได้
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                ระบบคัดกรองรายงานความไม่เหมาะสม และการยืนยันตัวตนผู้ใช้ เพื่อความปลอดภัยสูงสุดของสัตว์เลี้ยง
              </Typography>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <ForumIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                แชทคุยกับเจ้าของโดยตรง
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                พูดคุย สอบถามพฤติกรรม นัดดูตัว หรือขอคำปรึกษาได้ทันทีผ่านระบบแชทแบบ Real-time
              </Typography>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <FavoriteIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                ไม่มีค่าใช้จ่ายเพื่อการกุศล
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                แพลตฟอร์มเพื่อการหาบ้านให้สัตว์เลี้ยงอย่างแท้จริง ไม่มีการซื้อขายเชิงพาณิชย์
              </Typography>
            </Grid>
          </Grid>
        </Box>

      </Container>

      {/* ─── Modern Footer ───────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#0f172a', color: 'white', py: 6, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PetsIcon sx={{ fontSize: 30, color: '#38bdf8' }} />
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '0.02em', color: '#38bdf8' }}>
                  PET-HOME
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.7, maxWidth: 360 }}>
                แพลตฟอร์มศูนย์กลางการหาบ้านและรับอุปการะสัตว์เลี้ยง เพื่อให้ทุกตัวได้พบกับครอบครัวที่อบอุ่นและปลอดภัย
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#f1f5f9', mb: 2 }}>
                เมนูหลัก
              </Typography>
              <Stack spacing={1.2}>
                <Link to="/listings" style={{ textDecoration: 'none', color: '#94a3b8' }}>
                  <Typography variant="body2" sx={{ '&:hover': { color: '#38bdf8' }, transition: 'color 0.2s' }}>หาบ้านให้สัตว์เลี้ยง</Typography>
                </Link>
                <Link to="/listings/create" style={{ textDecoration: 'none', color: '#94a3b8' }}>
                  <Typography variant="body2" sx={{ '&:hover': { color: '#38bdf8' }, transition: 'color 0.2s' }}>ลงประกาศหาบ้าน</Typography>
                </Link>
                <Link to="/chat" style={{ textDecoration: 'none', color: '#94a3b8' }}>
                  <Typography variant="body2" sx={{ '&:hover': { color: '#38bdf8' }, transition: 'color 0.2s' }}>กล่องข้อความแชท</Typography>
                </Link>
              </Stack>
            </Grid>

            <Grid item xs={6} md={4}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#f1f5f9', mb: 2 }}>
                ติดต่อเรา
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1 }}>
                📍 กรุงเทพมหานคร, ประเทศไทย
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1 }}>
                ✉️ contact@pet-home.com
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                📞 02-123-4567 (จันทร์ - ศุกร์ 09:00 - 18:00)
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              © 2026 PET-HOME Platform. All rights reserved. Designed with love for all pets.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage
