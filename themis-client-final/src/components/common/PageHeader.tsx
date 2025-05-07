import React from 'react';
import { 
  Typography, 
  Box, 
  Breadcrumbs, 
  Link as MuiLink, 
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import useLocalizedText from '../../hooks/useLocalizedText';
import BiDiFlexBox from './BiDiFlexBox';

interface PageHeaderProps {
  title: string;
  breadcrumbs?: { label: string; to?: string }[];
  subtitle?: string;
  actionButtons?: React.ReactNode;
  backTo?: string;
  backLabel?: string;
}

/**
 * Responsive page header with proper RTL/LTR support
 * Includes optional breadcrumbs, subtitle, and action buttons
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs,
  subtitle,
  actionButtons,
  backTo,
  backLabel = 'common.back'
}) => {
  const { translate, isRTL, getTextClass } = useLocalizedText();
  const theme = useTheme();
  
  // Direction-aware back arrow icon
  const BackIcon = isRTL ? KeyboardArrowRightIcon : KeyboardArrowLeftIcon;
  
  return (
    <Box sx={{ mb: 4 }}>
      {/* Top section with breadcrumbs or back button */}
      {(breadcrumbs || backTo) && (
        <Box sx={{ mb: 1 }}>
          {backTo ? (
            <Tooltip title={String(translate(backLabel))} arrow>
              <IconButton 
                component={RouterLink} 
                to={backTo}
                size="small"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <BackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : breadcrumbs && breadcrumbs.length > 0 ? (
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" />} 
              aria-label="breadcrumbs"
              sx={{
                '& .MuiBreadcrumbs-separator': {
                  transform: isRTL ? 'rotate(180deg)' : 'none'
                }
              }}
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                
                return crumb.to ? (
                  <MuiLink
                    key={index}
                    component={RouterLink}
                    to={crumb.to}
                    color={isLast ? 'text.primary' : 'inherit'}
                    sx={{ 
                      textDecoration: 'none',
                      fontWeight: isLast ? 600 : 400,
                      '&:hover': {
                        textDecoration: isLast ? 'none' : 'underline'
                      },
                      direction: isRTL ? 'rtl' : 'ltr' 
                    }}
                    className={getTextClass()}
                  >
                    {crumb.label}
                  </MuiLink>
                ) : (
                  <Typography 
                    key={index} 
                    color="text.primary" 
                    className={getTextClass()}
                  >
                    {crumb.label}
                  </Typography>
                );
              })}
            </Breadcrumbs>
          ) : null}
        </Box>
      )}
      
      {/* Main header with title and action buttons */}
      <BiDiFlexBox
        ltrDirection="row"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.primary.main,
              mb: subtitle ? 0.5 : 0
            }}
            className={getTextClass()}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              className={getTextClass()}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actionButtons && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {actionButtons}
          </Box>
        )}
      </BiDiFlexBox>
    </Box>
  );
};

export default PageHeader; 