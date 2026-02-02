import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import Syllabus from './components/Syllabus';
import Tracker from './components/Tracker';
import Scorecard from './components/Scorecard';
import Journal from './components/Journal';
import CapstoneReadiness from './components/CapstoneReadiness';
import NotificationPanel from './components/NotificationPanel';
import LandingPage from './components/LandingPage';
import Documentation from './components/Documentation';
import SystemGuide from './components/SystemGuide';
import RetentionEngine from './components/RetentionEngine';
import AiAnalyst from './components/AiAnalyst';
import Projects from './components/Projects';
import useLocalStorage from './hooks/useLocalStorage';
import { LayoutDashboard, BookOpen, Activity, Target, Bell, Notebook, Briefcase, FileText, HelpCircle, Settings, Sun, Moon, Download, Upload, Layers, Database, CheckCircle, AlertTriangle, Sparkles, Menu, X, Terminal } from './components/Icons';
import { UserStats, WeekModule, StudyLog, User, Status, WeeklyScore, Notification, TaskItem, JournalEntry, CapstoneState, ReadinessDimensions, ReadinessDimension, Difficulty, DocEntry, Flashcard, UserProject } from './types';

// --- HELPERS ---
const getRelativeDate = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

// --- INITIAL DATA SEEDING (CLEAN SLATE) ---
const INITIAL_USERS: User[] = [
  { id: 'collins', name: 'Collins', role: 'Curriculum Lead', avatarInitials: 'CO', color: 'bg-blue-600' },
  { id: 'sophia', name: 'Sophia', role: 'Accountability Lead', avatarInitials: 'SO', color: 'bg-emerald-500' }
];

const initProgress = () => ({
  collins: { status: Status.NOT_STARTED },
  sophia: { status: Status.NOT_STARTED }
});

