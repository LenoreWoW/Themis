import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// English translations
const enTranslations = {
  app: {
    title: "Themis Project Management",
    description: "A comprehensive project management solution"
  },
  auth: {
    signin: "Sign In",
    signout: "Sign Out",
    username: "Username",
    password: "Password",
    remember: "Remember me",
    forgot: "Forgot password?",
    noAccount: "Don't have an account?",
    signup: "Sign up",
    enterActiveDirectoryId: "Please enter your Active Directory ID",
    authFailed: "Authentication failed. Please check your Active Directory ID or contact your administrator.",
    welcomeToThemis: "Welcome to Themis",
    centralizedWorkspace: "The centralized workspace for all your project management needs",
    projectManagement: "Project Management",
    loginToThemis: "Log in to Themis",
    signInWithAD: "Sign in with your Active Directory ID",
    activeDirectoryId: "Active Directory ID"
  },
  navigation: {
    dashboard: "Analytical Dashboard",
    projects: "Projects",
    tasks: "Tasks",
    assignments: "Assignments",
    risksIssues: "Risks & Issues",
    meetings: "Meetings",
    users: "System Settings",
    goals: "Goals",
    departments: "Departments"
  },
  dashboard: {
    title: "Executive Dashboard",
    kpi: "Key Performance Indicators",
    totalProjects: "Total Projects",
    inProgress: "In Progress",
    completed: "Completed",
    onHold: "On Hold",
    overdue: "Overdue",
    approachingDeadline: "Approaching Deadline",
    openRisks: "Open Risks",
    openIssues: "Open Issues",
    financialOverview: "Financial Overview",
    totalBudget: "Total Budget",
    spentToDate: "Spent to Date",
    remaining: "Remaining",
    export: "Export Report",
    lastUpdated: "Last updated",
    refresh: "Refresh dashboard"
  },
  departments: {
    title: "Departments",
    add: "Add Department",
    edit: "Edit Department",
    name: "Name",
    description: "Description",
    created: "Created",
    lastUpdated: "Last Updated",
    actions: "Actions",
    departmentName: "Department Name",
    noDepartments: "No departments found.",
    requiredField: "Department name is required",
    updateSuccess: "Department updated successfully",
    updateFailed: "Failed to update department",
    createSuccess: "Department created successfully",
    createFailed: "Failed to create department",
    tryAgain: "Failed to save department. Please try again.",
    deleteSuccess: "Department deleted successfully",
    deleteFailed: "Failed to delete department",
    confirmDelete: "Confirm Delete",
    deleteConfirmation: "Are you sure you want to delete the department '{{name}}'? This action cannot be undone."
  },
  goals: {
    add: "Add Goal",
    edit: "Edit Goal",
    addNew: "Add New",
    strategic: "Strategic",
    annual: "Annual",
    goal: "Goal",
    title: "Title",
    category: "Category",
    assignedTo: "Assigned To",
    notStarted: "Not Started",
    performance: "Performance",
    financial: "Financial",
    customer: "Customer",
    learning: "Learning",
    process: "Process"
  },
  projects: {
    add: "Add Project",
    edit: "Edit Project"
  },
  project: {
    name: "Project Name",
    description: "Description",
    client: "Client",
    status: "Status",
    priority: "Priority",
    startDate: "Start Date",
    endDate: "End Date",
    dueDate: "Due Date",
    department: "Department",
    projectManager: "Project Manager",
    progress: "Progress",
    add: "Add Project",
    edit: "Edit Project",
    delete: "Delete Project",
    details: "Project Details",
    team: "Project Team",
    addMember: "Add Team Member",
    removeMember: "Remove Team Member",
    unassigned: "Unassigned",
    createNewToStart: "Create a new project to get started",
    addNew: "Add New Project",
    fillDetails: "Fill in the project details",
    budget: "Budget",
    goalsLink: "Link to Goals",
    attachments: "Attachments",
    supportedTypes: "Supported file types: PDF, DOCX, XLSX, PPTX, JPG, PNG",
    clickToSelect: "Click to select files",
    errorUploading: "Error Uploading Files",
    reviewerComments: "Reviewer Comments",
    addFeedback: "Add your feedback here",
    previousComments: "Previous Comments",
    addLegacy: "Add Legacy Project"
  },
  status: {
    planning: "Planning",
    inProgress: "In Progress",
    onHold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
    title: "Status"
  },
  priority: {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    title: "Priority"
  },
  assignments: {
    myTasks: "My Tasks",
    title: "Assignments"
  },
  common: {
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    update: "Update",
    create: "Create",
    creating: "Creating...",
    save: "Save",
    remove: "Remove",
    print: "Print Dashboard",
    welcome: "Welcome",
    user: "User",
    pendingApprovals: "Pending Approvals",
    view: "View Details",
    review: "Review",
    approve: "Approve",
    timeline: "Timeline",
    to: "to",
    search: "Search",
    all: "All",
    listView: "List View",
    gridView: "Grid View",
    noData: "No Data",
    adjustSearchCriteria: "Try adjusting your search criteria",
    rowsPerPage: "Rows per page",
    of: "of",
    actions: "Actions",
    description: "Description"
  },
  language: {
    english: "English",
    arabic: "Arabic"
  }
};

