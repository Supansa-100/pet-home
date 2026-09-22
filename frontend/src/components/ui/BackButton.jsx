import { Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'

const BackButton = ({ fallbackPath = '/', label = 'ย้อนกลับ', sx = {} }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate(fallbackPath)
    }
  }

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={handleBack}
      sx={{
        mb: 2.5,
        color: 'text.secondary',
        textTransform: 'none',
        fontSize: '0.92rem',
        fontWeight: 500,
        borderRadius: 2,
        px: 1.5,
        py: 0.6,
        bgcolor: 'rgba(0, 0, 0, 0.04)',
        '&:hover': {
          color: 'primary.main',
          bgcolor: 'rgba(0, 0, 0, 0.08)',
          transform: 'translateX(-2px)'
        },
        transition: 'all 0.2s ease',
        ...sx
      }}
    >
      {label}
    </Button>
  )
}

export default BackButton
