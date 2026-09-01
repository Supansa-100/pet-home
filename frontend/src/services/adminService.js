import api from './api'

export const getStats = async () => {
  const response = await api.get('/admin/stats')
  return response.data
}

export const getUsers = async () => {
  const response = await api.get('/admin/users')
  return response.data
}

export const toggleBan = async (id) => {
  const response = await api.patch(`/admin/users/${id}/ban`)
  return response.data
}

export const getAllListings = async () => {
  const response = await api.get('/admin/listings')
  return response.data
}

export const createCategory = async (name) => {
  const response = await api.post('/categories', { name })
  return response.data
}

export const updateCategory = async (id, name) => {
  const response = await api.put(`/categories/${id}`, { name })
  return response.data
}

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`)
  return response.data
}
