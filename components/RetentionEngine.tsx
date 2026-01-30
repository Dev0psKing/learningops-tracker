import React, { useState, useMemo } from 'react';
import { User, Flashcard, FlashcardBox } from '../types';
import { Layers, Repeat, Plus, Trash, CheckCircle, BrainCircuit, Eye, Clock } from './Icons';
import { SimpleMarkdown } from './SimpleMarkdown';

interface RetentionEngineProps {
    currentUser: User;
    cards: Flashcard[];
    setCards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}

const BOX_INTERVALS: Record<FlashcardBox, number> = {
    1: 1,  // Review tomorrow
    2: 3,  // Review in 3 days
    3: 7,  // Review in 1 week
    4: 14, // Review in 2 weeks
    5: 30  // Review in 1 month
};

const RetentionEngine: React.FC<RetentionEngineProps> = ({ currentUser, cards, setCards }) => {
    const [activeTab, setActiveTab] = useState<'review' | 'manage' | 'add'>('review');
    const [showAnswer, setShowAnswer] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    // Add Form State
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [newTags, setNewTags] = useState('');

    // --- Logic ---

    const myCards = useMemo(() => cards.filter(c => c.userId === currentUser.id), [cards, currentUser.id]);

    const dueCards = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return myCards.filter(c => c.nextReviewDate <= today).sort((a, b) => a.box - b.box); // Prioritize lower boxes (harder)
    }, [myCards]);

    const stats = useMemo(() => {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        myCards.forEach(c => {
            counts[c.box] = (counts[c.box] || 0) + 1;
        });
        return counts;
    }, [myCards]);

    const currentCard = dueCards[currentCardIndex];

    // --- Actions ---

    const handleRate = (success: boolean) => {
        if (!currentCard) return;

        let newBox: FlashcardBox = 1;
        let daysToAdd = 1;

        if (success) {
            // Promotion Logic
            newBox = Math.min(currentCard.box + 1, 5) as FlashcardBox;
            daysToAdd = BOX_INTERVALS[newBox];
        } else {
            // Demotion Logic (Reset to Box 1)
            newBox = 1;
            daysToAdd = 1;
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        const nextDateStr = nextDate.toISOString().split('T')[0];

        // Update Card
        setCards(prev => prev.map(c => {
            if (c.id === currentCard.id) {
                return {
                    ...c,
                    box: newBox,
                    nextReviewDate: nextDateStr,
                    lastReviewed: new Date().toISOString().split('T')[0]
                };
            }
            return c;
        }));

        // Reset View for next card (which is actually index 0 again since the array filters out reviewed cards eventually,
        // but due to state update batching, we just keep index 0 unless we want to cycle through session)
        // Actually, since dueCards updates when setCards runs (dependencies), the processed card vanishes from dueCards.
        // So index 0 is always the "next" card.
        setShowAnswer(false);
        setCurrentCardIndex(0);
    };

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        const card: Flashcard = {
            id: `card-${Date.now()}`,
            userId: currentUser.id,
            front: newFront,
            back: newBack,
            box: 1,
            nextReviewDate: new Date().toISOString().split('T')[0], // Due immediately
            tags: newTags.split(',').map(t => t.trim()).filter(t => t),
        };

        setCards([...cards, card]);
        setNewFront('');
        setNewBack('');
        setNewTags('');
        setActiveTab('review'); // Go back to review to see it
    };

    const handleDelete = (id: string) => {
        if(confirm("Delete this flashcard?")) {
            setCards(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Retention Engine
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Leitner System Spaced Repetition (SRS)</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('review')}
                        className={`px-4 py-2 text-sm font-bold rounded border transition-colors ${activeTab === 'review' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                    >
                        Review Queue ({dueCards.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`px-4 py-2 text-sm font-bold rounded border transition-colors ${activeTab === 'manage' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                    >
                        Deck ({myCards.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`px-4 py-2 text-sm font-bold rounded border transition-colors ${activeTab === 'add' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* --- STATS BAR --- */}
            <div className="grid grid-cols-5 gap-2">
                {[1,2,3,4,5].map((box) => (
                    <div key={box} className={`p-2 rounded border text-center ${stats[box as FlashcardBox] > 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Box {box}</div>
                        <div className={`text-lg font-bold ${stats[box as FlashcardBox] > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`}>
                            {stats[box as FlashcardBox]}
                        </div>
                        <div className="text-[8px] text-slate-400">{BOX_INTERVALS[box as FlashcardBox]}d interval</div>
                    </div>
                ))}
            </div>

            {/* --- REVIEW MODE --- */}
            {activeTab === 'review' && (
                <div className="max-w-2xl mx-auto mt-8">
                    {dueCards.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">All Caught Up!</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">You have reviewed all cards due for today.</p>
                            <button onClick={() => setActiveTab('add')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition-colors">Create New Cards</button>
                        </div>
                    ) : (
                        <div className="perspective-1000">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Card {currentCardIndex + 1} of {dueCards.length}</span>
                                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Box {currentCard.box}</span>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden min-h-[300px] flex flex-col relative">
                                {/* Front */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Question / Concept</h3>
                                    <div className="prose prose-lg dark:prose-invert max-w-none flex-1">
                                        <SimpleMarkdown content={currentCard.front} />
                                    </div>
                                </div>

                                {/* Back (Reveal) */}
                                {showAnswer && (
                                    <div className="p-8 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex-1 animate-fade-in">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Answer / Solution</h3>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <SimpleMarkdown content={currentCard.back} />
                                        </div>
                                    </div>
                                )}

                                {/* Controls */}
                                <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                                    {!showAnswer ? (
                                        <button
                                            onClick={() => setShowAnswer(true)}
                                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-md transition-transform transform hover:-translate-y-0.5"
                                        >
                                            <Eye className="w-5 h-5" /> Reveal Answer
                                        </button>
                                    ) : (
                                        <div className="flex gap-4 w-full">
                                            <button
                                                onClick={() => handleRate(false)}
                                                className="flex-1 py-3 bg-white dark:bg-slate-800 border-2 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold rounded hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                            >
                                                Forgot (Box 1)
                                            </button>
                                            <button
                                                onClick={() => handleRate(true)}
                                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-md transition-colors"
                                            >
                                                Recalled (Box {Math.min(currentCard.box + 1, 5)})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- MANAGE MODE --- */}
            {activeTab === 'manage' && (
                <div className="space-y-4">
                    {myCards.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 italic">No cards in deck.</div>
                    ) : (
                        myCards.map(card => (
                            <div key={card.id} className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-start group">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Front</span>
                                        <p className="text-sm text-slate-800 dark:text-white line-clamp-2">{card.front.substring(0, 100)}...</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Back</span>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{card.back.substring(0, 100)}...</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${card.box === 5 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'}`}>
                        Box {card.box}
                     </span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {card.nextReviewDate}
                     </span>
                                    <button onClick={() => handleDelete(card.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* --- ADD MODE --- */}
            {activeTab === 'add' && (
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Create New Flashcard</h3>
                    <form onSubmit={handleAddCard} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Front (Question / Concept)</label>
                            <textarea
                                required
                                value={newFront}
                                onChange={e => setNewFront(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none font-mono"
                                placeholder="e.g. What is the difference between inner and left join?"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Back (Answer / Solution)</label>
                            <textarea
                                required
                                value={newBack}
                                onChange={e => setNewBack(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none font-mono"
                                placeholder="e.g. Inner join returns only matching rows..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Tags (Optional)</label>
                            <input
                                type="text"
                                value={newTags}
                                onChange={e => setNewTags(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded text-sm outline-none"
                                placeholder="SQL, Pandas, Basics..."
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-lg transition-colors">
                                Add to Deck
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default RetentionEngine;
