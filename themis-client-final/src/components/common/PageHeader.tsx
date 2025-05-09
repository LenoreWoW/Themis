import React from 'react';
import { 
  Typography, 
  Box, 
  Breadcrumbs, 
  Link as MuiLink, 
  IconButton,
  Tooltip,
  useTheme,
  Paper,
  Button,
  Divider,
  alpha
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
  elevated?: boolean;
}

/**
 * Responsive page header with proper RTL/LTR support
 * Includes optional breadcrumbs, subtitle, and action buttons
 * Consistent styling across all pages for UI harmonization
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs,
  subtitle,
  actionButtons,
  backTo,
  backLabel = 'common.back',
  elevated = false
}) => {
  const { translate, isRTL, getTextClass } = useLocalizedText();
  const theme = useTheme();
  
  // Direction-aware back arrow icon
  const BackIcon = isRTL ? KeyboardArrowRightIcon : KeyboardArrowLeftIcon;
  
  const headerContent = (
    <>
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
                  },
                  mr: isRTL ? 0 : 1,
                  ml: isRTL ? 1 : 0
                }}
                aria-label={String(translate(backLabel))}
              >
                <BackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            breadcrumbs && (
              <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />} 
                aria-label="breadcrumb"
                sx={{ 
                  '& .MuiBreadcrumbs-separator': {
                    mx: 0.5,
                    color: 'text.secondary',
                  }
                }}
              >
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return isLast || !crumb.to ? (
                    <Typography 
                      key={index} 
                      color="text.primary" 
                      variant="body2"
                      sx={{ 
                        fontWeight: isLast ? 600 : 400,
                        fontSize: '0.875rem',
                      }}
                    >
                      {String(translate(crumb.label))}
                    </Typography>
                  ) : (
                    <MuiLink
                      key={index}
                      component={RouterLink}
                      to={crumb.to}
                      color="inherit"
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        '&:hover': {
                          textDecoration: 'none',
                          color: 'primary.main'
                        }
                      }}
                    >
                      {String(translate(crumb.label))}
                    </MuiLink>
                  );
                })}
              </Breadcrumbs>
            )
          )}
        </Box>
      )}
      
      {/* Main header with title and action buttons */}
      <BiDiFlexBox 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: subtitle ? 0.5 : 0
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            lineHeight: 1.2,
            color: 'text.primary'
          }}
        >
          {String(translate(title))}
        </Typography>
        
        {actionButtons && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actionButtons}
          </Box>
        )}
      </BiDiFlexBox>
      
      {/* Subtitle text */}
      {subtitle && (
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            mb: 2,
            maxWidth: '80ch',
            lineHeight: 1.6
          }}
        >
          {String(translate(subtitle))}
        </Typography>
      )}
      
      <Divider sx={{ mt: 2, mb: 3, opacity: 0.8 }} />
    </>
  );
  
  // Return either elevated or regular header
  return elevated ? (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.7)
      }}
    >
      {headerContent}
    </Paper>
  ) : (
    <Box sx={{ mb: 3 }}>
      {headerContent}
    </Box>
  );
};

export default PageHeader; 