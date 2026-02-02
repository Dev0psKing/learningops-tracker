import React, { useMemo, useState } from 'react';
import { User, CapstoneState, ReadinessDimension, ReadinessDimensions, ReadinessStatus, DocEntry } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Briefcase, Trash, FileText, HelpCircle, Target, Activity, CheckCircle, BrainCircuit, Lock, AlertTriangle, Eye } from './Icons';
import { generateInterviewQuestions, evaluateAnswer, EvaluationResult } from '../services/geminiService';

interface CapstoneReadinessProps {
  currentUser: User;
  capstoneState: CapstoneState[];
  setCapstoneState: React.Dispatch<React.SetStateAction<CapstoneState[]>>;
  docEntries: DocEntry[];
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

const STATUS_SCORES: Record<ReadinessStatus, number> = {
  'Weak': 30,
  'Developing': 65,
  'Strong': 100
};

// Simple Icon for Audio
const Volume2 = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
);

/**
 * CapstoneReadiness Component
 */
const CapstoneReadiness: React.FC<CapstoneReadinessProps> = ({ currentUser, capstoneState, setCapstoneState, docEntries, onNotify }) => {
  const [newEvidence, setNewEvidence] = useState<Record<string, string>>({});
  const [showGuide, setShowGuide] = useState(true);

  // --- AI Viva Voce State ---
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [interviewDim, setInterviewDim] = useState<ReadinessDimension | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [interviewStatus, setInterviewStatus] = useState<'idle' | 'generating' | 'answering' | 'evaluating' | 'failed' | 'passed'>('idle');
  const [feedbackHistory, setFeedbackHistory] = useState<{q: string, a: string, feedback: string, correct: boolean}[]>([]);

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
    // If downgrading from Strong or changing status, remove verification
    const isVerified = status === 'Strong' && myState?.dimensions[dim]?.verified;
    const shouldKeepVerified = status === 'Strong' && isVerified;

    setCapstoneState(prev => prev.map(s => {
      if (s.userId !== currentUser.id) return s;
      return {
        ...s,
        dimensions: {
          ...s.dimensions,
          [dim]: {
            ...s.dimensions[dim],
            status,
            verified: shouldKeepVerified ? true : false
          }
        }
      };
    }));
  };

  // --- AI INTERVIEW LOGIC ---

  const startInterview = async (dim: ReadinessDimension) => {
    setInterviewDim(dim);
    setIsInterviewOpen(true);
    setInterviewStatus('generating');
    setFeedbackHistory([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setInterviewQuestions([]); // Reset to ensure no stale state

    try {
      const questions = await generateInterviewQuestions(dim);
      if (questions && questions.length > 0) {
        setInterviewQuestions(questions);
        setInterviewStatus('answering');
        // Auto-speak first question if desired, or let user click
        // speak(questions[0]);
      } else {
        throw new Error("No questions generated.");
      }
    } catch (e: any) {
      console.error(e);
      onNotify('error', `Failed to generate questions. ${e.message || "Please check connection."}`);
      setIsInterviewOpen(false);
    }
  };

  const speak = (text: string) => {
    if (!text) return;
    // Simple Web Speech API implementation
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      // Try to select a decent voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('en')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
    } else {
      onNotify('info', 'Text-to-Speech not supported in this browser.');
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setInterviewStatus('evaluating');
    const currentQ = interviewQuestions[currentQuestionIndex];

    try {
      const result: EvaluationResult = await evaluateAnswer(currentQ, userAnswer);

      const historyItem = {
        q: currentQ,
        a: userAnswer,
        feedback: result.feedback,
        correct: result.isCorrect
      };

      const newHistory = [...feedbackHistory, historyItem];
      setFeedbackHistory(newHistory);
      setUserAnswer('');

      if (!result.isCorrect) {
        setInterviewStatus('failed');
      } else {
        if (currentQuestionIndex < 2) {
          setCurrentQuestionIndex(prev => prev + 1);
          setInterviewStatus('answering');
        } else {
          setInterviewStatus('passed');
          completeVerification();
        }
      }
    } catch (err: any) {
      onNotify('error', "Failed to evaluate answer. Please try again.");
      setInterviewStatus('answering');
    }
  };

  const completeVerification = () => {
    if (!interviewDim) return;
    setCapstoneState(prev => prev.map(s => {
      if (s.userId !== currentUser.id) return s;
      return {
        ...s,
        dimensions: {
          ...s.dimensions,
          [interviewDim]: {
            ...s.dimensions[interviewDim],
            verified: true
          }
        }
      };
    }));
    onNotify('success', `Verification Passed for ${interviewDim}!`);
  };

  const closeInterview = () => {
    setIsInterviewOpen(false);
    setInterviewStatus('idle');
    window.speechSynthesis.cancel(); // Stop audio
  };

  // --- EVIDENCE LOGIC ---

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
    onNotify('success', 'Evidence link added');
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
                    <p><strong className="text-emerald-600 dark:text-emerald-400">Strong (100%):</strong> Requires AI Verification.</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 dark:text-white text-xs uppercase">
                    <BrainCircuit className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    AI Viva Voce
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Rate yourself "Strong"? Prove it. The AI Interviewer will challenge you with 3 hard questions before granting the Verified badge.
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
              const isVerified = data?.verified;

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
                        {isVerified && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-500 px-2 py-0.5 rounded shadow-sm shadow-emerald-500/30 animate-pulse">
                                <BrainCircuit className="w-3 h-3" />
                                AI Verified
                            </span>
                        )}
                      </div>

                      {/* Status Toggle */}
                      <div className="flex items-center gap-4">
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

                        {!isVerified && (
                            <button
                                onClick={() => status === 'Strong' ? startInterview(dim) : null}
                                disabled={status !== 'Strong'}
                                title={status !== 'Strong' ? "Rate yourself as 'Strong' to unlock AI verification" : "Start AI Mock Interview"}
                                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors shadow-sm ${
                                    status === 'Strong'
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white animate-bounce-short cursor-pointer'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                              {status !== 'Strong' && <Lock className="w-3 h-3" />}
                              {status === 'Strong' && <BrainCircuit className="w-3 h-3" />}
                              Verify
                            </button>
                        )}
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

        {/* --- INTERVIEW MODAL --- */}
        {isInterviewOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-indigo-600 p-6 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">AI Viva Voce: {interviewDim}</h3>
                      <p className="text-indigo-100 text-xs">Mock Oral Exam (Gemini Flash)</p>
                    </div>
                  </div>
                  <button onClick={closeInterview} className="text-white/70 hover:text-white">✕</button>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                  {interviewStatus === 'generating' && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Activity className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white">Generating Questions...</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Analyzing dimension requirements...</p>
                      </div>
                  )}

                  {(interviewStatus === 'answering' || interviewStatus === 'evaluating') && (
                      <div className="space-y-6">
                        {/* Progress */}
                        <div className="flex gap-2">
                          {[0,1,2].map(i => (
                              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= currentQuestionIndex ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                          ))}
                        </div>

                        {/* Chat History */}
                        <div className="space-y-4">
                          {feedbackHistory.map((item, idx) => (
                              <div key={idx} className="space-y-2 opacity-70">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg rounded-tl-none border border-slate-200 dark:border-slate-700 max-w-[85%]">
                                  <p className="text-xs font-bold text-indigo-600 mb-1">Interviewer</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200">{item.q}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg rounded-tr-none border border-indigo-100 dark:border-indigo-800 max-w-[85%] ml-auto">
                                  <p className="text-xs font-bold text-slate-500 mb-1 text-right">You</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200">{item.a}</p>
                                </div>
                                <div className="flex items-center gap-2 justify-center text-xs font-bold text-emerald-600">
                                  <CheckCircle className="w-3 h-3" /> Passed
                                </div>
                              </div>
                          ))}

                          {/* Current Question */}
                          {interviewQuestions[currentQuestionIndex] ? (
                              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl rounded-tl-none border border-indigo-200 dark:border-indigo-500 shadow-md max-w-[90%] animate-fade-in relative group">
                                <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">Interviewer (Question {currentQuestionIndex + 1}/3)</p>
                                <p className="text-base text-slate-900 dark:text-white font-medium">
                                  {interviewQuestions[currentQuestionIndex]}
                                </p>

                                {/* Voice Button */}
                                <button
                                    onClick={() => speak(interviewQuestions[currentQuestionIndex])}
                                    className="absolute top-4 right-4 p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full opacity-50 hover:opacity-100 transition-opacity"
                                    title="Read Aloud"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                          ) : (
                              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-lg">
                                Error loading question. Please close and try again.
                              </div>
                          )}
                        </div>
                      </div>
                  )}

                  {interviewStatus === 'failed' && (
                      <div className="text-center py-12">
                        <div className="bg-rose-100 dark:bg-rose-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification Failed</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                          The AI determined your answer was insufficient. Review the material and try again later.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded max-w-md mx-auto text-left mb-6">
                          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Feedback:</p>
                          <p className="text-sm text-slate-800 dark:text-white">{feedbackHistory[feedbackHistory.length - 1]?.feedback}</p>
                        </div>
                        <button onClick={closeInterview} className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded">Close</button>
                      </div>
                  )}

                  {interviewStatus === 'passed' && (
                      <div className="text-center py-12">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification Complete</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                          You have successfully demonstrated competence in <span className="font-bold text-indigo-600">{interviewDim}</span>.
                        </p>
                        <button onClick={closeInterview} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-lg">Claim Badge</button>
                      </div>
                  )}
                </div>

                {/* Footer Input */}
                {(interviewStatus === 'answering' || interviewStatus === 'evaluating') && (
                    <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                      <form onSubmit={submitAnswer} className="flex gap-4">
                        <input
                            autoFocus
                            type="text"
                            value={userAnswer}
                            onChange={e => setUserAnswer(e.target.value)}
                            disabled={interviewStatus === 'evaluating'}
                            placeholder={interviewStatus === 'evaluating' ? "AI is grading..." : "Type your answer here..."}
                            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={interviewStatus === 'evaluating' || !userAnswer.trim()}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg disabled:opacity-50 transition-colors"
                        >
                          {interviewStatus === 'evaluating' ? 'Grading...' : 'Submit'}
                        </button>
                      </form>
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
};

export default CapstoneReadiness;
