import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Button, 
  Typography,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { detectLanguage, translateUserInput, storeBilingualContent, getBilingualContent } from '../utils/translate-user-input';

/**
 * A rich text editor component that supports editing in both languages
 * with automatic translation between them
 */
const MultilingualEditor = ({
  contentKey,
  initialValue = '',
  onChange,
  placeholder = '',
  minHeight = 200,
  toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['clean']
  ]
}) => {
  const { t, i18n } = useTranslation();
  const [tabValue, setTabValue] = useState(0); // 0 for current language, 1 for alternate
  const [enContent, setEnContent] = useState('');
  const [arContent, setArContent] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  
  const currentLang = i18n.language;
  const alternateLang = currentLang === 'en' ? 'ar' : 'en';

  // Load initial content if available
  useEffect(() => {
    // Try to get saved bilingual content
    if (contentKey) {
      const saved = getBilingualContent(contentKey);
      if (saved) {
        if (currentLang === 'en') {
          setEnContent(saved);
        } else {
          setArContent(saved);
        }
      }
    }
    
    // Set initial content from prop if no saved content
    if (!enContent && !arContent && initialValue) {
      if (currentLang === 'en') {
        setEnContent(initialValue);
      } else {
        setArContent(initialValue);
      }
    }
  }, [contentKey, initialValue, currentLang]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle content change in the current language tab
  const handleContentChange = async (content) => {
    if (tabValue === 0) {
      // Update content in current language
      if (currentLang === 'en') {
        setEnContent(content);
      } else {
        setArContent(content);
      }

      // Call parent onChange if provided
      if (onChange) {
        onChange(content);
      }

      // Auto-translate to the other language if enabled
      if (autoTranslate && content) {
        handleTranslate();
      }
      
      // Store bilingual content
      if (contentKey) {
        storeBilingualContent(contentKey, content, currentLang);
      }
    } else {
      // Update content in alternate language
      if (alternateLang === 'en') {
        setEnContent(content);
      } else {
        setArContent(content);
      }
      
      // Store bilingual content for the alternate language
      if (contentKey) {
        const alternateKey = `${contentKey}_${alternateLang}`;
        storeBilingualContent(alternateKey, content, alternateLang);
      }
    }
  };

  // Manually trigger translation
  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      // Get content from current language
      const sourceContent = currentLang === 'en' ? enContent : arContent;
      
      if (!sourceContent) {
        setIsTranslating(false);
        return;
      }
      
      // Translate to alternate language
      const translated = await translateUserInput(sourceContent, alternateLang);
      
      // Update alternate language content
      if (alternateLang === 'en') {
        setEnContent(translated);
      } else {
        setArContent(translated);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Toggle auto-translation
  const handleToggleAutoTranslate = () => {
    setAutoTranslate(!autoTranslate);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1, 
        borderColor: 'divider',
        mb: 2
      }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            label={currentLang === 'en' ? 'English' : 'العربية'} 
            id="tab-0"
          />
          <Tab 
            label={alternateLang === 'en' ? 'English' : 'العربية'} 
            id="tab-1"
          />
        </Tabs>
        <Box>
          <Tooltip title={t('common.translate')}>
            <IconButton
              onClick={handleTranslate}
              disabled={isTranslating || (!enContent && !arContent)}
            >
              <TranslateIcon color={isTranslating ? 'disabled' : 'action'} />
              {isTranslating && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            onClick={handleToggleAutoTranslate}
            color={autoTranslate ? 'primary' : 'inherit'}
            sx={{ ml: 1 }}
          >
            Auto
          </Button>
        </Box>
      </Box>
      
      <Paper
        elevation={0}
        sx={{ 
          p: 1, 
          minHeight, 
          direction: tabValue === 0 
            ? (currentLang === 'ar' ? 'rtl' : 'ltr')
            : (alternateLang === 'ar' ? 'rtl' : 'ltr')
        }}
      >
        <ReactQuill
          theme="snow"
          value={tabValue === 0 
            ? (currentLang === 'en' ? enContent : arContent)
            : (alternateLang === 'en' ? enContent : arContent)
          }
          onChange={handleContentChange}
          placeholder={placeholder}
          modules={{
            toolbar: toolbarOptions
          }}
          style={{ 
            minHeight: `${minHeight - 42}px`, 
            direction: tabValue === 0 
              ? (currentLang === 'ar' ? 'rtl' : 'ltr')
              : (alternateLang === 'ar' ? 'rtl' : 'ltr')
          }}
        />
      </Paper>
      
      {autoTranslate && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {t('common.autoTranslateEnabled')}
        </Typography>
      )}
    </Box>
  );
};

export default MultilingualEditor; 