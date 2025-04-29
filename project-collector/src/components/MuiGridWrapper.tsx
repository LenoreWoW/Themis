import React from 'react';
import { Grid, GridProps } from '@mui/material';

interface GridContainerProps extends GridProps {
  children: React.ReactNode;
}

interface GridItemProps extends GridProps {
  children: React.ReactNode;
}

export const GridContainer: React.FC<GridContainerProps> = ({ children, ...props }) => {
  return (
    <Grid container {...props}>
      {children}
    </Grid>
  );
};

export const GridItem: React.FC<GridItemProps> = ({ children, ...props }) => {
  return (
    <Grid item {...props}>
      {children}
    </Grid>
  );
}; 