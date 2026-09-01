import { useState, useEffect } from 'react'
import { Container, Typography, Box, CircularProgress, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PetGrid from '../components/pet/PetGrid'
import { getMyPets } from '../services/petService'

const MyListingsPage = () => {
  const navigate = useNavigate()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyPets = async () => {
      try {
        const res = await getMyPets()
        if (res.success) {
          setPets(res.data)
        }
      } catch (error) {
        console.error('Error fetching my pets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMyPets()
  }, [])

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            ประกาศของฉัน
          </Typography>
          <Typography variant="body1" color="text.secondary">
            จัดการรายการสัตว์เลี้ยงที่คุณลงประกาศหาบ้าน
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/listings/create')}>
          ลงประกาศใหม่
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : pets.length > 0 ? (
        <PetGrid pets={pets} />
      ) : (
        <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">
            คุณยังไม่มีประกาศหาบ้านสำหรับสัตว์เลี้ยง
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default MyListingsPage
