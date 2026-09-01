import { Card, CardActionArea, CardContent, CardMedia, Typography, Box, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import StatusChip from '../ui/StatusChip'
import LocationOnIcon from '@mui/icons-material/LocationOn'

const PetCard = ({ pet }) => {
  const navigate = useNavigate()

  // Use the primary_image if available, otherwise a placeholder
  const imageUrl = pet.primary_image || 'https://placehold.co/400x300?text=No+Image'

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
      <CardActionArea onClick={() => navigate(`/listings/${pet.id}`)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={imageUrl}
            alt={pet.name}
            loading="lazy"
            sx={{ objectFit: 'cover' }}
          />
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <StatusChip status={pet.status} />
          </Box>
        </Box>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h6" component="div" fontWeight={600} noWrap>
            {pet.name}
          </Typography>
          
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {pet.category_name} {pet.breed ? `• ${pet.breed}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pet.gender === 'male' ? 'ตัวผู้ ♂' : pet.gender === 'female' ? 'ตัวเมีย ♀' : 'ไม่ระบุ'}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 'auto', pt: 1, color: 'text.secondary' }}>
            <LocationOnIcon fontSize="small" />
            <Typography variant="body2" noWrap>
              {pet.location || 'ไม่ระบุพื้นที่'}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default PetCard
