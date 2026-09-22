import { Box, Typography } from '@mui/material'
import { formatBangkokTime } from '../../utils/dateUtils'

const ChatMessage = ({ message, isMe }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      <Box 
        sx={{
          maxWidth: '70%',
          bgcolor: isMe ? 'primary.main' : 'grey.200',
          color: isMe ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
          borderTopRightRadius: isMe ? 0 : 2,
          borderTopLeftRadius: !isMe ? 0 : 2,
          p: 1.5,
          boxShadow: 1
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
          {message.message}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            textAlign: 'right', 
            mt: 0.5,
            color: isMe ? 'rgba(255,255,255,0.7)' : 'text.secondary'
          }}
        >
          {formatBangkokTime(message.created_at)}
        </Typography>
      </Box>
    </Box>
  )
}

export default ChatMessage
