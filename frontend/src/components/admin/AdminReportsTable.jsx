import { useState, useEffect } from 'react'
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Typography, Chip, Box, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, RadioGroup, FormControlLabel, Radio, FormControl,
  FormLabel, Tabs, Tab, Stack, Alert, CircularProgress, Tooltip
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import FlagIcon from '@mui/icons-material/Flag'
import EditNoteIcon from '@mui/icons-material/EditNote'
import { useNavigate } from 'react-router-dom'
import { getReports, updateReportStatus } from '../../services/adminService'
import { deletePet } from '../../services/petService'
import { useToast } from '../../contexts/ToastContext'
import { formatBangkokDate, formatBangkokTime } from '../../utils/dateUtils'

const REASON_MAP = {
  spam: { label: 'สแปม/ข้อมูลเท็จ', color: 'default' },
  inappropriate: { label: 'เนื้อหาไม่เหมาะสม', color: 'error' },
  scam: { label: 'หลอกลวง/ฉ้อโกง', color: 'error' },
  abuse: { label: 'ทารุณกรรมสัตว์', color: 'error' },
  duplicate: { label: 'ประกาศซ้ำ', color: 'warning' },
  other: { label: 'อื่นๆ', color: 'default' }
}

const STATUS_MAP = {
  pending: { label: 'รอดำเนินการ', color: 'warning' },
  resolved: { label: 'จัดการแล้ว', color: 'success' },
  dismissed: { label: 'ละเว้น', color: 'default' }
}

const AdminReportsTable = ({ onReportsUpdated }) => {
  const navigate = useNavigate()
  const showToast = useToast()
  
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  // Manage Dialog State
  const [selectedReport, setSelectedReport] = useState(null)
  const [actionStatus, setActionStatus] = useState('resolved')
  const [adminNotes, setAdminNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [statusFilter])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await getReports(statusFilter === 'all' ? null : statusFilter)
      if (res.success) {
        setReports(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch reports', error)
      showToast('เกิดข้อผิดพลาดในการโหลดรายการรายงาน', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenActionDialog = (report) => {
    setSelectedReport(report)
    setActionStatus(report.status === 'pending' ? 'resolved' : report.status)
    setAdminNotes(report.admin_notes || '')
  }

  const handleCloseActionDialog = () => {
    setSelectedReport(null)
    setAdminNotes('')
  }

  const handleUpdateStatus = async () => {
    if (!selectedReport) return

    try {
      setSubmitting(true)
      const res = await updateReportStatus(selectedReport.id, {
        status: actionStatus,
        admin_notes: adminNotes
      })

      if (res.success) {
        showToast('อัปเดตสถานะรายงานเรียบร้อยแล้ว')
        handleCloseActionDialog()
        fetchReports()
        if (onReportsUpdated) onReportsUpdated()
      }
    } catch (error) {
      console.error('Failed to update report status', error)
      showToast('เกิดข้อผิดพลาดในการอัปเดตสถานะรายงาน', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleHideListing = async (listingId, petName) => {
    if (window.confirm(`คุณต้องการซ่อน/ระงับประกาศ "${petName}" ใช่หรือไม่?`)) {
      try {
        const res = await deletePet(listingId)
        if (res.success) {
          showToast(`ซ่อนประกาศ "${petName}" สำเร็จ`)
          fetchReports()
        }
      } catch (error) {
        console.error('Failed to hide pet listing', error)
        showToast('เกิดข้อผิดพลาดในการซ่อนประกาศ', 'error')
      }
    }
  }

  return (
    <Box>
      {/* Sub-tabs filter */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={statusFilter} 
          onChange={(e, val) => setStatusFilter(val)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="ทั้งหมด" value="all" />
          <Tab label="รอดำเนินการ" value="pending" />
          <Tab label="จัดการแล้ว" value="resolved" />
          <Tab label="ละเว้น" value="dismissed" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <FlagIcon color="action" sx={{ fontSize: 48, mb: 1 }} />
          <Typography color="text.secondary">ไม่พบรายการรายงานในหมวดหมู่นี้</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell>วันที่แจ้ง</TableCell>
                <TableCell>ประกาศที่ถูกรายงาน</TableCell>
                <TableCell>ผู้รายงาน</TableCell>
                <TableCell>เหตุผล & รายละเอียด</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell align="right">การจัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="body2">
                      {formatBangkokDate(item.created_at)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatBangkokTime(item.created_at)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {item.pet_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      เจ้าของ: {item.owner_name}
                    </Typography>
                    {item.pet_is_hidden ? (
                      <Box sx={{ mt: 0.5 }}>
                        <Chip label="ประกาศถูกซ่อนแล้ว" size="small" color="error" variant="outlined" />
                      </Box>
                    ) : null}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{item.reporter_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.reporter_email}</Typography>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 280 }}>
                    <Box sx={{ mb: 0.5 }}>
                      <Chip
                        label={REASON_MAP[item.reason]?.label || item.reason}
                        size="small"
                        color={REASON_MAP[item.reason]?.color || 'default'}
                      />
                    </Box>
                    {item.details && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        "{item.details}"
                      </Typography>
                    )}
                    {item.admin_notes && (
                      <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                        บันทึกแอดมิน: {item.admin_notes}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={STATUS_MAP[item.status]?.label || item.status}
                      size="small"
                      color={STATUS_MAP[item.status]?.color || 'default'}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="เปิดดูประกาศ">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => navigate(`/listings/${item.listing_id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {!item.pet_is_hidden && (
                        <Tooltip title="ซ่อน/ระงับประกาศ">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleHideListing(item.listing_id, item.pet_name)}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditNoteIcon />}
                        onClick={() => handleOpenActionDialog(item)}
                      >
                        จัดการ
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Dialog */}
      {selectedReport && (
        <Dialog open={true} onClose={handleCloseActionDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            จัดการสถานะรายงาน #{selectedReport.id}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                ประกาศ: <strong>{selectedReport.pet_name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เหตุผลที่รายงาน: <strong>{REASON_MAP[selectedReport.reason]?.label || selectedReport.reason}</strong>
              </Typography>
              {selectedReport.details && (
                <Typography variant="body2" color="text.secondary">
                  รายละเอียด: "{selectedReport.details}"
                </Typography>
              )}
            </Box>

            <FormControl component="fieldset" fullWidth sx={{ mb: 2.5 }}>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
                เลือกการดำเนินการ
              </FormLabel>
              <RadioGroup
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value)}
              >
                <FormControlLabel
                  value="resolved"
                  control={<Radio color="success" />}
                  label="ทำเครื่องหมายว่าจัดการเรียบร้อยแล้ว (Resolved)"
                />
                <FormControlLabel
                  value="dismissed"
                  control={<Radio color="default" />}
                  label="ละเว้น / ปฏิเสธรายงานนี้ (Dismissed)"
                />
                <FormControlLabel
                  value="pending"
                  control={<Radio color="warning" />}
                  label="เปลี่ยนกลับเป็นรอดำเนินการ (Pending)"
                />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              label="บันทึกหรือหมายเหตุของแอดมิน (Admin Notes)"
              placeholder="เช่น ได้ตรวจสอบแล้ว ประกาศมีภาพไม่เหมาะสม จึงได้ทำการซ่อนประกาศ..."
              multiline
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseActionDialog} disabled={submitting} color="inherit">
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateStatus}
              disabled={submitting}
              color="primary"
            >
              {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}

export default AdminReportsTable
