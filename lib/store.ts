import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Task, User, UserRole } from "./database"
interface AuthState {
  user: User | null
  userRole: UserRole | null
  isAuthenticated: boolean
  login: (user: User, role: UserRole) => void
  logout: () => void
}
interface TaskState {
  tasks: Task[]
  selectedTask: Task | null
  filters: {
    status: string
    priority: string
    assignedTo: string
    search: string
  }
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: number, updates: Partial<Task>) => void
  deleteTask: (id: number) => void
  setSelectedTask: (task: Task | null) => void
  setFilters: (filters: Partial<TaskState["filters"]>) => void
}
interface UIState {
  language: "en" | "am" | "or"
  sidebarOpen: boolean
  setLanguage: (language: "en" | "am" | "or") => void
  setSidebarOpen: (open: boolean) => void
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userRole: null,
      isAuthenticated: false,
      login: (user, role) => set({ user, userRole: role, isAuthenticated: true }),
      logout: () => set({ user: null, userRole: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
)
export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  selectedTask: null,
  filters: {
    status: "",
    priority: "",
    assignedTo: "",
    search: "",
  },
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
}))
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: "en",
      sidebarOpen: true,
      setLanguage: (language) => set({ language }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "ui-storage",
    },
  ),
)
