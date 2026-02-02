import React, { useState, useMemo } from 'react';
import { JournalEntry, User, WeekModule, Flashcard } from '../types';
import { LinkIcon, HelpCircle, Edit, Layers } from './Icons';
import { SimpleMarkdown } from './SimpleMarkdown';
import useLocalStorage from '../hooks/useLocalStorage';

interface JournalProps {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  currentUser: User;
  users: User[];
  modules: WeekModule[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}

const Journal: React.FC<JournalProps> = ({ entries, setEntries, currentUser, users, modules, setFlashcards }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'All'>('All');
  const [editingId, setEditingId] = useState<string | null>(null);

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

    if (editingId) {
      // Update existing entry
      setEntries(prev => prev.map(entry => {
        if (entry.id === editingId) {
          return {
            ...entry,
            weekId: selectedWeek,
            type: entryType,
            learned,
            confused,
            fixed,
            tags: tags.split(',').map(t => t.trim()).filter(t => t !== '')
          };
        }
        return entry;
      }));
      setEditingId(null);
    } else {
      // Create new entry
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
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleEdit = (entry: JournalEntry) => {
    // Pre-fill form with entry data
    setEditingId(entry.id);
    setEntryType(entry.type);
    setSelectedWeek(entry.weekId);
    setLearned(entry.learned);
    setConfused(entry.confused);
    setFixed(entry.fixed);
    setTags(entry.tags.join(', '));

    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateFlashcard = (entry: JournalEntry) => {
    if (confirm("Create a flashcard from this entry? The 'Learnings' will be the Question, and 'Fixes/Resolution' will be the Answer.")) {
      const card: Flashcard = {
        id: `card-${Date.now()}`,
        userId: currentUser.id,
        front: entry.learned.substring(0, 300) + (entry.learned.length > 300 ? '...' : ''), // Truncate slightly if massive
        back: entry.fixed || entry.confused || "Review Journal Entry " + entry.date,
        box: 1,
        nextReviewDate: new Date().toISOString().split('T')[0],
        tags: entry.tags
      };
      setFlashcards(prev => [...prev, card]);
      alert("Flashcard added to Retention Engine!");
    }
  };

  const resetForm = () => {
    setLearned('');
    setConfused('');
    setFixed('');
    setTags('');
    setEntryType('Daily');
    setEditingId(null);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const getUserInitials = (id: string) => users.find(u => u.id === id)?.avatarInitials || 'NA';

  const FormatHint = () => (
      <div className="flex items-center gap-3 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded border border-slate-100 dark:border-slate-700 mb-1 w-fit">
        <span className="font-bold flex items-center gap-1"><HelpCircle className="w-3 h-3"/> Formatting:</span>
        <code>**bold**</code>
        <code>`code`</code>
        <code>- list</code>
        <code># Header</code>
      </div>
  );

  return (
      <div className="space-y-8 animate-fade-in">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">Learning Journal</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Capture insights, document bugs, and reflect on progress.</p>
          </div>

          <button
              onClick={() => {
                if (isFormOpen) handleCancel();
                else setIsFormOpen(true);
              }}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  isFormOpen
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white'
              }`}
          >
            {isFormOpen ? 'Cancel' : 'New Entry'}
          </button>
        </div>

        {/* Entry Form */}
        {isFormOpen && (
            <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 relative transition-colors shadow-lg">
              {editingId ? (
                  <div className="absolute top-4 right-4 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800 flex items-center gap-1">
                    <Edit className="w-3 h-3" /> Editing Entry
                  </div>
              ) : (
                  <div className="absolute top-4 right-4 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> Auto-Save Active
                  </div>
              )}

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

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Learnings (What stuck?)</label>
                      <FormatHint />
                    </div>
                    <textarea required value={learned} onChange={e => setLearned(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-y font-mono" placeholder="- Concept A&#10;- Concept B&#10;**Important Note:**..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Confusion (Blockers)</label>
                      <textarea value={confused} onChange={e => setConfused(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" placeholder="I didn't understand why..." />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Fixes / Resolution</label>
                      <textarea value={fixed} onChange={e => setFixed(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" placeholder="Solved it by `pip install x`..." />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Tags</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="SQL, Bugfix..." />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                      type="submit"
                      className={`px-6 py-2 text-white text-sm font-medium rounded transition-colors shadow-md ${
                          editingId
                              ? 'bg-indigo-600 hover:bg-indigo-700'
                              : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                  >
                    {editingId ? 'Update Entry' : 'Save Entry'}
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
                placeholder="Search learnings, tags, solutions..."
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
                  <div key={entry.id} className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm relative group">
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

                      <div className="flex items-center gap-2">
                        {entry.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap justify-end">
                              {entry.tags.map(tag => (
                                  <span key={tag} className="text-[10px] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">#{tag}</span>
                              ))}
                            </div>
                        )}

                        {currentUser.id === entry.userId && (
                            <>
                              <button
                                  onClick={() => handleCreateFlashcard(entry)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                  title="Convert to Flashcard"
                              >
                                <Layers className="w-4 h-4" />
                              </button>
                              <button
                                  onClick={() => handleEdit(entry)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                  title="Edit Entry"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Learnings</h4>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <SimpleMarkdown content={entry.learned} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {entry.confused && (
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Blockers</h4>
                              <SimpleMarkdown content={entry.confused} />
                            </div>
                        )}
                        {entry.fixed && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded border border-emerald-100 dark:border-emerald-900/30">
                              <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Solution
                              </h4>
                              <SimpleMarkdown content={entry.fixed} />
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
