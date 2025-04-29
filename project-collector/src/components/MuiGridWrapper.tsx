import React from 'react';
import { Grid, GridTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

type GridComponent = OverridableComponent<GridTypeMap<{}, 'div'>>;

interface GridContainerProps {
  children: React.ReactNode;
  spacing?: number;
  sx?: any;
}

interface GridItemProps {
  children: React.ReactNode;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  sx?: any;
}

export const GridContainer: React.FC<GridContainerProps> = ({ children, spacing, sx }) => {
  const GridComponent = Grid as GridComponent;
  return (
    <GridComponent container spacing={spacing} sx={sx}>
      {children}
    </GridComponent>
  );
};

export const GridItem: React.FC<GridItemProps> = ({ children, xs, sm, md, lg, sx }) => {
  const GridComponent = Grid as GridComponent;
  return (
    <GridComponent item xs={xs} sm={sm} md={md} lg={lg} sx={sx}>
      {children}
    </GridComponent>
  );
}; 