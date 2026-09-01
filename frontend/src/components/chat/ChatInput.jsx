import { useState } from 'react'
import { Box, TextField, IconButton, CircularProgress } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

const ChatInput = ({ onSend, loading }) => {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (text.trim() && !loading) {
      onSend(text)
      setText('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="พิมพ์ข้อความ..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={loading}
        variant="outlined"
        size="small"
        sx={{ mr: 1, bgcolor: 'grey.50' }}
      />
      <IconButton 
        color="primary" 
        onClick={handleSend}
        disabled={!text.trim() || loading}
        sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
      </IconButton>
    </Box>
  )
}

export default ChatInput
