import React from 'react';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { humanizeLabel } from '../../utils/humanizeLabel';

/**
 * Props for the FormattedText component
 */
export interface FormattedTextProps extends Omit<TypographyProps, 'children'> {
  /**
   * The text to display, which can be a regular string or a dotted format
   * that will be humanized (e.g., "save.report" becomes "Save Report")
   */
  text: string;
}

/**
 * A text component that automatically formats dotted labels like "save.report" 
 * into human-readable format like "Save Report"
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ 
  text,
  ...typographyProps
}) => {
  const formattedText = humanizeLabel(text);

  return (
    <Typography {...typographyProps}>
      {formattedText}
    </Typography>
  );
}; 