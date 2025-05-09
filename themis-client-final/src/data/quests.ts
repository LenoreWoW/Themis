import { Quest, QuestCategory, QuestStatus } from '../types/Onboarding';
import { UserRole } from '../types/index';
import { v4 as uuidv4 } from 'uuid';

// Welcome Module
export const welcomeQuests: Quest[] = [
  {
    id: uuidv4(),
    key: 'welcome_navigation',
    title: 'Interface Navigation',
    description: 'Learn to navigate the principal elements of Themis—Dashboard, Projects, Tasks, Calendar, Reports, Collaboration, and Help.',
    category: QuestCategory.WELCOME,
    relevantRoles: Object.values(UserRole),
    status: QuestStatus.NOT_STARTED,
    priority: 10,
    steps: [
      {
        id: uuidv4(),
        title: 'Explore the Dashboard',
        description: 'Navigate to the Dashboard to view your current projects and tasks.',
        completed: false,
        targetComponent: 'DashboardPage'
      },
      {
        id: uuidv4(),
        title: 'Check the Sidebar',
        description: 'View the collapsible sidebar for accessing all main modules.',
        completed: false,
        targetComponent: 'CollapsibleSidebar'
      },
      {
        id: uuidv4(),
        title: 'Review Notifications',
        description: 'Access the notification panel to view system alerts and updates.',
        completed: false,
        targetComponent: 'NotificationPanel'
      }
    ]
  }
];

