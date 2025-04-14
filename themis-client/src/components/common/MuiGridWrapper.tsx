import React from 'react';
import { Grid, GridProps } from '@mui/material';

export interface CustomGridProps extends GridProps {
  item?: boolean;
  container?: boolean;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  spacing?: number;
}

export const MuiGridWrapper: React.FC<CustomGridProps & { children?: React.ReactNode }> = (props) => {
  return <Grid {...props} />;
};

export default MuiGridWrapper; 