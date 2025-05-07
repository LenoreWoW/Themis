import React, { useEffect } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import Canvas from '../../components/Canvas';
import { useDispatch } from 'react-redux';
import { clearSelection } from '../../store/slices/canvasSlice';

/**
 * Ideation Canvas Page
 * 
 * A page component that displays the full-screen canvas for ideation
 */
const IdeationCanvasPage: React.FC = () => {
  const dispatch = useDispatch();
  
  // Reset canvas selection when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSelection());
    };
  }, [dispatch]);
  
  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 88px)', py: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Ideation Canvas</Typography>
      </Box>
      
      <Paper 
        elevation={2} 
        sx={{ 
          height: 'calc(100% - 48px)', 
          borderRadius: 1, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Canvas />
      </Paper>
    </Container>
  );
};

export default IdeationCanvasPage; 