// 9-Week Data Analytics Roadmap - RESET TO DAY 0
const INITIAL_MODULES: WeekModule[] = [
  {
    id: 1,
    title: "Week 1: Basic Python",
    theme: "Foundations & Syntax",
    startDate: getRelativeDate(0),
    items: [
      { id: "w1-d1", title: "Day 1: Intro to Data Analytics & Python", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(1) },
      { id: "w1-d2", title: "Day 2: Python Basics – Data Types & Control Flow", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(2) },
      { id: "w1-d3", title: "Day 3: Loops and Functions", type: "Task", progress: initProgress(), dueDate: getRelativeDate(3) },
      { id: "w1-d4", title: "Day 4: String and List", type: "Task", progress: initProgress(), dueDate: getRelativeDate(4) },
      { id: "w1-d5", title: "Day 5: Dictionary, Tuple and Set", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(5) },
      { id: "w1-d6", title: "Day 6: Python Collections", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(6) },
      { id: "w1-d7", title: "Day 7: Advanced Python Concepts", type: "Project", progress: initProgress(), dueDate: getRelativeDate(7) },
    ]
  },
  {
    id: 2,
    title: "Week 2: Maths for Data Analysis",
    theme: "Statistics & Probability",
    startDate: getRelativeDate(7),
    items: [
      { id: "w2-d8", title: "Day 8: Introduction to Statistics", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(8) },
      { id: "w2-d9", title: "Day 9: Probability & Distributions", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(9) },
      { id: "w2-d10", title: "Day 10: Understanding Data Relationships", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(10) },
      { id: "w2-d11", title: "Day 11: CLT & Hypothesis Testing", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(11) },
      { id: "w2-d12", title: "Day 12: Parametric Testing Techniques", type: "Task", progress: initProgress(), dueDate: getRelativeDate(12) },
      { id: "w2-d13", title: "Day 13: Non-Parametric Testing", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(13) },
      { id: "w2-d14", title: "Day 14: Data Skewness Detection", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(14) },
    ]
  },
  {
    id: 3,
    title: "Week 3: NumPy and Pandas",
    theme: "Data Manipulation",
    startDate: getRelativeDate(14),
    items: [
      { id: "w3-d15", title: "Day 15: Introduction to NumPy", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(15) },
      { id: "w3-d16", title: "Day 16: Introduction to Pandas", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(16) },
      { id: "w3-d17", title: "Day 17: Data Inspection in Pandas", type: "Task", progress: initProgress(), dueDate: getRelativeDate(17) },
      { id: "w3-d18", title: "Day 18: Pandas Advanced Operations", type: "Task", progress: initProgress(), dueDate: getRelativeDate(18) },
      { id: "w3-d19", title: "Day 19: Missing Data Handling", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(19) },
      { id: "w3-d20", title: "Day 20: Outlier Detection", type: "Task", progress: initProgress(), dueDate: getRelativeDate(20) },
      { id: "w3-d21", title: "Day 21: Duplicate Data Handling", type: "Task", progress: initProgress(), dueDate: getRelativeDate(21) },
    ]
  },
  {
    id: 4,
    title: "Week 4: Data Visualization",
    theme: "Matplotlib & Seaborn",
    startDate: getRelativeDate(21),
    items: [
      { id: "w4-d22", title: "Day 22: Matplotlib Visualization", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(22) },
      { id: "w4-d23", title: "Day 23: Seaborn Visualization", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(23) },
      { id: "w4-d24", title: "Day 24: Interactive Viz with Plotly", type: "Task", progress: initProgress(), dueDate: getRelativeDate(24) },
      { id: "w4-d25", title: "Day 25: Correlation Matrix & Heatmaps", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(25) },
      { id: "w4-d26", title: "Day 26: Time Series Visualization", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(26) },
      { id: "w4-d27", title: "Day 27: Project - Word Clouds", type: "Project", progress: initProgress(), dueDate: getRelativeDate(27) },
      { id: "w4-d28", title: "Day 28: Project - Zomato Analysis", type: "Project", progress: initProgress(), dueDate: getRelativeDate(28) },
    ]
  },
  {
    id: 5,
    title: "Week 5: Web Scraping and EDA",
    theme: "Scraping & Cleaning",
    startDate: getRelativeDate(28),
    items: [
      { id: "w5-d29", title: "Day 29: Intro to Web Scraping", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(29) },
      { id: "w5-d30", title: "Day 30: Web Scraping Tools", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(30) },
      { id: "w5-d31", title: "Day 31: Dynamic Web Scraping", type: "Task", progress: initProgress(), dueDate: getRelativeDate(31) },
      { id: "w5-d32", title: "Day 32: Post-Scraping Data Cleaning", type: "Task", progress: initProgress(), dueDate: getRelativeDate(32) },
      { id: "w5-d33", title: "Day 33: Exploratory Data Analysis", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(33) },
      { id: "w5-d34", title: "Day 34: Advanced EDA Project", type: "Project", progress: initProgress(), dueDate: getRelativeDate(34) },
      { id: "w5-d35", title: "Day 35: Project - Scrape & Analyze Integration", type: "Project", progress: initProgress(), dueDate: getRelativeDate(35) },
    ]
  },
  {
    id: 6,
    title: "Week 6: Excel Mastery",
    theme: "Spreadsheets",
    startDate: getRelativeDate(35),
    items: [
      { id: "w6-d36", title: "Day 36: Excel Basics", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(36) },
      { id: "w6-d37", title: "Day 37: Excel Data Management", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(37) },
      { id: "w6-d38", title: "Day 38: Lookup & Text Functions", type: "Task", progress: initProgress(), dueDate: getRelativeDate(38) },
      { id: "w6-d39", title: "Day 39: Logical & Date Functions", type: "Task", progress: initProgress(), dueDate: getRelativeDate(39) },
      { id: "w6-d40", title: "Day 40: Excel Pivot Tables", type: "Task", progress: initProgress(), dueDate: getRelativeDate(40) },
      { id: "w6-d41", title: "Day 41: Charting & Dashboards", type: "Task", progress: initProgress(), dueDate: getRelativeDate(41) },
      { id: "w6-d42", title: "Day 42: Project - Sales Data Analysis", type: "Project", progress: initProgress(), dueDate: getRelativeDate(42) },
    ]
  },
  {
    id: 7,
    title: "Week 7: SQL",
    theme: "Database Querying",
    startDate: getRelativeDate(42),
    items: [
      { id: "w7-d43", title: "Day 43: Intro to SQL", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(43) },
      { id: "w7-d44", title: "Day 44: SQL Basics", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(44) },
      { id: "w7-d45", title: "Day 45: SQL Aggregations", type: "Task", progress: initProgress(), dueDate: getRelativeDate(45) },
      { id: "w7-d46", title: "Day 46: SQL Joins", type: "Task", progress: initProgress(), dueDate: getRelativeDate(46) },
      { id: "w7-d47", title: "Day 47: Operators & Subqueries", type: "Task", progress: initProgress(), dueDate: getRelativeDate(47) },
      { id: "w7-d48", title: "Day 48: Window Functions & Optimization", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(48) },
      { id: "w7-d49", title: "Day 49: Project - Customer Revenue Analysis", type: "Project", progress: initProgress(), dueDate: getRelativeDate(49) },
    ]
  },
  {
    id: 8,
    title: "Week 8: Power BI",
    theme: "Business Intelligence",
    startDate: getRelativeDate(49),
    items: [
      { id: "w8-d50", title: "Day 50: Power BI Intro", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(50) },
      { id: "w8-d51", title: "Day 51: Data Preparation", type: "Task", progress: initProgress(), dueDate: getRelativeDate(51) },
      { id: "w8-d52", title: "Day 52: DAX Basics", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(52) },
      { id: "w8-d53", title: "Day 53: Advanced DAX", type: "Task", progress: initProgress(), dueDate: getRelativeDate(53) },
      { id: "w8-d54", title: "Day 54: Visualizations", type: "Task", progress: initProgress(), dueDate: getRelativeDate(54) },
      { id: "w8-d55", title: "Day 55: Dashboards & Reports", type: "Project", progress: initProgress(), dueDate: getRelativeDate(55) },
      { id: "w8-d56", title: "Day 56: Project - Inventory Management", type: "Project", progress: initProgress(), dueDate: getRelativeDate(56) },
    ]
  },
  {
    id: 9,
    title: "Week 9: Tableau",
    theme: "Visual Analytics",
    startDate: getRelativeDate(56),
    items: [
      { id: "w9-d57", title: "Day 57: Intro to Tableau", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(57) },
      { id: "w9-d58", title: "Day 58: Charting Basics", type: "Task", progress: initProgress(), dueDate: getRelativeDate(58) },
      { id: "w9-d59", title: "Day 59: Data Structure", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(59) },
      { id: "w9-d60", title: "Day 60: Calculated Fields", type: "Task", progress: initProgress(), dueDate: getRelativeDate(60) },
      { id: "w9-d61", title: "Day 61: Filters & Actions", type: "Task", progress: initProgress(), dueDate: getRelativeDate(61) },
      { id: "w9-d62", title: "Day 62: Tableau Dashboards", type: "Project", progress: initProgress(), dueDate: getRelativeDate(62) },
      { id: "w9-d63", title: "Day 63: Project - COVID-19 World Dashboard", type: "Project", progress: initProgress(), dueDate: getRelativeDate(63) },
    ]
  }
];

