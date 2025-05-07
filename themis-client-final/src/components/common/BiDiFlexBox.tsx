import React from 'react';
import { Box, BoxProps, useTheme } from '@mui/material';

interface BiDiFlexBoxProps extends Omit<BoxProps, 'dir'> {
  // Override for default flex direction in LTR mode
  ltrDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  // If true, responsive alignment and padding will be applied
  responsive?: boolean;
  // Children components
  children: React.ReactNode;
}

/**
 * A flexible box component that automatically handles RTL/LTR layout differences
 * This makes it easier to build layouts that work correctly in both Arabic and English
 */
const BiDiFlexBox: React.FC<BiDiFlexBoxProps> = ({
  ltrDirection = 'row',
  responsive = true,
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  // Determine the flex direction based on language direction
  const getFlexDirection = () => {
    // For horizontal layouts, we need to reverse in RTL mode
    if (ltrDirection === 'row') return isRtl ? 'row-reverse' : 'row';
    if (ltrDirection === 'row-reverse') return isRtl ? 'row' : 'row-reverse';
    
    // For vertical layouts, no change needed
    return ltrDirection;
  };

  // Get text alignment based on direction
  const getTextAlign = () => {
    if (!responsive) return 'inherit';
    return isRtl ? 'right' : 'left';
  };

  // Get padding adjustments based on direction
  const getPadding = () => {
    if (!responsive) return {};
    
    if (ltrDirection === 'row' || ltrDirection === 'row-reverse') {
      return {
        pl: isRtl ? 0 : 2,
        pr: isRtl ? 2 : 0
      };
    }
    
    return {};
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: getFlexDirection(),
        textAlign: getTextAlign(),
        ...getPadding(),
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default BiDiFlexBox; 