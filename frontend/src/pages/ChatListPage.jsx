import { useState, useEffect } from 'react'
import { Container, Typography, Box, CircularProgress, Grid, Paper } from '@mui/material'
import ChatRoomList from '../components/chat/ChatRoomList'
import BackButton from '../components/ui/BackButton'
import { getMyRooms } from '../services/chatService'

const ChatListPage = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await getMyRooms()
      if (res.success) {
        setRooms(res.data)
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: 'calc(100vh - 64px)' }}>
      <BackButton fallbackPath="/" label="กลับหน้าหลัก" sx={{ mb: 1.5 }} />
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
        กล่องข้อความ
      </Typography>
      
      <Grid container spacing={2} sx={{ height: 'calc(100% - 60px)' }}>
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', overflowY: 'auto' }} variant="outlined">
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ChatRoomList rooms={rooms} />
            )}
          </Paper>
        </Grid>
        
        {/* On desktop, show empty state on the right */}
        <Grid item xs={12} md={8} sx={{ height: '100%', display: { xs: 'none', md: 'block' } }}>
          <Paper 
            variant="outlined" 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'grey.50'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              เลือกห้องแชทเพื่อเริ่มสนทนา
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default ChatListPage
