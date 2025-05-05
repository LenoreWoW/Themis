import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { useTranslation } from 'react-i18next';
import { getBilingualContent, translateUserInput } from '../utils/translate-user-input';

/**
 * A component to display bilingual content in the current language
 * with the ability to toggle to the other language
 */
const BilingualContentDisplay = ({
  contentKey,
  content,
  variant = 'body1',
  component = 'div',
  sx = {},
  showTranslateButton = true
}) => {
  const { i18n } = useTranslation();
  const [displayContent, setDisplayContent] = useState('');
  const [alternateContent, setAlternateContent] = useState('');
  const [showAlternate, setShowAlternate] = useState(false);
  const [contentLanguage, setContentLanguage] = useState(i18n.language);
  const [alternateLanguage, setAlternateLanguage] = useState(i18n.language === 'ar' ? 'en' : 'ar');

  // Set initial content based on saved bilingual content or passed content
  useEffect(() => {
    const fetchContent = async () => {
      // Try to get saved bilingual content first
      if (contentKey) {
        const saved = getBilingualContent(contentKey);
        if (saved) {
          setDisplayContent(saved);
          // Set content language to current UI language
          setContentLanguage(i18n.language);
          setAlternateLanguage(i18n.language === 'ar' ? 'en' : 'ar');
          
          // Try to get the alternate language version
          const alternateKey = `${contentKey}_${alternateLanguage}`;
          const alternate = getBilingualContent(alternateKey);
          if (alternate) {
            setAlternateContent(alternate);
          } else {
            // If no alternate saved, generate one
            const translated = await translateUserInput(saved, alternateLanguage);
            setAlternateContent(translated);
          }
          return;
        }
      }
      
      // Fall back to passed content if no saved content
      if (content) {
        setDisplayContent(content);
        // Try to translate the content to the other language
        const translated = await translateUserInput(content, alternateLanguage);
        setAlternateContent(translated);
      }
    };
    
    fetchContent();
  }, [contentKey, content, i18n.language, alternateLanguage]);

  // Toggle between languages
  const handleToggleLanguage = () => {
    setShowAlternate(!showAlternate);
  };

  if (!displayContent) return null;

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <Typography 
        variant={variant} 
        component={component} 
        sx={{ 
          direction: showAlternate 
            ? (contentLanguage === 'ar' ? 'ltr' : 'rtl') 
            : (contentLanguage === 'ar' ? 'rtl' : 'ltr')
        }}
      >
        {showAlternate ? alternateContent : displayContent}
      </Typography>
      
      {showTranslateButton && (alternateContent || displayContent) && (
        <Tooltip title={showAlternate ? "Show original" : "Show translation"}>
          <IconButton 
            onClick={handleToggleLanguage}
            size="small"
            sx={{ 
              position: 'absolute', 
              top: -10, 
              right: -10,
              backgroundColor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <TranslateIcon fontSize="small" color={showAlternate ? 'primary' : 'action'} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default BilingualContentDisplay; 