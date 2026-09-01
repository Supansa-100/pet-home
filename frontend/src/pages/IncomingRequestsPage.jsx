import { useState, useEffect } from 'react'
import { Container, Typography, Box, CircularProgress, Button } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import RequestCard from '../components/request/RequestCard'
import { getIncomingRequests, approveRequest, rejectRequest } from '../services/requestService'
import { getPetById } from '../services/petService'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const IncomingRequestsPage = () => {
  const { id } = useParams() // pet id
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [petRes, reqRes] = await Promise.all([
        getPetById(id),
        getIncomingRequests(id)
      ])
      
      if (petRes.success) setPet(petRes.data)
      if (reqRes.success) setRequests(reqRes.data)
      
    } catch (error) {
      console.error('Error fetching incoming requests:', error)
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    if (window.confirm('คุณยืนยันที่จะอนุมัติคำขอนี้ใช่หรือไม่? คำขออื่นสำหรับประกาศนี้จะถูกปฏิเสธอัตโนมัติ')) {
      try {
        const res = await approveRequest(requestId)
        if (res.success) {
          alert('อนุมัติคำขอสำเร็จ')
          fetchData() // Refresh data
        }
      } catch (error) {
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติคำขอ')
      }
    }
  }

  const handleReject = async (requestId) => {
    if (window.confirm('คุณต้องการปฏิเสธคำขอนี้ใช่หรือไม่?')) {
      try {
        const res = await rejectRequest(requestId)
        if (res.success) {
          alert('ปฏิเสธคำขอสำเร็จ')
          fetchData() // Refresh data
        }
      } catch (error) {
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธคำขอ')
      }
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/my-listings')}
        sx={{ mb: 2 }}
      >
        กลับไปประกาศของฉัน
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                คำขอรับอุปการะ
              </Typography>
              <Typography variant="body1" color="text.secondary">
                สำหรับ: {pet?.name} {pet?.status !== 'available' && `(สถานะปัจจุบัน: ${pet?.status})`}
              </Typography>
            </Box>
          </Box>

          {requests.length > 0 ? (
            <Box>
              {requests.map(request => (
                <RequestCard 
                  key={request.id} 
                  request={request} 
                  type="incoming" 
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary">
                ยังไม่มีคำขอรับอุปการะสำหรับประกาศนี้
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

export default IncomingRequestsPage
