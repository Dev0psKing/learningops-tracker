import React from 'react';
import { LayoutDashboard, Target, Activity, CheckCircle, Briefcase, TrendingUp, AlertTriangle, FileText, Lock, Database } from './Icons';

interface LandingPageProps {
  onEnter: () => void;
  onReset: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onReset }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto selection:bg-indigo-100 dark:selection:bg-indigo-900">
      
      {/* Navigation - System Status Bar */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-slate-900 dark:bg-slate-800 rounded-sm flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">LearningOps <span className="text-slate-400 font-normal">v2.4</span></span>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1"><Database className="w-3 h-3" /> Local Storage Active</span>
                <span className="w-px h-3 bg-slate-300 dark:bg-slate-700"></span>
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Offline Capable</span>
             </div>
             <button 
               onClick={onEnter}
               className="text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 transition-colors"
             >
               Enter Workspace
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - The Value Proposition */}
      <section className="pt-24 pb-20 px-6 max-w-5xl mx-auto text-center">
         <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-full text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest mb-6">
            Accountability Protocol
         </div>
         <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
            The Operating System for <br/>
            <span className="text-indigo-600 dark:text-indigo-400">Technical Competence</span>
         </h1>
         <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Stop studying passively. Start operating. <br/>
            A local-first system to measure learning velocity, enforce consistency, and validate readiness with engineering-grade metrics.
         </p>
         
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnter}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold rounded shadow-xl shadow-slate-200 dark:shadow-none transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400 dark:text-white" />
              Initialize Workspace
            </button>
         </div>
         <p className="mt-4 text-[10px] text-slate-400 font-mono">
            No signup required. Data persists locally.
         </p>
      </section>

      {/* The Problem - System Failures */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
           <div className="text-center mb-12">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Why Self-Study Fails</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              <div className="group">
                 <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 w-fit rounded border border-slate-100 dark:border-slate-700 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors">
                    <Activity className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                 </div>
                 <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-2">
                    Passive Consumption
                 </h3>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Watching tutorials creates a false signal of competence. Without active output requirements, knowledge retention is near zero.
                 </p>
              </div>
              <div className="group">
                 <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 w-fit rounded border border-slate-100 dark:border-slate-700 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors">
                    <AlertTriangle className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                 </div>
                 <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-2">
                    Metric Opacity
                 </h3>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    "Feeling ready" is not a metric. You lack the data to prove velocity or identify specific gaps before an interview.
                 </p>
              </div>
              <div className="group">
                 <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 w-fit rounded border border-slate-100 dark:border-slate-700 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors">
                    <Target className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                 </div>
                 <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-2">
                    Accountability Drift
                 </h3>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Without external friction, timelines slip. Simple blockers derail entire weeks. There is no cost for missing a deadline.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* The Solution - Core Protocols */}
      <section className="py-24 max-w-6xl mx-auto px-6">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Explanation */}
            <div className="space-y-12">
               <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">System Architecture</h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                     We replace motivation with discipline by treating your learning roadmap as a production environment.
                  </p>
               </div>

               <div className="space-y-8">
                  <div className="flex gap-4 items-start">
                     <div className="mt-1">
                        <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                     </div>
                     <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Velocity & Burn-down</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                           The system calculates your completion rate against the assigned syllabus volume. Identify if you are performing at a Junior, Mid, or Senior pace.
                        </p>
                     </div>
                  </div>

                  <div className="flex gap-4 items-start">
                     <div className="mt-1">
                        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                     </div>
                     <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Incident Management</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                           Missed deadlines trigger automated "Compensation Tasks." You cannot proceed until technical debt is paid.
                        </p>
                     </div>
                  </div>

                  <div className="flex gap-4 items-start">
                     <div className="mt-1">
                        <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Audit Trails</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                           Self-assessments are blocked without proof. You cannot rate a skill as "Strong" without attaching verifiable artifacts (GitHub/Docs).
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right: Abstract UI Visualization */}
            <div className="bg-slate-900 rounded-lg p-1 shadow-2xl">
               <div className="bg-slate-800 rounded border border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                     <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">System Status</div>
                     <div className="text-[10px] font-mono text-emerald-400">● Operational</div>
                  </div>
                  
                  <div className="space-y-6">
                     {/* Fake Chart */}
                     <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                           <span>Syllabus Completion</span>
                           <span>64%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                           <div className="h-full w-[64%] bg-indigo-500"></div>
                        </div>
                     </div>

                     {/* Fake Metrics */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                           <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Consistency Streak</div>
                           <div className="text-xl font-mono text-white">12 Days</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                           <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Evidence Log</div>
                           <div className="text-xl font-mono text-emerald-400">8 Items</div>
                        </div>
                     </div>

                     {/* Fake Alert */}
                     <div className="bg-rose-900/20 p-3 rounded border border-rose-900/50 flex gap-3 items-start">
                        <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5" />
                        <div>
                           <div className="text-[10px] font-bold text-rose-400 uppercase mb-1">Velocity Alert</div>
                           <p className="text-[10px] text-rose-200/70 font-mono">
                              [WARN] Output dropped below baseline. Remediation required.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Target Audience */}
      <section className="bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-20">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-10">Engineered For</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
                  <div className="font-bold text-slate-900 dark:text-white mb-2">Career Switchers</div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Transitioning into Data/Eng roles requiring structured roadmaps.</p>
               </div>
               <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
                  <div className="font-bold text-slate-900 dark:text-white mb-2">Disciplined Autodidacts</div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Tired of "tutorial hell" and vague progress indicators.</p>
               </div>
               <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
                  <div className="font-bold text-slate-900 dark:text-white mb-2">Technical Pros</div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Who value documentation, audit trails, and strict metrics.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 text-center bg-white dark:bg-slate-950">
         <div className="max-w-xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Begin the Operation.</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">
               System state is persisted locally in your browser. <br/> No database. No login. Zero latency.
            </p>
            <button
               onClick={onEnter}
               className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-lg transition-all"
             >
               Enter System
             </button>
             <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400 font-mono">
                <button onClick={onReset} className="hover:text-rose-500 transition-colors">Reset Data</button>
                <span>•</span>
                <span>v2.4.0-stable</span>
             </div>
         </div>
      </section>
      
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 text-center">
         <p className="text-slate-400 text-xs font-mono">
            SYSTEM_ID: L-OPS-2024 &bull; INTERNAL USE ONLY
         </p>
      </footer>
    </div>
  );
};

export default LandingPage;