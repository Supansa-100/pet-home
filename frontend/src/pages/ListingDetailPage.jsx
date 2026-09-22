import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Typography, Box, Grid, Paper, Button, Divider, Avatar, Stack, Chip, CircularProgress, Alert } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PetsIcon from '@mui/icons-material/Pets'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'

import PetImageGallery from '../components/pet/PetImageGallery'
import StatusChip, { isListingClosed } from '../components/ui/StatusChip'
import RequestForm from '../components/request/RequestForm'
import ReportModal from '../components/pet/ReportModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { getPetById, updatePetStatus, deletePet } from '../services/petService'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import BackButton from '../components/ui/BackButton'
import { formatBangkokDate } from '../utils/dateUtils'

const ListingDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const showToast = useToast()
  
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', title: '', content: '' })

  useEffect(() => {
    const fetchPetDetail = async () => {
      try {
        const res = await getPetById(id)
        if (res.success) {
          setPet(res.data)
        }
      } catch (error) {
        console.error('Error fetching pet details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPetDetail()
  }, [id])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!pet) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" color="error">ไม่พบข้อมูลสัตว์เลี้ยง</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/listings')}>กลับไปหน้ารวมประกาศ</Button>
      </Container>
    )
  }

  const isOwner = user && user.id === pet.user_id

  const handleAction = async () => {
    try {
      if (confirmDialog.type === 'close') {
        const res = await updatePetStatus(id, { status: 'closed' })
        if (res.success) {
          showToast('ปิดประกาศเรียบร้อยแล้ว')
          setPet(prev => ({ ...prev, status: 'closed' }))
        }
      } else if (confirmDialog.type === 'delete') {
        const res = await deletePet(id)
        if (res.success) {
          showToast('ลบประกาศเรียบร้อยแล้ว')
          navigate('/my-listings')
        }
      }
    } catch (err) {
      console.error(err)
      showToast('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error')
    } finally {
      setConfirmDialog({ open: false, type: '', title: '', content: '' })
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <BackButton fallbackPath="/listings" label="กลับไปหน้ารวมประกาศ" />
      <Grid container spacing={4}>
        {/* Left Column: Images */}
        <Grid item xs={12} md={7}>
          <PetImageGallery images={pet.images || []} />
        </Grid>

        {/* Right Column: Details */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h3" component="h1" fontWeight={700}>
                {pet.name}
              </Typography>
              <StatusChip status={pet.status} size="medium" />
            </Box>

            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Chip icon={<PetsIcon />} label={pet.category_name} variant="outlined" />
              {pet.breed && <Chip label={pet.breed} variant="outlined" />}
              <Chip label={pet.gender === 'male' ? 'ตัวผู้' : pet.gender === 'female' ? 'ตัวเมีย' : 'ไม่ระบุเพศ'} variant="outlined" />
              <Chip label={`ขนาด${pet.size === 'small' ? 'เล็ก' : pet.size === 'medium' ? 'กลาง' : 'ใหญ่'}`} variant="outlined" />
              {pet.age_years > 0 || pet.age_months > 0 ? (
                <Chip label={`อายุ ${pet.age_years ? pet.age_years + ' ปี ' : ''}${pet.age_months ? pet.age_months + ' เดือน' : ''}`} variant="outlined" />
              ) : null}
            </Stack>

            <Stack direction="row" alignItems="center" gap={1} color="text.secondary" sx={{ mb: 4 }}>
              <LocationOnIcon />
              <Typography variant="body1">{pet.location || 'ไม่ระบุพื้นที่'}</Typography>
            </Stack>

            {/* Actions */}
            <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar src={pet.owner_avatar} sx={{ width: 56, height: 56 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>{pet.owner_name}</Typography>
                  <Typography variant="body2" color="text.secondary">ลงประกาศเมื่อ {formatBangkokDate(pet.created_at)}</Typography>
                </Box>
              </Box>
              
              {/* แจ้งสถานะให้ชัดเจนทั้งฝั่งเจ้าของและผู้เข้าชม */}
              {isListingClosed(pet.status) && (
                <Alert severity={pet.status === 'adopted' ? 'success' : 'info'} sx={{ mb: 2 }}>
                  {pet.status === 'adopted'
                    ? `น้อง${pet.name} ได้รับบ้านใหม่แล้ว ประกาศนี้ปิดรับคำขออุปการะแล้ว`
                    : 'ประกาศนี้ถูกปิดรับคำขออุปการะแล้ว'}
                </Alert>
              )}

              {isOwner ? (
                <Stack spacing={2}>
                  <Button variant="contained" fullWidth onClick={() => navigate(`/listings/${pet.id}/requests`)}>
                    ดูคำขอรับอุปการะ
                  </Button>
                  <Button variant="outlined" fullWidth onClick={() => navigate(`/listings/${pet.id}/edit`)}>
                    แก้ไขประกาศของฉัน
                  </Button>
                  {/* ประกาศที่ได้บ้านแล้วถือว่าปิดรับไปแล้ว จึงไม่ต้องมีปุ่มปิดซ้ำ */}
                  {!isListingClosed(pet.status) && (
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      fullWidth 
                      onClick={() => setConfirmDialog({
                        open: true,
                        type: 'close',
                        title: 'ยืนยันการปิดประกาศ',
                        content: 'คุณแน่ใจหรือไม่ว่าต้องการปิดประกาศนี้? (เมื่อปิดแล้ว คนอื่นจะไม่สามารถขอรับอุปการะได้อีก)'
                      })}
                    >
                      ปิดประกาศ (ได้บ้านแล้ว)
                    </Button>
                  )}
                  <Button 
                    variant="text" 
                    color="error" 
                    fullWidth 
                    onClick={() => setConfirmDialog({
                      open: true,
                      type: 'delete',
                      title: 'ยืนยันการลบประกาศ',
                      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้? ข้อมูลจะถูกลบออกจากระบบและไม่สามารถกู้คืนได้'
                    })}
                  >
                    ลบประกาศ
                  </Button>
                </Stack>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="large" 
                    disabled={pet.status !== 'available'}
                    onClick={() => {
                      if (!user) {
                        navigate('/login')
                      } else {
                        setRequestModalOpen(true)
                      }
                    }}
                  >
                    {pet.status === 'available'
                      ? 'ขอรับอุปการะ'
                      : pet.status === 'adopted'
                        ? 'น้องได้บ้านใหม่แล้ว'
                        : 'ไม่สามารถขอรับอุปการะได้ในขณะนี้'}
                  </Button>
                  <Button
                    variant="text"
                    color="inherit"
                    size="small"
                    startIcon={<FlagOutlinedIcon fontSize="small" />}
                    sx={{ mt: 1.5, color: 'text.secondary', textTransform: 'none' }}
                    onClick={() => {
                      if (!user) {
                        navigate('/login')
                      } else {
                        setReportModalOpen(true)
                      }
                    }}
                  >
                    รายงานความไม่เหมาะสม
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Info Sections */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>รายละเอียดและนิสัย</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{pet.description || '-'}</Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <MedicalServicesIcon color="action" />
                <Typography variant="h6" fontWeight={600}>ประวัติสุขภาพและวัคซีน</Typography>
              </Stack>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{pet.health_info || '-'}</Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <CheckCircleOutlineIcon color="action" />
                <Typography variant="h6" fontWeight={600}>เงื่อนไขการรับเลี้ยง</Typography>
              </Stack>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{pet.conditions || '-'}</Typography>
            </Box>

          </Box>
        </Grid>
      </Grid>
      
      {requestModalOpen && (
        <RequestForm 
          open={requestModalOpen} 
          onClose={(success) => {
            setRequestModalOpen(false)
            if (success) {
              navigate('/my-requests')
            }
          }} 
          petId={pet.id} 
          petName={pet.name} 
        />
      )}

      {reportModalOpen && (
        <ReportModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          petId={pet.id}
          petName={pet.name}
        />
      )}
      
      <ConfirmDialog 
        open={confirmDialog.open}
        title={confirmDialog.title}
        content={confirmDialog.content}
        onConfirm={handleAction}
        onCancel={() => setConfirmDialog({ open: false, type: '', title: '', content: '' })}
      />
    </Container>
  )
}

export default ListingDetailPage

