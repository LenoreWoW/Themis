import React, { useState, useEffect } from 'react';
import { Box, Tooltip, IconButton, CircularProgress, Typography } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import useLocalizedText from '../../hooks/useLocalizedText';

interface DynamicTranslationProps {
  content: string;
  originalLanguage?: string;
  maxLength?: number;
  showTranslationIcon?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Component for dynamically translating user-generated content that might not be in both languages.
 * 
 * This handles cases where content is authored in one language (English or Arabic) and
 * needs to be machine-translated when viewed in the other language.
 */
const DynamicTranslation: React.FC<DynamicTranslationProps> = ({
  content,
  originalLanguage,
  maxLength = 0,
  showTranslationIcon = true,
  className,
  style
}) => {
  const { currentLang, isRTL, getTextClass } = useLocalizedText();
  const [translatedContent, setTranslatedContent] = useState<string>(content);
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [shouldTranslate, setShouldTranslate] = useState<boolean>(false);
  
  // Try to detect the language if not provided
  const detectLanguage = (text: string): string => {
    // Simple language detection based on character codes
    // Arabic Unicode range: U+0600 to U+06FF
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text) ? 'ar' : 'en';
  };
  
  const actualOriginalLanguage = originalLanguage || detectLanguage(content);
  const needsTranslation = actualOriginalLanguage !== currentLang && content.trim().length > 0;
  
  // Truncate content if maxLength is provided
  const displayContent = maxLength > 0 && translatedContent.length > maxLength
    ? `${translatedContent.substring(0, maxLength)}...`
    : translatedContent;
  
  // Mock translation function (in production, this would call a real translation API)
  const translateContent = async () => {
    setIsTranslating(true);
    
    try {
      // In a real implementation, this would be an API call to a translation service
      // For demo purposes, we're just simulating a delay and adding a prefix
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Pretend translation
      const translated = isRTL
        ? `${content} [مترجم]` // Add Arabic "translated" marker
        : `[Translated] ${content}`; // Add English "translated" marker
      
      setTranslatedContent(translated);
      setIsTranslated(true);
    } catch (error) {
      console.error('Translation failed:', error);
      // On error, keep showing original content
    } finally {
      setIsTranslating(false);
    }
  };
  
  // Handle translation button click
  const handleTranslateClick = () => {
    setShouldTranslate(true);
  };
  
  // Effect to perform translation when needed
  useEffect(() => {
    if (shouldTranslate && needsTranslation && !isTranslated) {
      translateContent();
    }
  }, [shouldTranslate, needsTranslation, isTranslated]);
  
  // If content is in the current language or empty, just render it directly
  if (!needsTranslation || content.trim() === '') {
    return (
      <span className={getTextClass(className)} style={style}>
        {content}
      </span>
    );
  }
  
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }} className={className} style={style}>
      <Typography component="span" className={getTextClass()}>
        {isTranslating ? (
          <span style={{ color: 'gray', fontStyle: 'italic' }}>
            {isRTL ? 'جاري الترجمة...' : 'Translating...'}
          </span>
        ) : (
          displayContent
        )}
      </Typography>
      
      {showTranslationIcon && !isTranslated && (
        <Tooltip title={isRTL ? 'ترجم المحتوى' : 'Translate content'}>
          <span>
            <IconButton
              size="small"
              color="primary"
              onClick={handleTranslateClick}
              disabled={isTranslating}
              sx={{ ml: 0.5, opacity: 0.7 }}
            >
              {isTranslating ? (
                <CircularProgress size={16} />
              ) : (
                <TranslateIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
};

export default DynamicTranslation; 