import React from 'react';
import { Card, CardContent, Skeleton, Box, Stack } from '@mui/material';

const PetSkeleton = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ position: 'relative' }}>
        <Skeleton variant="rectangular" height={200} />
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: '70%' }} />
        
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Skeleton variant="text" sx={{ width: '40%' }} />
          <Skeleton variant="text" sx={{ width: '20%' }} />
        </Stack>

        <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 'auto', pt: 1 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" sx={{ width: '50%' }} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PetSkeleton;
