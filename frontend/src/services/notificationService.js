import api from './api'

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications')
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const markAsRead = async (id = 'all') => {
  try {
    const response = await api.put(`/notifications/${id}/read`)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}
