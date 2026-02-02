import React, { useState } from 'react';
import { WeekModule, Status, User, TaskItem, Evidence } from '../types';
import { BrainCircuit, CheckCircle, AlertTriangle } from './Icons';

interface SyllabusProps {
  modules: WeekModule[];
  setModules: React.Dispatch<React.SetStateAction<WeekModule[]>>;
  currentUser: User;
  users: User[];
}

const getRelativeDate = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const initProgress = () => ({
  collins: { status: Status.NOT_STARTED },
  sophia: { status: Status.NOT_STARTED }
});

// Hardcoded Standard Curriculum for "Reset/Init" functionality
const STANDARD_CURRICULUM: WeekModule[] = [
  {
    id: 1, title: "Week 1: Basic Python", theme: "Foundations & Syntax", startDate: getRelativeDate(0),
    items: [
      { id: "w1-d1", title: "Day 1: Intro to Data Analytics & Python Setup", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(1) },
      { id: "w1-d2", title: "Day 2: Python Basics – Data Types & Control Flow", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(2) },
      { id: "w1-d3", title: "Day 3: Loops and Functions Practice", type: "Task", progress: initProgress(), dueDate: getRelativeDate(3) },
      { id: "w1-d5", title: "Day 5: Dictionary, Tuple and Set", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(5) },
      { id: "w1-d7", title: "Day 7: Project - Text Analyzer Script", type: "Project", progress: initProgress(), dueDate: getRelativeDate(7) },
    ]
  },
  {
    id: 2, title: "Week 2: Data Analysis Libraries", theme: "NumPy & Pandas", startDate: getRelativeDate(7),
    items: [
      { id: "w2-d1", title: "Day 8: Intro to NumPy Arrays", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(8) },
      { id: "w2-d2", title: "Day 9: Pandas DataFrames Basics", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(9) },
      { id: "w2-d4", title: "Day 11: Data Cleaning with Pandas", type: "Task", progress: initProgress(), dueDate: getRelativeDate(11) },
      { id: "w2-d7", title: "Day 14: Project - Dataset Exploratory Analysis", type: "Project", progress: initProgress(), dueDate: getRelativeDate(14) },
    ]
  },
  {
    id: 3, title: "Week 3: Visualization", theme: "Matplotlib & Seaborn", startDate: getRelativeDate(14),
    items: [
      { id: "w3-d1", title: "Day 15: Matplotlib Fundamentals", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(15) },
      { id: "w3-d3", title: "Day 17: Seaborn Statistical Plots", type: "Task", progress: initProgress(), dueDate: getRelativeDate(17) },
      { id: "w3-d7", title: "Day 21: Project - Sales Dashboard", type: "Project", progress: initProgress(), dueDate: getRelativeDate(21) },
    ]
  },
  {
    id: 4, title: "Week 4: SQL Fundamentals", theme: "Database Querying", startDate: getRelativeDate(21),
    items: [
      { id: "w4-d1", title: "Day 22: Relational DB Concepts & SELECT", type: "Topic", progress: initProgress(), dueDate: getRelativeDate(22) },
      { id: "w4-d3", title: "Day 24: Joins and Aggregations", type: "Task", progress: initProgress(), dueDate: getRelativeDate(24) },
      { id: "w4-d7", title: "Day 28: Project - Customer Churn Analysis", type: "Project", progress: initProgress(), dueDate: getRelativeDate(28) },
    ]
  }
];

