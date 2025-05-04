import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Create i18n instance
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          app: {
            title: 'Themis Project Management'
          },
          common: {
            home: 'Home',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            view: 'View',
            close: 'Close',
            submit: 'Submit',
            confirm: 'Confirm',
            back: 'Back',
            next: 'Next',
            loading: 'Loading...',
            noData: 'No data available',
            search: 'Search',
            filter: 'Filter',
            sort: 'Sort',
            actions: 'Actions'
          },
          navbar: {
            dashboard: 'Dashboard',
            projects: 'Projects',
            tasks: 'Tasks',
            users: 'Users',
            settings: 'Settings',
            profile: 'Profile',
            logout: 'Logout',
            login: 'Login'
          },
          navigation: {
            dashboard: 'Dashboard',
            projects: 'Projects',
            tasks: 'Tasks',
            assignments: 'Assignments',
            goals: 'Goals',
            risksIssues: 'Risks & Issues',
            meetings: 'Meetings',
            users: 'System Settings',
            userManagement: 'User Management',
            departments: 'Departments',
            approvals: 'Project Approvals',
            auditLogs: 'Audit Logs',
            complianceAudit: 'Compliance Audit'
          },
          auth: {
            settings: 'Settings',
            signout: 'Logout',
            signin: 'Sign In',
            signup: 'Sign Up',
            forgotPassword: 'Forgot Password',
            resetPassword: 'Reset Password',
            changePassword: 'Change Password'
          },
          auditLog: {
            title: 'Audit Log',
            entityTypes: {
              project: 'Project',
              task: 'Task',
              user: 'User',
              role: 'Role',
              department: 'Department',
              document: 'Document',
              meeting: 'Meeting',
              risk: 'Risk',
              issue: 'Issue',
              changeRequest: 'Change Request'
            },
            actions: {
              create: 'Created',
              update: 'Updated',
              delete: 'Deleted',
              approve: 'Approved',
              reject: 'Rejected',
              submit: 'Submitted',
              login: 'Logged In',
              logout: 'Logged Out',
              assign: 'Assigned',
              unassign: 'Unassigned',
              complete: 'Completed',
              view: 'Viewed'
            }
          }
        }
      }
    }
  });

export default i18n; 