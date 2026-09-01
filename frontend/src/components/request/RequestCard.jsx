import { Card, CardContent, Typography, Box, Avatar, Stack, Button, Divider } from '@mui/material'
import RequestStatusBadge from './RequestStatusBadge'
import { useNavigate } from 'react-router-dom'

const RequestCard = ({ request, type = 'incoming', onApprove, onReject, onCancel }) => {
  const navigate = useNavigate()

  return (
    <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
      <CardContent>
        {type === 'incoming' ? (
          // View for the pet owner (incoming requests)
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={request.adopter_avatar} sx={{ width: 48, height: 48 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>{request.adopter_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ส่งคำขอเมื่อ: {new Date(request.created_at).toLocaleDateString('th-TH')}
                  </Typography>
                </Box>
              </Box>
              <RequestStatusBadge status={request.status} />
            </Box>
            
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>ข้อความแนะนำตัว:</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{request.message}</Typography>
            </Box>

            {request.status === 'pending' && (
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" color="error" onClick={() => onReject(request.id)}>
                  ปฏิเสธ
                </Button>
                <Button variant="contained" color="success" onClick={() => onApprove(request.id)}>
                  อนุมัติ
                </Button>
              </Stack>
            )}
          </>
        ) : (
          // View for the adopter (outgoing requests)
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            <Avatar 
              src={request.pet_image || 'https://placehold.co/100x100?text=Pet'} 
              variant="rounded" 
              sx={{ width: 80, height: 80 }} 
            />
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {request.pet_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ส่งคำขอเมื่อ: {new Date(request.created_at).toLocaleDateString('th-TH')}
                  </Typography>
                </Box>
                <RequestStatusBadge status={request.status} />
              </Box>

              <Divider sx={{ my: 1.5 }} />
              
              <Typography variant="body2" color="text.secondary" noWrap>
                ข้อความของคุณ: {request.message}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate(`/listings/${request.listing_id}`)}>
                  ดูประกาศ
                </Button>
                {request.status === 'pending' && (
                  <Button variant="outlined" color="error" onClick={() => onCancel(request.id)}>
                    ยกเลิกคำขอ
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default RequestCard
