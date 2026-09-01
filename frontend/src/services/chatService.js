import api from './api'

export const getMyRooms = async () => {
  const response = await api.get('/chat/rooms')
  return response.data
}

export const getRoomMessages = async (roomId) => {
  const response = await api.get(`/chat/rooms/${roomId}`)
  return response.data
}

export const sendMessage = async (roomId, message) => {
  const response = await api.post(`/chat/rooms/${roomId}/messages`, { message })
  return response.data
}

export const markAsRead = async (roomId) => {
  const response = await api.patch(`/chat/rooms/${roomId}/read`)
  return response.data
}

export const getUnreadCount = async () => {
  const response = await api.get('/chat/unread-count')
  return response.data
}