// Empty Initial State
const MOCK_LOGS: StudyLog[] = [];
const MOCK_SCORES: WeeklyScore[] = [];
const MOCK_JOURNAL: JournalEntry[] = [];
const INITIAL_DOC_ENTRIES: DocEntry[] = [];
const INITIAL_FLASHCARDS: Flashcard[] = [];

const INITIAL_CAPSTONE: CapstoneState[] = INITIAL_USERS.map(u => ({
  userId: u.id,
  dimensions: ReadinessDimensions.reduce((acc, dim) => ({
    ...acc,
    [dim]: { status: 'Weak', evidence: [] }
  }), {} as Record<ReadinessDimension, any>)
}));

enum Tab {
  DASHBOARD = 'dashboard',
  SYLLABUS = 'syllabus',
  TRACKER = 'tracker',
  SCORECARD = 'scorecard',
  JOURNAL = 'journal',
  RETENTION = 'retention',
  PROJECTS = 'projects',
  CAPSTONE = 'capstone',
  DOCUMENTATION = 'documentation',
  ANALYST = 'analyst',
  GUIDE = 'guide'
}
const DEFAULT_PROJECT: UserProject = {
    id: 'init-project',
    userId: 'system',
    title: 'My First Script',
    problemStatement: 'Write a python script that prints the sum of a list of numbers.\n\nExample list: [1, 2, 3, 4, 5]',
    code: "def calculate_sum(numbers):\n    return sum(numbers)\n\nmy_list = [1, 2, 3, 4, 5]\nprint(f'Sum: {calculate_sum(my_list)}')",
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    tags: ['Python'],
    status: 'active'
};

