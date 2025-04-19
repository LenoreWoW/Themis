import { User, UserRole, Department } from './types';

export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'IT',
    description: 'Information Technology Department',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Engineering',
    description: 'Engineering Department',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'PMO',
    description: 'Project Management Office',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    department: mockDepartments[0],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'manager',
    firstName: 'Project',
    lastName: 'Manager',
    email: 'manager@example.com',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[1],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    username: 'developer',
    firstName: 'Software',
    lastName: 'Developer',
    email: 'developer@example.com',
    role: UserRole.DEVELOPER,
    department: mockDepartments[0],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    username: 'designer',
    firstName: 'UI/UX',
    lastName: 'Designer',
    email: 'designer@example.com',
    role: UserRole.DESIGNER,
    department: mockDepartments[2],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]; 