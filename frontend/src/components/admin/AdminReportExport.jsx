import { useState } from 'react'
import { Paper, Typography, Button, Stack, Box, Alert, Snackbar } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import api from '../../services/api'

const REPORTS = [
  {
    type: 'user-growth',
    label: 'รายงานการเติบโตของสมาชิก',
    hint: 'ยอดสมัครสมาชิกใหม่แยกรายวัน'
  },
  {
    type: 'adoption-success',
    label: 'รายงานการหาบ้านสำเร็จ',
    hint: 'รายชื่อสัตว์ที่ได้บ้าน พร้อมจำนวนวันที่ใช้หาบ้าน'
  },
  {
    type: 'moderation',
    label: 'รายงานการตรวจสอบเนื้อหา',
    hint: 'ประวัติการรายงานและผลการจัดการของแอดมิน'
  }
]

const AdminReportExport = () => {
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState('')

  const handleDownload = async (report) => {
    setDownloading(report.type)
    setError('')

    try {
      // ขอไฟล์เป็น blob เพราะ response เป็น CSV ไม่ใช่ JSON
      const response = await api.get(`/admin/export/${report.type}`, { responseType: 'blob' })

      // สร้างลิงก์ชั่วคราวเพื่อสั่งให้เบราว์เซอร์ดาวน์โหลดไฟล์
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', `${report.type}-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()

      // คืนหน่วยความจำหลังดาวน์โหลดเสร็จ
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Failed to export report:', err)
      setError(`ดาวน์โหลด "${report.label}" ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 4 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        ส่งออกรายงาน (CSV)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        ดาวน์โหลดข้อมูลเพื่อนำไปวิเคราะห์ต่อใน Excel หรือ Google Sheets
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={2}>
        {REPORTS.map((report) => (
          <Box key={report.type}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled={downloading !== null}
              onClick={() => handleDownload(report)}
            >
              {downloading === report.type ? 'กำลังเตรียมไฟล์...' : report.label}
            </Button>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {report.hint}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
    </Paper>
  )
}

export default AdminReportExport