// Project Manager Module
export const projectManagerQuests: Quest[] = [
  {
    id: uuidv4(),
    key: 'pm_create_project',
    title: 'Establish a New Project',
    description: 'Create and review a project record.',
    category: QuestCategory.PROJECT_MANAGER,
    relevantRoles: [UserRole.PROJECT_MANAGER],
    status: QuestStatus.NOT_STARTED,
    priority: 20,
    steps: [
      {
        id: uuidv4(),
        title: 'Access New Project Page',
        description: 'Navigate to the New Project page to begin creating a project.',
        completed: false,
        targetComponent: 'NewProjectPage'
      },
      {
        id: uuidv4(),
        title: 'Complete Required Fields',
        description: 'Fill in all required project details and information.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Save Project',
        description: 'Save the project to add it to your project portfolio.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Review Project Details',
        description: 'Navigate to the Project Detail page to review your newly created project.',
        completed: false,
        targetComponent: 'ProjectDetailPage'
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'pm_manage_tasks',
    title: 'Manage Tasks and Assignments',
    description: 'Utilize the Kanban board and assign work to team members.',
    category: QuestCategory.PROJECT_MANAGER,
    relevantRoles: [UserRole.PROJECT_MANAGER],
    status: QuestStatus.NOT_STARTED,
    priority: 30,
    steps: [
      {
        id: uuidv4(),
        title: 'Navigate to Task Board',
        description: 'Access the Kanban board view for managing project tasks.',
        completed: false,
        targetComponent: 'TaskBoardPage'
      },
      {
        id: uuidv4(),
        title: 'Create Action Item',
        description: 'Create a new task card in the Kanban board.',
        completed: false,
        targetComponent: 'KanbanBoard'
      },
      {
        id: uuidv4(),
        title: 'Assign Task',
        description: 'Assign the task to a team member via the Assignments page.',
        completed: false,
        targetComponent: 'AssignmentsPage'
      },
      {
        id: uuidv4(),
        title: 'Move Task Through Workflow',
        description: 'Move a task through "To Do," "In Progress," and "Done" stages.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'pm_status_changes',
    title: 'Submit Status and Change Requests',
    description: 'Record weekly status and initiate a change request.',
    category: QuestCategory.PROJECT_MANAGER,
    relevantRoles: [UserRole.PROJECT_MANAGER],
    status: QuestStatus.NOT_STARTED,
    priority: 40,
    steps: [
      {
        id: uuidv4(),
        title: 'Open Weekly Updates',
        description: 'Navigate to the weekly status update section of your project.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Enter Progress Notes',
        description: 'Record the current status and progress of your project.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Launch Change Request',
        description: 'Open the Change Request dialog to submit a formal change.',
        completed: false,
        targetComponent: 'ChangeRequestDialog'
      },
      {
        id: uuidv4(),
        title: 'Submit and Review',
        description: 'Submit both status update and change request, then verify they appear in the project activity.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'pm_risks_issues',
    title: 'Record Risks and Issues',
    description: 'Identify and log potential risks and issues.',
    category: QuestCategory.PROJECT_MANAGER,
    relevantRoles: [UserRole.PROJECT_MANAGER],
    status: QuestStatus.NOT_STARTED,
    priority: 50,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Risk & Issues Page',
        description: 'Navigate to the Risks and Issues management page.',
        completed: false,
        targetComponent: 'RiskIssuesPage'
      },
      {
        id: uuidv4(),
        title: 'Open Risk Register',
        description: 'Use the Risk Issue Register to document project risks.',
        completed: false,
        targetComponent: 'RiskIssueRegister'
      },
      {
        id: uuidv4(),
        title: 'Log Risk',
        description: 'Add at least one risk to the project risk register.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Log Issue',
        description: 'Add at least one issue to the project issue register.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'pm_schedule_meetings',
    title: 'Schedule and Conduct Meetings',
    description: 'Organize a meeting using built-in or external conferencing.',
    category: QuestCategory.PROJECT_MANAGER,
    relevantRoles: [UserRole.PROJECT_MANAGER],
    status: QuestStatus.NOT_STARTED,
    priority: 60,
    steps: [
      {
        id: uuidv4(),
        title: 'Open Calendar',
        description: 'Navigate to the Calendar page to schedule a meeting.',
        completed: false,
        targetComponent: 'CalendarPage'
      },
      {
        id: uuidv4(),
        title: 'Create Meeting',
        description: 'Set up a new meeting with appropriate participants and details.',
        completed: false,
        targetComponent: 'MeetingsPage'
      },
      {
        id: uuidv4(),
        title: 'Verify Calendar Entry',
        description: 'Confirm the meeting appears on the calendar with a valid meeting link.',
        completed: false
      }
    ]
  }
];

// Sub-PMO Module
export const subPMOQuests: Quest[] = [
  {
    id: uuidv4(),
    key: 'subpmo_review_projects',
    title: 'Review and Approve Projects',
    description: 'Evaluate and approve new project submissions.',
    category: QuestCategory.SUB_PMO,
    relevantRoles: [UserRole.SUB_PMO],
    status: QuestStatus.NOT_STARTED,
    priority: 20,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Project Approval Page',
        description: 'Navigate to the Project Approval dashboard.',
        completed: false,
        targetComponent: 'ProjectApprovalPage'
      },
      {
        id: uuidv4(),
        title: 'Review Project Details',
        description: 'Examine project information and documentation.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Submit Approval Decision',
        description: 'Approve or reject a project with appropriate comments.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'subpmo_change_requests',
    title: 'Evaluate Change Requests',
    description: 'Review and approve change requests from project managers.',
    category: QuestCategory.SUB_PMO,
    relevantRoles: [UserRole.SUB_PMO],
    status: QuestStatus.NOT_STARTED,
    priority: 30,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Change Requests',
        description: 'Navigate to the Change Requests page.',
        completed: false,
        targetComponent: 'ChangeRequestsPage'
      },
      {
        id: uuidv4(),
        title: 'Review Change Details',
        description: 'Examine the change request details and supporting documentation.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Submit Decision',
        description: 'Approve or reject a change request with appropriate rationale.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'subpmo_status_reviews',
    title: 'Verify Status Updates',
    description: 'Review and validate weekly project status updates.',
    category: QuestCategory.SUB_PMO,
    relevantRoles: [UserRole.SUB_PMO],
    status: QuestStatus.NOT_STARTED,
    priority: 40,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Status Updates',
        description: 'Navigate to the project status reports section.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Review Updates',
        description: 'Examine the content and validity of project status reports.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Provide Feedback',
        description: 'Submit feedback or approval on project status updates.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'subpmo_department_reports',
    title: 'Access Department Reports',
    description: 'Generate and review departmental project reports.',
    category: QuestCategory.SUB_PMO,
    relevantRoles: [UserRole.SUB_PMO],
    status: QuestStatus.NOT_STARTED,
    priority: 50,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Reports Page',
        description: 'Navigate to the reporting section for your department.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Generate Report',
        description: 'Create a department-level project status report.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Export Report',
        description: 'Export the report in your preferred format.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'subpmo_compliance',
    title: 'Confirm Compliance and Methodology',
    description: 'Ensure projects follow established methodology and compliance standards.',
    category: QuestCategory.SUB_PMO,
    relevantRoles: [UserRole.SUB_PMO],
    status: QuestStatus.NOT_STARTED,
    priority: 60,
    steps: [
      {
        id: uuidv4(),
        title: 'Review Methodology',
        description: 'Access the project methodology documentation.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Conduct Compliance Check',
        description: 'Verify a project meets compliance requirements.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Document Findings',
        description: 'Record compliance audit results and any remediation needed.',
        completed: false
      }
    ]
  }
];

// Main PMO Module
export const mainPMOQuests: Quest[] = [
  {
    id: uuidv4(),
    key: 'mainpmo_enterprise_approvals',
    title: 'Conduct Enterprise-Level Approvals',
    description: 'Provide final approval for projects and major changes.',
    category: QuestCategory.MAIN_PMO,
    relevantRoles: [UserRole.MAIN_PMO],
    status: QuestStatus.NOT_STARTED,
    priority: 20,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Approvals Page',
        description: 'Navigate to the enterprise approvals dashboard.',
        completed: false,
        targetComponent: 'ApprovalsPage'
      },
      {
        id: uuidv4(),
        title: 'Review Submission',
        description: 'Examine projects awaiting enterprise-level approval.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Submit Decision',
        description: 'Provide final approval or rejection with appropriate rationale.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'mainpmo_configure_system',
    title: 'Configure System Workflows',
    description: 'Set up and customize system-wide workflows and processes.',
    category: QuestCategory.MAIN_PMO,
    relevantRoles: [UserRole.MAIN_PMO],
    status: QuestStatus.NOT_STARTED,
    priority: 30,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Settings',
        description: 'Navigate to the system settings page.',
        completed: false,
        targetComponent: 'SettingsPage'
      },
      {
        id: uuidv4(),
        title: 'Review Workflow Settings',
        description: 'Examine current workflow configurations.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Modify Workflow',
        description: 'Make at least one change to workflow settings.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'mainpmo_review_analytics',
    title: 'Review Organization-Wide Analytics',
    description: 'Analyze and interpret enterprise-level project metrics.',
    category: QuestCategory.MAIN_PMO,
    relevantRoles: [UserRole.MAIN_PMO],
    status: QuestStatus.NOT_STARTED,
    priority: 40,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Executive Dashboard',
        description: 'Navigate to the executive analytics dashboard.',
        completed: false,
        targetComponent: 'ExecutiveDashboardPage'
      },
      {
        id: uuidv4(),
        title: 'Review Key Metrics',
        description: 'Examine organization-wide performance indicators.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Generate Insights',
        description: 'Create a report based on the analytics data.',
        completed: false
      }
    ]
  }
];

// Department Director Module
export const directorQuests: Quest[] = [
  {
    id: uuidv4(),
    key: 'director_assess_portfolio',
    title: 'Assess Department Portfolio',
    description: 'Review and evaluate your department\'s project portfolio.',
    category: QuestCategory.DEPARTMENT_DIRECTOR,
    relevantRoles: [UserRole.DEPARTMENT_DIRECTOR],
    status: QuestStatus.NOT_STARTED,
    priority: 20,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Portfolio View',
        description: 'Navigate to your department\'s portfolio dashboard.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Review Project Status',
        description: 'Examine the status of all projects in your department.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Identify Risks',
        description: 'Note any at-risk projects requiring attention.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'director_align_goals',
    title: 'Align Goals with Projects',
    description: 'Ensure departmental projects align with strategic goals.',
    category: QuestCategory.DEPARTMENT_DIRECTOR,
    relevantRoles: [UserRole.DEPARTMENT_DIRECTOR],
    status: QuestStatus.NOT_STARTED,
    priority: 30,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Goals Page',
        description: 'Navigate to the strategic goals section.',
        completed: false,
        targetComponent: 'GoalsPage'
      },
      {
        id: uuidv4(),
        title: 'Review Goal Alignment',
        description: 'Examine how projects connect to department goals.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Make Alignment Adjustment',
        description: 'Adjust project-goal alignment where necessary.',
        completed: false
      }
    ]
  }
];

// Executive Module
export const executiveQuests: Quest[] = [
  {
    id: uuidv4(),
    key: 'executive_survey_portfolios',
    title: 'Survey Organizational Portfolios',
    description: 'Review the enterprise-wide project landscape.',
    category: QuestCategory.EXECUTIVE,
    relevantRoles: [UserRole.EXECUTIVE],
    status: QuestStatus.NOT_STARTED,
    priority: 20,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Executive Dashboard',
        description: 'Navigate to the executive portfolio view.',
        completed: false,
        targetComponent: 'ExecutiveDashboardPage'
      },
      {
        id: uuidv4(),
        title: 'Review Department Portfolios',
        description: 'Examine projects across all departments.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Identify Strategic Concerns',
        description: 'Note any strategic issues requiring executive attention.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'executive_strategic_reports',
    title: 'Generate Strategic Reports',
    description: 'Create high-level reports for strategic decision-making.',
    category: QuestCategory.EXECUTIVE,
    relevantRoles: [UserRole.EXECUTIVE],
    status: QuestStatus.NOT_STARTED,
    priority: 30,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Reporting Tools',
        description: 'Navigate to the executive reporting dashboard.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Configure Strategic Report',
        description: 'Set parameters for a strategic-level report.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Generate and Review',
        description: 'Create the report and examine its insights.',
        completed: false
      }
    ]
  }
];

