import React, { useMemo } from 'react';
import { StudyLog, Difficulty, WeekModule, User } from '../types';
import { BrainCircuit, Target, TrendingUp, Activity, Clock, LinkIcon } from './Icons';
import useLocalStorage from '../hooks/useLocalStorage';

interface TrackerProps {
  logs: StudyLog[];
  setLogs: React.Dispatch<React.SetStateAction<StudyLog[]>>;
  currentModule?: WeekModule;
  currentUser: User;
}

/**
 * Tracker Component
 * 
 * Allows users to log their study hours and reflect on complexity.
 * Features a context-aware header showing the current active module.
 * REPLACED AI: Now uses a deterministic engine to calculate weekly velocity and insights
 * based on real-time log data.
 */
const Tracker: React.FC<TrackerProps> = ({ logs, setLogs, currentModule, currentUser }) => {
  // Use LocalStorage for Drafts (Auto-Save)
  const [hours, setHours] = useLocalStorage('draft_tracker_hours', '');
  const [notes, setNotes] = useLocalStorage('draft_tracker_notes', '');
  const [difficulty, setDifficulty] = React.useState<Difficulty>(Difficulty.MEDIUM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !notes) return;

    const newLog: StudyLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      hours: parseFloat(hours),
      notes,
      difficulty,
      userId: currentUser.id
    };

    setLogs([newLog, ...logs]);
    
    // Clear Drafts
    setHours('');
    setNotes('');
    setDifficulty(Difficulty.MEDIUM);
  };

  // --- REAL-TIME INSIGHT ENGINE ---
  const insights = useMemo(() => {
    const now = new Date();
    // Filter logs for the last 7 days
    const recentLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays <= 7 && log.userId === currentUser.id;
    });

    const totalHours = recentLogs.reduce((acc, log) => acc + log.hours, 0);
    const count = recentLogs.length;
    
    // Determine Intensity
    let intensity = 'Low';
    if (totalHours > 15) intensity = 'Elite';
    else if (totalHours > 8) intensity = 'High';
    else if (totalHours > 4) intensity = 'Moderate';

    // Generate Dynamic Feedback
    let feedback = "No activity recorded this week. Log your first session to build momentum.";
    let color = "text-slate-500 dark:text-slate-400";
    let bg = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";

    if (count > 0) {
        if (totalHours >= 12) {
            feedback = `Outstanding velocity! You've logged ${totalHours} hours this week. You are performing at a senior contributor pace.`;
            color = "text-emerald-700 dark:text-emerald-400";
            bg = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
        } else if (totalHours >= 6) {
            feedback = `Solid consistency. ${totalHours} hours logged. You are on track with the standard roadmap pace.`;
            color = "text-indigo-700 dark:text-indigo-400";
            bg = "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800";
        } else {
            feedback = `Velocity is currently low (${totalHours}h). Try to block out 2 hours tomorrow to get back on track.`;
            color = "text-amber-700 dark:text-amber-400";
            bg = "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
        }
    }

    return { totalHours, count, intensity, feedback, color, bg };
  }, [logs, currentUser.id]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Log Entry Form */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded border border-slate-200 dark:border-slate-700 h-fit lg:sticky top-6 relative transition-colors">
        <div className="absolute top-6 right-6 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
             <LinkIcon className="w-3 h-3" /> Auto-Save
        </div>
        
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-6">Log Activity</h3>
        
        {currentModule && (
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
             <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <div>
                   <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Active Sprint</h4>
                   <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mt-1">{currentModule.title}</p>
                   <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">{currentModule.theme}</p>
                </div>
             </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Hours Spent</label>
            <input 
              type="number" 
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="e.g. 2.5"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Complexity</label>
            <div className="flex gap-2">
              {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-2 text-xs font-medium rounded border transition-colors ${
                    difficulty === level 
                      ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-600 dark:border-slate-600' 
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Work Log</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-32 resize-none"
              placeholder="Describe tasks completed..."
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white font-medium rounded text-sm hover:bg-indigo-700 transition-colors"
          >
            Submit Log
          </button>
        </form>
      </div>

      {/* Logs Feed & Analytics */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Real-Time Analytics Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Weekly Velocity & Insights</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Last 7 Days</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
             <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Total Hours</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{insights.totalHours.toFixed(1)}h</div>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Sessions</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{insights.count}</div>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Intensity</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{insights.intensity}</div>
             </div>
          </div>
          
          <div className={`p-4 rounded border ${insights.bg}`}>
               <div className="flex gap-3">
                  <TrendingUp className={`w-5 h-5 flex-shrink-0 ${insights.color}`} />
                  <div>
                    <h4 className={`text-xs font-bold uppercase mb-1 ${insights.color}`}>Performance Insight</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {insights.feedback}
                    </p>
                  </div>
               </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 px-1">Recent Logs</h3>
          <div className="space-y-0 border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
            {logs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800">
                <p className="text-slate-400 text-sm">No activity recorded.</p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={log.id} className={`bg-white dark:bg-slate-800 p-4 flex justify-between items-start ${
                  idx !== logs.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
                } hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors`}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-slate-400">{log.date}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                        {log.userId}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 uppercase">
                        {log.difficulty}
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 text-sm">{log.notes}</p>
                  </div>
                  <div className="text-right pl-6">
                    <span className="block text-lg font-bold text-slate-900 dark:text-white">{log.hours}h</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker;