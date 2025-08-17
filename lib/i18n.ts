export type Language = "en" | "am" | "or"
export interface Translations {
  dashboard: string
  tasks: string
  reports: string
  profile: string
  settings: string
  userManagement: string
  signOut: string
  admin: string
  account: string
  loading: string
  save: string
  cancel: string
  delete: string
  edit: string
  create: string
  update: string
  search: string
  filter: string
  all: string
  yes: string
  no: string
  close: string
  back: string
  next: string
  previous: string
  signIn: string
  email: string
  password: string
  enterEmail: string
  enterPassword: string
  signingIn: string
  invalidCredentials: string
  loginFailed: string
  demoCredentials: string
  newTask: string
  createTask: string
  editTask: string
  taskTitle: string
  taskDescription: string
  priority: string
  status: string
  dueDate: string
  assignTo: string
  assignedTo: string
  createdBy: string
  pending: string
  inProgress: string
  completed: string
  low: string
  medium: string
  high: string
  overdue: string
  pickDate: string
  unassigned: string
  searchTasks: string
  noTasksFound: string
  createFirstTask: string
  taskCreated: string
  taskUpdated: string
  taskDeleted: string
  confirmDelete: string
  taskAssigned: string
  newComment: string
  users: string
  addUser: string
  createUser: string
  editUser: string
  userName: string
  userEmail: string
  userRole: string
  user: string
  createdDate: string
  actions: string
  userCreated: string
  userUpdated: string
  userDeleted: string
  cannotDeleteSelf: string
  userAlreadyExists: string
  userProfile: string
  accountInfo: string
  fullName: string
  memberSince: string
  userId: string
  lastUpdated: string
  profileUpdated: string
  updateProfile: string
  updating: string
  reportsAnalytics: string
  reportPeriod: string
  totalTasks: string
  avgCompletion: string
  activeUsers: string
  taskFlowTrends: string
  taskStatusDistribution: string
  priorityDistribution: string
  userPerformance: string
  avgCompletionTime: string
  monthlySummary: string
  completionRate: string
  excellent: string
  good: string
  average: string
  needsImprovement: string
  dataAnalysisPeriod: string
  inSelectedPeriod: string
  avgTimeToComplete: string
  usersWithTasks: string
  last7Days: string
  last30Days: string
  last90Days: string
  lastYear: string
  language: string
  english: string
  amharic: string
  oromo: string
  appName: string
  appDescription: string
  welcomeMessage: string
  overviewMessage: string
}
const translations: Record<Language, Translations> = {
  en: {
    dashboard: "Dashboard",
    tasks: "Tasks",
    reports: "Reports",
    profile: "Profile",
    settings: "Settings",
    userManagement: "User Management",
    signOut: "Sign Out",
    admin: "Admin",
    account: "Account",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    search: "Search",
    filter: "Filter",
    all: "All",
    yes: "Yes",
    no: "No",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    signIn: "Sign In",
    email: "Email",
    password: "Password",
    enterEmail: "Enter your email",
    enterPassword: "Enter your password",
    signingIn: "Signing in...",
    invalidCredentials: "Invalid credentials",
    loginFailed: "Login failed",
    demoCredentials: "Demo credentials:",
    newTask: "New Task",
    createTask: "Create Task",
    editTask: "Edit Task",
    taskTitle: "Title",
    taskDescription: "Description",
    priority: "Priority",
    status: "Status",
    dueDate: "Due Date",
    assignTo: "Assign To",
    assignedTo: "Assigned to",
    createdBy: "Created by",
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    low: "Low",
    medium: "Medium",
    high: "High",
    overdue: "Overdue",
    pickDate: "Pick a date",
    unassigned: "Unassigned",
    searchTasks: "Search tasks...",
    noTasksFound: "No tasks found",
    createFirstTask: "Create your first task to get started!",
    taskCreated: "New Task Created",
    taskUpdated: "Task Updated",
    taskDeleted: "Task Deleted",
    confirmDelete: "Are you sure you want to delete this task?",
    taskAssigned: "Task Assigned",
    newComment: "New Comment",
  },
  am: {
    dashboard: "ዳሽቦርድ",
    tasks: "ተግባራት",
    reports: "ሪፖርቶች",
    profile: "መገለጫ",
    settings: "ቅንብሮች",
    userManagement: "የተጠቃሚ አስተዳደር",
    signOut: "ውጣ",
    admin: "አስተዳዳሪ",
    account: "መለያ",
    loading: "በመጫን ላይ...",
    save: "አስቀምጥ",
    cancel: "ሰርዝ",
    delete: "ሰርዝ",
    edit: "አርም",
    create: "ፍጠር",
    update: "አዘምን",
    search: "ፈልግ",
    filter: "ማጣሪያ",
    all: "ሁሉም",
    yes: "አዎ",
    no: "አይ",
    close: "ዝጋ",
    back: "ተመለስ",
    next: "ቀጣይ",
    previous: "ቀዳሚ",
    signIn: "ግባ",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    enterEmail: "ኢሜይልዎን ያስገቡ",
    enterPassword: "የይለፍ ቃልዎን ያስገቡ",
    signingIn: "በመግባት ላይ...",
    invalidCredentials: "ትክክል ያልሆነ መረጃ",
    loginFailed: "መግባት አልተሳካም",
    demoCredentials: "የሙከራ መረጃዎች:",
    newTask: "አዲስ ተግባር",
    createTask: "ተግባር ፍጠር",
    editTask: "ተግባር አርም",
    taskTitle: "ርዕስ",
    taskDescription: "መግለጫ",
    priority: "ቅድሚያ",
    status: "ሁኔታ",
    dueDate: "የመጨረሻ ቀን",
    assignTo: "ምደብ",
    assignedTo: "የተመደበለት",
    createdBy: "የተፈጠረው በ",
    pending: "በመጠባበቅ ላይ",
    inProgress: "በሂደት ላይ",
    completed: "ተጠናቅቋል",
    low: "ዝቅተኛ",
    medium: "መካከለኛ",
    high: "ከፍተኛ",
    overdue: "ጊዜው አልፏል",
    pickDate: "ቀን ምረጥ",
    unassigned: "ያልተመደበ",
    searchTasks: "ተግባራት ፈልግ...",
    noTasksFound: "ምንም ተግባር አልተገኘም",
    createFirstTask: "የመጀመሪያ ተግባርዎን ይፍጠሩ!",
    taskCreated: "አዲስ ተግባር ተፈጥሯል",
    taskUpdated: "ተግባር ተዘምኗል",
    taskDeleted: "ተግባር ተሰርዟል",
    confirmDelete: "እርግጠኛ ነዎት ይህን ተግባር መሰረዝ ይፈልጋሉ?",
    taskAssigned: "ተግባር ተመድቧል",
    newComment: "አዲስ አስተያየት",
  },
  or: {
    dashboard: "Gabatee",
    tasks: "Hojiiwwan",
    reports: "Gabaasota",
    profile: "Seenaa",
    settings: "Qindaa'ina",
    userManagement: "Bulchiinsa Fayyadamtootaa",
    signOut: "Ba'i",
    admin: "Bulchaa",
    account: "Herrega",
    loading: "Fe'aa jira...",
    save: "Olkaa'i",
    cancel: "Dhiisi",
    delete: "Haqi",
    edit: "Fooyyessi",
    create: "Uumi",
    update: "Haaromsi",
    search: "Barbaadi",
    filter: "Calaluu",
    all: "Hunda",
    yes: "Eeyyee",
    no: "Lakki",
    close: "Cufii",
    back: "Deebi'i",
    next: "Itti aanuu",
    previous: "Dura",
    signIn: "Seeni",
    email: "Imeelii",
    password: "Jecha icciitii",
    enterEmail: "Imeelii kee galchi",
    enterPassword: "Jecha icciitii kee galchi",
    signingIn: "Seenaa jira...",
    invalidCredentials: "Odeeffannoo sirrii miti",
    loginFailed: "Seenuun hin milkoofne",
    demoCredentials: "Odeeffannoo yaadannoo:",
    newTask: "Hojii Haaraa",
    createTask: "Hojii Uumi",
    editTask: "Hojii Fooyyessi",
    taskTitle: "Mata duree",
    taskDescription: "Ibsa",
    priority: "Dursa",
    status: "Haala",
    dueDate: "Guyyaa xumuraa",
    assignTo: "Kenna",
    assignedTo: "Kenname",
    createdBy: "Kan uume",
    pending: "Eegaa jira",
    inProgress: "Adeemsa keessa",
    completed: "Xumurameera",
    low: "Gadi aanaa",
    medium: "Giddugaleessa",
    high: "Ol aanaa",
    overdue: "Yeroon darbeera",
    pickDate: "Guyyaa filadhu",
    unassigned: "Hin kennamnee",
    searchTasks: "Hojiiwwan barbaadi...",
    noTasksFound: "Hojiin hin argamne",
    createFirstTask: "Hojii kee jalqabaa uumi!",
    taskCreated: "Hojiin milkaa'inaan uumameera",
    taskUpdated: "Hojiin milkaa'inaan haaromfameera",
    taskDeleted: "Hojiin milkaa'inaan haqameera",
    confirmDelete: "Dhugumatti hojii kana haquu barbaaddaa?",
    taskAssigned: "Hojiin Kennameera",
    newComment: "Yaada Haaraa",
  },
}
export function useTranslation(language: Language): Translations {
  return translations[language] || translations.en
}
export function getTranslation(language: Language, key: keyof Translations): string {
  return translations[language]?.[key] || translations.en[key] || key
}
