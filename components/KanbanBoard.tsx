
import React, { useState } from 'react';
import { Task, TaskStatus, UserSettings } from '../types';
import { MoreHorizontal, AlertCircle, GitBranch, Plus } from 'lucide-react';
import { TEAM_MEMBERS, STATUS_OPTIONS } from '../constants';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange?: (id: string, newStatus: TaskStatus) => void;
  onAddTask?: (task: Omit<Task, 'id'>) => void;
  onEditTask?: (task: Task) => void;
  userSettings?: UserSettings;
}

const COLUMN_LABELS: Record<TaskStatus, string> = {
  'Backlog': 'BACKLOG',
  'In Progress': 'IN PROGRESS',
  'To Review': 'TO REVIEW',
  'Done': 'DONE'
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onStatusChange, onEditTask, userSettings }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  const columns = STATUS_OPTIONS.map(status => ({
    id: status,
    label: COLUMN_LABELS[status] || status.toUpperCase()
  }));

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData('taskId', id);
  };

  const onDragEnd = () => setDraggingId(null);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('taskId');
    if (onStatusChange) onStatusChange(id, status);
  };

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getMemberColor = (name: string) => {
    const member = TEAM_MEMBERS.find(m => m.name.toLowerCase() === name.toLowerCase());
    return member?.color || 'bg-blue-600';
  };

  const renderCard = (task: Task) => {
    const currentUserName = userSettings?.displayName?.toLowerCase().trim() || "";
    const taskClientName = task.cliente.toLowerCase().trim();
    
    const isCurrentUser = currentUserName !== "" && (
      taskClientName.includes(currentUserName) || 
      currentUserName.includes(taskClientName)
    );
    
    const initials = getInitials(task.cliente);
    const memberColor = getMemberColor(task.cliente);
    const ticketId = `PMDDW-${task.id.slice(0, 4).toUpperCase()}`;

    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        onDragEnd={onDragEnd}
        onClick={() => onEditTask?.(task)}
        className={`bg-white dark:bg-slate-800 p-3.5 rounded-xl border transition-all cursor-pointer group shadow-[0_10px_30px_-5px_rgba(0,0,0,0.2)] flex flex-col gap-3 hover:shadow-md hover:border-blue-400/50 ${
          draggingId === task.id ? 'border-blue-500 opacity-40 scale-95 shadow-none' : 'border-[#dfe1e6] dark:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-1 overflow-hidden">
             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 whitespace-nowrap tracking-wider">
               {ticketId}
             </span>
           </div>
           <button 
             onClick={(e) => { e.stopPropagation(); }} 
             className="text-slate-300 hover:text-slate-500 transition-colors"
           >
             <MoreHorizontal className="w-4 h-4" />
           </button>
        </div>
        
        <h4 className="text-[12px] font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-3">
           {task.descripcion}
        </h4>

        <div className="flex items-end justify-between mt-1">
          <div className="flex flex-col gap-2">
            {/* Jira Priority Style Indicators */}
            <div className="flex gap-1 items-center">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
               <span className="ml-0.5 text-[#ff7452] font-black text-[10px] leading-none">=</span>
            </div>
            
            <div className="flex items-center gap-1 text-slate-400">
               <GitBranch className="w-3 h-3 text-blue-500" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                 {task.proyecto}
               </span>
            </div>
          </div>

          {/* Avatar Area */}
          <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.7)] transition-transform group-hover:scale-105 ${
            isCurrentUser ? 'bg-correo-yellow' : memberColor
          }`}>
             {isCurrentUser && userSettings?.avatarUrl ? (
               <img 
                 src={userSettings.avatarUrl} 
                 alt="Asignado" 
                 className="w-full h-full object-cover" 
               />
             ) : (
               <span className={`text-[9px] font-black ${isCurrentUser ? 'text-correo-blue' : 'text-white'}`}>
                 {initials}
               </span>
             )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-8 min-h-[600px] scrollbar-hide">
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.estado === col.id);
        return (
          <div
            key={col.id}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, col.id)}
            className="flex-1 min-w-[240px] max-w-[280px] flex flex-col gap-3 bg-[#f4f5f7] dark:bg-slate-900/40 p-2.5 rounded-xl border border-transparent"
          >
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2">
                <h5 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {col.label}
                </h5>
                <span className="bg-[#dfe1e6] dark:bg-slate-800 text-[9px] font-black px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">
                  {colTasks.length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-blue-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 flex-1 min-h-[500px]">
              {colTasks.length > 0 ? (
                colTasks.map(renderCard)
              ) : (
                <div className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center opacity-30">
                  <AlertCircle className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 leading-tight">
                    Sin actividades
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
