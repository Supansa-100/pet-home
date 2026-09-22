import { useState, useEffect } from 'react'
import { Container, Typography, Box, CircularProgress, Button, Alert } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import RequestCard from '../components/request/RequestCard'
import { getIncomingRequests, getAllIncomingRequests, approveRequest, rejectRequest } from '../services/requestService'
import { getPetById } from '../services/petService'
import BackButton from '../components/ui/BackButton'
import StatusChip, { isListingClosed } from '../components/ui/StatusChip'
import { useToast } from '../contexts/ToastContext'

const IncomingRequestsPage = () => {
  const { id } = useParams() // pet id (optional)
  const navigate = useNavigate()
  const showToast = useToast()
  const [requests, setRequests] = useState([])
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (id) {
        // ดึงเฉพาะประกาศตัวนี้
        const [petRes, reqRes] = await Promise.all([
          getPetById(id),
          getIncomingRequests(id)
        ])
        if (petRes.success) setPet(petRes.data)
        if (reqRes.success) setRequests(reqRes.data)
      } else {
        // ดึงคำขอทั้งหมดที่ส่งเข้ามาสำหรับสัตว์เลี้ยงทุกตัวของฉัน
        const res = await getAllIncomingRequests()
        if (res.success) setRequests(res.data)
      }
    } catch (error) {
      console.error('Error fetching incoming requests:', error)
      showToast?.(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    if (window.confirm('คุณยืนยันที่จะอนุมัติคำขอนี้ใช่หรือไม่? คำขออื่นสำหรับประกาศนี้จะถูกปฏิเสธอัตโนมัติ')) {
      try {
        const res = await approveRequest(requestId)
        if (res.success) {
          showToast?.('อนุมัติคำขอสำเร็จ', 'success')
          fetchData()
        }
      } catch (error) {
        showToast?.(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติคำขอ', 'error')
      }
    }
  }

  const handleReject = async (requestId) => {
    if (window.confirm('คุณต้องการปฏิเสธคำขอนี้ใช่หรือไม่?')) {
      try {
        const res = await rejectRequest(requestId)
        if (res.success) {
          showToast?.('ปฏิเสธคำขอสำเร็จ', 'info')
          fetchData()
        }
      } catch (error) {
        showToast?.(error.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธคำขอ', 'error')
      }
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <BackButton fallbackPath="/my-listings" label="กลับไปประกาศของฉัน" />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                {id ? 'คำขอรับอุปการะ' : 'ดูคำขออุปการะของฉัน'}
              </Typography>
              {id ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body1" color="text.secondary">
                    สำหรับ: {pet?.name || 'สัตว์เลี้ยง'}
                  </Typography>
                  {pet?.status && <StatusChip status={pet.status} />}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  รายการคำขอรับอุปการะทั้งหมดที่ส่งเข้ามาสำหรับสัตว์เลี้ยงของคุณ
                </Typography>
              )}
            </Box>
          </Box>

          {/* ประกาศที่ได้บ้านแล้ว/ปิดแล้ว จะไม่รับคำขอใหม่อีก แจ้งให้เจ้าของทราบชัดเจน */}
          {isListingClosed(pet?.status) && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {pet?.status === 'adopted'
                ? `น้อง${pet?.name || ''}ได้บ้านใหม่แล้ว ประกาศนี้ถูกปิดรับคำขอโดยอัตโนมัติ และคำขออื่นที่ค้างอยู่ถูกปฏิเสธเรียบร้อย`
                : 'ประกาศนี้ถูกปิดรับคำขอแล้ว'}
            </Alert>
          )}

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
                {id ? 'ยังไม่มีคำขอรับอุปการะสำหรับประกาศนี้' : 'ยังไม่มีคำขอรับอุปการะส่งเข้ามาสำหรับสัตว์เลี้ยงของคุณ'}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

export default IncomingRequestsPage
