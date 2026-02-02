import React, { useState } from 'react';
import { User, StudyLog, WeekModule, WeeklyScore, CapstoneState } from '../types';
import { generatePerformanceAnalysis, PerformanceAnalysis } from '../services/geminiService';
import { Sparkles, Activity, AlertTriangle, TrendingUp, Target, Cpu, CheckCircle } from './Icons';

interface AiAnalystProps {
    users: User[];
    logs: StudyLog[];
    modules: WeekModule[];
    scores: WeeklyScore[];
    capstoneState: CapstoneState[];
    onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

const AiAnalyst: React.FC<AiAnalystProps> = ({ users, logs, modules, scores, capstoneState, onNotify }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>(users[0].id);
    const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastAnalyzedUser, setLastAnalyzedUser] = useState<string | null>(null);

    const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis(null);

        // 1. Prepare Data Payload (Summarized to save tokens)
        const userLogs = logs.filter(l => l.userId === selectedUserId);
        const recentLogs = userLogs.slice(0, 10); // Last 10 entries
        const totalHours = userLogs.reduce((acc, l) => acc + l.hours, 0);

        const userScores = scores.filter(s => s.userId === selectedUserId);
        const latestScore = userScores.length > 0 ? userScores[userScores.length - 1] : null;

        const myCapstone = capstoneState.find(c => c.userId === selectedUserId);

        const payload = {
            name: selectedUser.name,
            role: selectedUser.role,
            totalStudyHours: totalHours,
            totalSessions: userLogs.length,
            recentActivity: recentLogs.map(l => ({ date: l.date, hours: l.hours, notes: l.notes, difficulty: l.difficulty })),
            latestSelfAssessment: latestScore,
            capstoneReadiness: myCapstone?.dimensions
        };

        try {
            // 2. Call AI Service
            const result = await generatePerformanceAnalysis(payload);
            setAnalysis(result);
            setLastAnalyzedUser(selectedUserId);
            onNotify('success', 'Analysis generated successfully');
        } catch (e: any) {
            console.error(e);
            onNotify('error', `Analysis failed: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 dark:border-slate-700 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
                        Neural Analyst
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        AI-driven performance reviews and predictive insights.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    {users.map(u => (
                        <button
                            key={u.id}
                            onClick={() => {
                                setSelectedUserId(u.id);
                                if (lastAnalyzedUser !== u.id) setAnalysis(null);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                                selectedUserId === u.id
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                                selectedUserId === u.id
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                                    : 'bg-slate-200 dark:bg-slate-600'
                            }`}>
                                {u.avatarInitials}
                            </div>
                            {u.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            {!analysis && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="bg-fuchsia-100 dark:bg-fuchsia-900/30 p-6 rounded-full mb-6 animate-pulse">
                        <Cpu className="w-12 h-12 text-fuchsia-600 dark:text-fuchsia-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to Analyze {selectedUser.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
                        The Neural Analyst will process logs, difficulty ratings, and artifact evidence to generate a senior-level performance review.
                    </p>
                    <button
                        onClick={handleAnalyze}
                        className="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-lg shadow-lg shadow-fuchsia-500/30 transition-all transform hover:scale-105"
                    >
                        Generate Analysis
                    </button>
                </div>
            ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-fuchsia-500 rounded-full border-t-transparent animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-fuchsia-500 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white animate-pulse">Synthesizing Performance Vectors...</h3>
                    <p className="text-sm text-slate-400 mt-2 font-mono">Comparing against Senior Engineer benchmarks</p>
                </div>
            ) : analysis ? (
                <div className="animate-fade-in space-y-6">
                    {/* KPI Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Velocity Card */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp className="w-24 h-24 text-indigo-500" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Velocity Score</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">{analysis.velocityScore}</span>
                                <span className="text-sm text-slate-500">/ 100</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 mt-4 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${analysis.velocityScore >= 80 ? 'bg-emerald-500' : analysis.velocityScore >= 50 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                                    style={{ width: `${analysis.velocityScore}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Burnout Risk Card */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertTriangle className="w-24 h-24 text-rose-500" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Burnout Risk</p>
                            <div className="flex items-center gap-2">
                        <span className={`text-2xl font-black ${
                            analysis.burnoutRisk === 'High' ? 'text-rose-500' :
                                analysis.burnoutRisk === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                            {analysis.burnoutRisk}
                        </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                Based on logging consistency and intensity spikes.
                            </p>
                        </div>

                        {/* Engagement Card */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Activity className="w-24 h-24 text-fuchsia-500" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Engagement Level</p>
                            <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-fuchsia-600 dark:text-fuchsia-400">
                            {analysis.engagementLevel || 'Steady'}
                        </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                Qualitative assessment of log detail depth.
                            </p>
                        </div>
                    </div>

                    {/* Strategic Advice (Manager's Note) */}
                    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-fuchsia-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Target className="w-6 h-6 text-fuchsia-300" />
                                </div>
                                <h3 className="text-lg font-bold">Manager's Strategic Note</h3>
                            </div>
                            <p className="text-indigo-100 leading-relaxed text-lg font-light italic">
                                "{analysis.strategicAdvice}"
                            </p>
                        </div>
                    </div>

                    {/* Grid: Strengths vs Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Observed Strengths
                            </h4>
                            <ul className="space-y-3">
                                {analysis.strengths.map((s, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                        <span className="font-bold text-emerald-500">{i+1}.</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Critical Gaps
                            </h4>
                            <ul className="space-y-3">
                                {analysis.weaknesses.map((w, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 bg-rose-50 dark:bg-rose-900/10 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                        <span className="font-bold text-rose-500">{i+1}.</span> {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Action Items Footer */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                            Recommended Sprint Actions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {analysis.actionItems.map((item, i) => (
                                <div key={i} className="flex gap-3 items-start p-4 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                        {i+1}
                                    </div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center pt-8">
                        <button
                            onClick={handleAnalyze}
                            className="text-xs text-slate-400 hover:text-fuchsia-500 flex items-center gap-1 transition-colors"
                        >
                            <Sparkles className="w-3 h-3" /> Refresh Analysis
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default AiAnalyst;
