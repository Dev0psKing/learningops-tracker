import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, ReferenceLine } from 'recharts';
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
  grid: '#94a3b8',   // Slate 400 - using a neutral gray for visibility in both modes (with opacity)
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
  const myStats = stats[currentUser.id];

  // --- Data Transformation Memoization ---
  // We process raw data into Recharts-friendly format only when dependencies change.

  // 1. Calculate Weekly Score Trend over time
  const scoreTrendData = useMemo(() => {
    const weekIds = Array.from(new Set(scores.map(s => s.weekId))).sort((a: number, b: number) => a - b);
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

  // 2. Calculate Missed Tasks per Week
  const missedTasksData = useMemo(() => {
    return modules.map(m => {
      const collinsMissed = m.items.filter(i => i.ownerId === 'collins' && i.status !== Status.COMPLETED).length;
      const sophiaMissed = m.items.filter(i => i.ownerId === 'sophia' && i.status !== Status.COMPLETED).length;
      return {
        name: `W${m.id}`,
        collins: collinsMissed,
        sophia: sophiaMissed
      };
    });
  }, [modules]);

  // 3. Calculate Completion Velocity (Percentage)
  const completionRateData = useMemo(() => {
    return modules.map(m => {
      let collinsTotal = 0, collinsCompleted = 0;
      let sophiaTotal = 0, sophiaCompleted = 0;

      m.items.forEach(i => {
        if (i.ownerId === 'collins') {
          collinsTotal++;
          if (i.status === Status.COMPLETED) collinsCompleted++;
        } else {
          sophiaTotal++;
          if (i.status === Status.COMPLETED) sophiaCompleted++;
        }
      });
      
      return {
        name: `W${m.id}`,
        collins: collinsTotal === 0 ? 0 : Math.round((collinsCompleted / collinsTotal) * 100),
        sophia: sophiaTotal === 0 ? 0 : Math.round((sophiaCompleted / sophiaTotal) * 100)
      };
    });
  }, [modules]);

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
          subtext={`${myStats.completionRate}% completion rate`} 
          icon={CheckCircle} 
        />
        <StatCard 
          title="Consistency Streak" 
          value={myStats.currentStreak} 
          subtext="Consecutive days active" 
          icon={TrendingUp} 
        />
        <StatCard 
          title="Avg. Weekly Score" 
          value={
             scores.filter(s => s.userId === currentUser.id).length > 0 
             ? (scores.filter(s => s.userId === currentUser.id).reduce((a, b) => a + b.total, 0) / scores.filter(s => s.userId === currentUser.id).length).toFixed(1)
             : '-'
          } 
          subtext="Target: 16.0+" 
          icon={Target} 
        />
      </div>

      {/* Row 1: Weekly Score Trend */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex justify-between items-center mb-8">
           <div>
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Performance Score Trend</h3>
           </div>
           <div className="flex gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Collins</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sophia</span>
           </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scoreTrendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCollins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.collins} stopOpacity={0.05}/>
                  <stop offset="95%" stopColor={COLORS.collins} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSophia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.sophia} stopOpacity={0.05}/>
                  <stop offset="95%" stopColor={COLORS.sophia} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis domain={[0, 20]} stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} strokeOpacity={0.2} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 500 }}
              />
              <ReferenceLine y={16} stroke="#10b981" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="collins" stroke={COLORS.collins} fillOpacity={1} fill="url(#colorCollins)" strokeWidth={2} activeDot={{r: 4, strokeWidth: 0}} />
              <Area type="monotone" dataKey="sophia" stroke={COLORS.sophia} fillOpacity={1} fill="url(#colorSophia)" strokeWidth={2} activeDot={{r: 4, strokeWidth: 0}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Missed Tasks & Completion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Missed Tasks Chart */}
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-6">Outstanding Tasks</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missedTasksData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis allowDecimals={false} stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="collins" fill={COLORS.collins} radius={[2, 2, 0, 0]} />
                <Bar dataKey="sophia" fill={COLORS.sophia} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Rate Chart */}
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-6">Velocity (Completion Rate)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionRateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis unit="%" domain={[0, 100]} stroke={COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                />
                <Line type="monotone" dataKey="collins" stroke={COLORS.collins} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sophia" stroke={COLORS.sophia} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;