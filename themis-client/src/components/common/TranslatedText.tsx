import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { useTranslation } from 'react-i18next';

interface TranslatedTextProps {
  text: string;
  originalText?: string;
  variant?: 'body1' | 'body2' | 'caption' | 'subtitle1' | 'subtitle2';
  color?: string;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  originalText,
  variant = 'body1',
  color
}) => {
  const { i18n } = useTranslation();
  const [showOriginal, setShowOriginal] = useState(false);
  const isArabic = i18n.language === 'ar';

  const handleToggleOriginal = () => {
    setShowOriginal(!showOriginal);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography 
        variant={variant} 
        color={color}
        sx={{ 
          direction: isArabic ? 'rtl' : 'ltr',
          textAlign: isArabic ? 'right' : 'left'
        }}
      >
        {showOriginal ? originalText || text : text}
      </Typography>
      {originalText && (
        <Tooltip title={showOriginal ? "Show translated text" : "Show original text"}>
          <IconButton 
            size="small" 
            onClick={handleToggleOriginal}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <TranslateIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default TranslatedText; 