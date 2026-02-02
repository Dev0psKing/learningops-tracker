import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, ReferenceLine, Legend } from 'recharts';
import { UserStats, User, WeekModule, WeeklyScore, Status } from '../types';
import { Clock, CheckCircle, TrendingUp, Target } from './Icons';

interface DashboardProps {
  currentUser: User;
  users: User[];
  stats: Record<string, UserStats>;
  modules: WeekModule[];
  scores: WeeklyScore[];
}

// Professional, minimalist color palette suitable for data visualization
const COLORS = {
  collins: '#6366f1', // Indigo 500
  sophia: '#10b981', // Emerald 500
  grid: '#94a3b8',   // Slate 400
  text: '#94a3b8',   // Slate 400
};

/**
 * Reusable Card Component for top-level KPIs.
 */
const StatCard = ({ title, value, subtext, icon: Icon }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
        </div>
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 font-medium border-t border-slate-50 dark:border-slate-700 pt-2">{subtext}</p>
    </div>
);

/**
 * Dashboard Component
 *
 * Displays high-level analytics for the user:
 * 1. KPIs (Hours, Tasks, Streak, Score)
 * 2. Trend Analysis (Weekly Scores)
 * 3. Task Velocity and Completion Rates
 */
const Dashboard: React.FC<DashboardProps> = ({ currentUser, users, stats, modules, scores }) => {
  const myStats = stats[currentUser.id] || { totalHours: 0, completedTasks: 0, currentStreak: 0, completionRate: 0 };

  // --- Data Transformation Memoization ---

  // 1. Calculate Weekly Score Trend over time (Quality)
  const scoreTrendData = useMemo(() => {
    // Get all unique week IDs from scores
    const weekIds = Array.from(new Set(scores.map(s => s.weekId))).sort((a: number, b: number) => a - b);
    if (weekIds.length === 0) return [];

    return weekIds.map(weekId => {
      const collinsScore = scores.find(s => s.weekId === weekId && s.userId === 'collins')?.total || 0;
      const sophiaScore = scores.find(s => s.weekId === weekId && s.userId === 'sophia')?.total || 0;
      return {
        name: `W${weekId}`,
        collins: collinsScore,
        sophia: sophiaScore
      };
    });
  }, [scores]);

  // 2. Calculate Missed Tasks per Week (Debt)
  const missedTasksData = useMemo(() => {
    return modules.map(m => {
      // Calculate missed tasks for Collins
      const collinsMissed = m.items.filter(i => {
        // Skip if assigned to someone else
        if (i.assigneeId && i.assigneeId !== 'collins') return false;

        const status = i.progress['collins']?.status || Status.NOT_STARTED;
        const isLate = i.dueDate && new Date(i.dueDate) < new Date() && status !== Status.COMPLETED;
        return isLate;
      }).length;

      // Calculate missed tasks for Sophia
      const sophiaMissed = m.items.filter(i => {
        if (i.assigneeId && i.assigneeId !== 'sophia') return false;

        const status = i.progress['sophia']?.status || Status.NOT_STARTED;
        const isLate = i.dueDate && new Date(i.dueDate) < new Date() && status !== Status.COMPLETED;
        return isLate;
      }).length;

      return {
        name: `W${m.id}`,
        collins: collinsMissed,
        sophia: sophiaMissed
      };
    });
  }, [modules]);

  // 3. Calculate Completion Velocity (Speed)
  const completionRateData = useMemo(() => {
    return modules.map(m => {
      let collinsTotal = 0, collinsCompleted = 0;
      let sophiaTotal = 0, sophiaCompleted = 0;

      m.items.forEach(i => {
        // Collins Stats: Shared tasks OR specific assignments
        if (!i.assigneeId || i.assigneeId === 'collins') {
          collinsTotal++;
          const status = i.progress['collins']?.status || Status.NOT_STARTED;
          if (status === Status.COMPLETED) collinsCompleted++;
        }

        // Sophia Stats
        if (!i.assigneeId || i.assigneeId === 'sophia') {
          sophiaTotal++;
          const status = i.progress['sophia']?.status || Status.NOT_STARTED;
          if (status === Status.COMPLETED) sophiaCompleted++;
        }
      });

      return {
        name: `W${m.id}`,
        collins: collinsTotal === 0 ? 0 : Math.round((collinsCompleted / collinsTotal) * 100),
        sophia: sophiaTotal === 0 ? 0 : Math.round((sophiaCompleted / sophiaTotal) * 100)
      };
    });
  }, [modules]);

  // Determine Average Score
  const myScores = scores.filter(s => s.userId === currentUser.id);
  const avgScore = myScores.length > 0
      ? (myScores.reduce((acc, s) => acc + s.total, 0) / myScores.length).toFixed(1)
      : '0.0';

  return (
      <div className="space-y-6 animate-fade-in pb-10">

        {/* Top Row: Personal KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
              title="Hours Logged"
              value={myStats.totalHours.toFixed(1)}
              subtext="Total cumulative study time"
              icon={Clock}
          />
          <StatCard
              title="Tasks Completed"
              value={myStats.completedTasks}
              subtext={`Global completion rate: ${myStats.completionRate}%`}
              icon={CheckCircle}
          />
          <StatCard
              title="Consistency Streak"
              value={`${myStats.currentStreak} Days`}
              subtext="Consecutive days of activity"
              icon={TrendingUp}
          />
          <StatCard
              title="Avg. Weekly Score"
              value={avgScore}
              subtext="Target: 16.0+"
              icon={Target}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Performance Score Trend */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Performance Score Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Weekly self-assessment (Mastery + Output + Consistency)</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.collins} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.collins} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSophia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.sophia} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.sophia} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} strokeOpacity={0.2} />
                  <XAxis dataKey="name" stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 20]} stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', borderRadius: '6px' }}
                      itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <ReferenceLine y={16} stroke={COLORS.sophia} strokeDasharray="3 3" label={{ value: 'Target', position: 'right', fill: COLORS.sophia, fontSize: 10 }} />
                  <Area type="monotone" dataKey="collins" name="Collins" stroke={COLORS.collins} fillOpacity={1} fill="url(#colorCollins)" />
                  <Area type="monotone" dataKey="sophia" name="Sophia" stroke={COLORS.sophia} fillOpacity={1} fill="url(#colorSophia)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Velocity */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Velocity / Completion Rate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Percentage of weekly syllabus completed</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} strokeOpacity={0.2} />
                  <XAxis dataKey="name" stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', borderRadius: '6px' }}
                      itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="collins" name="Collins" stroke={COLORS.collins} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sophia" name="Sophia" stroke={COLORS.sophia} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Outstanding Tasks (Debt) */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded border border-slate-200 dark:border-slate-700 transition-colors lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Outstanding Tasks (Technical Debt)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Overdue or incomplete items per week. Keep this low.</p>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missedTasksData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} strokeOpacity={0.2} />
                  <XAxis dataKey="name" stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                      cursor={{ fill: '#334155', opacity: 0.1 }}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', borderRadius: '6px' }}
                      itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="collins" name="Collins" fill={COLORS.collins} radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="sophia" name="Sophia" fill={COLORS.sophia} radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
