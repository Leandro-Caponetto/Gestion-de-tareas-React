
import React, { useMemo, useRef, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { 
  ChevronRight, ChevronLeft, Zap, CheckCircle2, 
  Clock, AlertCircle, Calendar, Filter, Info
} from 'lucide-react';

interface TimelineViewProps {
  tasks: Task[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ tasks }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  
  // Generamos los días del mes actual para la cabecera
  const daysInMonth = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return {
        day: i + 1,
        weekday: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        fullDate: date.toISOString().split('T')[0],
        isToday: date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
      };
    });
  }, []);

  const monthName = today.toLocaleString('es-ES', { month: 'long' });

  // Scroll automático al día de hoy al cargar
  useEffect(() => {
    if (scrollContainerRef.current) {
      const todayElement = scrollContainerRef.current.querySelector('.is-today');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, []);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Done': return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded uppercase">CLOSED</span>;
      case 'In Progress': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black rounded uppercase">IN PROGRESS</span>;
      case 'To Review': return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-black rounded uppercase">TESTING</span>;
      case 'Backlog': return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded uppercase">BACKLOG</span>;
      default: return null;
    }
  };

  const getBarColor = (category: string) => {
    switch (category) {
      case 'Desarrollo': return 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/20';
      case 'QA': return 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-500/20';
      case 'Meeting': return 'bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-purple-500/20';
      case 'Research': return 'bg-gradient-to-r from-slate-600 to-slate-800 shadow-slate-500/20';
      default: return 'bg-correo-blue shadow-correo-blue/20';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[700px] animate-in fade-in duration-700">
      
      {/* Controles del Timeline */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{monthName} {today.getFullYear()}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {['Today', 'Weeks', 'Months', 'Quarters'].map((mode) => (
            <button 
              key={mode}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                mode === 'Months' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {mode}
            </button>
          ))}
          <div className="w-px h-4 bg-slate-200 mx-2" />
          <button className="p-1.5 text-slate-400 hover:text-slate-600">
             <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Columna Izquierda: Lista de Tareas (Sticky) */}
        <div className="w-[450px] flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 z-10 bg-white dark:bg-slate-900">
          <div className="h-14 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Work</span>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="py-2">
              <div className="px-6 py-2 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <ChevronRight className="w-3 h-3" />
                Releases
              </div>
              
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800/50 transition-colors group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <div className="flex items-center gap-2 min-w-0">
                    <Zap className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-[11px] font-black text-slate-400 whitespace-nowrap">PMDDW-{task.id.slice(0,4).toUpperCase()}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 transition-colors">
                      {task.proyecto} - {task.descripcion.slice(0, 40)}...
                    </span>
                  </div>
                  <div className="flex-1" />
                  {getStatusBadge(task.estado)}
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="p-12 text-center opacity-30">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">No hay items de trabajo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Grilla de Tiempo (Scrollable) */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin relative bg-slate-50/20 dark:bg-slate-950/20"
        >
          {/* Cabecera de Tiempo */}
          <div className="inline-flex flex-col min-w-full">
            <div className="h-14 flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
              {daysInMonth.map((day) => (
                <div 
                  key={day.day} 
                  className={`w-14 flex-shrink-0 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800/50 ${day.isToday ? 'bg-blue-50/50 is-today' : ''}`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${day.isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                    {day.weekday}
                  </span>
                  <span className={`text-xs font-black ${day.isToday ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>

            {/* Grilla de Barras */}
            <div className="relative flex-1">
              {/* Línea de Hoy (Vertical) */}
              <div className="absolute top-0 bottom-0 w-px bg-blue-500/30 z-20 pointer-events-none" style={{ left: `${(today.getDate() - 1) * 56 + 28}px` }}>
                <div className="w-2 h-2 rounded-full bg-blue-500 -ml-[3.5px] shadow-lg shadow-blue-500/50" />
              </div>

              <div className="flex flex-col">
                {/* Placeholder para la fila de releases */}
                <div className="h-[36px]" /> 
                
                {tasks.map((task) => {
                  const taskDay = new Date(task.fecha).getDate();
                  const barLeft = (taskDay - 1) * 56 + 8; // Margen de 8px dentro de la celda
                  
                  return (
                    <div key={`bar-${task.id}`} className="h-[53px] flex items-center relative border-b border-slate-50 dark:border-slate-800/30">
                      {/* Fondo de celdas */}
                      {daysInMonth.map(d => (
                         <div key={`bg-${task.id}-${d.day}`} className={`w-14 h-full border-r border-slate-50 dark:border-slate-800/20 ${d.isToday ? 'bg-blue-50/20' : ''}`} />
                      ))}
                      
                      {/* La barra de la tarea */}
                      <div 
                        className={`absolute h-8 ${getBarColor(task.categoria)} rounded-lg border-2 border-white dark:border-slate-800 shadow-lg flex items-center px-3 z-10 transition-transform hover:scale-[1.02] cursor-pointer group/bar`}
                        style={{ 
                          left: `${barLeft}px`, 
                          width: '140px' // Duración visual fija para este MVP (representa el bloque de tiempo)
                        }}
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[9px] font-bold rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {task.hora_inicio} - {task.hora_fin} ({task.total_horas}h)
                         </div>
                         <div className="w-1.5 h-1.5 rounded-full bg-white/40 mr-2" />
                         <span className="text-[10px] font-black text-white truncate drop-shadow-sm uppercase">
                           {task.categoria}
                         </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Desarrollo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">QA / Testing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Meetings</span>
          </div>
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Sincronizado con Comunidad Correo v2.0
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
