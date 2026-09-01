import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, CircularProgress } from '@mui/material'
import { createRequest } from '../../services/requestService'

const RequestForm = ({ open, onClose, petId, petName }) => {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert('กรุณากรอกข้อความแนะนำตัวและเหตุผลที่อยากรับเลี้ยง')
      return
    }

    setLoading(true)
    try {
      const res = await createRequest(petId, message)
      if (res.success) {
        alert('ส่งคำขอรับอุปการะสำเร็จแล้ว')
        setMessage('')
        onClose(true) // Pass true to indicate success
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งคำขอ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => !loading && onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>ส่งคำขอรับอุปการะ: {petName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
          กรุณาแนะนำตัวเองสั้นๆ พร้อมระบุเหตุผลว่าทำไมถึงอยากรับเลี้ยงน้อง และความพร้อมในการดูแล (เช่น สถานที่เลี้ยง, ประสบการณ์) เพื่อให้เจ้าของโพสต์ใช้พิจารณา
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="ข้อความแนะนำตัว"
          type="text"
          fullWidth
          multiline
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={() => onClose(false)} disabled={loading}>
          ยกเลิก
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !message.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          ส่งคำขอ
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RequestForm