// Arabic translations
const arTranslations = {
  app: {
    title: "ثيميس لإدارة المشاريع",
    description: "حل شامل لإدارة المشاريع"
  },
  auth: {
    signin: "تسجيل الدخول",
    signout: "تسجيل الخروج",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    remember: "تذكرني",
    forgot: "نسيت كلمة المرور؟",
    noAccount: "ليس لديك حساب؟",
    signup: "إنشاء حساب",
    enterActiveDirectoryId: "الرجاء إدخال معرف الدليل النشط الخاص بك",
    authFailed: "فشلت المصادقة. يرجى التحقق من معرف الدليل النشط الخاص بك أو الاتصال بالمسؤول.",
    welcomeToThemis: "مرحبًا بك في ثيميس",
    centralizedWorkspace: "مساحة العمل المركزية لجميع احتياجات إدارة المشاريع الخاصة بك",
    projectManagement: "إدارة المشاريع",
    loginToThemis: "تسجيل الدخول إلى ثيميس",
    signInWithAD: "تسجيل الدخول باستخدام معرف الدليل النشط الخاص بك",
    activeDirectoryId: "معرف الدليل النشط"
  },
  navigation: {
    dashboard: "لوحة التحليلات",
    projects: "المشاريع",
    tasks: "المهام",
    assignments: "التكليفات",
    risksIssues: "المخاطر والقضايا",
    meetings: "الاجتماعات",
    users: "إعدادات النظام",
    goals: "الأهداف",
    departments: "الأقسام"
  },
  dashboard: {
    title: "لوحة تحكم تنفيذية",
    kpi: "مؤشرات الأداء الرئيسية",
    totalProjects: "إجمالي المشاريع",
    inProgress: "قيد التنفيذ",
    completed: "مكتملة",
    onHold: "معلقة",
    overdue: "متأخرة",
    approachingDeadline: "تقترب من الموعد النهائي",
    openRisks: "المخاطر المفتوحة",
    openIssues: "القضايا المفتوحة",
    financialOverview: "نظرة عامة مالية",
    totalBudget: "إجمالي الميزانية",
    spentToDate: "أُنفق حتى الآن",
    remaining: "المتبقي",
    export: "تصدير التقرير",
    lastUpdated: "آخر تحديث",
    refresh: "تحديث لوحة التحكم"
  },
  departments: {
    title: "الأقسام",
    add: "إضافة قسم",
    edit: "تعديل القسم",
    name: "الاسم",
    description: "الوصف",
    created: "تاريخ الإنشاء",
    lastUpdated: "آخر تحديث",
    actions: "الإجراءات",
    departmentName: "اسم القسم",
    noDepartments: "لا توجد أقسام",
    requiredField: "اسم القسم مطلوب",
    updateSuccess: "تم تحديث القسم بنجاح",
    updateFailed: "فشل تحديث القسم",
    createSuccess: "تم إنشاء القسم بنجاح",
    createFailed: "فشل إنشاء القسم",
    tryAgain: "فشل حفظ القسم. يرجى المحاولة مرة أخرى.",
    deleteSuccess: "تم حذف القسم بنجاح",
    deleteFailed: "فشل حذف القسم",
    confirmDelete: "تأكيد الحذف",
    deleteConfirmation: "هل أنت متأكد من رغبتك في حذف القسم '{{name}}'؟ لا يمكن التراجع عن هذا الإجراء."
  },
  goals: {
    add: "إضافة هدف",
    edit: "تعديل الهدف",
    addNew: "إضافة جديد",
    strategic: "استراتيجي",
    annual: "سنوي",
    goal: "هدف",
    title: "العنوان",
    category: "الفئة",
    assignedTo: "مسند إلى",
    notStarted: "لم يبدأ",
    performance: "الأداء",
    financial: "مالي",
    customer: "العملاء",
    learning: "التعلم",
    process: "العملية"
  },
  projects: {
    add: "إضافة مشروع",
    edit: "تعديل المشروع"
  },
  project: {
    name: "اسم المشروع",
    description: "الوصف",
    client: "العميل",
    status: "الحالة",
    priority: "الأولوية",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    dueDate: "تاريخ الميلاد",
    department: "القسم",
    projectManager: "مدير المشروع",
    progress: "التقدم",
    add: "إضافة مشروع",
    edit: "تعديل المشروع",
    delete: "حذف المشروع",
    details: "تفاصيل المشروع",
    team: "فريق المشروع",
    addMember: "إضافة عضو فريق",
    removeMember: "إزالة عضو الفريق",
    unassigned: "غير مسند",
    createNewToStart: "إنشاء مشروع جديد للبدء",
    addNew: "مشروع جديد",
    fillDetails: "ملء تفاصيل المشروع",
    budget: "الميزانية",
    goalsLink: "رابط إلى الأهداف",
    attachments: "المرفقات",
    supportedTypes: "أنواع الملفات المدعومة: PDF, DOCX, XLSX, PPTX, JPG, PNG",
    clickToSelect: "انقر لاختيار الملفات",
    errorUploading: "خطأ عند رفع الملفات",
    reviewerComments: "تعليقات المراجع",
    addFeedback: "أضف تعليقاتك هنا",
    previousComments: "تعليقات سابقة",
    addLegacy: "إضافة مشروع قديم"
  },
  status: {
    planning: "التخطيط",
    inProgress: "قيد التنفيذ",
    onHold: "معلق",
    completed: "مكتمل",
    cancelled: "ملغي",
    title: "الحالة"
  },
  priority: {
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
    critical: "حرجة",
    title: "الأولوية"
  },
  assignments: {
    myTasks: "مهامي",
    title: "التكليفات"
  },
  common: {
    edit: "تعديل",
    delete: "حذف",
    cancel: "إلغاء",
    update: "تحديث",
    create: "إنشاء",
    creating: "جاري الإنشاء...",
    save: "حفظ",
    remove: "إزالة",
    print: "طباعة اللوحة",
    welcome: "مرحباً",
    user: "المستخدم",
    pendingApprovals: "موافقات معلقة",
    view: "عرض التفاصيل",
    review: "مراجعة",
    approve: "موافقة",
    timeline: "الجدول الزمني",
    to: "إلى",
    search: "بحث",
    all: "الكل",
    listView: "عرض قائمة",
    gridView: "عرض شبكي",
    noData: "لا توجد بيانات",
    adjustSearchCriteria: "حاول تعديل معايير البحث",
    rowsPerPage: "عدد الصفوف في الصفحة",
    of: "من",
    actions: "الإجراءات",
    description: "الوصف"
  },
  language: {
    english: "الإنجليزية",
    arabic: "العربية"
  }
};

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      ar: {
        translation: arTranslations
      }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    // Detect language from localStorage, URL, or browser settings
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'themisLanguage',
      caches: ['localStorage'],
    },
  });

export default i18n; 