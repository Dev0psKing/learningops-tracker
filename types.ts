
export enum Status {
  NOT_STARTED = "Not Started",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  BLOCKED = "Blocked"
}

export enum Difficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard",
  VERY_HARD = "Very Hard"
}

export type UserRole = 'Curriculum Lead' | 'Accountability Lead';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarInitials: string;
  color: string;
}

export interface Evidence {
  type: 'link' | 'file' | 'note';
  content: string; // URL or text
  submittedAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  type: 'Topic' | 'Task' | 'Project' | 'Compensation';
  status: Status;
  ownerId: string; // 'collins' | 'sophia'
  dueDate?: string;
  evidence?: Evidence;
  originalTaskId?: string; // For compensation tasks
}

export interface WeekModule {
  id: number;
  title: string;
  theme: string;
  startDate?: string;
  items: TaskItem[];
}

export interface StudyLog {
  id: string;
  date: string;
  hours: number;
  notes: string;
  difficulty: Difficulty;
  userId: string;
}

export interface UserStats {
  totalHours: number;
  completedTasks: number;
  currentStreak: number;
  completionRate: number;
}

export interface ChartDataPoint {
  name: string;
  collins: number;
  sophia: number;
}

export type ScoreStatus = 'On Track' | 'Needs Adjustment' | 'Intervention Required';

export interface WeeklyScore {
  id: string;
  weekId: number;
  userId: string;
  mastery: number; // 0-5
  output: number; // 0-5
  consistency: number; // 0-5
  collaboration: number; // 0-5
  total: number; // 0-20
  status: ScoreStatus;
  dateLogged: string;
}

export interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionRequired?: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  weekId: number;
  userId: string;
  type: 'Daily' | 'Weekly';
  learned: string;
  confused: string;
  fixed: string;
  takeaway: string;
  tags: string[];
}

export type ReadinessStatus = 'Weak' | 'Developing' | 'Strong';

export const ReadinessDimensions = [
  "Data Sourcing",
  "Data Cleaning",
  "Analysis",
  "Visualization",
  "Insight Communication"
] as const;

export type ReadinessDimension = typeof ReadinessDimensions[number];

export interface DimensionData {
  status: ReadinessStatus;
  evidence: string[]; // List of URLs/Notes
}

export interface CapstoneState {
  userId: string;
  dimensions: Record<ReadinessDimension, DimensionData>;
}

// --- DOCUMENTATION FEATURE TYPES ---

export type DocCategory = 'Python' | 'SQL' | 'Tableau' | 'Concepts' | 'Capstone' | 'Other';

export interface DocEntry {
  id: string;
  userId: string;
  title: string;
  category: DocCategory;
  dimensions: ReadinessDimension[];
  summary: string;
  evidenceLinks: string[];
  status: ReadinessStatus;
  justification: string;
  reflection: string;
  timestamp: string;
  lastUpdated: string;
  revisionCount: number;
}