const Syllabus: React.FC<SyllabusProps> = ({ modules, setModules, currentUser, users }) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(modules.length > 0 ? modules[0].id : null);

  // State for Evidence Modal
  const [selectedTask, setSelectedTask] = useState<{weekId: number, task: TaskItem} | null>(null);
  const [evidenceLink, setEvidenceLink] = useState('');
  const [evidenceType, setEvidenceType] = useState<'link' | 'file' | 'note'>('link');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLoadStandard = () => {
    setModules(STANDARD_CURRICULUM);
    setExpandedWeek(1);
  };

  const getTaskStatus = (task: TaskItem): Status => {
    return task.progress[currentUser.id]?.status || Status.NOT_STARTED;
  };

  const getTaskEvidence = (task: TaskItem): Evidence | undefined => {
    return task.progress[currentUser.id]?.evidence;
  };

  const initiateCompletion = (weekId: number, task: TaskItem) => {
    const currentStatus = getTaskStatus(task);

    if (currentStatus === Status.COMPLETED) {
      // Toggle back to not started if needed (simple undo)
      updateTaskStatus(weekId, task.id, Status.NOT_STARTED, undefined);
      return;
    }
    // Open modal for evidence
    setSelectedTask({ weekId, task });
    setEvidenceLink('');
    setValidationError(null);
    setEvidenceType('link');
  };

  const submitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !evidenceLink) return;

    // Strict Validation Logic
    if (evidenceType === 'note') {
      const wordCount = evidenceLink.trim().split(/\s+/).filter(w => w.length > 0).length;
      if (wordCount < 50) {
        setValidationError(`Evidence rejected. Notes must contain at least 50 words to demonstrate depth (Current: ${wordCount}).`);
        return;
      }
    } else if (evidenceType === 'link') {
      if (!evidenceLink.startsWith('http')) {
        setValidationError('Invalid URL. Links must start with http:// or https://');
        return;
      }
    }

    const evidence: Evidence = {
      type: evidenceType,
      content: evidenceLink,
      submittedAt: new Date().toISOString()
    };

    updateTaskStatus(selectedTask.weekId, selectedTask.task.id, Status.COMPLETED, evidence);
    setSelectedTask(null);
  };

  const updateTaskStatus = (weekId: number, taskId: string, status: Status, evidence?: Evidence) => {
    setModules(prev => prev.map(s => {
      if (s.id !== weekId) return s;
      return {
        ...s,
        items: s.items.map(t => {
          if (t.id !== taskId) return t;

          // Update ONLY the current user's progress
          const currentProgress = t.progress[currentUser.id] || {};
          return {
            ...t,
            progress: {
              ...t.progress,
              [currentUser.id]: {
                ...currentProgress,
                status,
                evidence
              }
            }
          };
        })
      };
    }));
  };

  const getUserInitials = (id: string) => users.find(u => u.id === id)?.avatarInitials || id.substring(0, 2);

  if (modules.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-8 text-center">
          <BrainCircuit className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Initialize Roadmap</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-6">
            Load the standard 4-week Foundation Syllabus to get started.
          </p>
          <button
              onClick={handleLoadStandard}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-all"
          >
            Load Standard Curriculum
          </button>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">Course Modules</h2>
        </div>

        <div className="space-y-4">
          {modules.map((module) => {
            // Progress is now calculated for the CURRENT USER
            const completionCount = module.items.filter(t => (t.progress[currentUser.id]?.status || Status.NOT_STARTED) === Status.COMPLETED).length;
            const totalCount = module.items.length;
            const progress = totalCount === 0 ? 0 : (completionCount / totalCount) * 100;

            return (
                <div key={module.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded overflow-hidden transition-colors">
                  <button
                      onClick={() => setExpandedWeek(expandedWeek === module.id ? null : module.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-750 text-left transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 flex items-center justify-center text-xs font-bold border rounded ${
                          progress === 100 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                      }`}>
                        {module.id}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{module.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400">{module.theme}</span>
                          <div className="w-32 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-800 dark:bg-slate-400" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      <svg
                          className={`w-4 h-4 transform transition-transform ${expandedWeek === module.id ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {expandedWeek === module.id && (
                      <div className="border-t border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-12 gap-4 px-6 py-2 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <div className="col-span-8">Deliverable</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2 text-right">Status</div>
                        </div>

                        {module.items.map((item) => {
                          // Only show tasks relevant to current user (Shared tasks OR assigned tasks)
                          if (item.assigneeId && item.assigneeId !== currentUser.id) return null;

                          const status = getTaskStatus(item);
                          const evidence = getTaskEvidence(item);
                          const isCompleted = status === Status.COMPLETED;

                          return (
                              <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 dark:border-slate-700 items-center hover:bg-white dark:hover:bg-slate-750 transition-colors last:border-0">
                                <div className="col-span-8">
                                  <p className={`text-sm ${isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                                    {item.title.replace(/\s*\([^)]*\)/g, "").trim()}
                                  </p>
                                  {evidence && (
                                      <a href={evidence.content} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline block mt-0.5">
                                        View Evidence
                                      </a>
                                  )}
                                </div>

                                <div className="col-span-2">
                         <span className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800">
                             {item.type}
                         </span>
                                </div>

                                <div className="col-span-2 flex justify-end">
                                  <button
                                      onClick={() => initiateCompletion(module.id, item)}
                                      className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border transition-colors ${
                                          isCompleted
                                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'
                                      }`}
                                  >
                                    {isCompleted ? 'Complete' : 'Mark Done'}
                                  </button>
                                </div>
                              </div>
                          )})}
                      </div>
                  )}
                </div>
            )})}
        </div>

        {/* Minimalist Modal for Evidence Submission */}
        {selectedTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Verification Required</h3>
                  <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                  Provide evidence of completion for <span className="font-semibold text-slate-800 dark:text-white">"{selectedTask.task.title.replace(/\s*\([^)]*\)/g, "").trim()}"</span>.
                </p>

                <form onSubmit={submitEvidence} className="space-y-4">
                  <div>
                    <div className="flex gap-2 mb-2">
                      {(['link', 'file', 'note'] as const).map(type => (
                          <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setEvidenceType(type);
                                setValidationError(null);
                              }}
                              className={`flex-1 py-1.5 text-xs font-medium rounded border ${
                                  evidenceType === type
                                      ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-600 dark:border-slate-600'
                                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                              }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                      ))}
                    </div>

                    {evidenceType === 'note' ? (
                        <textarea
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                            placeholder="Detailed reflection (minimum 50 words)..."
                            value={evidenceLink}
                            onChange={e => {
                              setEvidenceLink(e.target.value);
                              setValidationError(null);
                            }}
                            autoFocus
                        />
                    ) : (
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder={evidenceType === 'link' ? "https://..." : "File path or name..."}
                            value={evidenceLink}
                            onChange={e => {
                              setEvidenceLink(e.target.value);
                              setValidationError(null);
                            }}
                            autoFocus
                        />
                    )}
                    {evidenceType === 'note' && (
                        <p className="text-[10px] text-slate-400 mt-1 text-right">
                          Word Count: {evidenceLink.trim().split(/\s+/).filter(w => w.length > 0).length} / 50
                        </p>
                    )}
                  </div>

                  {validationError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2 rounded">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{validationError}</span>
                      </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setSelectedTask(null)}
                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!evidenceLink}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Verify & Complete
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
};

export default Syllabus;
