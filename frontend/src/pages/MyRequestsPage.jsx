import { useState, useEffect } from 'react'
import { Container, Typography, Box, CircularProgress } from '@mui/material'
import RequestCard from '../components/request/RequestCard'
import BackButton from '../components/ui/BackButton'
import { getMyRequests, cancelRequest } from '../services/requestService'

const MyRequestsPage = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await getMyRequests()
      if (res.success) {
        setRequests(res.data)
      }
    } catch (error) {
      console.error('Error fetching my requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (window.confirm('คุณต้องการยกเลิกคำขอรับอุปการะนี้ใช่หรือไม่?')) {
      try {
        const res = await cancelRequest(id)
        if (res.success) {
          alert('ยกเลิกคำขอเรียบร้อยแล้ว')
          fetchRequests() // Refresh data
        }
      } catch (error) {
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิกคำขอ')
      }
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <BackButton fallbackPath="/" label="กลับหน้าหลัก" />
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          คำขอรับอุปการะของฉัน
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ติดตามสถานะคำขอรับอุปการะสัตว์เลี้ยงที่คุณได้ส่งไป
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : requests.length > 0 ? (
        <Box>
          {requests.map(request => (
            <RequestCard 
              key={request.id} 
              request={request} 
              type="outgoing" 
              onCancel={handleCancel} 
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">
            คุณยังไม่มีประวัติการส่งคำขอรับอุปการะ
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default MyRequestsPage