// Common Quests
export const commonQuests: Quest[] = [
  {
    id: uuidv4(),
    key: 'common_secure_access',
    title: 'Secure Access',
    description: 'Complete authentication, profile update, and password reset procedures.',
    category: QuestCategory.COMMON,
    relevantRoles: Object.values(UserRole),
    status: QuestStatus.NOT_STARTED,
    priority: 70,
    steps: [
      {
        id: uuidv4(),
        title: 'Complete Login',
        description: 'Successfully authenticate to the system.',
        completed: false,
        targetComponent: 'LoginPage'
      },
      {
        id: uuidv4(),
        title: 'Update Profile',
        description: 'Review and update your user profile information.',
        completed: false,
        targetComponent: 'ProfilePage'
      },
      {
        id: uuidv4(),
        title: 'Test Password Reset',
        description: 'Navigate through the password reset procedure.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'common_navigate_interface',
    title: 'Navigate the Interface',
    description: 'Demonstrate use of the sidebar, user menu, and notifications.',
    category: QuestCategory.COMMON,
    relevantRoles: Object.values(UserRole),
    status: QuestStatus.NOT_STARTED,
    priority: 80,
    steps: [
      {
        id: uuidv4(),
        title: 'Use Sidebar Navigation',
        description: 'Navigate to different sections using the sidebar.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Access User Menu',
        description: 'Open and use options in the user dropdown menu.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Check Notifications',
        description: 'Review system notifications and mark as read.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'common_collaborate',
    title: 'Collaborate Effectively',
    description: 'Send a chat message, view a document, and participate in a collaborative edit.',
    category: QuestCategory.COMMON,
    relevantRoles: Object.values(UserRole),
    status: QuestStatus.NOT_STARTED,
    priority: 90,
    steps: [
      {
        id: uuidv4(),
        title: 'Send Chat Message',
        description: 'Use the chat system to communicate with a colleague.',
        completed: false,
        targetComponent: 'ChatPage'
      },
      {
        id: uuidv4(),
        title: 'View Document',
        description: 'Access a shared document in the system.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Edit Collaboratively',
        description: 'Participate in editing a document with others.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'common_manage_availability',
    title: 'Manage Availability and Bookings',
    description: 'Define availability slots, publish a booking link, and confirm a reservation.',
    category: QuestCategory.COMMON,
    relevantRoles: Object.values(UserRole),
    status: QuestStatus.NOT_STARTED,
    priority: 100,
    steps: [
      {
        id: uuidv4(),
        title: 'Set Availability',
        description: 'Define your available time slots in the system.',
        completed: false,
        targetComponent: 'Booking/AvailabilityPage'
      },
      {
        id: uuidv4(),
        title: 'Create Booking Link',
        description: 'Generate a sharable link for others to book time with you.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Confirm Reservation',
        description: 'Review and accept a meeting reservation.',
        completed: false
      }
    ]
  },
  {
    id: uuidv4(),
    key: 'common_support_resources',
    title: 'Access Support Resources',
    description: 'Review documentation, complete a targeted tutorial, and adjust language settings.',
    category: QuestCategory.COMMON,
    relevantRoles: Object.values(UserRole),
    status: QuestStatus.NOT_STARTED,
    priority: 110,
    steps: [
      {
        id: uuidv4(),
        title: 'Access Help Documentation',
        description: 'Navigate to the help documentation center.',
        completed: false,
        targetComponent: 'HelpPage'
      },
      {
        id: uuidv4(),
        title: 'Complete Tutorial',
        description: 'Follow a specific feature tutorial from start to finish.',
        completed: false
      },
      {
        id: uuidv4(),
        title: 'Change Language Settings',
        description: 'Adjust your preferred language in the system settings.',
        completed: false
      }
    ]
  }
];

// Combine all quests
export const allQuests: Quest[] = [
  ...welcomeQuests,
  ...projectManagerQuests,
  ...subPMOQuests,
  ...mainPMOQuests,
  ...directorQuests,
  ...executiveQuests,
  ...commonQuests
];

// Get quests for specific user role
export const getQuestsForRole = (role: UserRole): Quest[] => {
  return allQuests.filter(quest => quest.relevantRoles.includes(role));
}; 