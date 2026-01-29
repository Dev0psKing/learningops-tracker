import React, { useState, useMemo } from 'react';
import { DocEntry, User, ReadinessDimension, ReadinessDimensions, DocCategory, ReadinessStatus } from '../types';
import { FileText, LinkIcon, Trash, CheckCircle, AlertTriangle, Briefcase, Plus, HelpCircle } from './Icons';

interface DocumentationProps {
  entries: DocEntry[];
  setEntries: React.Dispatch<React.SetStateAction<DocEntry[]>>;
  currentUser: User;
}

const CATEGORIES: DocCategory[] = ['Python', 'SQL', 'Tableau', 'Concepts', 'Capstone', 'Other'];

const Documentation: React.FC<DocumentationProps> = ({ entries, setEntries, currentUser }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterDim, setFilterDim] = useState<ReadinessDimension | 'All'>('All');
  const [showGuide, setShowGuide] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocCategory>('Python');
  const [selectedDims, setSelectedDims] = useState<ReadinessDimension[]>([]);
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<ReadinessStatus>('Weak');
  const [justification, setJustification] = useState('');
  const [reflection, setReflection] = useState('');
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const userEntries = useMemo(() => {
    return entries
      .filter(e => e.userId === currentUser.id)
      .filter(e => filterDim === 'All' || e.dimensions.includes(filterDim))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [entries, currentUser.id, filterDim]);

  const stats = useMemo(() => {
    const total = userEntries.length;
    const strongCount = userEntries.filter(e => e.status === 'Strong').length;
    const evidenceTotal = userEntries.reduce((acc, e) => acc + e.evidenceLinks.length, 0);
    return { total, strongCount, evidenceTotal };
  }, [userEntries]);

  const handleAddLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (newLink && !evidenceLinks.includes(newLink)) {
      setEvidenceLinks([...evidenceLinks, newLink]);
      setNewLink('');
    }
  };

  const handleRemoveLink = (idx: number) => {
    setEvidenceLinks(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleDim = (dim: ReadinessDimension) => {
    if (selectedDims.includes(dim)) {
      setSelectedDims(selectedDims.filter(d => d !== dim));
    } else {
      setSelectedDims([...selectedDims, dim]);
    }
  };

  const validate = (): boolean => {
    if (status === 'Developing' && evidenceLinks.length < 1) {
      setFormError("Status 'Developing' requires at least 1 evidence link.");
      return false;
    }
    if (status === 'Strong' && evidenceLinks.length < 2) {
      setFormError("Status 'Strong' requires at least 2 evidence links.");
      return false;
    }
    if (status === 'Strong' && reflection.length < 20) {
      setFormError("Status 'Strong' requires a detailed reflection.");
      return false;
    }
    if (selectedDims.length === 0) {
      setFormError("Select at least one skill dimension.");
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newEntry: DocEntry = {
      id: `doc-${Date.now()}`,
      userId: currentUser.id,
      title,
      category,
      dimensions: selectedDims,
      summary,
      evidenceLinks,
      status,
      justification,
      reflection,
      timestamp: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      revisionCount: 0
    };

    setEntries([newEntry, ...entries]);
    resetForm();
    setIsFormOpen(false);
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Python');
    setSelectedDims([]);
    setSummary('');
    setStatus('Weak');
    setJustification('');
    setReflection('');
    setEvidenceLinks([]);
    setFormError(null);
  };

  const getStatusColor = (s: ReadinessStatus) => {
    switch (s) {
      case 'Strong': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Developing': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Documented Entries</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
          <FileText className="w-8 h-8 text-slate-100 dark:text-slate-700" />
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Evidence</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.evidenceTotal}</p>
          </div>
          <LinkIcon className="w-8 h-8 text-indigo-50 dark:text-indigo-900/20" />
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Strong Proficiency</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.strongCount}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-50 dark:text-emerald-900/20" />
        </div>
      </div>

      {/* Explainer Section */}
      {showGuide && (
        <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-800 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-8 relative overflow-hidden transition-colors">
           <div className="relative z-10 flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-indigo-100 dark:border-slate-600">
                        <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">What is the Evidence Log?</h3>
                 </div>
                 <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed mb-4">
                    This is the <strong>Audit Trail</strong> for your career transition. 
                    It shifts your focus from passive consumption (reading articles) to active production (building artifacts).
                 </p>
                 <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    In engineering, if it isn't documented, it didn't happen.
                 </p>
              </div>

              <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white/60 dark:bg-slate-700/50 p-4 rounded-lg border border-indigo-50 dark:border-indigo-900/30">
                    <h4 className="text-xs font-bold uppercase text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> How to Use It
                    </h4>
                    <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal pl-4">
                       <li><strong>Log Significant Work:</strong> Don't log every tutorial. Log milestones (e.g., "Deployed SQL Database").</li>
                       <li><strong>Tag Dimensions:</strong> Map the work to specific skills (e.g., Data Cleaning, Visualization).</li>
                       <li><strong>Attach Proof:</strong> You must provide URLs (GitHub, Tableau Public, Drive) to validate your work.</li>
                    </ol>
                 </div>

                 <div className="bg-white/60 dark:bg-slate-700/50 p-4 rounded-lg border border-indigo-50 dark:border-indigo-900/30">
                    <h4 className="text-xs font-bold uppercase text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Validation Rules
                    </h4>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                       <li className="flex items-center justify-between">
                          <span>Rate as <span className="font-bold text-amber-600 dark:text-amber-400">Developing</span></span>
                          <span className="bg-white dark:bg-slate-600 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-500 text-[10px]">Req. 1 Link</span>
                       </li>
                       <li className="flex items-center justify-between">
                          <span>Rate as <span className="font-bold text-emerald-600 dark:text-emerald-400">Strong</span></span>
                          <span className="bg-white dark:bg-slate-600 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-500 text-[10px]">Req. 2 Links + Reflection</span>
                       </li>
                    </ul>
                    <p className="mt-2 text-[10px] text-indigo-400 italic">
                       *This data directly feeds your Capstone Readiness score.
                    </p>
                 </div>
              </div>
           </div>
           
           <button 
             onClick={() => setShowGuide(false)} 
             className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
           >
             ✕
           </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">Documentation Log</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Official audit trail of technical growth.</p>
        </div>
        <div className="flex gap-3">
             {!showGuide && (
               <button onClick={() => setShowGuide(true)} className="text-slate-400 hover:text-indigo-600 px-2">
                 <HelpCircle className="w-5 h-5" />
               </button>
             )}
             <select 
               value={filterDim}
               onChange={(e) => setFilterDim(e.target.value as any)}
               className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-indigo-500"
             >
               <option value="All">All Dimensions</option>
               {ReadinessDimensions.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
             <button 
               onClick={() => setIsFormOpen(!isFormOpen)}
               className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-bold rounded transition-colors"
             >
               <Plus className="w-4 h-4" />
               New Entry
             </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 shadow-lg transition-colors">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Documentation Entry</h3>
             <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Cancel</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Title</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Optimized SQL Query Performance" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value as DocCategory)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded text-sm outline-none">
                     {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Skill Dimensions (Multi-select)</label>
               <div className="flex flex-wrap gap-2">
                  {ReadinessDimensions.map(dim => (
                    <button
                      key={dim}
                      type="button"
                      onClick={() => toggleDim(dim)}
                      className={`px-3 py-1.5 text-xs font-bold rounded border transition-all ${
                        selectedDims.includes(dim)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {dim}
                    </button>
                  ))}
               </div>
            </div>

            <div>
               <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Summary</label>
               <textarea required value={summary} onChange={e => setSummary(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded text-sm outline-none h-20 resize-none" placeholder="What did you build or learn?" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-slate-700">
               <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Self-Assessment Status</label>
                  <div className="flex gap-2 mb-4">
                     {(['Weak', 'Developing', 'Strong'] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={`flex-1 py-2 text-xs font-bold rounded border transition-all ${
                            status === s ? getStatusColor(s) : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {s}
                        </button>
                     ))}
                  </div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Justification</label>
                  <textarea required value={justification} onChange={e => setJustification(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded text-sm outline-none h-20 resize-none" placeholder="Why this rating?" />
               </div>

               <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Evidence Links {status !== 'Weak' && <span className="text-rose-500">*</span>}</label>
                  <div className="flex gap-2 mb-3">
                     <input type="text" value={newLink} onChange={e => setNewLink(e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded outline-none" placeholder="https://..." />
                     <button onClick={handleAddLink} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded">Add</button>
                  </div>
                  <ul className="space-y-2 mb-4">
                     {evidenceLinks.map((link, i) => (
                        <li key={i} className="flex justify-between items-center text-xs bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-600">
                           <span className="truncate max-w-[200px] text-indigo-600 dark:text-indigo-400">{link}</span>
                           <button onClick={() => handleRemoveLink(i)} className="text-slate-400 hover:text-rose-500"><Trash className="w-3 h-3"/></button>
                        </li>
                     ))}
                     {evidenceLinks.length === 0 && <p className="text-xs text-slate-400 italic">No links attached.</p>}
                  </ul>

                  {status === 'Strong' && (
                     <>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Reflection (Required for Strong)</label>
                        <textarea value={reflection} onChange={e => setReflection(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded text-xs outline-none h-20 resize-none" placeholder="What changed in your thinking?" />
                     </>
                  )}
               </div>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-sm font-medium rounded border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                 <AlertTriangle className="w-4 h-4" />
                 {formError}
              </div>
            )}

            <div className="flex justify-end pt-4">
               <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-lg transition-transform transform hover:-translate-y-0.5">
                  Log Evidence
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {userEntries.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
             <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Documentation Found</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Start building your audit trail today.</p>
             <button onClick={() => setIsFormOpen(true)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition-colors">Create First Entry</button>
          </div>
        ) : (
          userEntries.map(entry => (
             <div key={entry.id} className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                   <div>
                      <div className="flex items-center gap-3 mb-2">
                         <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase rounded border border-slate-200 dark:border-slate-600">{entry.category}</span>
                         <span className="text-xs text-slate-400 font-mono">{entry.timestamp}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{entry.title}</h3>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded border ${getStatusColor(entry.status)}`}>
                         {entry.status}
                      </span>
                   </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                   {entry.dimensions.map(d => (
                      <span key={d} className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800">
                         {d}
                      </span>
                   ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded border border-slate-100 dark:border-slate-700">
                   <div className="md:col-span-2">
                      <p className="font-semibold text-slate-900 dark:text-white mb-1 text-xs uppercase">Summary</p>
                      <p className="leading-relaxed mb-4">{entry.summary}</p>
                      
                      <p className="font-semibold text-slate-900 dark:text-white mb-1 text-xs uppercase">Justification</p>
                      <p className="italic text-slate-600 dark:text-slate-400">{entry.justification}</p>

                      {entry.reflection && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                           <p className="font-semibold text-slate-900 dark:text-white mb-1 text-xs uppercase">Reflection</p>
                           <p className="text-slate-600 dark:text-slate-400">{entry.reflection}</p>
                        </div>
                      )}
                   </div>
                   <div className="md:col-span-1 border-l border-slate-200 dark:border-slate-700 pl-4">
                      <p className="font-semibold text-slate-900 dark:text-white mb-2 text-xs uppercase flex items-center gap-2">
                         <LinkIcon className="w-3 h-3" /> Evidence ({entry.evidenceLinks.length})
                      </p>
                      <ul className="space-y-2">
                         {entry.evidenceLinks.map((link, i) => (
                            <li key={i}>
                               <a href={link} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs break-all block">
                                  {link}
                               </a>
                            </li>
                         ))}
                         {entry.evidenceLinks.length === 0 && <span className="text-xs text-slate-400">None provided.</span>}
                      </ul>
                   </div>
                </div>
             </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Documentation;