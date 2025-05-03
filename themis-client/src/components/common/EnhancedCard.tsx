import React, { ReactNode } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions, 
  IconButton, 
  Typography, 
  Box, 
  Chip,
  useTheme,
  alpha,
  Divider,
  SxProps,
  Theme
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

export interface EnhancedCardProps {
  title?: string;
  subtitle?: string | ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  elevation?: number;
  headerProps?: {
    sx?: SxProps<Theme>;
    [key: string]: any;
  };
  chipLabel?: string;
  chipColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  action?: ReactNode;
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  footer,
  onClick,
  sx = {},
  elevation = 1,
  headerProps = {},
  chipLabel,
  chipColor = 'default',
  action
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Card 
      elevation={elevation}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 3 } : {},
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        border: `1px solid ${isDark ? alpha(theme.palette.divider, 0.05) : theme.palette.divider}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: theme.palette.primary.main,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        ...sx
      }}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              {chipLabel && (
                <Chip 
                  label={chipLabel} 
                  color={chipColor} 
                  size="small" 
                  sx={{ 
                    ml: 1, 
                    fontWeight: 500,
                    height: 24,
                    px: 0.5
                  }} 
                />
              )}
            </Box>
          }
          subheader={subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
          avatar={icon}
          titleTypographyProps={{ variant: 'h6', fontWeight: 'medium' }}
          subheaderTypographyProps={{ variant: 'body2' }}
          sx={{ pb: 1 }}
          action={action || (
            <IconButton aria-label="settings" size="small">
              <MoreVertIcon />
            </IconButton>
          )}
          {...headerProps}
        />
      )}
      <CardContent sx={{ p: 2, flexGrow: 1 }}>
        {children}
      </CardContent>
      {footer && (
        <>
          <Divider />
          <CardActions sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {footer}
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default EnhancedCard; 