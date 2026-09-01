import { useState, useEffect } from 'react'
import { Container, CircularProgress, Box, Typography } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import PetForm from '../components/pet/PetForm'
import { getPetById } from '../services/petService'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const EditListingPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const showToast = useToast()
  
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await getPetById(id)
        if (res.success) {
          // Check if user is owner or admin
          if (user.role !== 'admin' && res.data.user_id !== user.id) {
            showToast('คุณไม่มีสิทธิ์แก้ไขประกาศนี้', 'error')
            navigate('/listings')
            return
          }
          setPet(res.data)
        }
      } catch (error) {
        console.error('Error fetching pet:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPet()
  }, [id, user, navigate])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!pet) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography color="error">ไม่พบข้อมูลประกาศ</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <PetForm isEdit={true} initialData={pet} />
    </Container>
  )
}

export default EditListingPage
