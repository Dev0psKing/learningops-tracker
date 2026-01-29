import React from 'react';
import { Notification, TaskItem, User } from '../types';
import { AlertTriangle, Clock, Calendar, CheckCircle } from './Icons';

interface NotificationPanelProps {
  notifications: Notification[];
  lateTasks: TaskItem[];
  upcomingTasks: TaskItem[];
  users: User[];
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notifications, 
  lateTasks, 
  upcomingTasks, 
  users,
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || id;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Accountability Center</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Alerts Section */}
        {notifications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Intervention Alerts</h3>
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif.id} className={`p-4 rounded-xl border flex items-start gap-3 ${
                  notif.type === 'alert' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-300' : 
                  notif.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-300' : 
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                }`}>
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                     notif.type === 'alert' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                  }`} />
                  <div>
                    <h4 className="font-bold text-sm">{notif.title}</h4>
                    <p className="text-xs mt-1 opacity-90">{notif.message}</p>
                    {notif.actionRequired && (
                        <div className="mt-2 text-xs font-bold uppercase px-2 py-1 bg-white/50 dark:bg-black/20 rounded w-fit">Action Required</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Late Tasks Section */}
        <div className="mb-8">
           <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Missed / Late</h3>
              <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{lateTasks.length}</span>
           </div>
           
           {lateTasks.length === 0 ? (
             <div className="text-sm text-slate-500 italic flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500"/> All tasks on track!
             </div>
           ) : (
             <div className="space-y-2">
               {lateTasks.map(task => (
                 <div key={task.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm border-l-4 border-l-rose-500 dark:border-l-rose-500">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{task.title}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">{getUserName(task.ownerId)}</span>
                        <span className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due {task.dueDate}
                        </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-700">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Compensation Task added
                        </span>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Upcoming Deadlines */}
        <div>
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Upcoming (3 Days)</h3>
           <div className="space-y-2">
             {upcomingTasks.map(task => (
                 <div key={task.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{task.title}</p>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">{getUserName(task.ownerId)}</span>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {task.dueDate}
                        </span>
                    </div>
                 </div>
             ))}
             {upcomingTasks.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-500 italic">No immediate deadlines.</p>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default NotificationPanel;