import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Typography, Box, CircularProgress, Grid, Paper, Avatar, IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import ChatRoomList from '../components/chat/ChatRoomList'
import ChatMessage from '../components/chat/ChatMessage'
import ChatInput from '../components/chat/ChatInput'

import { getMyRooms, getRoomMessages, sendMessage, markAsRead } from '../services/chatService'
import { useAuth } from '../contexts/AuthContext'

const ChatRoomPage = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  const [rooms, setRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [roomData, setRoomData] = useState(null)
  
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [sending, setSending] = useState(false)

  // Fetch Rooms list
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getMyRooms()
        if (res.success) setRooms(res.data)
      } catch (error) {
        console.error('Error fetching chat rooms:', error)
      } finally {
        setLoadingRooms(false)
      }
    }
    fetchRooms()
  }, [])

  // Fetch Messages for current room (with polling)
  useEffect(() => {
    let pollingInterval

    const fetchMessages = async () => {
      if (!roomId) return
      try {
        const res = await getRoomMessages(roomId)
        if (res.success) {
          setMessages(res.data.messages)
          setRoomData({
            pet: res.data.pet,
            otherParty: res.data.other_party
          })
          setLoadingMessages(false)
          
          // Mark as read in background
          markAsRead(roomId).catch(console.error)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        navigate('/chat')
      }
    }

    setLoadingMessages(true)
    fetchMessages()

    pollingInterval = setInterval(() => {
      fetchMessages()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(pollingInterval)
  }, [roomId, navigate])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (text) => {
    setSending(true)
    try {
      const res = await sendMessage(roomId, text)
      if (res.success) {
        setMessages((prev) => [...prev, res.data])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert(error.response?.data?.message || 'ส่งข้อความไม่สำเร็จ')
    } finally {
      setSending(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6, height: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
        <IconButton onClick={() => navigate('/chat')}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ display: { xs: 'none', md: 'block' } }}>
        กล่องข้อความ
      </Typography>
      
      <Grid container spacing={2} sx={{ height: 'calc(100% - 60px)' }}>
        {/* Left Column: Room List (hidden on mobile) */}
        <Grid item xs={12} md={4} sx={{ height: '100%', display: { xs: 'none', md: 'block' } }}>
          <Paper sx={{ height: '100%', overflowY: 'auto' }} variant="outlined">
            {loadingRooms ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ChatRoomList rooms={rooms} activeRoomId={roomId} />
            )}
          </Paper>
        </Grid>
        
        {/* Right Column: Chat Room */}
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <Paper variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {loadingMessages ? (
              <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : roomData ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={roomData.otherParty.avatar_url} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {roomData.otherParty.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      คุยเรื่อง: {roomData.pet.name} ({roomData.pet.status})
                    </Typography>
                  </Box>
                </Box>

                {/* Messages Area */}
                <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: 'grey.50' }}>
                  {messages.length === 0 ? (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">เริ่มการสนทนา...</Typography>
                    </Box>
                  ) : (
                    messages.map((msg) => (
                      <ChatMessage 
                        key={msg.id} 
                        message={msg} 
                        isMe={msg.sender_id === user.id} 
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <ChatInput onSend={handleSendMessage} loading={sending} />
              </>
            ) : null}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default ChatRoomPage
