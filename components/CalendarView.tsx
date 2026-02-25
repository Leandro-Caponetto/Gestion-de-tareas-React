
import React, { useState, useMemo } from 'react';
import { Task, TaskCategory } from '../types';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MoreHorizontal, Plus
} from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysCount = daysInMonth(year, month);
    // Ajuste para que la semana empiece en Lunes (0 = Lunes, 6 = Domingo)
    let firstDay = firstDayOfMonth(year, month) - 1;
    if (firstDay === -1) firstDay = 6;

    const days = [];
    
    // Padding mes anterior
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }

    // Días mes actual
    for (let i = 1; i <= daysCount; i++) {
      days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    }

    // Padding mes siguiente
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
    }

    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long' });
  const yearName = currentDate.getFullYear();

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(t => t.fecha === dateStr);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const goToToday = () => setCurrentDate(new Date());

  const getCategoryColor = (cat: TaskCategory) => {
    switch (cat) {
      case TaskCategory.Desarrollo: return 'bg-blue-100 text-blue-700 border-blue-200';
      case TaskCategory.QA: return 'bg-amber-100 text-amber-700 border-amber-200';
      case TaskCategory.Meeting: return 'bg-purple-100 text-purple-700 border-purple-200';
      case TaskCategory.Research: return 'bg-slate-100 text-slate-700 border-slate-200';
      case TaskCategory.Admin: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-full animate-in fade-in duration-700">
      
      {/* Header del Calendario */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-correo-blue p-2.5 rounded-xl shadow-lg">
            <CalendarIcon className="w-5 h-5 text-correo-yellow" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">
              Planificador Mensual
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {monthName} {yearName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={goToToday}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black uppercase text-slate-500 hover:text-correo-blue transition-colors"
          >
            Hoy
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Días de la Semana */}
      <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
          <div key={d} className="py-3 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</span>
          </div>
        ))}
      </div>

      {/* Grid del Calendario Principal */}
      <div className="grid grid-cols-7 flex-1">
        {calendarData.map((item, idx) => {
          const dateTasks = getTasksForDate(item.date);
          const activeDay = isToday(item.date);
          
          return (
            <div 
              key={idx} 
              className={`min-h-[140px] border-r border-b border-slate-50 dark:border-slate-800/50 p-2 group transition-colors flex flex-col gap-1 ${
                item.currentMonth ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-900/40'
              } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                  activeDay 
                    ? 'bg-correo-blue text-white shadow-lg' 
                    : item.currentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'
                }`}>
                  {item.day}
                </span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                {dateTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`px-2 py-1 rounded-md border text-[9px] font-bold truncate transition-all hover:scale-[1.02] cursor-pointer shadow-sm ${getCategoryColor(task.categoria)}`}
                    title={`${task.proyecto}: ${task.descripcion}`}
                  >
                    <span className="opacity-50 mr-1">#{task.id.slice(0,3).toUpperCase()}</span>
                    {task.proyecto}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
