import React, { useState, useEffect } from 'react';
import { TextField, Box, Typography, IconButton, Tooltip } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { useTranslation } from 'react-i18next';
import { 
  detectLanguage, 
  translateUserInput, 
  storeBilingualContent, 
  getBilingualContent 
} from '../utils/translate-user-input';

/**
 * A component for handling bilingual input
 * Automatically translates user input and stores both language versions
 */
const BilingualInput = ({
  id,
  label,
  contentKey,
  initialValue = '',
  placeholder = '',
  multiline = false,
  rows = 1,
  fullWidth = true,
  required = false,
  helperText = '',
  onChange,
  ...props
}) => {
  const { t, i18n } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const [translatedValue, setTranslatedValue] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [inputLanguage, setInputLanguage] = useState(i18n.language);
  const [isTranslating, setIsTranslating] = useState(false);

  // Load existing bilingual content if available
  useEffect(() => {
    if (contentKey) {
      const savedContent = getBilingualContent(contentKey);
      if (savedContent) {
        setValue(savedContent);
      }
    }
  }, [contentKey]);
  
  // Update the displayed value when language changes
  useEffect(() => {
    if (contentKey) {
      const savedContent = getBilingualContent(contentKey);
      if (savedContent) {
        setValue(savedContent);
      }
    }
  }, [contentKey, i18n.language]);

  // Handle input change
  const handleChange = async (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Call the parent onChange if provided
    if (onChange) {
      onChange(e);
    }
    
    // Detect the language of input
    if (newValue.trim()) {
      const detectedLang = await detectLanguage(newValue);
      setInputLanguage(detectedLang);
      
      // Generate and store translation
      if (contentKey) {
        storeBilingualContent(contentKey, newValue, detectedLang);
      }
    }
  };
  
  // Handle viewing translation
  const handleViewTranslation = async () => {
    if (!value.trim()) return;
    
    setIsTranslating(true);
    try {
      // Determine target language (opposite of input language)
      const targetLang = inputLanguage === 'ar' ? 'en' : 'ar';
      const translated = await translateUserInput(value, targetLang);
      setTranslatedValue(translated);
      setShowTranslation(true);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };
  
  // Toggle back to original input
  const handleHideTranslation = () => {
    setShowTranslation(false);
  };

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        id={id}
        label={label}
        value={showTranslation ? translatedValue : value}
        onChange={handleChange}
        placeholder={placeholder}
        multiline={multiline}
        rows={rows}
        fullWidth={fullWidth}
        required={required}
        helperText={helperText}
        disabled={showTranslation}
        InputProps={{
          sx: { 
            direction: showTranslation 
              ? (inputLanguage === 'ar' ? 'ltr' : 'rtl') 
              : (inputLanguage === 'ar' ? 'rtl' : 'ltr')
          }
        }}
        {...props}
      />
      
      {value && (
        <Tooltip title={showTranslation ? t('common.showOriginal') : t('common.showTranslation')}>
          <IconButton
            onClick={showTranslation ? handleHideTranslation : handleViewTranslation}
            sx={{ position: 'absolute', top: 8, right: 8 }}
            disabled={isTranslating}
          >
            <TranslateIcon color={showTranslation ? 'primary' : 'action'} />
          </IconButton>
        </Tooltip>
      )}
      
      {showTranslation && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          {inputLanguage === 'ar' ? 'English translation' : 'الترجمة العربية'}
        </Typography>
      )}
    </Box>
  );
};

export default BilingualInput; 