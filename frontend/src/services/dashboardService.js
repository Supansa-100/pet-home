import api from './api'

// สถิติส่วนตัวของผู้ใช้ที่ล็อกอินอยู่ (รวมทั้งมุมผู้หาบ้านและผู้รับอุปการะ)
export const getUserSummary = async () => {
  const response = await api.get('/dashboard/user/summary')
  return response.data
}
