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

interface EnhancedCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  chipLabel?: string;
  chipColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  footer?: ReactNode;
  elevation?: number;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  subtitle,
  children,
  action,
  chipLabel,
  chipColor = 'default',
  footer,
  elevation = 1,
  sx,
  onClick
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Card 
      elevation={elevation}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${isDark ? alpha(theme.palette.divider, 0.05) : theme.palette.divider}`,
        '&:hover': onClick ? {
          boxShadow: '0 8px 24px 0 rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
          '&::before': {
            opacity: 1,
          }
        } : {},
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
        action={action || (
          <IconButton aria-label="settings" size="small">
            <MoreVertIcon />
          </IconButton>
        )}
        sx={{
          p: 2,
          pb: 1,
          '& .MuiCardHeader-action': {
            margin: 0
          }
        }}
      />
      <CardContent sx={{ p: 2, pt: 1 }}>
        {children}
      </CardContent>
      {footer && (
        <>
          <Divider />
          <CardActions sx={{ p: 2 }}>
            {footer}
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default EnhancedCard; 