import React, { useState, useMemo } from 'react';
import { JournalEntry, User, WeekModule } from '../types';
import { Notebook, BrainCircuit, CheckCircle, AlertTriangle, Target, LinkIcon } from './Icons';
import useLocalStorage from '../hooks/useLocalStorage';

interface JournalProps {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  currentUser: User;
  users: User[];
  modules: WeekModule[];
}

const Journal: React.FC<JournalProps> = ({ entries, setEntries, currentUser, users, modules }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'All'>('All');
  
  // Form State with Auto-Save Persistence
  const [entryType, setEntryType] = useLocalStorage<'Daily' | 'Weekly'>('draft_journal_type', 'Daily');
  const [selectedWeek, setSelectedWeek] = useLocalStorage<number>('draft_journal_week', modules[0]?.id || 1);
  const [learned, setLearned] = useLocalStorage('draft_journal_learned', '');
  const [confused, setConfused] = useLocalStorage('draft_journal_confused', '');
  const [fixed, setFixed] = useLocalStorage('draft_journal_fixed', '');
  const [tags, setTags] = useLocalStorage('draft_journal_tags', '');

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = searchQuery === '' || 
        entry.learned.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.confused.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesWeek = selectedWeekFilter === 'All' || entry.weekId === selectedWeekFilter;
      
      return matchesSearch && matchesWeek;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, searchQuery, selectedWeekFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      weekId: selectedWeek,
      userId: currentUser.id,
      type: entryType,
      learned,
      confused,
      fixed,
      takeaway: '', // Deprecated field
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== '')
    };

    setEntries([newEntry, ...entries]);
    setIsFormOpen(false);
    
    // Clear Drafts
    setLearned('');
    setConfused('');
    setFixed('');
    setTags('');
    setEntryType('Daily');
  };

  const getUserInitials = (id: string) => users.find(u => u.id === id)?.avatarInitials || 'NA';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">Learning Journal</h2>
        </div>

        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-medium rounded transition-colors"
        >
          {isFormOpen ? 'Cancel' : 'New Entry'}
        </button>
      </div>

      {/* Entry Form */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 relative transition-colors">
           <div className="absolute top-4 right-4 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
              <LinkIcon className="w-3 h-3" /> Auto-Save Active
           </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Type</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEntryType('Daily')} className={`flex-1 py-2 text-xs font-medium rounded border transition-colors ${entryType === 'Daily' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>Daily</button>
                  <button type="button" onClick={() => setEntryType('Weekly')} className={`flex-1 py-2 text-xs font-medium rounded border transition-colors ${entryType === 'Weekly' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>Weekly</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Module</label>
                <select 
                  value={selectedWeek} 
                  onChange={e => setSelectedWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Learnings</label>
                <textarea required value={learned} onChange={e => setLearned(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none" placeholder="Key concepts..." />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Confusion</label>
                   <textarea value={confused} onChange={e => setConfused(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none" />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Fixes</label>
                   <textarea value={fixed} onChange={e => setFixed(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Tags</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="SQL, Bugfix..." />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Filter entries..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
          />
        </div>
        <select 
          value={selectedWeekFilter} 
          onChange={e => setSelectedWeekFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="All">All Weeks</option>
          {modules.map(m => (
            <option key={m.id} value={m.id}>Week {m.id}</option>
          ))}
        </select>
      </div>

      {/* Entries List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800">
            <p className="text-slate-400 text-sm">No entries found.</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded uppercase tracking-wider">
                        {getUserInitials(entry.userId)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-white text-sm">{entry.date}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${entry.type === 'Weekly' ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'}`}>
                          {entry.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  {entry.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                      {entry.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Learnings</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{entry.learned}</p>
                  </div>
                  
                  <div className="space-y-4">
                     {entry.confused && (
                       <div>
                         <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Blockers</h4>
                         <p className="text-sm text-slate-700 dark:text-slate-300">{entry.confused}</p>
                       </div>
                     )}
                     {entry.fixed && (
                       <div>
                         <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Resolutions</h4>
                         <p className="text-sm text-slate-700 dark:text-slate-300">{entry.fixed}</p>
                       </div>
                     )}
                  </div>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Journal;