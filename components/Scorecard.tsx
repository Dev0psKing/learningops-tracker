import React, { useState, useEffect } from 'react';
import { User, WeekModule, WeeklyScore, ScoreStatus } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend } from 'recharts';
import { Target, CheckCircle, Activity, TrendingUp } from './Icons';

interface ScorecardProps {
  currentUser: User;
  users: User[];
  modules: WeekModule[];
  scores: WeeklyScore[];
  setScores: React.Dispatch<React.SetStateAction<WeeklyScore[]>>;
}

const Scorecard: React.FC<ScorecardProps> = ({ currentUser, users, modules, scores, setScores }) => {
  const [selectedWeekId, setSelectedWeekId] = useState<number>(modules[0]?.id || 1);
  const [mastery, setMastery] = useState(0);
  const [output, setOutput] = useState(0);
  const [consistency, setConsistency] = useState(0);
  const [collaboration, setCollaboration] = useState(0);

  // Load existing score
  useEffect(() => {
    const existing = scores.find(s => s.weekId === selectedWeekId && s.userId === currentUser.id);
    if (existing) {
      setMastery(existing.mastery);
      setOutput(existing.output);
      setConsistency(existing.consistency);
      setCollaboration(existing.collaboration);
    } else {
      setMastery(0);
      setOutput(0);
      setConsistency(0);
      setCollaboration(0);
    }
  }, [selectedWeekId, currentUser.id, scores]);

  const totalScore = mastery + output + consistency + collaboration;

  const getStatus = (total: number): ScoreStatus => {
    if (total >= 16) return 'On Track';
    if (total >= 12) return 'Needs Adjustment';
    return 'Intervention Required';
  };

  const status = getStatus(totalScore);

  const getStatusColor = (s: ScoreStatus) => {
    switch (s) {
      case 'On Track': return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      case 'Needs Adjustment': return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'Intervention Required': return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
      default: return 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const handleSave = () => {
    const newScore: WeeklyScore = {
      id: `${selectedWeekId}-${currentUser.id}-${Date.now()}`,
      weekId: selectedWeekId,
      userId: currentUser.id,
      mastery,
      output,
      consistency,
      collaboration,
      total: totalScore,
      status,
      dateLogged: new Date().toISOString()
    };

    setScores(prev => {
      const filtered = prev.filter(s => !(s.weekId === selectedWeekId && s.userId === currentUser.id));
      return [...filtered, newScore];
    });
  };

  const userScores = scores
    .filter(s => s.userId === currentUser.id)
    .sort((a, b) => a.weekId - b.weekId)
    .map(s => ({
      name: `W${s.weekId}`,
      total: s.total
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Input Section */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Weekly Self-Assessment</h3>
            <select 
              value={selectedWeekId}
              onChange={(e) => setSelectedWeekId(Number(e.target.value))}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 py-1 px-2"
            >
              {modules.map(m => (
                <option key={m.id} value={m.id}>Week {m.id}</option>
              ))}
            </select>
          </div>

          <div className="space-y-8">
            {[
              { label: 'Technical Mastery', val: mastery, set: setMastery, desc: 'Depth of understanding' },
              { label: 'Artifact Output', val: output, set: setOutput, desc: 'Code quality & completeness' },
              { label: 'Consistency', val: consistency, set: setConsistency, desc: 'Schedule adherence' },
              { label: 'Collaboration', val: collaboration, set: setCollaboration, desc: 'Peer review & comms' }
            ].map((dim) => (
              <div key={dim.label}>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <span>{dim.label}</span>
                  <span>{dim.val}/5</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="1" 
                  value={dim.val}
                  onChange={(e) => dim.set(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">{dim.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Total Score</div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalScore}</span>
                <span className="text-slate-400 text-sm font-medium">/20</span>
              </div>
            </div>

            <div className={`py-2 px-3 rounded border text-center font-bold text-xs uppercase tracking-wide mb-4 ${getStatusColor(status)}`}>
              {status}
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium rounded text-sm transition-colors"
            >
              Submit Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 h-80 transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-2">Trajectory</h3>
          
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userScores} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis domain={[0, 20]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <ReferenceLine y={16} stroke="#10b981" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rubric - Minimalist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded border border-emerald-100 dark:border-emerald-900/50">
              <div className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase mb-1">Target (16-20)</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Optimal velocity. Concepts mastered.
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded border border-amber-100 dark:border-amber-900/50">
              <div className="text-amber-700 dark:text-amber-400 text-xs font-bold uppercase mb-1">Review (12-15)</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Minor gaps in consistency or output.
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded border border-rose-100 dark:border-rose-900/50">
              <div className="text-rose-700 dark:text-rose-400 text-xs font-bold uppercase mb-1">Critical (&lt;12)</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Significant blockers. Immediate audit.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;