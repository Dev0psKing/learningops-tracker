import React from 'react';
import { Target, CheckCircle, Activity, Briefcase } from './Icons';

const SystemGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-16">
      
      {/* Header */}
      <section className="space-y-4 border-b border-slate-200 dark:border-slate-700 pb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">System Documentation</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
           A professional Learning Accountability & Capstone Readiness Platform designed for individuals transitioning into Data Analytics. This system replaces vague self-study with structured, evidence-based operations.
        </p>
      </section>

      {/* Core Philosophy */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            Core Philosophy
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                The platform operates on the principle of <strong>evidence-based accountability</strong>. Progress is not measured by time spent or tasks checked off, but by the production of verifiable artifacts. 
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                It prioritizes honest self-assessment over gamified rewards, ensuring that readiness metrics reflect actual competency rather than perceived effort.
            </p>
        </div>
      </section>

      {/* Key Features */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Learning Documentation System</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">A structured log for recording technical milestones. Requires mandatory reflection and categorization for every entry.</p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Skill Dimension Framework</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">All activities are strictly mapped to five core data analytics competencies, ensuring balanced growth.</p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Evidence Enforcement</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">A logic engine that prevents high proficiency ratings ("Strong") without attached proof (links/files).</p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Readiness Dashboard</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Visual topology of skill distribution, aggregating evidence to calculate a quantitative readiness percentage.</p>
            </div>
        </div>
      </section>

      {/* Capstone Readiness Logic */}
      <section>
         <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Capstone Readiness Logic</h2>
         <div className="bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700 p-8">
            <div className="mb-8">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider mb-4">The 5 Dimensions</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><Activity className="w-4 h-4 text-indigo-500"/> Data Sourcing (API, SQL, Scraping)</li>
                    <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><Activity className="w-4 h-4 text-indigo-500"/> Data Cleaning (Preprocessing, Normalization)</li>
                    <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><Activity className="w-4 h-4 text-indigo-500"/> Data Analysis (Statistics, Modeling)</li>
                    <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><Activity className="w-4 h-4 text-indigo-500"/> Data Visualization (Dashboarding, Storytelling)</li>
                    <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><Activity className="w-4 h-4 text-indigo-500"/> Insight Communication (Recommendations)</li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider mb-4">Readiness Status Levels</h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                        <span className="text-xs font-bold uppercase w-24 text-slate-500 dark:text-slate-400">Weak (30%)</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Theoretical understanding only. No artifacts.</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                        <span className="text-xs font-bold uppercase w-24 text-amber-600 dark:text-amber-400">Developing (65%)</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Practical application with at least <strong>one</strong> verified artifact.</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                        <span className="text-xs font-bold uppercase w-24 text-emerald-600 dark:text-emerald-400">Strong (100%)</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Multiple verified artifacts and detailed reflection.</span>
                    </div>
                </div>
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 italic">
                    This logic mirrors real-world hiring, where candidates are evaluated on portfolio evidence rather than resume claims.
                </p>
            </div>
         </div>
      </section>

      {/* How to Use */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Standard Operating Procedure</h2>
        <ol className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-8">
            <li className="pl-8 relative">
                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-950 ring-1 ring-slate-200 dark:ring-slate-800"></span>
                <h4 className="font-bold text-slate-900 dark:text-white">Initialize</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Generate a structured 14-week roadmap in the <strong>Roadmap</strong> module.</p>
            </li>
            <li className="pl-8 relative">
                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-4 border-white dark:border-slate-950 ring-1 ring-slate-200 dark:ring-slate-800"></span>
                <h4 className="font-bold text-slate-900 dark:text-white">Execute & Log</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Daily: Log study hours and complexity in the <strong>Tracker</strong>.</p>
            </li>
            <li className="pl-8 relative">
                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-4 border-white dark:border-slate-950 ring-1 ring-slate-200 dark:ring-slate-800"></span>
                <h4 className="font-bold text-slate-900 dark:text-white">Document</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Create entries in <strong>Documentation & Evidence</strong> for every key concept learned. Attach GitHub/Tableau links.</p>
            </li>
            <li className="pl-8 relative">
                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-4 border-white dark:border-slate-950 ring-1 ring-slate-200 dark:ring-slate-800"></span>
                <h4 className="font-bold text-slate-900 dark:text-white">Assess</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Weekly: Rate your soft skills (Mastery, Consistency) in the <strong>Scorecard</strong>.</p>
            </li>
            <li className="pl-8 relative">
                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-4 border-white dark:border-slate-950 ring-1 ring-slate-200 dark:ring-slate-800"></span>
                <h4 className="font-bold text-slate-900 dark:text-white">Review</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Check the <strong>Capstone</strong> dashboard to identify weak dimensions and prioritize upcoming work.</p>
            </li>
        </ol>
      </section>

      {/* Demonstrates */}
      <section className="bg-slate-900 dark:bg-black text-slate-300 p-8 rounded-xl border border-transparent dark:border-slate-800">
         <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5"/> Professional Competency Demonstration
         </h2>
         <p className="text-sm leading-relaxed mb-4">
            From a hiring perspective, this platform demonstrates:
         </p>
         <ul className="space-y-2 text-sm list-disc pl-5 text-slate-400">
             <li><strong className="text-indigo-400">Systems Thinking:</strong> Designing logic that enforces behavior (e.g., evidence requirements).</li>
             <li><strong className="text-indigo-400">Product Maturity:</strong> Prioritizing objective metrics over vanity metrics.</li>
             <li><strong className="text-indigo-400">Full-Stack Capability:</strong> Integrating complex state management, AI services, and data visualization.</li>
         </ul>
      </section>

      {/* Limitations */}
      <section className="border-t border-slate-200 dark:border-slate-700 pt-8">
         <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Limitations & Design Decisions</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                 <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">No Auto-Grading</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                     The system does not parse code quality. It relies on the user's professional integrity to self-assess, enforcing only the <em>presence</em> of evidence.
                 </p>
             </div>
             <div>
                 <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">No Gamification</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                     There are no badges or streaks for the sake of engagement. The UI is intentionally minimalist to reduce dopamine loops and focus on deep work.
                 </p>
             </div>
         </div>
      </section>

    </div>
  );
};

export default SystemGuide;