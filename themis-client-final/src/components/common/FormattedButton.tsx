import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { humanizeLabel } from '../../utils/humanizeLabel';

/**
 * Props for the FormattedButton component
 */
export interface FormattedButtonProps extends Omit<ButtonProps, 'children'> {
  /**
   * The label to display on the button, which can be a regular string or a dotted format
   * that will be humanized (e.g., "save.report" becomes "Save Report")
   */
  label: string;
}

/**
 * A button component that automatically formats dotted labels like "save.report" 
 * into human-readable format like "Save Report"
 */
export const FormattedButton: React.FC<FormattedButtonProps> = ({ 
  label,
  ...buttonProps
}) => {
  const formattedLabel = humanizeLabel(label);

  return (
    <Button {...buttonProps}>
      {formattedLabel}
    </Button>
  );
}; 