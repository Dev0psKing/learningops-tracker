import React, { useState, useMemo } from 'react';
import { User, Flashcard, FlashcardBox } from '../types';
import { Layers, Plus, Trash, CheckCircle, Eye, Clock, HelpCircle, TrendingUp, BrainCircuit, Target, Activity } from './Icons';
import { SimpleMarkdown } from './SimpleMarkdown';
import { generateFlashcards } from '../services/geminiService';

interface RetentionEngineProps {
    currentUser: User;
    cards: Flashcard[];
    setCards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
    onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

const BOX_INTERVALS: Record<FlashcardBox, number> = {
    1: 1,  // Review tomorrow
    2: 3,  // Review in 3 days
    3: 7,  // Review in 1 week
    4: 14, // Review in 2 weeks
    5: 30  // Review in 1 month
};

const RetentionEngine: React.FC<RetentionEngineProps> = ({ currentUser, cards, setCards, onNotify }) => {
    const [activeTab, setActiveTab] = useState<'review' | 'manage' | 'add'>('review');
    const [showAnswer, setShowAnswer] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showGuide, setShowGuide] = useState(true);

    // Add Form State
    const [addMode, setAddMode] = useState<'manual' | 'ai'>('manual');
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [newTags, setNewTags] = useState('');

    // AI State
    const [aiTopic, setAiTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // --- Logic ---

    const myCards = useMemo(() => cards.filter(c => c.userId === currentUser.id), [cards, currentUser.id]);

    const dueCards = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return myCards.filter(c => c.nextReviewDate <= today).sort((a, b) => a.box - b.box); // Prioritize lower boxes (harder)
    }, [myCards]);

    const stats = useMemo(() => {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<FlashcardBox, number>;
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

        // Reset View for next card
        setShowAnswer(false);
        setCurrentCardIndex(0);
    };

    const handleManualAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const tags = newTags.split(',').map(t => t.trim()).filter(t => t);

        const card: Flashcard = {
            id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: currentUser.id,
            front: newFront,
            back: newBack,
            box: 1,
            nextReviewDate: new Date().toISOString().split('T')[0], // Due immediately
            tags,
        };

        setCards(prev => [...prev, card]);
        setNewFront('');
        setNewBack('');
        setNewTags('');
        onNotify('success', 'Flashcard added successfully');
        setActiveTab('review');
    };

    const handleAiGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiTopic) return;

        setIsGenerating(true);
        try {
            const generatedCardsData = await generateFlashcards(aiTopic);

            if (generatedCardsData && generatedCardsData.length > 0) {
                // Create card objects locally first
                const newCards: Flashcard[] = generatedCardsData.map((c, index) => ({
                    id: `card-ai-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                    userId: currentUser.id,
                    front: c.front,
                    back: c.back,
                    box: 1,
                    nextReviewDate: new Date().toISOString().split('T')[0],
                    tags: c.tags
                }));

                // Batch update state once
                setCards(prev => [...prev, ...newCards]);

                onNotify('success', `Generated ${newCards.length} cards about "${aiTopic}"!`);
                setAiTopic('');
                setActiveTab('review');
            } else {
                onNotify('error', "AI could not generate cards. Please try a different topic.");
            }
        } catch (err: any) {
            console.error(err);
            onNotify('error', `AI Error: ${err.message || "Connection failed"}.`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = (id: string) => {
        if(confirm("Delete this flashcard?")) {
            setCards(prev => prev.filter(c => c.id !== id));
            onNotify('info', 'Card deleted');
        }
    };

    // ... (Rest of UI identical, just passing props)

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

                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className={`p-2 rounded-lg transition-colors ${showGuide ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                        title={showGuide ? "Hide Guide" : "Show Guide"}
                    >
                        <HelpCircle className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
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

            {/* --- ONBOARDING GUIDE --- */}
            {showGuide && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm p-6 relative overflow-hidden transition-colors mb-6 animate-fade-in">
                    {/* Decorative Accent */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5 text-indigo-500" />
                                Hack Your Memory with Spaced Repetition
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                                Stop reviewing what you already know. The Retention Engine uses the <strong>Leitner System</strong> to schedule reviews exactly when you are about to forget them, maximizing long-term memory with minimal effort.
                            </p>
                        </div>
                        <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            ✕
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: The Process */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">How it Works</h4>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-sm">1</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">Review & Reveal</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Read the question. Try to recall the answer mentally, then click "Reveal".</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-sm">2</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">Rate Performance</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        <span className="text-rose-500 font-bold">Forgot:</span> Resets to Box 1 (Review tomorrow).<br/>
                                        <span className="text-indigo-500 font-bold">Recalled:</span> Promotes to next Box (Review later).
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-sm">3</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">Compound Knowledge</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cards you know well are pushed weeks into the future. Cards you struggle with appear daily.</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: The Boxes */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-5 border border-slate-100 dark:border-slate-700">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> The Intervals
                            </h4>
                            <div className="flex justify-between items-end h-24 gap-2">
                                {[
                                    { box: 1, days: '1d', label: 'New', height: 'h-8', color: 'bg-rose-400' },
                                    { box: 2, days: '3d', label: 'Recent', height: 'h-12', color: 'bg-amber-400' },
                                    { box: 3, days: '7d', label: 'Stable', height: 'h-16', color: 'bg-blue-400' },
                                    { box: 4, days: '14d', label: 'Solid', height: 'h-20', color: 'bg-indigo-400' },
                                    { box: 5, days: '30d', label: 'Mastered', height: 'h-24', color: 'bg-emerald-400' },
                                ].map((b) => (
                                    <div key={b.box} className="flex-1 flex flex-col items-center gap-1 group">
                                        <span className="text-[10px] text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-4">{b.label}</span>
                                        <div className={`w-full ${b.height} ${b.color} rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{b.days}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-[10px] text-center text-slate-400 italic">
                                "Recalled" moves right. "Forgot" moves all the way left.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- STATS BAR --- */}
            <div className="grid grid-cols-5 gap-2">
                {[1,2,3,4,5].map((box) => (
                    <div key={box} className={`p-2 rounded border text-center transition-colors ${stats[box as FlashcardBox] > 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
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
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setActiveTab('add')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition-colors">Create New Cards</button>
                                <button onClick={() => setActiveTab('manage')} className="px-6 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded transition-colors">Manage Deck</button>
                            </div>
                        </div>
                    ) : (
                        <div className="perspective-1000">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Card {currentCardIndex + 1} of {dueCards.length}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Level:</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                        currentCard.box === 1 ? 'bg-rose-100 text-rose-700' :
                                            currentCard.box === 5 ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-indigo-100 text-indigo-700'
                                    }`}>Box {currentCard.box}</span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden min-h-[400px] flex flex-col relative transition-colors">
                                {/* Front */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                            <Target className="w-4 h-4" /> Question / Concept
                                        </h3>
                                        {currentCard.tags && currentCard.tags.length > 0 && (
                                            <div className="flex gap-1">
                                                {currentCard.tags.map(t => (
                                                    <span key={t} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">#{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="prose prose-lg dark:prose-invert max-w-none flex-1 flex flex-col justify-center">
                                        <SimpleMarkdown content={currentCard.front} />
                                    </div>
                                </div>

                                {/* Back (Reveal) */}
                                {showAnswer && (
                                    <div className="p-8 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex-1 animate-fade-in">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Answer / Solution
                                        </h3>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <SimpleMarkdown content={currentCard.back} />
                                        </div>
                                    </div>
                                )}

                                {/* Controls */}
                                <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-center sticky bottom-0">
                                    {!showAnswer ? (
                                        <button
                                            onClick={() => setShowAnswer(true)}
                                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-md transition-transform transform hover:-translate-y-0.5 w-full justify-center md:w-auto"
                                        >
                                            <Eye className="w-5 h-5" /> Reveal Answer
                                        </button>
                                    ) : (
                                        <div className="flex gap-4 w-full">
                                            <button
                                                onClick={() => handleRate(false)}
                                                className="flex-1 py-3 bg-white dark:bg-slate-800 border-2 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold rounded hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex flex-col items-center justify-center gap-1"
                                            >
                                                <span>Forgot</span>
                                                <span className="text-[9px] font-normal opacity-70">Reset to Box 1 (1d)</span>
                                            </button>
                                            <button
                                                onClick={() => handleRate(true)}
                                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-md transition-colors flex flex-col items-center justify-center gap-1"
                                            >
                                                <span>Recalled</span>
                                                <span className="text-[9px] font-normal opacity-80">Promote to Box {Math.min(currentCard.box + 1, 5)} ({BOX_INTERVALS[Math.min(currentCard.box + 1, 5) as FlashcardBox]}d)</span>
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
                        <div className="text-center py-12 text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed border-slate-200 dark:border-slate-700">
                            No cards in deck. Switch to the 'Add' tab or create cards from your Journal.
                        </div>
                    ) : (
                        myCards.map(card => (
                            <div key={card.id} className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-start group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Front</span>
                                        <p className="text-sm text-slate-800 dark:text-white line-clamp-2 font-medium">{card.front.substring(0, 100)}...</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Back</span>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{card.back.substring(0, 100)}...</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4 min-w-[80px]">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded border w-full text-center ${card.box === 5 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'}`}>
                        Box {card.box}
                     </span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3" /> {card.nextReviewDate}
                     </span>
                                    <button onClick={() => handleDelete(card.id)} className="text-slate-300 hover:text-rose-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="Delete Card">
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
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Flashcard</h3>
                        {/* Mode Switcher */}
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                            <button
                                onClick={() => setAddMode('manual')}
                                className={`px-3 py-1.5 text-xs font-bold rounded ${addMode === 'manual' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Manual
                            </button>
                            <button
                                onClick={() => setAddMode('ai')}
                                className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 ${addMode === 'ai' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                <BrainCircuit className="w-3 h-3" /> AI Generate
                            </button>
                        </div>
                    </div>

                    {addMode === 'manual' ? (
                        <form onSubmit={handleManualAdd} className="space-y-6">
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
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                <p className="text-sm text-indigo-800 dark:text-indigo-200">
                                    <strong className="block mb-1">AI Flashcard Generator</strong>
                                    Enter a topic (e.g., "Python List Comprehension" or "SQL Normalization") and the Neural Engine will generate 3 high-quality flashcards for you automatically.
                                </p>
                            </div>

                            <form onSubmit={handleAiGenerate}>
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Topic or Concept</label>
                                    <input
                                        type="text"
                                        value={aiTopic}
                                        onChange={e => setAiTopic(e.target.value)}
                                        placeholder="e.g. Advanced Tableau Table Calculations"
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={!aiTopic || isGenerating}
                                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isGenerating ? <Activity className="w-5 h-5 animate-spin"/> : <BrainCircuit className="w-5 h-5"/>}
                                        {isGenerating ? 'Generating...' : 'Generate Cards'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RetentionEngine;
