import React, { ReactNode } from 'react';
import { Grid, Box, SxProps, Theme } from '@mui/material';

interface GridContainerProps {
  children: ReactNode;
  spacing?: number;
  sx?: SxProps<Theme>;
}

interface GridItemProps {
  children: ReactNode;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  sx?: SxProps<Theme>;
}

export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  spacing = 2,
  sx = {},
}) => {
  return (
    <Grid container spacing={spacing} sx={sx}>
      {children}
    </Grid>
  );
};

export const GridItem: React.FC<GridItemProps> = ({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  sx = {},
}) => {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl} sx={sx}>
      <Box sx={sx}>
        {children}
      </Box>
    </Grid>
  );
};

// Mark this as a module
export {}; 