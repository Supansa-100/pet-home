import api from './api'

export const getStats = async () => {
  const response = await api.get('/admin/stats')
  return response.data
}

// ข้อมูลกราฟ: แนวโน้มย้อนหลัง 30 วัน และสัดส่วนชนิดสัตว์
export const getCharts = async (days = 30) => {
  const response = await api.get('/admin/charts', { params: { days } })
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

// Reports
export const getReports = async (status) => {
  const params = status ? { status } : {}
  const response = await api.get('/admin/reports', { params })
  return response.data
}

export const updateReportStatus = async (id, data) => {
  const response = await api.patch(`/admin/reports/${id}`, data)
  return response.data
}

// SLA Alerts
export const getSLAStatus = async () => {
  const response = await api.get('/admin/sla/status')
  return response.data
}

export const triggerSLACheck = async () => {
  const response = await api.post('/admin/sla/trigger')
  return response.data
}
