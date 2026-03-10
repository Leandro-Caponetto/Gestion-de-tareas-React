
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, UserSettings, ViewType } from '../types';
import { 
  MoreHorizontal, AlertCircle, GitBranch, Plus, 
  Edit2, Trash2, Copy, ArrowRight, CheckCircle, 
  ExternalLink, ChevronRight, Clock
} from 'lucide-react';
import { TEAM_MEMBERS, STATUS_OPTIONS } from '../constants';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange?: (id: string, newStatus: TaskStatus) => void;
  onAddTask?: (task: Omit<Task, 'id'>) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  userSettings?: UserSettings;
  onViewChange?: (view: ViewType) => void;
}

const COLUMN_LABELS: Record<TaskStatus, string> = {
  'Backlog': 'BACKLOG',
  'In Progress': 'IN PROGRESS',
  'To Review': 'TO REVIEW',
  'Done': 'DONE'
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onStatusChange, onEditTask, onDeleteTask, userSettings, onViewChange }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);
  
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
        className={`bg-white dark:bg-slate-800 p-3.5 rounded-xl border transition-all cursor-pointer group shadow-sm flex flex-col gap-3 hover:shadow-md hover:border-blue-400/50 relative ${
          draggingId === task.id ? 'border-blue-500 opacity-40 scale-95 shadow-none' : 'border-[#dfe1e6] dark:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-1 overflow-hidden">
             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 whitespace-nowrap tracking-wider">
               {ticketId}
             </span>
           </div>
           
           <div className="relative">
             <button 
               onClick={(e) => { 
                 e.stopPropagation(); 
                 setOpenMenuId(openMenuId === task.id ? null : task.id);
               }} 
               className={`p-1 rounded-md transition-all ${
                 openMenuId === task.id 
                   ? 'bg-slate-100 dark:bg-slate-700 text-correo-blue dark:text-correo-yellow' 
                   : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
               }`}
             >
               <MoreHorizontal className="w-4 h-4" />
             </button>

             {openMenuId === task.id && (
               <div 
                 ref={menuRef}
                 className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-[100] py-1.5 animate-in fade-in zoom-in-95 duration-100"
                 onClick={(e) => e.stopPropagation()}
               >
                 <div className="px-3 py-1.5 mb-1 border-b border-slate-50 dark:border-slate-700/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Acciones</p>
                 </div>

                 <button 
                   onClick={() => { onEditTask?.(task); setOpenMenuId(null); }}
                   className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group/item"
                 >
                   <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                   <span>Editar Tarea</span>
                 </button>

                 <button 
                   onClick={() => { 
                     navigator.clipboard.writeText(ticketId);
                     setOpenMenuId(null);
                   }}
                   className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                 >
                   <Copy className="w-3.5 h-3.5 text-slate-400" />
                   <span>Copiar Ticket ID</span>
                 </button>

                 <div className="h-px bg-slate-50 dark:bg-slate-700/50 my-1"></div>

                 <div className="px-3 py-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mover a</p>
                 </div>

                 {STATUS_OPTIONS.filter(s => s !== task.estado).map(status => (
                   <button 
                     key={status}
                     onClick={() => { onStatusChange?.(task.id, status); setOpenMenuId(null); }}
                     className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group/move"
                   >
                     <div className="flex items-center gap-2.5">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover/move:text-blue-400 transition-colors" />
                        <span>{COLUMN_LABELS[status] || status}</span>
                     </div>
                     <ChevronRight className="w-3 h-3 opacity-0 group-hover/move:opacity-100 transition-all -translate-x-1 group-hover/move:translate-x-0" />
                   </button>
                 ))}

                 <div className="h-px bg-slate-50 dark:bg-slate-700/50 my-1"></div>

                 <button 
                   onClick={() => { onDeleteTask?.(task.id); setOpenMenuId(null); }}
                   className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                 >
                   <Trash2 className="w-3.5 h-3.5" />
                   <span>Eliminar</span>
                 </button>
               </div>
             )}
           </div>
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
          <div className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105 ${
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
              <button 
                onClick={() => onViewChange?.('registro')}
                className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md"
              >
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
