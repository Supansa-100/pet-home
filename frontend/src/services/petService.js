import api from './api'

export const getPets = async (params) => {
  const response = await api.get('/pets', { params })
  return response.data
}

export const getPetById = async (id) => {
  const response = await api.get(`/pets/${id}`)
  return response.data
}

export const getMyPets = async () => {
  const response = await api.get('/pets/my')
  return response.data
}

export const createPet = async (formData) => {
  const response = await api.post('/pets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const updatePet = async (id, data) => {
  const isFormData = data instanceof FormData;
  const response = await api.put(`/pets/${id}`, data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
  })
  return response.data
}

export const updatePetStatus = async (id, status) => {
  const response = await api.put(`/pets/${id}/status`, { status })
  return response.data
}

export const deletePet = async (id) => {
  const response = await api.delete(`/pets/${id}`)
  return response.data
}

// Categories
export const getCategories = async () => {
  const response = await api.get('/categories')
  return response.data
}
