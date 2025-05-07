import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Canvas from '../components/Canvas';

/**
 * Canvas Screen
 * 
 * A full-screen container for the Canvas component
 */
const CanvasScreen: React.FC = () => {
  return (
    <Container maxWidth={false} sx={{ height: 'calc(100vh - 64px)', py: 2 }}>
      <Typography variant="h4" gutterBottom>Ideation Canvas</Typography>
      <Box sx={{ height: 'calc(100% - 48px)', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <Canvas />
      </Box>
    </Container>
  );
};

export default CanvasScreen; 