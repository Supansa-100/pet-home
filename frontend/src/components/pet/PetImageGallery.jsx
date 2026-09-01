import { useState } from 'react'
import { Box, IconButton } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

const PetImageGallery = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const defaultImage = 'https://placehold.co/800x600?text=No+Image'
  
  const displayImages = images.length > 0 ? images : [{ image_url: defaultImage }]

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Main Image */}
      <Box sx={{ position: 'relative', width: '100%', height: { xs: 300, sm: 400, md: 500 }, borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.100' }}>
        <Box
          component="img"
          src={displayImages[currentIndex].image_url}
          alt={`Pet image ${currentIndex + 1}`}
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        
        {displayImages.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevious}
              sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(255, 255, 255, 0.7)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' } }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(255, 255, 255, 0.7)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' } }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </>
        )}
      </Box>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
          {displayImages.map((img, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 80,
                height: 80,
                flexShrink: 0,
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                border: currentIndex === index ? '3px solid' : '2px solid transparent',
                borderColor: currentIndex === index ? 'primary.main' : 'transparent',
                opacity: currentIndex === index ? 1 : 0.6,
                transition: 'all 0.2s ease',
                '&:hover': { opacity: 1 }
              }}
            >
              <Box
                component="img"
                src={img.image_url}
                alt={`Thumbnail ${index + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default PetImageGallery
