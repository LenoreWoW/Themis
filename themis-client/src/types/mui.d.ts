import '@mui/material/Grid';
import { ElementType } from 'react';

declare module '@mui/material/Grid' {
  interface GridProps {
    item?: boolean;
    container?: boolean;
    xs?: number | boolean;
    sm?: number | boolean;
    md?: number | boolean;
    lg?: number | boolean;
    xl?: number | boolean;
    spacing?: number;
    component?: ElementType;
  }
}

declare module '@mui/material' {
  interface SelectProps {
    onChange?: (event: any, child: any) => void;
  }
} 