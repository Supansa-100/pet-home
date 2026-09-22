import api from './api'

export const createRequest = async (petId, message) => {
  const response = await api.post(`/pets/${petId}/requests`, { message })
  return response.data
}

export const getMyRequests = async () => {
  const response = await api.get('/requests/my')
  return response.data
}

export const getIncomingRequests = async (petId) => {
  const response = await api.get(`/pets/${petId}/requests`)
  return response.data
}

export const getAllIncomingRequests = async () => {
  const response = await api.get('/requests/incoming')
  return response.data
}

export const approveRequest = async (requestId) => {
  const response = await api.patch(`/requests/${requestId}/approve`)
  return response.data
}

export const rejectRequest = async (requestId) => {
  const response = await api.patch(`/requests/${requestId}/reject`)
  return response.data
}

export const cancelRequest = async (requestId) => {
  const response = await api.patch(`/requests/${requestId}/cancel`)
  return response.data
}
