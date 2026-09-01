import { List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, Badge, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const ChatRoomList = ({ rooms, activeRoomId }) => {
  const navigate = useNavigate()

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
      {rooms.map((room) => (
        <ListItem 
          key={room.id} 
          button 
          onClick={() => navigate(`/chat/${room.id}`)}
          sx={{
            bgcolor: room.id === parseInt(activeRoomId) ? 'action.selected' : 'inherit',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ListItemAvatar>
            <Badge color="error" badgeContent={room.unread_count || 0}>
              <Avatar src={room.other_party_avatar} />
            </Badge>
          </ListItemAvatar>
          <ListItemText 
            primary={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: room.unread_count > 0 ? 700 : 400 }}>
                  {room.other_party_name}
                </Typography>
                {room.last_message_time && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(room.last_message_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                )}
              </Box>
            }
            secondary={
              <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: room.unread_count > 0 ? 600 : 400 }}>
                {room.last_message || `แชทเรื่อง: ${room.pet_name}`}
              </Typography>
            }
          />
        </ListItem>
      ))}
      
      {rooms.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">ไม่มีประวัติการแชท</Typography>
        </Box>
      )}
    </List>
  )
}

export default ChatRoomList
