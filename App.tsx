import React, { useState, useEffect } from 'react';
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
import useLocalStorage from './hooks/useLocalStorage';
import { LayoutDashboard, BookOpen, Activity, Target, Bell, Notebook, Briefcase, FileText, HelpCircle, Settings, Sun, Moon, Download, Upload } from './components/Icons';
import { UserStats, WeekModule, StudyLog, User, Status, WeeklyScore, Notification, TaskItem, JournalEntry, CapstoneState, ReadinessDimensions, ReadinessDimension, Difficulty, DocEntry } from './types';

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
  CAPSTONE = 'capstone',
  DOCUMENTATION = 'documentation',
  GUIDE = 'guide'
}

const App: React.FC = () => {
  // --- STATE ---
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);

  // Theme State
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('lo_theme', 'light');

  // Persisted Data
  const [users, setUsers] = useLocalStorage<User[]>('lo_users', INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string>('lo_current_user_id', INITIAL_USERS[0].id);

  // We used to store 'lo_modules', but changed data structure, so use 'lo_modules_v2'
  const [modules, setModules] = useLocalStorage<WeekModule[]>('lo_modules_v2', INITIAL_MODULES);

  const [logs, setLogs] = useLocalStorage<StudyLog[]>('lo_logs', MOCK_LOGS);
  const [scores, setScores] = useLocalStorage<WeeklyScore[]>('lo_scores', MOCK_SCORES);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('lo_journal', MOCK_JOURNAL);
  const [capstoneState, setCapstoneState] = useLocalStorage<CapstoneState[]>('lo_capstone', INITIAL_CAPSTONE);
  const [docEntries, setDocEntries] = useLocalStorage<DocEntry[]>('lo_documentation', INITIAL_DOC_ENTRIES);

  // Transient
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lateTasks, setLateTasks] = useState<TaskItem[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskItem[]>([]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // --- THEME EFFECT ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- DEMO ACTIONS ---
  const handleResetData = () => {
    if (confirm("Reset all data to a clean state (Day 0)? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = {
      users,
      modules,
      logs,
      scores,
      journalEntries,
      capstoneState,
      docEntries,
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
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Validate basic structure
        if (data.users && data.modules) {
          if(confirm(`Import backup from ${data.timestamp}? This will overwrite current data.`)) {
            setUsers(data.users);
            setModules(data.modules);
            setLogs(data.logs || []);
            setScores(data.scores || []);
            setJournalEntries(data.journalEntries || []);
            setCapstoneState(data.capstoneState || []);
            setDocEntries(data.docEntries || []);
            alert('Data imported successfully!');
            setIsSettingsOpen(false);
          }
        } else {
          alert('Invalid file format.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse file.');
      }
    };
    reader.readAsText(file);
  };

  // --- LOGIC HELPERS ---
  const getCurrentModule = () => {
    const today = new Date().toISOString().split('T')[0];
    const active = modules.filter(m => m.startDate && m.startDate <= today);
    return active.length > 0 ? active[active.length - 1] : modules[0];
  };

  const currentModule = getCurrentModule();

  // --- RULES ENGINE ---
  useEffect(() => {
    runAccountabilityRules();
  }, [modules, journalEntries, currentUser]);

  const runAccountabilityRules = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const newNotifications: Notification[] = [];
    const foundLateTasks: TaskItem[] = [];
    const foundUpcomingTasks: TaskItem[] = [];
    const missedCounts: Record<string, number> = { collins: 0, sophia: 0 };

    const updatedModules = JSON.parse(JSON.stringify(modules));
    let modulesChanged = false;

    updatedModules.forEach((module: WeekModule) => {
      module.items.forEach((item: TaskItem) => {
        // We only check accountability for items without an assignee OR items assigned to a user
        users.forEach(user => {
          if (item.assigneeId && item.assigneeId !== user.id) return;

          const userProgress = item.progress[user.id] || { status: Status.NOT_STARTED };

          // Check Late
          if (item.dueDate && item.dueDate < todayStr && userProgress.status !== Status.COMPLETED) {
            // To avoid duplication in the 'found' list which feeds the panel
            if (!foundLateTasks.find(t => t.id === item.id)) {
              foundLateTasks.push(item);
            }
            missedCounts[user.id]++;

            // Auto-generate Compensation Task for THIS user
            const compId = `comp-${item.id}-${user.id}`;
            const alreadyExists = module.items.find((i: TaskItem) => i.id === compId);

            if (!alreadyExists && item.type !== 'Compensation') {
              module.items.push({
                id: compId,
                title: `Compensation: ${item.title} (${user.name})`,
                type: 'Compensation',
                assigneeId: user.id, // Assigned ONLY to the offender
                progress: initProgress(), // Initialize for everyone but only owner sees it
                dueDate: getRelativeDate(1),
                originalTaskId: item.id
              });
              modulesChanged = true;
            }
          }

          // Check Upcoming for CURRENT USER only for notification panel context
          if (user.id === currentUser.id) {
            if (item.dueDate && item.dueDate >= todayStr && item.dueDate <= getRelativeDate(3) && userProgress.status !== Status.COMPLETED) {
              foundUpcomingTasks.push(item);
            }
          }
        });
      });
    });

    Object.entries(missedCounts).forEach(([userId, count]) => {
      if (count >= 2) {
        newNotifications.push({
          id: `alert-${userId}-${todayStr}`,
          type: 'alert',
          title: 'Velocity Alert',
          message: `${users.find(u => u.id === userId)?.name || userId} has ${count} overdue items.`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        });
      }
    });

    if (foundLateTasks.length > 0) {
      newNotifications.push({
        id: `info-comp-${todayStr}`,
        type: 'warning',
        title: 'Compensation Tasks Active',
        message: `${foundLateTasks.length} tasks overdue. Remedial work assigned.`,
        timestamp: new Date().toISOString()
      });
    }

    if (modulesChanged) {
      setModules(updatedModules);
    }

    setNotifications(newNotifications);
    setLateTasks(foundLateTasks);
    setUpcomingTasks(foundUpcomingTasks);
  };

  const calculateStats = (userId: string): UserStats => {
    const userLogs = logs.filter(l => l.userId === userId);
    const totalHours = userLogs.reduce((acc, l) => acc + l.hours, 0);

    let completedTasks = 0;
    let totalAssignedTasks = 0;

    modules.forEach(m => {
      m.items.forEach(t => {
        // Include if no assignee (shared) OR assigned to user
        if (!t.assigneeId || t.assigneeId === userId) {
          totalAssignedTasks++;
          const status = t.progress[userId]?.status || Status.NOT_STARTED;
          if (status === Status.COMPLETED) completedTasks++;
        }
      });
    });

    // Dynamic Streak Calculation
    let currentStreak = 0;
    const uniqueDates = Array.from(new Set(userLogs.map(l => l.date))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (uniqueDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      // Check if streak is active (logged today or yesterday)
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
          const curr = new Date(uniqueDates[i]);
          const prev = new Date(uniqueDates[i+1]);
          const diffTime = Math.abs(curr.getTime() - prev.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    return {
      totalHours,
      completedTasks,
      currentStreak,
      completionRate: totalAssignedTasks === 0 ? 0 : Math.round((completedTasks / totalAssignedTasks) * 100)
    };
  };

  const stats = {
    collins: calculateStats('collins'),
    sophia: calculateStats('sophia')
  };

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} onReset={handleResetData} />;
  }

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
        {/* Sidebar - Updated with scroll and responsive footer */}
        <aside className="w-20 lg:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col fixed inset-y-0 z-10 transition-all duration-300 border-r border-slate-800 overflow-y-auto">
          <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => setShowLanding(true)}>
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              LO
            </div>
            <span className="font-bold text-lg hidden lg:block tracking-tight">LearningOps</span>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-6">
            <NavButton active={activeTab === Tab.DASHBOARD} onClick={() => setActiveTab(Tab.DASHBOARD)} icon={LayoutDashboard} label="Dashboard" />
            <NavButton active={activeTab === Tab.SYLLABUS} onClick={() => setActiveTab(Tab.SYLLABUS)} icon={BookOpen} label="Roadmap" />
            <NavButton active={activeTab === Tab.TRACKER} onClick={() => setActiveTab(Tab.TRACKER)} icon={Activity} label="Tracker" />
            <NavButton active={activeTab === Tab.SCORECARD} onClick={() => setActiveTab(Tab.SCORECARD)} icon={Target} label="Scorecard" />
            <NavButton active={activeTab === Tab.JOURNAL} onClick={() => setActiveTab(Tab.JOURNAL)} icon={Notebook} label="Journal" />
            <NavButton active={activeTab === Tab.CAPSTONE} onClick={() => setActiveTab(Tab.CAPSTONE)} icon={Briefcase} label="Capstone" />
            <NavButton active={activeTab === Tab.DOCUMENTATION} onClick={() => setActiveTab(Tab.DOCUMENTATION)} icon={FileText} label="Evidence Log" />

            <div className="pt-4 mt-4 border-t border-slate-800">
              <NavButton active={activeTab === Tab.GUIDE} onClick={() => setActiveTab(Tab.GUIDE)} icon={HelpCircle} label="System Guide" />
            </div>
          </nav>

          {/* Bottom Profile Section - Now visible and adapted for mobile */}
          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800 rounded-xl p-3 mb-3 flex flex-col lg:block items-center">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] font-bold text-slate-400 uppercase hidden lg:block">Theme</span>
                <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors w-full lg:w-auto flex justify-center"
                >
                  {theme === 'light' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-3">
              <div className="hidden lg:flex justify-between items-center mb-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase">Switch Profile</h4>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="flex flex-col lg:flex-row gap-2">
                {users.map(user => (
                    <button
                        key={user.id}
                        onClick={() => setCurrentUserId(user.id)}
                        className={`flex-1 p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                            currentUser.id === user.id ? 'bg-indigo-600 shadow-md' : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        title={user.name}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentUser.id === user.id ? 'bg-white text-indigo-600' : 'bg-slate-500 text-slate-200'
                      } ${currentUser.id !== user.id ? 'mb-0' : 'mb-1 lg:mb-1'}`}>
                        {user.avatarInitials}
                      </div>
                      <span className="text-[10px] font-medium truncate w-full hidden lg:block">{user.name}</span>
                    </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 hidden lg:block">
                <p className="text-xs text-slate-300 font-medium">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-20 lg:ml-64 p-8 overflow-y-auto relative h-screen">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeTab === Tab.DASHBOARD && 'Performance Overview'}
                {activeTab === Tab.SYLLABUS && '14-Week Roadmap'}
                {activeTab === Tab.TRACKER && 'Activity Log'}
                {activeTab === Tab.SCORECARD && 'Success Scorecard'}
                {activeTab === Tab.JOURNAL && 'Learning Journal'}
                {activeTab === Tab.CAPSTONE && 'Capstone & Job Readiness'}
                {activeTab === Tab.DOCUMENTATION && 'Documentation & Evidence'}
                {activeTab === Tab.GUIDE && 'System Documentation'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Collaborative Workspace • <span className="text-indigo-600 dark:text-indigo-400 font-medium">Viewing as {currentUser.name}</span>
              </p>
            </div>

            <button
                onClick={() => setIsNotifPanelOpen(true)}
                className="relative p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {(notifications.length > 0 || lateTasks.length > 0) && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              )}
            </button>
          </header>

          <div className="max-w-7xl mx-auto">
            {activeTab === Tab.DASHBOARD && (
                <Dashboard currentUser={currentUser} users={users} stats={stats} modules={modules} scores={scores} />
            )}

            {activeTab === Tab.SYLLABUS && (
                <Syllabus modules={modules} setModules={setModules} currentUser={currentUser} users={users} />
            )}

            {activeTab === Tab.TRACKER && (
                <Tracker logs={logs} setLogs={setLogs} currentModule={currentModule} currentUser={currentUser} />
            )}

            {activeTab === Tab.SCORECARD && (
                <Scorecard currentUser={currentUser} users={users} modules={modules} scores={scores} setScores={setScores} />
            )}

            {activeTab === Tab.JOURNAL && (
                <Journal entries={journalEntries} setEntries={setJournalEntries} currentUser={currentUser} users={users} modules={modules} />
            )}

            {activeTab === Tab.CAPSTONE && (
                <CapstoneReadiness currentUser={currentUser} capstoneState={capstoneState} setCapstoneState={setCapstoneState} docEntries={docEntries} />
            )}

            {activeTab === Tab.DOCUMENTATION && (
                <Documentation entries={docEntries} setEntries={setDocEntries} currentUser={currentUser} />
            )}

            {activeTab === Tab.GUIDE && (
                <SystemGuide />
            )}
          </div>
        </main>

        <NotificationPanel
            isOpen={isNotifPanelOpen}
            onClose={() => setIsNotifPanelOpen(false)}
            notifications={notifications}
            lateTasks={lateTasks}
            upcomingTasks={upcomingTasks}
            users={users}
            currentUser={currentUser}
        />

        {/* Settings Modal */}
        {isSettingsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Workspace Settings</h3>
                  <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
                </div>

                <div className="space-y-6">
                  {/* Data Sync Section - NEW */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Data Sync (Collaborate)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                          onClick={handleExportData}
                          className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                      >
                        <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Export Backup</span>
                      </button>
                      <label className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
                        <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Import Data</span>
                        <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Use this to share progress between computers. Export from one, import to the other.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Team Members</h4>
                    <div className="space-y-4">
                      {users.map((u, idx) => (
                          <div key={u.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${u.color}`}>
                              {u.avatarInitials}
                            </div>
                            <input
                                type="text"
                                value={u.name}
                                onChange={(e) => {
                                  const newUsers = [...users];
                                  newUsers[idx] = {
                                    ...u,
                                    name: e.target.value,
                                    avatarInitials: e.target.value.substring(0, 2).toUpperCase()
                                  };
                                  setUsers(newUsers);
                                }}
                                className="flex-1 px-2 py-1 border-b border-transparent focus:border-indigo-500 bg-transparent text-sm text-slate-900 dark:text-white outline-none"
                            />
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            active
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden lg:block font-medium">{label}</span>
    </button>
);

export default App;

