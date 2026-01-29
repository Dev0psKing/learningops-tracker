import React, { useMemo, useState } from 'react';
import { User, CapstoneState, ReadinessDimension, ReadinessDimensions, ReadinessStatus, DocEntry } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Briefcase, Trash, FileText, HelpCircle, Target, Activity, CheckCircle, BrainCircuit } from './Icons';

interface CapstoneReadinessProps {
  currentUser: User;
  capstoneState: CapstoneState[]; 
  setCapstoneState: React.Dispatch<React.SetStateAction<CapstoneState[]>>;
  docEntries: DocEntry[];
}

const STATUS_SCORES: Record<ReadinessStatus, number> = {
  'Weak': 30,
  'Developing': 65,
  'Strong': 100
};

/**
 * CapstoneReadiness Component
 * 
 * Tracks readiness for the final project across 5 key dimensions.
 * Features a Radar Chart for visual skill topology and an evidence tracker.
 * Now integrates verification counts from the Documentation module.
 */
const CapstoneReadiness: React.FC<CapstoneReadinessProps> = ({ currentUser, capstoneState, setCapstoneState, docEntries }) => {
  const [newEvidence, setNewEvidence] = useState<Record<string, string>>({});
  const [showGuide, setShowGuide] = useState(true);

  const myState = capstoneState.find(s => s.userId === currentUser.id);

  // Calculate verification counts from Documentation module
  const verificationCounts = useMemo(() => {
     const counts: Record<string, number> = {};
     ReadinessDimensions.forEach(dim => {
        counts[dim] = docEntries.filter(e => e.userId === currentUser.id && e.dimensions.includes(dim)).length;
     });
     return counts;
  }, [docEntries, currentUser.id]);

  // Calculate aggregate score based on dimension status
  const readinessScore = useMemo(() => {
    if (!myState) return 0;
    const total = ReadinessDimensions.reduce((acc, dim) => {
      const status = myState.dimensions[dim]?.status || 'Weak';
      return acc + STATUS_SCORES[status];
    }, 0);
    return Math.round(total / ReadinessDimensions.length);
  }, [myState]);

  // Format data for Recharts Radar
  const chartData = useMemo(() => {
    return ReadinessDimensions.map(dim => {
      const myDim = myState?.dimensions[dim];
      return {
        subject: dim,
        score: STATUS_SCORES[myDim?.status || 'Weak'],
        fullMark: 100,
      };
    });
  }, [myState]);

  const handleStatusChange = (dim: ReadinessDimension, status: ReadinessStatus) => {
    setCapstoneState(prev => prev.map(s => {
      if (s.userId !== currentUser.id) return s;
      return {
        ...s,
        dimensions: {
          ...s.dimensions,
          [dim]: {
            ...s.dimensions[dim],
            status
          }
        }
      };
    }));
  };

  const handleAddEvidence = (dim: ReadinessDimension) => {
    const link = newEvidence[dim];
    if (!link) return;

    setCapstoneState(prev => prev.map(s => {
      if (s.userId !== currentUser.id) return s;
      return {
        ...s,
        dimensions: {
          ...s.dimensions,
          [dim]: {
            ...s.dimensions[dim],
            evidence: [...(s.dimensions[dim]?.evidence || []), link]
          }
        }
      };
    }));
    setNewEvidence(prev => ({ ...prev, [dim]: '' }));
  };

  const handleRemoveEvidence = (dim: ReadinessDimension, index: number) => {
    setCapstoneState(prev => prev.map(s => {
      if (s.userId !== currentUser.id) return s;
      const newEv = [...(s.dimensions[dim]?.evidence || [])];
      newEv.splice(index, 1);
      return {
        ...s,
        dimensions: {
          ...s.dimensions,
          [dim]: {
            ...s.dimensions[dim],
            evidence: newEv
          }
        }
      };
    }));
  };

  if (!myState) return <div>Loading...</div>;

  const getStatusColor = (status: ReadinessStatus) => {
    switch (status) {
      case 'Strong': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Developing': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Educational Guide */}
      {showGuide && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-900/30 shadow-sm p-6 relative overflow-hidden transition-colors">
           <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
           <button 
             onClick={() => setShowGuide(false)}
             className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
           >
             ✕
           </button>
           
           <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                 Capstone Readiness Engine
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed text-sm">
                 This module acts as a portfolio evaluation engine. Its purpose is to shift the focus from 
                 <span className="font-semibold text-slate-800 dark:text-white"> "what you have studied"</span> to 
                 <span className="font-semibold text-indigo-700 dark:text-indigo-400"> "what you can prove you have built."</span>
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded border border-slate-100 dark:border-slate-700">
                 <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 dark:text-white text-xs uppercase">
                    <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    The 5 Core Dimensions
                 </div>
                 <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Tracks proficiency across Data Sourcing, Cleaning, Analysis, Visualization, and Insight Communication—ensuring a balanced skillset.
                 </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded border border-slate-100 dark:border-slate-700">
                 <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 dark:text-white text-xs uppercase">
                    <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    Evidence-Based Scoring
                 </div>
                 <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
                    <p><strong className="text-slate-500 dark:text-slate-400">Weak (30%):</strong> Theory only.</p>
                    <p><strong className="text-amber-600 dark:text-amber-400">Developing (65%):</strong> Requires 1 verified artifact.</p>
                    <p><strong className="text-emerald-600 dark:text-emerald-400">Strong (100%):</strong> Requires multiple artifacts & reflection.</p>
                 </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded border border-slate-100 dark:border-slate-700">
                 <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 dark:text-white text-xs uppercase">
                    <BrainCircuit className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    Documentation Sync
                 </div>
                 <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    The system automatically detects "Verified Docs" from your Evidence Log to validate your self-assessments in real-time.
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* Header Summary */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-colors">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
             <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">Readiness Index</h2>
             {!showGuide && (
               <button onClick={() => setShowGuide(true)} className="text-slate-400 hover:text-indigo-600 ml-2" title="Show Guide">
                 <HelpCircle className="w-5 h-5" />
               </button>
             )}
           </div>
           <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg">
             Evaluate proficiency across the 5 core Capstone domains. Target: 80%+.
           </p>
        </div>

        <div className="flex items-center gap-6">
           <div className="text-right">
              <span className="block text-3xl font-bold text-slate-900 dark:text-white">{readinessScore}%</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                readinessScore >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                readinessScore >= 50 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
              }`}>
                {readinessScore >= 80 ? 'Ready' : readinessScore >= 50 ? 'Developing' : 'Foundational'}
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center justify-center min-h-[400px] transition-colors">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4 self-start w-full">Skill Distribution</h3>
           <div className="w-full h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                 <PolarGrid stroke="#94a3b8" strokeOpacity={0.2} />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                 <Radar
                   name={currentUser.name}
                   dataKey="score"
                   stroke="#6366f1"
                   strokeWidth={2}
                   fill="#6366f1"
                   fillOpacity={0.2}
                 />
                 <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
               </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Dimension Tracker */}
        <div className="lg:col-span-2 space-y-4">
           {ReadinessDimensions.map(dim => {
             const data = myState.dimensions[dim];
             const status = data?.status || 'Weak';
             const docCount = verificationCounts[dim] || 0;
             
             return (
               <div key={dim} className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase">{dim}</h3>
                        {docCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                                <FileText className="w-3 h-3" />
                                {docCount} Verified Docs
                            </span>
                        )}
                    </div>
                    
                    {/* Status Toggle */}
                    <div className="flex gap-1">
                       {(['Weak', 'Developing', 'Strong'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(dim, s)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded border transition-colors ${
                                status === s 
                                ? getStatusColor(s)
                                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                          >
                            {s}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Evidence Section */}
                 <div className="bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          Manual Artifacts
                       </span>
                    </div>

                    <div className="space-y-2 mb-3">
                       {(data?.evidence || []).map((link, idx) => (
                         <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-600 text-xs">
                            <a href={link.startsWith('http') ? link : '#'} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[80%] font-mono">
                               {link}
                            </a>
                            <button onClick={() => handleRemoveEvidence(dim, idx)} className="text-slate-400 hover:text-rose-500">
                               <Trash className="w-3 h-3" />
                            </button>
                         </div>
                       ))}
                       {(!data?.evidence || data.evidence.length === 0) && (
                           <p className="text-xs text-slate-400 italic">No artifacts linked.</p>
                       )}
                    </div>

                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="Link to Drive/GitHub..."
                         className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                         value={newEvidence[dim] || ''}
                         onChange={(e) => setNewEvidence(prev => ({...prev, [dim]: e.target.value}))}
                         onKeyDown={(e) => {
                             if(e.key === 'Enter') handleAddEvidence(dim);
                         }}
                       />
                       <button 
                         onClick={() => handleAddEvidence(dim)}
                         disabled={!newEvidence[dim]}
                         className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white rounded text-xs font-bold uppercase hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
                       >
                         Add
                       </button>
                    </div>
                 </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

export default CapstoneReadiness;