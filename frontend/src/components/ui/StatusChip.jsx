import { Chip } from '@mui/material'

// ป้ายสถานะประกาศ ใช้ร่วมกันทุกหน้า เพื่อให้คำที่ผู้ใช้เห็นตรงกันเสมอ
const PET_STATUS = {
  available: { label: 'หาบ้าน', color: 'success' },
  pending: { label: 'รอพิจารณา', color: 'warning' },
  adopted: { label: 'ได้บ้านแล้ว', color: 'info' },
  closed: { label: 'ปิดรับ', color: 'error' }
}

// แปลงรหัสสถานะเป็นข้อความภาษาไทย (ใช้ตอนที่ต้องแสดงเป็นข้อความธรรมดา ไม่ใช่ Chip)
export const getPetStatusLabel = (status) => PET_STATUS[status]?.label || 'ไม่ระบุ'

// ประกาศที่ไม่รับคำขอเพิ่มแล้ว — ทั้งกรณีได้บ้านแล้วและกรณีเจ้าของปิดเอง
export const isListingClosed = (status) => status === 'adopted' || status === 'closed'

const StatusChip = ({ status, size = 'small' }) => {
  const { label, color } = PET_STATUS[status] || { label: 'ไม่ระบุ', color: 'default' }

  return <Chip label={label} color={color} size={size} variant="outlined" />
}

export default StatusChip
