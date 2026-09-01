import { Chip } from '@mui/material'

const StatusChip = ({ status, size = 'small' }) => {
  let color = 'default'
  let label = 'ไม่ระบุ'

  switch (status) {
    case 'available':
      color = 'success'
      label = 'หาบ้าน'
      break
    case 'pending':
      color = 'warning'
      label = 'รอพิจารณา'
      break
    case 'adopted':
      color = 'info'
      label = 'ได้บ้านแล้ว'
      break
    case 'closed':
      color = 'error'
      label = 'ปิดรับ'
      break
  }

  return <Chip label={label} color={color} size={size} variant="outlined" />
}

export default StatusChip
