
import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { 
  Search, Filter, Download, MoreHorizontal, ArrowUpDown, 
  CheckCircle2, Clock, AlertCircle, ExternalLink, 
  Hash, Layers, User, Calendar
} from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onStatusChange?: (id: string, newStatus: TaskStatus) => void;
}

const ListView: React.FC<ListViewProps> = ({ tasks, onEditTask, onStatusChange }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Task; direction: 'asc' | 'desc' } | null>(null);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal! < bVal!) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal! > bVal!) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Done': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'In Progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'To Review': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-700">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-correo-blue dark:text-white uppercase tracking-[0.3em]">Inventario de Actividad</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Registro técnico de alta disponibilidad</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-correo-blue transition-all">
            <Filter className="w-3.5 h-3.5" /> Columnas
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-correo-blue text-correo-yellow rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20">
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/50">
              <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => requestSort('id')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  ID <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => requestSort('proyecto')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Operación <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso</span>
              </th>
              <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => requestSort('estado')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Estado <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => requestSort('total_horas')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                   Hs <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {sortedTasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="px-8 py-6">
                  <span className="text-[10px] font-mono font-black text-slate-400">#{task.id.slice(0, 6).toUpperCase()}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-correo-blue dark:text-correo-yellow group-hover:scale-110 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{task.proyecto}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">{task.descripcion}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${task.estado === 'Done' ? 'bg-emerald-500' : 'bg-correo-blue'} transition-all`} style={{ width: task.estado === 'Done' ? '100%' : '40%' }} />
                   </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(task.estado)}`}>
                    {task.estado}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-correo-blue dark:text-white">{task.total_horas}h</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">{task.hora_inicio} - {task.hora_fin}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => onEditTask?.(task)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-correo-blue transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;
