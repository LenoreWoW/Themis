import { 
  User, 
  UserRole, 
  Department
} from '../types';

// Create departments
export const mockDepartments: Department[] = [
  {
    id: 'd1',
    name: 'Information Technology',
    description: 'IT department responsible for all technology infrastructure and support',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd2',
    name: 'Engineering',
    description: 'Engineering department responsible for product development',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd3',
    name: 'Human Resources',
    description: 'HR department handling all personnel matters',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd4',
    name: 'Finance',
    description: 'Finance department handling budgeting and accounting',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd5',
    name: 'Marketing',
    description: 'Marketing department responsible for product promotion',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd6',
    name: 'Sales',
    description: 'Sales department handling customer acquisition',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd7',
    name: 'PMO',
    description: 'Project Management Office',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Create test users with various roles
export const mockUsers: User[] = [
  // Admins
  {
    id: 'admin1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    department: mockDepartments[0],
    username: 'admin.user',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Executives
  {
    id: 'exec1',
    email: 'ceo@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: UserRole.EXECUTIVE,
    department: mockDepartments[3], // Finance
    username: 'sarah.johnson',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'exec2',
    email: 'cto@example.com',
    firstName: 'Michael',
    lastName: 'Chen',
    role: UserRole.EXECUTIVE,
    department: mockDepartments[0], // IT
    username: 'michael.chen',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Department Directors
  {
    id: 'dir1',
    email: 'itdirector@example.com',
    firstName: 'James',
    lastName: 'Wilson',
    role: UserRole.DEPARTMENT_DIRECTOR,
    department: mockDepartments[0], // IT
    username: 'james.wilson',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dir2',
    email: 'engdirector@example.com',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    role: UserRole.DEPARTMENT_DIRECTOR,
    department: mockDepartments[1], // Engineering
    username: 'emily.rodriguez',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dir3',
    email: 'hrdirector@example.com',
    firstName: 'David',
    lastName: 'Thompson',
    role: UserRole.DEPARTMENT_DIRECTOR,
    department: mockDepartments[2], // HR
    username: 'david.thompson',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Main PMO
  {
    id: 'mainpmo1',
    email: 'mainpmo@example.com',
    firstName: 'Jennifer',
    lastName: 'Garcia',
    role: UserRole.MAIN_PMO,
    department: mockDepartments[6], // PMO
    username: 'jennifer.garcia',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Sub PMO
  {
    id: 'subpmo1',
    email: 'itpmo@example.com',
    firstName: 'Robert',
    lastName: 'Davis',
    role: UserRole.SUB_PMO,
    department: mockDepartments[0], // IT
    username: 'robert.davis',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'subpmo2',
    email: 'engpmo@example.com',
    firstName: 'Lisa',
    lastName: 'Martinez',
    role: UserRole.SUB_PMO,
    department: mockDepartments[1], // Engineering
    username: 'lisa.martinez',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Project Managers
  {
    id: 'pm1',
    email: 'itpm@example.com',
    firstName: 'Thomas',
    lastName: 'Anderson',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[0], // IT
    username: 'thomas.anderson',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pm2',
    email: 'engpm@example.com',
    firstName: 'Michelle',
    lastName: 'Lee',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[1], // Engineering
    username: 'michelle.lee',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pm3',
    email: 'marketingpm@example.com',
    firstName: 'Daniel',
    lastName: 'White',
    role: UserRole.PROJECT_MANAGER,
    department: mockDepartments[4], // Marketing
    username: 'daniel.white',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Team Members (using DEVELOPER role as per the UserRole enum)
  {
    id: 'tm1',
    email: 'dev1@example.com',
    firstName: 'Jessica',
    lastName: 'Brown',
    role: UserRole.DEVELOPER,
    department: mockDepartments[0], // IT
    username: 'jessica.brown',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tm2',
    email: 'dev2@example.com',
    firstName: 'Kevin',
    lastName: 'Miller',
    role: UserRole.DEVELOPER,
    department: mockDepartments[0], // IT
    username: 'kevin.miller',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tm3',
    email: 'dev3@example.com',
    firstName: 'Amanda',
    lastName: 'Clark',
    role: UserRole.DEVELOPER,
    department: mockDepartments[1], // Engineering
    username: 'amanda.clark',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tm4',
    email: 'designer1@example.com',
    firstName: 'Mark',
    lastName: 'Harris',
    role: UserRole.DEVELOPER,
    department: mockDepartments[4], // Marketing
    username: 'mark.harris',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tm5',
    email: 'analyst1@example.com',
    firstName: 'Laura',
    lastName: 'Martin',
    role: UserRole.DEVELOPER,
    department: mockDepartments[5], // Sales
    username: 'laura.martin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tm6',
    email: 'accountant1@example.com',
    firstName: 'Christopher',
    lastName: 'Allen',
    role: UserRole.DEVELOPER,
    department: mockDepartments[3], // Finance
    username: 'christopher.allen',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tm7',
    email: 'recruiter1@example.com',
    firstName: 'Stephanie',
    lastName: 'Baker',
    role: UserRole.DEVELOPER,
    department: mockDepartments[2], // HR
    username: 'stephanie.baker',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Utility functions
export const getUsersByDepartment = (departmentId: string): User[] => {
  return mockUsers.filter(user => user.department?.id === departmentId);
};

export const getUsersByRole = (role: UserRole): User[] => {
  return mockUsers.filter(user => user.role === role);
};

export const getRandomUsers = (count: number): User[] => {
  const shuffled = [...mockUsers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}; 