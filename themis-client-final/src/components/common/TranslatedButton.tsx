import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Common button texts that should be translated
type CommonButtonText = 
  'submit' | 'cancel' | 'save' | 'delete' | 'edit' | 'add' | 'close' | 
  'next' | 'previous' | 'ok' | 'yes' | 'no' | 'back' | 'continue' | 
  'approve' | 'reject' | 'apply' | 'confirm' | 'done';

interface TranslatedButtonProps extends Omit<ButtonProps, 'children'> {
  text: CommonButtonText | string;
  children?: React.ReactNode;
}

/**
 * A button component that automatically translates common button labels
 */
const TranslatedButton: React.FC<TranslatedButtonProps> = ({ 
  text,
  children,
  ...buttonProps 
}) => {
  const { t } = useTranslation();
  
  // Check if the text is a common button text that needs translation
  const isCommonText = [
    'submit', 'cancel', 'save', 'delete', 'edit', 'add', 'close',
    'next', 'previous', 'ok', 'yes', 'no', 'back', 'continue',
    'approve', 'reject', 'apply', 'confirm', 'done'
  ].includes(text.toLowerCase());
  
  // If it's a common text, use the translation
  const buttonText = isCommonText 
    ? t(`common.${text.toLowerCase()}`) 
    : text;
  
  return (
    <Button {...buttonProps}>
      {children || buttonText}
    </Button>
  );
};

export default TranslatedButton; 