import React, { useState, useEffect, useRef } from 'react';
import { User, UserProject, StudyLog, Difficulty } from '../types';
import { Play, Terminal, Code, Plus, Trash, AlertTriangle, Cpu, CheckCircle, Save, Edit, FileText, RefreshCw, Target } from './Icons';
import useLocalStorage from '../hooks/useLocalStorage';

interface ProjectsProps {
    currentUser: User;
    logs: StudyLog[];
    setLogs: React.Dispatch<React.SetStateAction<StudyLog[]>>;
    projects: UserProject[];
    setProjects: React.Dispatch<React.SetStateAction<UserProject[]>>
}

declare global {
    interface Window {
        loadPyodide: any;
        pyodide: any;
    }
}

const DEFAULT_PROJECT: UserProject = {
    id: 'init-project',
    userId: 'system',
    title: 'My First Script',
    problemStatement: 'Write a python script that prints the sum of a list of numbers.\n\nExample list: [1, 2, 3, 4, 5]',
    code: "def calculate_sum(numbers):\n    return sum(numbers)\n\nmy_list = [1, 2, 3, 4, 5]\nprint(f'Sum: {calculate_sum(my_list)}')",
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    tags: ['Python'],
    status: 'active'
};

const Projects: React.FC<ProjectsProps> = ({ currentUser, logs, setLogs, projects, setProjects }) => {
    const [activeProjectId, setActiveProjectId] = useLocalStorage<string>('active_project_id', DEFAULT_PROJECT.id);

    // Transient State
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [pyodideLoaded, setPyodideLoaded] = useState(false);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [isEditingMeta, setIsEditingMeta] = useState(false);

    // Active Project Reference - Safe Fallback
    const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || DEFAULT_PROJECT;

    const pyodideRef = useRef<any>(null);

    // --- 1. Robust Pyodide Loading ---
    useEffect(() => {
        let mounted = true;

        const initPyodide = async () => {
            // If already loaded globally, use it
            if (window.pyodide) {
                pyodideRef.current = window.pyodide;
                if (mounted) setPyodideLoaded(true);
                return;
            }

            // Check if script exists, if not wait a bit
            if (!window.loadPyodide) {
                setTimeout(initPyodide, 1000);
                return;
            }

            try {
                const pyodide = await window.loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
                });

                if (mounted) {
                    pyodideRef.current = pyodide;
                    window.pyodide = pyodide; // Cache globally
                    setPyodideLoaded(true);
                }
            } catch (e: any) {
                console.error("Pyodide failed to load", e);
                if (mounted) setLoadingError(`Python Engine Failed: ${e.message}`);
            }
        };

        initPyodide();
        return () => { mounted = false; };
    }, []);

    // --- 2. Action Handlers ---

    const handleCreateProject = () => {
        const newProject: UserProject = {
            id: `proj-${Date.now()}`,
            userId: currentUser.id,
            title: 'Untitled Project',
            problemStatement: 'Describe the problem you are solving here...',
            code: "# Write your python code here\nprint('Hello World')",
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            tags: [],
            status: 'active'
        };
        // Add to top of list
        const updatedProjects = [newProject, ...projects];
        setProjects(updatedProjects);
        setActiveProjectId(newProject.id);
        setOutput([]);
        setIsEditingMeta(true);
    };

    const handleDeleteProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Stop bubbling to the parent click handler
        e.preventDefault();

        if (!window.confirm("Are you sure you want to delete this project?")) return;

        // 1. Filter out the deleted project
        const updatedList = projects.filter(p => p.id !== id);

        // 2. Handle empty list case (Restore Default)
        if (updatedList.length === 0) {
            const newDefault = { ...DEFAULT_PROJECT, id: `init-${Date.now()}` };
            setProjects([newDefault]);
            setActiveProjectId(newDefault.id);
            return;
        }

        // 3. Handle Active ID case
        // If we deleted the active project, switch to the first one in the new list
        if (id === activeProjectId) {
            setActiveProjectId(updatedList[0].id);
        }

        // 4. Update State
        setProjects(updatedList);
    };

    const handleCompleteProject = () => {
        const hoursStr = prompt("Project Completed! How many hours did you spend on this?", "2");
        if (!hoursStr) return;

        const hours = parseFloat(hoursStr) || 0;

        // 1. Update Project Status in Workspace
        const updatedProjects = projects.map(p =>
            p.id === activeProjectId
                ? { ...p, status: 'completed' as const, completedAt: new Date().toISOString() }
                : p
        );
        setProjects(updatedProjects);

        // 2. Log Time for Scoreboard (Dashboard)
        const newLog: StudyLog = {
            id: `log-proj-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            hours: hours,
            notes: `Completed Project: ${activeProject.title}`,
            difficulty: Difficulty.HARD,
            userId: currentUser.id
        };

        setLogs(prevLogs => [newLog, ...prevLogs]);
        alert(`Success! Project marked complete.\n\n+ ${hours} hours added to your Dashboard Scoreboard.`);
    };

    const updateActiveProject = (updates: Partial<UserProject>) => {
        setProjects(prev => prev.map(p => {
            if (p.id === activeProjectId) {
                return { ...p, ...updates, lastModified: new Date().toISOString() };
            }
            return p;
        }));
    };

    const runCode = async () => {
        if (!pyodideRef.current) {
            setOutput(['Error: Python engine not ready. Please wait...']);
            return;
        }

        setIsRunning(true);
        setOutput([]);

        try {
            pyodideRef.current.setStdout({
                batched: (msg: string) => {
                    setOutput(prev => [...prev, msg]);
                }
            });

            await pyodideRef.current.runPythonAsync(activeProject.code);

            setOutput(prev => {
                if(prev.length === 0) return ['[Process finished with exit code 0]'];
                return prev;
            });

        } catch (err: any) {
            setOutput(prev => [...prev, `Traceback (most recent call last):\n${err.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-fade-in pb-4">

            {/* Sidebar: Project List */}
            <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Terminal className="w-4 h-4" /> My Workspace
                        </h3>
                        <button
                            onClick={handleCreateProject}
                            className="p-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                            title="New Project"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                        {projects.map(p => {
                            const isActive = p.id === activeProjectId;
                            const isCompleted = p.status === 'completed';
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => { setActiveProjectId(p.id); setOutput([]); }}
                                    className={`group relative w-full text-left p-3 rounded-md text-sm transition-all border cursor-pointer ${
                                        isActive
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 font-medium'
                                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="truncate pr-4">{p.title || 'Untitled'}</span>
                                        {isCompleted && <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />}
                                    </div>
                                    <div className="flex justify-between items-end mt-1">
                                <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(p.lastModified).toLocaleDateString()}
                                </span>
                                        <button
                                            onClick={(e) => handleDeleteProject(p.id, e)}
                                            className={`p-1 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 rounded transition-all ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                            title="Delete Project"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main: IDE */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">

                {/* Project Meta (Title & Problem Statement) */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
                    {isEditingMeta ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={activeProject.title}
                                onChange={(e) => updateActiveProject({ title: e.target.value })}
                                className="w-full text-lg font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Project Title"
                                autoFocus
                            />
                            <textarea
                                value={activeProject.problemStatement}
                                onChange={(e) => updateActiveProject({ problemStatement: e.target.value })}
                                className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 resize-y h-20"
                                placeholder="Define your problem statement or requirements here..."
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setIsEditingMeta(false)}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700"
                                >
                                    <CheckCircle className="w-3 h-3" /> Done
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start group">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="truncate">{activeProject.title}</span>
                                        <button onClick={() => setIsEditingMeta(true)} className="text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </h2>
                                    {activeProject.status === 'completed' && (
                                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3"/> Scoreboard Updated
                                </span>
                                    )}
                                </div>

                                <div className="text-slate-600 dark:text-slate-300 text-sm mt-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-700/50 whitespace-pre-wrap font-mono">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
                                        <FileText className="w-3 h-3" /> Problem Statement
                                    </div>
                                    {activeProject.problemStatement || "No problem statement defined."}
                                </div>
                            </div>

                            {/* Complete Project Button */}
                            {activeProject.status !== 'completed' && (
                                <button
                                    onClick={handleCompleteProject}
                                    className="ml-4 flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded text-xs font-bold transition-colors whitespace-nowrap"
                                >
                                    <Target className="w-4 h-4" /> Mark Complete
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Editor & Terminal Split */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">

                    {/* Code Editor */}
                    <div className="flex flex-col bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-inner">
                        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                     <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                         <Code className="w-3 h-3" /> main.py
                     </span>
                            <div className="flex items-center gap-2">
                                {/* Auto-save Indicator */}
                                <span className="text-[10px] text-slate-500 flex items-center gap-1 mr-2">
                            <Save className="w-3 h-3" /> Saved
                        </span>

                                <button
                                    onClick={runCode}
                                    disabled={isRunning || !pyodideLoaded}
                                    className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors ${
                                        pyodideLoaded
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                                >
                                    {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                    {isRunning ? 'Running...' : 'Run Code'}
                                </button>
                            </div>
                        </div>
                        <div className="relative flex-1">
                    <textarea
                        value={activeProject.code}
                        onChange={(e) => updateActiveProject({ code: e.target.value })}
                        className="absolute inset-0 w-full h-full bg-slate-900 text-slate-200 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
                        spellCheck={false}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                    />
                        </div>
                    </div>

                    {/* Terminal Output */}
                    <div className="flex flex-col bg-black rounded-lg border border-slate-800 overflow-hidden shadow-inner font-mono text-sm">
                        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                     <span className="text-xs text-slate-400 flex items-center gap-2">
                         <Terminal className="w-3 h-3" /> Console Output
                     </span>
                            {/* Engine Status */}
                            {!pyodideLoaded && !loadingError && (
                                <span className="text-[10px] text-amber-500 flex items-center gap-1">
                             <Cpu className="w-3 h-3 animate-pulse" /> Booting Python...
                         </span>
                            )}
                            {loadingError && (
                                <span className="text-[10px] text-rose-500 flex items-center gap-1" title={loadingError}>
                             <AlertTriangle className="w-3 h-3" /> Engine Error
                         </span>
                            )}
                            {pyodideLoaded && (
                                <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                             <CheckCircle className="w-3 h-3" /> Ready
                         </span>
                            )}
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-1 bg-black">
                            {output.length === 0 ? (
                                <span className="text-slate-600 italic">
                             {loadingError ? 'Python environment unavailable.' : 'Output will appear here...'}
                         </span>
                            ) : (
                                output.map((line, i) => (
                                    <div key={i} className={`break-words whitespace-pre-wrap ${line.includes('Traceback') || line.includes('Error:') ? 'text-rose-500' : 'text-slate-300'}`}>
                                        {line}
                                    </div>
                                ))
                            )}
                        </div>
                        {output.length > 0 && (
                            <div className="bg-slate-900/50 p-2 flex justify-end">
                                <button onClick={() => setOutput([])} className="text-[10px] text-slate-500 hover:text-white uppercase font-bold">Clear Console</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Projects;