type SystemMessage = {
  type: 'success' | 'error' | 'info';
  text: string;
};

const App: React.FC = () => {
  // --- STATE ---
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [systemMessage, setSystemMessage] = useState<SystemMessage | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024); // Open by default on large screens

  // Theme State
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('lo_theme', 'light');

  // Persisted Data
  const [users, setUsers] = useLocalStorage<User[]>('lo_users', INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string>('lo_current_user_id', INITIAL_USERS[0].id);
  const [projects, setProjects] = useLocalStorage<UserProject[]>('user_projects_v2', [DEFAULT_PROJECT]);
  const [modules, setModules] = useLocalStorage<WeekModule[]>('lo_modules_v2', INITIAL_MODULES);
  const [logs, setLogs] = useLocalStorage<StudyLog[]>('lo_logs', MOCK_LOGS);
  const [scores, setScores] = useLocalStorage<WeeklyScore[]>('lo_scores', MOCK_SCORES);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('lo_journal', MOCK_JOURNAL);
  const [capstoneState, setCapstoneState] = useLocalStorage<CapstoneState[]>('lo_capstone', INITIAL_CAPSTONE);
  const [docEntries, setDocEntries] = useLocalStorage<DocEntry[]>('lo_documentation', INITIAL_DOC_ENTRIES);
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>('lo_flashcards', INITIAL_FLASHCARDS);

  // Transient
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lateTasks, setLateTasks] = useState<TaskItem[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskItem[]>([]);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // --- ERROR/SUCCESS NOTIFICATION HELPERS ---
  const onNotify = (type: 'success' | 'error' | 'info', message: string) => {
    setSystemMessage({ type, text: message });
  };

  // --- THEME EFFECT ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- MESSAGE BANNER ---
  useEffect(() => {
    if (systemMessage) {
      const timer = setTimeout(() => setSystemMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [systemMessage]);

  // --- ACTIONS ---

  const handleResetData = () => {
    if (window.confirm("WARNING: This will delete ALL data and reset the workspace to Day 0. This cannot be undone.")) {
      try {
        // 1. Wipe Storage
        window.localStorage.clear();

        // 2. Soft Reset of React State (This updates UI immediately without relying on browser reload)
        setUsers(INITIAL_USERS);
        setModules(INITIAL_MODULES);
        setLogs(MOCK_LOGS);
        setScores(MOCK_SCORES);
        setJournalEntries(MOCK_JOURNAL);
        setCapstoneState(INITIAL_CAPSTONE);
        setDocEntries(INITIAL_DOC_ENTRIES);
        setFlashcards(INITIAL_FLASHCARDS);
        setCurrentUserId(INITIAL_USERS[0].id);

        // Reset UI Toggles
        setShowLanding(true);
        setIsSettingsOpen(false);
        setActiveTab(Tab.DASHBOARD);

        setSystemMessage({ type: 'success', text: 'Workspace Factory Reset Complete.' });
      } catch (e) {
        console.error(e);
        setSystemMessage({ type: 'error', text: 'Reset failed. Please clear browser cache manually.' });
      }
    }
  };

  const handleExportData = () => {
    try {
      const data = {
        users,
        modules,
        logs,
        scores,
        journalEntries,
        capstoneState,
        docEntries,
        flashcards,
        projects,
        timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learningops-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSystemMessage({ type: 'success', text: 'Backup exported successfully.' });
    } catch (e: any) {
      console.error(e);
      setSystemMessage({ type: 'error', text: 'Export Failed: ' + e.message });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Reset input immediately so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (!file) return;

    const reader = new FileReader();

    reader.onerror = () => {
      setSystemMessage({ type: 'error', text: 'Failed to read file.' });
    };

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        let data;
        try {
          data = JSON.parse(json);
        } catch(parseErr) {
          setSystemMessage({ type: 'error', text: 'Invalid JSON file format.' });
          return;
        }

        if (!data.users || !data.modules) {
          setSystemMessage({ type: 'error', text: 'Invalid file content. Missing core data.' });
          return;
        }

        if(window.confirm(`Smart Sync with backup from ${new Date(data.timestamp).toLocaleString()}? \n\nThis will combine the other user's progress with yours. Your own local progress will be preserved.`)) {

          // Helper: User-Centric Merge
          
          const mergeUserData = <T extends { id: string, userId: string }>(local: T[], incoming: T[] = [], myId: string): T[] => {
            const myLocal = local.filter(l => l.userId === myId);
            const othersIncoming = incoming.filter(i => i.userId !== myId);
            const merged = new Map();
            [...myLocal, ...othersIncoming].forEach(item => merged.set(item.id, item));
            return Array.from(merged.values());
          };

          // 1. User Data Merges (Direct State Updates)
          setLogs(mergeUserData(logs, data.logs, currentUser.id));
          setScores(mergeUserData(scores, data.scores, currentUser.id));
          setJournalEntries(mergeUserData(journalEntries, data.journalEntries, currentUser.id));
          setDocEntries(mergeUserData(docEntries, data.docEntries, currentUser.id));
          setFlashcards(mergeUserData(flashcards, data.flashcards, currentUser.id));
          setProjects(mergeUserData(projects, data.projects, currentUser.id));

          // 2. Capstone State Merge
          const mergedCapstone = [...capstoneState];
          (data.capstoneState || []).forEach((incState: CapstoneState) => {
            if (incState.userId !== currentUser.id) {
              const localIndex = mergedCapstone.findIndex(c => c.userId === incState.userId);
              if (localIndex === -1) {
                mergedCapstone.push(incState);
              } else {
                mergedCapstone[localIndex] = incState;
              }
            }
          });
          setCapstoneState(mergedCapstone);

          // 3. Modules & Progress Merge
          const mergedModules = modules.map(localMod => {
            const incMod = (data.modules || []).find((m: WeekModule) => m.id === localMod.id);
            if (!incMod) return localMod;

            const mergedItems = localMod.items.map(localItem => {
              const incItem = incMod.items.find((i: TaskItem) => i.id === localItem.id);
              if (!incItem) return localItem;

              const newProgress = { ...incItem.progress };
              // Force override my specific key with my local status
              if (localItem.progress[currentUser.id]) {
                newProgress[currentUser.id] = localItem.progress[currentUser.id];
              }
              return { ...localItem, progress: newProgress };
            });

            // Add new items
            incMod.items.forEach((incItem: TaskItem) => {
              if (!mergedItems.find(i => i.id === incItem.id)) {
                mergedItems.push(incItem);
              }
            });

            return { ...localMod, items: mergedItems };
          });
          setModules(mergedModules);

          setSystemMessage({ type: 'success', text: 'Smart Sync Complete! Partner data updated.' });
          setIsSettingsOpen(false);
        }
      } catch (err: any) {
        console.error(err);
        setSystemMessage({ type: 'error', text: 'Import processing error: ' + err.message });
      }
    };

    reader.readAsText(file);
  };

  // --- RULES ENGINE (Calculations) ---
  const stats = React.useMemo(() => {
    const userStats: Record<string, UserStats> = {};

    users.forEach(u => {
      const userLogs = logs.filter(l => l.userId === u.id);
      const totalHours = userLogs.reduce((acc, l) => acc + l.hours, 0);

      // Calculate Completed Tasks
      let completedTasks = 0;
      let totalTasks = 0;
      modules.forEach(m => m.items.forEach(i => {
        if (!i.assigneeId || i.assigneeId === u.id) {
          totalTasks++;
          if (i.progress[u.id]?.status === Status.COMPLETED) completedTasks++;
        }
      }));

      // Calculate Streak
      const today = new Date();
      let streak = 0;
      const dates = new Set(userLogs.map(l => l.date));
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (dates.has(dateStr)) streak++;
        else if (i > 0) break; // Break if missed a day (allow today to be missed if i=0)
      }

      userStats[u.id] = {
        totalHours,
        completedTasks,
        currentStreak: streak,
        completionRate: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
      };
    });

    return userStats;
  }, [logs, modules, users]);

  // --- NOTIFICATION & TASK ALERTS ---
  useEffect(() => {
    const newNotifs: Notification[] = [];
    const late: TaskItem[] = [];
    const upcoming: TaskItem[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Check Tasks
    modules.forEach(m => {
      m.items.forEach(t => {
        if (!t.dueDate) return;

        const isMyTask = !t.assigneeId || t.assigneeId === currentUser.id;
        const myStatus = t.progress[currentUser.id]?.status || Status.NOT_STARTED;

        // Late Check
        if (t.dueDate < today && myStatus !== Status.COMPLETED && isMyTask) {
          late.push(t);
        }

        // Upcoming Check
        const diffTime = new Date(t.dueDate).getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 3 && myStatus !== Status.COMPLETED && isMyTask) {
          upcoming.push(t);
        }
      });
    });

    // Generate Notifications based on Rules
    if (late.length > 0) {
      newNotifs.push({
        id: 'late-alert',
        type: 'alert',
        title: 'Velocity Alert',
        message: `You have ${late.length} overdue tasks. This is creating technical debt.`,
        timestamp: today,
        actionRequired: true
      });
    }

    if (stats[currentUser.id]?.currentStreak > 3) {
      newNotifs.push({
        id: 'streak-info',
        type: 'info',
        title: 'Consistency Streak',
        message: `You are on a ${stats[currentUser.id].currentStreak} day streak. Keep pushing!`,
        timestamp: today
      });
    }

    setNotifications(newNotifs);
    setLateTasks(late);
    setUpcomingTasks(upcoming);
  }, [modules, stats, currentUser.id]);

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} onReset={handleResetData} />;
  }

  // Sidebar Menu Configuration
  const MENU_ITEMS = [
    { id: Tab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: Tab.SYLLABUS, label: 'Roadmap', icon: BookOpen },
    { id: Tab.PROJECTS, label: 'Project Lab', icon: Terminal },
    { id: Tab.TRACKER, label: 'Tracker', icon: Activity },
    { id: Tab.SCORECARD, label: 'Scorecard', icon: Target },
    { id: Tab.JOURNAL, label: 'Journal', icon: Notebook },
    { id: Tab.RETENTION, label: 'Retention', icon: Layers },
    { id: Tab.CAPSTONE, label: 'Capstone', icon: Briefcase },
    { id: Tab.DOCUMENTATION, label: 'Evidence Log', icon: FileText },
    { id: Tab.ANALYST, label: 'Neural Analyst', icon: Sparkles },
    { id: Tab.GUIDE, label: 'System Guide', icon: HelpCircle },
  ];

  return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">

        {/* --- SIDEBAR BACKDROP (Mobile) --- */}
        {isSidebarOpen && (
            <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
            />
        )}

        {/* --- SIDEBAR --- */}
        <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-64 lg:w-0 lg:overflow-hidden'}
      `}>
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">LO</div>
              <span className="font-bold text-white tracking-tight text-lg">LearningOps</span>
            </div>
            {/* Mobile Close Button */}
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {MENU_ITEMS.map(item => (
                <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as Tab);
                      // On mobile, close sidebar after selection
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === item.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'hover:bg-slate-800 hover:text-white text-slate-400'
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-200' : 'text-slate-500 group-hover:text-white'}`} />
                  {item.label}
                </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800 shrink-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">Workspace</div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              System Operational
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT WRAPPER --- */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">

          {/* Notification Toast */}
          {systemMessage && (
              <div className={`absolute top-20 lg:top-6 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in w-[90%] lg:w-auto justify-center ${
                  systemMessage.type === 'success' ? 'bg-emerald-600 text-white' :
                      systemMessage.type === 'error' ? 'bg-rose-600 text-white' :
                          'bg-slate-800 text-white'
              }`}>
                {systemMessage.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                {systemMessage.type === 'error' && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                <span className="font-medium text-sm text-center">{systemMessage.text}</span>
              </div>
          )}

          {/* --- HEADER --- */}
          <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
            <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
              {/* Toggle Sidebar Button */}
              <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex flex-col truncate">
                <h2 className="text-lg lg:text-2xl font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {MENU_ITEMS.find(i => i.id === activeTab)?.label}
                </h2>
                <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>Collaborative Workspace</span>
                  <span>•</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">Viewing as {currentUser.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-6 flex-shrink-0">
              {/* User Switcher Row - Optimized for Mobile */}
              <div className="flex items-center gap-1 lg:gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0">
                {users.map(u => (
                    <button
                        key={u.id}
                        onClick={() => setCurrentUserId(u.id)}
                        title={`Switch to ${u.name}`}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                            currentUser.id === u.id
                                ? `${u.color} text-white shadow-sm ring-2 ring-white dark:ring-slate-900 z-10`
                                : 'text-slate-500 hover:bg-white dark:hover:bg-slate-700 opacity-60 hover:opacity-100'
                        }`}
                    >
                      {u.avatarInitials}
                    </button>
                ))}
              </div>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

              <button
                  onClick={() => setIsNotifPanelOpen(true)}
                  className="relative p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {(notifications.length > 0 || lateTasks.length > 0) && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900"></span>
                )}
              </button>

              {/* Settings Toggle */}
              <div className="relative">
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <Settings className="w-6 h-6" />
                </button>

                {/* Settings Dropdown */}
                {isSettingsOpen && (
                    <div className="absolute top-full right-0 mt-4 w-56 lg:w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in origin-top-right">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Config</p>
                      </div>

                      <button
                          onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                      >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400"/> : <Moon className="w-4 h-4 text-indigo-400"/>}
                        Toggle Theme
                      </button>

                      <button
                          onClick={() => { handleExportData(); setIsSettingsOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                      >
                        <Download className="w-4 h-4 text-emerald-500"/>
                        Backup Data
                      </button>

                      <label className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-blue-500"/>
                        Import / Sync
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImportData}
                        />
                      </label>

                      <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>

                      <button
                          onClick={handleResetData}
                          className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4"/>
                        Factory Reset
                      </button>
                    </div>
                )}
              </div>
            </div>
          </header>

          {/* --- SCROLLABLE CONTENT --- */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 w-full">
            <div className="max-w-7xl mx-auto">
              {activeTab === Tab.DASHBOARD && (
                  <Dashboard
                      currentUser={currentUser}
                      users={users}
                      stats={stats}
                      modules={modules}
                      scores={scores}
                  />
              )}

              {activeTab === Tab.SYLLABUS && (
                  <Syllabus
                      modules={modules}
                      setModules={setModules}
                      currentUser={currentUser}
                      users={users}
                  />
              )}

              {activeTab === Tab.PROJECTS && (
                  <Projects 
                    currentUser={currentUser} 
                    setLogs={setLogs} 
                    logs={logs}
                    projects = {projects}
                    setProjects = {setProjects} 
                  />
              )}

              {activeTab === Tab.TRACKER && (
                  <Tracker
                      logs={logs}
                      setLogs={setLogs}
                      currentUser={currentUser}
                      currentModule={modules.find(m => {
                        const now = new Date().toISOString().split('T')[0];
                        return m.startDate && m.startDate <= now && (!m.items[m.items.length-1].dueDate || m.items[m.items.length-1].dueDate! >= now);
                      })}
                  />
              )}

              {activeTab === Tab.SCORECARD && (
                  <Scorecard
                      currentUser={currentUser}
                      users={users}
                      modules={modules}
                      scores={scores}
                      setScores={setScores}
                  />
              )}

              {activeTab === Tab.JOURNAL && (
                  <Journal
                      entries={journalEntries}
                      setEntries={setJournalEntries}
                      currentUser={currentUser}
                      users={users}
                      modules={modules}
                      setFlashcards={setFlashcards}
                  />
              )}

              {activeTab === Tab.DOCUMENTATION && (
                  <Documentation
                      entries={docEntries}
                      setEntries={setDocEntries}
                      currentUser={currentUser}
                  />
              )}

              {activeTab === Tab.CAPSTONE && (
                  <CapstoneReadiness
                      currentUser={currentUser}
                      capstoneState={capstoneState}
                      setCapstoneState={setCapstoneState}
                      docEntries={docEntries}
                      onNotify={onNotify}
                  />
              )}

              {activeTab === Tab.RETENTION && (
                  <RetentionEngine
                      currentUser={currentUser}
                      cards={flashcards}
                      setCards={setFlashcards}
                      onNotify={onNotify}
                  />
              )}

              {activeTab === Tab.ANALYST && (
                  <AiAnalyst
                      users={users}
                      logs={logs}
                      modules={modules}
                      scores={scores}
                      capstoneState={capstoneState}
                      onNotify={onNotify}
                  />
              )}

              {activeTab === Tab.GUIDE && <SystemGuide />}
            </div>
          </main>
        </div>

        <NotificationPanel
            isOpen={isNotifPanelOpen}
            onClose={() => setIsNotifPanelOpen(false)}
            notifications={notifications}
            lateTasks={lateTasks}
            upcomingTasks={upcomingTasks}
            users={users}
            currentUser={currentUser}
        />

      </div>
  );
};

export default App;
