import { Chip } from '@mui/material'

const RequestStatusBadge = ({ status, size = 'small' }) => {
  let color = 'default'
  let label = 'ไม่ทราบสถานะ'

  switch (status) {
    case 'pending':
      color = 'warning'
      label = 'รอการพิจารณา'
      break
    case 'approved':
      color = 'success'
      label = 'อนุมัติแล้ว'
      break
    case 'rejected':
      color = 'error'
      label = 'ปฏิเสธแล้ว'
      break
    case 'cancelled':
      color = 'default'
      label = 'ยกเลิก'
      break
  }

  return <Chip label={label} color={color} size={size} variant="filled" />
}

export default RequestStatusBadge
