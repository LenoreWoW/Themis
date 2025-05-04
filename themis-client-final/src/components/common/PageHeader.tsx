import React, { ReactNode } from 'react';
import { Typography, Box, Breadcrumbs, Link, SxProps, Theme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  sx = {},
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 3, ...sx }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            color="inherit"
          >
            {t('common.home', 'Home')}
          </Link>
          
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast ? (
              <Typography color="text.primary" key={index}>
                {breadcrumb.label}
              </Typography>
            ) : (
              <Link
                component={RouterLink}
                to={breadcrumb.href || '#'}
                underline="hover"
                color="inherit"
                key={index}
              >
                {breadcrumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom={!!subtitle}>
            {title}
          </Typography>
          
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  );
};

// Mark as a module
export {}; 