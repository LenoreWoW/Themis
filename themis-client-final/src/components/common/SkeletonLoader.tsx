import React from 'react';
import { Skeleton, Box, Card, CardContent, Stack, useTheme } from '@mui/material';

interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'table' | 'chart';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 3 }) => {
  const theme = useTheme();
  
  const renderCardSkeleton = () => (
    <Card sx={{ 
      mb: 2, 
      borderRadius: 2,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      transition: 'transform 0.3s, box-shadow 0.3s',
    }}>
      <CardContent>
        <Skeleton variant="rectangular" width="60%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="80%" />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </CardContent>
    </Card>
  );

  const renderListSkeleton = () => (
    <Box sx={{ mb: 1, p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="column" spacing={1} width="100%">
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="80%" height={20} />
        </Stack>
        <Skeleton variant="circular" width={36} height={36} />
      </Box>
    </Box>
  );

  const renderTableSkeleton = () => (
    <Box>
      <Box sx={{ display: 'flex', p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Skeleton variant="rectangular" width="20%" height={20} sx={{ mr: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="30%" height={20} sx={{ mr: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="20%" height={20} sx={{ mr: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="30%" height={20} sx={{ borderRadius: 1 }} />
      </Box>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Skeleton variant="rectangular" width="100%" height={52} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );

  const renderChartSkeleton = () => (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="rectangular" width="100%" height={30} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={250} sx={{ borderRadius: 1 }} />
    </Box>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'chart':
        return renderChartSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <>
      {Array.from(new Array(count)).map((_, index) => (
        <Box key={index}>{renderSkeleton()}</Box>
      ))}
    </>
  );
};

export default SkeletonLoader; 