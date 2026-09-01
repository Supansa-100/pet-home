import { useState, useRef } from 'react'
import { Box, Typography, Button, IconButton } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'

const ImageUploader = ({ images, setImages, existingImages = [], onRemoveExisting, maxImages = 5 }) => {
  const fileInputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    const newFiles = Array.from(files)
    // Filter to accept only images
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'))
    
    setImages(prev => {
      const combined = [...prev, ...imageFiles]
      // Limit to maxImages
      return combined.slice(0, maxImages)
    })
  }

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const onButtonClick = () => {
    fileInputRef.current.click()
  }

  const totalImages = images.length + existingImages.length;
  const getImageUrl = (url) => {
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL.replace('/api/v1', '')}${url}`;
  };

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
        รูปภาพสัตว์เลี้ยง ({totalImages}/{maxImages})
      </Typography>
      
      {images.length < maxImages && (
        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'grey.400',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: dragActive ? 'primary.50' : 'grey.50',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'grey.100',
              borderColor: 'primary.main'
            }
          }}
          onClick={onButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.primary" gutterBottom>
            ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์
          </Typography>
          <Typography variant="body2" color="text.secondary">
            (รองรับ JPG, PNG สูงสุด {maxImages} รูป)
          </Typography>
        </Box>
      )}

      {/* Image Previews */}
      {totalImages > 0 && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          {/* Existing Images */}
          {existingImages.map((img, index) => (
            <Box
              key={`existing-${img.id}`}
              sx={{
                position: 'relative',
                width: 100,
                height: 100,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'grey.300'
              }}
            >
              <Box
                component="img"
                src={getImageUrl(img.image_url)}
                alt={`existing ${index}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => onRemoveExisting(img.id)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { bgcolor: 'white' },
                  p: 0.5
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              {img.is_primary === 1 && (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    textAlign: 'center',
                    py: 0.5,
                    fontSize: '0.65rem'
                  }}
                >
                  รูปหลัก (เดิม)
                </Typography>
              )}
            </Box>
          ))}

          {/* New Images */}
          {images.map((image, index) => (
            <Box
              key={`new-${index}`}
              sx={{
                position: 'relative',
                width: 100,
                height: 100,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'grey.300'
              }}
            >
              <Box
                component="img"
                src={URL.createObjectURL(image)}
                alt={`preview ${index}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => removeImage(index)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { bgcolor: 'white' },
                  p: 0.5
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              {existingImages.length === 0 && index === 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    textAlign: 'center',
                    py: 0.5,
                    fontSize: '0.65rem'
                  }}
                >
                  รูปหลัก
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default ImageUploader
