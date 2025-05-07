import BuildIcon from '@mui/icons-material/Build';
import { UserRole } from '../../types';

// Export a menu item for change requests
export const changeRequestMenuItem = {
  title: 'Change Requests',
  icon: <BuildIcon />,
  path: '/change-requests',
  roles: [UserRole.PROJECT_MANAGER, UserRole.SUB_PMO, UserRole.MAIN_PMO, UserRole.ADMIN],
}; 