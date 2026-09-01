import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyState = ({ 
  icon = 'search', // 'search' or 'inbox'
  title = 'ไม่พบข้อมูล',
  description = 'ไม่มีข้อมูลที่ตรงกับเงื่อนไขการค้นหา',
  actionText,
  onAction
}) => {
  const IconComponent = icon === 'search' ? SearchOffIcon : InboxIcon;

  return (
    <Box sx={{ py: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <IconComponent sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Box>
        <Typography variant="h6" color="text.primary" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      </Box>
      
      {actionText && onAction && (
        <Button variant="outlined" color="primary" onClick={onAction} sx={{ mt: 2 }}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
