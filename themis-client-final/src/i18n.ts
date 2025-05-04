import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('themisLanguage') || 'en';

// Create i18n instance
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: savedLanguage,
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'sessionStorage', 'navigator'],
      lookupLocalStorage: 'themisLanguage',
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true,
    },
    resources: {
      en: {
        translation: {
          app: {
            title: 'Themis Project Management'
          },
          language: {
            english: 'English',
            arabic: 'Arabic'
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
      },
      ar: {
        translation: {
          app: {
            title: 'نظام ثيميس لإدارة المشاريع'
          },
          language: {
            english: 'الإنجليزية',
            arabic: 'العربية'
          },
          common: {
            home: 'الرئيسية',
            save: 'حفظ',
            cancel: 'إلغاء',
            delete: 'حذف',
            edit: 'تعديل',
            view: 'عرض',
            close: 'إغلاق',
            submit: 'إرسال',
            confirm: 'تأكيد',
            back: 'رجوع',
            next: 'التالي',
            loading: 'جاري التحميل...',
            noData: 'لا توجد بيانات متاحة',
            search: 'بحث',
            filter: 'تصفية',
            sort: 'ترتيب',
            actions: 'إجراءات'
          },
          navbar: {
            dashboard: 'لوحة المعلومات',
            projects: 'المشاريع',
            tasks: 'المهام',
            users: 'المستخدمين',
            settings: 'الإعدادات',
            profile: 'الملف الشخصي',
            logout: 'تسجيل الخروج',
            login: 'تسجيل الدخول'
          },
          navigation: {
            dashboard: 'لوحة المعلومات',
            projects: 'المشاريع',
            tasks: 'المهام',
            assignments: 'التكليفات',
            goals: 'الأهداف',
            risksIssues: 'المخاطر والمشكلات',
            meetings: 'الاجتماعات',
            users: 'إعدادات النظام',
            userManagement: 'إدارة المستخدمين',
            departments: 'الإدارات',
            approvals: 'موافقات المشاريع',
            auditLogs: 'سجلات التدقيق',
            complianceAudit: 'تدقيق الامتثال'
          },
          auth: {
            settings: 'الإعدادات',
            signout: 'تسجيل الخروج',
            signin: 'تسجيل الدخول',
            signup: 'إنشاء حساب',
            forgotPassword: 'نسيت كلمة المرور',
            resetPassword: 'إعادة تعيين كلمة المرور',
            changePassword: 'تغيير كلمة المرور'
          },
          auditLog: {
            title: 'سجل التدقيق',
            entityTypes: {
              project: 'مشروع',
              task: 'مهمة',
              user: 'مستخدم',
              role: 'دور',
              department: 'إدارة',
              document: 'مستند',
              meeting: 'اجتماع',
              risk: 'مخاطرة',
              issue: 'مشكلة',
              changeRequest: 'طلب تغيير'
            },
            actions: {
              create: 'إنشاء',
              update: 'تحديث',
              delete: 'حذف',
              approve: 'موافقة',
              reject: 'رفض',
              submit: 'تقديم',
              login: 'تسجيل دخول',
              logout: 'تسجيل خروج',
              assign: 'تعيين',
              unassign: 'إلغاء تعيين',
              complete: 'إكمال',
              view: 'عرض'
            }
          }
        }
      }
    }
  });

// This will log any i18next init errors to help with debugging
i18n.on('initialized', () => {
  console.log('i18n initialized successfully!');
});

i18n.on('languageChanged', (lng) => {
  console.log('Language changed to:', lng);
  localStorage.setItem('themisLanguage', lng);
});

export default i18n; 