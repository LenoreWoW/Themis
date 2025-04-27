import React from 'react';
import { Typography, TypographyProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface TranslatedTextProps extends Omit<TypographyProps, 'children'> {
  textKey: string;
  vars?: Record<string, string | number>;
}

/**
 * A Typography component that automatically translates text using the provided key
 */
const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  textKey,
  vars,
  ...typographyProps 
}) => {
  const { t } = useTranslation();
  
  return (
    <Typography {...typographyProps}>
      {t(textKey, vars)}
    </Typography>
  );
};

export default TranslatedText; 