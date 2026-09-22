import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, RadioGroup, FormControlLabel, Radio,
  FormControl, FormLabel, TextField, Box, CircularProgress
} from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'
import { reportPet } from '../../services/petService'
import { useToast } from '../../contexts/ToastContext'

const REPORT_REASONS = [
  { value: 'spam', label: 'สแปม / ข้อมูลเท็จ' },
  { value: 'inappropriate', label: 'เนื้อหาไม่เหมาะสม / หยาบคาย' },
  { value: 'scam', label: 'หลอกลวง / ฉ้อโกง / ซื้อขายแอบแฝง' },
  { value: 'abuse', label: 'ทารุณกรรมสัตว์ / เลี้ยงดูไม่เหมาะสม' },
  { value: 'duplicate', label: 'ประกาศซ้ำซ้อน' },
  { value: 'other', label: 'อื่นๆ' }
]

const ReportModal = ({ open, onClose, petId, petName }) => {
  const showToast = useToast()
  const [reason, setReason] = useState('spam')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) return

    try {
      setLoading(true)
      const res = await reportPet(petId, { reason, details: details.trim() })
      if (res.success) {
        showToast('ส่งรายงานความไม่เหมาะสมเรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบ')
        handleClose()
      }
    } catch (error) {
      console.error('Error reporting pet:', error)
      showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งรายงาน', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setReason('spam')
    setDetails('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
        <FlagIcon />
        รายงานความไม่เหมาะสม
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          {petName && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              คุณกำลังรายงานประกาศ: <strong>{petName}</strong>
            </Typography>
          )}

          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
              เหตุผลในการรายงาน *
            </FormLabel>
            <RadioGroup
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REPORT_REASONS.map((r) => (
                <FormControlLabel
                  key={r.value}
                  value={r.value}
                  control={<Radio size="small" color="error" />}
                  label={r.label}
                  sx={{ py: 0.5 }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <TextField
            label="รายละเอียดเพิ่มเติม (ถ้ามี)"
            placeholder="อธิบายข้อมูลเพิ่มเติม เช่น พบเห็นข้อความขัดแย้ง พฤติกรรมต้องสงสัย..."
            multiline
            rows={3}
            fullWidth
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            disabled={loading}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            ยกเลิก
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={loading || !reason}
            startIcon={loading && <CircularProgress size={18} color="inherit" />}
          >
            {loading ? 'กำลังส่ง...' : 'ส่งรายงาน'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default ReportModal
