import React from 'react';
import { Box } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface GridItemProps {
  children: React.ReactNode;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  sx?: SxProps<Theme>;
}

export const GridItem: React.FC<GridItemProps> = (props) => {
  const { children, xs, sm, md, lg, xl, sx, ...rest } = props;
  
  // Determine flex basis based on columns (12 grid system)
  const getFlexBasis = (columns: number | boolean | undefined) => {
    if (columns === undefined) return undefined;
    if (columns === true) return '0 0 auto';
    if (columns === false) return undefined;
    return `${(columns / 12) * 100}%`;
  };

  return (
    <Box
      sx={{
        flexGrow: 0,
        flexBasis: {
          xs: getFlexBasis(xs),
          sm: getFlexBasis(sm),
          md: getFlexBasis(md),
          lg: getFlexBasis(lg),
          xl: getFlexBasis(xl),
        },
        maxWidth: {
          xs: xs ? (xs === true ? '100%' : `${(Number(xs) / 12) * 100}%`) : undefined,
          sm: sm ? (sm === true ? '100%' : `${(Number(sm) / 12) * 100}%`) : undefined,
          md: md ? (md === true ? '100%' : `${(Number(md) / 12) * 100}%`) : undefined,
          lg: lg ? (lg === true ? '100%' : `${(Number(lg) / 12) * 100}%`) : undefined,
          xl: xl ? (xl === true ? '100%' : `${(Number(xl) / 12) * 100}%`) : undefined,
        },
        ...sx
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export const GridContainer: React.FC<{
  children: React.ReactNode;
  spacing?: number;
  sx?: SxProps<Theme>;
}> = ({ children, spacing = 2, sx, ...rest }) => {
  // Convert spacing to margin/padding
  const gap = spacing * 8; // MUI spacing unit is 8px
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${gap}px`,
        width: '100%',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}; 